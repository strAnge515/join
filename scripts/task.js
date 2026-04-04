import { saveTask } from "./backend-tasks.js";

let selectedPrio = "medium";
let subtasks = [];

const titleInput = document.getElementById("task-title");
const dateInput = document.getElementById("task-date");
const descriptionInput = document.getElementById("task-description");
const categorySelect = document.getElementById("task-category");
const assignedSelect = document.getElementById("task-assigned");
const subtaskInput = document.getElementById("subtask-input");
const subtaskList = document.getElementById("subtask-list");
const btnAddSubtask = document.getElementById("btn-add-subtask");
const btnCreate = document.getElementById("btn-create");
const btnClear = document.getElementById("btn-clear");
const prioGroup = document.getElementById("prio-group");

initTaskPage();

function initTaskPage() {
  setupPrioButtons();
  setupSubtaskHandling();
  setupActionButtons();
  setDefaultPrio("medium");
}

function setupPrioButtons() {
  const prioButtons = prioGroup.querySelectorAll(".prio-btn");

  prioButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const prio = button.dataset.prio;
      setDefaultPrio(prio);
    });
  });
}

function setDefaultPrio(prio) {
  selectedPrio = prio;

  const prioButtons = prioGroup.querySelectorAll(".prio-btn");
  prioButtons.forEach((button) => {
    button.classList.remove("selected-urgent", "selected-medium", "selected-low");
  });

  const activeButton = prioGroup.querySelector(`[data-prio="${prio}"]`);
  if (!activeButton) return;

  if (prio === "urgent") activeButton.classList.add("selected-urgent");
  if (prio === "medium") activeButton.classList.add("selected-medium");
  if (prio === "low") activeButton.classList.add("selected-low");
}

function setupSubtaskHandling() {
  btnAddSubtask.addEventListener("click", addSubtask);

  subtaskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSubtask();
    }
  });
}

function addSubtask() {
  const value = subtaskInput.value.trim();
  if (!value) return;

  subtasks.push({
    title: value,
    state: false,
  });

  subtaskInput.value = "";
  renderSubtasks();
}

function renderSubtasks() {
  subtaskList.innerHTML = "";

  subtasks.forEach((subtask, index) => {
    const li = document.createElement("li");
    li.className = "subtask-item";

    li.innerHTML = `
      <input type="checkbox" id="subtask-${index}" ${subtask.state ? "checked" : ""}>
      <label class="subtask-item__label ${subtask.state ? "done" : ""}" for="subtask-${index}">
        ${subtask.title}
      </label>
      <button type="button" data-index="${index}" class="subtask-delete-btn">✕</button>
    `;

    const checkbox = li.querySelector("input");
    const label = li.querySelector("label");
    const deleteButton = li.querySelector(".subtask-delete-btn");

    checkbox.addEventListener("change", () => {
      subtasks[index].state = checkbox.checked;
      label.classList.toggle("done", checkbox.checked);
    });

    deleteButton.addEventListener("click", () => {
      subtasks.splice(index, 1);
      renderSubtasks();
    });

    subtaskList.appendChild(li);
  });
}

function setupActionButtons() {
  btnCreate.addEventListener("click", createTask);
  btnClear.addEventListener("click", clearTaskForm);
}

async function createTask() {
  const taskData = collectTaskData();

  if (!isTaskValid(taskData)) return;

  try {
    await saveTask(taskData);
    alert("Task created successfully.");
    clearTaskForm();
  } catch (error) {
    console.error("Fehler beim Speichern der Task:", error);
    alert("Task could not be created.");
  }
}

function collectTaskData() {
  return {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    category: mapCategoryToBoardStatus(categorySelect.value),
    assigned_to: getAssignedUsers(),
    date: dateInput.value,
    prio: selectedPrio,
    subtasks: subtasks,
    createdAt: new Date().toISOString(),
  };
}

function mapCategoryToBoardStatus(categoryValue) {
  if (categoryValue === "technical-task") return "to do";
  if (categoryValue === "user-story") return "in progress";
  return "to do";
}

function getAssignedUsers() {
  return Array.from(assignedSelect.selectedOptions).map((option) => option.textContent.trim());
}

function isTaskValid(taskData) {
  if (!taskData.title) {
    alert("Please enter a title.");
    return false;
  }

  if (!taskData.date) {
    alert("Please select a due date.");
    return false;
  }

  if (!taskData.category) {
    alert("Please select a category.");
    return false;
  }

  return true;
}

function clearTaskForm() {
  titleInput.value = "";
  dateInput.value = "";
  descriptionInput.value = "";
  categorySelect.value = "";
  subtaskInput.value = "";
  subtasks = [];

  Array.from(assignedSelect.options).forEach((option) => {
    option.selected = false;
  });

  setDefaultPrio("medium");
  renderSubtasks();
}
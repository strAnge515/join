import { loadTasks } from "./backend-tasks.js";

async function initSummary() {
  try {
    const tasks = await loadTasks();
    updateSummary(tasks || []);
  } catch (error) {
    console.error("Fehler beim Laden der Summary:", error);
  }
}

function updateSummary(tasks) {
  const todoCount = tasks.filter((task) => isTodo(task)).length;
  const doneCount = tasks.filter((task) => isDone(task)).length;
  const inprogressCount = tasks.filter((task) => isInProgress(task)).length;
  const awaitingCount = tasks.filter((task) => isAwaiting(task)).length;
  const urgentTasks = tasks.filter((task) => isUrgent(task));
  const boardCount = tasks.length;

  setText("todo-count", todoCount);
  setText("done-count", doneCount);
  setText("urgent-count", urgentTasks.length);
  setText("board-count", boardCount);
  setText("inprogress-count", inprogressCount);
  setText("awaiting-count", awaitingCount);

  updateUrgentDate(urgentTasks);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("-", " ")
    .replace(/\s+/g, " ");
}

function isTodo(task) {
  const category = normalize(task.category);
  const status = normalize(task.status);
  return category === "to do" || category === "todo" || status === "todo";
}

function isDone(task) {
  const category = normalize(task.category);
  const status = normalize(task.status);
  return category === "done" || status === "done";
}

function isInProgress(task) {
  const category = normalize(task.category);
  const status = normalize(task.status);
  return (
    category === "in progress" ||
    category === "inprogress" ||
    status === "in progress" ||
    status === "inprogress"
  );
}

function isAwaiting(task) {
  const category = normalize(task.category);
  const status = normalize(task.status);
  return (
    category === "awaiting feedback" ||
    category === "awaiting" ||
    status === "awaiting feedback" ||
    status === "awaiting"
  );
}

function isUrgent(task) {
  const prio = normalize(task.prio);
  const priority = normalize(task.priority);

  return (
    prio === "urgent" ||
    prio === "urgend" ||
    priority === "urgent"
  );
}

function updateUrgentDate(urgentTasks) {
  const dateElement = document.getElementById("current-date");
  if (!dateElement) return;

  const tasksWithDate = urgentTasks
    .map((task) => task.date || task.dueDate || "")
    .filter((date) => !!date)
    .sort((a, b) => new Date(a) - new Date(b));

  if (tasksWithDate.length === 0) {
    dateElement.textContent = "No deadline";
    return;
  }

  const nextDate = new Date(tasksWithDate[0]);
  if (Number.isNaN(nextDate.getTime())) {
    dateElement.textContent = "No deadline";
    return;
  }

  dateElement.textContent = nextDate.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

initSummary();

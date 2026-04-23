import { loadTasks } from "../scripts/backend-tasks.js";

initSummary();

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
  const el = document.getElementById(id);
  if (el) el.textContent = value;
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
  return (
    category === "to do" ||
    category === "todo" ||
    category === "technical task" ||
    category === "technical-task" ||
    category === "user story" ||
    category === "user-story" ||
    category === ""
  );
}

function isDone(task) {
  return normalize(task.category) === "done";
}

function isInProgress(task) {
  const category = normalize(task.category);
  return category === "in progress" || category === "inprogress";
}

function isAwaiting(task) {
  const category = normalize(task.category);
  return category === "awaiting feedback" || category === "awaiting";
}

function isUrgent(task) {
  return normalize(task.prio) === "urgent" || normalize(task.prio) === "urgend";
}

function updateUrgentDate(urgentTasks) {
  const el = document.getElementById("current-date");
  if (!el) return;

  const tasksWithDate = urgentTasks
    .map((task) => task.date || "")
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b));

  if (!tasksWithDate.length) {
    el.textContent = "No deadline";
    return;
  }

  const nextDate = new Date(tasksWithDate[0]);

  if (Number.isNaN(nextDate.getTime())) {
    el.textContent = "No deadline";
    return;
  }

  el.textContent = nextDate.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
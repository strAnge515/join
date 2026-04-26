import { loadTasks } from "../scripts/backend-tasks.js";

initSummary();

async function initSummary() {
  try {
    const tasks = await loadTasks();
    updateSummary(tasks || []);
    updateGreeting();
  } catch (error) {
    console.error("Fehler beim Laden der Summary:", error);
  }
}

function updateSummary(tasks) {
  const counts = {
    todo: 0,
    inprogress: 0,
    awaiting: 0,
    done: 0,
  };

  tasks.forEach(task => {
    const column = getTaskColumn(task);
    counts[column]++;
  });

  const urgentTasks = tasks.filter(task => isUrgent(task));

  setText("todo-count", counts.todo);
  setText("done-count", counts.done);
  setText("urgent-count", urgentTasks.length);
  setText("board-count", tasks.length);
  setText("inprogress-count", counts.inprogress);
  setText("awaiting-count", counts.awaiting);

  updateUrgentDate(urgentTasks);
}

function getTaskColumn(task) {
  const value = normalize(
    task.status ||
    task.column ||
    task.boardColumn ||
    task.category ||
    ""
  );

  if (value.includes("done")) return "done";
  if (value.includes("awaiting")) return "awaiting";
  if (value.includes("progress")) return "inprogress";
  if (value.includes("todo") || value.includes("to do")) return "todo";

  return "todo";
}

function isUrgent(task) {
  const prio = normalize(task.prio || task.priority);
  return prio.includes("urgent") || prio.includes("urgend");
}


function updateUrgentDate(urgentTasks) {
  const el = document.getElementById("current-date");
  if (!el) return;
  console.log("URGENT TASKS:", urgentTasks);

  const tasksWithDate = urgentTasks
    .map((task) => task.dueDate || task.date || "")
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

function updateGreeting() {
  const user = localStorage.getItem("currentUser");
const formattedName = formatUserName(user);
  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  const hour = new Date().getHours();

  let greeting = "";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";
  else greeting = "Good Evening";

document.getElementById("greeting-text").textContent = greeting + ",";
document.getElementById("greeting-name").textContent = formattedName;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function formatUserName(name) {
  if (!name) return "";

  let cleanName = name.includes("@") ? name.split("@")[0] : name;

  if (cleanName.toLowerCase() === "volskijuri") {
    return "Volski Juri";
  }

  let formatted = cleanName.replace(/([a-z])([A-Z])/g, "$1 $2");

  formatted = formatted
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return formatted;
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ");
}
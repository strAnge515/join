import { loadTasks } from "./backend-tasks.js";

initSummary();

async function initSummary() {
  try {
    const tasks = await loadTasks();
    updateSummary(tasks || []);
    updateGreeting();
    updateMobileProfile();
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

  tasks.forEach((task) => {
    const column = getTaskColumn(task);
    counts[column]++;
  });

  const urgentTasks = tasks.filter((task) => isUrgent(task));

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

  const tasksWithDate = urgentTasks
    .map((task) => task.dueDate || task.date || "")
    .filter(Boolean)
    .map(parseTaskDate)
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b);

  if (!tasksWithDate.length) {
    el.textContent = "No deadline";
    return;
  }

  el.textContent = tasksWithDate[0].toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function parseTaskDate(value) {
  if (value.includes("/")) {
    const [day, month, year] = value.split("/");
    return new Date(`${year}-${month}-${day}`);
  }

  return new Date(value);
}

function updateGreeting() {
  const user = getCurrentUser();

  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  const hour = new Date().getHours();
  let greeting = "";

  if (hour >= 5 && hour <= 11) greeting = "Good morning";
  else if (hour >= 12 && hour <= 17) greeting = "Good afternoon";
  else if (hour >= 18 && hour <= 21) greeting = "Good evening";
  else greeting = "Good night";

  setText("greeting-text", greeting + ",");
  setText("greeting-name", getFirstName(user));
}


/**
 * Updates the mobile topbar profile circle with the current user's initials.
 */
function updateMobileProfile() {
  const el = document.getElementById("mobile-profile");
  if (!el) return;
  const savedUser = sessionStorage.getItem("currentUser");
  if (!savedUser) return;
  try {
    const user = JSON.parse(savedUser);
    const parts = String(user.name || "").trim().split(" ");
    const initials = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
    el.textContent = initials.toUpperCase() || "?";
  } catch {
    el.textContent = "?";
  }
}


function getCurrentUser() {
  const savedUser = sessionStorage.getItem("currentUser");
  if (!savedUser) return null;
  try {
    const user = JSON.parse(savedUser);
    if (!user || !user.name) return null;
    const [first, ...rest] = user.name.trim().split(" ");
    return { firstName: formatNamePart(first || ""), lastName: formatNamePart(rest.join(" ")) };
  } catch {
    return null;
  }
}

function getFirstName(user) {
  return user.firstName || "Guest";
}

function formatNamePart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^\w/, (firstLetter) => firstLetter.toUpperCase());
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
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

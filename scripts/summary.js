import { loadTasks } from "./backend-tasks.js";

initSummary();

async function initSummary() {
  try {
    const tasks = await loadTasks();
    renderSummary(tasks || []);
  } catch (error) {
    console.error("Fehler beim Laden der Summary:", error);
  }
}

function renderSummary(tasks) {
  updateSummary(tasks);
  updateGreeting();
  updateMobileProfile();
  initMobileGreetingIntro();
}

function updateSummary(tasks) {
  const counts = countTasksByColumn(tasks);
  const urgentTasks = tasks.filter(isUrgent);
  renderSummaryCounts(tasks, counts, urgentTasks);
  updateUrgentDate(urgentTasks);
}

function countTasksByColumn(tasks) {
  const counts = getEmptyCounts();
  tasks.forEach((task) => counts[getTaskColumn(task)]++);
  return counts;
}

function getEmptyCounts() {
  return {
    todo: 0,
    inprogress: 0,
    awaiting: 0,
    done: 0,
  };
}

function renderSummaryCounts(tasks, counts, urgentTasks) {
  setText("todo-count", counts.todo);
  setText("done-count", counts.done);
  setText("urgent-count", urgentTasks.length);
  setText("board-count", tasks.length);
  setText("inprogress-count", counts.inprogress);
  setText("awaiting-count", counts.awaiting);
}

function getTaskColumn(task) {
  const value = getNormalizedColumnValue(task);
  if (value.includes("done")) return "done";
  if (value.includes("awaiting")) return "awaiting";
  if (value.includes("progress")) return "inprogress";
  if (isTodoValue(value)) return "todo";
  return "todo";
}

function getNormalizedColumnValue(task) {
  return normalize(
    task.status ||
    task.column ||
    task.boardColumn ||
    task.category ||
    ""
  );
}

function isTodoValue(value) {
  return value.includes("todo") || value.includes("to do");
}

function isUrgent(task) {
  const prio = normalize(task.prio || task.priority);
  return prio.includes("urgent") || prio.includes("urgend");
}

function updateUrgentDate(urgentTasks) {
  const el = document.getElementById("current-date");
  if (!el) return;
  const dates = getSortedUrgentDates(urgentTasks);
  el.textContent = getUrgentDateText(dates);
}

function getSortedUrgentDates(tasks) {
  return tasks
    .map(getTaskDateValue)
    .filter(Boolean)
    .map(parseTaskDate)
    .filter(isValidDate)
    .sort((a, b) => a - b);
}

function getTaskDateValue(task) {
  return task.dueDate || task.date || "";
}

function isValidDate(date) {
  return !Number.isNaN(date.getTime());
}

function getUrgentDateText(dates) {
  if (!dates.length) return "No deadline";
  return formatDate(dates[0]);
}

function formatDate(date) {
  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function parseTaskDate(value) {
  if (value.includes("/")) return parseSlashDate(value);
  return new Date(value);
}

function parseSlashDate(value) {
  const [day, month, year] = value.split("/");
  return new Date(`${year}-${month}-${day}`);
}

function updateGreeting() {
  const user = getCurrentUser();
  if (!user) return redirectToLogin();
  setText("greeting-text", getGreetingText());
  setText("greeting-name", getDisplayName(user));
}

function getDisplayName(user) {
  if (isGuestUser(user)) return "Guest";
  return `${user.firstName} ${user.lastName}`.trim();
}

function isGuestUser(user) {
  return user.firstName.toLowerCase() === "guest";
}

function redirectToLogin() {
  window.location.href = "../index.html";
}

function getGreetingText() {
  return getGreetingByHour(new Date().getHours()) + ",";
}

function getGreetingByHour(hour) {
  if (hour >= 5 && hour <= 11) return "Good morning";
  if (hour >= 12 && hour <= 17) return "Good afternoon";
  if (hour >= 18 && hour <= 21) return "Good evening";
  return "Good night";
}

function updateMobileProfile() {
  const el = document.getElementById("mobile-profile");
  if (!el) return;
  const user = getSavedUser();
  if (!user) return;
  el.textContent = getUserInitials(user);
}

function initMobileGreetingIntro() {
  if (!shouldShowMobileGreeting()) {
    showSummaryContent();
    return;
  }

  sessionStorage.setItem("mobileGreetingShown", "true");
  setTimeout(showSummaryContent, 2000);
}

function shouldShowMobileGreeting() {
  const wasShown = sessionStorage.getItem("mobileGreetingShown");
  return isMobileView() && wasShown !== "true";
}

function isMobileView() {
  return window.innerWidth <= 768;
}

function showSummaryContent() {
  document.body.classList.remove("mobile-greeting-active");
}

function getSavedUser() {
  const savedUser = sessionStorage.getItem("currentUser");
  if (!savedUser) return null;
  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

function getUserInitials(user) {
  const parts = String(user.name || "").trim().split(" ");
  const initials = getInitialsFromParts(parts);
  return initials.toUpperCase() || "?";
}

function getInitialsFromParts(parts) {
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}

function getCurrentUser() {
  const user = getSavedUser();
  if (!isValidUser(user)) return null;
  return formatUser(user);
}

function isValidUser(user) {
  return user && user.name;
}

function formatUser(user) {
  const [first, ...rest] = user.name.trim().split(" ");
  return {
    firstName: formatNamePart(first || ""),
    lastName: formatNamePart(rest.join(" ")),
  };
}

function getFirstName(user) {
  return user.firstName || "Guest";
}

function formatNamePart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^\w/, capitalizeFirstLetter);
}

function capitalizeFirstLetter(firstLetter) {
  return firstLetter.toUpperCase();
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
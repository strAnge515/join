/**
 * Summary Page Script
 * This script handles the logic for the summary page, including loading tasks,
 * calculating summary information, and updating the UI accordingly.
 */
import { loadTasks } from "./backend-tasks.js";


/**
 * Initializes the summary page by loading tasks and rendering the summary information.
 */
async function initSummary() {
  try {
    const tasks = await loadTasks();
    renderSummary(tasks || []);
  } catch (error) {
    console.error("Fehler beim Laden der Summary:", error);
  }
}


/**
 * Renders the summary information based on the provided tasks.
 * @param {Array} tasks - The list of tasks to display.
 */
function renderSummary(tasks) {
  updateSummary(tasks);
  updateGreeting();
  updateMobileProfile();
  initMobileGreetingIntro();
}


/**
 * Updates the summary counts and urgent task information.
 * @param {Array} tasks - The list of tasks to analyze.
 */
function updateSummary(tasks) {
  const counts = countTasksByColumn(tasks);
  const urgentTasks = tasks.filter(isUrgent);
  renderSummaryCounts(tasks, counts, urgentTasks);
  updateUrgentDate(urgentTasks);
}


/**
 * Counts the number of tasks in each column/category.
 * @param {Array} tasks - The list of tasks to count.
 * @returns {Object} An object containing the counts for each column.
 */
function countTasksByColumn(tasks) {
  const counts = getEmptyCounts();
  tasks.forEach((task) => counts[getTaskColumn(task)]++);
  return counts;
}


/**
 * Initializes an object with zero counts for each task column.
 * @returns {Object} An object with initial counts set to zero.
 */
function getEmptyCounts() {
  return {
    todo: 0,
    inprogress: 0,
    awaiting: 0,
    done: 0,
  };
}


/**
 * Renders the summary counts for each task column.
 * @param {Array} tasks - The list of tasks to display.
 * @param {Object} counts - The counts for each column.
 * @param {Array} urgentTasks - The list of urgent tasks.
 */
function renderSummaryCounts(tasks, counts, urgentTasks) {
  setText("todo-count", counts.todo);
  setText("done-count", counts.done);
  setText("urgent-count", urgentTasks.length);
  setText("board-count", tasks.length);
  setText("inprogress-count", counts.inprogress);
  setText("awaiting-count", counts.awaiting);
}


/**
 * Determines the column/category for a given task.
 * @param {Object} task - The task for which to determine the column.
 * @returns {string} The column name.
 */
function getTaskColumn(task) {
  const value = getNormalizedColumnValue(task);
  if (value.includes("done")) return "done";
  if (value.includes("awaiting")) return "awaiting";
  if (value.includes("progress")) return "inprogress";
  if (isTodoValue(value)) return "todo";
  return "todo";
}


/**
 * Normalizes the column/category value for a task.
 * @param {Object} task - The task for which to get the column value.
 * @returns {string} The normalized column value.
 */
function getNormalizedColumnValue(task) {
  return normalize(
    task.status ||
    task.column ||
    task.boardColumn ||
    task.category ||
    ""
  );
}


/**
 * Checks if a task is in the "todo" column.
 * @param {string} value - The column value to check.
 * @returns {boolean} True if the task is in the "todo" column, false otherwise.
 */
function isTodoValue(value) {
  return value.includes("todo") || value.includes("to do");
}


/**
 * Determines if a task is urgent.
 * @param {Object} task - The task to evaluate.
 * @returns {boolean} True if the task is urgent, false otherwise.
 */
function isUrgent(task) {
  const prio = normalize(task.prio || task.priority);
  return prio.includes("urgent") || prio.includes("urgend");
}


/**
 * Updates the displayed urgent date based on the provided urgent tasks.
 * @param {Array} urgentTasks - The list of urgent tasks to analyze.
 */
function updateUrgentDate(urgentTasks) {
  const el = document.getElementById("current-date");
  if (!el) return;
  const dates = getSortedUrgentDates(urgentTasks);
  el.textContent = getUrgentDateText(dates);
}


/**
 * Extracts, parses, and sorts the dates from the urgent tasks.
 * @param {Array} tasks - The list of urgent tasks to process.
 * @returns {Array} A sorted array of valid Date objects.
 */
function getSortedUrgentDates(tasks) {
  return tasks
    .map(getTaskDateValue)
    .filter(Boolean)
    .map(parseTaskDate)
    .filter(isValidDate)
    .sort((a, b) => a - b);
}


/**
 * Retrieves the relevant date value from a task, prioritizing dueDate over date.
 * @param {Object} task - The task from which to extract the date value.
 * @returns {string} The date value as a string, or an empty string if not found.
 */
function getTaskDateValue(task) {
  return task.dueDate || task.date || "";
}


/**
 * Checks if a given date is valid.
 * @param {Date} date - The date to validate.
 * @returns {boolean} True if the date is valid, false otherwise.
 */
function isValidDate(date) {
  return !Number.isNaN(date.getTime());
}


/**
 * Generates a text representation of the urgent date based on the provided dates.
 * @param {Array} dates - An array of Date objects to evaluate.
 * @returns {string} A formatted date string or a message indicating no deadline.
 */
function getUrgentDateText(dates) {
  if (!dates.length) return "No deadline";
  return formatDate(dates[0]);
}


/**
 * Formats a Date object into a human-readable string in German locale.
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string.
 */ 
function formatDate(date) {
  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


/**
 * Parses a date string into a Date object, handling both standard and slash-separated formats.
 * @param {string} value - The date string to parse.
 * @returns {Date} The parsed Date object.
 */
function parseTaskDate(value) {
  if (value.includes("/")) return parseSlashDate(value);
  return new Date(value);
}


/**
 * Parses a date string in slash format (DD/MM/YYYY) into a Date object.
 * @param {string} value - The date string to parse.
 * @returns {Date} The parsed Date object.
 */
function parseSlashDate(value) {
  const [day, month, year] = value.split("/");
  return new Date(`${year}-${month}-${day}`);
}


/**
 * Updates the greeting text based on the current user.
 */
function updateGreeting() {
  const user = getCurrentUser();
  if (!user) return redirectToLogin();
  setText("greeting-text", getGreetingText());
  setText("greeting-name", getDisplayName(user));
}


/**
 * Generates the display name for a user, handling guest users appropriately.
 * @param {Object} user - The user object containing firstName and lastName.
 * @returns {string} The display name for the user.
 */
function getDisplayName(user) {
  if (isGuestUser(user)) return "Guest";
  return `${user.firstName} ${user.lastName}`.trim();
}


/**
 * Determines if the given user is a guest user based on their first name.
 * @param {Object} user - The user object to evaluate.
 * @returns {boolean} True if the user is a guest, false otherwise.
 */
function isGuestUser(user) {
  return user.firstName.toLowerCase() === "guest";
}


/**
 * Redirects the user to the login page.
 */
function redirectToLogin() {
  window.location.href = "../index.html";
}


/**
 * Generates the greeting text based on the current time.
 * @returns {string} The greeting text.
 */
function getGreetingText() {
  return getGreetingByHour(new Date().getHours()) + ",";
}


/**
 * Determines the appropriate greeting based on the current hour.
 * @param {number} hour - The current hour (0-23).
 * @returns {string} The greeting message.
 */
function getGreetingByHour(hour) {
  if (hour >= 5 && hour <= 11) return "Good morning";
  if (hour >= 12 && hour <= 17) return "Good afternoon";
  if (hour >= 18 && hour <= 21) return "Good evening";
  return "Good night";
}


/**
 * Updates the mobile profile display with the user's initials if applicable.
 */
function updateMobileProfile() {
  const el = document.getElementById("mobile-profile");
  if (!el) return;
  const user = getSavedUser();
  if (!user) return;
  el.textContent = getUserInitials(user);
}


/**
 * Initializes the mobile greeting intro sequence.
 */
function initMobileGreetingIntro() {
  if (!shouldShowMobileGreeting()) {
    showSummaryContent();
    return;
  }

  sessionStorage.setItem("mobileGreetingShown", "true");
  setTimeout(showSummaryContent, 2000);
}


/**
 * Checks if the mobile greeting should be shown.
 * @returns {boolean} True if the greeting should be shown, false otherwise.
 */
function shouldShowMobileGreeting() {
  const wasShown = sessionStorage.getItem("mobileGreetingShown");
  return isMobileView() && wasShown !== "true";
}


/**
 * Determines if the current view is considered a mobile view based on window width.
 * @returns {boolean} True if the view is mobile, false otherwise.
 */
function isMobileView() {
  return window.innerWidth <= 768;
}


/**
 * Shows the summary content by removing the mobile greeting active class.
 */
function showSummaryContent() {
  document.body.classList.remove("mobile-greeting-active");
}



/**
 * Retrieves the saved user from session storage.
 * @returns {Object|null} The saved user object or null if not found.
 */
function getSavedUser() {
  const savedUser = sessionStorage.getItem("currentUser");
  if (!savedUser) return null;
  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}


/**
 * Generates the initials for a user based on their name.
 * @param {Object} user - The user object containing the name property.
 * @returns {string} The initials of the user in uppercase, or "?" if not available.
 */
function getUserInitials(user) {
  const parts = String(user.name || "").trim().split(" ");
  const initials = getInitialsFromParts(parts);
  return initials.toUpperCase() || "?";
}


/**
 * Extracts the first letters from the first two parts of a name to create initials.
 * @param {Array} parts - An array of name parts (e.g., first name, last name).
 * @returns {string} The concatenated initials from the first two parts.
 */
function getInitialsFromParts(parts) {
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}


/**
 * Retrieves the current user, validates it, and formats it for display.
 * @returns {Object|null} The formatted user object or null if the user is invalid.
 */
function getCurrentUser() {
  const user = getSavedUser();
  if (!isValidUser(user)) return null;
  return formatUser(user);
}


/**
 * Validates the user object to ensure it has the necessary properties for display.
 * @param {Object} user - The user object to validate.
 * @returns {boolean} True if the user is valid, false otherwise.
 */
function isValidUser(user) {
  return user && user.name;
}


/**
 * Formats the user object for display.
 * @param {Object} user - The user object to format.
 * @returns {Object} The formatted user object.
 */
function formatUser(user) {
  const [first, ...rest] = user.name.trim().split(" ");
  return {
    firstName: formatNamePart(first || ""),
    lastName: formatNamePart(rest.join(" ")),
  };
}


/**
 * Retrieves the first name of the user.
 * @param {Object} user - The user object.
 * @returns {string} The first name of the user or "Guest" if not available.
 */
function getFirstName(user) {
  return user.firstName || "Guest";
}


/**
 * Formats a part of the user's name (e.g., first or last name).
 * @param {string} value - The name part to format.
 * @returns {string} The formatted name part.
 */
function formatNamePart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^\w/, capitalizeFirstLetter);
}


/**
 * Capitalizes the first letter of a string.
 * @param {string} firstLetter - The string to capitalize.
 * @returns {string} The input string with the first letter capitalized.
 */
function capitalizeFirstLetter(firstLetter) {
  return firstLetter.toUpperCase();
}


/**
 * Sets the text content of an element by its ID.
 * @param {string} id - The ID of the element.
 * @param {string} value - The value to set.
 */
function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}


/**
 * Normalizes a string value by trimming, converting to lowercase, and replacing certain characters.
 * @param {string} value - The string value to normalize.
 * @returns {string} The normalized string.
 */
function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ");
}


/* Initializes the summary page when the DOM content is fully loaded. */
document.addEventListener("DOMContentLoaded", initSummary);
initSummary();
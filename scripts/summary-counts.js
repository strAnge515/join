import { setText, normalize } from "./summary-utils.js";

/**
 * This module is responsible for updating the summary counts and urgent task information on the summary page.
 * It counts tasks by their status or category, identifies urgent tasks, and updates the UI accordingly.
 */
export function updateSummary(tasks) {
  const counts = countTasksByColumn(tasks);
  const urgentTasks = tasks.filter(isUrgent);

  renderSummaryCounts(tasks, counts, urgentTasks);
  updateUrgentDate(urgentTasks);
}

/** Counts the number of tasks in each column based on their status or category.
 * @param {Array} tasks - An array of task objects to be counted.
 * @returns {Object} An object containing the counts for each column (todo, inprogress, awaiting, done).
 */
function countTasksByColumn(tasks) {
  const counts = {
    todo: 0,
    inprogress: 0,
    awaiting: 0,
    done: 0,
  };

  tasks.forEach((task) => counts[getTaskColumn(task)]++);
  return counts;
}

/**
 * Renders the summary counts in the UI based on the provided task data.
 * @param {Array} tasks - An array of task objects.
 * @param {Object} counts - An object containing the counts for each column.
 * @param {Array} urgentTasks - An array of urgent tasks.
 */
function renderSummaryCounts(tasks, counts, urgentTasks) {
  setText("todo-count", counts.todo);
  setText("done-count", counts.done);
  setText("urgent-count", urgentTasks.length);
  setText("board-count", tasks.length);
  setText("inprogress-count", counts.inprogress);
  setText("awaiting-count", counts.awaiting);
}

/** Determines the column of a task based on its status, column, boardColumn, or category.
 * @param {Object} task - The task object to determine the column for.
 * @returns {string} The column name (todo, inprogress, awaiting, done) based on the task's properties.
 */
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
  return "todo";
}

/** Determines if a task is urgent based on its priority or prio property.
 * @param {Object} task - The task object to check for urgency.
 * @returns {boolean} True if the task is urgent, false otherwise.
 */
function isUrgent(task) {
  const prio = normalize(task.prio || task.priority);
  return prio.includes("urgent") || prio.includes("urgend");
}

/**
 * Updates the date of the most urgent task in the UI.
 * @param {Array} urgentTasks - An array of urgent tasks.
 */
function updateUrgentDate(urgentTasks) {
  const dates = urgentTasks
    .map((task) => task.dueDate || task.date || "")
    .filter(Boolean)
    .map(parseTaskDate)
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b);

  setText("current-date", dates.length ? formatDate(dates[0]) : "No deadline");
}

/** Parses a date string in either "DD/MM/YYYY" format or a standard date format and returns a Date object.
 * @param {string} value - The date string to be parsed.
 * @returns {Date} A Date object representing the parsed date.
 */ 
function parseTaskDate(value) {
  if (value.includes("/")) {
    const [day, month, year] = value.split("/");
    return new Date(`${year}-${month}-${day}`);
  }

  return new Date(value);
}

/** Formats a Date object into a human-readable string in the format "DD. Month YYYY" (e.g., "15. September 2024").
 * @param {Date} date - The Date object to be formatted.
 * @returns {string} A formatted date string in the specified format.
 */
function formatDate(date) {
  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
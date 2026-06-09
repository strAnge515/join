import { loadTasks } from "./backend-tasks.js";
import { updateSummary } from "./summary-counts.js";
import {
  updateGreeting,
  updateMobileProfile,
  initMobileGreetingIntro,
} from "./summary-greeting.js";

/**
 * This module initializes the summary page by loading tasks from the backend and updating the summary counts and greeting.
 * It also handles the mobile greeting intro for first-time visitors on mobile devices.
 */
async function initSummary() {
  try {
    const tasks = await loadTasks();
    renderSummary(tasks || []);
  } catch (error) {
    console.error("Fehler beim Laden der Summary:", error);
  }
}

/** Renders the summary by updating the task counts and greeting based on the loaded tasks.
 * @param {Array} tasks - An array of task objects loaded from the backend.
 */
function renderSummary(tasks) {
  updateSummary(tasks);
  updateGreeting();
  updateMobileProfile();
  initMobileGreetingIntro();
}

document.addEventListener("DOMContentLoaded", initSummary);
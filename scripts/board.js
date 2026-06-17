import { loadTasks, deleteTask, updateTask } from './backend-tasks.js';
import { getCategoryBadge, getSubtaskInfo } from './board-utils.js';
import { initDragDrop, refreshCardListeners } from './board-drag-drop.js';
import {
  addEventListenersToAddTaskBtn,
  addDialogCloseListeners,
  openTaskCard,
} from './board-dialogs.js';
import { addEventListenersToCloseDialog } from './contacts-dialogs.js';
import {
  getTaskCardInnerHTML,
  getProgressBarHTML,
  getConfirmDialogHTML,
  getUrgentIconForModal,
  getMediumIconForModal,
  getLowIconForModal,
} from './board-template.js';

const columnTodo = document.getElementById('column-todo');
const columnInProgress = document.getElementById('column-inprogress');
const columnAwaiting = document.getElementById('column-awaiting');
const columnDone = document.getElementById('column-done');
const searchInput = document.querySelector('.board-header__search input');

let allTasks = [];

/**
 * Initializes the board by rendering tasks, setting up search and drag-and-drop.
 */
async function initBoard() {
  await renderBoard();
  initSearch();
  initDragDrop(handleTaskMove);
  addEventListenersToAddTaskBtn();
  addDialogCloseListeners();
}

/**
 * Loads all tasks from Firebase and renders them on the board.
 */
export async function renderBoard() {
  clearBoard();
  try {
    allTasks = (await loadTasks()) || [];
    window.allTasks = allTasks;
    window.renderBoard = renderBoard;
    displayTasks(allTasks);
    refreshCardListeners();
  } catch (error) {
    console.error('Fehler beim Laden des Boards:', error);
  }
}

/**
 * Renders a given list of tasks into the correct board columns.
 * @param {Array} tasks - Array of task objects to display.
 */
function displayTasks(tasks) {
  clearBoard();
  tasks.forEach((task) => {
    const taskCard = createTaskCard(task);
    getColumnByStatus(task.status).appendChild(taskCard);
  });
  renderEmptyPlaceholders();
}

/**
 * Clears all task cards from every board column.
 */
function clearBoard() {
  columnTodo.innerHTML = '';
  columnInProgress.innerHTML = '';
  columnAwaiting.innerHTML = '';
  columnDone.innerHTML = '';
}

/**
 * Adds a "No tasks here" placeholder to each column that has no tasks.
 */
function renderEmptyPlaceholders() {
  const columns = [columnTodo, columnInProgress, columnAwaiting, columnDone];
  columns.forEach((column) => {
    if (column.children.length === 0) {
      const status = column.dataset.status;
      const formattedStatus = status
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      const placeholder = document.createElement('div');
      placeholder.className = 'board-column__empty';
      placeholder.textContent = `No tasks ${formattedStatus}`;
      column.appendChild(placeholder);
    }
  });
}

/**
 * Attaches the input event listener to the search field.
 */
function initSearch() {
  searchInput.addEventListener('input', handleSearch);
}

/**
 * Filters and displays tasks based on the current search input value.
 */
function handleSearch() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    displayTasks(allTasks);
    return;
  }
  const filtered = allTasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query),
  );
  displayTasks(filtered);
  if (filtered.length === 0) {
    clearBoard();
    columnTodo.innerHTML = '<p class="board-no-results">No tasks found</p>';
  }
}

/**
 * Returns the correct board column element based on the task's status.
 * @param {string} status - The status value of the task.
 * @returns {HTMLElement} The matching column DOM element.
 */
function getColumnByStatus(status) {
  const s = String(status || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
  if (s === 'to do' || s === 'todo') return columnTodo;
  if (s === 'in progress' || s === 'inprogress') return columnInProgress;
  if (s === 'awaiting feedback' || s === 'awaiting') return columnAwaiting;
  if (s === 'done') return columnDone;
  return columnTodo;
}

/**
 * Extracts a flat array of display names from the assigned_to field of a task.
 * @param {Array} assignedTo - The raw assigned_to array from Firebase.
 * @returns {string[]} Array of full name strings.
 */
function getAssignedUserNames(assignedTo) {
  if (!Array.isArray(assignedTo)) return [];
  return assignedTo.map((u) => {
    if (typeof u === 'string') return u;
    if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
    if (u.id === 'guest') return 'Guest';
    return u.name || 'Unknown';
  });
}

/**
 * Attaches a click listener to the mobile swap button to toggle the move overlay.
 * @param {HTMLElement} card - The task card element.
 */
function initMobileSwapButton(card) {
  card
    .querySelector('.mobile-swap-button')
    .addEventListener('click', (event) => {
      event.stopPropagation();
      const overlay = card.querySelector('.mobile-move-buttons');
      const isOpen = !overlay.classList.contains('d-none');
      document
        .querySelectorAll('.mobile-move-buttons')
        .forEach((o) => o.classList.add('d-none'));
      overlay.classList.toggle('d-none', isOpen);
    });
}

/**
 * Attaches click listeners to all mobile move buttons inside a task card.
 * @param {HTMLElement} card - The task card element.
 * @param {string} taskId - The Firebase ID of the task.
 */
function initMobileMoveButtons(card, taskId) {
  card.querySelectorAll('.mobile-move-section').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      handleTaskMove(taskId, button.dataset.status);
    });
  });
}

/**
 * Creates and returns a fully configured task card button element.
 * @param {Object} task - The task data object.
 * @returns {HTMLElement} The rendered task card element.
 */
function createTaskCard(task) {
  const card = document.createElement('button');
  card.className = 'task-card';
  card.dataset.id = task.id;
  card.addEventListener('click', () => openTaskCard(task));
  fillTaskCardInformation(task, card);
  initMobileSwapButton(card);
  initMobileMoveButtons(card, task.id);
  return card;
}

/*prettier-ignore */
/**
 * Fills a task card with the information from a task and renders its content.
 *
 * @param {Task} task - The task to display.
 * @param {HTMLElement} card - The task card element to populate.
 * @returns {void}
 */
function fillTaskCardInformation(task, card) {
  const subtaskInfo = getSubtaskInfo(task.subtasks);
  const assignedUsers = getAssignedUserNames(task.assigned_to);
  const currentStatus = getNeighborStatus(task);
  const categoryBadge = getCategoryBadge(task.category);
  card.innerHTML = getTaskCardInnerHTML(
    categoryBadge,
    task,
    subtaskInfo,
    assignedUsers,
    currentStatus,
  );
}

/**
 * Returns an img tag for the priority icon displayed in the modal.
 * @param {string} prio - The priority value (urgent, medium, low).
 * @returns {string} HTML img tag string or empty string if unrecognized.
 */
export function getPriorityIconForModal(prio) {
  const normalized = String(prio || '')
    .trim()
    .toLowerCase();
  if (normalized === 'urgent') {
    return getUrgentIconForModal();
  }
  if (normalized === 'medium') {
    return getMediumIconForModal();
  }
  if (normalized === 'low') {
    return getLowIconForModal();
  }
  return '';
}

/**
 * Returns the neighboring statuses (previous and next) for a given task's current status.
 * @param {Object} task - The task data object containing a status string.
 * @returns {string[]} Array of up to two neighboring status strings.
 */
function getNeighborStatus(task) {
  const possibleStatus = ['to do', 'in progress', 'awaiting feedback', 'done'];
  const currentIndex = possibleStatus.indexOf(task.status);
  const neighbors = [];
  if (currentIndex - 1 >= 0) neighbors.push(possibleStatus[currentIndex - 1]);
  if (currentIndex + 1 < possibleStatus.length)
    neighbors.push(possibleStatus[currentIndex + 1]);
  return neighbors;
}

/**
 * Moves a task to a new status column and persists the change to Firebase.
 * @param {string} taskId - The Firebase ID of the task to move.
 * @param {string} newStatus - The new status string matching a column's data-status value.
 */
async function handleTaskMove(taskId, newStatus) {
  try {
    await updateTask(taskId, { status: newStatus });
    await renderBoard();
  } catch (error) {
    console.error('Fehler beim Verschieben der Task:', error);
  }
}

/**
 * Adds a slide-in animation class to a DOM element after a delay.
 * @param {string} ref - CSS selector string for the target element.
 * @param {number} time - Delay in milliseconds before the class is added.
 */
function addSlideInAnimation(ref, time) {
  const element = document.querySelector(ref);
  setTimeout(() => {
    element.classList.add('slide-in');
  }, time);
}

/**
 * Closes all open mobile move overlays when clicking anywhere on the document.
 */
document.addEventListener('click', () => {
  const mobileMoveButtons = document.querySelectorAll('.mobile-move-buttons');
  mobileMoveButtons.forEach((overlay) => overlay.classList.add('d-none'));
});

initBoard();

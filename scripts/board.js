import { loadTasks, deleteTask, updateTask } from './backend-tasks.js';
import {
  getInitials, getAvatarColor, getPriorityIcon, getCategoryBadge,
  renderAssignedUsers, getSubtaskInfo, getProgressBarHTML, getTaskCardInnerHTML
} from './board-utils.js';
import { initDragDrop, refreshCardListeners } from './board-drag-drop.js';

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
}


/**
 * Loads all tasks from Firebase and renders them on the board.
 */
async function renderBoard() {
  clearBoard();
  try {
    allTasks = await loadTasks() || [];
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
      const placeholder = document.createElement('div');
      placeholder.className = 'board-column__empty';
      placeholder.textContent = 'No tasks here';
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
  const filtered = allTasks.filter((task) =>
    task.title?.toLowerCase().includes(query) ||
    task.description?.toLowerCase().includes(query)
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
  const s = String(status || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (s === 'to do' || s === 'todo') return columnTodo;
  if (s === 'in progress' || s === 'inprogress') return columnInProgress;
  if (s === 'awaiting feedback' || s === 'awaiting') return columnAwaiting;
  if (s === 'done') return columnDone;
  return columnTodo;
}


/**
 * Creates and returns a task card button element for the board.
 * @param {Object} task - The task data object.
 * @returns {HTMLElement} The rendered task card element.
 */
function createTaskCard(task) {
  const card = document.createElement('button');
  card.className = 'task-card';
  card.dataset.id = task.id;
  card.onclick = () => openTaskCard(task);
  const subtaskInfo = getSubtaskInfo(task.subtasks);
  const assignedUsers = Array.isArray(task.assigned_to) ? task.assigned_to : [];
  const priorityIcon = getPriorityIcon(task.prio);
  const categoryBadge = getCategoryBadge(task.category);
  card.innerHTML = getTaskCardInnerHTML(categoryBadge, task, subtaskInfo, assignedUsers, priorityIcon);
  addDeleteListenerToCard(card, task);
  return card;
}


/**
 * Attaches a click listener to the delete button inside a task card.
 * @param {HTMLElement} card - The task card element.
 * @param {Object} task - The task data object.
 */
function addDeleteListenerToCard(card, task) {
  const deleteButton = card.querySelector('.task-delete-btn');
  deleteButton.addEventListener('click', async (e) => {
    e.stopPropagation();
    const confirmed = confirm(`Delete task "${task.title || 'Untitled task'}"?`);
    if (!confirmed) return;
    try {
      await deleteTask(task.id);
      await renderBoard();
    } catch (error) {
      console.error('Fehler beim Löschen der Task:', error);
    }
  });
}


/**
 * Opens the task detail modal, populates it with the given task's data,
 * disables background scrolling and sets up close listeners.
 * @param {Object} task - The task data object to display in the modal.
 */
function openTaskCard(task) {
  const categoryBadge = getCategoryBadge(task.category);
  const dialogRef = document.getElementById('taskModal');
  document.body.classList.add('no-scroll');
  dialogRef.innerHTML = getTaskCardHTML(categoryBadge, task);
  fillTaskCardInitials(task);
  fillTaskCardSubtasks(task);
  addTaskCardEventListeners(task);
  dialogRef.showModal();
}


/**
 * Fills the assigned users list inside the open task modal.
 * @param {Object} task - The task data object containing assigned_to.
 */
function fillTaskCardInitials(task) {
  const assignedListRef = document.getElementById('assignedList');
  if (!task.assigned_to || task.assigned_to.length === 0) return;
  for (let i = 0; i < task.assigned_to.length; i++) {
    const user = task.assigned_to[i];
    assignedListRef.innerHTML += getAssignedUsersHTML(getAvatarColor(i), getInitials(user), user);
  }
}


/**
 * Fills the subtask list inside the open task modal.
 * @param {Object} task - The task data object containing subtasks.
 */
function fillTaskCardSubtasks(task) {
  const subtaskListRef = document.getElementById('subtaskList');
  if (!task.subtasks || task.subtasks.length === 0) {
    subtaskListRef.innerHTML = getEmptySubtaskHTML();
    return;
  }
  for (let i = 0; i < task.subtasks.length; i++) {
    subtaskListRef.innerHTML += getSubtaskItemHTML(task.subtasks[i], task.id, i);
  }
}


/**
 * Attaches event listeners to the modal's close button, backdrop click,
 * delete button and subtask checkboxes.
 * @param {Object} task - The task data object.
 */
function addTaskCardEventListeners(task) {
  const closeBtnRef = document.querySelector('.close');
  const dialogRef = document.getElementById('taskModal');
  const deleteBtn = document.getElementById('deleteTaskBtn');

  if (closeBtnRef) closeBtnRef.addEventListener('click', closeModal);

  dialogRef.addEventListener('click', (e) => {
    if (e.target === dialogRef) closeModal();
  });

  if (deleteBtn) deleteBtn.addEventListener('click', () => handleModalDelete(task));

  dialogRef.querySelectorAll('.modal-subtask-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => handleSubtaskToggle(e, task));
  });
}


/**
 * Handles task deletion triggered from the modal with user confirmation.
 * @param {Object} task - The task to delete.
 */
async function handleModalDelete(task) {
  const confirmed = confirm(`Delete task "${task.title || 'Untitled task'}"?`);
  if (!confirmed) return;
  try {
    await deleteTask(task.id);
    closeModal();
    await renderBoard();
  } catch (error) {
    console.error('Fehler beim Löschen:', error);
  }
}


/**
 * Toggles a subtask's state and saves the updated subtasks array to Firebase.
 * @param {Event} e - The change event fired by the checkbox.
 * @param {Object} task - The parent task containing the subtasks array.
 */
async function handleSubtaskToggle(e, task) {
  const index = parseInt(e.target.dataset.index);
  const updatedSubtasks = [...task.subtasks];
  updatedSubtasks[index] = { ...updatedSubtasks[index], state: e.target.checked };
  task.subtasks = updatedSubtasks;
  try {
    await updateTask(task.id, { subtasks: updatedSubtasks });
    const cardRef = document.querySelector(`.task-card[data-id="${task.id}"]`);
    if (cardRef) {
      const subtaskInfo = getSubtaskInfo(updatedSubtasks);
      const progressEl = cardRef.querySelector('.task-card__progress');
      if (progressEl) progressEl.outerHTML = getProgressBarHTML(subtaskInfo);
    }
  } catch (error) {
    console.error('Fehler beim Speichern des Subtasks:', error);
  }
}


/**
 * Closes the task detail modal, re-enables background scrolling and clears modal content.
 */
function closeModal() {
  const dialogRef = document.getElementById('taskModal');
  if (!dialogRef) return;
  document.body.classList.remove('no-scroll');
  dialogRef.close();
  dialogRef.innerHTML = '';
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
 * Removes the slide-in animation class from a DOM element after a delay.
 * @param {string} ref - CSS selector string for the target element.
 * @param {number} time - Delay in milliseconds before the class is removed.
 */
function removeSlideInAnimation(ref, time) {
  const element = document.querySelector(ref);
  setTimeout(() => {
    element.classList.remove('slide-in');
  }, time);
}


initBoard();
import { loadTasks, deleteTask, updateTask } from './backend-tasks.js';
import { getInitials, getAvatarColor, getPriorityIcon, getCategoryBadge, getSubtaskInfo, getProgressBarHTML, getTaskCardInnerHTML } from './board-utils.js';
import { initDragDrop, refreshCardListeners } from './board-drag-drop.js';
import { addEventListenersToCloseDialog, closeDialog } from './contacts-dialogs.js';
import { dateInputContainer, errorTextDate } from './tasks-date.js';

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
 * Attaches a click event listener to the "Add Task" button to open the add task dialog.
 */
function addEventListenersToAddTaskBtn() {
  const dialogRef = document.getElementById('addTaskDialog');
  const addTaskButtons = document.querySelectorAll('#addTaskBtn, .board-column__add-btn');
  if (!dialogRef) return;
  addTaskButtons.forEach((button) => {
    button.addEventListener('click', () => {
      window.selectedBoardStatus = button.dataset.status || 'to do';
      openAddTaskDialog(dialogRef);
    });
  });
}

/**
 * Opens the add task dialog and adds the "show" class for animation.
 * @param {HTMLElement} dialogRef - The reference to the add task dialog element.
 */
function openAddTaskDialog(dialogRef) {
  if (!dialogRef) return;
  dialogRef.showModal();
  removeAllInputErrors();
  dialogRef.classList.add('show');
}

/**
 * Adds a click event listener to a single close button.
 * When clicked, it finds the closest <dialog> element
 * and passes it to the closeDialog function.
 *
 * @returns {void}
 */
function addEventListenersToCloseBtn() {
  const btn = document.querySelector('.btn-to-close');
  if (btn) {
    btn.addEventListener('click', (e) => {
      const dialog = e.target.closest('dialog');
      if (!dialog) return;
      closeDialog(dialog);
    });
  }
}

/**
 * Adds event listeners to the add task dialog to close it when clicking outside, on the cancel button or pressing ESC.
 */
function addDialogCloseListeners() {
  const dialogRef = document.getElementById('addTaskDialog');
  if (!dialogRef) return;
  addEventListenersToCloseDialog(dialogRef);
  addEventListenersToCloseBtn();
}

/**
 * Removes all error messages and styles from the add task dialog's input fields.
 */
function removeAllInputErrors() {
  const selectCategoryButton = document.getElementById('selected-category');
  const taskTitleInput = document.getElementById('task-title');
  const errorTextCategory = document.getElementById('error-text-category');
  const errorTextTitle = document.getElementById('error-text-title');
  dateInputContainer.classList.remove('was-submitted-custom');
  errorTextDate.classList.add('d-none');
  selectCategoryButton.classList.remove('was-submitted-custom');
  errorTextCategory.classList.add('d-none');
  taskTitleInput.classList.remove('was-submitted-custom');
  errorTextTitle.classList.add('d-none');
}

/**
 * Loads all tasks from Firebase and renders them on the board.
 */
async function renderBoard() {
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
  const filtered = allTasks.filter((task) => task.title?.toLowerCase().includes(query) || task.description?.toLowerCase().includes(query));
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
    return u.name || 'Unknown';
  });
}

/**
 * Attaches a click listener to the mobile swap button to toggle the move overlay.
 * @param {HTMLElement} card - The task card element.
 */
function initMobileSwapButton(card) {
  card.querySelector('.mobile-swap-button').addEventListener('click', (event) => {
    event.stopPropagation();
    const overlay = card.querySelector('.mobile-move-buttons');
    const isOpen = !overlay.classList.contains('d-none');
    document.querySelectorAll('.mobile-move-buttons').forEach((o) => o.classList.add('d-none'));
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
  const subtaskInfo = getSubtaskInfo(task.subtasks);
  const assignedUsers = getAssignedUserNames(task.assigned_to);
  const currentStatus = getNeighborStatus(task);
  const categoryBadge = getCategoryBadge(task.category);
  card.innerHTML = getTaskCardInnerHTML(categoryBadge, task, subtaskInfo, assignedUsers, currentStatus);
  initMobileSwapButton(card);
  initMobileMoveButtons(card, task.id);
  return card;
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
  if (currentIndex + 1 < possibleStatus.length) neighbors.push(possibleStatus[currentIndex + 1]);
  return neighbors;
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
    let userName = 'Unknown';
    if (typeof user === 'string') {
      userName = user;
    } else if (user.firstName && user.lastName) {
      userName = `${user.firstName} ${user.lastName}`;
    } else if (user.name) {
      userName = user.name;
    }
    assignedListRef.innerHTML += getAssignedUsersHTML(getAvatarColor(i), getInitials(userName), userName);
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
 * Executes task deletion and closes the modal after the overlay is removed.
 * @param {HTMLElement} overlay - The confirm overlay element to remove.
 * @param {Object} task - The task to delete.
 */
async function executeTaskDelete(overlay, task) {
  overlay.remove();
  try {
    await deleteTask(task.id);
    closeModal();
    await renderBoard();
  } catch (error) {
    console.error('Fehler beim Löschen:', error);
  }
}

/**
 * Shows a custom confirmation overlay before deleting a task from the modal.
 * @param {Object} task - The task to delete.
 */
function handleModalDelete(task) {
  const dialog = document.createElement('dialog');
  dialog.className = 'confirm-overlay';
  dialog.innerHTML = getConfirmDialogHTML(task.title || 'Untitled task');
  document.body.appendChild(dialog);
  dialog.showModal();
  dialog.querySelector('#confirmCancel').addEventListener('click', () => dialog.close());
  dialog.querySelector('#confirmDelete').addEventListener('click', () => executeTaskDelete(dialog, task));
}

/**
 * Saves the updated subtasks array to Firebase and refreshes the progress bar on the task card.
 * @param {Object} task - The parent task object.
 * @param {Array} updatedSubtasks - The updated subtasks array.
 */
async function saveSubtaskUpdate(task, updatedSubtasks) {
  try {
    await updateTask(task.id, { subtasks: updatedSubtasks });
    const cardRef = document.querySelector(`.task-card[data-id="${task.id}"]`);
    if (cardRef) updateCardProgressBar(cardRef, updatedSubtasks);
  } catch (error) {
    console.error('Fehler beim Speichern des Subtasks:', error);
  }
}

/**
 * Updates the progress bar element on a task card after a subtask state change.
 * @param {HTMLElement} cardRef - The task card element.
 * @param {Array} updatedSubtasks - The updated subtasks array.
 */
function updateCardProgressBar(cardRef, updatedSubtasks) {
  const subtaskInfo = getSubtaskInfo(updatedSubtasks);
  const progressEl = cardRef.querySelector('.task-card__progress');
  if (progressEl) progressEl.outerHTML = getProgressBarHTML(subtaskInfo);
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
  await saveSubtaskUpdate(task, updatedSubtasks);
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

/**
 * Closes all open mobile move overlays when clicking anywhere on the document.
 */
document.addEventListener('click', () => {
  const mobileMoveButtons = document.querySelectorAll('.mobile-move-buttons');
  mobileMoveButtons.forEach((overlay) => overlay.classList.add('d-none'));
});

initBoard();

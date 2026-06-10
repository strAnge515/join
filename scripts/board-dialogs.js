import { clearTask } from './tasks.js';
import {
  addEventListenersToCloseDialog,
  closeDialog,
} from './contacts-dialogs.js';
import { dateInputContainer, errorTextDate } from './tasks-date.js';
import {
  getInitials,
  getCategoryBadge,
  getAvatarColor,
  getSubtaskInfo,
} from './board-utils.js';
import { updateTask, deleteTask } from './backend-tasks.js';
import {
  getProgressBarHTML,
  getTaskCardHTML,
  getEmptySubtaskHTML,
  getSubtaskItemHTML,
  getAssignedUsersHTML,
  getConfirmDialogHTML,
} from './board-template.js';
import { renderBoard } from './board.js';
import { splitDateString } from './tasks-date.js';

/**
 * Attaches a click event listener to the "Add Task" button to open the add task dialog.
 */
export function addEventListenersToAddTaskBtn() {
  const dialogRef = document.getElementById('addTaskDialog');
  const addTaskButtons = document.querySelectorAll(
    '#addTaskBtn, .board-column__add-btn',
  );
  if (!dialogRef) return;
  addTaskButtons.forEach((button) => {
    button.addEventListener('click', () => {
      window.selectedBoardStatus = button.dataset.status || 'to do';
      openAddTaskDialog(dialogRef);
    });
  });
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
 * Opens the add task dialog and adds the "show" class for animation.
 * @param {HTMLElement} dialogRef - The reference to the add task dialog element.
 */
function openAddTaskDialog(dialogRef) {
  if (!dialogRef) return;
  if (window.innerWidth >= 800) {
    document.body.style.overflow = 'hidden';
    dialogRef.showModal();
    removeAllInputErrors();
    dialogRef.classList.add('show');
  } else {
    window.location.href = 'task.html';
  }
}

/**
 * Adds event listeners to the add task dialog to close it when clicking outside, on the cancel button or pressing ESC.
 */
export function addDialogCloseListeners() {
  const dialogRef = document.getElementById('addTaskDialog');
  if (!dialogRef) return;
  addEventListenersToCloseDialog(dialogRef, clearTask);
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
      clearTask();
      closeDialog(dialog, clearTask);
    });
  }
}

/**
 * Opens the task detail modal, populates it with the given task's data,
 * disables background scrolling and sets up close listeners.
 * @param {Object} task - The task data object to display in the modal.
 */
export function openTaskCard(task) {
  const categoryBadge = getCategoryBadge(task.category);
  const dialogRef = document.getElementById('taskModal');
  document.body.style.overflow = 'hidden';
  dialogRef.innerHTML = getTaskCardHTML(categoryBadge, task);
  fillTaskCardInitials(task);
  fillTaskCardSubtasks(task);
  addTaskCardEventListeners(task);
  dialogRef.showModal();
}

/**
 * Get the date from the card
 * @returns {string} The foramted string for the card
 */
export function dateValidationForBoard(task) {
  const { day, month, year } = splitDateString(task.date);
  return `${day}/${month}/${year}`;
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
    const userName = choseUserName(user);
    assignedListRef.innerHTML += getAssignedUsersHTML(
      getAvatarColor(i),
      getInitials(userName),
      userName,
    );
  }
}

/**
 * Determines the username based on the user object.
 * @param {*} user - The user object or string.
 * @returns {string} The determined username.
 */
function choseUserName(user) {
  let userName = 'Unknown';
  if (typeof user === 'string') {
    userName = user;
  } else if (user.firstName && user.lastName) {
    userName = `${user.firstName} ${user.lastName}`;
  } else if (user.name) {
    userName = user.name;
  } else if (user.id === 'guest') {
    userName = 'Guest User';
  }
  return userName;
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
    subtaskListRef.innerHTML += getSubtaskItemHTML(
      task.subtasks[i],
      task.id,
      i,
    );
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
  if (deleteBtn)
    deleteBtn.addEventListener('click', () => handleModalDelete(task));
  dialogRef.querySelectorAll('.modal-subtask-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => handleSubtaskToggle(e, task));
    addEventListenersToCloseDialog(dialogRef);
  });
}

/**
 * Toggles a subtask's state and saves the updated subtasks array to Firebase.
 * @param {Event} e - The change event fired by the checkbox.
 * @param {Object} task - The parent task containing the subtasks array.
 */
async function handleSubtaskToggle(e, task) {
  const index = parseInt(e.target.dataset.index);
  const updatedSubtasks = [...task.subtasks];
  updatedSubtasks[index] = {
    ...updatedSubtasks[index],
    state: e.target.checked,
  };
  task.subtasks = updatedSubtasks;
  await saveSubtaskUpdate(task, updatedSubtasks);
}

/**
 * Closes the task detail modal, re-enables background scrolling and clears modal content.
 */
export function closeModal() {
  const dialogRef = document.getElementById('taskModal');
  if (!dialogRef) return;
  document.body.style.overflow = '';
  dialogRef.close();
  dialogRef.innerHTML = '';
}

/**
 * Shows a custom confirmation overlay before deleting a task from the modal.
 * @param {Object} task - The task to delete.
 */
export function handleModalDelete(task) {
  const dialog = document.createElement('dialog');
  dialog.className = 'confirm-overlay';
  dialog.setAttribute('closedby', 'any');
  dialog.innerHTML = getConfirmDialogHTML(task.title || 'Untitled task');
  document.body.appendChild(dialog);
  dialog.showModal();
  dialog
    .querySelector('#confirmCancel')
    .addEventListener('click', () => dialog.close());
  dialog
    .querySelector('#confirmDelete')
    .addEventListener('click', () => executeTaskDelete(dialog, task));
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

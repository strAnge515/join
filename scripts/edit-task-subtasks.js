import { getSubtaskTemplate, getEditTemplate } from './tasks-template.js';
import { escapeHtml } from './board-utils.js';


let editSubtasks = [];


/**
 * Replaces the internal subtasks array used by the edit modal.
 *
 * @param {Array<{title: string, state: boolean}>} initial - The starting subtasks.
 */
export function initSubtasks(initial) {
  editSubtasks = Array.isArray(initial) ? [...initial] : [];
}


/**
 * Returns the current edited subtasks array reference for persisting.
 *
 * @returns {Array<{title: string, state: boolean}>} The edited subtasks.
 */
export function getEditedSubtasks() {
  return editSubtasks;
}


/**
 * Wires up the subtask input, add/clear buttons and renders the initial list.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
export function setupSubtaskUI(dialogRef) {
  const input = dialogRef.querySelector('#edit-subtask-input');
  const addBtn = dialogRef.querySelector('#edit-subtask-add');
  const clearBtn = dialogRef.querySelector('#edit-subtask-clear');
  if (input) {
    input.addEventListener('input', () => handleSubtaskInput(dialogRef));
    input.addEventListener('keydown', (e) => handleSubtaskKeydown(e, dialogRef));
  }
  if (addBtn) addBtn.addEventListener('click', () => addEditSubtask(dialogRef));
  if (clearBtn) clearBtn.addEventListener('click', () => clearEditSubtaskInput(dialogRef));
  renderEditSubtasks(dialogRef);
}


/**
 * Toggles the visibility of the subtask action buttons based on the input value.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function handleSubtaskInput(dialogRef) {
  const input = dialogRef.querySelector('#edit-subtask-input');
  const actions = dialogRef.querySelector('#edit-subtask-actions');
  if (input.value.trim().length > 0) actions.classList.remove('d-none');
  else actions.classList.add('d-none');
}


/**
 * Adds a subtask when Enter is pressed inside the subtask input. The main
 * form must NOT submit on this key press (CLAUDE.md rule).
 *
 * @param {KeyboardEvent} e - The keyboard event object.
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function handleSubtaskKeydown(e, dialogRef) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  addEditSubtask(dialogRef);
}


/**
 * Reads the current input value, appends it to the subtasks array and re-renders.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function addEditSubtask(dialogRef) {
  const input = dialogRef.querySelector('#edit-subtask-input');
  const val = input.value.trim();
  if (!val) return;
  editSubtasks.push({ title: val, state: false });
  clearEditSubtaskInput(dialogRef);
  renderEditSubtasks(dialogRef);
}


/**
 * Clears the subtask input field and resets the action-button visibility.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function clearEditSubtaskInput(dialogRef) {
  const input = dialogRef.querySelector('#edit-subtask-input');
  if (!input) return;
  input.value = '';
  handleSubtaskInput(dialogRef);
}


/**
 * Re-renders the entire subtask list inside the modal.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function renderEditSubtasks(dialogRef) {
  const list = dialogRef.querySelector('#edit-subtask-list');
  if (!list) return;
  list.innerHTML = '';
  editSubtasks.forEach((st, idx) => list.appendChild(createSubtaskListItem(st, idx, dialogRef)));
}


/**
 * Creates a single subtask list item with display-mode HTML and listeners.
 *
 * @param {{title: string, state: boolean}} st - The subtask object.
 * @param {number} idx - The index of the subtask in the array.
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 * @returns {HTMLElement} The created list item element.
 */
function createSubtaskListItem(st, idx, dialogRef) {
  const li = document.createElement('li');
  li.className = 'subtask-item';
  li.innerHTML = getSubtaskTemplate(escapeHtml(st.title));
  attachSubtaskItemListeners(li, idx, dialogRef);
  return li;
}


/**
 * Attaches delete, edit (pencil) and double-click listeners to a subtask item.
 *
 * @param {HTMLElement} li - The subtask list item.
 * @param {number} idx - The index of the subtask in editSubtasks.
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function attachSubtaskItemListeners(li, idx, dialogRef) {
  li.querySelector('.delete-btn').addEventListener('click', () => deleteSubtask(idx, dialogRef));
  li.querySelector('.edit-btn').addEventListener('click', () => activateEditSubtaskMode(li, idx, dialogRef));
  li.addEventListener('dblclick', () => activateEditSubtaskMode(li, idx, dialogRef));
}


/**
 * Removes a subtask at the given index and re-renders the list.
 *
 * @param {number} idx - The index of the subtask to remove.
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function deleteSubtask(idx, dialogRef) {
  editSubtasks.splice(idx, 1);
  renderEditSubtasks(dialogRef);
}


/**
 * Switches a subtask list item into edit mode with an inline input.
 *
 * @param {HTMLElement} li - The subtask list item.
 * @param {number} idx - The index of the subtask in editSubtasks.
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function activateEditSubtaskMode(li, idx, dialogRef) {
  if (li.classList.contains('is-editing')) return;
  li.innerHTML = getEditTemplate(escapeHtml(editSubtasks[idx].title));
  li.classList.add('is-editing');
  li.querySelector('.subtask-edit-value').focus();
  li.querySelector('.edit-delete-btn').addEventListener('click', () => deleteSubtask(idx, dialogRef));
  li.querySelector('.edit-confirm-btn').addEventListener('click', () => confirmSubtaskEdit(li, idx, dialogRef));
  attachEditEnterListener(li, idx, dialogRef);
}


/**
 * Persists the new title from the inline input and re-renders the list.
 *
 * @param {HTMLElement} li - The subtask list item in edit mode.
 * @param {number} idx - The index of the subtask in editSubtasks.
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function confirmSubtaskEdit(li, idx, dialogRef) {
  const newText = li.querySelector('.subtask-edit-value').value.trim();
  if (!newText) {
    deleteSubtask(idx, dialogRef);
    return;
  }
  editSubtasks[idx].title = newText;
  renderEditSubtasks(dialogRef);
}


/**
 * Confirms the inline edit when Enter is pressed inside the edit input.
 *
 * @param {HTMLElement} li - The subtask list item in edit mode.
 * @param {number} idx - The index of the subtask in editSubtasks.
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function attachEditEnterListener(li, idx, dialogRef) {
  li.querySelector('.subtask-edit-value').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    confirmSubtaskEdit(li, idx, dialogRef);
  });
}

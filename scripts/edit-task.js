import { getBoardEditTemplate, getDropdownTemplate, renderAvatarsForEdit } from './tasks-template.js';
import { loadAndPrepareContacts } from './contacts-render.js';
import { updateTask } from './backend-tasks.js';
import { getInitials } from './board-utils.js';
import { initSubtasks, getEditedSubtasks, setupSubtaskUI } from './edit-task-subtasks.js';


let currentEditTaskId = null;
let currentPrio = 'medium';
let editSelectedContacts = [];
let allContacts = [];
let outsideClickHandler = null;


/**
 * Closes the edit task modal, resets the scroll behavior and removes
 * the document-level click listener registered for the contacts dropdown.
 */
function closeEditModal() {
  const dialogRef = document.getElementById('taskModal');
  if (!dialogRef) return;
  detachOutsideClickHandler();
  document.body.classList.remove('no-scroll');
  dialogRef.classList.remove('edit-mode');
  dialogRef.close();
  dialogRef.innerHTML = '';
}


/**
 * Removes the document-level outside-click handler if one is registered.
 */
function detachOutsideClickHandler() {
  if (!outsideClickHandler) return;
  document.removeEventListener('click', outsideClickHandler);
  outsideClickHandler = null;
}


/**
 * Opens the edit modal for a specific task and initializes all components.
 *
 * @param {string} taskId - The unique identifier of the task.
 */
window.openEditTask = async function (taskId) {
  const allTasks = window.allTasks || [];
  const task = allTasks.find((t) => t.id === taskId);
  if (!task) return;
  currentEditTaskId = taskId;
  currentPrio = task.prio || 'medium';
  editSelectedContacts = [...(task.assigned_to || [])];
  initSubtasks(task.subtasks || []);
  renderModalContent(task);
};


/**
 * Renders the modal content and sets up event listeners.
 *
 * @param {Object} task - The task object containing current data.
 */
async function renderModalContent(task) {
  const dialogRef = document.getElementById('taskModal');
  dialogRef.classList.add('edit-mode');
  dialogRef.innerHTML = getBoardEditTemplate(task);
  const closeBtn = dialogRef.querySelector('#edit-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeEditModal);
  setupPriorityButtons(dialogRef);
  setupDateInput(dialogRef);
  await setupContactsDropdown(dialogRef);
  setupSubtaskUI(dialogRef);
  setupFormSubmit(dialogRef, task);
}


/**
 * Initializes the custom date input fields and the native picker sync.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function setupDateInput(dialogRef) {
  const picker = dialogRef.querySelector('#edit-date-input');
  const svg = dialogRef.querySelector('#edit-event-svg');
  if (!svg || !picker) return;
  svg.addEventListener('click', () => {
    if (typeof picker.showPicker === 'function') picker.showPicker();
  });
  picker.addEventListener('change', (e) => syncPickerToFields(dialogRef, e.target.value));
}


/**
 * Writes the YYYY-MM-DD picker value into the three day/month/year inputs.
 *
 * @param {HTMLElement} dialogRef - The modal dialog containing the inputs.
 * @param {string} value - The native picker value in YYYY-MM-DD form.
 */
function syncPickerToFields(dialogRef, value) {
  if (!value) return;
  const [y, m, d] = value.split('-');
  dialogRef.querySelector('#edit-date-day').value = d;
  dialogRef.querySelector('#edit-date-month').value = m;
  dialogRef.querySelector('#edit-date-year').value = y;
}


/**
 * Sets up click listeners for the three priority buttons.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function setupPriorityButtons(dialogRef) {
  const prioBtns = dialogRef.querySelectorAll('.prio-btn');
  prioBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      prioBtns.forEach((b) => b.classList.remove('selected-urgent', 'selected-medium', 'selected-low'));
      currentPrio = btn.dataset.prio;
      btn.classList.add(`selected-${currentPrio}`);
    });
  });
}


/**
 * Initializes the contacts dropdown and loads contact data.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
async function setupContactsDropdown(dialogRef) {
  try {
    allContacts = await loadAndPrepareContacts();
  } catch (e) {
    console.error('Fehler beim Laden der Kontakte:', e);
  }
  const toggleBtn = dialogRef.querySelector('#edit-assigned-toggle');
  if (!toggleBtn) return;
  toggleBtn.addEventListener('click', (e) => toggleDropdownVisibility(e, dialogRef));
  outsideClickHandler = (e) => handleOutsideClick(e, dialogRef);
  document.addEventListener('click', outsideClickHandler);
  updateAvatarsContainer(dialogRef);
}


/**
 * Toggles the visibility of the contacts dropdown list.
 *
 * @param {Event} e - The click event object.
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function toggleDropdownVisibility(e, dialogRef) {
  e.stopPropagation();
  const optionsContainer = dialogRef.querySelector('#edit-assigned-options');
  const arrowDown = dialogRef.querySelector('#edit-arrow-down');
  const arrowUp = dialogRef.querySelector('#edit-arrow-up');
  optionsContainer.classList.toggle('d-none');
  arrowDown.classList.toggle('d-none');
  arrowUp.classList.toggle('d-none');
  if (!optionsContainer.classList.contains('d-none')) renderEditContactsDropdown(dialogRef);
}


/**
 * Closes the dropdown if the user clicks outside of it.
 *
 * @param {Event} e - The click event object.
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function handleOutsideClick(e, dialogRef) {
  const optionsContainer = dialogRef.querySelector('#edit-assigned-options');
  const toggleBtn = dialogRef.querySelector('#edit-assigned-toggle');
  if (!optionsContainer || !toggleBtn) return;
  if (optionsContainer.contains(e.target) || toggleBtn.contains(e.target)) return;
  optionsContainer.classList.add('d-none');
  dialogRef.querySelector('#edit-arrow-down').classList.remove('d-none');
  dialogRef.querySelector('#edit-arrow-up').classList.add('d-none');
}


/**
 * Renders the list of contacts inside the dropdown menu.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function renderEditContactsDropdown(dialogRef) {
  const optionsContainer = dialogRef.querySelector('#edit-assigned-options');
  if (!optionsContainer) return;
  optionsContainer.innerHTML = '';
  allContacts.forEach((contact) => {
    optionsContainer.appendChild(createContactListItem(contact, dialogRef));
  });
}


/**
 * Creates a single list item for a contact in the dropdown.
 *
 * @param {Object} contact - The contact object.
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 * @returns {HTMLElement} The created list item element.
 */
function createContactListItem(contact, dialogRef) {
  const fullName = `${contact.firstName} ${contact.lastName}`;
  const isSelected = isContactSelected(contact, fullName);
  const li = document.createElement('li');
  li.className = `assigned-option ${isSelected ? 'selected' : ''}`;
  li.innerHTML = getDropdownTemplate(contact, getInitials(fullName));
  applyCheckboxState(li, isSelected);
  li.addEventListener('click', (e) => onContactItemClick(e, contact, fullName, isSelected, dialogRef));
  return li;
}


/**
 * Toggles the checkbox icon visibility on a rendered contact list item.
 *
 * @param {HTMLElement} li - The contact list item element.
 * @param {boolean} isSelected - Whether the contact is currently selected.
 */
function applyCheckboxState(li, isSelected) {
  if (!isSelected) return;
  li.querySelector('.checkbox-unchecked').classList.add('d-none');
  li.querySelector('.checkbox-checked').classList.remove('d-none');
}


/**
 * Handles a click on a contact item: toggles selection and re-renders the UI.
 *
 * @param {Event} e - The click event object.
 * @param {Object} contact - The contact object.
 * @param {string} fullName - The contact's full name string.
 * @param {boolean} isSelected - The selection state at render time.
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function onContactItemClick(e, contact, fullName, isSelected, dialogRef) {
  e.stopPropagation();
  toggleContactSelection(contact, fullName, isSelected);
  renderEditContactsDropdown(dialogRef);
  updateAvatarsContainer(dialogRef);
}


/**
 * Checks if a specific contact is currently selected.
 *
 * @param {Object} contact - The contact object.
 * @param {string} fullName - The full name of the contact.
 * @returns {boolean} True if the contact is selected, otherwise false.
 */
function isContactSelected(contact, fullName) {
  return editSelectedContacts.some(
    (c) => (c.id && c.id === contact.id) || (typeof c === 'string' && c === fullName),
  );
}


/**
 * Adds or removes a contact from the selected contacts array.
 *
 * @param {Object} contact - The contact object.
 * @param {string} fullName - The full name of the contact.
 * @param {boolean} isSelected - The current selection state.
 */
function toggleContactSelection(contact, fullName, isSelected) {
  if (isSelected) {
    editSelectedContacts = editSelectedContacts.filter(
      (c) => !(c.id === contact.id || c === fullName),
    );
  } else {
    editSelectedContacts.push(contact);
  }
}


/**
 * Updates the container showing the selected contact avatars.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function updateAvatarsContainer(dialogRef) {
  const avatarsContainer = dialogRef.querySelector('#edit-assigned-avatars');
  if (avatarsContainer) avatarsContainer.innerHTML = renderAvatarsForEdit(editSelectedContacts);
}


/**
 * Binds the submit event to save the edited task data after manual validation.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 * @param {Object} task - The original task object.
 */
function setupFormSubmit(dialogRef, task) {
  const form = dialogRef.querySelector('#edit-task-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateEditForm(dialogRef)) return;
    disableSaveButton(dialogRef);
    await performTaskUpdate(dialogRef, task);
  });
}


/**
 * Disables the save button to prevent double-submission during the Firestore call.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function disableSaveButton(dialogRef) {
  const btn = dialogRef.querySelector('#btn-edit-save');
  if (btn) btn.disabled = true;
}


/**
 * Runs manual validation on the edit form. Title is required.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 * @returns {boolean} True when the form is valid.
 */
function validateEditForm(dialogRef) {
  const titleInput = dialogRef.querySelector('#edit-task-title');
  const errorEl = dialogRef.querySelector('#edit-error-title');
  if (titleInput.value.trim() === '') {
    errorEl.classList.remove('d-none');
    titleInput.classList.add('was-submitted-custom');
    return false;
  }
  errorEl.classList.add('d-none');
  titleInput.classList.remove('was-submitted-custom');
  return true;
}


/**
 * Reads the three date fields and returns the DD/MM/YYYY string written to Firestore.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 * @returns {string} The formatted DD/MM/YYYY date string.
 */
function readDateFromForm(dialogRef) {
  const d = dialogRef.querySelector('#edit-date-day').value;
  const m = dialogRef.querySelector('#edit-date-month').value;
  const y = dialogRef.querySelector('#edit-date-year').value;
  return `${d}/${m}/${y}`;
}


/**
 * Constructs the updated task object and saves it to the backend.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 * @param {Object} task - The original task object.
 */
async function performTaskUpdate(dialogRef, task) {
  const updatedTask = {
    ...task,
    title: dialogRef.querySelector('#edit-task-title').value,
    description: dialogRef.querySelector('#edit-task-description').value,
    date: readDateFromForm(dialogRef),
    prio: currentPrio,
    assigned_to: editSelectedContacts,
    subtasks: getEditedSubtasks(),
  };
  await updateTask(currentEditTaskId, updatedTask);
  finalizeTaskUpdate();
}


/**
 * Closes the modal and re-renders the board after a successful update.
 */
async function finalizeTaskUpdate() {
  closeEditModal();
  if (typeof window.renderBoard === 'function') await window.renderBoard();
  else location.reload();
}

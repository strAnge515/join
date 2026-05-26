import { getBoardEditTemplate, getDropdownTemplate, renderAvatarsForEdit } from './tasks-template.js';
import { loadAndPrepareContacts } from './contacts-render.js';
import { updateTask } from './backend-tasks.js';

let currentEditTaskId = null;
let currentPrio = 'medium';
let editSelectedContacts = [];
let allContacts = [];
let editSubtasks = [];

/**
 * Closes the edit task modal and resets the scroll behavior.
 */
function closeEditModal() {
  const dialogRef = document.getElementById('taskModal');
  if (dialogRef) {
    document.body.classList.remove('no-scroll');
    dialogRef.close();
    dialogRef.innerHTML = '';
  }
}

/**
 * Opens the edit modal for a specific task and initializes all components.
 * * @param {string} taskId - The unique identifier of the task.
 */
window.openEditTask = async function(taskId) {
  const allTasks = window.allTasks || [];
  const task = allTasks.find((t) => t.id === taskId);
  if (!task) return;
  currentEditTaskId = taskId;
  currentPrio = task.prio || 'medium';
  editSelectedContacts = [...(task.assigned_to || [])];
  editSubtasks = [...(task.subtasks || [])];
  renderModalContent(task);
};

/**
 * Renders the modal content and sets up event listeners.
 * * @param {Object} task - The task object containing current data.
 */
async function renderModalContent(task) {
  const dialogRef = document.getElementById('taskModal');
  dialogRef.innerHTML = getBoardEditTemplate(task);
  const closeBtn = dialogRef.querySelector('#edit-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeEditModal);
  setupPriorityButtons(dialogRef);
  setupDateInput(dialogRef);
  await setupContactsDropdown(dialogRef);
  setupSubtasks(dialogRef);
  setupFormSubmit(dialogRef, task);
}

/**
 * Initializes the custom date input fields and the native picker sync.
 * * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function setupDateInput(dialogRef) {
  const dayIn = dialogRef.querySelector('#edit-date-day');
  const monthIn = dialogRef.querySelector('#edit-date-month');
  const yearIn = dialogRef.querySelector('#edit-date-year');
  const picker = dialogRef.querySelector('#edit-date-input');
  const svg = dialogRef.querySelector('#edit-event-svg');
  if (!svg || !picker) return;
  svg.addEventListener('click', () => {
    if (typeof picker.showPicker === 'function') picker.showPicker();
  });
  picker.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val) {
      const [y, m, d] = val.split('-');
      if (dayIn) dayIn.value = d;
      if (monthIn) monthIn.value = m;
      if (yearIn) yearIn.value = y;
    }
  });
}

/**
 * Sets up click listeners for the priority buttons.
 * * @param {HTMLElement} dialogRef - The reference to the modal dialog.
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
 * * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
async function setupContactsDropdown(dialogRef) {
  try {
    allContacts = await loadAndPrepareContacts();
  } catch (e) {
    console.error('Fehler beim Laden der Kontakte:', e);
  }
  const toggleBtn = dialogRef.querySelector('#edit-assigned-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => toggleDropdownVisibility(e, dialogRef));
    document.addEventListener('click', (e) => handleOutsideClick(e, dialogRef));
  }
  updateAvatarsContainer(dialogRef);
}

/**
 * Toggles the visibility of the contacts dropdown list.
 * * @param {Event} e - The click event object.
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
  if (!optionsContainer.classList.contains('d-none')) {
    renderEditContactsDropdown(dialogRef);
  }
}

/**
 * Closes the dropdown if the user clicks outside of it.
 * * @param {Event} e - The click event object.
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function handleOutsideClick(e, dialogRef) {
  const optionsContainer = dialogRef.querySelector('#edit-assigned-options');
  const toggleBtn = dialogRef.querySelector('#edit-assigned-toggle');
  if (optionsContainer && !optionsContainer.contains(e.target) && !toggleBtn.contains(e.target)) {
    optionsContainer.classList.add('d-none');
    dialogRef.querySelector('#edit-arrow-down').classList.remove('d-none');
    dialogRef.querySelector('#edit-arrow-up').classList.add('d-none');
  }
}

/**
 * Renders the list of contacts inside the dropdown menu.
 * * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function renderEditContactsDropdown(dialogRef) {
  const optionsContainer = dialogRef.querySelector('#edit-assigned-options');
  if (!optionsContainer) return;
  optionsContainer.innerHTML = '';
  allContacts.forEach((contact) => {
    const li = createContactListItem(contact, dialogRef);
    optionsContainer.appendChild(li);
  });
}

/**
 * Creates a single list item for a contact in the dropdown.
 * * @param {Object} contact - The contact object.
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 * @returns {HTMLElement} The created list item element.
 */
function createContactListItem(contact, dialogRef) {
  const fullName = `${contact.firstName} ${contact.lastName}`;
  const isSelected = isContactSelected(contact, fullName);
  const initials = fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  const li = document.createElement('li');
  li.className = `assigned-option ${isSelected ? 'selected' : ''}`;
  li.innerHTML = getDropdownTemplate(contact, initials);
  if (isSelected) {
    li.querySelector('.checkbox-unchecked').classList.add('d-none');
    li.querySelector('.checkbox-checked').classList.remove('d-none');
  }
  li.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleContactSelection(contact, fullName, isSelected);
    renderEditContactsDropdown(dialogRef);
    updateAvatarsContainer(dialogRef);
  });
  return li;
}

/**
 * Checks if a specific contact is currently selected.
 * * @param {Object} contact - The contact object.
 * @param {string} fullName - The full name of the contact.
 * @returns {boolean} True if the contact is selected, otherwise false.
 */
function isContactSelected(contact, fullName) {
  return editSelectedContacts.some(
    (c) => (c.id && c.id === contact.id) || (typeof c === 'string' && c === fullName)
  );
}

/**
 * Adds or removes a contact from the selected contacts array.
 * * @param {Object} contact - The contact object.
 * @param {string} fullName - The full name of the contact.
 * @param {boolean} isSelected - Current selection state.
 */
function toggleContactSelection(contact, fullName, isSelected) {
  if (isSelected) {
    editSelectedContacts = editSelectedContacts.filter((c) => !(c.id === contact.id || c === fullName));
  } else {
    editSelectedContacts.push(contact);
  }
}

/**
 * Updates the container showing the selected contact avatars.
 * * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function updateAvatarsContainer(dialogRef) {
  const avatarsContainer = dialogRef.querySelector('#edit-assigned-avatars');
  if (avatarsContainer) {
    avatarsContainer.innerHTML = renderAvatarsForEdit(editSelectedContacts);
  }
}

/**
 * Initializes the subtasks input field and related buttons.
 * * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function setupSubtasks(dialogRef) {
  const subtaskInput = dialogRef.querySelector('#edit-subtask-input');
  const addBtn = dialogRef.querySelector('#edit-subtask-add');
  const clearBtn = dialogRef.querySelector('#edit-subtask-clear');
  if (subtaskInput) {
    subtaskInput.addEventListener('input', () => handleSubtaskInput(dialogRef));
    subtaskInput.addEventListener('keydown', (e) => handleSubtaskKeydown(e, dialogRef));
  }
  if (addBtn) addBtn.addEventListener('click', () => addEditSubtask(dialogRef));
  if (clearBtn) clearBtn.addEventListener('click', () => clearEditSubtaskInput(dialogRef));
  renderEditSubtasks(dialogRef);
}

/**
 * Toggles the visibility of subtask action buttons based on input value.
 * * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function handleSubtaskInput(dialogRef) {
  const input = dialogRef.querySelector('#edit-subtask-input');
  const actions = dialogRef.querySelector('#edit-subtask-actions');
  if (input.value.trim().length > 0) {
    actions.classList.remove('d-none');
  } else {
    actions.classList.add('d-none');
  }
}

/**
 * Allows adding a subtask by pressing the Enter key.
 * * @param {KeyboardEvent} e - The keyboard event object.
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function handleSubtaskKeydown(e, dialogRef) {
  if (e.key === 'Enter') {
    e.preventDefault();
    addEditSubtask(dialogRef);
  }
}

/**
 * Adds a new subtask to the array and updates the list view.
 * * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function addEditSubtask(dialogRef) {
  const input = dialogRef.querySelector('#edit-subtask-input');
  const val = input.value.trim();
  if (val) {
    editSubtasks.push({ title: val, state: false });
    clearEditSubtaskInput(dialogRef);
    renderEditSubtasks(dialogRef);
  }
}

/**
 * Clears the subtask input field and resets the button visibility.
 * * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function clearEditSubtaskInput(dialogRef) {
  const input = dialogRef.querySelector('#edit-subtask-input');
  if (input) {
    input.value = '';
    handleSubtaskInput(dialogRef);
  }
}

/**
 * Renders the current list of subtasks in the modal.
 * * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function renderEditSubtasks(dialogRef) {
  const subtaskList = dialogRef.querySelector('#edit-subtask-list');
  if (!subtaskList) return;
  subtaskList.innerHTML = '';
  editSubtasks.forEach((st, idx) => {
    const li = createSubtaskListItem(st, idx, dialogRef);
    subtaskList.appendChild(li);
  });
}

/**
 * Creates a single list item element for a subtask.
 * * @param {Object} st - The subtask object.
 * @param {number} idx - The index of the subtask in the array.
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 * @returns {HTMLElement} The created list item element.
 */
function createSubtaskListItem(st, idx, dialogRef) {
  const li = document.createElement('li');
  li.className = 'subtask-item';
  li.innerHTML = `
    <span style="font-size:16px; word-break: break-word; flex:1;">• ${st.title}</span>
    <button type="button" class="delete-st-btn" style="background:none; border:none; cursor:pointer; display:flex; align-items:center;">
       <img src="../assets/img/Property 1=delete.svg" alt="delete" style="width:16px; height:16px;">
    </button>
  `;
  li.querySelector('.delete-st-btn').addEventListener('click', () => {
    editSubtasks.splice(idx, 1);
    renderEditSubtasks(dialogRef);
  });
  return li;
}

/**
 * Binds the submit event to save the edited task data.
 * * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 * @param {Object} task - The original task object.
 */
function setupFormSubmit(dialogRef, task) {
  const form = dialogRef.querySelector('#edit-task-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      disableSaveButton(dialogRef);
      await performTaskUpdate(dialogRef, task);
    });
  }
}

/**
 * Disables the save button to prevent multiple submissions.
 * * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
function disableSaveButton(dialogRef) {
  const btn = dialogRef.querySelector('#btn-edit-save');
  if (btn) btn.disabled = true;
}

/**
 * Constructs the updated task object and saves it to the backend.
 * * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 * @param {Object} task - The original task object.
 */
async function performTaskUpdate(dialogRef, task) {
  const d = dialogRef.querySelector('#edit-date-day').value;
  const m = dialogRef.querySelector('#edit-date-month').value;
  const y = dialogRef.querySelector('#edit-date-year').value;
  const formattedDate = `${d}/${m}/${y}`;
  const updatedTask = {
    ...task,
    title: dialogRef.querySelector('#edit-task-title').value,
    description: dialogRef.querySelector('#edit-task-description').value,
    date: formattedDate,
    prio: currentPrio,
    assigned_to: editSelectedContacts,
    subtasks: editSubtasks,
  };
  await updateTask(currentEditTaskId, updatedTask);
  finalizeTaskUpdate();
}

/**
 * Closes the modal and re-renders the board after a successful update.
 */
async function finalizeTaskUpdate() {
  closeEditModal();
  if (typeof window.renderBoard === 'function') {
    await window.renderBoard();
  } else {
    location.reload();
  }
}
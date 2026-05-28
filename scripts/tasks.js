import { saveTask } from './backend-tasks.js';
import { loadAndPrepareContacts } from './contacts-render.js';
import { getSubtaskTemplate, getEditTemplate, getDropdownTemplate } from './tasks-template.js';
import { initDate, dateFocusBehavior, dateDeleteBehavior, dateOnlyNumbers, insertDate, validateInputDate } from './tasks-date.js';
import { dateInputContainer, errorTextDate } from './tasks-date.js';
import { subtaskList, subtaskInput } from './tasks-subtask.js';
import { renderAssignedDropdown, clearAssignedContacts, filterContacts } from './tasks-contacts.js';
import { assignedOptions, assignedToggle, arrowDownAssigned, arrowUpAssigned, assignedPlaceholder, assignedAvatars, getSelectedContacts } from './tasks-contacts.js';

const taskTitleInput = document.getElementById('task-title');
const errorTextTitle = document.getElementById('error-text-title');

const textarea = document.getElementById('task-description');

const selectCategoryButton = document.getElementById('selected-category');
const dropdownOptions = document.querySelectorAll('.dropdown-option');
const dropdownOptionsContainer = document.getElementById('category-options');
const errorTextCategory = document.getElementById('error-text-category');

const taskForm = document.getElementById('task-form');

const handle = document.getElementById('resize');
let isResizing = false;
let startY = 0;
let startHeight = 0;

/**
 * Initializes the task form by setting up all event listeners and rendering components.
 *
 * @returns {void}
 */
function init() {
  initDate();
  addTask();
  setPriorityButtons();
  renderAssignedDropdown();
  initDropdownsEventlistener();
  initResizeHandle();
  initFormValidation();
  initErrorRemoval();
  dateFocusBehavior();
  dateDeleteBehavior();
  dateOnlyNumbers();
}

/**
 * Registers the submit event listener on the task form.
 * Validates all inputs, collects the form data, creates a task object,
 * saves it to the backend, shows the success dialog,
 * then closes the dialog, resets the form and re-renders the board.
 */
function addTask() {
  taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateInputDate() || !validateInputCategory() || !validateInputTitle()) return;
    let informartionsFromInput = addInformations();
    let object = createTaskObjekt(informartionsFromInput);
    await saveTask(object);
    document.getElementById('subtask-added').showModal();
    setTimeout(async () => {
      document.getElementById('subtask-added').close();

      const dialog = document.getElementById('addTaskDialog');
      if (dialog) dialog.close();

      clearTask();

      if (window.renderBoard) {
        await window.renderBoard();
      } else {
        window.location.href = 'board.html';
      }
    },
      900);
  });
}

/**
 * Reads all current form values and returns them as a plain object.
 *
 * @returns {{taskTitle: string, tastkDescription: string, taskCategory: string, taskDate: string, taskPrio: string, contact: string[], subtasks: HTMLElement[]}}
 */
function addInformations() {
  let taskTitle = taskTitleInput.value;
  let tastkDescription = textarea.value;
  let taskCategory = selectCategoryButton.dataset.value;
  let taskDate = insertDate();
  let taskPrio = document.querySelector('[class*="selected-"]').dataset.prio;
  let contact = getSelectedContacts().map((contact) => ({
    firstName: contact.firstName,
    lastName: contact.lastName,
    id: contact.id,
  })); let subtasks = Array.from(subtaskList.querySelectorAll('li'));
  /* prettier-ignore */
  return { taskTitle, tastkDescription, taskCategory, taskDate, taskPrio, contact, subtasks };
}

/**
 * Transforms the raw form data into a structured task object for the database.
 *
 * @param {Object} data - The raw form data from addInformations().
 * @returns {{title: string, description: string, category: string, status: string, assigned_to: string[], date: string, prio: string, subtasks: {title: string, state: boolean}[]}}
 */
function createTaskObjekt(data) {
  return {
    title: data.taskTitle,
    description: data.tastkDescription,
    category: data.taskCategory,
    status: window.selectedBoardStatus || 'to do',
    assigned_to: data.contact,
    date: data.taskDate,
    prio: data.taskPrio,
    subtasks: data.subtasks.map((subtask) => ({
      title: subtask.querySelector('span').textContent,
      state: false,
    })),
  };
}

/**
 * Sets up click listeners on all priority buttons.
 * Removes all active classes and applies the correct one for the clicked button.
 *
 * @returns {void}
 */
function setPriorityButtons() {
  const activeButton = document.querySelectorAll('.prio-btn');
  activeButton.forEach((button) => {
    button.addEventListener('click', () => {
      activeButton.forEach((button) => {
        button.classList.remove('selected-urgent', 'selected-medium', 'selected-low');
      });
      button.classList.add('selected-' + button.dataset.prio);
    });
  });
}

/**
 * Sets up click listeners on all category dropdown options.
 * Updates the displayed category and closes the dropdown after selection.
 *
 * @returns {void}
 */
dropdownOptions.forEach((button) => {
  button.addEventListener('click', (event) => {
    selectCategoryButton.querySelector('p').textContent = event.currentTarget.textContent;
    selectCategoryButton.dataset.value = event.currentTarget.value;
    document.getElementById('category-hidden').value = event.currentTarget.value;
    dropdownOptionsContainer.classList.add('d-none');
    document.getElementById('arrow-down-category').classList.remove('d-none');
    document.getElementById('arrow-up-category').classList.add('d-none');
    selectCategoryButton.classList.remove('open');
  });
});

/**
 * Initializes all dropdown-related event listeners.
 *
 * @returns {void}
 */
function initDropdownsEventlistener() {
  toggleAssignedDropdown();
  toggleCategoryDropdown();
  stopAssignedInputBubbling();
  dropDownCloseListener();
}

/**
 * Closes the assigned-to dropdown when clicking outside of it.
 *
 * @returns {void}
 */
function dropDownCloseListener() {
  const dropdownContainer = document.querySelector('.assigned-dropdown');
  document.addEventListener('click', (event) => {
    if (!dropdownContainer.contains(event.target)) {
      assignedOptions.classList.add('d-none');
      arrowDownAssigned.classList.remove('d-none');
      arrowUpAssigned.classList.add('d-none');
      assignedToggle.classList.remove('open');
    }
  });
}

/**
 * Toggles the assigned-to dropdown open or closed on click.
 *
 * @returns {void}
 */
function toggleAssignedDropdown() {
  assignedToggle.addEventListener('click', () => {
    assignedOptions.classList.toggle('d-none');
    arrowDownAssigned.classList.toggle('d-none');
    arrowUpAssigned.classList.toggle('d-none');
    assignedToggle.classList.toggle('open');
  });
}

/**
 * Toggles the category dropdown open or closed on click.
 *
 * @returns {void}
 */
function toggleCategoryDropdown() {
  selectCategoryButton.addEventListener('click', () => {
    dropdownOptionsContainer.classList.toggle('d-none');
    document.getElementById('arrow-down-category').classList.toggle('d-none');
    document.getElementById('arrow-up-category').classList.toggle('d-none');
    selectCategoryButton.classList.toggle('open');
  });
}

/**
 * Prevents click events on the search input from bubbling to the toggle.
 * Also registers the input filter listener.
 *
 * @returns {void}
 */
function stopAssignedInputBubbling() {
  assignedPlaceholder.addEventListener('click', (event) => {
    assignedOptions.classList.toggle('d-none');
    arrowDownAssigned.classList.toggle('d-none');
    arrowUpAssigned.classList.toggle('d-none');
    assignedToggle.classList.toggle('open');
    event.stopPropagation();
  });
  assignedPlaceholder.addEventListener('input', filterContacts);
}

/**
 * Registers the click listener on the submit button to trigger all validations.
 *
 * @returns {void}
 */
function initFormValidation() {
  let taskButton = document.getElementById('btn-create');
  taskButton.addEventListener('click', () => {
    taskForm.classList.add('was-submitted');
    validateInputDate();
    validateInputCategory();
    validateInputTitle();
  });
}

/**
 * Initializes all three resize handle mouse event listeners.
 *
 * @returns {void}
 */
function initResizeHandle() {
  resizeHandleMouseDown();
  resizeHandleMouseMove();
  resizeHandleMouseUp();
}

/**
 * Starts the resize process on mousedown, storing the start position and height.
 *
 * @returns {void}
 */
function resizeHandleMouseDown() {
  handle.addEventListener('mousedown', (event) => {
    event.preventDefault();
    isResizing = true;
    startY = event.clientY;
    startHeight = textarea.offsetHeight;
  });
}

/**
 * Adjusts the textarea height while the mouse is being dragged.
 *
 * @returns {void}
 */
function resizeHandleMouseMove() {
  document.addEventListener('mousemove', (event) => {
    if (!isResizing) return;
    const deltaY = event.clientY - startY;
    const newHeight = startHeight + deltaY;
    textarea.style.height = newHeight + 'px';
  });
}

/**
 * Ends the resize process when the mouse button is released.
 *
 * @returns {void}
 */
function resizeHandleMouseUp() {
  document.addEventListener('mouseup', () => {
    isResizing = false;
  });
}

/**
 * Validates the title input field.
 * Shows an error message if the field is empty.
 *
 * @returns {boolean} True if valid, false if empty.
 */
function validateInputTitle() {
  if (taskTitleInput.value === '') {
    taskTitleInput.classList.add('was-submitted-custom');
    errorTextTitle.classList.remove('d-none');
    return false;
  } else {
    taskTitleInput.classList.remove('was-submitted-custom');
    errorTextTitle.classList.add('d-none');
    return true;
  }
}

/**
 * Validates the category dropdown.
 * Shows an error message if no category has been selected.
 *
 * @returns {boolean} True if a category is selected, false otherwise.
 */
function validateInputCategory() {
  let selectedCategory = selectCategoryButton.dataset.value;
  if (selectedCategory === '') {
    selectCategoryButton.classList.add('was-submitted-custom');
    errorTextCategory.classList.remove('d-none');
    return false;
  } else {
    selectCategoryButton.classList.remove('was-submitted-custom');
    errorTextCategory.classList.add('d-none');
    return true;
  }
}

/**
 * Removes error styling from all validated fields when they receive focus again.
 *
 * @returns {void}
 */
function initErrorRemoval() {
  dateInputContainer.addEventListener('focus', () => {
    dateInputContainer.classList.remove('was-submitted-custom');
    errorTextDate.classList.add('d-none');
  });
  selectCategoryButton.addEventListener('focus', () => {
    selectCategoryButton.classList.remove('was-submitted-custom');
    errorTextCategory.classList.add('d-none');
  });
  taskTitleInput.addEventListener('focus', () => {
    taskTitleInput.classList.remove('was-submitted-custom');
    errorTextTitle.classList.add('d-none');
  });
}

/**
 * Resets the entire task form back to its initial state.
 *
 * @returns {void}
 */
function clearTask() {
  taskTitleInput.value = '';
  textarea.value = '';
  document.querySelectorAll('.date-input-field').forEach((input) => (input.value = ''));
  document.querySelectorAll('.prio-btn').forEach((btn) => btn.classList.remove('selected-urgent', 'selected-medium', 'selected-low'));
  document.querySelector('.prio-btn--medium').classList.add('selected-medium');
  subtaskInput.value = '';
  subtaskList.innerHTML = '';
  selectCategoryButton.querySelector('p').textContent = 'Select task category';
  selectCategoryButton.dataset.value = '';
  clearAssignedContacts();
}

document.getElementById('btn-clear').addEventListener('click', clearTask);

document.addEventListener('DOMContentLoaded', init);

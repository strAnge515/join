import { saveTask } from './backend-tasks.js';
import { loadAndPrepareContacts } from './contacts-render.js';
import {
  getSubtaskTemplate,
  getEditTemplate,
  getDropdownTemplate,
} from './tasks-template.js';
import {
  initDate,
  dateFocusBehavior,
  dateDeleteBehavior,
  dateBlurBehavior,
  dateOnlyNumbers,
  insertDate,
  validateInputDate,
} from './tasks-date.js';
import { dateInputContainer, errorTextDate } from './tasks-date.js';
import { subtaskList, subtaskInput } from './tasks-subtask.js';
import {
  renderAssignedDropdown,
  clearAssignedContacts,
  filterContacts,
} from './tasks-contacts.js';
import {
  assignedOptions,
  assignedToggle,
  arrowDownAssigned,
  arrowUpAssigned,
  assignedPlaceholder,
  assignedAvatars,
  getSelectedContacts,
} from './tasks-contacts.js';
import { initResizeHandle } from './tasks-resize.js';

const taskTitleInput = document.getElementById('task-title');
const errorTextTitle = document.getElementById('error-text-title');

const textarea = document.getElementById('task-description');

const selectCategoryButton = document.getElementById('selected-category');
const dropdownOptions = document.querySelectorAll('.dropdown-option');
const dropdownOptionsContainer = document.getElementById('category-options');
const errorTextCategory = document.getElementById('error-text-category');

const taskForm = document.getElementById('task-form');

const handle = document.getElementById('resize');

/**
 * Initializes the task form by setting up all event listeners and rendering components.
 *
 * @returns {void}
 */
function init() {
  taskForm.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') event.preventDefault();
  });
  initDate();
  addTask();
  setPriorityButtons();
  renderAssignedDropdown();
  initDropdownsEventlistener();
  initResizeHandle(handle, textarea);
  initFormValidation();
  initErrorRemoval();
  dateFocusBehavior();
  dateDeleteBehavior();
  dateOnlyNumbers();
  dateBlurBehavior();
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
    if (
      !validateInputDate() ||
      !validateInputCategory() ||
      !validateInputTitle()
    )
      return;
    let informartionsFromInput = addInformations();
    let object = createTaskObjekt(informartionsFromInput);
    await saveTask(object);
    document.getElementById('subtask-added').showModal();
    setTimeout(async () => {
      closeAndResetAfterSave();
    }, 900);
  });
}

/**
 * Closes the success dialog and the add task dialog,
 * resets the form and re-renders the board or redirects to it.
 */
async function closeAndResetAfterSave() {
  document.getElementById('subtask-added').close();
  const dialog = document.getElementById('addTaskDialog');
  if (dialog) dialog.close();
  document.body.style.overflow = '';
  clearTask();
  if (window.renderBoard) {
    await window.renderBoard();
  } else {
    window.location.href = 'board.html';
  }
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
    email: contact.email,
  }));
  let subtasks = Array.from(subtaskList.querySelectorAll('li'));
  return {
    taskTitle,
    tastkDescription,
    taskCategory,
    taskDate,
    taskPrio,
    contact,
    subtasks,
  };
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
        button.classList.remove(
          'selected-urgent',
          'selected-medium',
          'selected-low',
        );
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
    selectCategoryButton.querySelector('p').textContent =
      event.currentTarget.textContent;
    selectCategoryButton.dataset.value = event.currentTarget.value;
    document.getElementById('category-hidden').value =
      event.currentTarget.value;
    dropdownOptionsContainer.classList.add('d-none');
    document.getElementById('arrow-down-category').classList.remove('d-none');
    document.getElementById('arrow-up-category').classList.add('d-none');
    selectCategoryButton.classList.remove('open');
    selectCategoryButton.focus();
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
  categoryCloseListener();
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
 * Closes the category dropdown when clicking outside of it.
 * Validates the category if the dropdown was open before closing.
 *
 * @returns {void}
 */
function categoryCloseListener() {
  document.addEventListener('click', (event) => {
    if (!selectCategoryButton.contains(event.target)) {
      if (selectCategoryButton.classList.contains('open')) {
        validateInputCategory();
      }
      dropdownOptionsContainer.classList.add('d-none');
      document.getElementById('arrow-down-category').classList.remove('d-none');
      document.getElementById('arrow-up-category').classList.add('d-none');
      selectCategoryButton.classList.remove('open');
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
    if (!selectCategoryButton.classList.contains('open')) {
      selectCategoryButton.blur();
    }
    selectCategoryButton.classList.remove('was-submitted-custom');
    errorTextCategory.classList.add('d-none');
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
 * Validates the title input field.
 * Shows an error message if the field is empty.
 *
 * @returns {boolean} True if valid, false if empty.
 */
function validateInputTitle() {
  if (taskTitleInput.value.trim() === '') {
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
 * Validates the title input field when it loses focus.
 */
taskTitleInput.addEventListener('blur', validateInputTitle);

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
function clearCategory() {
  selectCategoryButton.querySelector('p').textContent = 'Select task category';
  selectCategoryButton.dataset.value = '';
  selectCategoryButton.classList.remove('open');
  dropdownOptionsContainer.classList.add('d-none');
  document.getElementById('arrow-down-category').classList.remove('d-none');
  document.getElementById('arrow-up-category').classList.add('d-none');
}

/**
 * Removes the errormessages from the inputfields.
 *
 * @returns {void}
 */

function removeErrorMessage() {
  errorTextTitle.classList.add('d-none');
  errorTextDate.classList.add('d-none');
  errorTextCategory.classList.add('d-none');
  taskTitleInput.classList.remove('was-submitted-custom');
  dateInputContainer.classList.remove('was-submitted-custom');
  selectCategoryButton.classList.remove('was-submitted-custom');
}

/**
 * Resets the entire task form back to its initial state.
 *
 * @returns {void}
 */
export function clearTask() {
  taskTitleInput.value = '';
  textarea.value = '';
  document
    .querySelectorAll('.date-input-field')
    .forEach((input) => (input.value = ''));
  document
    .querySelectorAll('.prio-btn')
    .forEach((btn) =>
      btn.classList.remove(
        'selected-urgent',
        'selected-medium',
        'selected-low',
      ),
    );
  document.querySelector('.prio-btn--medium').classList.add('selected-medium');
  subtaskInput.value = '';
  subtaskList.innerHTML = '';
  clearCategory();
  clearAssignedContacts();
  removeErrorMessage();
}

document.getElementById('btn-clear').addEventListener('click', clearTask);

document.addEventListener('DOMContentLoaded', init);

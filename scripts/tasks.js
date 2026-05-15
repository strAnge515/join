import { saveTask } from './backend-tasks.js';
import { loadAndPrepareContacts } from './contacts-render.js';
import { getSubtaskTemplate, getEditTemplate, getDropdownTemplate } from './tasks-template.js';

const taskTitleInput = document.getElementById('task-title');
const errorTextTitle = document.getElementById('error-text-title');

const textarea = document.getElementById('task-description');

const dateInput = document.getElementById('date-input');
const dateInputContainer = document.getElementById('task-date');
const calendarIcon = document.querySelector('#task-date img');
const dateDay = document.getElementById('date-day');
const dateMonth = document.getElementById('date-month');
const dateYear = document.getElementById('date-year');
const errorTextDate = document.getElementById('error-text-date');

const selectCategoryButton = document.getElementById('selected-category');
const dropdownOptions = document.querySelectorAll('.dropdown-option');
const dropdownOptionsContainer = document.getElementById('category-options');
const errorTextCategory = document.getElementById('error-text-category');

const assignedOptions = document.getElementById('assigned-options');
const assignedToggle = document.getElementById('assigned-toggle');
const arrowDownAssigned = document.getElementById('arrow-down-assignet-to');
const arrowUpAssigned = document.getElementById('arrow-up-assigned-to');
const assignedPlaceholder = document.getElementById('assigned-placeholder');
const assignedAvatars = document.getElementById('assigned-avatars');
let selectedContacts = [];

const subtaskInput = document.getElementById('subtask-input');
const addButtonSubtask = document.getElementById('btn-add-subtask');
const deleteButtonSubtask = document.getElementById('btn-delete-subtask');
const subtaskButtonWrapper = document.getElementById('subtask-button-wrapper');
const subtaskList = document.getElementById('subtask-list');

const taskForm = document.getElementById('task-form');

const handle = document.getElementById('resize');
let isResizing = false;
let startY = 0;
let startHeight = 0;

function init() {
  dateInput.min = new Date().toISOString().split('T')[0];
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

function addTask() {
  taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateInputDate() || !validateInputCategory() || !validateInputTitle()) return;
    let informartionsFromInput = addInformations();
    let object = createTaskObjekt(informartionsFromInput);
    await saveTask(object);
    document.getElementById('subtask-added').showModal();
    setTimeout(() => {
      window.location.href = 'board.html';
    }, 900);
  });
}

function addInformations() {
  let taskTitle = taskTitleInput.value;
  let tastkDescription = textarea.value;
  let taskCategory = selectCategoryButton.dataset.value;
  let taskDate = insertDate();
  let taskPrio = document.querySelector('[class*="selected-"]').dataset.prio;
  let contact = selectedContacts.map((contact) => contact.name);
  let subtasks = Array.from(subtaskList.querySelectorAll('li'));
  /* prettier-ignore */
  return { taskTitle, tastkDescription, taskCategory, taskDate, taskPrio, contact, subtasks };
}

function createTaskObjekt(data) {
  return {
    title: data.taskTitle,
    description: data.tastkDescription,
    category: data.taskCategory,
    status: 'to do',
    assigned_to: data.contact,
    date: data.taskDate,
    prio: data.taskPrio,
    subtasks: data.subtasks.map((subtask) => ({
      title: subtask.querySelector('span').textContent,
      state: false,
    })),
  };
}

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

addButtonSubtask.addEventListener('mousedown', addSubtask);

function addSubtask() {
  const subtaskValue = subtaskInput.value;
  if (subtaskValue === '') return;
  const li = document.createElement('li');
  li.innerHTML = getSubtaskTemplate(subtaskValue);
  li.className = 'subtask-item';
  subtaskList.appendChild(li);
  addSubtaskEventListeners(li);
  subtaskInput.value = '';
}


function activateEditMode(li) {
  let subtaskText = li.querySelector('span').textContent;
  li.innerHTML = getEditTemplate(subtaskText);
  li.classList.add('is-editing');
  li.querySelector('.subtask-edit-value').focus();
  li.querySelector('.edit-delete-btn').addEventListener('click', () => li.remove());
  li.querySelector('.edit-confirm-btn').addEventListener('click', () => {
    subtaskText = li.querySelector('.subtask-edit-value').value;
    li.innerHTML = getSubtaskTemplate(subtaskText);
    li.classList.remove('is-editing');
    addSubtaskEventListeners(li);
  });
  editmodeConfirmListener(li);
}

function editmodeConfirmListener(li) {
  li.querySelector('.subtask-edit-value').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      li.querySelector('.edit-confirm-btn').click();
    }
  });
}

function addSubtaskEventListeners(li) {
  li.querySelector('.delete-btn').addEventListener('click', () => li.remove());
  li.querySelector('.edit-btn').addEventListener('click', () => activateEditMode(li));
  li.addEventListener('dblclick', () => activateEditMode(li));
}

addButtonSubtask.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    addSubtask();
    subtaskInput.value = '';
    subtaskInput.blur();
  }
});

subtaskInput.addEventListener('blur', () => {
  subtaskButtonWrapper.classList.remove('button-wrapper');
  subtaskButtonWrapper.classList.add('d-none');
});

subtaskInput.addEventListener('focus', () => {
  subtaskButtonWrapper.classList.remove('d-none');
  subtaskButtonWrapper.classList.add('button-wrapper');
});

subtaskInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addSubtask();
    subtaskInput.blur();
  }
});

deleteButtonSubtask.addEventListener('mousedown', () => {
  subtaskInput.value = '';
  subtaskInput.blur();
});

deleteButtonSubtask.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    subtaskInput.value = '';
    subtaskInput.blur();
  }
});

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

function filterContacts() {
  let registeredPersons = Array.from(document.querySelectorAll('.assigned-option'));
  let filterInput = assignedPlaceholder.value;
  for (let i = 0; i < registeredPersons.length; i++) {
    const person = registeredPersons[i];
    const personName = person.querySelector('span').textContent;
    if (personName.toLowerCase().includes(filterInput.toLowerCase())) {
      person.classList.remove('d-none');
    } else {
      person.classList.add('d-none');
    }
  }
}

async function renderAssignedDropdown() {
  const contacts = await loadAndPrepareContacts();
  assignedOptions.innerHTML = '';
  contacts.forEach((contact) => {
    const initials = contact.firstName[0] + contact.lastName[0];
    const li = document.createElement('li');
    li.className = 'assigned-option';
    li.innerHTML = getDropdownTemplate(contact, initials);
    li.addEventListener('click', () => toggleContact(li, contact));
    assignedOptions.appendChild(li);
  });
}

function toggleContact(li, contact) {
  const checkboxUnchecked = li.querySelector('.checkbox-unchecked');
  const checkboxChecked = li.querySelector('.checkbox-checked');
  const already = selectedContacts.find((currentContact) => currentContact.id === contact.id);
  if (already) {
    deselectContact(li, contact, checkboxUnchecked, checkboxChecked);
  } else {
    selectContact(li, contact, checkboxUnchecked, checkboxChecked);
  }
  renderSelectedAvatars();
}

function selectContact(li, contact, checkboxUnchecked, checkboxChecked) {
  selectedContacts.push(contact);
  checkboxUnchecked.classList.add('d-none');
  checkboxChecked.classList.remove('d-none');
  li.classList.add('selected');
}

function deselectContact(li, contact, checkboxUnchecked, checkboxChecked) {
  selectedContacts = selectedContacts.filter((currentContact) => currentContact.id !== contact.id);
  checkboxUnchecked.classList.remove('d-none');
  checkboxChecked.classList.add('d-none');
  li.classList.remove('selected');
}

function createAvatarElement(contact) {
  const initials = contact.firstName[0] + contact.lastName[0];
  const div = document.createElement('div');
  div.className = 'avatar';
  div.style.background = contact.color;
  div.textContent = initials;
  return div;
}

function createExtraAvatar(count) {
  const div = document.createElement('div');
  div.className = 'avatar avatar-extracount';
  div.textContent = '+' + count;
  return div;
}

function renderSelectedAvatars() {
  assignedAvatars.innerHTML = '';
  selectedContacts.slice(0, 3).forEach((contact) => {
    assignedAvatars.appendChild(createAvatarElement(contact));
  });
  if (selectedContacts.length > 3) {
    assignedAvatars.appendChild(createExtraAvatar(selectedContacts.length - 3));
  }
}

function initDropdownsEventlistener() {
  toggleAssignedDropdown();
  toggleCategoryDropdown();
  stopAssignedInputBubbling();
  dropDownCloseListener();
}

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

function toggleAssignedDropdown() {
  assignedToggle.addEventListener('click', () => {
    assignedOptions.classList.toggle('d-none');
    arrowDownAssigned.classList.toggle('d-none');
    arrowUpAssigned.classList.toggle('d-none');
    assignedToggle.classList.toggle('open');
  });
}

function toggleCategoryDropdown() {
  selectCategoryButton.addEventListener('click', () => {
    dropdownOptionsContainer.classList.toggle('d-none');
    document.getElementById('arrow-down-category').classList.toggle('d-none');
    document.getElementById('arrow-up-category').classList.toggle('d-none');
    selectCategoryButton.classList.toggle('open');
  });
}

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

function initFormValidation() {
  let taskButton = document.getElementById('btn-create');
  taskButton.addEventListener('click', () => {
    taskForm.classList.add('was-submitted');
    validateInputDate();
    validateInputCategory();
    validateInputTitle();
  });
}

function initResizeHandle() {
  resizeHandleMouseDown();
  resizeHandleMouseMove();
  resizeHandleMouseUp();
}

function resizeHandleMouseDown() {
  handle.addEventListener('mousedown', (event) => {
    event.preventDefault();
    isResizing = true;
    startY = event.clientY;
    startHeight = textarea.offsetHeight;
  });
}

function resizeHandleMouseMove() {
  document.addEventListener('mousemove', (event) => {
    if (!isResizing) return;
    const deltaY = event.clientY - startY;
    const newHeight = startHeight + deltaY;
    textarea.style.height = newHeight + 'px';
  });
}

function resizeHandleMouseUp() {
  document.addEventListener('mouseup', () => {
    isResizing = false;
  });
}

calendarIcon.addEventListener('click', () => {
  dateInput.showPicker();
});

dateInput.addEventListener('change', () => {
  let formatedDate = dateInput.value.split('-');
  const dateInputField = document.querySelectorAll('.date-input-field');
  dateInputField[0].value = formatedDate[2];
  dateInputField[1].value = formatedDate[1];
  dateInputField[2].value = formatedDate[0];
});

function insertDate() {
  const dateInputField = document.querySelectorAll('.date-input-field');
  const day = dateInputField[0].value;
  const month = dateInputField[1].value;
  const year = dateInputField[2].value;
  if (!day || !month || !year) return '';
  return `${year}-${month}-${day}`;
}

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

function showDateError() {
  dateInputContainer.classList.add('was-submitted-custom');
  errorTextDate.classList.remove('d-none');
  return false;
}

function hideDateError() {
  dateInputContainer.classList.remove('was-submitted-custom');
  errorTextDate.classList.add('d-none');
  return true;
}

function validateInputDate() {
  const dateInputField = document.querySelectorAll('.date-input-field');
  const day = dateInputField[0].value;
  const month = dateInputField[1].value;
  const year = dateInputField[2].value;
  if (!day || !month || !year) return showDateError();
  dateInput.value = `${year}-${month}-${day}`;
  if (!dateInput.validity.valid) return showDateError();
  return hideDateError();
}

function dateFocusBehavior() {
  dateDay.addEventListener('input', () => {
    if (dateDay.value.length === dateDay.maxLength) dateMonth.focus();
  });
  dateMonth.addEventListener('input', () => {
    if (dateMonth.value.length === dateMonth.maxLength) dateYear.focus();
  });
}

function dateDeleteBehavior() {
  dateYear.addEventListener('keydown', (event) => {
    if (dateYear.value === '' && event.key === 'Backspace') dateMonth.focus();
  });
  dateMonth.addEventListener('keydown', (event) => {
    if (dateMonth.value === '' && event.key === 'Backspace') dateDay.focus();
  });
}

function dateOnlyNumbers() {
  [dateDay, dateMonth, dateYear].forEach((input) => {
    input.addEventListener('keydown', (event) => {
      if (isNaN(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
        event.preventDefault();
      }
    });
  });
}

dateInputContainer.addEventListener('click', (event) => {
  dateDay.focus();
  if (event.target === dateMonth || event.target === dateYear) {
    event.target.focus();
  }
});

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

function clearAssignedContacts() {
  selectedContacts = [];
  assignedAvatars.innerHTML = '';
  assignedPlaceholder.value = '';
  document.querySelectorAll('.assigned-option').forEach((li) => {
    li.classList.remove('selected');
    li.querySelector('.checkbox-unchecked').classList.remove('d-none');
    li.querySelector('.checkbox-checked').classList.add('d-none');
  });
}

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
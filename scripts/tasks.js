import { saveTask } from './backend-tasks.js';
import { loadAndPrepareContacts } from './contacts.js';

const subtaskInput = document.getElementById('subtask-input');
const addButtonSubtask = document.getElementById('btn-add-subtask');
const deleteButtonSubtask = document.getElementById('btn-delete-subtask');
const subtaskButtonWrapper = document.getElementById('subtask-button-wrapper');
const selectCategoryButton = document.getElementById('selected-category');
const dropdownOptions = document.querySelectorAll('.dropdown-option');
const dropdownOptionsContainer = document.getElementById('category-options');
let selectedContacts = [];
const textarea = document.getElementById('task-description');
const handle = document.getElementById('resize');
const dateInput = document.getElementById('date-input');
const calendarIcon = document.querySelector('#task-date img');

let isResizing = false;
let startY = 0;
let startHeight = 0;

function init() {
  addTask();
  setPriorityButtons();
  renderAssignedDropdown();
  initAssignedDropdown();
  initResizeHandle();
}

function addTask() {
  let addButton = document.getElementById('btn-create');
  addButton.addEventListener('click', async () => {
    let informartionsFromInput = addInformations();
    let object = createTaskObjekt(informartionsFromInput);

    await saveTask(object);
  });
}

function addInformations() {
  let taskTitle = document.getElementById('task-title').value;
  let tastkDescription = document.getElementById('task-description').value;
  let taskCategory = document.getElementById('selected-category').dataset.value;
  let taskDate = insertDate();
  let taskPrio = document.querySelector('[class*="selected-"]').dataset.prio;
  let contact = selectedContacts.map((contact) => contact.name);
  let subtasks = Array.from(document.querySelectorAll('#subtask-list li'));
  console.log(taskDate);
  // prettier-ignore
  return {taskTitle, tastkDescription, taskCategory, taskDate, taskPrio, contact, subtasks,};
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
  const subtaskList = document.getElementById('subtask-list');
  if (subtaskValue === '') return;
  const li = document.createElement('li');
  li.innerHTML = getSubtaskTemplate(subtaskValue);
  subtaskList.appendChild(li);
  addSubtaskEventListeners(li);
  subtaskInput.value = '';
}

function getSubtaskTemplate(subtaskValue) {
  return `<span>${subtaskValue}</span>
                    <button class="edit-btn"><img src="../assets/img/Property 1=edit.svg" alt="editsymbol"></button>
                     <button class="delete-btn"><img src="../assets/img/Property 1=delete.svg" alt="deletesymbol"></button>`;
}

function getEditTemplate(subtaskText) {
  return `<input class="subtask-edit-value" type="text" value="${subtaskText}" />
             <button class="edit-delete-btn"><img src="../assets/img/Property 1=delete.svg" alt="deletesymbol"></button>
             <button class="edit-confirm-btn"><img src="../assets/img/Property 1=check.svg" alt="checkicon"></button>`;
}

function addSubtaskEventListeners(li) {
  let deleteBtn = li.querySelector('.delete-btn');
  let editBtn = li.querySelector('.edit-btn');
  deleteBtn.addEventListener('click', () => li.remove());
  editBtn.addEventListener('click', () => {
    let subtaskText = li.querySelector('span').textContent;
    li.innerHTML = getEditTemplate(subtaskText);
    li.querySelector('.edit-delete-btn').addEventListener('click', () => li.remove());
    li.querySelector('.edit-confirm-btn').addEventListener('click', () => {
      subtaskText = li.querySelector('.subtask-edit-value').value;
      li.innerHTML = getSubtaskTemplate(subtaskText);
      addSubtaskEventListeners(li);
    });
  });
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

selectCategoryButton.addEventListener('click', () => {
  dropdownOptionsContainer.classList.toggle('d-none');
});

dropdownOptions.forEach((button) => {
  button.addEventListener('click', (event) => {
    let selectedOption = document.getElementById('selected-category');
    selectCategoryButton.textContent = event.currentTarget.textContent;
    selectedOption.dataset.value = event.currentTarget.value;
    dropdownOptionsContainer.classList.toggle('d-none');
  });
});

async function renderAssignedDropdown() {
  const contacts = await loadAndPrepareContacts();
  const list = document.getElementById('assigned-options');
  list.innerHTML = '';
  contacts.forEach((contact) => {
    const initials = contact.firstName[0] + contact.lastName[0];
    const li = document.createElement('li');
    li.className = 'assigned-option';
    li.innerHTML = `
    <section class="assigned-to-contacts-wrapper">
    <div class="assigned-to-names">
      <div class="avatar-small" style="background:${contact.color}">${initials}</div>
      <span>${contact.firstName} ${contact.lastName}</span>
    </div>
      <input type="checkbox" value="${contact.id}">
    </section>
    `;
    li.addEventListener('click', () => toggleContact(li, contact));
    list.appendChild(li);
  });
}

function toggleContact(li, contact) {
  const checkbox = li.querySelector('input');
  const already = selectedContacts.find((c) => c.id === contact.id);
  if (already) {
    selectedContacts = selectedContacts.filter((c) => c.id !== contact.id);
    checkbox.checked = false;
    li.classList.remove('selected');
  } else {
    selectedContacts.push(contact);
    checkbox.checked = true;
    li.classList.add('selected');
  }
  renderSelectedAvatars();
}

function renderSelectedAvatars() {
  const container = document.getElementById('assigned-avatars');
  container.innerHTML = '';
  selectedContacts.forEach((contact) => {
    const initials = contact.firstName[0] + contact.lastName[0];
    const div = document.createElement('div');
    div.className = 'avatar-small';
    div.style.background = contact.color;
    div.textContent = initials;
    container.appendChild(div);
  });
}

function initAssignedDropdown() {
  document.getElementById('assigned-toggle').addEventListener('click', () => {
    document.getElementById('assigned-options').classList.toggle('d-none');
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
  let completeDate = `${dateInputField[0].value}/${dateInputField[1].value}/${dateInputField[2].value}`;
  console.log(completeDate);
  return completeDate;
}

document.addEventListener('DOMContentLoaded', init);

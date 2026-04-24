import { loadTasks, deleteTask } from './backend-tasks.js';

const columnTodo = document.getElementById('column-todo');
const columnInProgress = document.getElementById('column-inprogress');
const columnAwaiting = document.getElementById('column-awaiting');
const columnDone = document.getElementById('column-done');

initBoard();

async function initBoard() {
  await renderBoard();
}

async function renderBoard() {
  clearBoard();

  try {
    const tasks = await loadTasks();
    const safeTasks = tasks || [];

    safeTasks.forEach((task) => {
      const taskCard = createTaskCard(task);
      getColumnByCategory(task.category).appendChild(taskCard);
    });
  } catch (error) {
    console.error('Fehler beim Laden des Boards:', error);
  }
}

function clearBoard() {
  columnTodo.innerHTML = '';
  columnInProgress.innerHTML = '';
  columnAwaiting.innerHTML = '';
  columnDone.innerHTML = '';
}

function getColumnByCategory(category) {
  const normalized = normalize(category);

  if (normalized === 'to do' || normalized === 'todo') return columnTodo;
  if (normalized === 'in progress' || normalized === 'inprogress')
    return columnInProgress;
  if (normalized === 'awaiting feedback' || normalized === 'awaiting')
    return columnAwaiting;
  if (normalized === 'done') return columnDone;

  return columnTodo;
}

function createTaskCard(task) {
  const card = document.createElement('button');
  card.className = 'task-card';
  card.onclick = function () {
    openTaskCard(task);
  };

  const subtaskInfo = getSubtaskInfo(task.subtasks);
  const assignedUsers = Array.isArray(task.assigned_to) ? task.assigned_to : [];
  const priorityIcon = getPriorityIcon(task.prio);
  const categoryBadge = getCategoryBadge(task.category);

  card.innerHTML = `
    <span class="task-card__category" style="background:${categoryBadge.color}; color:${categoryBadge.textColor};">
      ${categoryBadge.label}
    </span>

    <h3 class="task-card__title">${escapeHtml(task.title || 'Untitled task')}</h3>

    <p class="task-card__description">${escapeHtml(task.description || 'No description')}</p>

    ${
      subtaskInfo.total > 0
        ? `
        <div class="task-card__progress">
          <div class="progress-bar">
            <div class="progress-bar__fill" style="width: ${subtaskInfo.percent}%"></div>
          </div>
          <span class="task-card__progress-label">${subtaskInfo.done}/${subtaskInfo.total} Done</span>
        </div>
      `
        : ''
    }

    <div class="task-card__footer">
      <div class="avatar-group">
        ${renderAssignedUsers(assignedUsers)}
      </div>

      <div class="task-card__actions">
        <span class="prio-icon">${priorityIcon}</span>
        <button class="task-delete-btn" type="button" title="Delete task">✕</button>
      </div>
    </div>
  `;

  const deleteButton = card.querySelector('.task-delete-btn');
  deleteButton.addEventListener('click', async () => {
    const confirmed = confirm(
      `Delete task "${task.title || 'Untitled task'}"?`,
    );
    if (!confirmed) return;

    try {
      await deleteTask(task.id);
      await renderBoard();
    } catch (error) {
      console.error('Fehler beim Löschen der Task:', error);
    }
  });

  return card;
}

function getSubtaskInfo(subtasks) {
  if (!Array.isArray(subtasks) || subtasks.length === 0) {
    return { total: 0, done: 0, percent: 0 };
  }

  const done = subtasks.filter((subtask) => subtask.state === true).length;
  const total = subtasks.length;
  const percent = Math.round((done / total) * 100);

  return { total, done, percent };
}

function renderAssignedUsers(users) {
  if (!users) return '';
  return users
    .map((user, index) => {
      const initials = getInitials(user);
      const color = getAvatarColor(index);
      return `<div class="avatar" style="background:${color};">${initials}</div>`;
    })
    .join('');
}

function getInitials(name) {
  return String(name || '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function getAvatarColor(index) {
  const colors = [
    '#29abe2',
    '#9b59b6',
    '#2ecc71',
    '#e67e22',
    '#e74c3c',
    '#607d8b',
    '#1565c0',
  ];

  return colors[index % colors.length];
}

function getPriorityIcon(prio) {
  const normalized = normalize(prio);

  if (normalized === 'urgent' || normalized === 'urgend') return '🔴';
  if (normalized === 'medium') return '🟡';
  if (normalized === 'low') return '🟢';

  return '⚪';
}

function getCategoryBadge(category) {
  const normalized = normalize(category);

  if (normalized === 'to do' || normalized === 'todo') {
    return { label: 'To do', color: '#ff7b00', textColor: '#ffffff' };
  }

  if (normalized === 'in progress' || normalized === 'inprogress') {
    return { label: 'In progress', color: '#e91e8c', textColor: '#ffffff' };
  }

  if (normalized === 'awaiting feedback' || normalized === 'awaiting') {
    return { label: 'Awaiting', color: '#00bcd4', textColor: '#ffffff' };
  }

  if (normalized === 'done') {
    return { label: 'Done', color: '#1565c0', textColor: '#ffffff' };
  }

  return { label: category || 'Task', color: '#2a3647', textColor: '#ffffff' };
}

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replaceAll('-', ' ')
    .replace(/\s+/g, ' ');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

//From here on: functions for opening and using the task card

// Generates the HTML for the task card modal based on the task data and category badge
function openTaskCard(task) {
  const categoryBadgeRef = getCategoryBadge(task.category);
  const dialogRef = document.getElementById('taskModal');
  document.body.classList.add('no-scroll');
  dialogRef.innerHTML = getTaskCardHTML(categoryBadgeRef, task);
  fillTaskCardInitials(task);
  fillTaskCardSubtasks(task);
  addTaskCardEventListeners();
  dialogRef.showModal();
}

//Fill the Initials of the assigned users in the task card modal
function fillTaskCardInitials(task) {
  const assignedListRef = document.getElementById('assignedList');
  if (!task.assigned_to || task.assigned_to.length === 0) {
    return;
  }
  for (let i = 0; i < task.assigned_to.length; i++) {
    const user = task.assigned_to[i];
    const initials = getInitials(user);
    const color = getAvatarColor(i);
    assignedListRef.innerHTML += getAssignedUsersHTML(color, initials, user);
  }
}

//Fill the subtasks of the task card modal
function fillTaskCardSubtasks(task) {
  const subtaskListRef = document.getElementById('subtaskList');
  if (!task.subtasks || task.subtasks.length === 0) {
    return;
  }
  for (let i = 0; i < task.subtasks.length; i++) {
    const subtask = task.subtasks[i];
    subtaskListRef.innerHTML += getSubtaskList(i, subtask);
  }
}

// Closes the task card modal when the close button is clicked
function closeModal() {
  const dialogRef = document.getElementById('taskModal');
  document.body.classList.remove('no-scroll');
  dialogRef.close();
}

// Adds event listeners to the close button and the modal background to allow closing the modal when clicking outside the content area or on the close button
function addTaskCardEventListeners() {
  const closeBtnRef = document.querySelector('.close');
  const dialogRef = document.getElementById('taskModal');
  if (closeBtnRef) {
    closeBtnRef.addEventListener('click', closeModal);
    dialogRef.addEventListener('click', (e) => {
      if (e.target === dialogRef) {
        closeModal();
      }
    });
  }
}

//copied from contacts.js, can be used for the slide-in animation of the task card modal
// Adds a slide-in animation to a container
function addSlideInAnimation(ref, time) {
  const element = document.querySelector(ref);
  setTimeout(() => {
    element.classList.add('slide-in');
  }, time);
}

// Removes the slide-in animation class from a container
function removeSlideInAnimation(ref, time) {
  const element = document.querySelector(ref);
  setTimeout(() => {
    element.classList.remove('slide-in');
  }, time);
}

/**
 * Returns the full HTML string for the task detail modal content.
 * @param {Object} categoryBadge - Badge config with color and label.
 * @param {Object} task - The task data object to display.
 * @returns {string} HTML string for the modal's inner content.
 */
function getTaskCardHTML(categoryBadge, task) {
  return `
    <div class="modal-content">
      <div class="modal-top">
        <span class="task-category" style="background:${categoryBadge.color}">${task.category || 'Task'}</span>
        <button class="close">
          <img class="close-icon" src="../assets/img/contacts/close.svg" alt="Close button">
        </button>
      </div>
      <h1 id="taskTitle">${task.title || 'Untitled task'}</h1>
      <p id="taskDescription" class="task-description">${task.description || 'No description'}</p>
      <div class="info">
        <div class="info-item">
          <h2>Due date:</h2>
          <p id="taskDate">${task.date || '—'}</p>
        </div>
        <div class="info-item">
          <h2>Priority:</h2>
          <p id="taskPrio">${task.prio || '—'} ${getPriorityIconForModal(task.prio)}</p>
        </div>
        <div class="info-item info-item--assigned">
          <h2>Assigned To:</h2>
          <div class="assigned-list" id="assignedList"></div>
        </div>
        <div class="info-item info-item--subtasks">
          <h2>Subtasks</h2>
          <div class="subtask-list" id="subtaskList"></div>
        </div>
      </div>
      <div class="actions">
        <button class="edit-btn" id="deleteTaskBtn" data-id="${task.id}">
          <div class="delete-icon"></div>
          Delete
        </button>
        <div class="edit-divider"></div>
        <button class="edit-btn" id="editTaskBtn" data-id="${task.id}">
          <div class="edit-icon"></div>
          Edit
        </button>
      </div>
    </div>
  `;
}

/**
 * Returns an img tag for the priority icon displayed in the modal.
 * @param {string} prio - The priority value (urgent, medium, low).
 * @returns {string} HTML img tag string or empty string if unrecognized.
 */
function getPriorityIconForModal(prio) {
  const normalized = String(prio || '')
    .trim()
    .toLowerCase();
  if (normalized === 'urgent')
    return '<img src="../assets/img/Property 1=Urgent.svg" alt="urgent" class="prio-icon-modal">';
  if (normalized === 'medium')
    return '<img src="../assets/img/Property 1=Medium.svg" alt="medium" class="prio-icon-modal">';
  if (normalized === 'low')
    return '<img src="../assets/img/Property 1=Low.svg" alt="low" class="prio-icon-modal">';
  return '';
}

/**
 * Returns the HTML for a single subtask item with a custom SVG checkbox.
 * @param {Object} subtask - Subtask object with title and state.
 * @param {string} taskId - The Firebase ID of the parent task.
 * @param {number} index - The index of the subtask in the array.
 * @returns {string} HTML string for a single subtask item.
 */
function getSubtaskItemHTML(subtask, taskId, index) {
  return `
    <div class="subtask-item">
      <input
        type="checkbox"
        id="subtask-${taskId}-${index}"
        class="custom-checkbox modal-subtask-checkbox"
        data-index="${index}"
        ${subtask.state === true ? 'checked' : ''}
      />
      <label class="subtask-label" for="subtask-${taskId}-${index}">${subtask.title}</label>
    </div>
  `;
}

/**
 * Returns the HTML for the empty subtask placeholder.
 * @returns {string} HTML string for the empty subtask state.
 */
function getEmptySubtaskHTML() {
  return '<div class="subtask-item"><span class="subtask-label">No subtasks</span></div>';
}

/**
 * Returns the HTML for the task delete confirmation overlay.
 * @param {string} title - The title of the task to be deleted.
 * @returns {string} HTML string for the confirmation dialog.
 */
function getConfirmDialogHTML(title) {
  return `
    <div class="confirm-dialog">
      <p class="confirm-dialog__text">Delete "${title}"?</p>
      <div class="confirm-dialog__actions">
        <button class="confirm-btn confirm-btn--cancel" id="confirmCancel">Cancel</button>
        <button class="confirm-btn confirm-btn--delete" id="confirmDelete">Delete</button>
      </div>
    </div>
  `;
}


/**
 * Returns the HTML for a single assigned user row in the modal.
 * @param {string} color - Background color hex string for the avatar.
 * @param {string} initials - The user's initials to display in the avatar.
 * @param {string} user - The full name of the assigned user.
 * @returns {string} HTML string for the assigned user entry.
 */
function getAssignedUsersHTML(color, initials, user) {
  return `
    <div class="assigned-user">
      <div class="avatar big-card__avatar" style="background:${color};">${initials}</div>
      <span class="user-name">${user}</span>
    </div>
  `;
}

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
        <span class="modal-category" style="background:${categoryBadge.color}">${categoryBadge.label}</span>
        <button type="button" class="modal-close">
          <img class="close-icon" src="../assets/img/contacts/close.svg" alt="Close button">
        </button>
      </div>
      <h1 class="modal-title">${task.title || 'Untitled task'}</h1>
      <p class="modal-description">${task.description || 'No description'}</p>
      <div class="modal-info">
        <div class="modal-info-row">
          <span class="modal-info-label">Due date:</span>
          <span class="modal-info-value">${task.date || '—'}</span>
        </div>
        <div class="modal-info-row">
          <span class="modal-info-label">Priority:</span>
          <span class="modal-info-value">${task.prio || '—'} ${getPriorityIconForModal(task.prio)}</span>
        </div>
      </div>
      <div>
        <div class="modal-section-label">Assigned To:</div>
        <div class="assigned-list" id="assignedList"></div>
      </div>
      <div>
        <div class="modal-section-label">Subtasks</div>
        <div class="modal-subtask-list" id="subtaskList">${getSubtaskListHTML(task.subtasks, task.id)}</div>
      </div>
      <div class="modal-actions">
        <button type="button" class="modal-action-btn" id="deleteTaskBtn" data-id="${task.id}">
          <span class="modal-action-icon modal-action-icon--delete"></span>
          Delete
        </button>
        <div class="modal-action-divider"></div>
        <button type="button" class="modal-action-btn" id="editTaskBtn" data-id="${task.id}">
          <span class="modal-action-icon modal-action-icon--edit"></span>
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
  const normalized = String(prio || '').trim().toLowerCase();
  if (normalized === 'urgent') return '<img src="../assets/img/Property 1=Urgent.svg" alt="urgent" class="prio-icon-modal">';
  if (normalized === 'medium') return '<img src="../assets/img/Property 1=Medium.svg" alt="medium" class="prio-icon-modal">';
  if (normalized === 'low') return '<img src="../assets/img/Property 1=Low.svg" alt="low" class="prio-icon-modal">';
  return '';
}


/**
 * Returns HTML subtask items with custom SVG checkboxes for the modal.
 * @param {Array} subtasks - Array of subtask objects with title and state.
 * @param {string} taskId - The Firebase ID of the parent task.
 * @returns {string} HTML string of subtask items with custom checkboxes.
 */
function getSubtaskListHTML(subtasks, taskId) {
  if (!Array.isArray(subtasks) || subtasks.length === 0) {
    return '<div class="subtask-item"><span class="subtask-label">No subtasks</span></div>';
  }
  return subtasks.map((subtask, index) => `
    <div class="subtask-item">
      <input
        type="checkbox"
        id="subtask-${taskId}-${index}"
        class="modal-subtask-checkbox custom-checkbox"
        data-index="${index}"
        ${subtask.state === true ? 'checked' : ''}
      />
      <label class="subtask-label" for="subtask-${taskId}-${index}">${subtask.title}</label>
    </div>
  `).join('');
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
      <div class="avatar" style="background:${color};">${initials}</div>
      <span class="user-name">${user}</span>
    </div>
  `;
}
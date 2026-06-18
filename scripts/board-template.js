import {
  escapeHtml,
  renderAssignedUsers,
  createNavButtonMobile,
} from './board-utils.js';
import { dateValidationForBoard } from './board-dialogs.js';
import { getPriorityIconForModal } from './board.js';
/**
 * Returns the full HTML string for the task detail modal content.
 * @param {Object} categoryBadge - Badge config with color and label.
 * @param {Object} task - The task data object to display.
 * @returns {string} HTML string for the modal's inner content.
 */
export function getTaskCardHTML(categoryBadge, task) {
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
          <p id="taskDate">${dateValidationForBoard(task) || '—'}</p>
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
        <button class="edit-btn" id="editTaskBtn" onclick="openEditTask('${task.id}')">
          <div class="edit-icon"></div>
          Edit
        </button>
      </div>
    </div>
  `;
}

/**
 * Creates an avatar element displaying the number of additional users
 * that are not shown in the avatar list.
 *
 * @param {number} count - The number of additional users.
 * @returns {string} HTML string representing the extra-count avatar.
 */
export function createExtraAvatar(count) {
  return `<div class="avatar avatar-extracount">+${count}</div>`;
}

/**
 * Returns the HTML markup for the urgent priority icon used in the task modal.
 *
 * @returns {string} The HTML string containing the urgent priority icon.
 */
export function getUrgentIconForModal() {
  return '<img src="../assets/img/Property 1=Urgent.svg" alt="urgent" class="prio-icon-modal">';
}

/**
 * Returns the HTML markup for the medium priority icon used in the task modal.
 *
 * @returns {string} The HTML string containing the medium priority icon.
 */
export function getMediumIconForModal() {
  return '<img src="../assets/img/Property 1=Medium.svg" alt="medium" class="prio-icon-modal">';
}

/**
 * Returns the HTML markup for the low priority icon used in the task modal.
 *
 * @returns {string} The HTML string containing the low priority icon.
 */
export function getLowIconForModal() {
  return '<img src="../assets/img/Property 1=Low.svg" alt="low" class="prio-icon-modal">';
}

/**
 * Returns the HTML for a single subtask item with a custom SVG checkbox.
 * @param {Object} subtask - Subtask object with title and state.
 * @param {string} taskId - The Firebase ID of the parent task.
 * @param {number} index - The index of the subtask in the array.
 * @returns {string} HTML string for a single subtask item.
 */
export function getSubtaskItemHTML(subtask, taskId, index) {
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
export function getEmptySubtaskHTML() {
  return '<div class="subtask-item"><span class="subtask-label">No subtasks</span></div>';
}

/**
 * Returns the HTML for the task delete confirmation overlay.
 * @param {string} title - The title of the task to be deleted.
 * @returns {string} HTML string for the confirmation dialog.
 */
export function getConfirmDialogHTML(title) {
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
export function getAssignedUsersHTML(color, initials, user) {
  return `
    <div class="assigned-user">
      <div class="avatar big-card__avatar" style="background:${color};">${initials}</div>
      <span class="user-name">${user}</span>
    </div>
  `;
}

/**
 * Returns the HTML string for the subtask progress bar.
 * @param {Object} subtaskInfo - Object containing done, total and percent values.
 * @returns {string} Progress bar HTML string.
 */
export function getProgressBarHTML(subtaskInfo) {
  return `
    <div class="task-card__progress">
      <div class="progress-bar">
        <div class="progress-bar__fill" style="width: ${subtaskInfo.percent}%"></div>
      </div>
      <span class="task-card__progress-label">${subtaskInfo.done}/${subtaskInfo.total} Subtasks</span>
    </div>
  `;
}

/**
 * Returns the inner HTML string for a task card.
 * @param {Object} categoryBadge - Badge config with color, textColor and label.
 * @param {Object} task - The task data object.
 * @param {Object} subtaskInfo - Subtask progress info object.
 * @param {Array} assignedUsers - List of assigned user name strings.
 * @param {string} priorityIcon - Emoji string representing task priority.
 * @returns {string} HTML string for the task card's inner content.
 */
export function getTaskCardInnerHTML(
  categoryBadge,
  task,
  subtaskInfo,
  assignedUsers,
  currentStatus,
) {
  return `
  <div class="header-wrapper">
      <span class="task-card__category" style="background:${categoryBadge.color}; color:${categoryBadge.textColor};">
      ${categoryBadge.label}
      </span>
      <button type="button" class="mobile-swap-button d-none" id="mobile-swap-button">
        <img src="../assets/img/Frame 380.svg" alt="double-arrow">
      </button>
    </div>
    <div class="task-card__text">
      <h3 class="task-card__title">${escapeHtml(task.title || 'Untitled task')}</h3>
      <p class="task-card__description">${escapeHtml(task.description || 'No description')}</p>
    </div>
    ${subtaskInfo.total > 0 ? getProgressBarHTML(subtaskInfo) : ''}
    <div class="task-card__footer">
      <div class="avatar-group">${renderAssignedUsers(assignedUsers)}</div>
      <div class="task-card__actions">
        <span class="prio-icon">${getPriorityIconForModal(task.prio)}</span>
      </div>
      <section class="mobile-move-buttons d-none">
        <div class="mobile-move-buttons-wrapper">
          <span class="mobile-head">Move to</span>
          <div class="buttons-to-move">
            ${createNavButtonMobile(currentStatus, task)}
          </div>
        </div>
      </section>
  </div>
  `;
}

/**
 * Extracts up to two initials from a full name string.
 * @param {string} name - The full name of the user.
 * @returns {string} Uppercase initials string.
 */
export function getInitials(name) {
  return String(name || '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}


/**
 * Returns a color from a fixed palette based on a given index.
 * @param {number} index - Position index used to select the color.
 * @returns {string} Hex color string.
 */
export function getAvatarColor(index) {
  const colors = ['#29abe2', '#9b59b6', '#2ecc71', '#e67e22', '#e74c3c', '#607d8b', '#1565c0'];
  return colors[index % colors.length];
}


/**
 * Returns an emoji icon representing the given task priority.
 * @param {string} prio - Priority value (urgent, medium, low).
 * @returns {string} Emoji string for the priority level.
 */
export function getPriorityIcon(prio) {
  const normalized = normalize(prio);
  if (normalized === 'urgent' || normalized === 'urgend') return '🔴';
  if (normalized === 'medium') return '🟡';
  if (normalized === 'low') return '🟢';
  return '⚪';
}


/**
 * Returns a category badge config object based on the task category.
 * @param {string} category - The category value of the task.
 * @returns {Object} Badge config with label, color and textColor.
 */
export function getCategoryBadge(category) {
  const normalized = normalize(category);
  if (normalized === 'technical task' || normalized === 'technical-task') {
    return { label: 'Technical Task', color: '#1fd7c1', textColor: '#ffffff' };
  }
  if (normalized === 'user story' || normalized === 'user-story') {
    return { label: 'User Story', color: '#0038ff', textColor: '#ffffff' };
  }
  return { label: category || 'Task', color: '#2a3647', textColor: '#ffffff' };
}


/**
 * Normalizes a string to lowercase with trimmed whitespace and no hyphens.
 * @param {string} value - The input string to normalize.
 * @returns {string} Normalized lowercase string.
 */
export function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replaceAll('-', ' ')
    .replace(/\s+/g, ' ');
}


/**
 * Escapes HTML special characters to prevent XSS injection.
 * @param {string} value - The raw string to escape.
 * @returns {string} HTML-safe escaped string.
 */
export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


/**
 * Renders avatar HTML elements for a list of assigned users.
 * @param {Array} users - Array of user name strings.
 * @returns {string} HTML string of avatar elements.
 */
export function renderAssignedUsers(users) {
  if (!users.length) return '';
  return users.map((user, index) => {
    const initials = getInitials(user);
    const color = getAvatarColor(index);
    return `<div class="avatar" style="background:${color};">${initials}</div>`;
  }).join('');
}


/**
 * Calculates subtask completion progress from a subtasks array.
 * @param {Array} subtasks - Array of subtask objects with state and title.
 * @returns {Object} Object with total, done and percent values.
 */
export function getSubtaskInfo(subtasks) {
  if (!Array.isArray(subtasks) || subtasks.length === 0) {
    return { total: 0, done: 0, percent: 0 };
  }
  const done = subtasks.filter((s) => s.state === true).length;
  const total = subtasks.length;
  const percent = Math.round((done / total) * 100);
  return { total, done, percent };
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
      <span class="task-card__progress-label">${subtaskInfo.done}/${subtaskInfo.total} Done</span>
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
export function getTaskCardInnerHTML(categoryBadge, task, subtaskInfo, assignedUsers, priorityIcon) {
  return `
    <span class="task-card__category" style="background:${categoryBadge.color}; color:${categoryBadge.textColor};">
      ${categoryBadge.label}
    </span>
    <h3 class="task-card__title">${escapeHtml(task.title || 'Untitled task')}</h3>
    <p class="task-card__description">${escapeHtml(task.description || 'No description')}</p>
    ${subtaskInfo.total > 0 ? getProgressBarHTML(subtaskInfo) : ''}
    <div class="task-card__footer">
      <div class="avatar-group">${renderAssignedUsers(assignedUsers)}</div>
      <div class="task-card__actions">
        <span class="prio-icon">${priorityIcon}</span>
        <button class="task-delete-btn" type="button" title="Delete task">✕</button>
      </div>
    </div>
  `;
}
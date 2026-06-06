import { escapeHtml, getInitials, getAvatarColor } from './board-utils.js';
import { parseEditDate } from './tasks-date.js';

/**
 * Returns the HTML template for a subtask list item in display mode.
 *
 * @param {string} subtaskValue - The text content of the subtask.
 * @returns {string} HTML string with the subtask text and edit/delete buttons.
 */
export function getSubtaskTemplate(subtaskValue) {
  return `<div class="subtask-left">
            <span>${subtaskValue}</span>
          </div>
          <div class="subtask-edit-buttons">
            <button class="edit-btn edit-btn_dialog subtask-buttons"><img src="../assets/img/Property 1=edit.svg" alt="editsymbol"></button>
            <div class="subtask-button-seperator"></div>
            <button class="delete-btn subtask-buttons"><img src="../assets/img/Property 1=delete.svg" alt="deletesymbol"></button>
          </div>`;
}

/**
 * Returns the HTML template for a subtask list item in edit mode.
 *
 * @param {string} subtaskText - The current text of the subtask to prefill the input.
 * @returns {string} HTML string with an editable input field and confirm/delete buttons.
 */
export function getEditTemplate(subtaskText) {
  return `<div class="input-wrapper-edit">
            <input class="subtask-edit-value" type="text" value="${subtaskText}" />
          </div>
          <div class="subtask-edit-buttons">
            <button class="edit-delete-btn subtask-buttons" type="button"><img src="../assets/img/Property 1=delete.svg" alt="deletesymbol" /></button>
            <div class="subtask-button-seperator"></div>
            <button class="edit-confirm-btn subtask-buttons" type="button"><img src="../assets/img/Property 1=check.svg" alt="checkicon" /></button>
          </div>`;
}

/**
 * Returns the HTML template for a single contact option in the assigned-to dropdown.
 *
 * @param {Object} contact - The contact object from Firestore.
 * @param {string} contact.color - The background color for the avatar.
 * @param {string} contact.firstName - The first name of the contact.
 * @param {string} contact.lastName - The last name of the contact.
 * @param {string} contact.id - The unique ID of the contact.
 * @param {string} initials - The two-letter initials to display inside the avatar.
 * @returns {string} HTML string with avatar, name and checkbox images.
 */
export function getDropdownTemplate(contact, initials, isYou) {
  return `
  <section class="assigned-to-contacts-wrapper">
    <div class="assigned-to-names">
      <div class="avatar" style="background:${contact.color}">${initials}</div>
      <span>${contact.firstName} ${contact.lastName} ${isYou ? '(You)' : ''}</span>
    </div>
    <img src="../assets/img/Check button.svg" alt="checkbox" class="checkbox-unchecked" data-id="${contact.id}"/>
    <img src="../assets/img/Check button checked.svg" alt="checkbox-checked" class="checkbox-checked d-none" data-id="${contact.id}">
  </section>`;
}

/**
 * Returns an HTML string with the color and the intials for the avatars.
 * @param {string} color - The background color of the avatar.
 * @param {string} initials - The initials displayed inside the avatar.
 * @returns {string} HTML markup for a single avatar element.
 */
function renderAvatarsForEditTemplate(color, initials) {
  return `<div class="avatar avatar--stacked" style="background:${color}">${initials}</div>`;
}

/**
 * Returns the HTML string for the entire edit task modal content.
 *
 * @param {Object} task - The task data object to prefill the form.
 * @returns {string} HTML markup for the edit task modal.
 */
export function getBoardEditTemplate(data) {
  return `
    <div class="edit-task-modal">
      <div class="edit-modal-top">
        <button type="button" class="close" id="edit-close-btn">
          <img class="close-icon" src="../assets/img/contacts/close.svg" alt="Close">
        </button>
      </div>
      <form id="edit-task-form" class="edit-task-scrollarea" novalidate>

        <div class="form-group">
          <label class="task-form-label" for="edit-task-title">
            <p>Title</p>
            <p class="star">*</p>
          </label>
          <input type="text" id="edit-task-title" class="task-form-input" value="${data.title}" maxlength="40">
          <p id="edit-error-title" class="d-none error-writing">This field is required</p>
        </div>

        <div class="form-group">
          <label class="task-form-label" for="edit-task-description">Description</label>
          <textarea id="edit-task-description" class="task-form-textarea">${data.description}</textarea>
        </div>

        <div class="form-group">
          <label class="task-form-label">
            <p>Due date</p>
            <p class="star">*</p>
          </label>
          <div>
            <section class="task-form-input" id="edit-task-date" tabindex="0">
              <div class="input-wrapper">
                <input class="date-input-field" id="edit-date-day" type="text" placeholder="dd" maxlength="2" size="2" value="${data.day}" />
                <span>/</span>
                <input class="date-input-field" id="edit-date-month" type="text" placeholder="mm" maxlength="2" size="2" value="${data.month}" />
                <span>/</span>
                <input class="date-input-field" id="edit-date-year" type="text" placeholder="yyyy" maxlength="4" size="4" value="${data.year}" />
              </div>
              <img src="../assets/img/event.svg" alt="eventsvg" id="edit-event-svg" />
              <input class="edit-old-calender" type="date" id="edit-date-input" value="${data.formattedDate}" />
            </section>
            <p id="edit-error-date" class="d-none error-writing">This field is required</p>
          </div>
        </div>

        <div class="form-group">
          <label class="task-form-label">Priority</label>
          <div class="task-form-prio-group">
            <button type="button" class="prio-btn prio-btn--urgent ${data.isUrgent}" data-prio="urgent">Urgent<img src="../assets/img/Property 1=Urgent.svg" alt="urgent"></button>
            <button type="button" class="prio-btn prio-btn--medium ${data.isMedium}" data-prio="medium">Medium<img src="../assets/img/Property 1=Medium.svg" alt="medium"></button>
            <button type="button" class="prio-btn prio-btn--low ${data.isLow}" data-prio="low">Low<img src="../assets/img/Property 1=Low.svg" alt="low"></button>
          </div>
        </div>

        <section class="form-group form-group--full">
          <label class="task-form-label">Assigned to</label>
          <div class="assigned-dropdown">
            <div class="task-form-input flex-center-space-between assigned-to" id="edit-assigned-toggle">
              <input type="text" id="edit-assigned-input" placeholder="Select contacts to assign" class="input-assigned-to" readonly>
              <img src="../assets/img/arrow_drop_downaa.svg" alt="down" id="edit-arrow-down" class="arrow-img">
              <img src="../assets/img/arrow_drop_down.svg" alt="up" id="edit-arrow-up" class="d-none arrow-img">
            </div>
            <ul id="edit-assigned-options" class="assigned-options d-none"></ul>
          </div>
          <div id="edit-assigned-avatars" class="assigned-avatars"></div>
        </section>

        <section class="form-group">
          <label class="task-form-label">Subtasks</label>
          <div class="task-form-subtask-input-row">
            <input class="task-form-input" type="text" id="edit-subtask-input" placeholder="Add new subtask" maxlength="35">

            <div class="button-wrapper d-none" id="edit-subtask-actions">
              <button type="button" class="subtask-button" id="edit-subtask-clear">
                <img src="../assets/img/Property 1=close.svg" alt="clear">
              </button>
              <div class="subtask-button-separator"></div>
              <button type="button" class="subtask-button" id="edit-subtask-add">
                <img src="../assets/img/Property 1=check.svg" alt="add">
              </button>
            </div>

          </div>
          <ul id="edit-subtask-list" class="task-form-subtask-list"></ul>
        </section>

        <div class="edit-ok-btn-wrapper">
          <button type="submit" class="btn btn--primary" id="btn-edit-save">Save ✓</button>
        </div>
      </form>
    </div>
  `;
}

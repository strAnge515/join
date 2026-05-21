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
export function getDropdownTemplate(contact, initials) {
  return `
  <section class="assigned-to-contacts-wrapper">
    <div class="assigned-to-names">
      <div class="avatar" style="background:${contact.color}">${initials}</div>
      <span>${contact.firstName} ${contact.lastName}</span>
    </div>
    <img src="../assets/img/Check button.svg" alt="checkbox" class="checkbox-unchecked" data-id="${contact.id}"/>
    <img src="../assets/img/Check button checked.svg" alt="checkbox-checked" class="checkbox-checked d-none" data-id="${contact.id}">
  </section>`;
}

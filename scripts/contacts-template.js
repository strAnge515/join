/**
 * Returns the HTML markup for the "(You)" badge displayed next to the
 * currently logged-in user's name.
 *
 * @returns {string} The HTML string for the user badge.
 */
function getYouBadgeTemplate() {
  return `<span class="you-badge">(You)</span>`;
}

/**
 * Generates the HTML markup for a contact entry, including avatar,
 * name, email address, and an optional user badge.
 *
 * @param {object} contact - The contact whose information should be displayed.
 * @param {string} initials - The contact's initials shown in the avatar.
 * @param {string} youBadge - The HTML markup for the "(You)" badge, or an empty string.
 * @returns {string} The HTML string representing the contact entry.
 */
function getContactTemplate(contact, initials, youBadge) {
  return `
    <div class="avatar" style="background:${contact.color}">
      ${initials}
    </div>
    <div class="info">
      <div class="name">${contact.firstName} ${contact.lastName} ${youBadge}</div>
      <div class="email">${contact.email}</div>
    </div>
  `;
}

/**
 * Generates the HTML markup for the contact details view, including
 * avatar, name, contact information, and edit/delete action buttons
 * for both desktop and mobile layouts.
 *
 * @param {object} contact - The contact whose details should be displayed.
 * @param {string} initials - The contact's initials shown in the avatar.
 * @param {string} color - The background color used for the avatar.
 * @param {string} youBadge - The HTML markup for the "(You)" badge, or an empty string.
 * @returns {string} The HTML string representing the contact details view.
 */
function getContactDetailTemplate(contact, initials, color, youBadge) {
  return `
    <div class="contact-detail-card" id="contactDetailCard">
          <div class="detail-header">
        <div class="detail-avatar contacts-detail-avatar" style="background:${color}">
          ${initials}
        </div>
        <div>
          <div class="detail-name">${contact.firstName} ${contact.lastName} ${youBadge}</div>
          <div class="detail-actions mobile-hidden" id="detailActions">
          <button class="edit-btn" id="editContactBtn" data-id="${contact.id}">
          <div class="edit-icon"></div>
          Edit </button>
          <button class="edit-btn" id="deleteContactBtn" data-id="${contact.id}">
          <div class="delete-icon"></div>
           Delete</button>
           </div>
           </div>
      </div>
      <div class="detail-section">
        <div class="detail-label">Contact Information</div>
        <div class="details">
          <div class="detail-label-email">Email</div>
          <a href="mailto:${contact.email}" class="email">${contact.email}</a>
        </div>
        <div class="details">
          <div class="detail-label-phone">Phone</div>
          <a href="tel:${contact.phone}" class="phone">${contact.phone}</a>
        </div>
      </div>
    </div>
    <div class="detail-actions-mobile close" id="detailActionsMobile">
          <button class="edit-btn" id="editContactBtnMobile" data-id="${contact.id}">
          <div class="edit-icon"></div>
          Edit </button>
          <button class="edit-btn" id="deleteContactBtnMobile" data-id="${contact.id}">
          <div class="delete-icon"></div>
           Delete</button>
           </div>
           </div>
  `;
}

/**
 * Returns the HTML for the contact delete confirmation overlay.
 * @returns {string} HTML string for the confirmation dialog.
 */
function getContactConfirmHTML() {
  return `
    <div class="confirm-dialog">
      <p class="confirm-dialog__text">Delete this contact?</p>
      <div class="confirm-dialog__actions">
        <button class="cancel-btn" id="confirmCancelContact">Cancel</button>
        <button class="delete-btn" id="confirmDeleteContact">Delete</button>
      </div>
    </div>
  `;
}

/**
 * Generates the HTML markup for the edit contact dialog, including
 * pre-filled form fields and action buttons for updating or deleting
 * the selected contact.
 *
 * @param {object} contact - The contact to edit.
 * @param {string} initials - The contact's initials displayed in the avatar.
 * @param {string} color - The background color used for the avatar.
 * @returns {string} The HTML string representing the edit contact dialog.
 */
function getEditContactTemplate(contact, initials, color) {
  return `<div class="dialog">
        <div class="dialog-left">
          <img src="../assets/img/contacts/join-logo.svg" class="logo mobile-hidden" />
          <h1>Edit contact</h1>
          <div class="underline"></div>
        </div>
        <div class="dialog-right">
<div class="detail-avatar dialog-detail-avatar" style="background:${color}">
          ${initials}
        </div>
          <div class="actions">
            <button class="close-btn btn-to-close">
              <img class="close-icon" src="../assets/img/contacts/close.svg" alt="Close button"></button>
            <form id="editContactForm">
            <div class="input-wrapper">
              <input id="nameInputEdit" type="text" placeholder="Vor- und Nachname" value="${contact.firstName} ${contact.lastName}" />
              <small id="nameErrorEdit" class="error"></small>
              <img src="../assets/img/contacts/person.svg" alt="">
            </div>
            <div class="input-wrapper">
              <input id="emailInputEdit" type="text" placeholder="Email" value="${contact.email}"  />
              <small id="emailErrorEdit" class="error"></small>
              <img src="../assets/img/contacts/mail.svg" alt="">
            </div>
            <div class="input-wrapper">
              <input id="phoneInputEdit" type="text" placeholder="Phone" value="${contact.phone}"/>
              <small id="phoneErrorEdit" class="error"></small>
              <img src="../assets/img/contacts/call.svg" alt="">
            </div>
            <div class="action-btns">
              <button id="deleteContactBtnEditDialog" class="delete-btn btn-to-close">
                Delete
              </button>
              <button class="create-btn save-btn" type="submit">Save ✔</button>
            </div>
            </form>
          </div>
        </div>
      </div>`;
}

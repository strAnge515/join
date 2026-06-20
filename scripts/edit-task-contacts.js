import { getAvatarColor } from './board-utils.js';


/**
 * Reads the logged-in user from sessionStorage.
 * Returns null for missing data or guests (empty email) so no contact gets pinned.
 *
 * @returns {Object|null} The current user object ({ name, email }) or null.
 */
export function readCurrentUser() {
  const stored = sessionStorage.getItem('currentUser');
  if (!stored) return null;
  try {
    const user = JSON.parse(stored);
    return user.email ? user : null;
  } catch (error) {
    return null;
  }
}


/**
 * Checks whether a contact represents the currently logged-in user.
 *
 * @param {Object} contact - The contact object with an email field.
 * @param {Object|null} currentUser - The logged-in user or null.
 * @returns {boolean} True if the contact is the current user.
 */
export function isCurrentUser(contact, currentUser) {
  if (!currentUser || !contact.email) return false;
  return contact.email.toLowerCase() === currentUser.email.toLowerCase();
}


/**
 * Returns a new contact array with the current user moved to the first position.
 *
 * @param {Array<Object>} contacts - The prepared contacts list.
 * @param {Object|null} currentUser - The logged-in user or null.
 * @returns {Array<Object>} The reordered contacts list.
 */
export function sortCurrentUserFirst(contacts, currentUser) {
  if (!currentUser) return contacts;
  const index = contacts.findIndex((contact) => isCurrentUser(contact, currentUser));
  if (index <= 0) return contacts;
  const reordered = [...contacts];
  const [me] = reordered.splice(index, 1);
  reordered.unshift(me);
  return reordered;
}


/**
 * Filters contacts by a search term matching their full name.
 *
 * @param {Array<Object>} contacts - The contacts list to filter.
 * @param {string} term - The current search term.
 * @returns {Array<Object>} The contacts whose full name includes the term.
 */
export function getFilteredContacts(contacts, term) {
  const search = (term || '').trim().toLowerCase();
  if (!search) return contacts;
  return contacts.filter((contact) =>
    `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(search));
}


/**
 * Appends a "(You)" marker to the rendered name of the current user's list item.
 *
 * @param {HTMLElement} li - The rendered contact list item.
 * @param {Object} contact - The contact object.
 * @param {Object|null} currentUser - The logged-in user or null.
 */
export function markCurrentUserLabel(li, contact, currentUser) {
  if (!isCurrentUser(contact, currentUser)) return;
  const nameSpan = li.querySelector('.assigned-to-names span');
  if (nameSpan) nameSpan.textContent += ' (You)';
}


/**
 * Opens the assigned-to dropdown if it is currently closed and updates the arrows.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
export function openEditDropdown(dialogRef) {
  const optionsContainer = dialogRef.querySelector('#edit-assigned-options');
  if (!optionsContainer || !optionsContainer.classList.contains('d-none')) return;
  optionsContainer.classList.remove('d-none');
  dialogRef.querySelector('#edit-arrow-down').classList.add('d-none');
  dialogRef.querySelector('#edit-arrow-up').classList.remove('d-none');
}


/**
 * Wires the assigned-to search input: enables typing, live filtering and keeps
 * the dropdown open when the user clicks into the field.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 * @param {Function} onRender - Callback that re-renders the filtered dropdown.
 */
export function setupAssignedSearch(dialogRef, onRender) {
  const searchInput = dialogRef.querySelector('#edit-assigned-input');
  if (!searchInput) return;
  searchInput.removeAttribute('readonly');
  searchInput.addEventListener('input', () => onRender(dialogRef));
  searchInput.addEventListener('click', (e) => {
    e.stopPropagation();
    openEditDropdown(dialogRef);
    onRender(dialogRef);
  });
}


/**
 * Builds a selectable dropdown entry for a logged-in guest so the guest can be
 * assigned. Returns null for registered users (they already exist as contacts).
 *
 * @returns {Object|null} The guest contact entry or null.
 */
export function getGuestContact() {
  const stored = sessionStorage.getItem('currentUser');
  if (!stored) return null;
  try {
    const user = JSON.parse(stored);
    if (user.email) return null;
    return { firstName: 'Guest', lastName: 'User', id: 'guest', email: '', color: getAvatarColor(0) };
  } catch (error) {
    return null;
  }
}

import { loadAndPrepareContacts } from './contacts-render.js';
import { getDropdownTemplate } from './tasks-template.js';
import { getAvatarColor } from './board-utils.js';

export const assignedOptions = document.getElementById('assigned-options');
export const assignedToggle = document.getElementById('assigned-toggle');
export const arrowDownAssigned = document.getElementById('arrow-down-assignet-to');
export const arrowUpAssigned = document.getElementById('arrow-up-assigned-to');
export const assignedPlaceholder = document.getElementById('assigned-placeholder');
export const assignedAvatars = document.getElementById('assigned-avatars');
export let selectedContacts = [];

/**
 * Filters the visible contact options in the dropdown based on the current search input.
 *
 * @returns {void}
 */
export function filterContacts() {
  let registeredPersons = Array.from(document.querySelectorAll('.assigned-option'));
  let filterInput = assignedPlaceholder.value;
  for (let i = 0; i < registeredPersons.length; i++) {
    const person = registeredPersons[i];
    const personName = person.querySelector('span').textContent;
    if (personName.toLowerCase().includes(filterInput.toLowerCase())) {
      person.classList.remove('d-none');
    } else {
      person.classList.add('d-none');
    }
  }
}

/**
 * Loads all contacts from Firestore and renders them as dropdown list items.
 *
 * @returns {Promise<void>}
 */
export async function renderAssignedDropdown() {
  const contacts = await loadAndPrepareContacts();
  assignedOptions.innerHTML = '';
  const currentLoggedUser = JSON.parse(sessionStorage.getItem('currentUser'));
  assignedOptions.appendChild(generateYouAvatar(currentLoggedUser));
  contacts.forEach((contact) => {
    const initials = contact.firstName[0] + contact.lastName[0];
    const li = document.createElement('li');
    li.className = 'assigned-option';
    li.innerHTML = getDropdownTemplate(contact, initials);
    li.addEventListener('click', () => toggleContact(li, contact));
    assignedOptions.appendChild(li);
  });
}

function generateYouAvatar(currentLoggedUser) {
  const youContact = loggedUser(currentLoggedUser);
  const youInitials = youContact.firstName[0] + (youContact.lastName ? youContact.lastName[0] : '');
   const currentLoggedUserAvatar = document.createElement('li');
  currentLoggedUserAvatar.className = 'assigned-option';
  currentLoggedUserAvatar.innerHTML = getDropdownTemplate(youContact, youInitials, true);
  currentLoggedUserAvatar.addEventListener('click', () => {
    toggleContact(currentLoggedUserAvatar, youContact)
  })
  return currentLoggedUserAvatar;
}

function loggedUser(currentLoggedUser) {
  const currentLoggedUserName = currentLoggedUser.name;
  let firstName = currentLoggedUserName.split(' ')[0];
  let lastName = currentLoggedUserName.split(' ')[1] || "";
  let id = currentLoggedUser.email;
  let color = getAvatarColor(0);
  return { firstName, lastName, id, color };
}

/**
 * Toggles a contact's selection state.
 * Adds to selectedContacts if not yet selected, removes it if already selected.
 *
 * @param {HTMLElement} li - The list item element for the contact.
 * @param {Object} contact - The contact object from Firestore.
 * @returns {void}
 */
function toggleContact(li, contact) {
  const checkboxUnchecked = li.querySelector('.checkbox-unchecked');
  const checkboxChecked = li.querySelector('.checkbox-checked');
  const already = selectedContacts.find((currentContact) => currentContact.id === contact.id);
  if (already) {
    deselectContact(li, contact, checkboxUnchecked, checkboxChecked);
  } else {
    selectContact(li, contact, checkboxUnchecked, checkboxChecked);
  }
  renderSelectedAvatars();
}

/**
 * Adds a contact to the selectedContacts array and updates the checkbox visually.
 *
 * @param {HTMLElement} li - The list item element for the contact.
 * @param {Object} contact - The contact object to add.
 * @param {HTMLElement} checkboxUnchecked - The unchecked checkbox image.
 * @param {HTMLElement} checkboxChecked - The checked checkbox image.
 * @returns {void}
 */
function selectContact(li, contact, checkboxUnchecked, checkboxChecked) {
  selectedContacts.push(contact);
  checkboxUnchecked.classList.add('d-none');
  checkboxChecked.classList.remove('d-none');
  li.classList.add('selected');
}

/**
 * Removes a contact from the selectedContacts array and resets the checkbox visually.
 *
 * @param {HTMLElement} li - The list item element for the contact.
 * @param {Object} contact - The contact object to remove.
 * @param {HTMLElement} checkboxUnchecked - The unchecked checkbox image.
 * @param {HTMLElement} checkboxChecked - The checked checkbox image.
 * @returns {void}
 */
function deselectContact(li, contact, checkboxUnchecked, checkboxChecked) {
  selectedContacts = selectedContacts.filter((currentContact) => currentContact.id !== contact.id);
  checkboxUnchecked.classList.remove('d-none');
  checkboxChecked.classList.add('d-none');
  li.classList.remove('selected');
}

/**
 * Creates and returns an avatar div element for a given contact.
 *
 * @param {Object} contact - The contact object with firstName, lastName and color.
 * @returns {HTMLDivElement} The avatar element.
 */
function createAvatarElement(contact) {
  const initials = contact.firstName[0] + (contact.lastName ? contact.lastName[0] : '');
  const div = document.createElement('div');
  div.className = 'avatar';
  div.style.background = contact.color;
  div.textContent = initials;
  return div;
}

/**
 * Creates and returns an overflow avatar showing how many contacts are not displayed.
 *
 * @param {number} count - The number of additional contacts beyond the visible limit.
 * @returns {HTMLDivElement} The overflow avatar element.
 */
function createExtraAvatar(count) {
  const div = document.createElement('div');
  div.className = 'avatar avatar-extracount';
  div.textContent = '+' + count;
  return div;
}

/**
 * Renders up to 3 contact avatars below the dropdown.
 * If more than 3 contacts are selected, an overflow avatar is shown instead.
 *
 * @returns {void}
 */
function renderSelectedAvatars() {
  assignedAvatars.innerHTML = '';
  selectedContacts.slice(0, 3).forEach((contact) => {
    assignedAvatars.appendChild(createAvatarElement(contact));
  });
  if (selectedContacts.length > 3) {
    assignedAvatars.appendChild(createExtraAvatar(selectedContacts.length - 3));
  }
}

/**
 * Resets all selected contacts: clears the array, removes avatars,
 * clears the search input and resets all checkboxes in the dropdown.
 *
 * @returns {void}
 */
export function clearAssignedContacts() {
  selectedContacts = [];
  assignedAvatars.innerHTML = '';
  assignedPlaceholder.value = '';
  document.querySelectorAll('.assigned-option').forEach((li) => {
  li.classList.remove('selected', 'd-none');
  li.querySelector('.checkbox-unchecked').classList.remove('d-none');
  li.querySelector('.checkbox-checked').classList.add('d-none');
});
}

/**
 * Returns the current list of selected contacts.
 * Used by other modules to avoid direct access to the exported array.
 *
 * @returns {Object[]} The array of currently selected contact objects.
 */
export function getSelectedContacts() {
  return selectedContacts;
}

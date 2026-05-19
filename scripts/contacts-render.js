import { loadContacts } from './backend-contacts.js';
import {
  state,
  colors,
  addEventListeners,
  showContactDetails,
} from './contacts.js';

/**
 * Groups contacts by the first letter of their first name.
 *
 * @param {Array<Object>} contacts - The list of contacts to group.
 * @returns {Object<string, Array<Object>>} Grouped contacts by letter.
 */
function groupContactsByLetter(contacts) {
  const grouped = {};
  state.contacts.forEach((contact) => {
    const letter = contact.firstName.charAt(0).toUpperCase();
    if (!grouped[letter]) {
      grouped[letter] = [];
    }
    grouped[letter].push(contact);
  });
  return grouped;
}

/**
 * Renders all contacts in the contact list.
 *
 * @returns {Promise<void>}
 */
export async function renderContacts() {
  const contactlistRef = document.getElementById('contact-list');
  if (!contactlistRef) return;
  contactlistRef.innerHTML = 'Lade Kontakte...';
  state.contacts = await loadAndPrepareContacts();
  const grouped = groupContactsByLetter(state.contacts);
  renderContactList(contactlistRef, grouped);
}

/**
 * Creates a letter heading element for grouped contacts.
 *
 * @param {string} letter - The grouping letter.
 * @returns {HTMLDivElement} The created letter element.
 */
function createLetterElement(letter) {
  const el = document.createElement('div');
  el.className = 'letter';
  el.textContent = letter;
  return el;
}

/**
 * Creates a contact button element with avatar and contact information.
 *
 * @param {Object} contact - The contact data.
 * @returns {HTMLButtonElement} The created contact button element.
 */
function createContactElement(contact) {
  const initials = contact.firstName[0] + contact.lastName[0];
  const contactBtn = document.createElement('button');
  contactBtn.className = 'contact';
  contactBtn.dataset.id = contact.id;
  contactBtn.addEventListener('click', () => {
    showContactDetails(contactBtn, contact);
  });
  contactBtn.innerHTML = getContactTemplate(contact, initials);
  return contactBtn;
}

/**
 * Loads contacts from the database, prepares the data by splitting the name into first and last name and assigning a color based on the email, then returns the prepared contacts
 *
 * @returns {Promise<Array<Object>>} A promise resolving to the prepared contacts.
 */
export async function loadAndPrepareContacts() {
  state.contacts = await loadContacts();
  if (!state.contacts || state.contacts.length === 0) return [];
  return state.contacts.map((contact) => {
    const [firstName, ...rest] = contact.name.split(' ');
    return {
      ...contact,
      firstName,
      lastName: rest.join(' '),
      color: stringToColor(contact.email),
    };
  });
}

/**
 * Checks whether the grouped contact object is empty.
 *
 * @param {Object} groupedContacts - The grouped contacts object.
 * @returns {boolean} Returns true if no contacts exist.
 */
function isContactListEmpty(groupedContacts) {
  return Object.keys(groupedContacts).length === 0;
}

/**
 * Renders a message when no contacts are available.
 *
 * @param {HTMLElement} contactlistRef - The contact list container element.
 */
function renderEmptyMessage(contactlistRef) {
  contactlistRef.innerHTML = '<p>Keine Kontakte gefunden</p>';
}

/**
 * Renders all grouped contacts sorted by their first letter.
 *
 * @param {HTMLElement} contactlistRef - The contact list container element.
 * @param {Object} groupedContacts - Contacts grouped by first letter.
 */
function renderGroupedContacts(contactlistRef, groupedContacts) {
  Object.keys(groupedContacts)
    .sort()
    .forEach((letter) =>
      renderLetterGroup(contactlistRef, groupedContacts, letter),
    );
}

/**
 * Renders a single letter group with all belonging contacts.
 *
 * @param {HTMLElement} contactlistRef - The contact list container element.
 * @param {Object} groupedContacts - Contacts grouped by first letter.
 * @param {string} letter - The current group letter.
 */
function renderLetterGroup(contactlistRef, groupedContacts, letter) {
  contactlistRef.appendChild(createLetterElement(letter));
  groupedContacts[letter].forEach((contact) => {
    contactlistRef.appendChild(createContactElement(contact));
  });
}

/**
 * Renders the grouped contact list.
 *
 * @param {HTMLElement} contactlistRef - The contact list container element.
 * @param {Object<string, Array<Object>>} groupedContacts - Contacts grouped by letter.
 */
export function renderContactList(contactlistRef, groupedContacts) {
  contactlistRef.innerHTML = '';
  if (isContactListEmpty(groupedContacts)) {
    renderEmptyMessage(contactlistRef);
    return;
  }
  renderGroupedContacts(contactlistRef, groupedContacts);
  addEventListeners();
}

/**
 * Converts a string into a deterministic avatar color.
 *
 * @param {string} str - The string to convert.
 * @returns {string} The generated color value.
 */
export function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Removes the slide-in animation class from a container.
 *
 * @param {string} ref - The CSS selector for the element to animate.
 * @param {number} time - The delay before starting the animation.
 */
export function removeSlideInAnimation(ref, time) {
  const element = document.querySelector(ref);
  setTimeout(() => {
    element.classList.remove('slide-in');
  }, time);
}

/**
 * Adds a slide-in animation to a container.
 *
 * @param {string} ref - The CSS selector for the element to animate.
 * @param {number} time - The delay before starting the animation.
 */
//prettier-ignore
export function addSlideInAnimation(ref, time) {
  const element = document.querySelector(ref);
  const detailContainerRef = document.getElementById('detailContainer');
  detailContainerRef.classList.add('no-scroll');
  setTimeout(() => {
    element.addEventListener(
      'transitionend',
      () => {detailContainerRef.classList.remove('no-scroll');},
      { once: true },
    );
    element.classList.add('slide-in');
  }, time);
}

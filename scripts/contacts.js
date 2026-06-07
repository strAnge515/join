import {
  openContactDetails,
  addMobileDetailEventListeners,
  addBackwardsBtnListener,
  addMobileMenuBtnListener,
  closeContactDetails,
  removeActiveStateFromContact,
} from './contacts-responsive.js';

import {
  renderContactList,
  loadAndPrepareContacts,
  renderContacts,
  stringToColor,
  addSlideInAnimation,
} from './contacts-render.js';

import {
  openAddContactDialog,
  openEditContactDialog,
  deleteThisContact,
  handleAddContact,
  closeDialog,
  formatContactData,
} from './contacts-dialogs.js';

import { deleteContact } from './backend-contacts.js';

import { loadTasks, updateTask } from './backend-tasks.js';
import { findUserByEmail, deleteUser } from './backend-users.js';

export const colors = [
  '#FF7A00',
  '#FF5EB3',
  '#6E52FF',
  '#9327FF',
  '#00BEE8',
  '#1FD7C1',
  '#FF745E',
  '#FFA35E',
  '#FC71FF',
  '#FFC701',
  '#0038FF',
  '#FFE62B',
  '#FF4646',
  '#FF4646',
];

export const state = {
  contacts: [],
  activeContactId: null,
};

window.addEventListener('load', () => {
  renderContacts();
});

/**
 * Adds a click event listener to the edit contact button
 * and opens the edit contact dialog for the selected contact.
 */
function editBtnListener() {
  const editBtnRef = document.getElementById('editContactBtn');
  if (editBtnRef) {
    editBtnRef.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      openEditContactDialog(id);
    });
  }
}

/**
 * Adds a click event listener to the delete contact button
 * and deletes the selected contact.
 */
function deleteBtnListener() {
  const deleteBtnRef = document.getElementById('deleteContactBtn');
  if (deleteBtnRef) {
    deleteBtnRef.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      deleteThisContact(id);
    });
  }
}

/**
 * Adds event listeners to the edit and delete buttons in the contact details view.
 */
function addDetailEventListeners() {
  editBtnListener();
  deleteBtnListener();
}

/**
 * Toggles the active state of a contact in the list.
 */
function toggleActiveContact(element) {
  const allContacts = document.querySelectorAll('.contact');
  allContacts.forEach((contact) => contact.classList.remove('active'));
  element.classList.add('active');
}

/**
 * Adds event listeners to the detail contact view based on the screen width.
 */
function addEventListenersToDetailContact() {
  if (window.innerWidth <= 800) {
    addMobileDetailEventListeners();
  } else {
    addDetailEventListeners();
  }
}

/**
 * Displays the details of the selected contact.
 */
// prettier-ignore
export function showContactDetails(element, contact) {
  if (state.activeContactId === contact.id && window.innerWidth > 800) return;
  state.activeContactId = contact.id;
  const contactDetailsRef = document.getElementById('contact-details');
  const initials = contact.firstName[0] + contact.lastName[0];
  const color = contact.color;
  toggleActiveContact(element);
  contactDetailsRef.innerHTML = getContactDetailTemplate(contact, initials, color);
  openContactDetails();
  addSlideInAnimation('#contactDetailCard', 100);
  addEventListenersToDetailContact();
}

/**
 * Displays the updated contact details.
 */
export function showUpdatedContactDetails(contactId) {
  state.activeContactId = '';
  const updatedContact = state.contacts.find((c) => c.id == contactId);
  if (!updatedContact) return;
  const contactEl = document.querySelector(`.contact[data-id="${contactId}"]`);
  if (contactEl) {
    showContactDetails(contactEl, updatedContact);
  }
}

/**
 * Adds all required event listeners for contact dialogs and forms.
 */
export function addEventListeners() {
  document
    .getElementById('addContactBtn')
    .addEventListener('click', openAddContactDialog);
  document.querySelectorAll('.btn-to-close').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const dialog = e.target.closest('dialog');
      closeDialog(dialog);
    });
  });
  const newContactForm = document.getElementById('newContactForm');
  if (newContactForm) {
    newContactForm.addEventListener('submit', handleAddContact);
  }
}

/**
 * Shows the details of a newly added contact by finding it in the rendered list.
 * @param {string} id - The Firebase ID of the new contact.
 * @param {{name: string, email: string, phone: string}} contactData - The contact data.
 */
export function showNewContactDetails(id, contactData) {
  const element = document.querySelector(`.contact[data-id="${id}"]`);
  if (!element) return;
  const [firstName, ...rest] = contactData.name.split(' ');
  const contact = {
    id,
    firstName,
    lastName: rest.join(' '),
    email: contactData.email,
    phone: contactData.phone,
    color: stringToColor(contactData.email),
  };
  showContactDetails(element, contact);
  element.scrollIntoView();
}

/**
 * Executes contact deletion and clears the detail view after the overlay is removed.
 * @param {HTMLElement} overlay - The confirm overlay element to remove.
 * @param {string} contactId - The Firebase ID of the contact to delete.
 */
export async function executeContactDelete(overlay, contactId) {
  const contactToDelete = state.contacts.find((c) => c.id == contactId);
  const contactFullName = getContactFullName(contactToDelete);
  closeOverlay(overlay);
  await deleteContact(contactId);
  await removeContactFromTasks(contactId, contactFullName, contactToDelete);
  await renderContacts();
  document.getElementById('contact-details').innerHTML = '';
  handleMobileDeleteContact();
}

/**
 * Builds a displayable full name for a contact.
 * Falls back from `name` to `firstName + lastName` if needed.
 *
 * @param {Object|null|undefined} contact - The contact object.
 * @param {string} [contact.name] - Full name of the contact.
 * @param {string} [contact.firstName] - First name of the contact.
 * @param {string} [contact.lastName] - Last name of the contact.
 * @returns {string} The formatted full name or an empty string if no contact is provided.
 */
function getContactFullName(contact) {
  if (!contact) return '';
  return (
    contact.name ||
    `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
  );
}

/**
 * Handles UI cleanup after deleting a contact on mobile viewports.
 * Closes the contact details view and removes active selection state
 * if the screen width is 900px or less.
 *
 * @returns {void}
 */ function handleMobileDeleteContact() {
  if (window.innerWidth <= 900) {
    closeContactDetails();
    removeActiveStateFromContact();
  }
}

/**
 * Closes or removes an overlay element depending on its type.
 * If the overlay is a <dialog>, it is closed using `.close()`.
 * Otherwise, the element is removed from the DOM.
 *
 * @param {HTMLElement} overlay - The overlay element to close or remove.
 * @returns {void}
 */
function closeOverlay(overlay) {
  if (overlay.tagName === 'DIALOG') {
    overlay.close();
  } else {
    overlay.remove();
  }
}

/**
 * Removes a contact from all tasks and deletes the user if it is the current user.
 *
 * @param {string} contactId - ID of the contact to remove
 * @param {string} contactFullName - Full name of the contact
 * @param {Object} contactToDelete - The contact object being deleted (used for self-deletion check)
 */
/*prettier-ignore */
async function removeContactFromTasks(contactId,contactFullName,contactToDelete) {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const isCurrent =
    currentUser.email && contactToDelete?.email === currentUser.email;
  try {
    const tasks = await loadAllTasks();
    await processAllTasks(tasks, contactId, contactFullName);
  } catch (e) {
    console.error('Fehler beim Entfernen aus Tasks:', e);
  }
  if (isCurrent) await handleSelfDeletion(contactToDelete);
}

/**
 * Loads all tasks and ensures an array is always returned.
 *
 * @returns {Promise<Array<Object>>} List of tasks
 */
async function loadAllTasks() {
  const tasks = await loadTasks();
  if (!Array.isArray(tasks)) return [];
  return tasks;
}

/**
 * Processes all tasks and removes the contact from each task.
 *
 * @param {Array<Object>} tasks - List of tasks
 * @param {string} contactId - Contact ID
 * @param {string} contactFullName - Contact full name
 */
async function processAllTasks(tasks, contactId, contactFullName) {
  for (const task of tasks) {
    await processTask(task, contactId, contactFullName);
  }
}

/**
 * Checks whether an assignee does NOT match the contact to be removed.
 *
 * @param {*} assigned - Assignee (string or object)
 * @param {string} contactId - Contact ID
 * @param {string} contactFullName - Contact full name
 * @returns {boolean} True if the assignee should be kept
 */
function isMatchingAssignee(assigned, contactId, contactFullName) {
  return !(
    (typeof assigned === 'string' && assigned === contactFullName) ||
    (assigned?.id && assigned.id === contactId)
  );
}

/**
 * Removes a contact from a task field (assigned_to / assignedTo) if present.
 *
 * @param {Object} task - Task object
 * @param {string} key - Field name (assigned_to | assignedTo)
 * @param {string} contactId - Contact ID
 * @param {string} contactFullName - Contact full name
 * @param {Object} updates - Object collecting updates
 * @returns {boolean} True if the task was modified
 */
function updateTaskIfNeeded(task, key, contactId, contactFullName, updates) {
  const list = task[key];
  if (!Array.isArray(list)) return false;
  const filtered = list.filter((a) => {
    const isNameMatch = typeof a === 'string' && a === contactFullName;
    const isIdMatch = a && a.id === contactId;
    return !(isNameMatch || isIdMatch);
  });
  if (filtered.length === list.length) return false;
  updates[key] = filtered;
  return true;
}

/**
 * Processes a single task and updates it if needed.
 *
 * @param {Object} task - Task object
 * @param {string} contactId - Contact ID
 * @param {string} contactFullName - Contact full name
 */
/*prettier-ignore */
async function processTask(task, contactId, contactFullName) {
  const updates = {};
  let changed = false;
  changed ||= updateTaskIfNeeded(task, 'assigned_to', contactId, contactFullName, updates);
  changed ||= updateTaskIfNeeded(task, 'assignedTo', contactId, contactFullName, updates);
  if (changed) await updateTask(task.id, updates);
}

/**
 * Deletes the current user after self-contact removal and redirects to login page.
 */
async function handleSelfDeletion(contactToDelete) {
  const userDoc = await findUserByEmail(contactToDelete.email);
  if (userDoc) await deleteUser(userDoc.id);
  sessionStorage.clear();
  window.location.href = '../index.html';
}

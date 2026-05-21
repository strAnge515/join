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
} from './contacts-dialogs.js';

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

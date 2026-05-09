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
  '#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', '#00BEE8',
  '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF', '#FFC701',
  '#0038FF', '#FFE62B', '#FF4646', '#FF4646',
];

export const state = {
  contacts: [],
  activeContactId: null,
};

window.addEventListener('load', () => {
  renderContacts();
});

/**
 * Adds event listeners to the edit and delete buttons in the contact details view.
 */
function addDetailEventListeners() {
  const editBtnRef = document.getElementById('editContactBtn');
  const deleteBtnRef = document.getElementById('deleteContactBtn');
  if (editBtnRef) {
    editBtnRef.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      openEditContactDialog(id);
    });
  }
  if (deleteBtnRef) {
    deleteBtnRef.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      deleteThisContact(id);
    });
  }
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
  if (window.innerWidth <= 900) {
    addMobileDetailEventListeners();
  } else {
    addDetailEventListeners();
  }
}

/**
 * Displays the details of the selected contact.
 */
export function showContactDetails(element, contact) {
  if (state.activeContactId === contact.id && window.innerWidth > 900) return;
  state.activeContactId = contact.id;
  const contactDetailsRef = document.getElementById('contact-details');
  const initials = contact.firstName[0] + contact.lastName[0];
  const color = contact.color;
  toggleActiveContact(element);
  contactDetailsRef.innerHTML = getContactDetailTemplate(
    contact,
    initials,
    color,
  );
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
  if(newContactForm) {
      newContactForm.addEventListener('submit', handleAddContact);
  }
}
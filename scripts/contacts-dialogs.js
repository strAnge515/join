import {
  saveContact,
  deleteContact,
  updateContact,
} from './backend-contacts.js';

import {
  validateAddForm,
  validateEditForm,
  addClearErrorInputListeners,
  clearAllInputErrors,
} from './contacts-validation.js';

import {
  state,
  addEventListeners,
  showUpdatedContactDetails,
  showNewContactDetails,
} from './contacts.js';

import {
  renderContacts,
  addSlideInAnimation,
  removeSlideInAnimation,
} from './contacts-render.js';

import {
  closeContactDetails,
  removeActiveStateFromContact,
} from './contacts-responsive.js';

/**
 * Updates the contact data in the database with the new values from the edit contact form.
 *
 * @param {string} contactId - The ID of the contact to update.
 * @param {Object} data - The updated contact data.
 * @returns {Promise<void>}
 */
async function updateContactData(contactId, data) {
  await updateContact(contactId, data);
}

/**
 * Opens the dialog to add a new contact.
 */
export function openAddContactDialog() {
  const dialogRef = document.getElementById('addContactDialog');
  dialogRef.showModal();
  focusElement('nameInputAdd');
  dialogRef.classList.add('show');
  addEventListenersToCloseDialog(dialogRef);
  addClearErrorInputListeners(dialogRef);
}

/**
 * Adds event listeners to the edit contact dialog form and close button.
 */
function addEditDialogEventListeners() {
  const dialogRef = document.getElementById('editContactDialog');
  const deleteBtnRef = document.getElementById('deleteContactBtnEditDialog');
  const form = dialogRef.querySelector('form');
  form.addEventListener('submit', (event) => {
    editContact(event, state.activeContactId);
  });
  deleteBtnRef.addEventListener('click', (event) => {
    deleteThisContact(state.activeContactId);
  });
  addEventListenersToCloseDialog(dialogRef);
  addClearErrorInputListeners(dialogRef);
}

/**
 * Opens the dialog to edit an existing contact and pre-fills the form with the contact's current information.
 *
 * @param {string} contactId - The ID of the contact to edit.
 */
export function openEditContactDialog(contactId) {
  const contact = state.contacts.find((contact) => contact.id == contactId);
  const dialogRef = document.getElementById('editContactDialog');
  const initials = contact.firstName[0] + contact.lastName[0];
  const color = contact.color;
  dialogRef.innerHTML = getEditContactTemplate(contact, initials, color);
  dialogRef.showModal();
  focusElement('nameInputEdit');
  dialogRef.classList.add('show');
  addEditDialogEventListeners();
  addEventListeners();
}

/**
 * Clears the input fields in the add contact form after a new contact has been added.
 *
 * @param {string} formId - The ID of the form to clear.
 */
function clearInputs(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  const inputs = form.querySelectorAll('input');
  inputs.forEach((input) => {
    input.value = '';
  });
}

/**
 * Closes an open dialog and clears its input fields.
 *
 * @param {HTMLElement} element - An element inside the dialog.
 */
export function closeDialog(element) {
  const dialogRef = element.closest('dialog');
  const formId = dialogRef.querySelector('form').id;
  dialogRef.classList.remove('show');
  setTimeout(() => {
    dialogRef.close();
  }, 100);
  clearAllInputErrors(dialogRef);
  clearInputs(formId);
}

/**
 * Executes contact deletion and clears the detail view after the overlay is removed.
 * @param {HTMLElement} overlay - The confirm overlay element to remove.
 * @param {string} contactId - The Firebase ID of the contact to delete.
 */
async function executeContactDelete(overlay, contactId) {
  overlay.remove();
  await deleteContact(contactId);
  await renderContacts();
  document.getElementById('contact-details').innerHTML = '';
  if (window.innerWidth <= 900) {
    closeContactDetails();
    removeActiveStateFromContact();
  }
}

/**
 * Shows a custom confirmation overlay before deleting a contact.
 * @param {string} contactId - The Firebase ID of the contact to delete.
 */
export function deleteThisContact(contactId) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = getContactConfirmHTML();
  document.body.appendChild(overlay);
  overlay
    .querySelector('#confirmCancelContact')
    .addEventListener('click', () => overlay.remove());
  overlay
    .querySelector('#confirmDeleteContact')
    .addEventListener('click', () => executeContactDelete(overlay, contactId));
}

/**
 * Closes a dialog when the Esc key is pressed.
 * @param {HTMLElement} dialogRef - The dialog element.
 */
function closeWithEscKey(dialogRef) {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (dialogRef.open) {
        event.preventDefault();
        closeDialog(dialogRef);
      }
    }
  });
}

/**
 * Closes a dialog when clicking outside of it.
 * @param {HTMLElement} dialogRef - The dialog element.
 */
function closeWithOutsideClick(dialogRef) {
  dialogRef.addEventListener('click', (event) => {
    if (event.target === dialogRef) {
      closeDialog(event.target);
    }
  });
}

/**
 * Adds event listeners to close a dialog when clicking outside of it or pressing the Escape key.
 *
 * @param {HTMLElement} dialogRef - The dialog element.
 */
function addEventListenersToCloseDialog(dialogRef) {
  closeWithEscKey(dialogRef);
  closeWithOutsideClick(dialogRef);
}

/**
 * Closes a dialog and re-renders the contact list.
 *
 * @param {HTMLDialogElement} dialogRef - The dialog element.
 * @returns {Promise<void>}
 */
async function closeDialogAndRender(dialogRef) {
  dialogRef.close();
  await renderContacts();
}

/**
 * Focuses an input element and places the cursor at the end.
 *
 * @param {string} elementId - The ID of the element to focus.
 */
function focusElement(elementId) {
  const focusElement = document.getElementById(elementId);
  focusElement.focus();
  const length = focusElement.value.length;
  focusElement.setSelectionRange(length, length);
}

/**
 * Handles the creation of a new contact.
 *
 * @param {SubmitEvent} event - The submit event object.
 * @returns {Promise<void>}
 */
export async function handleAddContact(event) {
  event.preventDefault();
  const btn = event.target.querySelector('.create-btn');
  if (!validateAddForm()) return;
  btn.disabled = true;
  const contactData = formatContactData();
  const id = await saveContact(contactData);
  finishContactCreation(id, contactData);
  btn.disabled = false;
}

/**
 * Capitalizes the first letter of a string and converts the rest to lowercase.
 *
 * @param {string} fullName - The full name to capitalize.
 * @returns {string} The capitalized name.
 */

function capitalize(fullName) {
  if (!fullName) return '';
  return fullName
    .toLowerCase()
    .split(' ')
    .map((word) =>
      word
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-'),
    )
    .join(' ');
}

/**
 * Retrieves the data from the add contact form inputs and returns it as an object.
 */
function getContactData() {
  const name = nameInputAdd.value.trim();
  const email = emailInputAdd.value.trim();
  const rawPhone = phoneInputAdd.value.trim();
  const phone = rawPhone.replace(/[^\d+]/g, '');
  return { name, email, phone };
}

/**
 * Formats the contact data before saving.
 *
 * @returns {{name: string, email: string, phone: string}} The formatted contact data.
 */
function formatContactData() {
  const data = getContactData();
  return {
    ...data,
    name: capitalize(data.name),
  };
}

/**
 * Handles the contact edit form submission.
 *
 * @param {SubmitEvent} event - The submit event object.
 * @param {string} contactId - The ID of the contact to edit.
 * @returns {Promise<void>}
 */
async function editContact(event, contactId) {
  event.preventDefault();
  const btn = event.target.querySelector('.create-btn');
  if (!validateEditForm()) return;
  btn.disabled = true;
  const dialogRef = document.getElementById('editContactDialog');
  const contactData = getContactFormData(dialogRef);
  const formattedData = { ...contactData, name: capitalize(contactData.name) };
  await updateContactData(contactId, formattedData);
  await closeDialogAndRender(dialogRef);
  showUpdatedContactDetails(contactId);
  const element = document.querySelector(`.contact[data-id="${contactId}"]`);
  element.scrollIntoView();
  btn.disabled = false;
}

/**
 * Finalizes the contact creation process.
 *
 * @param {string} id - The ID of the created contact.
 * @param {{name: string, email: string, phone: string}} contactData - The contact data.
 * @returns {Promise<void>}
 */
async function finishContactCreation(id, contactData) {
  await renderContacts();
  showNewContactDetails(id, contactData);
  addSlideInAnimation('#contactCreatedSignal', 500);
  removeSlideInAnimation('#contactCreatedSignal', 3000);
  closeDialog(addContactDialog.querySelector('.close-btn'));
}

/**
 * Retrieves the data from the edit contact form inputs and returns it as an object.
 *
 * @param {HTMLElement} dialogRef - The dialog element containing the form.
 * @returns {Object} The contact data.
 */
function getContactFormData(dialogRef) {
  const form = dialogRef.querySelector('form');
  const nameInput = form.querySelector('input[id^="nameInput"]');
  const emailInput = form.querySelector('input[id^="emailInput"]');
  const phoneInput = form.querySelector('input[id^="phoneInput"]');
  const rawPhone = phoneInput.value.trim();
  return {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: rawPhone.replace(/[^\d+]/g, ''),
  };
}

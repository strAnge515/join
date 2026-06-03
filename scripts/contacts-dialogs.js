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
// --- NEUE IMPORTE FÜR USER STORY 4 & 5 ---
import { loadTasks, updateTask } from './backend-tasks.js';
import { findUserByEmail, updateUser, deleteUser } from './backend-users.js';

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
 * @param {string} elementId - The ID of the element to clear.
 */
function clearInputs(elementId) {
  const dialogRef = document.getElementById(elementId);
  if (!dialogRef) return;
  const inputs = dialogRef.querySelectorAll('input');
  inputs.forEach((input) => {
    input.value = '';
  });
}

/**
 * Closes an open dialog and clears its input fields.
 *
 * @param {HTMLElement} element - An element inside the dialog.
 * @param {Function} callback - A function to call after closing the dialog.
 */
export function closeDialog(element, callback = null) {
  document.body.style.overflow = '';
  const dialogRef = element.closest('dialog');
  const elementId = element.id;
  dialogRef.classList.remove('show');
  setTimeout(() => {
    dialogRef.close();
  }, 100);
  clearAllInputErrors(dialogRef);
  clearInputs(elementId);

  if (callback) {
    callback();
  }
}

/**
 * Executes contact deletion and clears the detail view after the overlay is removed.
 * @param {HTMLElement} overlay - The confirm overlay element to remove.
 * @param {string} contactId - The Firebase ID of the contact to delete.
 */
async function executeContactDelete(overlay, contactId) {
  const contactToDelete = state.contacts.find((c) => c.id == contactId);
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const isCurrentUser =
    currentUser.email &&
    contactToDelete &&
    contactToDelete.email === currentUser.email;

  let contactFullName = '';
  if (contactToDelete) {
    contactFullName =
      contactToDelete.name ||
      `${contactToDelete.firstName} ${contactToDelete.lastName}`.trim();
  }

  if (overlay.tagName === 'DIALOG') {
    overlay.close();
  } else {
    overlay.remove();
  }

  await deleteContact(contactId);

  try {
    const tasks = await loadTasks();
    if (tasks && Array.isArray(tasks)) {
      for (let task of tasks) {
        let hasChanges = false;
        let updatedTaskData = {};

        if (task.assigned_to && Array.isArray(task.assigned_to)) {
          const updatedAssigned = task.assigned_to.filter((assigned) => {
            const isNameMatch =
              typeof assigned === 'string' && assigned === contactFullName;
            const isIdMatch = assigned.id && assigned.id === contactId;
            return !isNameMatch && !isIdMatch;
          });

          if (updatedAssigned.length !== task.assigned_to.length) {
            updatedTaskData.assigned_to = updatedAssigned;
            hasChanges = true;
          }
        }

        if (task.assignedTo && Array.isArray(task.assignedTo)) {
          const updatedAssigned2 = task.assignedTo.filter((assigned) => {
            const isNameMatch =
              typeof assigned === 'string' && assigned === contactFullName;
            const isIdMatch = assigned.id && assigned.id === contactId;
            return !isNameMatch && !isIdMatch;
          });

          if (updatedAssigned2.length !== task.assignedTo.length) {
            updatedTaskData.assignedTo = updatedAssigned2;
            hasChanges = true;
          }
        }

        if (hasChanges) {
          await updateTask(task.id, updatedTaskData);
        }
      }
    }
  } catch (taskError) {
    console.error('Fehler beim Entfernen aus Tasks:', taskError);
  }

  if (isCurrentUser) {
    const userDoc = await findUserByEmail(contactToDelete.email);
    if (userDoc) await deleteUser(userDoc.id);
    sessionStorage.clear();
    window.location.href = '../index.html';
    return;
  }

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
  const dialogRef = document.getElementById('confirmContactDeleteDialog');
  dialogRef.innerHTML = getContactConfirmHTML();
  dialogRef.showModal();
  addEventListenersToCloseDialog(dialogRef);
  dialogRef
    .querySelector('#confirmCancelContact')
    .addEventListener('click', () => dialogRef.close());
  dialogRef
    .querySelector('#confirmDeleteContact')
    .addEventListener('click', () =>
      executeContactDelete(dialogRef, contactId),
    );
}

/**
 * Closes a dialog when the Esc key is pressed.
 * @param {HTMLElement} dialogRef - The dialog element.
 * @param {Function} callback - A function to call after closing the dialog.
 */
function closeWithEscKey(dialogRef, callback = null) {
  if (dialogRef.dataset.escKeyBound) return;
  dialogRef.dataset.escKeyBound = 'true';
  dialogRef.onkeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog(dialogRef, callback);
    }
  };
}

/**
 * Closes a dialog when clicking outside of it.
 * @param {HTMLElement} dialogRef - The dialog element.
 * @param {Function} callback - A function to call after closing the dialog.
 */
function closeWithOutsideClick(dialogRef, callback = null) {
  if (dialogRef.dataset.outsideClickBound) return;
  dialogRef.dataset.outsideClickBound = 'true';
  dialogRef.addEventListener('click', (event) => {
    if (event.target === dialogRef) {
      closeDialog(event.target, callback);
    }
  });
}

/**
 * Adds event listeners to close a dialog when clicking outside of it or pressing the Escape key.
 *
 * @param {HTMLElement} dialogRef - The dialog element.
 * @param {Function} callback - A function to call after closing the dialog.
 */
export function addEventListenersToCloseDialog(dialogRef, callback = null) {
  closeWithEscKey(dialogRef, callback);
  closeWithOutsideClick(dialogRef, callback);
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

  // --- NEU: User Story 5 (E-Mail Update in Login-System) ---
  const oldContact = state.contacts.find((c) => c.id == contactId);
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const isCurrentUser =
    currentUser.email && oldContact && oldContact.email === currentUser.email;

  await updateContactData(contactId, formattedData);

  if (isCurrentUser) {
    const userDoc = await findUserByEmail(oldContact.email);
    if (userDoc) {
      await updateUser(userDoc.id, {
        name: formattedData.name,
        email: formattedData.email,
      });
      sessionStorage.setItem(
        'currentUser',
        JSON.stringify({
          name: formattedData.name,
          email: formattedData.email,
        }),
      );
    }
  }
  // -----------------------------------------------------------

  await closeDialogAndRender(dialogRef);
  showUpdatedContactDetails(contactId);
  const element = document.querySelector(`.contact[data-id="${contactId}"]`);
  if (element) element.scrollIntoView();
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

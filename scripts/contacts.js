import {
  saveContact,
  loadContacts,
  deleteContact,
  updateContact,
} from './backend-contacts.js';

const colors = [
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

let contacts = [];
let activeContactId = null;

// Group contacts by first letter
function groupContactsByLetter(contacts) {
  const grouped = {};
  contacts.forEach((contact) => {
    const letter = contact.firstName.charAt(0).toUpperCase();
    if (!grouped[letter]) {
      grouped[letter] = [];
    }
    grouped[letter].push(contact);
  });
  return grouped;
}
window.addEventListener('load', () => {
  renderContacts();
});

// Creates a letter element for grouping contacts
function createLetterElement(letter) {
  const el = document.createElement('div');
  el.className = 'letter';
  el.textContent = letter;
  return el;
}

// Creates a button for contact with avatar and information
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

// Loads contacts from the database, prepares the data by splitting the name into first and last name and assigning a color based on the email, then returns the prepared contacts
export async function loadAndPrepareContacts() {
  contacts = await loadContacts();
  if (!contacts || contacts.length === 0) return [];
  return contacts.map((contact) => {
    const [firstName, ...rest] = contact.name.split(' ');
    return {
      ...contact,
      firstName,
      lastName: rest.join(' '),
      color: stringToColor(contact.email),
    };
  });
}

// Renders the contact list by grouping the contacts by the first letter of their first name and creating the corresponding elements for the letters and contacts, then adds event listeners to the contact buttons
function renderContactList(contactlistRef, groupedContacts) {
  contactlistRef.innerHTML = '';
  if (Object.keys(groupedContacts).length === 0) {
    contactlistRef.innerHTML = '<p>Keine Kontakte gefunden</p>';
    return;
  }
  Object.keys(groupedContacts)
    .sort()
    .forEach((letter) => {
      contactlistRef.appendChild(createLetterElement(letter));
      groupedContacts[letter].forEach((contact) => {
        contactlistRef.appendChild(createContactElement(contact));
      });
    });
  addEventListeners();
}

//renders the contact list
async function renderContacts() {
  const contactlistRef = document.getElementById('contact-list');
  contactlistRef.innerHTML = 'Lade Kontakte...';
  contacts = await loadAndPrepareContacts();
  const grouped = groupContactsByLetter(contacts);
  renderContactList(contactlistRef, grouped);
}

// Converts a string (email) to a color for the avatar background
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

//add onclick functions to the edit and delete buttons in the contact details view
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

// Toggles the active state of a contact in the list
function toggleActiveContact(element) {
  const allContacts = document.querySelectorAll('.contact');
  allContacts.forEach((contact) => contact.classList.remove('active'));
  element.classList.add('active');
}

// Displays the details of a contact when clicked and highlights the active contact in the list
function showContactDetails(element, contact) {
  if (activeContactId === contact.id) return;
  activeContactId = contact.id;
  const contactDetailsRef = document.getElementById('contact-details');
  const initials = contact.firstName[0] + contact.lastName[0];
  const color = contact.color;
  toggleActiveContact(element);
  contactDetailsRef.innerHTML = getContactDetailTemplate(
    contact,
    initials,
    color,
  );
  addSlideInAnimation('#contactDetailCard', 10);
  addDetailEventListeners();
}

// Adds event listeners to close a dialog when clicking outside of it or pressing the Escape key
function addEventListenersToCloseDialog(dialogRef) {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (dialogRef.open) {
        event.preventDefault();
        closeDialog(dialogRef);
      }
    }
  });
  dialogRef.addEventListener('click', (event) => {
    if (event.target === dialogRef) {
      closeDialog(event.target);
    }
  });
}

function focusElement(elementId) {
  const focusElement = document.getElementById(elementId);
  focusElement.focus();
  const length = focusElement.value.length;
  focusElement.setSelectionRange(length, length);
}

// Opens the dialog to add a new contact
function openAddContactDialog() {
  const dialogRef = document.getElementById('addContactDialog');
  dialogRef.showModal();
  focusElement('nameInputAdd');
  dialogRef.classList.add('show');
  addEventListenersToCloseDialog(dialogRef);
}

// Adds event listeners to the edit contact dialog form and close button
function addEditDialogEventListeners() {
  const dialogRef = document.getElementById('editContactDialog');
  const deleteBtnRef = document.getElementById('deleteContactBtnEditDialog');
  const form = dialogRef.querySelector('form');
  form.addEventListener('submit', (event) => {
    editContact(event, activeContactId);
  });
  deleteBtnRef.addEventListener('click', (event) => {
    deleteThisContact(activeContactId);
  });
  addEventListenersToCloseDialog(dialogRef);
}

// Opens the dialog to edit an existing contact and pre-fills the form with the contact's current information
function openEditContactDialog(contactId) {
  const contact = contacts.find((contact) => contact.id == contactId);
  const dialogRef = document.getElementById('editContactDialog');
  const initials = contact.firstName[0] + contact.lastName[0];
  const color = contact.color;
  dialogRef.innerHTML = '';
  dialogRef.innerHTML = getEditContactTemplate(contact, initials, color);
  dialogRef.showModal();
  focusElement('nameInputEdit');
  dialogRef.classList.add('show');
  addEditDialogEventListeners();
  addEventListeners();
}

// Closes an open dialog
function closeDialog(element) {
  const dialogRef = element.closest('dialog');
  dialogRef.classList.remove('show');
  setTimeout(() => {
    dialogRef.close();
  }, 300);
  clearInputs('editContactForm');
  clearInputs('newContactForm');
}

// Deletes a contact after confirming the action with the user, then re-renders the contact list and clears the contact details view
async function deleteThisContact(contactId) {
  const confirmDelete = confirm('Kontakt wirklich löschen?'); //isn't in the figma design, but it's a good idea to prevent accidental deletions. Maybe we find a more elegant solution for this in the future, like a confirmation dialog instead of the browser's built-in confirm function.
  if (!confirmDelete) return;
  await deleteContact(contactId);
  renderContacts();
  document.getElementById('contact-details').innerHTML = '';
}

// Retrieves the data from the add contact form inputs and returns it as an object
function getContactData() {
  const name = nameInputAdd.value.trim();
  const email = emailInputAdd.value.trim();
  const rawPhone = phoneInputAdd.value.trim();
  const phone = rawPhone.replace(/[^\d+]/g, '');
  return { name, email, phone };
}

// Shows the details of a newly added contact by finding the corresponding contact element in the list and calling the showContactDetails function with the new contact's data
function showNewContactDetails(id, contactData) {
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

// Clears the input fields in the add contact form after a new contact has been added
function clearInputs(formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll('input');
  inputs.forEach((input) => {
    input.value = '';
  });
}

// Capitalizes the first letter of a string and converts the rest to lowercase
function capitalize(fullName) {
  if (!fullName) return '';

  // Jedes Wort im Namen (durch Leerzeichen getrennt)
  return fullName
    .toLowerCase()
    .split(' ')
    .map((word) =>
      // jedes Teilstück bei Bindestrich großschreiben
      word
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-'),
    )
    .join(' ');
}

// Adds a slide-in animation to a container
function addSlideInAnimation(ref, time) {
  const element = document.querySelector(ref);
  setTimeout(() => {
    element.classList.add('slide-in');
  }, time);
}

// Removes the slide-in animation class from a container
function removeSlideInAnimation(ref, time) {
  const element = document.querySelector(ref);
  setTimeout(() => {
    element.classList.remove('slide-in');
  }, time);
}

// Handles the submission of the add contact form, saves the new contact to the database, re-renders the contact list, and shows the details of the newly added contact
async function handleAddContact(event) {
  event.preventDefault();
  const contactData = getContactData();
  const formattedData = {
    ...contactData,
    name: capitalize(contactData.name),
  };
  const id = await saveContact(formattedData);
  await renderContacts();
  showNewContactDetails(id, formattedData);
  addSlideInAnimation('#contactCreatedSignal', 500);
  removeSlideInAnimation('#contactCreatedSignal', 3000);
  clearInputs('newContactForm');
  closeDialog(addContactDialog.querySelector('.close-btn'));
}

// Retrieves the data from the edit contact form inputs and returns it as an object
function getContactFormData(dialogRef) {
  const nameInput = dialogRef.querySelector('input[type="text"]');
  const emailInput = dialogRef.querySelector('input[type="email"]');
  const phoneInput = dialogRef.querySelector('input[type="tel"]');
  const rawPhone = phoneInput.value.trim();
  return {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: rawPhone.replace(/[^\d+]/g, ''),
  };
}

// Updates the contact data in the database with the new values from the edit contact form
async function updateContactData(contactId, data) {
  await updateContact(contactId, data);
}

// Closes the dialog and re-renders the contact list
async function closeDialogAndRender(dialogRef) {
  dialogRef.close();
  await renderContacts();
}

// Shows the details of the updated contact
function showUpdatedContactDetails(contactId) {
  activeContactId = '';
  const updatedContact = contacts.find((c) => c.id == contactId);
  if (!updatedContact) return;
  const contactEl = document.querySelector(`.contact[data-id="${contactId}"]`);
  if (contactEl) {
    showContactDetails(contactEl, updatedContact);
  }
}

// Handles the submission of the edit contact form, updates the contact in the database, re-renders the contact list, and shows the details of the updated contact
async function editContact(event, contactId) {
  event.preventDefault();
  const element = document.querySelector(`.contact[data-id="${contactId}"]`);
  const dialogRef = document.getElementById('editContactDialog');
  const contactData = getContactFormData(dialogRef);
  const formattedData = {
    ...contactData,
    name: capitalize(contactData.name),
  };
  await updateContactData(contactId, formattedData);
  await closeDialogAndRender(dialogRef);
  showUpdatedContactDetails(contactId);
  element.scrollIntoView();
}

//Add event listeners to the add contact button, the close buttons in the dialogs, and the submit event of the add contact form
function addEventListeners() {
  document
    .getElementById('addContactBtn')
    .addEventListener('click', openAddContactDialog);
  document.querySelectorAll('.btn-to-close').forEach((btn) => {
    btn.addEventListener('click', (e) => closeDialog(e.target));
  });
  document
    .getElementById('newContactForm')
    .addEventListener('submit', handleAddContact);
}

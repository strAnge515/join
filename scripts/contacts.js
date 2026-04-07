import {
  saveContact,
  loadContacts,
  deleteContact,
  updateContact,
} from './backend-contacts.js';

const colors = [
  '#f44336',
  '#e53935',
  '#d32f2f',
  '#c62828',
  '#e91e63',
  '#d81b60',
  '#ad1457',
  '#9c27b0',
  '#8e24aa',
  '#6a1b9a',
  '#673ab7',
  '#5e35b1',
  '#4527a0',
  '#3f51b5',
  '#3949ab',
  '#283593',
  '#1e88e5',
  '#1976d2',
  '#1565c0',
  '#039be5',
  '#0288d1',
  '#0277bd',
  '#00897b',
  '#00796b',
  '#00695c',
  '#43a047',
  '#388e3c',
  '#2e7d32',
  '#7cb342',
  '#689f38',
  '#558b2f',
  '#fbc02d',
  '#f9a825',
  '#f57f17',
  '#fb8c00',
  '#ef6c00',
  '#e65100',
  '#f4511e',
  '#e64a19',
  '#d84315',
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
async function loadAndPrepareContacts() {
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
  addDetailEventListeners();
}

// Opens the dialog to add a new contact
function openAddContactDialog() {
  const dialogRef = document.getElementById('addContactDialog');
  dialogRef.showModal();
  dialogRef.classList.add('show');
  dialogRef.addEventListener('click', (event) => {
    if (event.target === dialogRef) {
      closeDialog(event.target);
    }
  });
}

// Adds event listeners to the edit contact dialog form and close button
function addEditDialogEventListeners() {
  const dialogRef = document.getElementById('editContactDialog');
  const form = dialogRef.querySelector('form');
  form.addEventListener('submit', (event) => {
    editContact(event, activeContactId);
  });
  dialogRef.addEventListener('click', (event) => {
    if (event.target === dialogRef) {
      closeDialog(event.target);
    }
  });
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
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  return { name, email, phone };
}

// Shows the details of a newly added contact by finding the corresponding contact element in the list and calling the showContactDetails function with the new contact's data
function showNewContactDetails(id, contactData) {
  const el = document.querySelector(`.contact[data-id="${id}"]`);
  if (!el) return;
  const [firstName, ...rest] = contactData.name.split(' ');
  const contact = {
    id,
    firstName,
    lastName: rest.join(' '),
    email: contactData.email,
    phone: contactData.phone,
    color: stringToColor(contactData.email),
  };
  showContactDetails(el, contact);
}

// Clears the input fields in the add contact form after a new contact has been added
function clearInputs() {
  document.getElementById('nameInput').value = '';
  document.getElementById('emailInput').value = '';
  document.getElementById('phoneInput').value = '';
}

// Handles the submission of the add contact form, saves the new contact to the database, re-renders the contact list, and shows the details of the newly added contact
async function handleAddContact(event) {
  event.preventDefault();
  const contactData = getContactData();
  const id = await saveContact(contactData);
  await renderContacts();
  showNewContactDetails(id, contactData);
  clearInputs();
  closeDialog(addContactDialog.querySelector('.close-btn'));
}

// Retrieves the data from the edit contact form inputs and returns it as an object
function getContactFormData(dialogRef) {
  const nameInput = dialogRef.querySelector('input[type="text"]');
  const emailInput = dialogRef.querySelector('input[type="email"]');
  const phoneInput = dialogRef.querySelector('input[type="tel"]');
  return {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
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
  const dialogRef = document.getElementById('editContactDialog');
  const data = getContactFormData(dialogRef);
  await updateContactData(contactId, data);
  await closeDialogAndRender(dialogRef);
  showUpdatedContactDetails(contactId);
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

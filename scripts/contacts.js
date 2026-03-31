import {
  saveContact,
  loadContacts,
  deleteContact,
  updateContact,
} from './backend-contacts.js';
// const contacts = [
//   {
//     firstName: 'Anton',
//     lastName: 'Mayer',
//     email: 'anton@gmail.com',
//     phone: '+49 123 456789',
//   },
//   {
//     firstName: 'Anja',
//     lastName: 'Schulz',
//     email: 'schulz@hotmail.com',
//     phone: '+49 987 654321',
//   },
//   {
//     firstName: 'Benedikt',
//     lastName: 'Ziegler',
//     email: 'benedikt@gmail.com',
//     phone: '+49 555 222333',
//   },
//   {
//     firstName: 'David',
//     lastName: 'Eisenberg',
//     email: 'davidberg@gmail.com',
//     phone: '+49 444 111222',
//   },
//   {
//     firstName: 'Eva',
//     lastName: 'Fischer',
//     email: 'eva@gmail.com',
//     phone: '+49 777 888999',
//   },
//   {
//     firstName: 'Emmanuel',
//     lastName: 'Mauer',
//     email: 'emmanuel@gmail.com',
//     phone: '+49 666 333444',
//   },
//   {
//     firstName: 'Felix',
//     lastName: 'Krüger',
//     email: 'felix.krueger@gmail.com',
//     phone: '+49 111 222333',
//   },
//   {
//     firstName: 'Greta',
//     lastName: 'Wolf',
//     email: 'greta.wolf@gmail.com',
//     phone: '+49 222 333444',
//   },
//   {
//     firstName: 'Hannah',
//     lastName: 'Neumann',
//     email: 'hannah.neumann@gmail.com',
//     phone: '+49 333 444555',
//   },
//   {
//     firstName: 'Jonas',
//     lastName: 'Bauer',
//     email: 'jonas.bauer@gmail.com',
//     phone: '+49 444 555666',
//   },
//   {
//     firstName: 'Klara',
//     lastName: 'Becker',
//     email: 'klara.becker@gmail.com',
//     phone: '+49 555 666777',
//   },
//   {
//     firstName: 'Leon',
//     lastName: 'Hoffmann',
//     email: 'leon.hoffmann@gmail.com',
//     phone: '+49 666 777888',
//   },
//   {
//     firstName: 'Marie',
//     lastName: 'Schneider',
//     email: 'marie.schneider@gmail.com',
//     phone: '+49 777 888000',
//   },
//   {
//     firstName: 'Niklas',
//     lastName: 'Richter',
//     email: 'niklas.richter@gmail.com',
//     phone: '+49 888 999111',
//   },
//   {
//     firstName: 'Olivia',
//     lastName: 'Klein',
//     email: 'olivia.klein@gmail.com',
//     phone: '+49 999 000222',
//   },
//   {
//     firstName: 'Paul',
//     lastName: 'Zimmermann',
//     email: 'paul.zimmermann@gmail.com',
//     phone: '+49 101 202303',
//   },
// ].map((contact, index) => ({
//   id: index + 1,
//   ...contact,
// }));

// let nextId = contacts.length + 1;

// contacts.forEach((contact) => {
//   contact.color = stringToColor(contact.email);
// });

// Kontakte nach Anfangsbuchstaben gruppieren
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

let contacts = [];
let activeContactId = null;

function createLetterElement(letter) {
  const el = document.createElement('div');
  el.className = 'letter';
  el.textContent = letter;
  return el;
}

function createContactElement(contact) {
  const initials = contact.firstName[0] + contact.lastName[0];
  const item = document.createElement('button');
  item.className = 'contact';
  item.dataset.id = contact.id;
  item.addEventListener('click', () => {
    showContactDetails(item, contact);
  });
  item.innerHTML = getContactTemplate(contact, initials);
  return item;
}

// function renderContacts() {
//   const list = document.getElementById('contact-list');
//   list.innerHTML = '';
//   const grouped = groupContactsByLetter(contacts);
//   Object.keys(grouped)
//     .sort()
//     .forEach((letter) => {
//       list.appendChild(createLetterElement(letter));
//       grouped[letter].forEach((contact) => {
//         list.appendChild(createContactElement(contact));
//       });
//     });
// }

async function renderContacts() {
  const list = document.getElementById('contact-list');
  list.innerHTML = 'Lade Kontakte...';
  contacts = await loadContacts();
  list.innerHTML = '';
  if (!contacts || contacts.length === 0) {
    list.innerHTML = '<p>Keine Kontakte gefunden</p>';
    return;
  }
  contacts = contacts.map((c) => {
    const [firstName, ...rest] = c.name.split(' ');
    return {
      ...c,
      firstName,
      lastName: rest.join(' '),
      color: stringToColor(c.email),
    };
  });
  const grouped = groupContactsByLetter(contacts);
  Object.keys(grouped)
    .sort()
    .forEach((letter) => {
      list.appendChild(createLetterElement(letter));
      grouped[letter].forEach((contact) => {
        list.appendChild(createContactElement(contact));
      });
    });
  addEventListeners();
}

//Farben für die Avatare generieren
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#f44336',
    '#e91e63',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#03a9f4',
    '#00bcd4',
    '#009688',
    '#4caf50',
    '#8bc34a',
    '#ffc107',
    '#ff9800',
    '#ff5722',
  ];
  return colors[Math.abs(hash) % colors.length];
}

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

function toggleActiveContact(element) {
  const allContacts = document.querySelectorAll('.contact');
  allContacts.forEach((contact) => contact.classList.remove('active'));
  element.classList.add('active');
}

function openAddContactDialog() {
  const dialogRef = document.getElementById('addContactDialog');
  dialogRef.showModal();
  dialogRef.classList.add('show');
  dialogRef.addEventListener('close', () => {
    dialogRef.classList.remove('show');
  });
}

function openEditContactDialog(contactId) {
  const contact = contacts.find((contact) => contact.id == contactId);
  const dialogRef = document.getElementById('editContactDialog');
  const initials = contact.firstName[0] + contact.lastName[0];
  const color = contact.color;
  dialogRef.innerHTML = '';
  dialogRef.innerHTML = getEditContactTemplate(contact, initials, color);
  dialogRef.showModal();
  dialogRef.classList.add('show');
  const form = dialogRef.querySelector('form');
  form.addEventListener('submit', (event) => {
    editContact(event, contactId);
  });
  dialogRef.addEventListener('close', () => {
    dialogRef.classList.remove('show');
  });
  addEventListeners();
}

function closeDialog(element) {
  const dialogRef = element.closest('dialog');
  dialogRef.close();
}

// function deleteContact(contactId) {
//   const confirmDelete = confirm('Kontakt wirklich löschen?');
//   if (!confirmDelete) return;
//   const index = contacts.findIndex((c) => c.id === contactId);
//   const contactDetailsRef = document.getElementById('contact-details');
//   if (index !== -1) {
//     contacts.splice(index, 1);
//     renderContacts();
//     contactDetailsRef.innerHTML = '';
//   }
// }

async function deleteThisContact(contactId) {
  const confirmDelete = confirm('Kontakt wirklich löschen?');
  if (!confirmDelete) return;
  await deleteContact(contactId);
  renderContacts();
  document.getElementById('contact-details').innerHTML = '';
}

// function handleAddContact(event) {
//   event.preventDefault();
//   const nameValue = document.getElementById('nameInput').value.trim();
//   const email = document.getElementById('emailInput').value.trim();
//   const phone = document.getElementById('phoneInput').value.trim();
//   const [firstName, ...rest] = nameValue.split(' ');
//   const lastName = rest.join(' ') || '';
//   const newContact = {
//     firstName,
//     lastName,
//     email,
//     phone,
//   };
//   addContact(newContact);
//   renderContacts();
//   clearInputs();
//   closeDialog(
//     document.getElementById('addContactDialog').querySelector('.close-btn'),
//   );
// }

async function handleAddContact(event) {
  event.preventDefault();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const id = await saveContact({ name, email, phone });
  await renderContacts();
  const el = document.querySelector(`.contact[data-id="${id}"]`);
  const [firstName, ...rest] = name.split(' ');
  const contact = {
    id,
    firstName,
    lastName: rest.join(' '),
    email,
    phone,
    color: stringToColor(email),
  };
  if (el) showContactDetails(el, contact);
  clearInputs();
  closeDialog(addContactDialog.querySelector('.close-btn'));
}

function clearInputs() {
  document.getElementById('nameInput').value = '';
  document.getElementById('emailInput').value = '';
  document.getElementById('phoneInput').value = '';
}

// function addContact(newContact) {
//   contacts.push({
//     id: nextId++,
//     ...newContact,
//     color: stringToColor(newContact.email),
//   });
// }

// function editContact(event, contactId) {
//   event.preventDefault();
//   const contact = contacts.find((contact) => contact.id === contactId);
//   const activeContactElement = document.querySelector('.contact.active');
//   const dialogRef = document.getElementById('editContactDialog');
//   const nameInput = dialogRef.querySelector('input[type="text"]');
//   const emailInput = dialogRef.querySelector('input[type="email"]');
//   const phoneInput = dialogRef.querySelector('input[type="tel"]');
//   const [firstName, ...lastNameParts] = nameInput.value.trim().split(' ');
//   const lastName = lastNameParts.join(' ');
//   contact.firstName = firstName;
//   contact.lastName = lastName;
//   contact.email = emailInput.value.trim();
//   contact.phone = phoneInput.value.trim();
//   dialogRef.close();
//   renderContacts();
//   showContactDetails(activeContactElement, contact);
// }

async function editContact(event, contactId) {
  event.preventDefault();

  const dialogRef = document.getElementById('editContactDialog');

  const nameInput = dialogRef.querySelector('input[type="text"]');
  const emailInput = dialogRef.querySelector('input[type="email"]');
  const phoneInput = dialogRef.querySelector('input[type="tel"]');

  await updateContact(contactId, {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
  });
  dialogRef.close();
  await renderContacts();
  const updatedContact = contacts.find((c) => c.id == activeContactId);
  if (updatedContact) {
    const allContacts = document.querySelectorAll('.contact');

    allContacts.forEach((el) => {
      if (el.textContent.includes(updatedContact.firstName)) {
        showContactDetails(el, updatedContact);
      }
    });
  }
}

// window.openAddContactDialog = openAddContactDialog;
// window.closeDialog = closeDialog;
// window.handleAddContact = handleAddContact;

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

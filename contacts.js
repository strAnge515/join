const contacts = [
  {
    firstName: 'Anton',
    lastName: 'Mayer',
    email: 'anton@gmail.com',
    phone: '+49 123 456789',
  },
  {
    firstName: 'Anja',
    lastName: 'Schulz',
    email: 'schulz@hotmail.com',
    phone: '+49 987 654321',
  },
  {
    firstName: 'Benedikt',
    lastName: 'Ziegler',
    email: 'benedikt@gmail.com',
    phone: '+49 555 222333',
  },
  {
    firstName: 'David',
    lastName: 'Eisenberg',
    email: 'davidberg@gmail.com',
    phone: '+49 444 111222',
  },
  {
    firstName: 'Eva',
    lastName: 'Fischer',
    email: 'eva@gmail.com',
    phone: '+49 777 888999',
  },
  {
    firstName: 'Emmanuel',
    lastName: 'Mauer',
    email: 'emmanuel@gmail.com',
    phone: '+49 666 333444',
  },
].map((contact, index) => ({
  id: index + 1,
  ...contact,
}));

let nextId = contacts.length + 1;

contacts.forEach((contact) => {
  contact.color = stringToColor(contact.email);
});

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
  item.addEventListener('click', () => {
    showContactDetails(item, contact);
  });
  item.innerHTML = getContactTemplate(contact, initials);
  return item;
}

function renderContacts() {
  const list = document.getElementById('contact-list');
  list.innerHTML = '';
  const grouped = groupContactsByLetter(contacts);
  Object.keys(grouped)
    .sort()
    .forEach((letter) => {
      list.appendChild(createLetterElement(letter));
      grouped[letter].forEach((contact) => {
        list.appendChild(createContactElement(contact));
      });
    });
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

function showContactDetails(element, contact) {
  const contactDetailsRef = document.getElementById('contact-details');
  const initials = contact.firstName[0] + contact.lastName[0];
  const color = contact.color;
  toggleActiveContact(element);
  contactDetailsRef.innerHTML = getContactDetailTemplate(
    contact,
    initials,
    color,
  );
}

function toggleActiveContact(element) {
  const allContacts = document.querySelectorAll('.contact');
  allContacts.forEach((contact) => contact.classList.remove('active'));
  element.classList.add('active');
}

function openAddContactDialog() {
  const dialog = document.getElementById('addContactDialog');
  dialog.showModal();
}

function openEditContactDialog(contactId) {
  const contact = contacts.find((contact) => contact.id === contactId);
  const dialog = document.getElementById('editContactDialog');
  const initials = contact.firstName[0] + contact.lastName[0];
  const color = contact.color;
  dialog.innerHTML = '';
  dialog.innerHTML = getEditContactTemplate(contact, initials, color);
  dialog.showModal();
}

function closeDialog(element) {
  const dialog = element.closest('dialog');
  dialog.close();
}

function deleteContact(contactId) {
  const confirmDelete = confirm('Kontakt wirklich löschen?');
  if (!confirmDelete) return;
  const index = contacts.findIndex((c) => c.id === contactId);
  const contactDetailsRef = document.getElementById('contact-details');
  if (index !== -1) {
    contacts.splice(index, 1);
    renderContacts();
    contactDetailsRef.innerHTML = '';
  }
}

function handleAddContact(event) {
  event.preventDefault();
  const nameValue = document.getElementById('nameInput').value.trim();
  const email = document.getElementById('emailInput').value.trim();
  const phone = document.getElementById('phoneInput').value.trim();
  const [firstName, ...rest] = nameValue.split(' ');
  const lastName = rest.join(' ') || '';
  const newContact = {
    firstName,
    lastName,
    email,
    phone,
  };
  addContact(newContact);
  renderContacts();
  clearInputs();
  closeDialog(
    document.getElementById('addContactDialog').querySelector('.close-btn'),
  );
}

function clearInputs() {
  document.getElementById('nameInput').value = '';
  document.getElementById('emailInput').value = '';
  document.getElementById('phoneInput').value = '';
}

function addContact(newContact) {
  contacts.push({
    id: nextId++,
    ...newContact,
  });
}

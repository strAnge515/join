import { openEditContactDialog, deleteThisContact } from './contacts.js';

function closeContactDetails() {
  const contactDetailsRef = document.getElementById('detailContainer');
  contactDetailsRef.style.display = 'none';
}

export function openContactDetails() {
  const contactDetailsRef = document.getElementById('detailContainer');
  contactDetailsRef.style.display = 'block';
}

function removeActiveStateFromContact() {
  const activeContact = document.querySelector('.contact.active');
  if (activeContact) {
    activeContact.classList.remove('active');
  }
}

function toggleDetailActionButtons() {
  const detailActionsRef = document.getElementById('detailActionsMobile');
  if (detailActionsRef && detailActionsRef.style.display === 'none') {
    detailActionsRef.style.display = 'flex';
  } else {
    detailActionsRef.style.display = 'none';
  }
}

function addBackwardsBtnListener() {
  const backwardsBtnRef = document.getElementById('backwardsBtn');
  if (backwardsBtnRef) {
    backwardsBtnRef.addEventListener('click', () => {
      closeContactDetails();
      removeActiveStateFromContact();
    });
  }
}

function addEditBtnListeners() {
  const editBtnRef = document.getElementById('editContactBtnMobile');
  if (editBtnRef) {
    editBtnRef.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      openEditContactDialog(id);
    });
  }
}

function addDeleteBtnListener() {
  const deleteBtnRef = document.getElementById('deleteContactBtnMobile');
  if (deleteBtnRef) {
    deleteBtnRef.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      deleteThisContact(id);
    });
  }
}

function addMobileMenuBtnListener() {
  const mobileMenuBtnRef = document.getElementById('detailContactMenuBtn');
  if (mobileMenuBtnRef) {
    mobileMenuBtnRef.addEventListener('click', () => {
      toggleDetailActionButtons();
    });
  }
}

//add onclick functions to the edit and delete buttons in the contact details view
export function addMobileDetailEventListeners() {
  addBackwardsBtnListener();
  addEditBtnListeners();
  addDeleteBtnListener();
  addMobileMenuBtnListener();
}

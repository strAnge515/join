import { openEditContactDialog, deleteThisContact } from './contacts.js';

//function to close the contact details view on mobile devices by setting the display to none
export function closeContactDetails() {
  const contactDetailsRef = document.getElementById('detailContainer');
  contactDetailsRef.style.display = 'none';
}

//function to open the contact details view on mobile devices by setting the display to block
export function openContactDetails() {
  const contactDetailsRef = document.getElementById('detailContainer');
  contactDetailsRef.style.display = 'block';
}

//function to remove the active class from the contact that is currently active in the contact list on mobile devices
export function removeActiveStateFromContact() {
  const activeContact = document.querySelector('.contact.active');
  if (activeContact) {
    activeContact.classList.remove('active');
  }
}

//function to toggle the visibility of the action buttons in the contact details view on mobile devices by toggling the class 'close'
function toggleDetailActionButtons() {
  const detailActionsRef = document.getElementById('detailActionsMobile');
  detailActionsRef.classList.toggle('close');
}

//function to add an event listener to the backwards button in the contact details view on mobile devices that closes the contact details view and removes the active state from the contact in the contact list
export function addBackwardsBtnListener() {
  const backwardsBtnRef = document.getElementById('backwardsBtn');
  if (backwardsBtnRef) {
    backwardsBtnRef.addEventListener('click', () => {
      closeContactDetails();
      removeActiveStateFromContact();
    });
  }
}

//function to add an event listener to the edit button in the contact details view on mobile devices that opens the edit contact dialog with the id of the contact to be edited
function addEditBtnListeners() {
  const editBtnRef = document.getElementById('editContactBtnMobile');
  if (editBtnRef) {
    editBtnRef.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      openEditContactDialog(id);
    });
  }
}

//function to add an event listener to the delete button in the contact details view on mobile devices that opens a confirmation dialog and deletes the contact if the user confirms
function addDeleteBtnListener() {
  const deleteBtnRef = document.getElementById('deleteContactBtnMobile');
  if (deleteBtnRef) {
    deleteBtnRef.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      deleteThisContact(id);
    });
  }
}

//function to add an event listener to the mobile menu button in the contact details view on mobile devices that toggles the visibility of the action buttons
export function addMobileMenuBtnListener() {
  const mobileMenuBtnRef = document.getElementById('detailContactMenuBtn');
  if (mobileMenuBtnRef) {
    mobileMenuBtnRef.addEventListener('click', () => {
      toggleDetailActionButtons();
    });
  }
}

//add onclick functions to the edit and delete buttons in the contact details view
export function addMobileDetailEventListeners() {
  addEditBtnListeners();
  addDeleteBtnListener();
}

//add event listener to the DOMContentLoaded event to add the event listeners to the buttons in the contact details view and the mobile menu button
document.addEventListener('DOMContentLoaded', () => {
  addBackwardsBtnListener();
  addMobileMenuBtnListener();
});

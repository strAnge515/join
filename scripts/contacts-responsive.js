import { openEditContactDialog, deleteThisContact } from './contacts.js';

/**
 * Closes the contact details view on mobile devices.
 * Sets the display style to 'none'.
 */
export function closeContactDetails() {
  const contactDetailsRef = document.getElementById('detailContainer');
  contactDetailsRef.style.display = 'none';
}

/**
 * Opens the contact details view on mobile devices.
 * Sets the display style to 'block'.
 */
export function openContactDetails() {
  const contactDetailsRef = document.getElementById('detailContainer');
  contactDetailsRef.style.display = 'block';
}

/**
 * Removes the active class from the currently selected contact.
 */
export function removeActiveStateFromContact() {
  const activeContact = document.querySelector('.contact.active');
  if (activeContact) {
    activeContact.classList.remove('active');
  }
}

/**
 * Toggles the visibility of the mobile action buttons.
 */
function toggleDetailActionButtons() {
  const detailActionsRef = document.getElementById('detailActionsMobile');
  detailActionsRef.classList.toggle('close');
}

/**
 * Adds a click event listener to the backwards button.
 * Closes the detail view and removes the active contact state.
 */
export function addBackwardsBtnListener() {
  const backwardsBtnRef = document.getElementById('backwardsBtn');
  if (backwardsBtnRef) {
    backwardsBtnRef.addEventListener('click', () => {
      closeContactDetails();
      removeActiveStateFromContact();
    });
  }
}

/**
 * Adds a click event listener to the edit button.
 * Opens the edit dialog for the selected contact.
 */
function addEditBtnListeners() {
  const editBtnRef = document.getElementById('editContactBtnMobile');
  if (editBtnRef) {
    editBtnRef.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      openEditContactDialog(id);
    });
  }
}

/**
 * Adds a click event listener to the delete button.
 * Deletes the selected contact.
 */
function addDeleteBtnListener() {
  const deleteBtnRef = document.getElementById('deleteContactBtnMobile');
  if (deleteBtnRef) {
    deleteBtnRef.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      deleteThisContact(id);
    });
  }
}

/**
 * Adds a click event listener to the mobile menu button.
 * Toggles the action button visibility.
 */
export function addMobileMenuBtnListener() {
  const mobileMenuBtnRef = document.getElementById('detailContactMenuBtn');
  if (mobileMenuBtnRef) {
    mobileMenuBtnRef.addEventListener('click', () => {
      toggleDetailActionButtons();
    });
  }
}

/**
 * Adds event listeners to the mobile detail action buttons.
 */
export function addMobileDetailEventListeners() {
  addEditBtnListeners();
  addDeleteBtnListener();
}

/**
 * Initializes mobile detail event listeners after DOM content is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  addBackwardsBtnListener();
  addMobileMenuBtnListener();
});

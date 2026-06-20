import { saveContact } from './backend-contacts.js';
/**
 * Handles user signup functionality, including form validation, user creation in Firestore, and UI feedback.
 * @module signup
 */
import { saveUser } from './backend-users.js';
import { findUserByEmail } from './backend-users.js';
import {
  validateSignupForm,
  showSignupEmailError,
  clearSignupFieldError,
  setupSignupBlurValidation,
} from './signup-validation.js';

/** * DOM Elements */
const form = document.getElementById('signup-form');
const privacyCheckbox = document.getElementById('accept-privacy');
const signupBtn = document.getElementById('signup-btn');
const backArrow = document.getElementById('back-arrow');
const togglePassword = document.getElementById('toggle-signup-password');
const toggleConfirm = document.getElementById('toggle-confirm-password');
const nameInput = document.getElementById('signup-name');
const emailInput = document.getElementById('signup-email');
const passwordInput = document.getElementById('signup-password');
const confirmInput = document.getElementById('signup-confirm-password');
const signupInputs = [nameInput, emailInput, passwordInput, confirmInput];

/**
 * Handles the signup form submission.
 * Validates inputs, checks for duplicates, creates the account and shows feedback.
 * @param {Event} e - The form submit event.
 */
async function handleSignup(e) {
  e.preventDefault();
  if (!validateSignupForm()) return;
  if (!privacyCheckbox.checked) return showPrivacyHint();
  signupBtn.disabled = true;
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  if (await findUserByEmail(email)) {
    showSignupEmailError('This email is already registered.');
    signupBtn.disabled = false;
    return;
  }
  await createAccount(name, email, passwordInput.value.trim());
}

/**
 * Creates the user and a matching contact, then shows the success toast.
 * @param {string} name - The full name of the user.
 * @param {string} email - The email address of the user.
 * @param {string} password - The chosen password.
 */
async function createAccount(name, email, password) {
  await saveUser({ name, email, password });
  await saveContact({ name, email, phone: '' });
  showSuccessToast();
}

/**
 * Enables the signup button once all fields are filled. The privacy policy is checked on submit.
 */
function updateSignupButtonState() {
  signupBtn.disabled = !signupInputs.every((input) => input.value.trim() !== '');
}

/**
 * Shows the hint asking the user to accept the privacy policy.
 */
function showPrivacyHint() {
  const hint = document.getElementById('signup-privacy-error');
  if (hint) hint.innerText = 'Please accept the Privacy policy.';
}

/**
 * Clears the privacy policy hint.
 */
function clearPrivacyHint() {
  const hint = document.getElementById('signup-privacy-error');
  if (hint) hint.innerText = '';
}

/**
 * Attaches input listeners that clear field errors and refresh the button state.
 */
function setupSignupInputListeners() {
  signupInputs.forEach((input) => {
    input.addEventListener('input', () => {
      clearSignupFieldError(input);
      updateSignupButtonState();
    });
  });
}

/**
 * Shows the success toast and redirects to the login page after a short delay.
 */
function showSuccessToast() {
  const toast = document.getElementById('signup-toast');
  toast.classList.add('toast-visible');
  setTimeout(() => {
    window.location.href = './index.html';
  }, 2000);
}

/**
 * Toggles the visibility of a password input field.
 * @param {HTMLInputElement} input - The password input to toggle.
 * @param {HTMLImageElement} icon - The icon element to swap.
 */
function toggleVisibility(input, icon) {
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  icon.src = isPassword ? './assets/img/eye.svg' : './assets/img/lock.svg';
}

privacyCheckbox.addEventListener('change', clearPrivacyHint);
togglePassword.addEventListener('click', () =>
  toggleVisibility(passwordInput, togglePassword),
);
toggleConfirm.addEventListener('click', () =>
  toggleVisibility(confirmInput, toggleConfirm),
);
form.addEventListener('submit', handleSignup);
setupSignupInputListeners();
setupSignupBlurValidation();
updateSignupButtonState();

/**
 * Validates the addcontact form inputs.
 *
 * @returns {boolean} True if all inputs are valid, false otherwise.
 */
export function validateAddForm() {
  let valid = true;
  valid &= checkInput('nameInputAdd', 'nameError', 'Name fehlt');
  valid &= checkName('nameInputAdd', 'nameError');
  valid &= checkInput('emailInputAdd', 'emailError', 'Email fehlt');
  valid &= checkEmail('emailInputAdd', 'emailError');
  valid &= checkInput('phoneInputAdd', 'phoneError', 'Telefon fehlt');
  valid &= checkPhone('phoneInputAdd', 'phoneError');
  return Boolean(valid);
}

/**
 * Validates the edit contact form inputs.
 *
 * @returns {boolean} True if all inputs are valid.
 */
export function validateEditForm() {
  let valid = true;
  valid &= checkInput('nameInputEdit', 'nameErrorEdit', 'Name fehlt');
  valid &= checkName('nameInputEdit', 'nameErrorEdit');
  valid &= checkInput('emailInputEdit', 'emailErrorEdit', 'Email fehlt');
  valid &= checkEmail('emailInputEdit', 'emailErrorEdit');
  valid &= checkInput('phoneInputEdit', 'phoneErrorEdit', 'Telefon fehlt');
  valid &= checkPhone('phoneInputEdit', 'phoneErrorEdit');
  return Boolean(valid);
}

/**
 * Validates the full name input field.
 *
 * @param {string} inputId - The input element ID.
 * @param {string} errorId - The error element ID.
 * @returns {boolean} True if the name is valid.
 */
function checkName(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  const regex =
    /^[A-Za-zÄÖÜäöüß]+(-[A-Za-zÄÖÜäöüß]+)? [A-Za-zÄÖÜäöüß]+(-[A-Za-zÄÖÜäöüß]+)?$/;
  if (!regex.test(input.value.trim())) {
    error.innerText = 'Vor- und Nachname eingeben';
    input.classList.add('input-error');
    return false;
  }
  error.innerText = '';
  input.classList.remove('input-error');
  return true;
}

/**
 * Validates the email input field.
 *
 * @param {string} inputId - The input element ID.
 * @param {string} errorId - The error element ID.
 * @returns {boolean} True if the email is valid.
 */
function checkEmail(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(input.value.trim())) {
    error.innerText = 'Ungültige Email';
    input.classList.add('input-error');
    return false;
  }
  error.innerText = '';
  input.classList.remove('input-error');
  return true;
}

/**
 * Validates the phone input field.
 *
 * @param {string} inputId - The input element ID.
 * @param {string} errorId - The error element ID.
 * @returns {boolean} True if the phone number is valid.
 */
function checkPhone(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  const regex = /^\+?[0-9]+$/;
  if (!regex.test(input.value.trim())) {
    error.innerText = 'Ungültige Telefonnummer';
    input.classList.add('input-error');
    return false;
  }
  error.innerText = '';
  input.classList.remove('input-error');
  return true;
}

/**
 * Checks whether an input field is empty.
 *
 * @param {string} inputId - The input element ID.
 * @param {string} errorId - The error element ID.
 * @param {string} message - The error message to display.
 * @returns {boolean} True if the input is valid.
 */
function checkInput(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (!input.value.trim()) {
    error.innerText = message;
    input.classList.add('input-error');
    return false;
  }
  error.innerText = '';
  input.classList.remove('input-error');
  return true;
}

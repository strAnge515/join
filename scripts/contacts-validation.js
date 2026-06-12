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
 * Validates a field based on a regular expression.
 *
 * @param {string} inputId - The input element ID.
 * @param {string} errorId - The error element ID.
 * @param {RegExp} regex - The regular expression to test against.
 * @param {string} message - The error message to display.
 * @returns {boolean} True if the field is valid.
 */
function validateField(inputId, errorId, regex, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  const isValid = regex.test(input.value.trim());
  error.innerText = isValid ? '' : message;
  input.classList.toggle('input-error', !isValid);
  return isValid;
}

/**
 * Validates full name input using shared regex validation logic.
 *
 * @param {string} inputId - The input element ID.
 * @param {string} errorId - The error element ID.
 * @returns {boolean} True if the name is valid.
 */
function checkName(inputId, errorId) {
  const regex =
    /^[A-Za-zÄÖÜäöüß]+(-[A-Za-zÄÖÜäöüß]+)? [A-Za-zÄÖÜäöüß]+(-[A-Za-zÄÖÜäöüß]+)?$/;
  return validateField(inputId, errorId, regex, 'Vor- und Nachname eingeben');
}

/**
 * Validates email input using shared regex validation logic.
 *
 * @param {string} inputId - The input element ID.
 * @param {string} errorId - The error element ID.
 * @returns {boolean} True if the email is valid.
 */
function checkEmail(inputId, errorId) {
  const regex =
    /^(?!.*\.\.)[a-zA-Z0-9]+([.+_-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
  return validateField(inputId, errorId, regex, 'Ungültige Email');
}

/**
 * Validates phone number input using shared regex validation logic.
 *
 * @param {string} inputId - The input element ID.
 * @param {string} errorId - The error element ID.
 * @returns {boolean} True if the phone number is valid.
 */
function checkPhone(inputId, errorId) {
  const regex = /^\+?[0-9]+$/;
  return validateField(inputId, errorId, regex, 'Ungültige Telefonnummer');
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

/**
 * Adds event listeners to clear error messages when the user starts typing in the input fields.
 * @param {string} inputId - The ID of the input element.
 * @param {string} errorId - The ID of the error element.
 */
export function addClearErrorInputListeners(dialogRef) {
  const inputs = dialogRef.querySelectorAll('input');
  inputs.forEach((input) => {
    input.addEventListener('focus', () => {
      clearInputError(input);
    });
  });
}

/**
 * Clears the error message and error class from an input field.
 *
 * @param {HTMLElement} input - The input element to clear errors from.
 */
function clearInputError(input) {
  const error = input.parentElement.querySelector('.error');
  input.classList.remove('input-error');
  if (error) {
    error.innerText = '';
  }
}

/**
 * Removes all error messages and error styles
 * from the input fields inside a dialog.
 *
 * @param {HTMLDialogElement} dialogRef - The dialog element containing the form inputs and error messages.
 */
export function clearAllInputErrors(dialogRef) {
  const inputs = dialogRef.querySelectorAll('input');
  const errors = dialogRef.querySelectorAll('.error');
  inputs.forEach((input) => {
    input.classList.remove('input-error');
  });
  errors.forEach((error) => {
    error.innerText = '';
  });
}

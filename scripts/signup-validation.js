/**
 * Validates a signup field against a regular expression and toggles its error state.
 *
 * @param {string} inputId - The input element ID.
 * @param {string} errorId - The error element ID.
 * @param {RegExp} regex - The regular expression to test against.
 * @param {string} message - The error message to display when invalid.
 * @returns {boolean} True if the field value is valid.
 */
function validateSignupField(inputId, errorId, regex, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  const isValid = regex.test(input.value.trim());
  error.innerText = isValid ? '' : message;
  input.classList.toggle('input-error', !isValid);
  return isValid;
}


/**
 * Validates the name field, allowing only first and last name separated by a space.
 *
 * @returns {boolean} True if the name is valid.
 */
function checkSignupName() {
  const regex =
    /^[A-Za-zÄÖÜäöüß]+(-[A-Za-zÄÖÜäöüß]+)? [A-Za-zÄÖÜäöüß]+(-[A-Za-zÄÖÜäöüß]+)?$/;
  return validateSignupField('signup-name', 'signup-name-error', regex, 'Please enter your first and last name');
}


/**
 * Validates the email field against a basic email pattern.
 *
 * @returns {boolean} True if the email is valid.
 */
function checkSignupEmail() {
  const regex = /^(?!.*\.\.)[a-zA-Z0-9]+([.+_-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
  return validateSignupField('signup-email', 'signup-email-error', regex, 'Please enter a valid email address');
}


/**
 * Checks whether password and confirmation match and shows an error if not.
 *
 * @returns {boolean} True if both passwords match.
 */
function checkPasswordsMatch() {
  const confirmInput = document.getElementById('signup-confirm-password');
  const error = document.getElementById('signup-confirm-error');
  const isValid = document.getElementById('signup-password').value.trim() === confirmInput.value.trim();
  error.innerText = isValid ? '' : "Your passwords don't match. Please try again.";
  confirmInput.classList.toggle('input-error', !isValid);
  return isValid;
}


/**
 * Runs all signup field validations and returns the overall result.
 *
 * @returns {boolean} True if every field is valid.
 */
export function validateSignupForm() {
  const nameOk = checkSignupName();
  const emailOk = checkSignupEmail();
  const passwordsOk = checkPasswordsMatch();
  return nameOk && emailOk && passwordsOk;
}


/**
 * Displays an error message below the email field, e.g. for a duplicate email.
 *
 * @param {string} message - The error message to display.
 */
export function showSignupEmailError(message) {
  const input = document.getElementById('signup-email');
  const error = document.getElementById('signup-email-error');
  error.innerText = message;
  input.classList.add('input-error');
}


/**
 * Clears the error message and error styling of a single signup field.
 *
 * @param {HTMLInputElement} input - The input element whose error should be cleared.
 */
export function clearSignupFieldError(input) {
  const field = input.closest('.signup-field');
  input.classList.remove('input-error');
  if (field) field.querySelector('.signup-field-error').innerText = '';
}


/**
 * Attaches a blur listener that runs the given validator when the field loses focus.
 *
 * @param {string} inputId - The input element ID.
 * @param {Function} validator - The validation function to run on blur.
 */
function addBlurValidator(inputId, validator) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('blur', validator);
}


/**
 * Sets up blur-based validation so users get per-field feedback before submitting.
 */
export function setupSignupBlurValidation() {
  addBlurValidator('signup-name', checkSignupName);
  addBlurValidator('signup-email', checkSignupEmail);
  addBlurValidator('signup-confirm-password', checkPasswordsMatch);
}

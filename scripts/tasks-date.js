const dateInput = document.getElementById('date-input');
export const dateInputContainer = document.getElementById('task-date');
const calendarIcon = document.querySelector('#task-date img');
const dateDay = document.getElementById('date-day');
const dateMonth = document.getElementById('date-month');
const dateYear = document.getElementById('date-year');
export const errorTextDate = document.getElementById('error-text-date');

/**
 * Sets the minimum selectable date in the hidden date input to today.
 *
 * @returns {void}
 */
export function initDate() {
  dateInput.min = new Date().toISOString().split('T')[0];
}

/**
 * Automatically moves focus to the next date field when the current one is fully filled.
 *
 * @returns {void}
 */
export function dateFocusBehavior() {
  dateDay.addEventListener('input', () => {
    if (dateDay.value.length === dateDay.maxLength) dateMonth.focus();
  });
  dateMonth.addEventListener('input', () => {
    if (dateMonth.value.length === dateMonth.maxLength) dateYear.focus();
  });
}

/**
 * Moves focus back to the previous date field when Backspace is pressed on an empty field.
 *
 * @returns {void}
 */
export function dateDeleteBehavior() {
  dateYear.addEventListener('keydown', (event) => {
    if (dateYear.value === '' && event.key === 'Backspace') dateMonth.focus();
  });
  dateMonth.addEventListener('keydown', (event) => {
    if (dateMonth.value === '' && event.key === 'Backspace') dateDay.focus();
  });
}

/**
 * Prevents non-numeric input in all three date fields.
 * Allows Backspace and Tab through.
 *
 * @returns {void}
 */
export function dateOnlyNumbers() {
  [dateDay, dateMonth, dateYear].forEach((input) => {
    input.addEventListener('keydown', (event) => {
      if (isNaN(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
        event.preventDefault();
      }
    });
  });
}

/**
 * Reads the three date input fields and returns the date as an ISO string (yyyy-mm-dd).
 * Returns an empty string if any field is empty.
 *
 * @returns {string} The formatted date string or an empty string.
 */
export function insertDate() {
  const dateInputField = document.querySelectorAll('.date-input-field');
  const day = dateInputField[0].value;
  const month = dateInputField[1].value;
  const year = dateInputField[2].value;
  if (!day || !month || !year) return '';
  return `${year}-${month}-${day}`;
}

/**
 * Adds error styling to the date container and shows the error message.
 *
 * @returns {false}
 */
function showDateError(mesage) {
  errorTextDate.textContent = mesage;
  dateInputContainer.classList.add('was-submitted-custom');
  errorTextDate.classList.remove('d-none');
  return false;
}

/**
 * Removes error styling from the date container and hides the error message.
 *
 * @returns {true}
 */
function hideDateError() {
  dateInputContainer.classList.remove('was-submitted-custom');
  errorTextDate.classList.add('d-none');
  return true;
}

/**
 * Validates all three date input fields.
 * Checks that all fields are filled and that the resulting date is valid.
 *
 * @returns {boolean} True if the date is valid, false otherwise.
 */
export function validateInputDate() {
  const dateInputField = document.querySelectorAll('.date-input-field');
  const day = dateInputField[0].value;
  const month = dateInputField[1].value;
  const year = dateInputField[2].value;
  if (!day || !month || !year) return showDateError('This field is required');
  dateInput.value = `${year}-${month}-${day}`;
  if (!dateInput.validity.valid) return showDateError('Invalid Date');
  return hideDateError();
}

/**
 * Validates the date input when focus moves outside the date container.
 *
 * @returns {void}
 */
export function dateBlurBehavior() {
  dateInputContainer.addEventListener('focusout', (event) => {
    if (!dateInputContainer.contains(event.relatedTarget)) {
      validateInputDate();
    }
  });
}

// Opens the native date picker when the calendar icon is clicked
calendarIcon.addEventListener('click', () => {
  dateInput.showPicker();
});

// Transfers the selected date from the native picker into the three custom fields
dateInput.addEventListener('change', () => {
  let formatedDate = dateInput.value.split('-');
  const dateInputField = document.querySelectorAll('.date-input-field');
  dateInputField[0].value = formatedDate[2];
  dateInputField[1].value = formatedDate[1];
  dateInputField[2].value = formatedDate[0];
});

// Focuses the day field on container click, or the specific field if directly clicked
dateInputContainer.addEventListener('click', (event) => {
  dateDay.focus();
  if (event.target === dateMonth || event.target === dateYear) {
    event.target.focus();
  }
});

/**
 * Splits a date string into day, month and year segments.
 * Supports DD/MM/YYYY, DD.MM.YYYY and YYYY-MM-DD / DD-MM-YYYY input.
 * Returns empty strings for any malformed input (wrong segment count,
 * non-numeric parts) so corrupted Firestore values can't poison the form.
 *
 * @param {string} value - The raw date string from the database.
 * @returns {{day: string, month: string, year: string}} The split date parts.
 */
export function splitDateString(value) {
  const empty = { day: '', month: '', year: '' };
  if (!value || typeof value !== 'string') return empty;
  let parts;
  if (value.includes('/')) parts = value.split('/');
  else if (value.includes('.')) parts = value.split('.');
  else if (value.includes('-')) parts = value.split('-');
  else return empty;
  if (parts.length !== 3 || !parts.every((p) => /^\d+$/.test(p))) return empty;
  if (parts[0].length === 4) return { year: parts[0], month: parts[1], day: parts[2] };
  return { day: parts[0], month: parts[1], year: parts[2] };
}

/**
 * Parses a date string and pads the segments for use in the native date picker.
 *
 * @param {string} dateValue - The raw date string from the database.
 * @returns {{day: string, month: string, year: string, formattedDate: string}}
 *   Padded segments plus a YYYY-MM-DD string for <input type="date">.
 */
export function parseEditDate(dateValue) {
  const { day, month, year } = splitDateString(dateValue);
  if (!day || !month || !year) return { day, month, year, formattedDate: '' };
  const dd = day.padStart(2, '0');
  const mm = month.padStart(2, '0');
  return { day: dd, month: mm, year, formattedDate: `${year}-${mm}-${dd}` };
}

window.validateInputDate = validateInputDate;

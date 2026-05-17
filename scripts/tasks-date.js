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
function showDateError() {
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
  if (!day || !month || !year) return showDateError();
  dateInput.value = `${year}-${month}-${day}`;
  if (!dateInput.validity.valid) return showDateError();
  return hideDateError();
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
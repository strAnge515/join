/**
 * Writes the YYYY-MM-DD picker value into the three day/month/year inputs.
 *
 * @param {HTMLElement} dialogRef - The modal dialog containing the inputs.
 * @param {string} value - The native picker value in YYYY-MM-DD form.
 */
function syncPickerToFields(dialogRef, value) {
  if (!value) return;
  const [y, m, d] = value.split('-');
  dialogRef.querySelector('#edit-date-day').value = d;
  dialogRef.querySelector('#edit-date-month').value = m;
  dialogRef.querySelector('#edit-date-year').value = y;
}


/**
 * Initializes the custom date input fields and the native picker sync.
 *
 * @param {HTMLElement} dialogRef - The reference to the modal dialog.
 */
export function setupDateInput(dialogRef) {
  const picker = dialogRef.querySelector('#edit-date-input');
  const svg = dialogRef.querySelector('#edit-event-svg');
  if (!svg || !picker) return;
  svg.addEventListener('click', () => {
    if (typeof picker.showPicker === 'function') picker.showPicker();
  });
  picker.addEventListener('change', (e) => syncPickerToFields(dialogRef, e.target.value));
}

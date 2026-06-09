import { getSubtaskTemplate, getEditTemplate } from './tasks-template.js';

export const subtaskInput = document.getElementById('subtask-input');
const addButtonSubtask = document.getElementById('btn-add-subtask');
const deleteButtonSubtask = document.getElementById('btn-delete-subtask');
const subtaskButtonWrapper = document.getElementById('subtask-button-wrapper');
export const subtaskList = document.getElementById('subtask-list');

/**
 * Reads the current subtask input value, creates a new list item and appends it.
 * Does nothing if the input is empty.
 *
 * @returns {void}
 */
function addSubtask() {
  const subtaskValue = subtaskInput.value;
  if (subtaskValue === '') return;
  const li = document.createElement('li');
  li.innerHTML = getSubtaskTemplate(subtaskValue);
  li.className = 'subtask-item';
  subtaskList.appendChild(li);
  addSubtaskEventListeners(li);
  subtaskInput.value = '';
}

/**
 * Switches a subtask list item into edit mode.
 * Replaces the display template with an editable input field.
 * Exits early if the item is already in edit mode.
 *
 * @param {HTMLElement} li - The subtask list item to edit.
 * @returns {void}
 */
function activateEditMode(li) {
  if (li.classList.contains('is-editing')) return;
  let subtaskText = li.querySelector('span').textContent;
  li.innerHTML = getEditTemplate(subtaskText);
  li.classList.add('is-editing');
  li.querySelector('.subtask-edit-value').focus();
  li.querySelector('.edit-delete-btn').addEventListener('click', () => li.remove());
  eventListenerConfirmButton(li, subtaskText);
  editmodeConfirmListener(li);
  exitEditModePerClick(li, subtaskText);
}

/**
 * Saves the edited subtask when the confirm button is clicked.
 * @param {HTMLElement} li - The subtask list item in edit mode.
 * @param {string} subtaskText - The current subtask text.
 */
function eventListenerConfirmButton(li, subtaskText) {
  li.querySelector('.edit-confirm-btn').addEventListener('click', () => {
    subtaskText = li.querySelector('.subtask-edit-value').value;
    li.innerHTML = getSubtaskTemplate(subtaskText);
    li.classList.remove('is-editing');
    addSubtaskEventListeners(li);
  });
}

/**
 * Exits edit mode when the user clicks outside the subtask list item.
 * @param {HTMLElement} li - The subtask list item in edit mode.
 * @param {string} subtaskText - The current subtask text.
 */
function exitEditModePerClick(li, subtaskText) {
  document.addEventListener('click', (event) => {
    if (!li.contains(event.target) && li.classList.contains('is-editing')) {
      subtaskText = li.querySelector('.subtask-edit-value').value;
      li.innerHTML = getSubtaskTemplate(subtaskText);
      li.classList.remove('is-editing');
      addSubtaskEventListeners(li);
    }
  });
}

/**
 * Allows confirming an edit by pressing Enter inside the edit input field.
 *
 * @param {HTMLElement} li - The subtask list item currently in edit mode.
 * @returns {void}
 */
function editmodeConfirmListener(li) {
  li.querySelector('.subtask-edit-value').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      li.querySelector('.edit-confirm-btn').click();
    }
  });
}

/**
 * Attaches delete, edit and double-click event listeners to a subtask list item.
 *
 * @param {HTMLElement} li - The subtask list item to attach listeners to.
 * @returns {void}
 */
function addSubtaskEventListeners(li) {
  li.querySelector('.delete-btn').addEventListener('click', () => li.remove());
  li.querySelector('.edit-btn').addEventListener('click', (event) => {
    event.stopPropagation();
    activateEditMode(li);
  });
  li.addEventListener('dblclick', () => activateEditMode(li));
}

// Mousedown on the add button adds the subtask (fires before blur)
addButtonSubtask.addEventListener('mousedown', () => {
  addSubtask();
  event.preventDefault();
});

// Enter or Space on the add button also adds the subtask
addButtonSubtask.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    addSubtask();
    subtaskInput.value = '';
    subtaskInput.blur();
  }
});

// Hides the button wrapper when the subtask input loses focus
subtaskInput.addEventListener('blur', () => {
  subtaskButtonWrapper.classList.remove('button-wrapper');
  subtaskButtonWrapper.classList.add('d-none');
});

// Shows the button wrapper when the subtask input receives focus
subtaskInput.addEventListener('focus', () => {
  subtaskButtonWrapper.classList.remove('d-none');
  subtaskButtonWrapper.classList.add('button-wrapper');
});

// Enter in the subtask input adds the subtask and removes focus
subtaskInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addSubtask();
    // subtaskInput.blur();
    event.preventDefault();
  }
});

// Mousedown on the delete button clears the input and removes focus
deleteButtonSubtask.addEventListener('mousedown', () => {
  subtaskInput.value = '';
  // subtaskInput.blur();
});

// Enter or Space on the delete button clears the input and removes focus
deleteButtonSubtask.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    subtaskInput.value = '';
    subtaskInput.blur();
  }
});

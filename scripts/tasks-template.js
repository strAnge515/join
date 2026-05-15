
export function getSubtaskTemplate(subtaskValue) {
  return `<div class="subtask-left">
            <span>${subtaskValue}</span>
          </div>
          <div class="subtask-edit-buttons">
            <button class="edit-btn subtask-buttons"><img src="../assets/img/Property 1=edit.svg" alt="editsymbol"></button>
            <div class="subtask-button-seperator"></div>
            <button class="delete-btn subtask-buttons"><img src="../assets/img/Property 1=delete.svg" alt="deletesymbol"></button>
          </div>`;
}

export function getEditTemplate(subtaskText) {
  return `<div class="input-wrapper-edit">
            <input class="subtask-edit-value" type="text" value="${subtaskText}" />
          </div>
          <div class="subtask-edit-buttons">
            <button class="edit-delete-btn subtask-buttons" type="button"><img src="../assets/img/Property 1=delete.svg" alt="deletesymbol" /></button>
            <div class="subtask-button-seperator"></div>
            <button class="edit-confirm-btn subtask-buttons" type="button"><img src="../assets/img/Property 1=check.svg" alt="checkicon" /></button>
          </div>`;
}

export function getDropdownTemplate(contact, initials) {
  return `
  <section class="assigned-to-contacts-wrapper">
    <div class="assigned-to-names">
      <div class="avatar" style="background:${contact.color}">${initials}</div>
      <span>${contact.firstName} ${contact.lastName}</span>
    </div>
    <img src="../assets/img/Check button.svg" alt="checkbox" class="checkbox-unchecked" data-id="${contact.id}"/>
    <img src="../assets/img/Check button checked.svg" alt="checkbox-checked" class="checkbox-checked d-none" data-id="${contact.id}">
  </section>`;
}
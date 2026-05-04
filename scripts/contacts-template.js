function getContactTemplate(contact, initials) {
  return `
    <div class="avatar" style="background:${contact.color}">
      ${initials}
    </div>
    <div class="info">
      <div class="name">${contact.firstName} ${contact.lastName}</div>
      <div class="email">${contact.email}</div>
    </div>
  `;
}

function getContactDetailTemplate(contact, initials, color) {
  return `
    <div class="contact-detail-card" id="contactDetailCard">
          <div class="detail-header">
        <div class="detail-avatar contacts-detail-avatar" style="background:${color}">
          ${initials}
        </div>
        <div>
          <div class="detail-name">${contact.firstName} ${contact.lastName}</div>
          <div class="detail-actions">
          <button class="edit-btn" id="editContactBtn" data-id="${contact.id}">
          <div class="edit-icon"></div>
          Edit </button>
          <button class="edit-btn" id="deleteContactBtn" data-id="${contact.id}">
          <div class="delete-icon"></div>
           Delete</button>
           </div>
           </div>
      </div>
      <div class="detail-section">
        <div class="detail-label">Contact Information</div>
        <div class="details">
          <div class="detail-label-email">Email</div>
          <a href="mailto:${contact.email}" class="email">
  ${contact.email}
</a>
        </div>
        <div class="details">
          <div class="detail-label-phone">Phone</div>
          <a href="tel:${contact.phone}" class="phone">
  ${contact.phone}
</a>
        </div>
      </div>
    </div>
  `;
}

function getEditContactTemplate(contact, initials, color) {
  return `<div class="dialog">
        <div class="dialog-left">
          <img src="../assets/img/contacts/join-logo.svg" class="logo" />
          <h1>Edit contact</h1>
          <div class="underline"></div>
        </div>
        <div class="dialog-right">
<div class="detail-avatar dialog-detail-avatar" style="background:${color}">
          ${initials}
        </div>
          <div class="actions">
            <button class="close-btn btn-to-close">
              <img class="close-icon" src="../assets/img/contacts/close.svg" alt="Close button"></button>
            <form id="editContactForm">
            <div class="input-wrapper">
              <input id="nameInputEdit" type="text" placeholder="Vor- und Nachname" value="${contact.firstName} ${contact.lastName}" required 
              pattern="^[A-Za-zÄÖÜäöüß]+(-[A-Za-zÄÖÜäöüß]+)? [A-Za-zÄÖÜäöüß]+(-[A-Za-zÄÖÜäöüß]+)?$"/>
              <img src="../assets/img/contacts/person.svg" alt="">
            </div>
            <div class="input-wrapper">
              <input id="emailInputEdit" type="email" placeholder="Email" value="${contact.email}" required />
              <img src="../assets/img/contacts/mail.svg" alt="">
            </div>
            <div class="input-wrapper">
              <input id="phoneInputEdit" type="tel" placeholder="Phone" value="${contact.phone}" required 
               pattern="^\\+?[0-9\\s\\-\\/]{6,20}$" />
              <img src="../assets/img/contacts/call.svg" alt="">
            </div>
            <div class="action-btns">
              <button id="deleteContactBtnEditDialog" class="delete-btn btn-to-close">
                Delete
              </button>
              <button class="create-btn save-btn" type="submit">Save ✔</button>
            </div>
            </form>
          </div>
        </div>
      </div>`;
}

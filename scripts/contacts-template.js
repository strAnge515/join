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
    <div class="contact-detail-card">      
      <div class="detail-header">
        <div class="detail-avatar" style="background:${color}">
          ${initials}
        </div>
        <div>
          <div class="detail-name">${contact.firstName} ${contact.lastName}</div>
          <div class="detail-actions">
          <button class="edit-btn" onclick="openEditContactDialog(${contact.id})">
          <img src="../assets/img/contacts/edit.svg" alt="">
          Edit </button>
          <button class="edit-btn" onclick="deleteContact(${contact.id})">
           <img src="../assets/img/contacts/delete.svg" alt="">
           Delete</button>
           </div>
        </div>
      </div>
      <div class="detail-section">
        <div class="detail-label">Contact Information</div>
        <div class="details">
          <div class="detail-label-email">Email</div>
          <div class="email">${contact.email}</div>
        </div>
        <div class="details">
          <div class="detail-label-phone">Phone</div>
          <div>${contact.phone}</div>
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
            <button class="close-btn" onclick="closeDialog(this)">✕</button>
            <div class="input-wrapper">
              <input id="nameInput" type="text" placeholder="Name" value="${contact.firstName} ${contact.lastName}" required />
              <img src="../assets/img/contacts/person.svg" alt="">
            </div>
            <div class="input-wrapper">
              <input id="emailInput" type="email" placeholder="Email" value="${contact.email}" required />
              <img src="../assets/img/contacts/mail.svg" alt="">
            </div>
            <div class="input-wrapper">
              <input id="phoneInput" type="tel" placeholder="Phone" value="${contact.phone}" required />
              <img src="../assets/img/contacts/call.svg" alt="">
            </div>
            <div class="action-btns">
              <button class="cancel-btn" onclick="closeDialog(this)">
                Cancel ✕
              </button>
              <button class="create-btn save-btn" onclick="editContact(${contact.id})">Save ✔</button>
            </div>
          </div>
        </div>
      </div>`;
}

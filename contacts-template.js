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
          <button class="edit-btn">✏️ Edit </button>
          <button class="edit-btn">🗑 Delete</button>
        </div>
      </div>
      <div class="detail-section">
        <div class="detail-label">Contact Information</div>
        <div class="detail-label">Email</div>
        <div class="email">${contact.email}</div>
        <div class="detail-label">Phone</div>
        <div>${contact.phone}</div>
      </div>
    </div>
  `;
}

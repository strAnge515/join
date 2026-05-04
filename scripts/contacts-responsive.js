function closeContactDetails() {
  const contactDetailsRef = document.getElementById('detailContainer');
  contactDetailsRef.style.display = 'none';
}

function openContactDetails() {
  const contactDetailsRef = document.getElementById('detailContainer');
  contactDetailsRef.style.display = 'block';
}

function removeActiveStateFromContact() {
  const activeContact = document.querySelector('.contact.active');
  if (activeContact) {
    activeContact.classList.remove('active');
  }
}

function addBackwardsBtnListener() {
  const backwardsBtnRef = document.getElementById('backwardsBtn');
  if (backwardsBtnRef) {
    backwardsBtnRef.addEventListener('click', () => {
      closeContactDetails();
      removeActiveStateFromContact();
    });
  }
}

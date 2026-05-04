function closeContactDetails() {
  const contactDetailsRef = document.getElementById('detailContainer');
  contactDetailsRef.style.display = 'none';
}

function addBackwardsBtnListener() {
  const backwardsBtnRef = document.getElementById('backwardsBtn');
  if (backwardsBtnRef) {
    backwardsBtnRef.addEventListener('click', () => {
      closeContactDetails();
    });
  }
}

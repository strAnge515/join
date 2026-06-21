document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('go-back').addEventListener('click', () => {
    history.back();
  });
  document.getElementById('loginBtn').addEventListener('click', () => {
    sessionStorage.setItem('activeForm', 'login');
    window.location.href = '../index.html';
  });
});

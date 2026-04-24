const form = document.getElementById("login-form");
const signUpButton = document.getElementById("sign-up-button");
const guestButton = document.querySelector(".guest-log-inbutton");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.querySelector('input[type="email"]').value.trim();
  const password = document.querySelector('input[type="password"]').value.trim();

  if (!email || !password) {
    alert("Bitte Email und Passwort eingeben");
    return;
  }

  if (!email.includes("@")) {
    alert("Bitte gültige Email eingeben");
    return;
  }

  window.location.href = "./pages/summary.html";
});

signUpButton.addEventListener("click", function () {
  window.location.href = "./pages/signup.html";
});

guestButton.addEventListener("click", function () {
  window.location.href = "./pages/summary.html";
});
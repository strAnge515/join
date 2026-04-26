const form = document.getElementById("login-form");
const signUpButton = document.getElementById("sign-up-button");
const guestButton = document.querySelector(".guest-log-inbutton");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = form.querySelector('input[type="email"]').value.trim().toLowerCase();
  const password = form.querySelector('input[type="password"]').value;

  let users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(
    user => user.email === email && user.password === password
  );

  if (!user) {
    alert("Wrong email or password");
    return;
  }

  // ✅ IMMER Objekt speichern!
  localStorage.setItem("currentUser", JSON.stringify(user));

  window.location.href = "./pages/summary.html";
});

signUpButton.addEventListener("click", () => {
  window.location.href = "./pages/signup.html";
});

guestButton.addEventListener("click", () => {
  localStorage.setItem("currentUser", JSON.stringify({
    firstName: "Guest",
    lastName: ""
  }));

  window.location.href = "./pages/summary.html";
});
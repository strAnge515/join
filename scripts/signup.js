const form = document.getElementById("signup-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const fullName = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim().toLowerCase();
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("signup-confirm-password").value;
  const privacyAccepted = document.getElementById("privacy-check").checked;

  if (!privacyAccepted) {
    alert("Please accept the privacy policy.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  const nameParts = fullName.split(" ").filter(Boolean);

  if (nameParts.length < 2) {
    alert("Please enter first name and last name.");
    return;
  }

  const firstName = capitalizeName(nameParts[0]);
  const lastName = capitalizeName(nameParts.slice(1).join(" "));

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const userExists = users.some((user) => user.email === email);

  if (userExists) {
    alert("User already exists!");
    return;
  }

  const newUser = {
    firstName,
    lastName,
    email,
    password,
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  window.location.href = "./summary.html";
});

function capitalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/(^|\s|-)\S/g, (letter) => letter.toUpperCase());
}
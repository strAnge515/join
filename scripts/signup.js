const form = document.getElementById("signup-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const fullName = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim().toLowerCase();
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("signup-confirm-password").value;
  const privacyAccepted = document.getElementById("privacy-check").checked;

  if (!privacyAccepted) {
    document.getElementById("signup-error").textContent = "Please accept the privacy policy.";
    return;
  }

  if (password !== confirmPassword) {
    document.getElementById("signup-error").textContent = "Passwords do not match!";
    return;
  }

  const nameParts = fullName.split(" ").filter(Boolean);

  if (nameParts.length < 2) {
    document.getElementById("signup-error").textContent = "Please enter first name and last name.";
    return;
  }

  const firstName = capitalizeName(nameParts[0]);
  const lastName = capitalizeName(nameParts.slice(1).join(" "));

  const users = JSON.parse(sessionStorage.getItem("users")) || [];

  const userExists = users.some((user) => user.email === email);

  if (userExists) {
    document.getElementById("signup-error").textContent = "User already exists!";
    return;
  }

  const newUser = {
    firstName,
    lastName,
    email,
    password,
  };

  users.push(newUser);
  sessionStorage.setItem("users", JSON.stringify(users));
  sessionStorage.setItem("currentUser", JSON.stringify(newUser));

  window.location.href = "./summary.html";
});

function capitalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/(^|\s|-)\S/g, (letter) => letter.toUpperCase());
}
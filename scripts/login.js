import { findUserByEmail } from './backend-users.js';

const form = document.getElementById("login-form");
const signUpButton = document.getElementById("sign-up-button");
const guestButton = document.getElementById("guest-login-btn");
const togglePassword = document.getElementById("toggle-password");
const passwordInput = document.getElementById("login-password");
const loginError = document.getElementById("login-error");


/**
 * Validates the login credentials against Firestore and redirects on success.
 * @param {Event} e - The form submit event.
 */
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = passwordInput.value.trim();
    const user = await findUserByEmail(email);
    if (!user || user.password !== password) {
        showLoginError();
        return;
    }
    sessionStorage.setItem("currentUser", JSON.stringify({ name: user.name, email: user.email }));
    window.location.href = "./pages/summary.html";
}


/**
 * Displays the login error message.
 */
function showLoginError() {
    loginError.textContent = "Check your email and password. Please try again.";
}


/**
 * Toggles the password input visibility between text and password.
 */
function togglePasswordVisibility() {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.src = isPassword ? "./assets/img/eye.svg" : "./assets/img/eye-off.svg";
}


form.addEventListener("submit", handleLogin);

signUpButton.addEventListener("click", () => {
    window.location.href = "./pages/signup.html";
});

guestButton.addEventListener("click", () => {
    sessionStorage.setItem("currentUser", JSON.stringify({ name: "Guest", email: "" }));
    window.location.href = "./pages/summary.html";
});

togglePassword.addEventListener("click", togglePasswordVisibility);
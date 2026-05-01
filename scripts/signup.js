import { saveUser } from './backend-users.js';
import { findUserByEmail } from './backend-users.js';

const form = document.getElementById("signup-form");
const privacyCheckbox = document.getElementById("accept-privacy");
const signupBtn = document.getElementById("signup-btn");
const signupError = document.getElementById("signup-error");
const togglePassword = document.getElementById("toggle-signup-password");
const toggleConfirm = document.getElementById("toggle-confirm-password");
const passwordInput = document.getElementById("signup-password");
const confirmInput = document.getElementById("signup-confirm-password");


/**
 * Handles the signup form submission.
 * Validates inputs, saves user to Firestore and shows success toast.
 * @param {Event} e - The form submit event.
 */
async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();
    if (!validatePasswords(password, confirmPassword)) return;
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        signupError.textContent = "This email is already registered.";
        return;
    }
    await saveUser({ name, email, password });
    showSuccessToast();
}


/**
 * Validates that both password fields match.
 * @param {string} password - The entered password.
 * @param {string} confirmPassword - The confirmation password.
 * @returns {boolean} True if passwords match, false otherwise.
 */
function validatePasswords(password, confirmPassword) {
    if (password !== confirmPassword) {
        signupError.textContent = "Your passwords don't match. Please try again.";
        return false;
    }
    signupError.textContent = "";
    return true;
}


/**
 * Shows the success toast and redirects to the login page after a short delay.
 */
function showSuccessToast() {
    const toast = document.getElementById("signup-toast");
    toast.classList.add("toast-visible");
    setTimeout(() => {
        window.location.href = "../index.html";
    }, 2000);
}


/**
 * Toggles the visibility of a password input field.
 * @param {HTMLInputElement} input - The password input to toggle.
 * @param {HTMLImageElement} icon - The icon element to swap.
 */
function toggleVisibility(input, icon) {
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    icon.src = isPassword ? "../assets/img/eye.svg" : "../assets/img/lock.svg";
}


privacyCheckbox.addEventListener("change", () => {
    signupBtn.disabled = !privacyCheckbox.checked;
});

togglePassword.addEventListener("click", () => toggleVisibility(passwordInput, togglePassword));

toggleConfirm.addEventListener("click", () => toggleVisibility(confirmInput, toggleConfirm));

form.addEventListener("submit", handleSignup);
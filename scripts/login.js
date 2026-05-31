/**
 * Handles the login functionality for the application.
 * This script manages user authentication, including form submission, error handling, and guest login.
 */
import { findUserByEmail } from './backend-users.js';


/* DOM Elements */  
const form = document.getElementById("login-form");
const signUpButton = document.getElementById("sign-up-button");
const guestButton = document.getElementById("guest-login-btn");
const togglePassword = document.getElementById("toggle-password");
const passwordInput = document.getElementById("login-password");
const loginError = document.getElementById("login-error");


/**
 * Handles the login form submission.
 * @param {Event} e - The form submission event.
 */
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = passwordInput.value.trim();
    const user = await findUserByEmail(email);
    console.log(user);
    
    if (!user || user.password !== password) {
        showLoginError();
        return;
    }
    sessionStorage.setItem("currentUser", JSON.stringify({ name: user.name, email: user.email, id: user.id }));
    window.location.href = "./pages/summary.html";
}


/**
 * Displays a login error message to the user.
 */
function showLoginError() {
    loginError.textContent = "Check your email and password. Please try again.";
}


/**
 * Toggles the visibility of the password input field.
 */
function togglePasswordVisibility() {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.src = isPassword ? "./assets/img/eye.svg" : "./assets/img/eye-off.svg";
}


/**
 * Initializes the login page by setting up event listeners.
 */
form.addEventListener("submit", handleLogin);


/**
 * Handles the sign-up button click event.
 */
signUpButton.addEventListener("click", () => {
    window.location.href = "./pages/signup.html";
});


/**
 * Handles the guest login button click event.
 */
guestButton.addEventListener("click", () => {
    sessionStorage.setItem("currentUser", JSON.stringify({ name: "Guest", email: "", id: "guest" }));
    window.location.href = "./pages/summary.html";
});


/**
 * Initializes the toggle password visibility button.
 */
togglePassword.addEventListener("click", togglePasswordVisibility);
/**
 * Handles the login functionality for the application.
 * This script manages user authentication, including form submission, error handling, and guest login.
 */
import { findUserByEmail } from './backend-users.js';

/* DOM Elements */
const logo = document.querySelector('.aside-logo');
const mobileStartScreen = document.getElementById('mobile-start-screen');
const form = document.getElementById('login-form');
const signUpButton = document.getElementById('sign-up-button');
const backArrow = document.getElementById('back-arrow');
const guestButton = document.getElementById('guest-login-btn');
const togglePassword = document.getElementById('toggle-password');
const passwordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

<<<<<<< HEAD

=======
>>>>>>> master
/**
 * Handles the login form submission.
 * @param {Event} e - The form submission event.
 */
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = passwordInput.value.trim();
  if (!validateLoginInput(email, password)) return;
  const user = await findUserByEmail(email);
  if (!user || user.password !== password) {
    showLoginError();
    return;
  }
<<<<<<< HEAD

  sessionStorage.setItem("currentUser", JSON.stringify({
    name: user.name,
    email: user.email,
    id: user.id,
  }));

  sessionStorage.setItem("showMobileGreeting", "true");
  window.location.href = "./pages/summary.html";
}

function handleGuestLogin() {
  sessionStorage.setItem("currentUser", JSON.stringify({
    name: "Guest",
    email: "",
    id: "guest",
  }));

  sessionStorage.setItem("showMobileGreeting", "true");
  window.location.href = "./pages/summary.html";
=======
  sessionStorage.setItem(
    'currentUser',
    JSON.stringify({
      name: user.name,
      email: user.email,
      id: user.id,
    }),
  );
  window.location.href = './pages/summary.html';
>>>>>>> master
}

/**
 * Validates the login inputs before any backend call.
 * @param {string} email - The trimmed email value.
 * @param {string} password - The trimmed password value.
 * @returns {boolean} True when both fields are filled and the email is valid.
 */
function validateLoginInput(email, password) {
  const emailRegex =
    /^(?!.*\.\.)[a-zA-Z0-9]+([.+_-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
  if (email === '' || password === '') {
    loginError.textContent = 'Please fill in all fields.';
    return false;
  }
  if (!emailRegex.test(email)) {
    loginError.textContent = 'Please enter a valid email address.';
    return false;
  }
  return true;
}

/**
 * Displays a login error message to the user.
 */
function showLoginError() {
  loginError.textContent = 'Check your email and password. Please try again.';
}

/**
 * Toggles the visibility of the password input field.
 */
function togglePasswordVisibility() {
  const isPassword = passwordInput.type === 'password';

  passwordInput.type = isPassword ? 'text' : 'password';
  togglePassword.src = isPassword
    ? './assets/img/eye.svg'
    : './assets/img/eye-off.svg';
}

/**
 * Clears all input fields and validation messages in the login and signup forms.
 *
 * Resets the value of every input element within the login and signup forms,
 * removes the "input-error" CSS class from those inputs, and clears the text
 * content of all signup field error messages and general error messages.
 */
function clearFormInputsLogInAndSignUp() {
  document
    .querySelectorAll('#login-form input, #signup-form input')
    .forEach((input) => {
      input.value = '';
      input.classList.remove('input-error');
    });
  document.querySelectorAll('.signup-field-error').forEach((error) => {
    error.textContent = '';
  });
  document.querySelectorAll('.error-message').forEach((error) => {
    error.textContent = '';
  });
}

/**
 * Toggles visibility between the login and signup forms.
 */
function toggleSignUpLogIn() {
  clearFormInputsLogInAndSignUp();
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginHeader = document.getElementById('login-header');
  const loginVisible = window.getComputedStyle(loginForm).display !== 'none';
  loginForm.style.display = loginVisible ? 'none' : 'flex';
  signupForm.style.display = loginVisible ? 'flex' : 'none';
  loginHeader.style.display = loginVisible ? 'none' : 'flex';
}

<<<<<<< HEAD
=======
/**
 * Handles guest login by creating a temporary "Guest" user session.
 */
function handleGuestLogin() {
  sessionStorage.setItem(
    'currentUser',
    JSON.stringify({
      name: 'Guest',
      email: '',
      id: 'guest',
    }),
  );
  window.location.href = './pages/summary.html';
}

>>>>>>> master
form.addEventListener('submit', handleLogin);
signUpButton.addEventListener('click', toggleSignUpLogIn);
backArrow.addEventListener('click', toggleSignUpLogIn);
guestButton.addEventListener('click', handleGuestLogin);
togglePassword.addEventListener('click', togglePasswordVisibility);
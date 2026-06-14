/**
 * Handles the login functionality for the application.
 * This script manages user authentication, including form submission, error handling, and guest login.
 */
import { findUserByEmail } from './backend-users.js';


/* DOM Elements */
const logo = document.querySelector(".aside-logo");
const mobileStartScreen = document.getElementById("mobile-start-screen");
const form = document.getElementById("login-form");
const signUpButton = document.getElementById("sign-up-button");
const guestButton = document.getElementById("guest-login-btn");
const togglePassword = document.getElementById("toggle-password");
const passwordInput = document.getElementById("login-password");
const loginError = document.getElementById("login-error");

function initLogoAnimation() {
  if (!logo || window.innerWidth <= 768) return;
  if (isPageReload()) sessionStorage.removeItem('logoPlayedDesktop');
  if (sessionStorage.getItem('logoPlayedDesktop') === 'true') return;
  logo.classList.add('logo-animation-active');
  sessionStorage.setItem('logoPlayedDesktop', 'true');
}


function playLogoAnimation() {
  logo.classList.add("logo-animation-active");
  sessionStorage.setItem("logoAnimationPlayed", "true");
}


function resetLogoAnimation() {
  sessionStorage.removeItem("logoAnimationPlayed");
    playLogoAnimation();
}


function isPageReload() {
  const navigation = performance.getEntriesByType("navigation")[0];
  return navigation?.type === "reload";
}


function isMobileView() {
  return window.innerWidth <= 768;
}


function initMobileStartScreen() {
  if (!shouldShowMobileStartScreen()) {
    hideMobileStartScreen();
    return;
  }

  document.body.classList.add("mobile-start-active");
  sessionStorage.setItem("logoPlayedMobile", "true");

  setTimeout(() => {
    mobileStartScreen.classList.add("move");
  }, 500);

  setTimeout(hideMobileStartScreen, 1400);
}


function shouldShowMobileStartScreen() {
  if (isPageReload()) sessionStorage.removeItem("logoPlayedMobile");

  const alreadyShown = sessionStorage.getItem("logoPlayedMobile");
  return isMobileView() && alreadyShown !== "true";
}


function hideMobileStartScreen() {
  document.body.classList.remove("mobile-start-active");

  if (mobileStartScreen) {
    mobileStartScreen.classList.add("hidden");
  }
}


/**
 * Handles the login form submission.
 * @param {Event} e - The form submission event.
 */
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = passwordInput.value.trim();

  if (!validateLoginInput(email, password)) return;

  const user = await findUserByEmail(email);

  if (!user || user.password !== password) {
    showLoginError();
    return;
  }

  sessionStorage.setItem("currentUser", JSON.stringify({
    name: user.name,
    email: user.email,
    id: user.id,
  }));

  window.location.href = "./pages/summary.html";
}


/**
 * Validates the login inputs before any backend call.
 * @param {string} email - The trimmed email value.
 * @param {string} password - The trimmed password value.
 * @returns {boolean} True when both fields are filled and the email is valid.
 */
function validateLoginInput(email, password) {
  const emailRegex = /^(?!.*\.\.)[a-zA-Z0-9]+([.+_-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;

  if (email === "" || password === "") {
    loginError.textContent = "Please fill in all fields.";
    return false;
  }

  if (!emailRegex.test(email)) {
    loginError.textContent = "Please enter a valid email address.";
    return false;
  }

  return true;
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


function handleSignUpClick() {
  window.location.href = "./pages/signup.html";
}


function handleGuestLogin() {
  sessionStorage.setItem("currentUser", JSON.stringify({
    name: "Guest",
    email: "",
    id: "guest",
  }));

  window.location.href = "./pages/summary.html";
}


form.addEventListener("submit", handleLogin);
signUpButton.addEventListener("click", handleSignUpClick);
guestButton.addEventListener("click", handleGuestLogin);
togglePassword.addEventListener("click", togglePasswordVisibility);

initLogoAnimation();
initMobileStartScreen();


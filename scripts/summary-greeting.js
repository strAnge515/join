import { setText } from "./summary-utils.js";

/** This module is responsible for updating the greeting and mobile profile information on the summary page.
 * It retrieves the current user information from session storage, determines the appropriate greeting based on the time of day,
 * and updates the UI with the user's name and initials. It also handles the mobile greeting intro for first-time visitors on mobile devices.
 */
export function updateGreeting() {
  const user = getCurrentUser();

  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  setText("greeting-text", getGreetingText());
  setText("greeting-name", getDisplayName(user));
}

/** Updates the mobile profile information by retrieving the current user from session storage and setting the mobile profile text to the user's initials.
 * If no user is found, the function returns without making any changes to the UI.
 */
export function updateMobileProfile() {
  const user = getSavedUser();
  if (!user) return;

  setText("mobile-profile", getUserInitials(user));
}

/** Initializes the mobile greeting intro for first-time visitors on mobile devices. It checks if the greeting has already been shown in the current session and if the device is mobile. If the greeting should be shown, it sets a flag in session storage to prevent it from being shown again and displays the greeting for 2 seconds before showing the summary content.
 */
export function initMobileGreetingIntro() {
  if (!shouldShowMobileGreeting()) {
    showSummaryContent();
    return;
  }

  sessionStorage.removeItem("showMobileGreeting");
  setTimeout(showSummaryContent, 2000);
}

/** Retrieves the current user information from session storage, formats the user's name, and returns an object containing the user's first name and last name. If no user is found or if the user's name is not properly formatted, the function returns null.
 * @returns {Object|null} An object containing the user's first name and last name, or null if no user is found or if the name is not properly formatted.
 */
function getCurrentUser() {
  const user = getSavedUser();
  if (!user?.name) return null;

  const [first, ...rest] = user.name.trim().split(" ");

  return {
    firstName: formatNamePart(first || ""),
    lastName: formatNamePart(rest.join(" ")),
  };
}

/** Retrieves the saved user information from session storage and parses it as JSON. If no user information is found or if the parsing fails, the function returns null.
 * @returns {Object|null} The parsed user object from session storage, or null if no user information is found or if parsing fails.
 */
function getSavedUser() {
  const savedUser = sessionStorage.getItem("currentUser");
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

/** Generates a display name for the user based on their first name and last name. If the user's first name is "Guest", it returns "Guest" as the display name. Otherwise, it concatenates the first name and last name, trims any extra whitespace, and returns the resulting string as the display name.
 * @param {Object} user - The user object containing the first name and last name.
 * @returns {string} The display name for the user.
 */
function getDisplayName(user) {
  if (user.firstName.toLowerCase() === "guest") return "Guest";
  return `${user.firstName} ${user.lastName}`.trim();
}

/** Determines the appropriate greeting text based on the current time of day. It checks the current hour and returns a greeting string such as "Good morning,", "Good afternoon,", "Good evening,", or "Good night," accordingly.
 * @returns {string} The greeting text based on the time of day.
 */
function getGreetingText() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour <= 11) return "Good morning,";
  if (hour >= 12 && hour <= 17) return "Good afternoon,";
  if (hour >= 18 && hour <= 21) return "Good evening,";
  return "Good night,";
}

/** Generates the user's initials based on their name. It splits the name into parts, extracts the first letter of each part, and returns the initials in uppercase. If the name is not properly formatted, it returns "?" as a fallback.
 * @param {Object} user - The user object containing the name.
 * @returns {string} The user's initials in uppercase, or "?" if the name is not properly formatted.
 */
function getUserInitials(user) {
  const parts = String(user.name || "").trim().split(" ");
  const initials = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  return initials.toUpperCase() || "?";
}

/** Formats a name part by trimming whitespace, converting it to lowercase, and capitalizing the first letter. If the input value is falsy, it returns an empty string.
 * @param {string} value - The name part to be formatted.
 * @returns {string} The formatted name part with the first letter capitalized and the rest in lowercase.
 */
function formatNamePart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

/** Determines whether the mobile greeting intro should be shown based on the device's screen width and whether the greeting has already been shown in the current session. It checks if the screen width is less than or equal to 768 pixels and if the "mobileGreetingShown" flag in session storage is not set to "true". If both conditions are met, it returns true, indicating that the mobile greeting should be shown; otherwise, it returns false.
 * @returns {boolean} True if the mobile greeting should be shown, false otherwise.
 */
function shouldShowMobileGreeting() {
  return (
    window.innerWidth <= 768 &&
    sessionStorage.getItem("showMobileGreeting") === "true"
  );
}

/** Shows the summary content by removing the "mobile-greeting-active" class from the body element. This function is called after the mobile greeting intro has been displayed for first-time visitors on mobile devices, allowing the summary content to be visible.
 */
function showSummaryContent() {
  document.body.classList.remove("mobile-greeting-active");
}
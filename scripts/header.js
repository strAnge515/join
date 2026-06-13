/**
 * Manages the header component of the application, including dynamic rendering based on user authentication status and responsive menu behavior.
 * This script loads the appropriate header template, updates the UI based on the current user's login state, and sets up event listeners for menu interactions.
 */
async function initHeader() {
  try {
    const isRoot = isRootPage();
    const htmlText = await loadHeaderTemplate(isRoot);
    if (!htmlText) return;
    renderHeader(htmlText, isRoot);
    initHeaderFeatures();
  } catch (error) {
    console.error(error);
  }
}

/**
 * Checks if the current page is the root page.
 * @returns {boolean} True if the current page is the root page, false otherwise.
 */
function isRootPage() {
  return !window.location.pathname.includes('/pages/');
}

/**
 * Loads the header template based on the current page context (root or subpage).
 * @param {boolean} isRoot - Indicates if the current page is the root page.
 * @returns {Promise<string>} The HTML content of the header template.
 */
async function loadHeaderTemplate(isRoot) {
  const templatePath = getHeaderTemplatePath(isRoot);
  const response = await fetch(templatePath);
  if (!response.ok) return '';
  return await response.text();
}

/**
 * Gets the path to the header template based on the current page context.
 * @param {boolean} isRoot - Indicates if the current page is the root page.
 * @returns {string} The path to the header template.
 */
function getHeaderTemplatePath(isRoot) {
  return isRoot ? './pages/header.html' : 'header.html';
}

/**
 * Renders the header HTML content into the page and adjusts paths as necessary.
 * @param {string} htmlText - The HTML content of the header template.
 * @param {boolean} isRoot - Indicates if the current page is the root page.
 */
function renderHeader(htmlText, isRoot) {
  const container = document.getElementById('header-container');
  if (!container) return;
  container.innerHTML = adjustHeaderPaths(htmlText, isRoot);
}

/**
 * Initializes the header features based on the current user's login status.
 */
function initHeaderFeatures() {
  const currentUser = getCurrentUser();
  updateHeaderUI(currentUser, currentUser !== null);
  setupHeaderMenu();
  setupMobileAccountMenu();
}

/** Retrieves the current user from session storage.
 * @returns {Object|null} The current user object or null if not logged in.
 */
function getCurrentUser() {
  const stored = sessionStorage.getItem('currentUser');
  if (!stored) return null;
  return JSON.parse(stored);
}

/** Adjusts the paths in the header HTML content based on the current page context.
 * @param {string} htmlText - The HTML content of the header template.
 * @param {boolean} isRoot - Indicates if the current page is the root page.
 * @returns {string} The adjusted HTML content with correct paths.
 */
function adjustHeaderPaths(htmlText, isRoot) {
  if (isRoot) return adjustRootHeaderPaths(htmlText);
  return adjustPageHeaderPaths(htmlText);
}

/** Adjusts the paths in the header HTML for the root page context.
 * @param {string} htmlText - The HTML content of the header template.
 * @returns {string} The adjusted HTML content with correct paths for the root page.
 */
function adjustRootHeaderPaths(htmlText) {
  return htmlText.replace(/href="\.\/(?!assets)/g, 'href="./pages/');
}

/** Adjusts the paths in the header HTML for subpage contexts.
 * @param {string} htmlText - The HTML content of the header template.
 * @returns {string} The adjusted HTML content with correct paths for subpages.
 */
function adjustPageHeaderPaths(htmlText) {
  return htmlText.replace(/src="\.\/assets\//g, 'src="../assets/').replace(/href="\.\/assets\//g, 'href="../assets/');
}

/**
 * Updates the header UI based on the user's login status.
 * @param {Object|null} user - The current user object or null if not logged in.
 * @param {boolean} isLoggedIn - Indicates if the user is logged in.
 */
function updateHeaderUI(user, isLoggedIn) {
  const headerRight = document.querySelector('.header-right');
  const mobileAvatarCircle = document.getElementById('mobile-profile');
  if (!isLoggedIn) {
    hideElement(headerRight);
    hideElement(mobileAvatarCircle);
    return;
  }
  updateProfileInitials(user);
}

/**
 * Hides the specified element by setting its display style to "none".
 * @param {HTMLElement|null} element - The element to hide.
 */
function hideElement(element) {
  if (element) element.style.display = 'none';
}

/** Updates the profile initials in the header based on the user's name.
 * @param {Object} user - The current user object containing the name property.
 */
function updateProfileInitials(user) {
  const initials = getInitials(user);
  setText('header-account-circle', initials);
  setText('mobile-profile', initials);
}

/** Generates the initials for a user based on their name.
 * @param {Object} user - The current user object containing the name property.
 * @returns {string} The generated initials for the user.
 */
function getInitials(user) {
  const parts = String(user.name || '')
    .trim()
    .split(' ');
  const first = getInitial(parts[0]);
  const second = getInitial(parts[1]);
  return first + second || '?';
}

/** Gets the initial character from a name part and converts it to uppercase.
 * @param {string} namePart - A part of the user's name (e.g., first or last name).
 * @returns {string} The uppercase initial character or an empty string if the name part is not provided.
 */
function getInitial(namePart) {
  return namePart ? namePart[0].toUpperCase() : '';
}

/** Sets up the header menu functionality, including toggling the menu and handling logout. */
function setupHeaderMenu() {
  const elements = getHeaderMenuElements();
  if (!elements.accountCircle || !elements.accountMenu) return;
  addDesktopMenuToggle(elements);
  addDesktopMenuClose(elements);
  addDesktopLogout(elements.logoutLink);
}

/** Retrieves the necessary DOM elements for the header menu functionality.
 * @returns {Object} An object containing references to the account circle, account menu, and logout link elements.
 */
function getHeaderMenuElements() {
  const accountMenu = document.getElementById('header-account-menu');
  return {
    accountCircle: document.getElementById('header-account-circle'),
    accountMenu,
    logoutLink: accountMenu?.querySelector('a[href*="index.html"]'),
  };
}

/** Adds a click event listener to the account circle to toggle the visibility of the account menu.
 * @param {Object} elements - An object containing references to the account circle and account menu elements.
 */
function addDesktopMenuToggle({ accountCircle, accountMenu }) {
  accountCircle.addEventListener('click', () => {
    accountMenu.classList.toggle('account-menu--show');
  });
}

/**** Adds a click event listener to the document to close the account menu when clicking outside of it.
 * @param {Object} elements - An object containing references to the account circle and account menu elements.
 */
function addDesktopMenuClose({ accountCircle, accountMenu }) {
  document.addEventListener('click', (event) => {
    if (!accountCircle.contains(event.target)) {
      accountMenu.classList.remove('account-menu--show');
    }
  });
}

/** Adds a click event listener to the logout link to handle user logout.
 * @param {HTMLElement|null} logoutLink - The logout link element to attach the event listener to.
 */
function addDesktopLogout(logoutLink) {
  if (!logoutLink) return;
  logoutLink.addEventListener('click', (event) => {
    event.preventDefault();
    logoutUser(logoutLink.href);
  });
}

/** Sets up the mobile account menu functionality, including toggling the menu and handling logout.
 */
function setupMobileAccountMenu() {
  const mobileMenu = document.getElementById('mobile-account-menu');
  const logoutBtn = document.getElementById('mobile-logout-btn');
  addMobileMenuClickListener(mobileMenu);
  addMobileLogout(logoutBtn);
}

/** Adds a click event listener to the document to handle mobile menu clicks.
 * @param {HTMLElement|null} mobileMenu - The mobile menu element to attach the event listener to.
 */
function addMobileMenuClickListener(mobileMenu) {
  document.addEventListener('click', (event) => {
    handleMobileMenuClick(event, mobileMenu);
  });
}

/** Handles click events for the mobile menu, including toggling the menu and closing it when clicking outside.
 * @param {Event} event - The click event to handle.
 * @param {HTMLElement|null} mobileMenu - The mobile menu element to manage.
 */
function handleMobileMenuClick(event, mobileMenu) {
  const mobileProfile = event.target.closest('#mobile-profile');
  if (!mobileMenu) return;
  if (mobileProfile) return toggleMobileMenu(event, mobileMenu);
  closeMobileMenuOnOutsideClick(event, mobileMenu);
}

/** Toggles the visibility of the mobile account menu.
 * @param {Event} event - The click event to handle.
 * @param {HTMLElement|null} mobileMenu - The mobile menu element to manage.
 */
function toggleMobileMenu(event, mobileMenu) {
  event.stopPropagation();
  mobileMenu.classList.toggle('mobile-account-menu--show');
}

/**** Closes the mobile account menu when clicking outside of it.
 * @param {Event} event - The click event to handle.
 * @param {HTMLElement|null} mobileMenu - The mobile menu element to manage.
 */
function closeMobileMenuOnOutsideClick(event, mobileMenu) {
  if (!mobileMenu.contains(event.target)) {
    mobileMenu.classList.remove('mobile-account-menu--show');
  }
}

/** Adds a click event listener to the mobile logout button to handle user logout.
 * @param {HTMLElement|null} logoutBtn - The mobile logout button element to attach the event listener to.
 */
function addMobileLogout(logoutBtn) {
  if (!logoutBtn) return;
  logoutBtn.addEventListener('click', () => {
    logoutUser('../index.html');
  });
}

/** Logs out the user by clearing session storage and redirecting to the specified path.
 * @param {string} redirectPath - The path to redirect to after logging out.
 */
function logoutUser(redirectPath) {
  sessionStorage.removeItem('currentUser');
  sessionStorage.removeItem('mobileGreetingShown');
  window.location.href = redirectPath;
}

/** Sets the text content of an element with the specified ID.
 * @param {string} id - The ID of the element to update.
 * @param {string} value - The text value to set for the element.
 */
function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

/* Initializes the header component when the DOM content is fully loaded. */
document.addEventListener('DOMContentLoaded', initHeader);

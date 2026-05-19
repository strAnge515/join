/**
 * Handles the loading and rendering of the sidebar component, as well as managing its features and visibility based on user login status.
 */
async function initSidebar() {
  try {
    const isRoot = !window.location.pathname.includes("/pages/");
    const response = await fetch(getTemplatePath(isRoot));
    if (!response.ok) return;

    const htmlText = await response.text();
    renderSidebar(htmlText, isRoot);
    initSidebarFeatures();
  } catch (error) {
    console.error(error);
  }
}


/** Returns the appropriate path to the sidebar template based on the current page's location.
 * @param {boolean} isRoot - Indicates whether the current page is in the root directory or not.
 * @returns {string} The path to the sidebar template.
 */
function getTemplatePath(isRoot) {
  return isRoot ? "./pages/sidebar.html" : "sidebar.html";
}


/** Renders the sidebar by inserting the provided HTML text into the sidebar container and adjusting paths as needed.
 * @param {string} htmlText - The HTML content to render in the sidebar.
 * @param {boolean} isRoot - Indicates whether the current page is in the root directory or not, used for adjusting paths.
 */
function renderSidebar(htmlText, isRoot) {
  const container = document.getElementById("sidebar-container");
  if (!container) return;
  container.innerHTML = adjustSidebarPaths(htmlText, isRoot);
}


/** Initializes the sidebar features by updating visibility, setting active links, and setting up the toggle functionality. */  
function initSidebarFeatures() {
  updateSidebarVisibility(true);
  setActiveSidebar();
  setActiveMobileNav();
  setupSidebarToggle();
}


/**
 * Sets the active class for the current page link in the sidebar.
 */
function setActiveSidebar() {
  const links = document.querySelectorAll('.nav-item a');
  const currentPage = window.location.pathname.split('/').pop();

  links.forEach((link) => {
    const href = link.getAttribute('href').split('/').pop();
    link.classList.toggle('active', href === currentPage);
  });
}


/**
 * Sets the active class for the current page link in the mobile navigation.
 */
function setActiveMobileNav() {
  const links = document.querySelectorAll('.mobile-bottom-nav a');
  const currentPage = window.location.pathname.split('/').pop();
  links.forEach((link) => {
    const href = link.getAttribute('href').split('/').pop();
    link.classList.toggle('active', href === currentPage);
  });
}


/**
 * Adjusts the paths in the sidebar HTML text based on the current page's location.
 * @param {string} htmlText - The HTML content to adjust.
 * @param {boolean} isRoot - Indicates whether the current page is in the root directory or not.
 * @returns {string} The adjusted HTML content.
 */
function adjustSidebarPaths(htmlText, isRoot) {
  if (isRoot) {
    return htmlText.replace(/href="\.\/(?!assets)/g, 'href="./pages/');
  } else {
    let adjusted = htmlText.replace(/src="\.\/assets\//g, 'src="../assets/');
    return adjusted.replace(/href="\.\/assets\//g, 'href="../assets/');
  }
}


/**
 * Updates the visibility of the sidebar navigation items based on the user's login status.
 * @param {boolean} isLoggedIn - Indicates whether the user is logged in.
 */
function updateSidebarVisibility(isLoggedIn) {
  const loggedInNav = document.getElementById('sidebar-nav-logged-in');
  const guestNav = document.getElementById('sidebar-nav-guest');

  if (loggedInNav && guestNav) {
    loggedInNav.style.display = isLoggedIn ? 'block' : 'none';
    guestNav.style.display = isLoggedIn ? 'none' : 'block';
  }
}


/** Sets up the event listener for the sidebar toggle button to manage the opening and closing of the sidebar on smaller screens. */
function setupSidebarToggle() {
  const toggleButton = document.getElementById('sidebar-toggle');
  if (!toggleButton) return;
  toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
  });
}


/* Initializes the sidebar component when the DOM content is fully loaded. */
document.addEventListener("DOMContentLoaded", initSidebar);
initSidebar();
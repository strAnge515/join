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

function isRootPage() {
  return !window.location.pathname.includes("/pages/");
}

async function loadHeaderTemplate(isRoot) {
  const templatePath = getHeaderTemplatePath(isRoot);
  const response = await fetch(templatePath);
  if (!response.ok) return "";
  return await response.text();
}

function getHeaderTemplatePath(isRoot) {
  return isRoot ? "./pages/header.html" : "header.html";
}

function renderHeader(htmlText, isRoot) {
  const container = document.getElementById("header-container");
  if (!container) return;
  container.innerHTML = adjustHeaderPaths(htmlText, isRoot);
}

function initHeaderFeatures() {
  const currentUser = getCurrentUser();
  updateHeaderUI(currentUser, currentUser !== null);
  setupHeaderMenu();
  setupMobileAccountMenu();
}

function getCurrentUser() {
  const stored = sessionStorage.getItem("currentUser");
  if (!stored) return null;
  return JSON.parse(stored);
}

function adjustHeaderPaths(htmlText, isRoot) {
  if (isRoot) return adjustRootHeaderPaths(htmlText);
  return adjustPageHeaderPaths(htmlText);
}

function adjustRootHeaderPaths(htmlText) {
  return htmlText.replace(/href="\.\/(?!assets)/g, 'href="./pages/');
}

function adjustPageHeaderPaths(htmlText) {
  return htmlText
    .replace(/src="\.\/assets\//g, 'src="../assets/')
    .replace(/href="\.\/assets\//g, 'href="../assets/');
}

function updateHeaderUI(user, isLoggedIn) {
  const headerRight = document.querySelector(".header-right");
  if (!isLoggedIn) return hideElement(headerRight);
  updateProfileInitials(user);
}

function hideElement(element) {
  if (element) element.style.display = "none";
}

function updateProfileInitials(user) {
  const initials = getInitials(user);
  setText("header-account-circle", initials);
  setText("mobile-profile", initials);
}

function getInitials(user) {
  const parts = String(user.name || "").trim().split(" ");
  const first = getInitial(parts[0]);
  const second = getInitial(parts[1]);
  return first + second || "?";
}

function getInitial(namePart) {
  return namePart ? namePart[0].toUpperCase() : "";
}

function setupHeaderMenu() {
  const elements = getHeaderMenuElements();
  if (!elements.accountCircle || !elements.accountMenu) return;
  addDesktopMenuToggle(elements);
  addDesktopMenuClose(elements);
  addDesktopLogout(elements.logoutLink);
}

function getHeaderMenuElements() {
  const accountMenu = document.getElementById("header-account-menu");
  return {
    accountCircle: document.getElementById("header-account-circle"),
    accountMenu,
    logoutLink: accountMenu?.querySelector('a[href*="index.html"]'),
  };
}

function addDesktopMenuToggle({ accountCircle, accountMenu }) {
  accountCircle.addEventListener("click", () => {
    accountMenu.classList.toggle("account-menu--show");
  });
}

function addDesktopMenuClose({ accountCircle, accountMenu }) {
  document.addEventListener("click", (event) => {
    if (!accountCircle.contains(event.target)) {
      accountMenu.classList.remove("account-menu--show");
    }
  });
}

function addDesktopLogout(logoutLink) {
  if (!logoutLink) return;
  logoutLink.addEventListener("click", (event) => {
    event.preventDefault();
    logoutUser(logoutLink.href);
  });
}

function setupMobileAccountMenu() {
  const mobileMenu = document.getElementById("mobile-account-menu");
  const logoutBtn = document.getElementById("mobile-logout-btn");
  addMobileMenuClickListener(mobileMenu);
  addMobileLogout(logoutBtn);
}

function addMobileMenuClickListener(mobileMenu) {
  document.addEventListener("click", (event) => {
    handleMobileMenuClick(event, mobileMenu);
  });
}

function handleMobileMenuClick(event, mobileMenu) {
  const mobileProfile = event.target.closest("#mobile-profile");
  if (!mobileMenu) return;
  if (mobileProfile) return toggleMobileMenu(event, mobileMenu);
  closeMobileMenuOnOutsideClick(event, mobileMenu);
}

function toggleMobileMenu(event, mobileMenu) {
  event.stopPropagation();
  mobileMenu.classList.toggle("mobile-account-menu--show");
}

function closeMobileMenuOnOutsideClick(event, mobileMenu) {
  if (!mobileMenu.contains(event.target)) {
    mobileMenu.classList.remove("mobile-account-menu--show");
  }
}

function addMobileLogout(logoutBtn) {
  if (!logoutBtn) return;
  logoutBtn.addEventListener("click", () => {
    logoutUser("../index.html");
  });
}

function logoutUser(redirectPath) {
  sessionStorage.removeItem("currentUser");
  sessionStorage.removeItem("mobileGreetingShown");
  window.location.href = redirectPath;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

initHeader();
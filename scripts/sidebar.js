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

function getTemplatePath(isRoot) {
  return isRoot ? "./pages/sidebar.html" : "sidebar.html";
}

function renderSidebar(htmlText, isRoot) {
  const container = document.getElementById("sidebar-container");
  if (!container) return;
  container.innerHTML = adjustSidebarPaths(htmlText, isRoot);
}

function initSidebarFeatures() {
  updateSidebarVisibility(true);
  setActiveSidebar();
  setActiveMobileNav();
  setupSidebarToggle();
}

function setActiveSidebar() {
  const links = document.querySelectorAll('.nav-item a');
  const currentPage = window.location.pathname.split('/').pop();

  links.forEach((link) => {
    const href = link.getAttribute('href').split('/').pop();
    link.classList.toggle('active', href === currentPage);
  });
}

function setActiveMobileNav() {
  const links = document.querySelectorAll('.mobile-bottom-nav a');
  const currentPage = window.location.pathname.split('/').pop();
  links.forEach((link) => {
    const href = link.getAttribute('href').split('/').pop();
    link.classList.toggle('active', href === currentPage);
  });
}

function adjustSidebarPaths(htmlText, isRoot) {
  if (isRoot) {
    return htmlText.replace(/href="\.\/(?!assets)/g, 'href="./pages/');
  } else {
    let adjusted = htmlText.replace(/src="\.\/assets\//g, 'src="../assets/');
    return adjusted.replace(/href="\.\/assets\//g, 'href="../assets/');
  }
}

function updateSidebarVisibility(isLoggedIn) {
  const loggedInNav = document.getElementById('sidebar-nav-logged-in');
  const guestNav = document.getElementById('sidebar-nav-guest');

  if (loggedInNav && guestNav) {
    loggedInNav.style.display = isLoggedIn ? 'block' : 'none';
    guestNav.style.display = isLoggedIn ? 'none' : 'block';
  }
}

function setupSidebarToggle() {
  const toggleButton = document.getElementById('sidebar-toggle');
  if (!toggleButton) return;
  toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
  });
}

initSidebar();
async function initSidebar() {
  try {
    const isRoot = !window.location.pathname.includes('/pages/');
    const templatePath = isRoot ? './pages/sidebar.html' : 'sidebar.html';
    const response = await fetch(templatePath);

    if (response.ok) {
      let htmlText = await response.text();
      htmlText = adjustSidebarPaths(htmlText, isRoot);
      document.getElementById('sidebar-container').innerHTML = htmlText;

      updateSidebarVisibility(true);
      setActiveSidebar();
      setActiveMobileNav();
    }
  } catch (error) {
    console.error(error);
  }
}

function setActiveSidebar() {
  const links = document.querySelectorAll('.nav-item a');
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

function setActiveMobileNav() {
  const links = document.querySelectorAll('.mobile-bottom-nav a');
  const currentPage = window.location.pathname.split('/').pop();

  links.forEach((link) => {
    const href = link.getAttribute('href').split('/').pop();
    link.classList.toggle('active', href === currentPage);
  });
}

initSidebar();
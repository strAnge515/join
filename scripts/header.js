async function initHeader() {
  try {
    const isRoot = !window.location.pathname.includes("/pages/");
    const templatePath = isRoot ? "./pages/header.html" : "header.html";
    const response = await fetch(templatePath);

    if (!response.ok) return;

    let htmlText = await response.text();
    htmlText = adjustHeaderPaths(htmlText, isRoot);

    document.getElementById("header-container").innerHTML = htmlText;

    const currentUser = getCurrentUser();
    updateHeaderUI(currentUser, currentUser !== null);
    setupHeaderMenu();
    setupMobileAccountMenu();
  } catch (error) {
    console.error(error);
  }
}

function getCurrentUser() {
  const stored = sessionStorage.getItem("currentUser");
  return stored ? JSON.parse(stored) : null;
}

function adjustHeaderPaths(htmlText, isRoot) {
  if (isRoot) {
    return htmlText.replace(/href="\.\/(?!assets)/g, 'href="./pages/');
  }

  let adjusted = htmlText.replace(/src="\.\/assets\//g, 'src="../assets/');
  return adjusted.replace(/href="\.\/assets\//g, 'href="../assets/');
}

function updateHeaderUI(user, isLoggedIn) {
  const headerRight = document.querySelector(".header-right");
  const accountCircle = document.getElementById("header-account-circle");
  const mobileProfile = document.getElementById("mobile-profile");

  if (!isLoggedIn) {
    if (headerRight) headerRight.style.display = "none";
    return;
  }

  const initials = getInitials(user);

  if (accountCircle) accountCircle.textContent = initials;
  if (mobileProfile) mobileProfile.textContent = initials;
}

function getInitials(user) {
  const parts = String(user.name || "").trim().split(" ");
  const first = parts[0] ? parts[0][0].toUpperCase() : "";
  const second = parts[1] ? parts[1][0].toUpperCase() : "";
  return first + second || "?";
}

function setupHeaderMenu() {
    const accountCircle = document.getElementById('header-account-circle');
    const accountMenu = document.getElementById('header-account-menu');
    if (!accountCircle || !accountMenu) return;
    const logoutLink = accountMenu.querySelector('a[href*="index.html"]');
    accountCircle.addEventListener('click', () => {
        accountMenu.classList.toggle('account-menu--show');
    });
    document.addEventListener('click', (event) => {
        if (!accountCircle.contains(event.target)) {
            accountMenu.classList.remove('account-menu--show');
        }
    });
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('currentUser');
            window.location.href = logoutLink.href;
        });
    }
}

function setupMobileAccountMenu() {
  const mobileMenu = document.getElementById("mobile-account-menu");
  const logoutBtn = document.getElementById("mobile-logout-btn");

  document.addEventListener("click", (event) => {
    const mobileProfile = event.target.closest("#mobile-profile");

    if (!mobileMenu) return;

    if (mobileProfile) {
      event.stopPropagation();
      mobileMenu.classList.toggle("mobile-account-menu--show");
      return;
    }

    if (!mobileMenu.contains(event.target)) {
      mobileMenu.classList.remove("mobile-account-menu--show");
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("currentUser");
      window.location.href = "../index.html";
    });
  }
}

initHeader();
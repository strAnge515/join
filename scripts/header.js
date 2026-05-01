/**
 * Initializes the header, loads the HTML template, handles paths, and sets up UI.
 */
async function initHeader() {
  try {
    const isRoot = !window.location.pathname.includes("/pages/");
    const templatePath = isRoot ? "./pages/header.html" : "header.html";
    const response = await fetch(templatePath);

    if (!response.ok) return;

    let htmlText = await response.text();
    htmlText = adjustHeaderPaths(htmlText, isRoot);

    document.getElementById("header-container").innerHTML = htmlText;

    updateHeaderUI(getCurrentUser(), true);
    setupHeaderMenu();
  } catch (error) {
    console.error(error);
  }
    try {
        const isRoot = !window.location.pathname.includes('/pages/');
        const templatePath = isRoot ? './pages/header.html' : 'header.html';
        const response = await fetch(templatePath);
        
        if (response.ok) {
            let htmlText = await response.text();
            htmlText = adjustHeaderPaths(htmlText, isRoot);
            document.getElementById('header-container').innerHTML = htmlText;
            const currentUser = getCurrentUser();
            updateHeaderUI(currentUser, currentUser !== null);
            setupHeaderMenu();
        }
    } catch (error) {
        console.error(error);
    }
}


/**
 * Reads the currently logged-in user from sessionStorage.
 * @returns {Object|null} The user object or null if not logged in.
 */
function getCurrentUser() {
    const stored = sessionStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
}

function adjustHeaderPaths(htmlText, isRoot) {
  if (isRoot) {
    return htmlText.replace(/href="\.\/(?!assets)/g, 'href="./pages/');
  }

  let adjusted = htmlText.replace(/src="\.\/assets\//g, 'src="../assets/');
  return adjusted.replace(/href="\.\/assets\//g, 'href="../assets/');
}

/**
 * Updates the header UI elements based on login status and user data.
 * @param {Object|null} user - The user object containing the name.
 * @param {boolean} isLoggedIn - The current login status.
 */
function updateHeaderUI(user, isLoggedIn) {
  const headerRight = document.querySelector(".header-right");
  const accountCircle = document.getElementById("header-account-circle");

  if (!isLoggedIn && headerRight) {
    headerRight.style.display = "none";
    return;
  }

  if (accountCircle && user) {
    accountCircle.textContent = getInitials(user);
  }
}

function getInitials(user) {
  const firstName = String(user.firstName || "").trim();
  const lastName = String(user.lastName || "").trim();

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  if (firstName) {
    return firstName[0].toUpperCase();
  }

  return "?";
}

function setupHeaderMenu() {
  const accountCircle = document.getElementById("header-account-circle");
  const accountMenu = document.getElementById("header-account-menu");
    const accountCircle = document.getElementById('header-account-circle');
    const accountMenu = document.getElementById('header-account-menu');
    const logoutLink = accountMenu ? accountMenu.querySelector('a[href*="index.html"]') : null;

    if (accountCircle && accountMenu) {
        accountCircle.addEventListener('click', () => {
            accountMenu.classList.toggle('account-menu--show');
        });
        document.addEventListener('click', (event) => {
            if (!accountCircle.contains(event.target)) {
                accountMenu.classList.remove('account-menu--show');
            }
        });
    }
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('currentUser');
            window.location.href = logoutLink.href;
        });
    }
}

initHeader();
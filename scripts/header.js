/**
 * Initializes the header, loads the HTML template, handles paths, and sets up UI.
 */
async function initHeader() {
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


/**
 * Adjusts asset and page paths in the header HTML based on whether the current page is root-level.
 * @param {string} htmlText - The raw header HTML string.
 * @param {boolean} isRoot - Whether the current page is at the root level.
 * @returns {string} The adjusted HTML string.
 */
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
    const headerRight = document.querySelector('.header-right');
    const accountCircle = document.getElementById('header-account-circle');

    if (!isLoggedIn) {
        if (headerRight) headerRight.style.display = 'none';
        return;
    }

    if (accountCircle && user) {
        accountCircle.textContent = getInitials(user);
    }
}


/**
 * Derives initials from the user's full name stored in sessionStorage.
 * @param {Object} user - The user object with a name property.
 * @returns {string} One or two uppercase initials, or "?" as fallback.
 */
function getInitials(user) {
    const parts = String(user.name || '').trim().split(' ');
    const first = parts[0] ? parts[0][0].toUpperCase() : '';
    const second = parts[1] ? parts[1][0].toUpperCase() : '';
    return (first + second) || '?';
}


/**
 * Sets up the account menu toggle and logout behaviour in the header.
 */
function setupHeaderMenu() {
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

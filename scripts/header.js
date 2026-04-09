/**
 * Test user data to generate initials.
 * Replace this later with data from Firebase.
 */
let testUser = {
    name: "Anton Mayer"
};


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
            
            updateHeaderUI(testUser, true);
            setupHeaderMenu();
        }
    } catch (error) {
        console.error(error);
    }
}


/**
 * Adjusts the asset and link paths in the loaded HTML based on the current directory.
 * @param {string} htmlText - The loaded HTML string.
 * @param {boolean} isRoot - True if the current page is in the root directory.
 * @returns {string} The HTML string with corrected paths.
 */
function adjustHeaderPaths(htmlText, isRoot) {
    if (isRoot) {
        return htmlText.replace(/href="\.\/(?!assets)/g, 'href="./pages/');
    } else {
        let adjusted = htmlText.replace(/src="\.\/assets\//g, 'src="../assets/');
        return adjusted.replace(/href="\.\/assets\//g, 'href="../assets/');
    }
}


/**
 * Updates the header UI elements based on login status and user data.
 * @param {Object} user - The user object containing the name.
 * @param {boolean} isLoggedIn - The current login status.
 */
function updateHeaderUI(user, isLoggedIn) {
    const headerRight = document.querySelector('.header-right');
    const accountCircle = document.getElementById('header-account-circle');
    
    if (!isLoggedIn && headerRight) {
        headerRight.style.display = 'none';
        return;
    }
    if (accountCircle && user && user.name) {
        accountCircle.innerText = generateInitials(user.name);
    }
}


/**
 * Generates initials safely from the first letters of the first two names.
 * @param {string} name - The full name of the user.
 * @returns {string} The generated initials.
 */
function generateInitials(name) {
    const names = name.trim().split(/\s+/);
    return names.slice(0, 2).map(n => n[0] ? n[0].toUpperCase() : "").join('');
}


/**
 * Sets up the event listeners to toggle the account popup menu.
 */
function setupHeaderMenu() {
    const accountCircle = document.getElementById('header-account-circle');
    const accountMenu = document.getElementById('header-account-menu');

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
}


initHeader();
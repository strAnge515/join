/**
 * Initializes the sidebar by fetching the template and applying path corrections.
 */
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
function adjustSidebarPaths(htmlText, isRoot) {
    if (isRoot) {
        return htmlText.replace(/href="\.\/(?!assets)/g, 'href="./pages/');
    } else {
        let adjusted = htmlText.replace(/src="\.\/assets\//g, 'src="../assets/');
        return adjusted.replace(/href="\.\/assets\//g, 'href="../assets/');
    }
}


/**
 * Updates the visibility of the sidebar navigation based on login status.
 * @param {boolean} isLoggedIn - The current login status.
 */
function updateSidebarVisibility(isLoggedIn) {
    const loggedInNav = document.getElementById('sidebar-nav-logged-in');
    const guestNav = document.getElementById('sidebar-nav-guest');
    
    if (loggedInNav && guestNav) {
        loggedInNav.style.display = isLoggedIn ? 'block' : 'none';
        guestNav.style.display = isLoggedIn ? 'none' : 'block';
    }
}


document.addEventListener('DOMContentLoaded', initSidebar);
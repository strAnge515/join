/**
 * Initializes the sidebar by fetching the HTML template and rendering it into the container.
 */
async function initSidebar() {
    try {
        const response = await fetch('sidebar.html');
        if (response.ok) {
            const htmlText = await response.text();
            document.getElementById('sidebar-container').innerHTML = htmlText;
            
            let isLoggedIn = true;
            updateSidebarVisibility(isLoggedIn);
        }
    } catch (error) {
        console.error(error);
    }
}


/**
 * Updates the visibility of the sidebar navigation elements based on login status.
 * @param {boolean} isLoggedIn - The current login status of the user.
 */
function updateSidebarVisibility(isLoggedIn) {
    const loggedInNav = document.getElementById('sidebar-nav-logged-in');
    const guestNav = document.getElementById('sidebar-nav-guest');
    
    if (loggedInNav && guestNav) {
        if (isLoggedIn) {
            loggedInNav.style.display = 'block';
            guestNav.style.display = 'none';
        } else {
            loggedInNav.style.display = 'none';
            guestNav.style.display = 'block';
        }
    }
}


document.addEventListener('DOMContentLoaded', initSidebar);
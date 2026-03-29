/**
 * Test user data to generate initials.
 * Replace this later with data from Firebase.
 */
let testUser = {
    name: "Anton Mayer"
};


/**
 * Initializes the header by loading the template and setting up the initials and menu.
 */
async function initHeader() {
    try {
        const response = await fetch('header.html');
        if (response.ok) {
            const htmlText = await response.text();
            document.getElementById('header-container').innerHTML = htmlText;
            
            let isLoggedIn = true;
            updateHeaderUI(testUser, isLoggedIn);
            setupHeaderMenu();
        }
    } catch (error) {
        console.error(error);
    }
}


/**
 * Updates the header UI based on login status and user data.
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
        const initials = generateInitials(user.name);
        accountCircle.innerText = initials;
    }
}


/**
 * Generates the initials from the first letters of the first two names.
 * @param {string} name - The full name of the user.
 * @returns {string} The generated initials (e.g. "AM").
 */
function generateInitials(name) {
    const names = name.split(' ');
    
    const initials = names.slice(0, 2)
                          .map(namePart => namePart[0].toUpperCase())
                          .join('');
                          
    return initials;
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


document.addEventListener('DOMContentLoaded', initHeader);
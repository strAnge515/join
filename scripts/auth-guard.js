/**
 * Redirects unauthenticated users to the login page.
 * Call on every protected page (summary, board, contacts, task).
 */
function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = '../index.html';
    }
}


checkAuth();
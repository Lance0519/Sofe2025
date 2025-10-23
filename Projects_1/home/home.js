// Home page functionality

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const currentUser = Auth.getCurrentUser();
    
    // Update navigation if user is logged in
    if (currentUser) {
        updateNavigationForLoggedInUser(currentUser);
    }
});

function updateNavigationForLoggedInUser(user) {
    const nav = document.querySelector('nav ul');
    const loginLink = nav.querySelector('a[href="../login/login.html"]');
    
    if (loginLink) {
        const listItem = loginLink.parentElement;
        listItem.innerHTML = `
            <a href="../dashboard/${user.role}.html" class="btn btn-primary">Dashboard</a>
        `;
    }
}


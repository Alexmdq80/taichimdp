/**
 * Main entry point for the application
 */

import { initRouter, route, navigate } from './router.js';
import PracticantesPage from './pages/practicantes.js';
import LoginPage from './pages/login.js';
import RegisterPage from './pages/register.js';
import TiposAbonoPage from './pages/tiposAbono.js'; // Import the new page component
import PagosPage from './pages/pagos.js'; // Import PagosPage
import LugaresPage from './pages/lugares.js'; // Import LugaresPage

// Function to check if user is authenticated
function isAuthenticated() {
  return localStorage.getItem('token') !== null;
}

// Function to handle logout
function logout() {
  localStorage.removeItem('token');
  updateNavigation(); // Update navigation after logout
  navigate('/login');
}

// Function to update navigation links based on authentication status
function updateNavigation() {
  const navLinksDiv = document.querySelector('#nav-links');
  if (navLinksDiv) {
    navLinksDiv.innerHTML = ''; // Clear existing links
    if (isAuthenticated()) {
      // Authenticated user links
      const practicantesLink = document.createElement('a');
      practicantesLink.href = '/practicantes';
      practicantesLink.textContent = 'Practicantes';
      navLinksDiv.appendChild(practicantesLink);

      const tiposAbonoLink = document.createElement('a'); // New link for tipos de abono
      tiposAbonoLink.href = '/tipos-abono';
      tiposAbonoLink.textContent = 'Tipos de Abono';
      navLinksDiv.appendChild(tiposAbonoLink);

      const lugaresLink = document.createElement('a'); // New link for Lugares
      lugaresLink.href = '/lugares';
      lugaresLink.textContent = 'Lugares';
      navLinksDiv.appendChild(lugaresLink);

      const pagosLink = document.createElement('a'); // New link for Pagos
      pagosLink.href = '/pagos';
      pagosLink.textContent = 'Pagos';
      navLinksDiv.appendChild(pagosLink);

      const logoutLink = document.createElement('a');
      logoutLink.href = '#'; // Prevent default navigation
      logoutLink.textContent = 'Cerrar Sesión';
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
      navLinksDiv.appendChild(logoutLink);
    } else {
      // Non-authenticated user links
      const loginLink = document.createElement('a');
      loginLink.href = '/login';
      loginLink.textContent = 'Iniciar Sesión';
      navLinksDiv.appendChild(loginLink);

      const registerLink = document.createElement('a');
      registerLink.href = '/register';
      registerLink.textContent = 'Registrarse';
      navLinksDiv.appendChild(registerLink);
    }
  }
}

// Register routes
route('/', () => {
  if (isAuthenticated()) {
    navigate('/practicantes');
  }
  else {
    navigate('/login');
  }
  updateNavigation(); // Update navigation after routing
});

route('/login', () => {
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    const page = new LoginPage(mainContent);
    page.render();
  }
  updateNavigation(); // Update navigation after routing
});

route('/register', () => {
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    const page = new RegisterPage(mainContent);
    page.render();
  }
  updateNavigation(); // Update navigation after routing
});

route('/practicantes', () => {
  if (!isAuthenticated()) {
    navigate('/login');
    return;
  }
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    const page = new PracticantesPage(mainContent);
    page.render();
  }
  updateNavigation(); // Update navigation after routing
});

// New route for displaying payment history and opening payment modal
route('/practicantes/:id/pagar', (params) => {
    if (!isAuthenticated()) {
        navigate('/login');
        return;
    }
    const practicanteId = parseInt(params.id, 10);
    if (isNaN(practicanteId)) {
        console.error('Invalid practicante ID for payment.');
        navigate('/practicantes'); // Redirect to main practicantes list
        return;
    }

    const mainContent = document.querySelector('#main-content');
    if (mainContent) {
        // Render PracticantesPage with options to load a specific practicante and open the payment modal
        const page = new PracticantesPage(mainContent, {
            initialPracticanteId: practicanteId,
            openPaymentModalInitially: true,
        });
        page.render();
    }
    updateNavigation(); // Update navigation after routing
});

route('/tipos-abono', () => { // New route for Tipos de Abono
  if (!isAuthenticated()) {
    navigate('/login');
    return;
  }
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    const page = new TiposAbonoPage(mainContent); // Use the new page component
    page.render();
  }
  updateNavigation(); // Update navigation after routing
});

route('/pagos', () => { // New route for Pagos
  if (!isAuthenticated()) {
    navigate('/login');
    return;
  }
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    const page = new PagosPage(mainContent); // Use the new page component
    page.render();
  }
  updateNavigation(); // Update navigation after routing
});

route('/lugares', () => { // New route for Lugares
  if (!isAuthenticated()) {
    navigate('/login');
    return;
  }
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    const page = new LugaresPage(mainContent);
    page.render();
  }
  updateNavigation(); // Update navigation after routing
});

// Initialize router when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    updateNavigation(); // Initial navigation update
  });
} else {
  initRouter();
  updateNavigation(); // Initial navigation update
}

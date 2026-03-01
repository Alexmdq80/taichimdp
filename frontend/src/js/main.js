/**
 * Main entry point for the application
 */

import { initRouter, route, navigate } from './router.js';
import PracticantesPage from './pages/practicantes.js';
import SociosPage from './pages/socios.js';
import ProfesoresPage from './pages/profesores.js';
import LoginPage from './pages/login.js';
import RegisterPage from './pages/register.js';
import TiposAbonoPage from './pages/tiposAbono.js'; // Import the new page component
import PagosPage from './pages/pagos.js'; // Import PagosPage
import LugaresPage from './pages/lugares.js'; // Import LugaresPage
import ActividadesPage from './pages/actividades.js'; // Import ActividadesPage
import HorariosPage from './pages/horarios.js'; // Import HorariosPage
import AsistenciaPage from './pages/asistencia.js'; // Import AsistenciaPage
import CostosPage from './pages/costos.js'; // Import CostosPage
import { apiClient } from './api/client.js';

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

      const sociosLink = document.createElement('a');
      sociosLink.href = '/socios';
      sociosLink.textContent = 'Socios';
      navLinksDiv.appendChild(sociosLink);

      // Check for teacher alerts asynchronously
      checkTeacherAlerts(sociosLink);

      const profesoresLink = document.createElement('a');
      profesoresLink.href = '/profesores';
      profesoresLink.textContent = 'Profesores';
      navLinksDiv.appendChild(profesoresLink);

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

      const actividadesLink = document.createElement('a'); // New link for Actividades
      actividadesLink.href = '/actividades';
      actividadesLink.textContent = 'Actividades';
      navLinksDiv.appendChild(actividadesLink);

      const horariosLink = document.createElement('a'); // New link for Horarios
      horariosLink.href = '/horarios';
      horariosLink.textContent = 'Horarios';
      navLinksDiv.appendChild(horariosLink);

      const asistenciaLink = document.createElement('a'); // New link for Asistencia
      asistenciaLink.href = '/asistencia';
      asistenciaLink.textContent = 'Asistencia';
      navLinksDiv.appendChild(asistenciaLink);

      const costosLink = document.createElement('a');
      costosLink.href = '/costos';
      costosLink.textContent = 'Costos';
      navLinksDiv.appendChild(costosLink);

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

async function checkTeacherAlerts(sociosLink) {
    if (!isAuthenticated()) return;
    try {
        const response = await apiClient.get('/socios/teacher-alerts');
        const alerts = response.data;
        const totalAlerts = alerts.missingRegistration.length + alerts.expiredPayments.length;
        
        if (totalAlerts > 0) {
            const badge = document.createElement('span');
            badge.className = 'badge badge-danger ml-1';
            badge.style.borderRadius = '10px';
            badge.style.padding = '2px 8px';
            badge.style.fontSize = '0.75rem';
            badge.style.fontWeight = 'bold';
            badge.textContent = totalAlerts;
            badge.title = 'Tiene cuotas sociales de profesor pendientes o por vencer';
            sociosLink.appendChild(badge);
        } else if (alerts.soonToExpire.length > 0) {
            const badge = document.createElement('span');
            badge.className = 'badge badge-warning ml-1';
            badge.style.borderRadius = '10px';
            badge.style.padding = '2px 8px';
            badge.style.fontSize = '0.75rem';
            badge.style.fontWeight = 'bold';
            badge.textContent = alerts.soonToExpire.length;
            badge.title = 'Tiene cuotas sociales de profesor próximas a vencer';
            sociosLink.appendChild(badge);
        }
    } catch (error) {
        console.error('Error checking teacher alerts:', error);
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

route('/socios', () => {
  if (!isAuthenticated()) {
    navigate('/login');
    return;
  }
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    const page = new SociosPage(mainContent);
    page.render();
  }
  updateNavigation(); // Update navigation after routing
});

route('/profesores', () => {
  if (!isAuthenticated()) {
    navigate('/login');
    return;
  }
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    const page = new ProfesoresPage(mainContent);
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

route('/actividades', () => { // New route for Actividades
  if (!isAuthenticated()) {
    navigate('/login');
    return;
  }
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    const page = new ActividadesPage(mainContent);
    page.render();
  }
  updateNavigation(); // Update navigation after routing
});

route('/horarios', () => { // New route for Horarios
  if (!isAuthenticated()) {
    navigate('/login');
    return;
  }
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    const page = new HorariosPage(mainContent);
    page.render();
  }
  updateNavigation(); // Update navigation after routing
});

route('/asistencia', () => { // New route for Asistencia
  if (!isAuthenticated()) {
    navigate('/login');
    return;
  }
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    const page = new AsistenciaPage(mainContent);
    page.render();
  }
  updateNavigation(); // Update navigation after routing
});

route('/costos', () => {
  if (!isAuthenticated()) {
    navigate('/login');
    return;
  }
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    const page = new CostosPage(mainContent);
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

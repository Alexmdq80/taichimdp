/**
 * Main entry point for the application
 */

import { initRouter, route, navigate } from './router.js';
import PracticantesPage from './pages/practicantes.js';

// Register routes
route('/', () => {
  navigate('/practicantes');
});

route('/practicantes', () => {
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    const page = new PracticantesPage(mainContent);
    page.render();
  }
});

// Initialize router when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initRouter();
  });
} else {
  initRouter();
}

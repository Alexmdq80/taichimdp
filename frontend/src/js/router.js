/**
 * Simple router for frontend navigation
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.params = {};
  }

  /**
   * Register a route
   * @param {string} path - Route path (supports :param)
   * @param {Function} handler - Route handler function
   */
  route(path, handler) {
    this.routes.set(path, handler);
  }

  /**
   * Navigate to a route
   * @param {string} path - Route path
   */
  navigate(path) {
    // Find matching route
    for (const [routePath, handler] of this.routes.entries()) {
      const params = this.matchRoute(routePath, path);
      if (params !== null) {
        this.currentRoute = path;
        this.params = params;
        handler(params);
        // Update URL without page reload
        window.history.pushState({ path }, '', path);
        return;
      }
    }

    // No route matched, try default route
    if (this.routes.has('*')) {
      this.routes.get('*')({});
    }
  }

  /**
   * Match route pattern to actual path
   * @param {string} pattern - Route pattern (e.g., '/users/:id')
   * @param {string} path - Actual path (e.g., '/users/123')
   * @returns {Object|null} - Params object or null if no match
   */
  matchRoute(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(':')) {
        // This is a parameter
        const paramName = patternPart.slice(1);
        params[paramName] = pathPart;
      } else if (patternPart !== pathPart) {
        // Path doesn't match
        return null;
      }
    }

    return params;
  }

  /**
   * Initialize router with browser history support
   */
  init() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      const path = e.state?.path || window.location.pathname;
      this.navigate(path);
    });

    // Handle initial load
    this.navigate(window.location.pathname);
  }
}

// Create singleton instance
const router = new Router();

// Helper function to navigate
export function navigate(path) {
  router.navigate(path);
}

// Helper function to register routes
export function route(path, handler) {
  router.route(path, handler);
}

// Initialize router
export function initRouter() {
  router.init();
}

export default router;

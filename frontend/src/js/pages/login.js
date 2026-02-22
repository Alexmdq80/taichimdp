import { navigate } from '../router.js';
import { authApi } from '../api/client.js';

class LoginPage {
    constructor(mainContentElement) {
        this.mainContentElement = mainContentElement;
    }

    async render() {
        // Load the HTML content for the login page
        const response = await fetch('/src/pages/login.html');
        this.mainContentElement.innerHTML = await response.text();

        this.form = this.mainContentElement.querySelector('#login-form');
        this.emailInput = this.mainContentElement.querySelector('#email');
        this.passwordInput = this.mainContentElement.querySelector('#password');
        this.errorMessageElement = this.mainContentElement.querySelector('#login-error-message');

        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(event) {
        event.preventDefault();

        const email = this.emailInput.value;
        const password = this.passwordInput.value;

        try {
            this.errorMessageElement.style.display = 'none';
            const response = await authApi.login(email, password);
            
            if (response.token) {
                localStorage.setItem('token', response.token);
                // Redirect to a protected page, e.g., practicantes list
                navigate('/practicantes');
            } else {
                this.showError('Login failed: No token received.');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.message || 'An unexpected error occurred during login.';
            this.showError(errorMessage);
        }
    }

    showError(message) {
        this.errorMessageElement.textContent = message;
        this.errorMessageElement.style.display = 'block';
    }
}

export default LoginPage;

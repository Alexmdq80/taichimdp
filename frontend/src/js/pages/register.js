import { navigate } from '../router.js';
import { authApi } from '../api/client.js';

class RegisterPage {
    constructor(mainContentElement) {
        this.mainContentElement = mainContentElement;
    }

    async render() {
        const response = await fetch('/src/pages/register.html');
        this.mainContentElement.innerHTML = await response.text();

        this.form = this.mainContentElement.querySelector('#register-form');
        this.emailInput = this.mainContentElement.querySelector('#email');
        this.passwordInput = this.mainContentElement.querySelector('#password');
        this.confirmPasswordInput = this.mainContentElement.querySelector('#confirm-password');
        this.errorMessageElement = this.mainContentElement.querySelector('#register-error-message');

        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(event) {
        event.preventDefault();

        const email = this.emailInput.value;
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;

        if (password !== confirmPassword) {
            this.showError('Las contraseñas no coinciden.');
            return;
        }

        try {
            this.errorMessageElement.style.display = 'none';
            await authApi.register(email, password);
            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.message || 'Ocurrió un error inesperado durante el registro.';
            this.showError(errorMessage);
        }
    }

    showError(message) {
        this.errorMessageElement.textContent = message;
        this.errorMessageElement.style.display = 'block';
    }
}

export default RegisterPage;

/**
 * PracticanteForm Component
 * Form for creating and editing practicantes
 */

import { validateField, clearFieldError, showFieldError } from '../utils/validation.js';
import { displayApiError, showError } from '../utils/errors.js';
import api from '../api/client.js';

export class PracticanteForm {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onSuccess: options.onSuccess || (() => {}),
      onCancel: options.onCancel || (() => {}),
      practicante: options.practicante || null
    };
    this.isEditing = !!this.options.practicante;
  }

  render() {
    const practicante = this.options.practicante || {};
    
    this.container.innerHTML = `
      <form id="practicante-form" class="card">
        <div class="card-header">
          <h2 class="card-title">${this.isEditing ? 'Editar Practicante' : 'Nuevo Practicante'}</h2>
        </div>
        
        <div class="form-group">
          <label for="nombre_completo">Nombre Completo *</label>
          <input 
            type="text" 
            id="nombre_completo" 
            name="nombre_completo" 
            value="${practicante.nombre_completo || ''}"
            required
          />
        </div>

        <div class="form-group">
          <label for="fecha_nacimiento">Fecha de Nacimiento</label>
          <input 
            type="date" 
            id="fecha_nacimiento" 
            name="fecha_nacimiento" 
            value="${practicante.fecha_nacimiento || ''}"
          />
        </div>

        <div class="form-group">
          <label for="genero">Género</label>
          <select id="genero" name="genero">
            <option value="">Seleccionar...</option>
            <option value="M" ${practicante.genero === 'M' ? 'selected' : ''}>Masculino</option>
            <option value="F" ${practicante.genero === 'F' ? 'selected' : ''}>Femenino</option>
            <option value="Otro" ${practicante.genero === 'Otro' ? 'selected' : ''}>Otro</option>
            <option value="Prefiero no decir" ${practicante.genero === 'Prefiero no decir' ? 'selected' : ''}>Prefiero no decir</option>
          </select>
        </div>

        <div class="form-group">
          <label for="telefono">Teléfono *</label>
          <input 
            type="tel" 
            id="telefono" 
            name="telefono" 
            value="${practicante.telefono || ''}"
            placeholder="+1234567890"
          />
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value="${practicante.email || ''}"
            placeholder="usuario@example.com"
          />
        </div>

        <div class="form-group">
          <label for="direccion">Dirección</label>
          <textarea 
            id="direccion" 
            name="direccion" 
            rows="3"
          >${practicante.direccion || ''}</textarea>
        </div>

        <div class="form-group">
          <label for="condiciones_medicas">Condiciones Médicas</label>
          <textarea 
            id="condiciones_medicas" 
            name="condiciones_medicas" 
            rows="3"
          >${practicante.condiciones_medicas || ''}</textarea>
        </div>

        <div class="form-group">
          <label for="medicamentos">Medicamentos</label>
          <textarea 
            id="medicamentos" 
            name="medicamentos" 
            rows="3"
          >${practicante.medicamentos || ''}</textarea>
        </div>

        <div class="form-group">
          <label for="limitaciones_fisicas">Limitaciones Físicas</label>
          <textarea 
            id="limitaciones_fisicas" 
            name="limitaciones_fisicas" 
            rows="3"
          >${practicante.limitaciones_fisicas || ''}</textarea>
        </div>

        <div class="form-group">
          <label for="alergias">Alergias</label>
          <textarea 
            id="alergias" 
            name="alergias" 
            rows="3"
          >${practicante.alergias || ''}</textarea>
        </div>

        <div class="flex gap-2">
          <button type="submit" class="btn">${this.isEditing ? 'Actualizar' : 'Guardar'}</button>
          <button type="button" class="btn btn-secondary" id="cancel-btn">Cancelar</button>
        </div>
      </form>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const form = this.container.querySelector('#practicante-form');
    const cancelBtn = this.container.querySelector('#cancel-btn');

    // Form validation on blur
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });

      input.addEventListener('input', () => {
        clearFieldError(input);
      });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this.validateForm()) {
        await this.submitForm();
      }
    });

    // Cancel button
    cancelBtn.addEventListener('click', () => {
      this.options.onCancel();
    });
  }

  validateField(input) {
    const rules = [];
    
    if (input.hasAttribute('required')) {
      rules.push('required');
    }
    
    if (input.type === 'email') {
      rules.push('email');
    }
    
    if (input.type === 'tel') {
      rules.push('phone');
    }
    
    if (input.type === 'date') {
      rules.push('date');
    }

    const error = validateField(input, rules);
    if (error) {
      showFieldError(input, error);
      return false;
    } else {
      clearFieldError(input);
      return true;
    }
  }

  validateForm() {
    const form = this.container.querySelector('#practicante-form');
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    let isValid = true;
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    // Validate at least one of telefono or email
    const telefono = form.querySelector('#telefono').value.trim();
    const email = form.querySelector('#email').value.trim();
    
    if (!telefono && !email) {
      showError('Al menos uno de teléfono o email debe estar presente', this.container);
      isValid = false;
    }

    return isValid;
  }

  getFormData() {
    const form = this.container.querySelector('#practicante-form');
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      if (value.trim() !== '') {
        data[key] = value.trim();
      } else {
        data[key] = null;
      }
    }

    return data;
  }

  async submitForm() {
    const form = this.container.querySelector('#practicante-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Guardando...';

      const data = this.getFormData();
      let result;

      if (this.isEditing) {
        result = await api.put(`/practicantes/${this.options.practicante.id}`, data);
      } else {
        result = await api.post('/practicantes', data);
      }

      submitBtn.disabled = false;
      submitBtn.textContent = this.isEditing ? 'Actualizar' : 'Guardar';
      
      this.options.onSuccess(result.data);
    } catch (error) {
      submitBtn.disabled = false;
      submitBtn.textContent = this.isEditing ? 'Actualizar' : 'Guardar';
      
      if (error.status === 400 && error.details) {
        displayApiError(error, this.container);
      } else {
        showError('Error al guardar el practicante. Por favor, intente nuevamente.', this.container);
      }
    }
  }
}

export default PracticanteForm;

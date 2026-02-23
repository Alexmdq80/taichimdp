/**
 * TipoAbonoForm Component
 * Form for creating and editing tipos de abono
 */

import { validateField, clearFieldError, showFieldError } from '../utils/validation.js';
import { displayApiError, showError } from '../utils/errors.js';
import { makeRequest } from '../api/client.js';

export class TipoAbonoForm {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onSuccess: options.onSuccess || (() => {}),
      onCancel: options.onCancel || (() => {}),
      tipoAbono: options.tipoAbono || null
    };
    this.isEditing = !!this.options.tipoAbono;
  }

  render() {
    const tipoAbono = this.options.tipoAbono || {};
    
    this.container.innerHTML = `
      <form id="tipo-abono-form" class="card">
        <div class="card-header">
          <h2 class="card-title">${this.isEditing ? 'Editar Tipo de Abono' : 'Nuevo Tipo de Abono'}</h2>
        </div>
        
        <div class="form-group">
          <label for="nombre">Nombre *</label>
          <input 
            type="text" 
            id="nombre" 
            name="nombre" 
            value="${tipoAbono.nombre || ''}"
            required
          />
        </div>

        

        <div class="form-group">

          <label for="descripcion">Descripción</label>

          <textarea 

            id="descripcion" 

            name="descripcion" 

            rows="3"

          >${tipoAbono.descripcion || ''}</textarea>

        </div>



        <div class="form-group">
          <label for="duracion_dias">Duración (días)</label>
          <input 
            type="number" 
            id="duracion_dias" 
            name="duracion_dias" 
            value="${tipoAbono.duracion_dias !== undefined ? tipoAbono.duracion_dias : ''}"
            min="0"
          />
          <small class="text-muted">Use 0 para clases o sin vencimiento.</small>
        </div>



        <div class="form-group">

          <label for="precio">Precio</label>

          <input 

            type="number" 

            id="precio" 

            name="precio" 

            value="${tipoAbono.precio || ''}"

            step="0.01"

            min="0"

          />

        </div>



        <div class="flex gap-2">

          <button type="submit" class="btn">${this.isEditing ? 'Actualizar' : 'Guardar'}</button>          <button type="button" class="btn btn-secondary" id="cancel-btn">Cancelar</button>
        </div>
      </form>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const form = this.container.querySelector('#tipo-abono-form');
    const cancelBtn = this.container.querySelector('#cancel-btn');

    // Form validation on blur
    const inputs = form.querySelectorAll('input, textarea');
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
    const form = this.container.querySelector('#tipo-abono-form');
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    let isValid = true;
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    return isValid;
  }

  getFormData() {
    const form = this.container.querySelector('#tipo-abono-form');
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      if (value !== null && value.trim() !== '') {
        // Handle numbers
        if (key === 'duracion_dias' || key === 'precio') {
            data[key] = parseFloat(value);
        } else {
            data[key] = value.trim();
        }
      } else {
        data[key] = null;
      }
    }

    return data;
  }

  async submitForm() {
    const form = this.container.querySelector('#tipo-abono-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Guardando...';

      const data = this.getFormData();
      let result;

      if (this.isEditing) {
        result = await makeRequest(`/tipos-abono/${this.options.tipoAbono.id}`, 'PUT', data, true);
      } else {
        result = await makeRequest('/tipos-abono', 'POST', data, true);
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
        showError('Error al guardar el tipo de abono. Por favor, intente nuevamente.', this.container);
      }
    }
  }
}

export default TipoAbonoForm;

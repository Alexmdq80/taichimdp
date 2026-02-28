/**
 * ActividadForm Component
 */

import { makeRequest } from '../api/client.js';
import { displayApiError } from '../utils/errors.js';

export class ActividadForm {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      actividad: options.actividad || null,
      onSuccess: options.onSuccess || (() => {}),
      onCancel: options.onCancel || (() => {})
    };
    this.isEditing = !!this.options.actividad;
  }

  async render() {
    const actividad = this.options.actividad || {};
    
    this.container.innerHTML = `
      <form id="actividad-form" class="card">
        <div class="form-group">
          <label for="actividad-nombre">Nombre *</label>
          <input type="text" id="actividad-nombre" name="nombre" value="${actividad.nombre || ''}" required placeholder="Ej: Tai Chi, Qi Gong, Yoga" />
        </div>

        <div class="form-group">
          <label for="actividad-descripcion">Descripción</label>
          <textarea id="actividad-descripcion" name="descripcion" placeholder="Opcional: Detalles sobre la actividad">${actividad.descripcion || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="flex items-center gap-2 cursor-pointer" style="display: flex; align-items: center; gap: 0.5rem; width: fit-content;">
            <input type="checkbox" name="activo" ${actividad.activo !== false ? 'checked' : ''} style="width: auto; margin: 0;" />
            <span>Activa</span>
          </label>
        </div>

        <div class="flex gap-2">
          <button type="submit" class="btn btn-primary">${this.isEditing ? 'Actualizar' : 'Guardar'}</button>
          <button type="button" id="cancel-actividad-btn" class="btn btn-secondary">Cancelar</button>
        </div>
        <div id="actividad-form-error"></div>
      </form>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const form = this.container.querySelector('#actividad-form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion'),
        activo: formData.get('activo') === 'on'
      };

      try {
        if (this.isEditing) {
          await makeRequest(`/actividades/${this.options.actividad.id}`, 'PUT', data, true);
        } else {
          await makeRequest('/actividades', 'POST', data, true);
        }
        this.options.onSuccess();
      } catch (error) {
        displayApiError(error, this.container.querySelector('#actividad-form-error'));
      }
    });

    this.container.querySelector('#cancel-actividad-btn').addEventListener('click', () => {
      this.options.onCancel();
    });
  }
}

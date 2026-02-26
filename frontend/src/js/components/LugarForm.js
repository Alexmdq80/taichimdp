/**
 * LugarForm Component
 */

import { makeRequest } from '../api/client.js';
import { displayApiError } from '../utils/errors.js';

export class LugarForm {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      lugar: options.lugar || null,
      onSuccess: options.onSuccess || (() => {}),
      onCancel: options.onCancel || (() => {})
    };
    this.isEditing = !!this.options.lugar;
  }

  render() {
    const lugar = this.options.lugar || {};
    this.container.innerHTML = `
      <form id="lugar-form" class="card">
        <div class="form-group">
          <label for="lugar-nombre">Nombre *</label>
          <input type="text" id="lugar-nombre" name="nombre" value="${lugar.nombre || ''}" required />
        </div>
        <div class="form-group">
          <label for="lugar-direccion">Dirección</label>
          <textarea id="lugar-direccion" name="direccion">${lugar.direccion || ''}</textarea>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" name="activo" ${lugar.activo !== false ? 'checked' : ''} /> Activo
          </label>
        </div>
        <div class="flex gap-2">
          <button type="submit" class="btn btn-primary">${this.isEditing ? 'Actualizar' : 'Guardar'}</button>
          <button type="button" id="cancel-lugar-btn" class="btn btn-secondary">Cancelar</button>
        </div>
        <div id="lugar-form-error"></div>
      </form>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const form = this.container.querySelector('#lugar-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        nombre: formData.get('nombre'),
        direccion: formData.get('direccion'),
        activo: formData.get('activo') === 'on'
      };

      try {
        if (this.isEditing) {
          await makeRequest(`/lugares/${this.options.lugar.id}`, 'PUT', data, true);
        } else {
          await makeRequest('/lugares', 'POST', data, true);
        }
        this.options.onSuccess();
      } catch (error) {
        displayApiError(error, this.container.querySelector('#lugar-form-error'));
      }
    });

    this.container.querySelector('#cancel-lugar-btn').addEventListener('click', () => {
      this.options.onCancel();
    });
  }
}

/**
 * LugarList Component
 */

import { makeRequest } from '../api/client.js';
import { displayApiError, showSuccess } from '../utils/errors.js';

export class LugarList {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onEdit: options.onEdit || (() => {})
    };
    this.lugares = [];
  }

  async render() {
    this.container.innerHTML = '<div class="spinner"></div>';
    
    try {
      const response = await makeRequest('/lugares', 'GET', null, true);
      this.lugares = response.data;
      
      if (this.lugares.length === 0) {
        this.container.innerHTML = '<p class="text-center text-muted">No hay lugares registrados.</p>';
        return;
      }

      this.container.innerHTML = `
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="lugares-table-body">
            ${this.lugares.map(l => `
              <tr>
                <td>${this.escapeHtml(l.nombre)}</td>
                <td>${this.escapeHtml(l.direccion || '-')}</td>
                <td><span class="badge ${l.activo ? 'badge-success' : 'badge-danger'}">${l.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                  <button class="btn btn-secondary btn-sm edit-btn" data-id="${l.id}">Editar</button>
                  <button class="btn btn-danger btn-sm delete-btn" data-id="${l.id}">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      this.attachEvents();
    } catch (error) {
      displayApiError(error, this.container);
    }
  }

  attachEvents() {
    this.container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'), 10);
        const lugar = this.lugares.find(l => l.id === id);
        this.options.onEdit(lugar);
      });
    });

    this.container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = parseInt(e.target.getAttribute('data-id'), 10);
          if (confirm('¿Está seguro de que desea eliminar este lugar?')) {
            try {
              await makeRequest(`/lugares/${id}`, 'DELETE', null, true);
              showSuccess('Lugar eliminado correctamente', this.container);
              this.render();
            } catch (error) {
              alert('Error al eliminar: ' + (error.message || 'Error desconocido'));
            }
          }
        });
      });
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

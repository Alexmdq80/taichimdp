/**
 * ActividadList Component
 */

import { makeRequest } from '../api/client.js';
import { displayApiError, showSuccess } from '../utils/errors.js';

export class ActividadList {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onEdit: options.onEdit || (() => {}),
      onShowHistory: options.onShowHistory || (() => {})
    };
    this.actividades = [];
  }

  async render() {
    this.container.innerHTML = '<div class="spinner"></div>';
    
    try {
      const response = await makeRequest('/actividades', 'GET', null, true);
      this.actividades = response.data;
      
      if (this.actividades.length === 0) {
        this.container.innerHTML = '<p class="text-center text-muted">No hay actividades registradas.</p>';
        return;
      }

      this.container.innerHTML = `
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="actividades-table-body">
            ${this.actividades.map(a => `
              <tr>
                <td><strong>${this.escapeHtml(a.nombre)}</strong></td>
                <td>${this.escapeHtml(a.descripcion || '-')}</td>
                <td>
                    <span class="badge ${a.activo ? 'badge-success' : 'badge-danger'}">
                        ${a.activo ? 'Activa' : 'Inactiva'}
                    </span>
                </td>
                <td>
                  <button class="btn btn-secondary btn-sm edit-btn" data-id="${a.id}">Editar</button>
                  <button class="btn btn-info btn-sm history-btn" data-id="${a.id}">Historial</button>
                  <button class="btn btn-danger btn-sm delete-btn" data-id="${a.id}">Eliminar</button>
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
        const actividad = this.actividades.find(a => a.id === id);
        this.options.onEdit(actividad);
      });
    });

    this.container.querySelectorAll('.history-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'), 10);
        const actividad = this.actividades.find(a => a.id === id);
        if (this.options.onShowHistory) {
          this.options.onShowHistory(actividad);
        }
      });
    });

    this.container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = parseInt(e.target.getAttribute('data-id'), 10);
          if (confirm('¿Está seguro de que desea eliminar esta actividad?')) {
            try {
              await makeRequest(`/actividades/${id}`, 'DELETE', null, true);
              showSuccess('Actividad eliminada correctamente', this.container);
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

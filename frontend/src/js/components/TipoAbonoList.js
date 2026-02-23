/**
 * TipoAbonoList Component
 * List of tipos de abono
 */

import { displayApiError, showSuccess } from '../utils/errors.js';
import { makeRequest } from '../api/client.js';

export class TipoAbonoList {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onEdit: options.onEdit || (() => {}),
      onDelete: options.onDelete || (() => {}),
      onShowHistory: options.onShowHistory || (() => {})
    };
    this.tiposAbono = [];
  }

  render() {
    this.container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Tipos de Abono Registrados</h2>
        </div>
        
        <div id="tipos-abono-list">
          <div class="spinner"></div>
        </div>
      </div>
    `;

    this.attachEvents();
    this.loadTiposAbono();
  }

  attachEvents() {
    // No specific events for search/pagination for now
  }

  async loadTiposAbono() {
    const listContainer = this.container.querySelector('#tipos-abono-list');

    try {
      listContainer.innerHTML = '<div class="spinner"></div>';

      const result = await makeRequest('/tipos-abono', 'GET', null, true);
      this.tiposAbono = result.data || [];

      this.renderList();
    } catch (error) {
      displayApiError(error, listContainer);
    }
  }

  renderList() {
    const listContainer = this.container.querySelector('#tipos-abono-list');

    if (this.tiposAbono.length === 0) {
      listContainer.innerHTML = '<p class="text-center text-muted">No se encontraron tipos de abono</p>';
      return;
    }

    const listHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Duración (Días)</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${this.tiposAbono.map(tipoAbono => `
            <tr>
              <td>${this.escapeHtml(tipoAbono.nombre)}</td>
              <td>${tipoAbono.descripcion ? this.escapeHtml(tipoAbono.descripcion) : '-'}</td>
              <td>${tipoAbono.duracion_dias !== 0 ? tipoAbono.duracion_dias + ' días' : '<em>Clase</em>'}</td>
              <td>${tipoAbono.precio ? '$' + parseFloat(tipoAbono.precio).toFixed(2) : '-'}</td>
              <td>
                <button 
                  class="btn btn-secondary" 
                  data-action="edit" 
                  data-id="${tipoAbono.id}"
                  style="margin-right: 0.5rem;"
                >
                  Editar
                </button>
                <button 
                  class="btn btn-info" 
                  data-action="history" 
                  data-id="${tipoAbono.id}"
                  style="margin-right: 0.5rem;"
                >
                  Historial
                </button>
                <button 
                  class="btn btn-danger" 
                  data-action="delete" 
                  data-id="${tipoAbono.id}"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    listContainer.innerHTML = listHTML;

    // Attach event listeners
    listContainer.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.getAttribute('data-action');
        const id = parseInt(btn.getAttribute('data-id'), 10);
        this.handleAction(action, id);
      });
    });
  }

  handleAction(action, id) {
    const tipoAbono = this.tiposAbono.find(p => p.id === id);

    switch (action) {
      case 'edit':
        this.options.onEdit(tipoAbono);
        break;
      case 'history':
        this.options.onShowHistory(tipoAbono);
        break;
      case 'delete':
        if (confirm(`¿Está seguro de que desea eliminar el tipo de abono "${tipoAbono.nombre}"?`)) {
          this.deleteTipoAbono(id);
        }
        break;
    }
  }

  async deleteTipoAbono(id) {
    try {
      await makeRequest(`/tipos-abono/${id}`, 'DELETE', null, true);
      showSuccess('Tipo de abono eliminado correctamente', this.container);
      this.loadTiposAbono();
      if (this.options.onDelete) {
        this.options.onDelete(id);
      }
    } catch (error) {
      displayApiError(error, this.container);
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default TipoAbonoList;

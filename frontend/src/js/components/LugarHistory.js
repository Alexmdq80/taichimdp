/**
 * LugarHistory Component
 * Displays the modification history of a Lugar
 */

import { displayApiError } from '../utils/errors.js';
import { makeRequest } from '../api/client.js';

export class LugarHistory {
  constructor(container, options = {}) {
    this.container = container;
    this.lugar = options.lugar;
    this.onClose = options.onClose || (() => {});
    this.history = [];
  }

  render() {
    this.container.innerHTML = `
      <div class="card">
        <div class="card-header flex justify-between items-center">
          <h2 class="card-title">Historial: ${this.escapeHtml(this.lugar.nombre)}</h2>
          <button class="btn btn-secondary" id="close-history-btn">Cerrar</button>
        </div>
        
        <div id="history-content" class="p-4">
          <div class="spinner"></div>
        </div>
      </div>
    `;

    this.attachEvents();
    this.loadHistory();
  }

  attachEvents() {
    const closeBtn = this.container.querySelector('#close-history-btn');
    closeBtn.addEventListener('click', () => {
      this.onClose();
    });
  }

  async loadHistory() {
    const contentContainer = this.container.querySelector('#history-content');

    try {
      const result = await makeRequest(`/lugares/${this.lugar.id}/history`, 'GET', null, true);
      this.history = result.data || [];
      this.renderHistory();
    } catch (error) {
      displayApiError(error, contentContainer);
    }
  }

  renderHistory() {
    const contentContainer = this.container.querySelector('#history-content');

    if (this.history.length === 0) {
      contentContainer.innerHTML = '<p class="text-center text-muted">No hay historial para este lugar</p>';
      return;
    }

    const historyHTML = `
      <div class="history-timeline">
        ${this.history.map(item => `
          <div class="history-item mb-4 p-3 border-bottom">
            <div class="flex justify-between mb-2">
              <span class="badge ${this.getActionBadgeClass(item.accion)}">${this.getActionLabel(item.accion)}</span>
              <span class="text-sm text-muted">${new Date(item.fecha).toLocaleString()}</span>
            </div>
            <div class="text-sm">
              <strong>Usuario:</strong> ${item.usuario_email || 'Sistema'}
            </div>
            <div class="mt-2">
              ${this.renderChanges(item)}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    contentContainer.innerHTML = historyHTML;
  }

  getActionBadgeClass(action) {
    switch (action) {
      case 'CREATE': return 'badge-success';
      case 'UPDATE': return 'badge-info';
      case 'DELETE': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getActionLabel(action) {
    switch (action) {
      case 'CREATE': return 'Creación';
      case 'UPDATE': return 'Modificación';
      case 'DELETE': return 'Eliminación';
      default: return action;
    }
  }

  renderChanges(item) {
    if (item.accion === 'CREATE') {
      return '<p class="text-muted">Registro creado</p>';
    }
    if (item.accion === 'DELETE') {
      return '<p class="text-muted">Registro eliminado (Soft-delete)</p>';
    }

    const oldData = item.datos_anteriores || {};
    const newData = item.datos_nuevos || {};
    const changes = [];

    const fields = [
      { key: 'nombre', label: 'Nombre' },
      { key: 'direccion', label: 'Dirección' },
      { key: 'activo', label: 'Activo', type: 'boolean' },
      { key: 'cobra_cuota_social', label: 'Cobra Cuota Social', type: 'boolean' },
      { key: 'cuota_social_general', label: 'Cuota General' },
      { key: 'cuota_social_descuento', label: 'Cuota Descuento' },
      { key: 'costo_tarifa', label: 'Costo Tarifa' },
      { key: 'tipo_tarifa', label: 'Tipo Tarifa' },
      { key: 'parent_id', label: 'ID Padre' }
    ];

    fields.forEach(field => {
      const oldVal = oldData[field.key];
      const newVal = newData[field.key];

      if (oldVal != newVal) { // Using != to handle potential type differences from JSON
        changes.push(`
          <li>
            <strong>${field.label}:</strong> 
            <span class="text-danger strike-through">${this.formatValue(oldVal, field.type)}</span> &rarr; 
            <span class="text-success">${this.formatValue(newVal, field.type)}</span>
          </li>
        `);
      }
    });

    if (changes.length === 0) return '<p class="text-muted">Sin cambios detectados</p>';

    return `<ul class="list-unstyled">${changes.join('')}</ul>`;
  }

  formatValue(val, type) {
    if (val === null || val === undefined) return '<em>vacio</em>';
    if (type === 'boolean') return val ? 'Sí' : 'No';
    return this.escapeHtml(val.toString());
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default LugarHistory;

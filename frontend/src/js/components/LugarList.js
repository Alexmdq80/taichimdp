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
              <th>Cuota Social</th>
              <th>Tarifa (Costo)</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="lugares-table-body">
            ${this.lugares.map(l => `
              <tr class="${l.parent_id ? 'sub-lugar' : 'main-lugar'}">
                <td style="padding-left: ${l.parent_id ? '2rem' : '0.5rem'};">
                  ${l.parent_id ? '↳ ' : ''} 
                  <strong>${this.escapeHtml(l.nombre)}</strong>
                  ${l.parent_nombre ? `<br><small class="text-muted">(${l.parent_nombre})</small>` : ''}
                </td>
                <td>
                  ${this.escapeHtml(l.direccion_mostrada || '-')}
                  ${!l.direccion && l.parent_id && l.parent_direccion ? '<br><small class="text-muted">(Heredada)</small>' : ''}
                </td>
                <td>
                  ${l.cobra_cuota_social 
                    ? `<span class="badge badge-info">Sí</span> <br> 
                       <small>Gen: $${parseFloat(l.cuota_social_general).toFixed(2)}</small><br>
                       <small>Desc: $${parseFloat(l.cuota_social_descuento).toFixed(2)}</small>` 
                    : '<span class="badge badge-secondary">No</span>'}
                </td>
                <td>
                  ${l.parent_id 
                    ? `$${parseFloat(l.costo_tarifa).toFixed(2)} <small class="text-muted">/ ${l.tipo_tarifa === 'por_hora' ? 'hora' : 'mes'}</small>`
                    : '<span class="text-muted">-</span>'}
                </td>
                <td>
                    <span class="badge ${l.activo_efectivo ? 'badge-success' : 'badge-danger'}">
                        ${l.activo_efectivo ? 'Activo' : 'Inactivo'}
                    </span>
                    ${!l.activo_efectivo && l.activo && l.parent_id && !l.parent_activo ? '<br><small class="text-muted">(Inactiva por Sede)</small>' : ''}
                </td>
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

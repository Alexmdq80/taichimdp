/**
 * Pagos Page
 * Main page for viewing and managing global payment history
 */

import { makeRequest } from '../api/client.js';
import { formatDateReadable } from '../utils/formatting.js';
import { showSuccess, displayApiError } from '../utils/errors.js';
import { navigate } from '../router.js';

export class PagosPage {
  constructor(container) {
    this.container = container;
    this.pagos = [];
    this.searchQuery = '';
  }

  async render() {
    this.container.innerHTML = `
      <div id="pagos-page">
        <div class="flex justify-between items-center" style="margin-bottom: 2rem;">
          <h1>Historial Global de Pagos</h1>
        </div>

        <div class="card" style="margin-bottom: 2rem;">
          <div class="flex gap-2 items-center">
            <input 
              type="text" 
              id="pago-search" 
              placeholder="Buscar por practicante o tipo de abono..." 
              class="form-control" 
              style="max-width: 400px;"
              value="${this.searchQuery}"
            >
            <button id="search-btn" class="btn btn-secondary">Buscar</button>
          </div>
        </div>
        
        <div id="pagos-content">
          <div class="spinner"></div>
        </div>
      </div>
    `;

    this.attachEvents();
    await this.loadPagos();
  }

  attachEvents() {
    const searchBtn = this.container.querySelector('#search-btn');
    const searchInput = this.container.querySelector('#pago-search');

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.searchQuery = searchInput.value;
        this.loadPagos();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchQuery = searchInput.value;
          this.loadPagos();
        }
      });
    }
  }

  async loadPagos() {
    const content = this.container.querySelector('#pagos-content');
    if (!content) return;

    try {
      const query = this.searchQuery ? `?search=${encodeURIComponent(this.searchQuery)}` : '';
      const response = await makeRequest(`/pagos${query}`, 'GET', null, true);
      this.pagos = response.data;
      this.renderTable(content);
    } catch (error) {
      console.error('Error fetching payments:', error);
      displayApiError(error, content);
    }
  }

  renderTable(content) {
    if (!this.pagos || this.pagos.length === 0) {
      content.innerHTML = '<p class="text-muted">No se encontraron pagos.</p>';
      return;
    }

    content.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Practicante</th>
            <th>Tipo Abono</th>
            <th>Monto</th>
            <th>Fecha</th>
            <th>Método Pago</th>
            <th>Notas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${this.pagos.map(pago => `
            <tr>
              <td>
                <a href="#" class="view-practicante-link" data-id="${pago.practicante_id}">
                  ${this.escapeHtml(pago.practicante_nombre || 'Desconocido')}
                </a>
              </td>
              <td>${this.escapeHtml(pago.tipo_abono_nombre || 'Desconocido')}</td>
              <td>$${parseFloat(pago.monto).toFixed(2)}</td>
              <td>${formatDateReadable(pago.fecha)}</td>
              <td>${pago.metodo_pago || '-'}</td>
              <td title="${this.escapeHtml(pago.notas || '')}">
                ${this.truncateText(pago.notas || '-', 30)}
              </td>
              <td>
                <button class="btn btn-danger btn-sm delete-pago-btn" data-id="${pago.id}">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Attach row events
    content.querySelectorAll('.view-practicante-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = e.target.getAttribute('data-id');
        navigate(`/practicantes/${id}/pagar`); // Opens detail and payment modal (or just detail)
      });
    });

    content.querySelectorAll('.delete-pago-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        this.handleDelete(id);
      });
    });
  }

  async handleDelete(id) {
    if (!confirm('¿Está seguro de que desea eliminar este pago? Esto también cancelará el abono asociado.')) {
      return;
    }

    try {
      await makeRequest(`/pagos/${id}`, 'DELETE', null, true);
      showSuccess('Pago eliminado correctamente.', this.container);
      await this.loadPagos();
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Error al eliminar el pago: ' + (error.message || 'Error desconocido'));
    }
  }

  truncateText(text, length) {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default PagosPage;

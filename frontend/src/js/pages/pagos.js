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
    this.categoriaFilter = '';
  }

  async render() {
    this.container.innerHTML = `
      <div id="pagos-page">
        <div class="flex justify-between items-center" style="margin-bottom: 2rem;">
          <h1>Historial Global de Pagos</h1>
        </div>

        <div id="pagos-summary" class="grid grid-3" style="margin-bottom: 2rem;">
            <!-- Totals will be here -->
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
            <select id="categoria-filter" class="form-control" style="max-width: 200px;">
                <option value="">Todas las categorías</option>
                <option value="clase" ${this.categoriaFilter === 'clase' ? 'selected' : ''}>Tai Chi</option>
                <option value="cuota_club" ${this.categoriaFilter === 'cuota_club' ? 'selected' : ''}>Club</option>
                <option value="otro" ${this.categoriaFilter === 'otro' ? 'selected' : ''}>Otro</option>
            </select>
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
    const categoriaFilter = this.container.querySelector('#categoria-filter');

    const triggerSearch = () => {
        this.searchQuery = searchInput.value;
        this.categoriaFilter = categoriaFilter.value;
        this.loadPagos();
    };

    if (searchBtn) {
      searchBtn.addEventListener('click', triggerSearch);
    }

    if (categoriaFilter) {
        categoriaFilter.addEventListener('change', triggerSearch);
    }

    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            triggerSearch();
        }
      });
    }
  }

  async loadPagos() {
    const content = this.container.querySelector('#pagos-content');
    if (!content) return;

    try {
      const params = new URLSearchParams();
      if (this.searchQuery) params.append('search', this.searchQuery);
      if (this.categoriaFilter) params.append('categoria', this.categoriaFilter);
      
      const response = await makeRequest(`/pagos?${params.toString()}`, 'GET', null, true);
      this.pagos = response.data;
      this.renderSummary();
      this.renderTable(content);
    } catch (error) {
      console.error('Error fetching payments:', error);
      displayApiError(error, content);
    }
  }

  renderSummary() {
      const summaryContainer = this.container.querySelector('#pagos-summary');
      if (!summaryContainer) return;

      const totalTaiChi = this.pagos
        .filter(p => p.categoria === 'clase')
        .reduce((sum, p) => sum + parseFloat(p.monto), 0);
      
      const totalClub = this.pagos
        .filter(p => p.categoria === 'cuota_club')
        .reduce((sum, p) => sum + parseFloat(p.monto), 0);
      
      const totalGral = this.pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0);

      summaryContainer.innerHTML = `
        <div class="card" style="border-left: 5px solid var(--primary-color);">
            <p class="text-muted">Recaudado Tai Chi</p>
            <h2 style="margin: 0;">$${totalTaiChi.toFixed(2)}</h2>
        </div>
        <div class="card" style="border-left: 5px solid #17a2b8;">
            <p class="text-muted">Recaudado Club</p>
            <h2 style="margin: 0;">$${totalClub.toFixed(2)}</h2>
        </div>
        <div class="card" style="background: #f8f9fa;">
            <p class="text-muted">Total General</p>
            <h2 style="margin: 0;">$${totalGral.toFixed(2)}</h2>
        </div>
      `;
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
            <th>Categoría</th>
            <th>Tipo Abono</th>
            <th>Monto</th>
            <th>Fecha Pago</th>
            <th>Vencimiento</th>
            <th>Lugar</th>
            <th>Método</th>
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
              <td><span class="badge ${pago.categoria === 'cuota_club' ? 'badge-info' : ''}">${this.formatCategoria(pago.categoria)}</span></td>
              <td>${this.escapeHtml(pago.tipo_abono_nombre || 'Desconocido')}${pago.mes_abono ? ' (' + pago.mes_abono + ')' : ''}</td>
              <td>$${parseFloat(pago.monto).toFixed(2)}</td>
              <td>${formatDateReadable(pago.fecha)}</td>
              <td>${pago.fecha_vencimiento ? formatDateReadable(pago.fecha_vencimiento) : '-'}</td>
              <td>${this.escapeHtml(pago.lugar_nombre || '-')}</td>
              <td>${pago.metodo_pago || '-'}</td>
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

  handleDelete(id) {
    if (!confirm('¿Está seguro de que desea eliminar este pago? Esto también cancelará el abono asociado.')) {
      return;
    }

    try {
      makeRequest(`/pagos/${id}`, 'DELETE', null, true).then(() => {
          showSuccess('Pago eliminado correctamente.', this.container);
          this.loadPagos();
      });
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Error al eliminar el pago: ' + (error.message || 'Error desconocido'));
    }
  }

  formatCategoria(categoria) {
    const map = {
      'clase': 'Tai Chi',
      'cuota_club': 'Club',
      'otro': 'Otro'
    };
    return map[categoria] || categoria;
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

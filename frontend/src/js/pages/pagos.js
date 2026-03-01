/**
 * Pagos Page
 * Main page for viewing and managing global payment history
 */

import { makeRequest } from '../api/client.js';
import { formatDateReadable, formatTime } from '../utils/formatting.js';
import { showSuccess, displayApiError } from '../utils/errors.js';
import { navigate } from '../router.js';

export class PagosPage {
  constructor(container) {
    this.container = container;
    this.pagos = [];
    this.horarios = [];
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
                <option value="grupal" ${this.categoriaFilter === 'grupal' ? 'selected' : ''}>Grupal</option>
                <option value="particular" ${this.categoriaFilter === 'particular' ? 'selected' : ''}>Particular</option>
                <option value="compartida" ${this.categoriaFilter === 'compartida' ? 'selected' : ''}>Compartida</option>
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
      
      const [pagoRes, horariosRes] = await Promise.all([
        makeRequest(`/pagos?${params.toString()}`, 'GET', null, true),
        makeRequest('/horarios', 'GET', null, true)
      ]);

      this.pagos = pagoRes.data;
      this.horarios = horariosRes.data || [];

      this.renderSummary();
      this.renderTable(content);
    } catch (error) {
      console.error('Error fetching data:', error);
      displayApiError(error, content);
    }
  }

  renderSummary() {
      const summaryContainer = this.container.querySelector('#pagos-summary');
      if (!summaryContainer) return;

      const totalTaiChi = this.pagos
        .filter(p => ['grupal', 'particular', 'compartida'].includes(p.categoria))
        .reduce((sum, p) => sum + parseFloat(p.monto), 0);
      
      const totalGral = this.pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0);

      summaryContainer.innerHTML = `
        <div class="card" style="border-left: 5px solid var(--primary-color);">
            <p class="text-muted">Recaudado Clases</p>
            <h2 style="margin: 0;">$${totalTaiChi.toFixed(2)}</h2>
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
            <th>Tipo</th>
            <th>Abono / Mes</th>
            <th>Lugar / Horario</th>
            <th>Monto</th>
            <th>Fecha Pago</th>
            <th>Vencimiento</th>
            <th>Método</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${this.pagos.map(pago => {
            const isVencimientoReal = pago.fecha_vencimiento && !pago.fecha_vencimiento.startsWith('2099');
            
            return `
            <tr>
              <td>
                <a href="#" class="view-practicante-link" data-id="${pago.practicante_id}">
                  ${this.escapeHtml(pago.practicante_nombre || 'Desconocido')}
                </a>
              </td>
              <td><span class="badge ${this.getBadgeClass(pago.categoria)}">${this.formatCategoria(pago.categoria)}</span></td>
              <td>
                <strong>${this.escapeHtml(pago.tipo_abono_nombre || 'Desconocido')}</strong>
                ${pago.mes_abono ? `<br><small class="text-muted">Mes: ${pago.mes_abono}</small>` : ''}
              </td>
              <td>
                ${this.renderLugarHorario(pago)}
              </td>
              <td>$${parseFloat(pago.monto).toFixed(2)}</td>
              <td>${formatDateReadable(pago.fecha)}</td>
              <td>${isVencimientoReal ? formatDateReadable(pago.fecha_vencimiento) : '<em class="text-muted">Flexible</em>'}</td>
              <td>${pago.metodo_pago || '-'}</td>
              <td>
                <button class="btn btn-danger btn-sm delete-pago-btn" data-id="${pago.id}">Eliminar</button>
              </td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
    `;

    // Attach row events
    content.querySelectorAll('.view-practicante-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = e.target.getAttribute('data-id');
        navigate(`/practicantes/${id}/pagar`);
      });
    });

    content.querySelectorAll('.delete-pago-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        this.handleDelete(id);
      });
    });
  }

  renderLugarHorario(pago) {
    if (pago.categoria === 'grupal' && pago.horarios_ids && pago.horarios_ids.length > 0) {
        const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const scheduleTexts = pago.horarios_ids.map(id => {
            const h = this.horarios.find(h => h.id === id);
            return h ? `${dias[h.dia_semana]} ${formatTime(h.hora_inicio)}` : null;
        }).filter(Boolean);

        return `
            <div style="line-height: 1.2;">
                <small>${this.escapeHtml(pago.lugar_nombre || '-')}</small><br>
                <small class="text-muted">${scheduleTexts.join(', ')}</small>
            </div>
        `;
    }
    return `<span>${this.escapeHtml(pago.lugar_nombre || '-')}</span>`;
  }

  getBadgeClass(cat) {
    const map = {
        'grupal': 'badge-primary',
        'particular': 'badge-info',
        'compartida': 'badge-warning',
        'otro': 'badge-secondary'
    };
    return map[cat] || 'badge-secondary';
  }

  handleDelete(id) {
    if (!confirm('¿Está seguro de que desea eliminar este pago? Esto también cancelará el abono asociado.')) {
      return;
    }

    makeRequest(`/pagos/${id}`, 'DELETE', null, true).then(() => {
        showSuccess('Pago eliminado correctamente.', this.container);
        this.loadPagos();
    }).catch(error => {
        console.error('Error deleting payment:', error);
        alert('Error al eliminar el pago: ' + (error.message || 'Error desconocido'));
    });
  }

  formatCategoria(categoria) {
    const map = {
      'grupal': 'Grupal',
      'particular': 'Particular',
      'compartida': 'Compartida',
      'otro': 'Otro'
    };
    return map[categoria] || categoria;
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default PagosPage;

/**
 * PracticanteList Component
 * List of practicantes with search functionality
 */

import { formatDateReadable } from '../utils/formatting.js';
import { displayApiError, showSuccess } from '../utils/errors.js';
import { practicanteApi } from '../api/client.js';
import { navigate } from '../router.js'; // Import navigate

export class PracticanteList {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onSelect: options.onSelect || (() => {}),
      onEdit: options.onEdit || (() => {}),
      onDelete: options.onDelete || (() => {}),
      onShowHistory: options.onShowHistory || (() => {}),
    };
    this.practicantes = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.searchTerm = '';
  }

  render() {
    this.container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Practicantes</h2>
          <div class="flex gap-2" style="margin-top: 1rem;">
            <input 
              type="text" 
              id="search-input" 
              placeholder="Buscar por nombre, teléfono o email..."
              style="flex: 1; padding: 0.5rem;"
              value="${this.searchTerm}"
            />
            <button id="search-btn" class="btn">Buscar</button>
            <button id="clear-search-btn" class="btn btn-secondary">Limpiar</button>
          </div>
        </div>
        
        <div id="practicantes-list">
          <div class="spinner"></div>
        </div>

        <div id="pagination" style="margin-top: 1rem; text-align: center;"></div>
      </div>
    `;

    this.attachEvents();
    this.loadPracticantes();
  }

  attachEvents() {
    const searchInput = this.container.querySelector('#search-input');
    const searchBtn = this.container.querySelector('#search-btn');
    const clearBtn = this.container.querySelector('#clear-search-btn');

    // Search on button click
    searchBtn.addEventListener('click', () => {
      this.searchTerm = searchInput.value.trim();
      this.currentPage = 1;
      this.loadPracticantes();
    });

    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.searchTerm = searchInput.value.trim();
        this.currentPage = 1;
        this.loadPracticantes();
      }
    });

    // Clear search
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      this.searchTerm = '';
      this.currentPage = 1;
      this.loadPracticantes();
    });
  }

  async loadPracticantes() {
    const listContainer = this.container.querySelector('#practicantes-list');
    const paginationContainer = this.container.querySelector('#pagination');

    try {
      listContainer.innerHTML = '<div class="spinner"></div>';

      const params = {
        page: this.currentPage,
        limit: 20
      };

      if (this.searchTerm) {
        params.search = this.searchTerm;
      }

      const result = await practicanteApi.getAll(params.search, params.page, params.limit); // Use practicanteApi.getAll
      this.practicantes = result.data || [];
      this.totalPages = result.pagination?.totalPages || 1;
      this.currentPage = result.pagination?.page || 1;

      this.renderList();
      this.renderPagination();
    } catch (error) {
      displayApiError(error, listContainer);
    }
  }

  renderList() {
    const listContainer = this.container.querySelector('#practicantes-list');

    if (this.practicantes.length === 0) {
      listContainer.innerHTML = '<p class="text-center text-muted">No se encontraron practicantes</p>';
      return;
    }

    const listHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Fecha de Nacimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${this.practicantes.map(practicante => `
            <tr>
              <td>${this.escapeHtml(practicante.nombre_completo)}</td>
              <td>${practicante.telefono ? this.escapeHtml(practicante.telefono) : '-'}</td>
              <td>${practicante.email ? this.escapeHtml(practicante.email) : '-'}</td>
              <td>${practicante.fecha_nacimiento ? formatDateReadable(practicante.fecha_nacimiento) : '-'}</td>
              <td>
                <button 
                  class="btn btn-primary" 
                  data-action="pay" 
                  data-id="${practicante.id}"
                  style="margin-right: 0.5rem;"
                >
                  Pagar Abono
                </button>
                <button 
                  class="btn" 
                  data-action="view" 
                  data-id="${practicante.id}"
                  style="margin-right: 0.5rem;"
                >
                  Ver
                </button>
                <button 
                  class="btn btn-info" 
                  data-action="history" 
                  data-id="${practicante.id}"
                  style="margin-right: 0.5rem;"
                >
                  Historial
                </button>
                <button 
                  class="btn btn-secondary" 
                  data-action="edit" 
                  data-id="${practicante.id}"
                  style="margin-right: 0.5rem;"
                >
                  Editar
                </button>
                <button 
                  class="btn btn-danger" 
                  data-action="delete" 
                  data-id="${practicante.id}"
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

  renderPagination() {
    const paginationContainer = this.container.querySelector('#pagination');

    if (this.totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }

    paginationContainer.innerHTML = `
      <div class="flex gap-2" style="justify-content: center; align-items: center;">
        <button 
          class="btn btn-secondary" 
          ${this.currentPage === 1 ? 'disabled' : ''}
          data-page="${this.currentPage - 1}"
        >
          Anterior
        </button>
        ${pages.map(page => `
          <button 
            class="btn ${page === this.currentPage ? '' : 'btn-secondary'}"
            data-page="${page}"
          >
            ${page}
          </button>
        `).join('')}
        <button 
          class="btn btn-secondary" 
          ${this.currentPage === this.totalPages ? 'disabled' : ''}
          data-page="${this.currentPage + 1}"
        >
          Siguiente
        </button>
      </div>
    `;

    paginationContainer.querySelectorAll('button[data-page]').forEach(btn => {
      if (!btn.disabled) {
        btn.addEventListener('click', (e) => {
          this.currentPage = parseInt(btn.getAttribute('data-page'), 10);
          this.loadPracticantes();
        });
      }
    });
  }

  handleAction(action, id) {
    const practicante = this.practicantes.find(p => p.id === id);

    switch (action) {
      case 'view':
        this.options.onSelect(practicante);
        break;
      case 'edit':
        this.options.onEdit(practicante);
        break;
      case 'history':
        this.options.onShowHistory(practicante);
        break;
      case 'delete':
        if (confirm(`¿Está seguro de que desea eliminar a ${practicante.nombre_completo}?`)) {
          this.deletePracticante(id);
        }
        break;
      case 'pay': // Handle the new 'pay' action
        navigate(`/practicantes/${practicante.id}/pagar`); // Navigate to the payment URL
        break;
    }
  }

  async deletePracticante(id) {
    try {
      await practicanteApi.delete(id); // Use practicanteApi.delete
      showSuccess('Practicante eliminado correctamente', this.container);
      this.loadPracticantes();
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

export default PracticanteList;

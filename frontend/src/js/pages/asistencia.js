import { apiClient } from '../api/client.js';
import { displayApiError, showSuccess } from '../utils/errors.js';
import { ClaseList } from '../components/ClaseList.js';
import { AsistenciaMarker } from '../components/AsistenciaMarker.js';
import { ClaseForm } from '../components/ClaseForm.js';

export class AsistenciaPage {
  constructor(container) {
    this.container = container;
    this.currentView = 'list'; // 'list', 'attendance', 'form'
    this.selectedClase = null;
    
    const today = new Date();
    this.selectedMonth = today.getMonth(); // 0-11
    this.selectedYear = today.getFullYear();
    this.selectedTipo = ''; // All types by default
    
    this.filters = {};
    this.updateFiltersFromMonthYear();
  }

  updateFiltersFromMonthYear() {
    const firstDay = new Date(this.selectedYear, this.selectedMonth, 1);
    const lastDay = new Date(this.selectedYear, this.selectedMonth + 1, 0);
    
    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    this.filters.fecha_inicio = formatDate(firstDay);
    this.filters.fecha_fin = formatDate(lastDay);
    this.filters.tipo = this.selectedTipo;
  }

  async render() {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    this.container.innerHTML = `
      <div class="page-header">
        <h1>Control de Asistencia</h1>
        <div class="actions">
          <button id="new-manual-clase-btn" class="btn btn-primary">Nueva Clase Manual</button>
          <button id="generate-clases-btn" class="btn btn-secondary">Generar Clases del Mes</button>
          <button id="refresh-btn" class="btn btn-outline-primary">Actualizar</button>
        </div>
      </div>
      
      <div class="filters-bar mb-4 p-3 bg-light border rounded">
        <div class="form-row align-items-end">
          <div class="form-group col-md-3">
            <label for="filter-month">Mes</label>
            <select class="form-control" id="filter-month">
                ${months.map((m, i) => `<option value="${i}" ${this.selectedMonth === i ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </div>
          <div class="form-group col-md-2">
            <label for="filter-year">Año</label>
            <input type="number" class="form-control" id="filter-year" value="${this.selectedYear}">
          </div>
          <div class="form-group col-md-4">
            <label for="filter-tipo">Tipo de Clase</label>
            <select class="form-control" id="filter-tipo">
                <option value="" ${this.selectedTipo === '' ? 'selected' : ''}>Todos los tipos</option>
                <option value="grupal" ${this.selectedTipo === 'grupal' ? 'selected' : ''}>Grupal (Fijo)</option>
                <option value="flexible" ${this.selectedTipo === 'flexible' ? 'selected' : ''}>Particular/Compartida (Flexible)</option>
            </select>
          </div>
          <div class="form-group col-md-3">
            <button id="filter-btn" class="btn btn-primary btn-block">Aplicar Filtro</button>
          </div>
        </div>
      </div>
      
      <div id="asistencia-content">
        <!-- Content will be rendered here -->
      </div>
    `;

    await this.renderView();
  }

  async renderView() {
    const content = this.container.querySelector('#asistencia-content');
    const filtersBar = this.container.querySelector('.filters-bar');
    const headerActions = this.container.querySelector('.page-header .actions');
    
    // Toggle visibility based on view
    if (this.currentView === 'list') {
      filtersBar.style.display = 'block';
      headerActions.style.display = 'flex';
    } else {
      filtersBar.style.display = 'none';
      headerActions.style.display = 'none';
    }
    
    if (this.currentView === 'list') {
      content.innerHTML = '<div class="loader text-center p-5">Cargando sesiones de clase...</div>';
      try {
        const response = await apiClient.get('/asistencia/clases', this.filters);
        
        const list = new ClaseList(content, {
          onSelect: (clase) => {
            this.selectedClase = clase;
            this.currentView = 'attendance';
            this.renderView();
          },
          onDelete: async (id) => {
            try {
              await apiClient.delete(`/asistencia/clases/${id}`);
              showSuccess('Sesión de clase eliminada');
              this.renderView();
            } catch (error) {
              displayApiError(error);
            }
          },
          onCloseClase: async (id) => {
            try {
              await apiClient.put(`/asistencia/clases/${id}`, { estado: 'cerrada' });
              showSuccess('Clase cerrada correctamente');
              this.renderView();
            } catch (error) {
              displayApiError(error);
            }
          }
        });
        list.setClases(response.data);
        list.render();
      } catch (error) {
        displayApiError(error);
      }
    } else if (this.currentView === 'attendance') {
      const marker = new AsistenciaMarker(content, {
        clase: this.selectedClase,
        onClose: () => {
          this.currentView = 'list';
          this.renderView();
        }
      });
      marker.render();
    } else if (this.currentView === 'form') {
      const form = new ClaseForm(content, {
        clase: this.selectedClase,
        onSuccess: () => {
          this.currentView = 'list';
          this.selectedClase = null;
          this.renderView();
        },
        onCancel: () => {
          this.currentView = 'list';
          this.selectedClase = null;
          this.renderView();
        }
      });
      await form.render();
    }

    this.attachEvents();
  }

  attachEvents() {
    const newBtn = this.container.querySelector('#new-manual-clase-btn');
    if (newBtn) {
        newBtn.onclick = () => {
            this.selectedClase = null;
            this.currentView = 'form';
            this.renderView();
        };
    }

    const filterBtn = this.container.querySelector('#filter-btn');
    if (filterBtn) {
        filterBtn.onclick = () => {
            this.selectedMonth = parseInt(this.container.querySelector('#filter-month').value, 10);
            this.selectedYear = parseInt(this.container.querySelector('#filter-year').value, 10);
            this.selectedTipo = this.container.querySelector('#filter-tipo').value;
            this.updateFiltersFromMonthYear();
            this.renderView();
        };
    }

    const refreshBtn = this.container.querySelector('#refresh-btn');
    if (refreshBtn) {
        refreshBtn.onclick = () => this.renderView();
    }

    const genBtn = this.container.querySelector('#generate-clases-btn');
    if (genBtn) {
        genBtn.onclick = async () => {
            const monthNames = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            const label = `${monthNames[this.selectedMonth]} ${this.selectedYear}`;
            
            if (confirm(`Se generarán todas las sesiones de clase para ${label} basadas en la configuración de horarios. ¿Desea continuar?`)) {
                try {
                    const payload = {
                        startDate: this.filters.fecha_inicio,
                        endDate: this.filters.fecha_fin
                    };
                    
                    const response = await apiClient.post('/asistencia/clases/generar', payload);
                    showSuccess(response.message || 'Clases generadas con éxito');
                    this.renderView();
                } catch (error) {
                    displayApiError(error);
                }
            }
        };
    }
  }
}

export default AsistenciaPage;

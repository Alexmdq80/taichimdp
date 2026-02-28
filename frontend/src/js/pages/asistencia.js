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
    
    // Rango por defecto: hoy +/- 7 días
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    this.filters = {
      fecha_inicio: today.toISOString().split('T')[0],
      fecha_fin: nextWeek.toISOString().split('T')[0]
    };
  }

  async render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Control de Asistencia</h1>
        <div class="actions">
          <button id="new-manual-clase-btn" class="btn btn-primary">Nueva Clase Manual</button>
          <button id="generate-clases-btn" class="btn btn-secondary">Generar Clases de la Semana</button>
          <button id="refresh-btn" class="btn btn-outline-primary">Actualizar</button>
        </div>
      </div>
      
      <div class="filters-bar mb-4 p-3 bg-light border rounded">
        <div class="form-row align-items-end">
          <div class="form-group col-md-4">
            <label for="fecha_inicio">Desde</label>
            <input type="date" class="form-control" id="fecha_inicio" value="${this.filters.fecha_inicio}">
          </div>
          <div class="form-group col-md-4">
            <label for="fecha_fin">Hasta</label>
            <input type="date" class="form-control" id="fecha_fin" value="${this.filters.fecha_fin}">
          </div>
          <div class="form-group col-md-4">
            <button id="filter-btn" class="btn btn-primary btn-block">Filtrar</button>
          </div>
        </div>
      </div>
      
      <div id="asistencia-content">
        <!-- Content will be rendered here -->
      </div>
    `;

    this.attachEvents();
    await this.renderView();
  }

  async renderView() {
    const content = this.container.querySelector('#asistencia-content');
    
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
  }

  attachEvents() {
    this.container.querySelector('#new-manual-clase-btn').addEventListener('click', () => {
      this.selectedClase = null;
      this.currentView = 'form';
      this.renderView();
    });

    this.container.querySelector('#filter-btn').addEventListener('click', () => {
      this.filters.fecha_inicio = this.container.querySelector('#fecha_inicio').value;
      this.filters.fecha_fin = this.container.querySelector('#fecha_fin').value;
      this.renderView();
    });

    this.container.querySelector('#refresh-btn').addEventListener('click', () => {
      this.renderView();
    });

    this.container.querySelector('#generate-clases-btn').addEventListener('click', async () => {
      if (confirm('Se generarán las sesiones de clase para los próximos 7 días basadas en la configuración de horarios. ¿Desea continuar?')) {
        try {
          const today = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);
          
          const payload = {
            startDate: today.toISOString().split('T')[0],
            endDate: nextWeek.toISOString().split('T')[0]
          };
          
          const response = await apiClient.post('/asistencia/clases/generar', payload);
          showSuccess(response.message || 'Clases generadas con éxito');
          this.renderView();
        } catch (error) {
          displayApiError(error);
        }
      }
    });
  }
}

export default AsistenciaPage;

import { apiClient } from '../api/client.js';
import { displayApiError, showSuccess } from '../utils/errors.js';
import { HorarioList } from '../components/HorarioList.js';
import { HorarioForm } from '../components/HorarioForm.js';
// We might need a HorarioHistory component too, similar to others
// For now let's focus on the main CRUD

export class HorariosPage {
  constructor(container) {
    this.container = container;
    this.currentView = 'list'; // 'list', 'form'
    this.selectedHorario = null;
    this.filters = {
      actividad_id: '',
      lugar_id: '',
      dia_semana: ''
    };
  }

  async render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Gestión de Horarios Semanales</h1>
        <div class="actions">
          <button id="new-horario-btn" class="btn btn-primary">Nuevo Horario</button>
        </div>
      </div>
      
      <div id="horarios-content">
        <!-- Content will be rendered here -->
      </div>
    `;

    this.attachEvents();
    await this.renderView();
  }

  async renderView() {
    const content = this.container.querySelector('#horarios-content');
    
    if (this.currentView === 'list') {
      content.innerHTML = '<div class="loader">Cargando horarios...</div>';
      try {
        const response = await apiClient.get('/horarios', this.filters);
        const list = new HorarioList(content, {
          onEdit: (horario) => {
            this.selectedHorario = horario;
            this.currentView = 'form';
            this.renderView();
          },
          onDelete: async (id) => {
            try {
              await apiClient.delete(`/horarios/${id}`);
              showSuccess('Horario eliminado');
              this.renderView();
            } catch (error) {
              displayApiError(error);
            }
          },
          onShowHistory: (horario) => {
            // Placeholder for history view
            alert('Historial de: ' + horario.actividad_nombre);
          }
        });
        list.setHorarios(response.data);
        list.render();
      } catch (error) {
        displayApiError(error);
      }
    } else if (this.currentView === 'form') {
      const form = new HorarioForm(content, {
        horario: this.selectedHorario,
        onSuccess: () => {
          this.currentView = 'list';
          this.selectedHorario = null;
          this.renderView();
        },
        onCancel: () => {
          this.currentView = 'list';
          this.selectedHorario = null;
          this.renderView();
        }
      });
      await form.render();
    }
  }

  attachEvents() {
    this.container.querySelector('#new-horario-btn').addEventListener('click', () => {
      this.selectedHorario = null;
      this.currentView = 'form';
      this.renderView();
    });
  }
}

export default HorariosPage;

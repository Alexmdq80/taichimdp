import { apiClient } from '../api/client.js';
import { displayApiError, showSuccess } from '../utils/errors.js';

export class ClaseForm {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      clase: options.clase || null,
      onSuccess: options.onSuccess || (() => {}),
      onCancel: options.onCancel || (() => {})
    };
    this.actividades = [];
    this.lugares = [];
  }

  async loadInitialData() {
    try {
      const [actividadesRes, lugaresRes] = await Promise.all([
        apiClient.get('/actividades'),
        apiClient.get('/lugares')
      ]);
      this.actividades = actividadesRes.data;
      this.lugares = lugaresRes.data;
    } catch (error) {
      displayApiError(error);
    }
  }

  async render() {
    await this.loadInitialData();
    const isEdit = !!this.options.clase;
    const today = new Date().toISOString().split('T')[0];
    
    const c = this.options.clase || {
      actividad_id: '',
      lugar_id: '',
      fecha: today,
      hora: '18:00',
      hora_fin: '19:00',
      descripcion: ''
    };

    this.container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>${isEdit ? 'Editar Sesión de Clase' : 'Nueva Sesión de Clase (Manual)'}</h3>
        </div>
        <div class="card-body">
          <form id="clase-form">
            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="actividad_id">Actividad</label>
                <select class="form-control" id="actividad_id" required>
                  <option value="">Seleccione una actividad</option>
                  ${this.actividades.map(a => `<option value="${a.id}" ${c.actividad_id == a.id ? 'selected' : ''}>${a.nombre}</option>`).join('')}
                </select>
              </div>
              <div class="form-group col-md-6">
                <label for="lugar_id">Lugar / Sede</label>
                <select class="form-control" id="lugar_id" required>
                  <option value="">Seleccione un lugar</option>
                  ${this.lugares.map(l => `<option value="${l.id}" ${c.lugar_id == l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-4">
                <label for="fecha">Fecha</label>
                <input type="date" class="form-control" id="fecha" value="${c.fecha}" required>
              </div>
              <div class="form-group col-md-4">
                <label for="hora">Hora Inicio</label>
                <input type="time" class="form-control" id="hora" value="${c.hora.substring(0, 5)}" required>
              </div>
              <div class="form-group col-md-4">
                <label for="hora_fin">Hora Fin</label>
                <input type="time" class="form-control" id="hora_fin" value="${c.hora_fin.substring(0, 5)}" required>
              </div>
            </div>

            <div class="form-group">
              <label for="descripcion">Descripción / Notas</label>
              <textarea class="form-control" id="descripcion" rows="2" placeholder="Opcional">${c.descripcion || ''}</textarea>
            </div>

            <div class="form-actions mt-4">
              <button type="submit" class="btn btn-primary">Guardar Clase</button>
              <button type="button" class="btn btn-secondary" id="cancel-clase-btn">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const form = this.container.querySelector('#clase-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        actividad_id: parseInt(this.container.querySelector('#actividad_id').value, 10),
        lugar_id: parseInt(this.container.querySelector('#lugar_id').value, 10),
        fecha: this.container.querySelector('#fecha').value,
        hora: this.container.querySelector('#hora').value,
        hora_fin: this.container.querySelector('#hora_fin').value,
        descripcion: this.container.querySelector('#descripcion').value
      };

      try {
        if (this.options.clase) {
          // No implementamos PUT /clases aún en backend, pero podríamos
          alert('Edición no implementada aún en backend');
        } else {
          await apiClient.post('/asistencia/clases', formData);
          showSuccess('Clase creada con éxito');
        }
        this.options.onSuccess();
      } catch (error) {
        displayApiError(error);
      }
    });

    this.container.querySelector('#cancel-clase-btn').addEventListener('click', () => {
      this.options.onCancel();
    });
  }
}

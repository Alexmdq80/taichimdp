import { apiClient } from '../api/client.js';
import { displayApiError, showSuccess } from '../utils/errors.js';

export class HorarioForm {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      horario: options.horario || null,
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
    const isEdit = !!this.options.horario;
    const h = this.options.horario || {
      actividad_id: '',
      lugar_id: '',
      dia_semana: 1, // Lunes por defecto
      hora_inicio: '18:00',
      hora_fin: '19:00',
      activo: true
    };

    this.container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>${isEdit ? 'Editar Horario' : 'Nuevo Horario Semanal'}</h3>
        </div>
        <div class="card-body">
          <form id="horario-form">
            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="actividad_id">Actividad</label>
                <select class="form-control" id="actividad_id" required>
                  <option value="">Seleccione una actividad</option>
                  ${this.actividades.map(a => `<option value="${a.id}" ${h.actividad_id == a.id ? 'selected' : ''}>${a.nombre}</option>`).join('')}
                </select>
              </div>
              <div class="form-group col-md-6">
                <label for="lugar_id">Lugar / Sede</label>
                <select class="form-control" id="lugar_id" required>
                  <option value="">Seleccione un lugar</option>
                  ${this.lugares.map(l => `<option value="${l.id}" ${h.lugar_id == l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-4">
                <label for="dia_semana">Día de la Semana</label>
                <select class="form-control" id="dia_semana" required>
                  <option value="1" ${h.dia_semana == 1 ? 'selected' : ''}>Lunes</option>
                  <option value="2" ${h.dia_semana == 2 ? 'selected' : ''}>Martes</option>
                  <option value="3" ${h.dia_semana == 3 ? 'selected' : ''}>Miércoles</option>
                  <option value="4" ${h.dia_semana == 4 ? 'selected' : ''}>Jueves</option>
                  <option value="5" ${h.dia_semana == 5 ? 'selected' : ''}>Viernes</option>
                  <option value="6" ${h.dia_semana == 6 ? 'selected' : ''}>Sábado</option>
                  <option value="0" ${h.dia_semana == 0 ? 'selected' : ''}>Domingo</option>
                </select>
              </div>
              <div class="form-group col-md-4">
                <label for="hora_inicio">Hora Inicio</label>
                <input type="time" class="form-control" id="hora_inicio" value="${h.hora_inicio.substring(0, 5)}" required>
              </div>
              <div class="form-group col-md-4">
                <label for="hora_fin">Hora Fin</label>
                <input type="time" class="form-control" id="hora_fin" value="${h.hora_fin.substring(0, 5)}" required>
              </div>
            </div>

            <div class="form-group">
              <label class="flex items-center gap-2 cursor-pointer" style="display: flex; align-items: center; gap: 0.5rem; width: fit-content; cursor: pointer;">
                <input type="checkbox" id="activo" ${h.activo ? 'checked' : ''} style="width: auto; margin: 0;">
                <span>Horario Activo</span>
              </label>
            </div>

            <div class="form-actions mt-4">
              <button type="submit" class="btn btn-primary">Guardar</button>
              <button type="button" class="btn btn-secondary" id="cancel-btn">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const form = this.container.querySelector('#horario-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        actividad_id: parseInt(this.container.querySelector('#actividad_id').value, 10),
        lugar_id: parseInt(this.container.querySelector('#lugar_id').value, 10),
        dia_semana: parseInt(this.container.querySelector('#dia_semana').value, 10),
        hora_inicio: this.container.querySelector('#hora_inicio').value,
        hora_fin: this.container.querySelector('#hora_fin').value,
        activo: this.container.querySelector('#activo').checked
      };

      try {
        if (this.options.horario) {
          await apiClient.put(`/horarios/${this.options.horario.id}`, formData);
          showSuccess('Horario actualizado con éxito');
        } else {
          await apiClient.post('/horarios', formData);
          showSuccess('Horario creado con éxito');
        }
        this.options.onSuccess();
      } catch (error) {
        displayApiError(error);
      }
    });

    this.container.querySelector('#cancel-btn').addEventListener('click', () => {
      this.options.onCancel();
    });
  }
}

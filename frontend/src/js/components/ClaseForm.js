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
    this.practicantes = [];
    this.profesores = [];
  }

  async loadInitialData() {
    try {
      const [actividadesRes, lugaresRes, practicantesRes, profesoresRes] = await Promise.all([
        apiClient.get('/actividades'),
        apiClient.get('/lugares'),
        apiClient.get('/practicantes?limit=1000&es_profesor=false'), // Only actual students for reservation
        apiClient.get('/practicantes', { es_profesor: true, limit: 100 })
      ]);
      this.actividades = actividadesRes.data;
      this.lugares = lugaresRes.data;
      this.practicantes = practicantesRes.data || [];
      this.profesores = profesoresRes.data || [];

      // If editing, load current attendees to pre-check them
      this.currentAttendees = [];
      if (this.options.clase) {
        try {
            const res = await apiClient.get(`/asistencia/clases/${this.options.clase.id}/practicantes`);
            // Filtrar solo los que ya asistieron o están en la lista (que vengan de la tabla Asistencia)
            this.currentAttendees = res.data.filter(p => p.asistio).map(p => p.id);
        } catch (e) {
            console.error('Error loading attendees', e);
        }
      }
    } catch (error) {
      displayApiError(error);
    }
  }

  async render() {
    await this.loadInitialData();
    const isEdit = !!this.options.clase;
    const today = new Date().toISOString().split('T')[0];
    
    const c = this.options.clase || {
      tipo: 'grupal',
      actividad_id: '',
      lugar_id: '',
      profesor_id: '',
      fecha: today,
      hora: '18:00',
      hora_fin: '19:00',
      observaciones: ''
    };

    // Identify which IDs are parents (have children)
    const parentIds = new Set(this.lugares.filter(l => l.parent_id).map(l => l.parent_id));
    
    // Filter: Show standalone parents (no children) OR children
    const filteredLugares = this.lugares.filter(l => {
        const isParentWithChildren = !l.parent_id && parentIds.has(l.id);
        return !isParentWithChildren;
    });

    this.container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>${isEdit ? 'Editar Sesión de Clase' : 'Nueva Sesión de Clase (Manual)'}</h3>
        </div>
        <div class="card-body">
          <form id="clase-form">
            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="tipo">Tipo de Clase</label>
                <select class="form-control" id="tipo" required>
                  <option value="grupal" ${c.tipo === 'grupal' ? 'selected' : ''}>Grupal (Horario fijo)</option>
                  <option value="flexible" ${c.tipo === 'flexible' ? 'selected' : ''}>Particular / Compartida (Horario pautado)</option>
                </select>
              </div>
              <div class="form-group col-md-6">
                <label for="profesor_id">Profesor Responsable</label>
                <select class="form-control" id="profesor_id">
                  <option value="">Seleccione un profesor</option>
                  ${this.profesores.map(p => `<option value="${p.id}" ${c.profesor_id == p.id ? 'selected' : ''}>${p.nombre_completo}</option>`).join('')}
                </select>
              </div>
            </div>

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
                  ${filteredLugares.map(l => `<option value="${l.id}" ${c.lugar_id == l.id ? 'selected' : ''}>${l.nombre}${l.parent_nombre ? ` (${l.parent_nombre})` : ''}</option>`).join('')}
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

            <!-- Reservación para flexibles -->
            <div id="reservation-section" class="${c.tipo === 'grupal' ? 'd-none' : ''}">
                <hr>
                <label><strong>Alumnos que reservaron esta clase</strong></label>
                <div class="practicantes-selection card p-2 bg-light" style="max-height: 200px; overflow-y: auto;">
                    ${this.practicantes.map(p => {
                        const isChecked = this.currentAttendees && this.currentAttendees.includes(p.id);
                        return `
                        <div class="form-check">
                            <input class="form-check-input student-reservation" type="checkbox" value="${p.id}" id="p-${p.id}" ${isChecked ? 'checked' : ''}>
                            <label class="form-check-label" for="p-${p.id}">${p.nombre_completo}</label>
                        </div>
                    `}).join('')}
                </div>
                <small class="text-muted">Los seleccionados aparecerán en la lista de asistencia de esta clase.</small>
            </div>

            <div class="form-group mt-3">
              <label for="observaciones">Descripción / Notas</label>
              <textarea class="form-control" id="observaciones" rows="2" placeholder="Opcional">${c.observaciones || c.descripcion || ''}</textarea>
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
    const tipoSelect = this.container.querySelector('#tipo');
    const reservationSection = this.container.querySelector('#reservation-section');

    tipoSelect.addEventListener('change', () => {
        if (tipoSelect.value === 'grupal') {
            reservationSection.classList.add('d-none');
        } else {
            reservationSection.classList.remove('d-none');
        }
    });

    this.container.querySelector('#cancel-clase-btn').addEventListener('click', () => {
        this.options.onCancel();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const reservedStudents = Array.from(this.container.querySelectorAll('.student-reservation:checked'))
                                    .map(cb => parseInt(cb.value, 10));

      const formData = {
        tipo: tipoSelect.value,
        actividad_id: parseInt(this.container.querySelector('#actividad_id').value, 10),
        lugar_id: parseInt(this.container.querySelector('#lugar_id').value, 10),
        profesor_id: this.container.querySelector('#profesor_id').value ? parseInt(this.container.querySelector('#profesor_id').value, 10) : null,
        fecha: this.container.querySelector('#fecha').value,
        hora: this.container.querySelector('#hora').value,
        hora_fin: this.container.querySelector('#hora_fin').value,
        observaciones: this.container.querySelector('#observaciones').value,
        practicantes_reservados: reservedStudents
      };

      try {
        if (this.options.clase) {
          await apiClient.put(`/asistencia/clases/${this.options.clase.id}`, formData);
          showSuccess('Sesión de clase actualizada');
        } else {
          await apiClient.post('/asistencia/clases', formData);
          showSuccess('Sesión de clase creada exitosamente');
        }
        this.options.onSuccess();
      } catch (error) {
        displayApiError(error);
      }
    });
  }
}

export default ClaseForm;

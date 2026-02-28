import { formatTime } from '../utils/formatting.js';

export class HorarioList {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onEdit: options.onEdit || (() => {}),
      onDelete: options.onDelete || (() => {}),
      onShowHistory: options.onShowHistory || (() => {})
    };
    this.horarios = [];
    this.diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  }

  setHorarios(horarios) {
    this.horarios = horarios;
  }

  render() {
    this.container.innerHTML = `
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Día</th>
              <th>Horario</th>
              <th>Actividad</th>
              <th>Lugar</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${this.horarios.length === 0 ? '<tr><td colspan="6" class="text-center">No hay horarios configurados</td></tr>' : ''}
            ${this.horarios.map(h => `
              <tr class="${!h.activo ? 'text-muted' : ''}">
                <td><strong>${this.diasSemana[h.dia_semana]}</strong></td>
                <td>${h.hora_inicio.substring(0, 5)} - ${h.hora_fin.substring(0, 5)}</td>
                <td>${h.actividad_nombre}</td>
                <td>${h.lugar_nombre}</td>
                <td>
                  <span class="badge ${h.activo ? 'badge-success' : 'badge-secondary'}">
                    ${h.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-secondary btn-sm edit-btn" data-id="${h.id}">Editar</button>
                  <button class="btn btn-info btn-sm history-btn" data-id="${h.id}">Historial</button>
                  <button class="btn btn-danger btn-sm delete-btn" data-id="${h.id}">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    this.container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'), 10);
        const horario = this.horarios.find(h => h.id === id);
        this.options.onEdit(horario);
      });
    });

    this.container.querySelectorAll('.history-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'), 10);
        const horario = this.horarios.find(h => h.id === id);
        this.options.onShowHistory(horario);
      });
    });

    this.container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'), 10);
        if (confirm('¿Está seguro de que desea eliminar este horario?')) {
          this.options.onDelete(id);
        }
      });
    });
  }
}

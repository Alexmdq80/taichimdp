import { formatDate } from '../utils/formatting.js';

export class ClaseList {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onSelect: options.onSelect || (() => {}),
      onDelete: options.onDelete || (() => {})
    };
    this.clases = [];
  }

  setClases(clases) {
    this.clases = clases;
  }

  formatTipo(tipo) {
    if (tipo === 'grupal') {
        return 'Grupal (Horario fijo)';
    }
    return 'Particular/Compartida (Horario flexible)';
  }

  render() {
    const statusBadges = {
      'programada': 'badge-info',
      'realizada': 'badge-success',
      'cancelada': 'badge-danger',
      'suspendida': 'badge-warning'
    };

    this.container.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Horario</th>
              <th>Actividad</th>
              <th>Lugar</th>
              <th>Estado</th>
              <th>Asistentes</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${this.clases.length === 0 ? '<tr><td colspan="8" class="text-center">No hay clases registradas en este periodo</td></tr>' : ''}
            ${this.clases.map(c => `
              <tr class="${c.estado === 'cancelada' || c.estado === 'suspendida' ? 'table-light text-muted' : ''}">
                <td><strong>${formatDate(c.fecha)}</strong></td>
                <td>
                    <span class="badge ${c.tipo === 'grupal' ? 'badge-primary' : 'badge-info'}">
                        ${this.formatTipo(c.tipo)}
                    </span>
                </td>
                <td>${c.hora.substring(0, 5)} - ${c.hora_fin.substring(0, 5)}</td>
                <td>${c.actividad_nombre}</td>
                <td>${c.lugar_nombre}</td>
                <td>
                  <span class="badge ${statusBadges[c.estado] || 'badge-secondary'}">
                    ${c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
                  </span>
                </td>
                <td>
                  ${c.estado === 'cancelada' || c.estado === 'suspendida' ? '-' : `
                    <span class="badge ${c.asistentes_count > 0 ? 'badge-primary' : 'badge-light'}">
                      ${c.asistentes_count} presentes
                    </span>
                  `}
                </td>
                <td>
                  <button class="btn ${c.estado === 'programada' ? 'btn-primary' : 'btn-secondary'} btn-sm attendance-btn" data-id="${c.id}">
                    ${c.estado === 'programada' ? 'Tomar Asistencia' : 'Gestionar'}
                  </button>
                  <button class="btn btn-danger btn-sm delete-btn" data-id="${c.id}">
                    Eliminar
                  </button>
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
    this.container.querySelectorAll('.attendance-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'), 10);
        const clase = this.clases.find(c => c.id === id);
        this.options.onSelect(clase);
      });
    });

    this.container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'), 10);
        if (confirm('¿Está seguro de que desea eliminar esta sesión de clase? No afectará al horario semanal.')) {
          this.options.onDelete(id);
        }
      });
    });
  }
}

export default ClaseList;

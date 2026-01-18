/**
 * PracticanteDetail Component
 * Display detailed information about a practicante
 */

import { formatDateReadable } from '../utils/formatting.js';

export class PracticanteDetail {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onClose: options.onClose || (() => {}),
      onEdit: options.onEdit || (() => {})
    };
    this.practicante = null;
  }

  render(practicante) {
    this.practicante = practicante;

    if (!practicante) {
      this.container.innerHTML = '<p class="text-muted">Seleccione un practicante para ver sus detalles</p>';
      return;
    }

    this.container.innerHTML = `
      <div class="card">
        <div class="card-header flex justify-between items-center">
          <h2 class="card-title">Detalles del Practicante</h2>
          <div class="flex gap-2">
            <button id="edit-btn" class="btn">Editar</button>
            <button id="close-btn" class="btn btn-secondary">Cerrar</button>
          </div>
        </div>

        <div class="grid grid-2" style="margin-top: 1rem;">
          <div>
            <h3>Información Personal</h3>
            <dl>
              <dt>Nombre Completo:</dt>
              <dd>${this.escapeHtml(practicante.nombre_completo)}</dd>
              
              <dt>Fecha de Nacimiento:</dt>
              <dd>${practicante.fecha_nacimiento ? formatDateReadable(practicante.fecha_nacimiento) : 'No especificada'}</dd>
              
              <dt>Género:</dt>
              <dd>${this.formatGenero(practicante.genero)}</dd>
            </dl>

            <h3>Información de Contacto</h3>
            <dl>
              <dt>Teléfono:</dt>
              <dd>${practicante.telefono || 'No especificado'}</dd>
              
              <dt>Email:</dt>
              <dd>${practicante.email || 'No especificado'}</dd>
              
              <dt>Dirección:</dt>
              <dd>${practicante.direccion || 'No especificada'}</dd>
            </dl>
          </div>

          <div>
            <h3>Información de Salud</h3>
            <dl>
              <dt>Condiciones Médicas:</dt>
              <dd>${practicante.condiciones_medicas || 'Ninguna registrada'}</dd>
              
              <dt>Medicamentos:</dt>
              <dd>${practicante.medicamentos || 'Ninguno registrado'}</dd>
              
              <dt>Limitaciones Físicas:</dt>
              <dd>${practicante.limitaciones_fisicas || 'Ninguna registrada'}</dd>
              
              <dt>Alergias:</dt>
              <dd>${practicante.alergias || 'Ninguna registrada'}</dd>
            </dl>

            <h3>Información del Sistema</h3>
            <dl>
              <dt>Fecha de Registro:</dt>
              <dd>${practicante.created_at ? formatDateReadable(practicante.created_at.split('T')[0]) : 'N/A'}</dd>
              
              <dt>Última Actualización:</dt>
              <dd>${practicante.updated_at ? formatDateReadable(practicante.updated_at.split('T')[0]) : 'N/A'}</dd>
            </dl>
          </div>
        </div>
      </div>

      <style>
        dl {
          margin-bottom: 1.5rem;
        }
        dt {
          font-weight: 600;
          margin-top: 0.5rem;
          color: var(--text-muted);
        }
        dd {
          margin-left: 0;
          margin-bottom: 0.5rem;
        }
      </style>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const editBtn = this.container.querySelector('#edit-btn');
    const closeBtn = this.container.querySelector('#close-btn');

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.options.onEdit(this.practicante);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.render(null);
        this.options.onClose();
      });
    }
  }

  formatGenero(genero) {
    const map = {
      'M': 'Masculino',
      'F': 'Femenino',
      'Otro': 'Otro',
      'Prefiero no decir': 'Prefiero no decir'
    };
    return map[genero] || 'No especificado';
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default PracticanteDetail;

import { apiClient } from '../api/client.js';
import { displayApiError, showSuccess } from '../utils/errors.js';

export class AsistenciaMarker {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            clase: options.clase,
            onClose: options.onClose || (() => {})
        };
        this.practicantes = [];
    }

    async loadPracticantes() {
        try {
            const response = await apiClient.get(`/asistencia/clases/${this.options.clase.id}/practicantes`);
            this.practicantes = response.data;
        } catch (error) {
            displayApiError(error);
        }
    }

    async render() {
        await this.loadPracticantes();
        
        const c = this.options.clase;
        this.container.innerHTML = `
            <div class="card mb-4">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h3 class="mb-0">Gestión de Clase y Asistencia</h3>
                    <button id="close-attendance-btn" class="btn btn-light btn-sm">Cerrar</button>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Actividad:</strong> ${c.actividad_nombre}</p>
                            <p class="mb-1"><strong>Fecha y Hora:</strong> ${c.fecha} | ${c.hora.substring(0, 5)} - ${c.hora_fin.substring(0, 5)}</p>
                            <p class="mb-1"><strong>Lugar:</strong> ${c.lugar_nombre}</p>
                        </div>
                        <div class="col-md-6 text-right">
                            <div class="form-group mb-0">
                                <label for="clase-estado"><strong>Estado de la Clase:</strong></label>
                                <select class="form-control d-inline-block w-auto ml-2" id="clase-estado">
                                    <option value="programada" ${c.estado === 'programada' ? 'selected' : ''}>Programada</option>
                                    <option value="realizada" ${c.estado === 'realizada' ? 'selected' : ''}>Realizada</option>
                                    <option value="cancelada" ${c.estado === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                                    <option value="suspendida" ${c.estado === 'suspendida' ? 'selected' : ''}>Suspendida</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div id="cancelation-reason-container" class="form-group ${c.estado === 'cancelada' || c.estado === 'suspendida' ? '' : 'd-none'}">
                        <label for="motivo-cancelacion"><strong>Motivo de Cancelación / Suspensión:</strong></label>
                        <textarea class="form-control" id="motivo-cancelacion" rows="2" placeholder="Especifique el motivo (ej: Feriado, Temporal, Enfermedad...)" >${c.motivo_cancelacion || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="clase-observaciones"><strong>Observaciones de la Clase:</strong></label>
                        <textarea class="form-control" id="clase-observaciones" rows="2" placeholder="Notas pedagógicas o comentarios sobre lo realizado">${c.observaciones || ''}</textarea>
                    </div>

                    <hr>
                    
                    <div id="attendance-section" class="${c.estado === 'realizada' ? '' : 'd-none'}">
                        <h4>Listado de Asistencia</h4>
                        <div class="table-responsive">
                            <table class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th style="width: 50px;">Asistió</th>
                                        <th>Practicante</th>
                                        <th>Abono / Cuota</th>
                                    </tr>
                                </thead>
                                <tbody id="attendance-list">
                                    ${this.practicantes.length === 0 ? '<tr><td colspan="3" class="text-center text-muted">No hay practicantes con abono activo para este lugar y fecha</td></tr>' : ''}
                                    ${this.practicantes.map(p => `
                                        <tr>
                                            <td>
                                                <div class="flex items-center justify-center" style="display: flex; align-items: center; justify-content: center; height: 100%;">
                                                    <input type="checkbox" class="attendance-checkbox" data-id="${p.id}" ${p.asistio ? 'checked' : ''} style="width: 20px; height: 20px; margin: 0; cursor: pointer;">
                                                </div>
                                            </td>
                                            <td><strong>${p.nombre_completo}</strong></td>
                                            <td><small class="text-muted">${p.abono_nombre}</small></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="form-actions mt-4 text-center">
                        <button id="save-attendance-btn" class="btn btn-success btn-lg px-5">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        const estadoSelect = this.container.querySelector('#clase-estado');
        const reasonContainer = this.container.querySelector('#cancelation-reason-container');
        const attendanceSection = this.container.querySelector('#attendance-section');

        estadoSelect.addEventListener('change', () => {
            const val = estadoSelect.value;
            
            // Lógica de visibilidad
            if (val === 'cancelada' || val === 'suspendida') {
                reasonContainer.classList.remove('d-none');
                attendanceSection.classList.add('d-none');
            } else if (val === 'realizada') {
                reasonContainer.classList.add('d-none');
                attendanceSection.classList.remove('d-none');
            } else { // 'programada'
                reasonContainer.classList.add('d-none');
                attendanceSection.classList.add('d-none');
            }
        });

        this.container.querySelector('#close-attendance-btn').addEventListener('click', () => {
            this.options.onClose();
        });

        this.container.querySelector('#save-attendance-btn').addEventListener('click', async () => {
            const estado = estadoSelect.value;
            const observaciones = this.container.querySelector('#clase-observaciones').value;
            const motivo_cancelacion = this.container.querySelector('#motivo-cancelacion').value;

            let asistencias = [];
            if (estado !== 'cancelada' && estado !== 'suspendida') {
                const checkboxes = this.container.querySelectorAll('.attendance-checkbox');
                asistencias = Array.from(checkboxes).map(cb => ({
                    practicante_id: parseInt(cb.getAttribute('data-id'), 10),
                    asistio: cb.checked
                }));
            }

            try {
                await apiClient.post(`/asistencia/clases/${this.options.clase.id}/registrar`, { 
                    asistencias,
                    estado,
                    observaciones,
                    motivo_cancelacion
                });
                showSuccess('Datos de la clase actualizados correctamente');
                this.options.onClose();
            } catch (error) {
                displayApiError(error);
            }
        });
    }
}

export default AsistenciaMarker;

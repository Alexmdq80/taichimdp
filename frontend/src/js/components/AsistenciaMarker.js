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
                    <h3 class="mb-0">Toma de Asistencia</h3>
                    <button id="close-attendance-btn" class="btn btn-light btn-sm">Cerrar</button>
                </div>
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <p class="mb-0"><strong>Clase:</strong> ${c.actividad_nombre}</p>
                            <p class="mb-0"><strong>Fecha:</strong> ${c.fecha} | <strong>Lugar:</strong> ${c.lugar_nombre}</p>
                        </div>
                        <button id="save-attendance-btn" class="btn btn-success">Guardar Asistencia</button>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th style="width: 50px;">Asistió</th>
                                    <th>Practicante</th>
                                    <th>Abono Actual</th>
                                </tr>
                            </thead>
                            <tbody id="attendance-list">
                                ${this.practicantes.length === 0 ? '<tr><td colspan="3" class="text-center">No hay practicantes con abono activo para este lugar y fecha</td></tr>' : ''}
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
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        this.container.querySelector('#close-attendance-btn').addEventListener('click', () => {
            this.options.onClose();
        });

        this.container.querySelector('#save-attendance-btn').addEventListener('click', async () => {
            const checkboxes = this.container.querySelectorAll('.attendance-checkbox');
            const asistencias = Array.from(checkboxes).map(cb => ({
                practicante_id: parseInt(cb.getAttribute('data-id'), 10),
                asistio: cb.checked
            }));

            try {
                await apiClient.post(`/asistencia/clases/${this.options.clase.id}/registrar`, { asistencias });
                showSuccess('Asistencia guardada correctamente');
                this.options.onClose();
            } catch (error) {
                displayApiError(error);
            }
        });
    }
}

export default AsistenciaMarker;

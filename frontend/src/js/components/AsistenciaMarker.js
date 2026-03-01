import { apiClient } from '../api/client.js';
import { displayApiError, showSuccess } from '../utils/errors.js';
import { formatTime } from '../utils/formatting.js';

export class AsistenciaMarker {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            clase: options.clase || null,
            onClose: options.onClose || (() => {})
        };
        this.practicantes = [];
    }

    async loadPracticantes(estadoOverride = null) {
        try {
            const url = `/asistencia/clases/${this.options.clase.id}/practicantes${estadoOverride ? `?estado=${estadoOverride}` : ''}`;
            const response = await apiClient.get(url);
            this.practicantes = response.data;
        } catch (error) {
            displayApiError(error);
        }
    }

    formatTipo(tipo) {
        if (tipo === 'flexible') return 'Particular / Compartida (Horario pautado)';
        return 'Grupal (Horario fijo)';
    }

    async render() {
        await this.loadPracticantes();
        const c = this.options.clase;

        // Validaciones de tiempo y estado
        const classDateTime = new Date(`${c.fecha}T${c.hora}`);
        const now = new Date();
        const isTimePassed = now >= classDateTime;
        
        const canModifyAttendanceInitial = c.tipo === 'grupal' 
            ? (c.estado === 'realizada') 
            : (c.estado === 'programada' || c.estado === 'realizada');

        this.container.innerHTML = `
            <div class="card">
                <div class="card-header flex justify-between items-center">
                    <div>
                        <h2 class="card-title">Gestión de Clase y Asistencia</h2>
                        <div style="margin-top: 0.5rem;">
                            <span class="badge ${c.tipo === 'flexible' ? 'badge-info' : 'badge-primary'}" style="font-size: 0.9rem; padding: 0.4rem 0.8rem;">
                                <i class="fas ${c.tipo === 'flexible' ? 'fa-calendar-check' : 'fa-users'}"></i> 
                                ${this.formatTipo(c.tipo)}
                            </span>
                            <span class="badge ${c.estado === 'programada' ? 'badge-success' : 'badge-secondary'}" style="font-size: 0.9rem; padding: 0.4rem 0.8rem; margin-left: 0.5rem;">
                                Estado: ${c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
                            </span>
                        </div>
                    </div>
                    <button id="close-attendance-btn" class="btn btn-secondary">Volver al Listado</button>
                </div>
                <div class="card-body">
                    <div id="attendance-alert" class="alert alert-warning mb-4" style="display: ${canModifyAttendanceInitial ? 'none' : 'block'};">
                        <i class="fas fa-exclamation-triangle"></i> 
                        <strong>Atención:</strong> 
                        ${c.tipo === 'grupal' 
                            ? 'La asistencia de clases grupales solo se puede marcar cuando la clase está en estado <strong>"Realizada"</strong>.' 
                            : 'La asistencia de clases particulares se puede marcar en estado <strong>"Programada"</strong> o <strong>"Realizada"</strong>.'}
                    </div>
                    
                    <div class="grid grid-2 gap-4">
                        <div>
                            <h3>Detalles de la Sesión</h3>
                            <div class="p-3 bg-light border rounded">
                                <p><strong>Actividad:</strong> ${c.actividad_nombre}</p>
                                <p><strong>Lugar:</strong> ${c.lugar_nombre}</p>
                                <p><strong>Fecha:</strong> ${c.fecha}</p>
                                <p><strong>Horario:</strong> ${formatTime(c.hora)} - ${formatTime(c.hora_fin)}</p>
                                
                                <div class="form-group mt-3">
                                    <label for="clase-estado"><strong>Estado de la Clase:</strong></label>
                                    <select class="form-control d-inline-block w-auto ml-2" id="clase-estado">
                                        <option value="programada" ${c.estado === 'programada' ? 'selected' : ''}>Programada</option>
                                        <option value="realizada" ${c.estado === 'realizada' ? 'selected' : ''} ${!isTimePassed ? 'disabled' : ''}>Realizada</option>
                                        <option value="cancelada" ${c.estado === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                                        <option value="suspendida" ${c.estado === 'suspendida' ? 'selected' : ''}>Suspendida</option>
                                    </select>
                                    ${!isTimePassed ? '<br><small class="text-muted">La opción "Realizada" se habilitará cuando pase la fecha/hora de la clase.</small>' : ''}
                                </div>

                                <div id="motivo-cancelacion-group" class="form-group" style="display: ${c.estado === 'cancelada' || c.estado === 'suspendida' ? 'block' : 'none'};">
                                    <label for="motivo-cancelacion"><strong>Motivo:</strong></label>
                                    <input type="text" id="motivo-cancelacion" class="form-control" value="${c.motivo_cancelacion || ''}" placeholder="Especifique el motivo">
                                </div>

                                <div class="form-group">
                                    <label for="clase-observaciones"><strong>Observaciones:</strong></label>
                                    <textarea id="clase-observaciones" class="form-control" rows="2">${c.observaciones || ''}</textarea>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3>Presentismo</h3>
                            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th style="width: 50px;">Asistió</th>
                                            <th>Alumno</th>
                                            <th>Abono / Cuota</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.practicantes.map(p => {
                                            const limitReached = p.asistencias_esta_semana >= p.clases_por_semana;
                                            const warningClass = limitReached && !p.asistio ? 'table-warning' : '';
                                            return `
                                            <tr class="${warningClass}">
                                                <td>
                                                    <div class="flex items-center justify-center" style="display: flex; align-items: center; justify-content: center; height: 100%;">
                                                        <input type="checkbox" class="attendance-checkbox" 
                                                            data-id="${p.id}" 
                                                            data-limit-reached="${limitReached}"
                                                            data-nombre="${p.nombre_completo}"
                                                            ${p.asistio ? 'checked' : ''} 
                                                            ${!canModifyAttendanceInitial ? 'disabled' : ''}
                                                            style="width: 20px; height: 20px; margin: 0; cursor: pointer;">
                                                    </div>
                                                </td>
                                                <td>
                                                    <strong>${p.nombre_completo}</strong>
                                                    ${limitReached && !p.asistio ? `<br><small class="text-danger"><i class="fas fa-exclamation-triangle"></i> Límite semanal alcanzado (${p.asistencias_esta_semana}/${p.clases_por_semana})</small>` : ''}
                                                </td>
                                                <td>
                                                    <small class="text-muted">${p.abono_nombre}</small><br>
                                                    <small class="${limitReached ? 'text-danger font-weight-bold' : 'text-success'}">
                                                        Semanales: ${p.asistencias_esta_semana} / ${p.clases_por_semana}
                                                    </small>
                                                </td>
                                            </tr>
                                        `;}).join('')}
                                    </tbody>
                                </table>
                            </div>
                            <div class="mt-3 text-right">
                                <button id="save-attendance-btn" class="btn btn-primary btn-lg">Guardar Cambios</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderTableBody() {
        const tableBody = this.container.querySelector('tbody');
        const currentEstado = this.container.querySelector('#clase-estado').value;
        const c = this.options.clase;
        const canModify = c.tipo === 'grupal' 
            ? (currentEstado === 'realizada') 
            : (currentEstado === 'programada' || currentEstado === 'realizada');

        tableBody.innerHTML = this.practicantes.map(p => {
            const limitReached = p.asistencias_esta_semana >= p.clases_por_semana;
            const warningClass = limitReached && !p.asistio ? 'table-warning' : '';
            return `
            <tr class="${warningClass}">
                <td>
                    <div class="flex items-center justify-center" style="display: flex; align-items: center; justify-content: center; height: 100%;">
                        <input type="checkbox" class="attendance-checkbox" 
                            data-id="${p.id}" 
                            data-limit-reached="${limitReached}"
                            data-nombre="${p.nombre_completo}"
                            ${p.asistio ? 'checked' : ''} 
                            ${!canModify ? 'disabled' : ''}
                            style="width: 20px; height: 20px; margin: 0; cursor: pointer;">
                    </div>
                </td>
                <td>
                    <strong>${p.nombre_completo}</strong>
                    ${limitReached && !p.asistio ? `<br><small class="text-danger"><i class="fas fa-exclamation-triangle"></i> Límite semanal alcanzado (${p.asistencias_esta_semana}/${p.clases_por_semana})</small>` : ''}
                </td>
                <td>
                    <small class="text-muted">${p.abono_nombre}</small><br>
                    <small class="${limitReached ? 'text-danger font-weight-bold' : 'text-success'}">
                        Semanales: ${p.asistencias_esta_semana} / ${p.clases_por_semana}
                    </small>
                </td>
            </tr>
        `;}).join('');

        this.attachCheckboxEvents();
        
        const alertBox = this.container.querySelector('#attendance-alert');
        if (alertBox) {
            alertBox.style.display = canModify ? 'none' : 'block';
        }
    }

    attachCheckboxEvents() {
        const checkboxes = this.container.querySelectorAll('.attendance-checkbox');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', (e) => {
                const limitReached = cb.getAttribute('data-limit-reached') === 'true';
                const nombre = cb.getAttribute('data-nombre');
                if (cb.checked && limitReached) {
                    if (!confirm(`${nombre} ya ha alcanzado o superado su límite de clases semanales. ¿Desea marcar la asistencia de todas formas?`)) {
                        cb.checked = false;
                    }
                }
            });
        });
    }

    attachEvents() {
        this.container.querySelector('#close-attendance-btn').addEventListener('click', () => {
            this.options.onClose();
        });

        const estadoSelect = this.container.querySelector('#clase-estado');
        const motivoGroup = this.container.querySelector('#motivo-cancelacion-group');
        const alertBox = this.container.querySelector('#attendance-alert');
        const c = this.options.clase;
        
        this.attachCheckboxEvents();

        estadoSelect.addEventListener('change', async () => {
            const currentEstado = estadoSelect.value;
            
            // Si es grupal y cambia a realizada, recargar lista para mostrar a todos
            if (c.tipo === 'grupal' && currentEstado === 'realizada') {
                const tableBody = this.container.querySelector('tbody');
                tableBody.innerHTML = '<tr><td colspan="3" class="text-center">Actualizando lista de alumnos...</td></tr>';
                
                await this.loadPracticantes('realizada');
                this.renderTableBody();
                return; // renderTableBody ya maneja el resto de la lógica visual
            }

            // Toggle motivo group
            if (currentEstado === 'cancelada' || currentEstado === 'suspendida') {
                motivoGroup.style.display = 'block';
            } else {
                motivoGroup.style.display = 'none';
            }

            // Toggle checkboxes and alert dynamically
            const checkboxes = this.container.querySelectorAll('.attendance-checkbox');
            const canModify = c.tipo === 'grupal' 
                ? (currentEstado === 'realizada') 
                : (currentEstado === 'programada' || currentEstado === 'realizada');
                
            checkboxes.forEach(cb => {
                cb.disabled = !canModify;
            });
            alertBox.style.display = canModify ? 'none' : 'block';
        });

        this.container.querySelector('#save-attendance-btn').addEventListener('click', async () => {
            const updates = [];
            this.container.querySelectorAll('.attendance-checkbox').forEach(cb => {
                updates.push({
                    practicante_id: parseInt(cb.getAttribute('data-id'), 10),
                    asistio: cb.checked ? 1 : 0
                });
            });

            const estado = estadoSelect.value;
            const observaciones = this.container.querySelector('#clase-observaciones').value;
            const motivo_cancelacion = this.container.querySelector('#motivo-cancelacion') ? this.container.querySelector('#motivo-cancelacion').value : '';

            try {
                // 1. Save class data (Always allowed)
                await apiClient.put(`/asistencia/clases/${this.options.clase.id}`, {
                    estado,
                    observaciones,
                    motivo_cancelacion,
                    tipo: this.options.clase.tipo,
                    fecha: this.options.clase.fecha,
                    hora: this.options.clase.hora,
                    hora_fin: this.options.clase.hora_fin
                });

                // 2. Save attendance only if allowed by business rules
                const canModify = c.tipo === 'grupal' ? (estado === 'realizada') : (estado === 'programada');
                if (canModify && updates.length > 0) {
                    await apiClient.post(`/asistencia/clases/${this.options.clase.id}/practicantes`, { updates });
                }
                
                showSuccess('Datos de la clase guardados correctamente');
                this.options.onClose();
            } catch (error) {
                displayApiError(error);
            }
        });
    }
}

export default AsistenciaMarker;

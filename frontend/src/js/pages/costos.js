import { apiClient } from '../api/client.js';
import { displayApiError, showSuccess } from '../utils/errors.js';
import { formatDate, formatTime } from '../utils/formatting.js';

export class CostosPage {
    constructor(container) {
        this.container = container;
        
        const today = new Date();
        this.selectedMonth = today.getMonth();
        this.selectedYear = today.getFullYear();
        
        this.clases = [];
        this.filters = {};
        this.updateFiltersFromMonthYear();
    }

    updateFiltersFromMonthYear() {
        const firstDay = new Date(this.selectedYear, this.selectedMonth, 1);
        const lastDay = new Date(this.selectedYear, this.selectedMonth + 1, 0);
        
        const formatDateStr = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        this.filters.fecha_inicio = formatDateStr(firstDay);
        this.filters.fecha_fin = formatDateStr(lastDay);
    }

    async render() {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        this.container.innerHTML = `
            <div class="page-header">
                <h1>Gestión de Costos de Clases</h1>
            </div>

            <div class="filters-bar mb-4 p-3 bg-light border rounded">
                <div class="form-row align-items-end">
                    <div class="form-group col-md-4">
                        <label for="costo-month">Mes</label>
                        <select class="form-control" id="costo-month">
                            ${months.map((m, i) => `<option value="${i}" ${this.selectedMonth === i ? 'selected' : ''}>${m}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group col-md-3">
                        <label for="costo-year">Año</label>
                        <input type="number" class="form-control" id="costo-year" value="${this.selectedYear}">
                    </div>
                    <div class="form-group col-md-3">
                        <button id="costo-filter-btn" class="btn btn-primary btn-block">Aplicar Filtro</button>
                    </div>
                    <div class="form-group col-md-2">
                        <button id="costo-refresh-btn" class="btn btn-outline-secondary btn-block">Actualizar</button>
                    </div>
                </div>
            </div>

            <div id="costos-summary" class="mb-4"></div>

            <div id="costos-content">
                <div class="loader text-center p-5">Cargando datos de costos...</div>
            </div>

            <!-- Modal para fecha de pago -->
            <div id="pago-fecha-modal" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h2>Registrar Fecha de Pago</h2>
                        <span class="close-pago-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="pago-fecha-form">
                            <input type="hidden" id="pago-clase-id">
                            <div class="form-group">
                                <label for="input-fecha-pago">Fecha en que se realizó el pago:</label>
                                <input type="date" id="input-fecha-pago" class="form-control" required>
                            </div>
                            <div class="form-actions mt-4">
                                <button type="submit" class="btn btn-success">Confirmar Pago</button>
                                <button type="button" class="btn btn-secondary cancel-pago-modal">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
        await this.loadData();
    }

    attachEvents() {
        this.container.querySelector('#costo-filter-btn').onclick = () => {
            this.selectedMonth = parseInt(this.container.querySelector('#costo-month').value, 10);
            this.selectedYear = parseInt(this.container.querySelector('#costo-year').value, 10);
            this.updateFiltersFromMonthYear();
            this.loadData();
        };

        this.container.querySelector('#costo-refresh-btn').onclick = () => this.loadData();

        // Pago Modal events
        const modal = this.container.querySelector('#pago-fecha-modal');
        this.container.querySelector('.close-pago-modal').onclick = () => modal.style.display = 'none';
        this.container.querySelector('.cancel-pago-modal').onclick = () => modal.style.display = 'none';
        
        this.container.querySelector('#pago-fecha-form').onsubmit = async (e) => {
            e.preventDefault();
            const id = parseInt(this.container.querySelector('#pago-clase-id').value, 10);
            const fecha = this.container.querySelector('#input-fecha-pago').value;
            await this.submitPayment(id, true, fecha);
            modal.style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target == modal) modal.style.display = 'none';
        };
    }

    async loadData() {
        const content = this.container.querySelector('#costos-content');
        try {
            const response = await apiClient.get('/asistencia/clases', this.filters);
            this.clases = response.data;
            this.renderList(content);
            this.renderSummary();
        } catch (error) {
            displayApiError(error, content);
        }
    }

    calculateClassCost(clase) {
        if (clase.tipo_tarifa === 'por_clase') {
            return parseFloat(clase.costo_tarifa);
        } else {
            // Por hora
            const start = new Date(`2000-01-01T${clase.hora}`);
            const end = new Date(`2000-01-01T${clase.hora_fin}`);
            const diffHours = (end - start) / (1000 * 60 * 60);
            return parseFloat(clase.costo_tarifa) * diffHours;
        }
    }

    renderSummary() {
        const summaryDiv = this.container.querySelector('#costos-summary');
        
        // Only count 'realizada' or 'cerrada' for payment summary?
        // Let's count all non-cancelled for total projection
        const activeClases = this.clases.filter(c => c.estado !== 'cancelada');
        
        const totalCost = activeClases.reduce((acc, c) => acc + this.calculateClassCost(c), 0);
        const totalPaid = activeClases.filter(c => c.pago_profesor_realizado).reduce((acc, c) => acc + this.calculateClassCost(c), 0);
        const totalPending = totalCost - totalPaid;

        summaryDiv.innerHTML = `
            <div class="grid grid-3 gap-4">
                <div class="card bg-primary text-white p-3 text-center">
                    <h4>Total del Mes</h4>
                    <h2 class="mb-0">$${totalCost.toFixed(2)}</h2>
                    <small>${activeClases.length} clases activas</small>
                </div>
                <div class="card bg-success text-white p-3 text-center">
                    <h4>Total Pagado</h4>
                    <h2 class="mb-0">$${totalPaid.toFixed(2)}</h2>
                    <small>${activeClases.filter(c => c.pago_profesor_realizado).length} clases liquidadas</small>
                </div>
                <div class="card bg-warning text-white p-3 text-center">
                    <h4>Pendiente</h4>
                    <h2 class="mb-0">$${totalPending.toFixed(2)}</h2>
                    <small>${activeClases.filter(c => !c.pago_profesor_realizado).length} clases por pagar</small>
                </div>
            </div>
        `;
    }

    renderList(content) {
        if (this.clases.length === 0) {
            content.innerHTML = '<p class="text-center p-5 text-muted">No hay clases registradas en este periodo.</p>';
            return;
        }

        content.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Lugar</th>
                            <th>Profesor</th>
                            <th>Horas</th>
                            <th>Tarifa</th>
                            <th>Importe</th>
                            <th>Estado Pago</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.clases.map(c => {
                            const cost = this.calculateClassCost(c);
                            const isCancelled = c.estado === 'cancelada';
                            return `
                            <tr class="${isCancelled ? 'table-light text-muted' : ''}">
                                <td><strong>${formatDate(c.fecha)}</strong></td>
                                <td>${c.lugar_nombre}</td>
                                <td><small>${c.profesor_nombre || '-'}</small></td>
                                <td>${c.hora.substring(0, 5)} - ${c.hora_fin.substring(0, 5)}</td>
                                <td><small>$${parseFloat(c.costo_tarifa).toFixed(2)} / ${c.tipo_tarifa === 'por_hora' ? 'h' : 'clase'}</small></td>
                                <td><strong>$${isCancelled ? '0.00' : cost.toFixed(2)}</strong></td>
                                <td>
                                    ${isCancelled ? '<span class="badge badge-light">Cancelada</span>' : 
                                      (c.pago_profesor_realizado 
                                        ? `<span class="badge badge-success" title="Pagado el ${formatDate(c.fecha_pago_profesor)}">PAGADA</span>` 
                                        : '<span class="badge badge-warning">PENDIENTE</span>')}
                                </td>
                                <td>
                                    ${!isCancelled && !c.pago_profesor_realizado ? `
                                        <button class="btn btn-sm btn-success mark-paid-btn" data-id="${c.id}">Marcar Pagada</button>
                                    ` : (c.pago_profesor_realizado ? `
                                        <button class="btn btn-sm btn-outline-secondary unmark-paid-btn" data-id="${c.id}">Anular Pago</button>
                                    ` : '-')}
                                </td>
                            </tr>
                        `;}).join('')}
                    </tbody>
                </table>
            </div>
        `;

        content.querySelectorAll('.mark-paid-btn').forEach(btn => {
            btn.onclick = () => this.handleMarkPaid(parseInt(btn.dataset.id), true);
        });

        content.querySelectorAll('.unmark-paid-btn').forEach(btn => {
            btn.onclick = () => this.handleMarkPaid(parseInt(btn.dataset.id), false);
        });
    }

    async handleMarkPaid(id, isPaid) {
        if (isPaid) {
            const modal = this.container.querySelector('#pago-fecha-modal');
            this.container.querySelector('#pago-clase-id').value = id;
            this.container.querySelector('#input-fecha-pago').value = new Date().toISOString().split('T')[0];
            modal.style.display = 'block';
        } else {
            if (confirm('¿Desea anular el registro de pago de esta clase?')) {
                await this.submitPayment(id, false, null);
            }
        }
    }

    async submitPayment(id, isPaid, fecha) {
        try {
            await apiClient.put(`/asistencia/clases/${id}`, {
                pago_profesor_realizado: isPaid,
                fecha_pago_profesor: fecha
            });
            showSuccess(isPaid ? 'Clase marcada como pagada' : 'Pago anulado');
            await this.loadData();
        } catch (error) {
            displayApiError(error);
        }
    }
}

export default CostosPage;

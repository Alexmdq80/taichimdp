import { apiClient } from '../api/client.js';
import { displayApiError, showSuccess } from '../utils/errors.js';
import { formatDateReadable, formatDate } from '../utils/formatting.js';

export class SociosPage {
    constructor(container) {
        this.container = container;
        this.view = 'list'; // 'list', 'candidates', 'payments', 'my-socios'
        this.socios = [];
        this.mySocios = [];
        this.candidates = [];
        this.payments = [];
        this.selectedSocio = null;
        this.searchQuery = '';
        this.currentUserPracticante = null;
    }

    async render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1>Gestión de Socios</h1>
                <div class="actions">
                    <button id="view-list-btn" class="btn ${this.view === 'list' ? 'btn-primary' : 'btn-outline-primary'}">Listado de Socios</button>
                    <button id="view-candidates-btn" class="btn ${this.view === 'candidates' ? 'btn-primary' : 'btn-outline-primary'}">
                        Candidatos a Socio 
                        <span id="candidates-count" class="badge badge-light ml-1" style="display:none">0</span>
                    </button>
                    <button id="view-my-socios-btn" class="btn ${this.view === 'my-socios' ? 'btn-primary' : 'btn-outline-primary'}">Mis Membresías (Costos)</button>
                    ${this.view === 'payments' ? '<button id="view-payments-btn" class="btn btn-primary">Pagos de Cuota Social</button>' : ''}
                </div>
            </div>

            <div class="card mb-4" style="display: ${this.view === 'payments' || this.view === 'my-socios' ? 'none' : 'block'}">
                <div class="flex gap-2 items-center">
                    <input type="text" id="socio-search" placeholder="Buscar por nombre o número de socio..." class="form-control" style="max-width: 400px;" value="${this.searchQuery}">
                    <button id="search-btn" class="btn btn-secondary">Buscar</button>
                </div>
            </div>

            <div id="socios-content">
                <div class="loader text-center p-5">Cargando datos...</div>
            </div>

            <!-- Modal para registrar/editar socio -->
            <div id="socio-modal" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2 id="modal-title">Registrar Socio</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="socio-form">
                            <input type="hidden" id="socio-id">
                            <input type="hidden" id="practicante-id">
                            <input type="hidden" id="lugar-id">
                            
                            <div class="form-group">
                                <label><strong>Practicante:</strong></label>
                                <p id="display-practicante-nombre" class="form-control-plaintext"></p>
                            </div>
                            
                            <div class="form-group">
                                <label><strong>Lugar:</strong></label>
                                <p id="display-lugar-nombre" class="form-control-plaintext"></p>
                            </div>

                            <div class="form-group">
                                <label for="numero-socio">Número de Socio</label>
                                <input type="text" id="numero-socio" class="form-control" required placeholder="Ej: 1234/A">
                            </div>

                            <div class="form-actions mt-4">
                                <button type="submit" class="btn btn-primary">Guardar</button>
                                <button type="button" class="btn btn-secondary cancel-modal">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Modal para registrar pago de cuota social -->
            <div id="pago-socio-modal" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2 id="pago-modal-title">Registrar Pago de Cuota Social</h2>
                        <span class="close-pago-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="pago-socio-form">
                            <input type="hidden" id="pago-socio-id-input">
                            
                            <div class="form-group">
                                <label><strong>Socio:</strong></label>
                                <p id="pago-display-socio-nombre" class="form-control-plaintext"></p>
                            </div>

                            <div class="form-group">
                                <label for="pago-tipo-monto">Tipo de Cuota</label>
                                <select id="pago-tipo-monto" class="form-control">
                                    <option value="general">Cuota General</option>
                                    <option value="descuento">Cuota con Descuento (Bonificada)</option>
                                    <option value="manual">Monto Manual</option>
                                </select>
                            </div>

                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <label for="pago-monto">Monto a Cobrar</label>
                                    <input type="number" id="pago-monto" class="form-control" step="0.01" value="0.00">
                                </div>
                                <div class="form-group col-md-6">
                                    <label for="pago-fecha">Fecha de Pago</label>
                                    <input type="date" id="pago-fecha" class="form-control" required>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group col-md-4">
                                    <label for="pago-mes">Mes que Abona</label>
                                    <select id="pago-mes" class="form-control" required>
                                        <option value="Enero">Enero</option>
                                        <option value="Febrero">Febrero</option>
                                        <option value="Marzo">Marzo</option>
                                        <option value="Abril">Abril</option>
                                        <option value="Mayo">Mayo</option>
                                        <option value="Junio">Junio</option>
                                        <option value="Julio">Julio</option>
                                        <option value="Agosto">Agosto</option>
                                        <option value="Septiembre">Septiembre</option>
                                        <option value="Octubre">Octubre</option>
                                        <option value="Noviembre">Noviembre</option>
                                        <option value="Diciembre">Diciembre</option>
                                    </select>
                                </div>
                                <div class="form-group col-md-2">
                                    <label for="pago-anio">Año</label>
                                    <input type="number" id="pago-anio" class="form-control" required value="${new Date().getFullYear()}">
                                </div>
                                <div class="form-group col-md-6">
                                    <label for="pago-vencimiento">Próximo Vencimiento</label>
                                    <input type="date" id="pago-vencimiento" class="form-control" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="pago-observaciones">Observaciones</label>
                                <textarea id="pago-observaciones" class="form-control" rows="2"></textarea>
                            </div>

                            <div class="form-actions mt-4">
                                <button type="submit" class="btn btn-success">Registrar Pago</button>
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
        this.container.querySelector('#view-list-btn').addEventListener('click', () => {
            this.view = 'list';
            this.selectedSocio = null;
            this.render();
        });

        this.container.querySelector('#view-candidates-btn').addEventListener('click', () => {
            this.view = 'candidates';
            this.selectedSocio = null;
            this.render();
        });

        this.container.querySelector('#view-my-socios-btn').addEventListener('click', () => {
            this.view = 'my-socios';
            this.selectedSocio = null;
            this.render();
        });

        const searchBtn = this.container.querySelector('#search-btn');
        const searchInput = this.container.querySelector('#socio-search');

        if (searchBtn && searchInput) {
            const triggerSearch = () => {
                this.searchQuery = searchInput.value;
                this.loadData();
            };
            searchBtn.addEventListener('click', triggerSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') triggerSearch();
            });
        }

        // Socio Modal events
        const socioModal = this.container.querySelector('#socio-modal');
        this.container.querySelector('.close-modal').onclick = () => socioModal.style.display = 'none';
        this.container.querySelector('.cancel-modal').onclick = () => socioModal.style.display = 'none';
        this.container.querySelector('#socio-form').onsubmit = async (e) => {
            e.preventDefault();
            await this.handleSaveSocio();
        };

        // Pago Modal events
        const pagoModal = this.container.querySelector('#pago-socio-modal');
        this.container.querySelector('.close-pago-modal').onclick = () => pagoModal.style.display = 'none';
        this.container.querySelector('.cancel-pago-modal').onclick = () => pagoModal.style.display = 'none';
        this.container.querySelector('#pago-socio-form').onsubmit = async (e) => {
            e.preventDefault();
            await this.handleSavePago();
        };

        const tipoMontoSelect = this.container.querySelector('#pago-tipo-monto');
        if (tipoMontoSelect) {
            tipoMontoSelect.addEventListener('change', () => {
                const montoInput = this.container.querySelector('#pago-monto');
                if (tipoMontoSelect.value === 'general') {
                    montoInput.value = this.selectedSocio.cuota_social_general;
                    montoInput.readOnly = true;
                } else if (tipoMontoSelect.value === 'descuento') {
                    montoInput.value = this.selectedSocio.cuota_social_descuento;
                    montoInput.readOnly = true;
                } else {
                    montoInput.readOnly = false;
                }
            });
        }

        window.onclick = (event) => {
            if (event.target == socioModal) socioModal.style.display = 'none';
            if (event.target == pagoModal) pagoModal.style.display = 'none';
        };
    }

    async loadData() {
        const content = this.container.querySelector('#socios-content');
        try {
            if (this.view === 'list') {
                const response = await apiClient.get('/socios', { search: this.searchQuery });
                this.socios = response.data;
                this.renderList(content);
            } else if (this.view === 'candidates') {
                const response = await apiClient.get('/socios/candidates');
                this.candidates = response.data;
                this.renderCandidates(content);
            } else if (this.view === 'payments') {
                const response = await apiClient.get('/pagos-socios', { socio_id: this.selectedSocio.id });
                this.payments = response.data;
                this.renderPayments(content);
            } else if (this.view === 'my-socios') {
                await this.loadMySocios(content);
            }

            // Always update candidates count badge
            const candRes = await apiClient.get('/socios/candidates');
            const badge = this.container.querySelector('#candidates-count');
            if (badge) {
                badge.textContent = candRes.data.length;
                badge.style.display = candRes.data.length > 0 ? 'inline' : 'none';
            }
        } catch (error) {
            displayApiError(error, content);
        }
    }

    async loadMySocios(content) {
        try {
            // Identify the current user as a practicante using the dedicated endpoint
            if (!this.currentUserPracticante) {
                try {
                    const meRes = await apiClient.get('/practicantes/me');
                    this.currentUserPracticante = meRes.data;
                } catch (err) {
                    console.warn('Could not identify user via /me, falling back to token data');
                    // Fallback to old identification method just in case
                    const tokenData = this.getPayloadFromToken();
                    if (tokenData && tokenData.userId) {
                        const searchRes = await apiClient.get('/practicantes', { limit: 1000 });
                        this.currentUserPracticante = searchRes.data.find(p => p.user_id === tokenData.userId);
                    }
                }
            }

            if (!this.currentUserPracticante) {
                content.innerHTML = `
                    <div class="alert alert-warning">
                        <p>No se ha podido identificar su registro como practicante/profesor automáticamente.</p>
                        <p>Para gestionar sus membresías, debe estar registrado en la sección de <strong>"Practicantes"</strong> con su correo electrónico de usuario.</p>
                        <hr>
                        <button id="go-practicantes-btn" class="btn btn-primary">Ir a Practicantes para registrarme</button>
                    </div>
                `;
                this.container.querySelector('#go-practicantes-btn').onclick = () => {
                    import('../router.js').then(m => m.navigate('/practicantes'));
                };
                return;
            }

            // Get locations where the user teaches
            const teacherLugaresRes = await apiClient.get('/socios/my-teacher-lugares');
            const teacherLugares = teacherLugaresRes.data;

            // Get existing memberships for the user
            const mySociosRes = await apiClient.get('/socios', { practicante_id: this.currentUserPracticante.id });
            this.mySocios = mySociosRes.data;

            // Map teaching locations with their membership info
            const membershipData = teacherLugares.map(lugar => {
                const socio = this.mySocios.find(s => s.lugar_id === lugar.id);
                return { ...lugar, socio };
            });

            this.renderMySociosList(content, membershipData);
        } catch (error) {
            displayApiError(error, content);
        }
    }

    renderMySociosList(content, membershipData) {
        content.innerHTML = `
            <div class="card bg-dark text-white mb-4">
                <div class="card-body">
                    <h3 class="mb-0">Mis Membresías (Profesor / Socio)</h3>
                    <p class="mb-0 text-light">Lugares donde dicta clases y su estado de socio.</p>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Lugar (Sede)</th>
                            <th>Estado</th>
                            <th>Nº Socio</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${membershipData.length === 0 ? '<tr><td colspan="4" class="text-center p-4">No se han detectado clases dictadas por usted en ningún lugar todavía.</td></tr>' : ''}
                        ${membershipData.map(item => `
                            <tr>
                                <td><strong>${item.nombre}</strong></td>
                                <td>
                                    ${item.socio 
                                        ? '<span class="badge badge-success">Registrado</span>' 
                                        : '<span class="badge badge-warning">No Registrado</span>'}
                                </td>
                                <td>
                                    ${item.socio 
                                        ? `<span class="badge badge-info">${item.socio.numero_socio}</span>` 
                                        : '-'}
                                </td>
                                <td>
                                    ${item.socio 
                                        ? `<button class="btn btn-sm btn-success view-my-payments-btn" data-id="${item.socio.id}"><i class="fas fa-money-bill-wave"></i> Mis Pagos (Costos)</button>`
                                        : `<button class="btn btn-sm btn-primary register-me-socio-btn" 
                                            data-lugar-id="${item.id}" 
                                            data-lugar-nombre="${item.nombre}">
                                            Registrarme como Socio
                                           </button>`
                                    }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        content.querySelectorAll('.view-my-payments-btn').forEach(btn => {
            btn.onclick = () => {
                this.selectedSocio = this.mySocios.find(s => s.id === parseInt(btn.dataset.id));
                this.view = 'payments';
                this.isViewingCosts = true;
                this.render();
            };
        });

        content.querySelectorAll('.register-me-socio-btn').forEach(btn => {
            btn.onclick = () => {
                this.openRegisterSocioModal(
                    this.currentUserPracticante.id, 
                    this.currentUserPracticante.nombre_completo, 
                    parseInt(btn.dataset.lugarId), 
                    btn.dataset.lugarNombre
                );
            };
        });
    }

    getPayloadFromToken() {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    renderList(content) {
        if (this.socios.length === 0) {
            content.innerHTML = '<p class="text-center p-5 text-muted">No se encontraron socios registrados.</p>';
            return;
        }

        content.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Practicante</th>
                        <th>Lugar</th>
                        <th>Nº Socio</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.socios.map(s => `
                        <tr>
                            <td><strong>${s.nombre_completo}</strong></td>
                            <td>${s.lugar_nombre}</td>
                            <td><span class="badge badge-info">${s.numero_socio}</span></td>
                            <td>
                                <button class="btn btn-sm btn-success view-payments-btn" data-id="${s.id}"><i class="fas fa-money-bill-wave"></i> Cuotas</button>
                                <button class="btn btn-sm btn-outline-primary edit-socio-btn" data-id="${s.id}">Editar</button>
                                <button class="btn btn-sm btn-outline-danger delete-socio-btn" data-id="${s.id}">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        content.querySelectorAll('.view-payments-btn').forEach(btn => {
            btn.onclick = () => {
                this.selectedSocio = this.socios.find(s => s.id === parseInt(btn.dataset.id));
                this.view = 'payments';
                this.render();
            };
        });

        content.querySelectorAll('.edit-socio-btn').forEach(btn => {
            btn.onclick = () => this.openEditSocioModal(parseInt(btn.dataset.id));
        });

        content.querySelectorAll('.delete-socio-btn').forEach(btn => {
            btn.onclick = () => this.handleDeleteSocio(parseInt(btn.dataset.id));
        });
    }

    renderCandidates(content) {
        if (this.candidates.length === 0) {
            content.innerHTML = '<p class="text-center p-5 text-muted">No hay candidatos pendientes.</p>';
            return;
        }

        content.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> Los siguientes practicantes tienen abonos activos en sedes que requieren cuota social.
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Practicante</th>
                        <th>Sede / Institución</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.candidates.map(c => `
                        <tr>
                            <td><strong>${c.nombre_completo}</strong></td>
                            <td>${c.real_lugar_nombre}</td>
                            <td>
                                <button class="btn btn-sm btn-success register-socio-btn" 
                                    data-practicante-id="${c.practicante_id}"
                                    data-practicante-nombre="${c.nombre_completo}"
                                    data-lugar-id="${c.real_lugar_id}"
                                    data-lugar-nombre="${c.real_lugar_nombre}">
                                    Registrar Nº Socio
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        content.querySelectorAll('.register-socio-btn').forEach(btn => {
            btn.onclick = () => {
                const d = btn.dataset;
                this.openRegisterSocioModal(parseInt(d.practicanteId), d.practicanteNombre, parseInt(d.lugarId), d.lugarNombre);
            };
        });
    }

    renderPayments(content) {
        const isCost = !!this.isViewingCosts;
        
        content.innerHTML = `
            <div class="card mb-4 ${isCost ? 'bg-dark text-white' : 'bg-light'}">
                <div class="flex justify-between items-center">
                    <div>
                        <h3>${isCost ? 'Mis Cuotas Sociales (Costo)' : 'Historial de Cuotas Sociales'}</h3>
                        <p class="${isCost ? 'text-light' : ''}"><strong>Socio:</strong> ${this.selectedSocio.nombre_completo} | <strong>Lugar:</strong> ${this.selectedSocio.lugar_nombre} | <strong>Nº:</strong> ${this.selectedSocio.numero_socio}</p>
                    </div>
                    <div>
                        <button id="add-pago-btn" class="btn btn-success">Registrar Nueva Cuota</button>
                        ${isCost ? '<button id="back-to-my-socios" class="btn btn-outline-light ml-2">Volver a mis membresías</button>' : ''}
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Fecha Pago</th>
                            <th>Mes Abonado</th>
                            <th>Monto</th>
                            <th>Vencimiento</th>
                            <th>Tipo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.payments.length === 0 ? '<tr><td colspan="6" class="text-center p-4 text-muted">No hay cuotas registradas.</td></tr>' : ''}
                        ${this.payments.map(p => `
                            <tr>
                                <td>${formatDateReadable(p.fecha_pago)}</td>
                                <td><strong>${p.mes_abono}</strong></td>
                                <td>$${parseFloat(p.monto).toFixed(2)}</td>
                                <td class="${new Date(p.fecha_vencimiento) < new Date() ? 'text-danger font-weight-bold' : ''}">
                                    ${formatDateReadable(p.fecha_vencimiento)}
                                </td>
                                <td><span class="badge ${p.es_costo ? 'badge-danger' : 'badge-secondary'}">${p.es_costo ? 'Costo' : 'Registro'}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-danger delete-pago-btn" data-id="${p.id}">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        this.container.querySelector('#add-pago-btn').onclick = () => this.openAddPagoModal();
        if (isCost) {
            this.container.querySelector('#back-to-my-socios').onclick = () => {
                this.view = 'my-socios';
                this.isViewingCosts = false;
                this.render();
            };
        }
        content.querySelectorAll('.delete-pago-btn').forEach(btn => {
            btn.onclick = () => this.handleDeletePago(parseInt(btn.dataset.id));
        });
    }

    // Socio Modal Handlers
    openRegisterSocioModal(practicanteId, practicanteNombre, lugarId, lugarNombre) {
        const modal = this.container.querySelector('#socio-modal');
        this.container.querySelector('#modal-title').textContent = 'Registrar Socio';
        this.container.querySelector('#socio-id').value = '';
        this.container.querySelector('#practicante-id').value = practicanteId;
        this.container.querySelector('#lugar-id').value = lugarId;
        this.container.querySelector('#display-practicante-nombre').textContent = practicanteNombre;
        this.container.querySelector('#display-lugar-nombre').textContent = lugarNombre;
        this.container.querySelector('#numero-socio').value = '';
        modal.style.display = 'block';
    }

    openEditSocioModal(socioId) {
        const socio = this.socios.find(s => s.id === socioId);
        if (!socio) return;
        const modal = this.container.querySelector('#socio-modal');
        this.container.querySelector('#modal-title').textContent = 'Editar Socio';
        this.container.querySelector('#socio-id').value = socio.id;
        this.container.querySelector('#practicante-id').value = socio.practicante_id;
        this.container.querySelector('#lugar-id').value = socio.lugar_id;
        this.container.querySelector('#display-practicante-nombre').textContent = socio.nombre_completo;
        this.container.querySelector('#display-lugar-nombre').textContent = socio.lugar_nombre;
        this.container.querySelector('#numero-socio').value = socio.numero_socio;
        modal.style.display = 'block';
    }

    async handleSaveSocio() {
        const id = this.container.querySelector('#socio-id').value;
        const data = {
            practicante_id: parseInt(this.container.querySelector('#practicante-id').value),
            lugar_id: parseInt(this.container.querySelector('#lugar-id').value),
            numero_socio: this.container.querySelector('#numero-socio').value
        };
        try {
            if (id) {
                await apiClient.put(`/socios/${id}`, data);
                showSuccess('Socio actualizado');
            } else {
                await apiClient.post('/socios', data);
                showSuccess('Socio registrado');
            }
            this.container.querySelector('#socio-modal').style.display = 'none';
            await this.loadData();
        } catch (error) { displayApiError(error); }
    }

    async handleDeleteSocio(id) {
        if (!confirm('¿Eliminar socio? Se perderá el historial de cuotas.')) return;
        try {
            await apiClient.delete(`/socios/${id}`);
            showSuccess('Socio eliminado');
            await this.loadData();
        } catch (error) { displayApiError(error); }
    }

    // Pago Modal Handlers
    openAddPagoModal() {
        const modal = this.container.querySelector('#pago-socio-modal');
        this.container.querySelector('#pago-modal-title').textContent = 'Registrar Pago de Cuota Social';
        this.container.querySelector('#pago-display-socio-nombre').textContent = `${this.selectedSocio.nombre_completo} (${this.selectedSocio.lugar_nombre})`;
        
        // Initialize amount selection
        const tipoMontoSelect = this.container.querySelector('#pago-tipo-monto');
        const montoInput = this.container.querySelector('#pago-monto');
        
        // Default to discount if it's > 0, otherwise general
        if (this.selectedSocio.cuota_social_descuento > 0) {
            tipoMontoSelect.value = 'descuento';
            montoInput.value = this.selectedSocio.cuota_social_descuento;
        } else {
            tipoMontoSelect.value = 'general';
            montoInput.value = this.selectedSocio.cuota_social_general;
        }
        montoInput.readOnly = true;

        // Default values
        const today = new Date();
        this.container.querySelector('#pago-fecha').value = formatDate(today);
        
        // Suggest month and next vencimiento
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        this.container.querySelector('#pago-mes').value = months[today.getMonth()];
        this.container.querySelector('#pago-anio').value = today.getFullYear();
        
        let suggestedVenc = new Date(today.getFullYear(), today.getMonth() + 1, 10); // Sugerir el 10 del mes que viene

        if (this.payments.length > 0) {
            const lastPago = this.payments[0];
            const lastVenc = new Date(lastPago.fecha_vencimiento);
            suggestedVenc = new Date(lastVenc.getFullYear(), lastVenc.getMonth() + 1, lastVenc.getDate());
        }

        this.container.querySelector('#pago-vencimiento').value = formatDate(suggestedVenc);
        this.container.querySelector('#pago-observaciones').value = "";
        
        modal.style.display = 'block';
    }

    async handleSavePago() {
        const mes = this.container.querySelector('#pago-mes').value;
        const anio = this.container.querySelector('#pago-anio').value;
        
        const data = {
            socio_id: this.selectedSocio.id,
            monto: parseFloat(this.container.querySelector('#pago-monto').value),
            fecha_pago: this.container.querySelector('#pago-fecha').value,
            mes_abono: `${mes} ${anio}`,
            fecha_vencimiento: this.container.querySelector('#pago-vencimiento').value,
            observaciones: this.container.querySelector('#pago-observaciones').value,
            es_costo: !!this.isViewingCosts
        };

        try {
            await apiClient.post('/pagos-socios', data);
            showSuccess('Pago de cuota registrado');
            this.container.querySelector('#pago-socio-modal').style.display = 'none';
            await this.loadData();
        } catch (error) {
            displayApiError(error);
        }
    }

    async handleDeletePago(id) {
        if (!confirm('¿Está seguro de que desea eliminar este registro de pago?')) return;
        try {
            await apiClient.delete(`/pagos-socios/${id}`);
            showSuccess('Registro de pago eliminado');
            await this.loadData();
        } catch (error) {
            displayApiError(error);
        }
    }
}

export default SociosPage;

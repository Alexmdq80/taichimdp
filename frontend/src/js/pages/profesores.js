import { apiClient } from '../api/client.js';
import { displayApiError, showSuccess } from '../utils/errors.js';
import { navigate } from '../router.js';

export class ProfesoresPage {
    constructor(container) {
        this.container = container;
        this.profesores = [];
        this.allPracticantes = [];
        this.allUsers = [];
    }

    async render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1>Gestión de Profesores</h1>
                <div class="actions">
                    <button id="add-profesor-btn" class="btn btn-primary">Promover Practicante a Profesor</button>
                </div>
            </div>

            <div id="profesores-content">
                <div class="loader text-center p-5">Cargando datos...</div>
            </div>

            <!-- Modal para promover/linkear profesor -->
            <div id="profesor-modal" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>Promover a Profesor</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="profesor-form">
                            <div class="form-group">
                                <label for="select-practicante">Seleccionar Practicante</label>
                                <select id="select-practicante" class="form-control" required>
                                    <option value="">-- Seleccionar --</option>
                                </select>
                                <small class="text-muted">Solo practicantes que aún no son profesores.</small>
                            </div>

                            <div class="form-group">
                                <label for="select-user">Vincular con Usuario (Opcional)</label>
                                <select id="select-user" class="form-control">
                                    <option value="">-- No vincular --</option>
                                </select>
                                <small class="text-muted">Permite al profesor gestionar sus membresías y clases.</small>
                            </div>

                            <div class="form-actions mt-4">
                                <button type="submit" class="btn btn-primary">Promover</button>
                                <button type="button" class="btn btn-secondary cancel-modal">Cancelar</button>
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
        this.container.querySelector('#add-profesor-btn').onclick = () => this.openAddModal();
        
        const modal = this.container.querySelector('#profesor-modal');
        this.container.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
        this.container.querySelector('.cancel-modal').onclick = () => modal.style.display = 'none';
        
        this.container.querySelector('#profesor-form').onsubmit = async (e) => {
            e.preventDefault();
            await this.handlePromote();
        };

        window.onclick = (event) => {
            if (event.target == modal) modal.style.display = 'none';
        };
    }

    async loadData() {
        const content = this.container.querySelector('#profesores-content');
        try {
            const [profRes, usersRes, allPractRes] = await Promise.all([
                apiClient.get('/practicantes', { es_profesor: true, limit: 100 }),
                apiClient.get('/users'),
                apiClient.get('/practicantes', { limit: 1000 })
            ]);

            this.profesores = profRes.data;
            this.allUsers = usersRes.data;
            this.allPracticantes = allPractRes.data;

            this.renderList(content);
        } catch (error) {
            displayApiError(error, content);
        }
    }

    renderList(content) {
        if (this.profesores.length === 0) {
            content.innerHTML = '<p class="text-center p-5 text-muted">No hay profesores registrados todavía.</p>';
            return;
        }

        content.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Usuario Vinculado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.profesores.map(p => {
                        const linkedUser = this.allUsers.find(u => u.id === p.user_id);
                        return `
                        <tr>
                            <td><strong>${p.nombre_completo}</strong></td>
                            <td>${p.email || '-'}</td>
                            <td>${linkedUser ? `<span class="badge badge-info">${linkedUser.email}</span>` : '<span class="text-muted">No vinculado</span>'}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary view-socios-btn" data-id="${p.id}">Membresías</button>
                                <button class="btn btn-sm btn-outline-danger remove-profesor-btn" data-id="${p.id}">Quitar Rango</button>
                            </td>
                        </tr>
                    `;}).join('')}
                </tbody>
            </table>
        `;

        content.querySelectorAll('.view-socios-btn').forEach(btn => {
            btn.onclick = () => {
                // Navigate to Socios page, maybe we can filter it?
                // For now just go to Socios
                navigate('/socios');
            };
        });

        content.querySelectorAll('.remove-profesor-btn').forEach(btn => {
            btn.onclick = () => this.handleRemoveRange(parseInt(btn.dataset.id));
        });
    }

    openAddModal() {
        const modal = this.container.querySelector('#profesor-modal');
        const practSelect = this.container.querySelector('#select-practicante');
        const userSelect = this.container.querySelector('#select-user');

        // Fill practicantes (those who are NOT teachers)
        practSelect.innerHTML = '<option value="">-- Seleccionar --</option>' + 
            this.allPracticantes
                .filter(p => !p.es_profesor)
                .map(p => `<option value="${p.id}">${p.nombre_completo}</option>`)
                .join('');

        // Fill users
        userSelect.innerHTML = '<option value="">-- No vincular --</option>' + 
            this.allUsers.map(u => `<option value="${u.id}">${u.email}</option>`).join('');

        modal.style.display = 'block';
    }

    async handlePromote() {
        const practId = this.container.querySelector('#select-practicante').value;
        const userId = this.container.querySelector('#select-user').value;

        if (!practId) return;

        try {
            await apiClient.put(`/practicantes/${practId}`, {
                es_profesor: true,
                user_id: userId ? parseInt(userId) : null
            });
            showSuccess('Practicante promovido a Profesor');
            this.container.querySelector('#profesor-modal').style.display = 'none';
            await this.loadData();
        } catch (error) {
            displayApiError(error);
        }
    }

    async handleRemoveRange(id) {
        if (!confirm('¿Desea quitar el rango de Profesor a este practicante? No se eliminarán sus datos personales.')) return;
        try {
            await apiClient.put(`/practicantes/${id}`, {
                es_profesor: false,
                user_id: null
            });
            showSuccess('Rango de Profesor quitado');
            await this.loadData();
        } catch (error) {
            displayApiError(error);
        }
    }
}

export default ProfesoresPage;

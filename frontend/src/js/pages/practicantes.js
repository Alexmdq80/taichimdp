/**
 * Practicantes Page
 * Main page for managing practicantes
 */

import PracticanteForm from '../components/PracticanteForm.js';
import PracticanteList from '../components/PracticanteList.js';
import PracticanteDetail from '../components/PracticanteDetail.js';
import { showSuccess } from '../utils/errors.js';

export class PracticantesPage {
    constructor(container) {
        this.container = container;
        this.currentView = 'list'; // 'list', 'form', 'detail'
        this.selectedPracticante = null;
    }

    render() {
        this.container.innerHTML = `
      <div id="practicantes-page">
        <div id="practicantes-header" class="flex justify-between items-center" style="margin-bottom: 2rem;">
          <h1>Gestión de Practicantes</h1>
          <button id="new-practicante-btn" class="btn">+ Nuevo Practicante</button>
        </div>
        
        <div id="practicantes-content">
          <!-- Content will be dynamically loaded -->
        </div>
      </div>
    `;

        this.attachEvents();
        this.showList();
    }

    attachEvents() {
        const newBtn = this.container.querySelector('#new-practicante-btn');
        newBtn.addEventListener('click', () => {
            this.showForm();
        });
    }

    showList() {
        this.currentView = 'list';
        const content = this.container.querySelector('#practicantes-content');

        content.innerHTML = '<div id="list-container"></div><div id="detail-container" style="margin-top: 2rem;"></div>';

        const listContainer = content.querySelector('#list-container');
        const detailContainer = content.querySelector('#detail-container');

        const list = new PracticanteList(listContainer, {
            onSelect: (practicante) => {
                this.selectedPracticante = practicante;
                const detail = new PracticanteDetail(detailContainer, {
                    onEdit: (p) => this.showForm(p),
                    onClose: () => {
                        this.selectedPracticante = null;
                        detail.render(null);
                    }
                });
                detail.render(practicante);
            },
            onEdit: (practicante) => {
                this.showForm(practicante);
            },
            onDelete: () => {
                this.selectedPracticante = null;
                if (detailContainer) {
                    detailContainer.innerHTML = '';
                }
            }
        });

        list.render();
    }

    showForm(practicante = null) {
        this.currentView = 'form';
        const content = this.container.querySelector('#practicantes-content');

        content.innerHTML = '<div id="form-container"></div>';
        const formContainer = content.querySelector('#form-container');

        const form = new PracticanteForm(formContainer, {
            practicante: practicante,
            onSuccess: (data) => {
                const message = practicante
                    ? 'Practicante actualizado correctamente'
                    : 'Practicante creado correctamente';
                showSuccess(message, this.container);
                this.showList();
            },
            onCancel: () => {
                this.showList();
            }
        });

        form.render();
    }

    showDetail(practicante) {
        this.currentView = 'detail';
        const content = this.container.querySelector('#practicantes-content');

        content.innerHTML = '<div id="detail-container"></div>';
        const detailContainer = content.querySelector('#detail-container');

        const detail = new PracticanteDetail(detailContainer, {
            onEdit: (p) => this.showForm(p),
            onClose: () => {
                this.showList();
            }
        });

        detail.render(practicante);
    }
}

export default PracticantesPage;

/**
 * Practicantes Page
 * Main page for managing practicantes
 */

import PracticanteForm from '../components/PracticanteForm.js';
import PracticanteList from '../components/PracticanteList.js';
import PracticanteDetail from '../components/PracticanteDetail.js';
import PracticanteHistory from '../components/PracticanteHistory.js';
import { showSuccess, displayApiError } from '../utils/errors.js'; // Import displayApiError for error handling
import { practicanteApi } from '../api/client.js'; // Import practicanteApi to fetch individual practicante

export class PracticantesPage {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            initialPracticanteId: options.initialPracticanteId || null,
            openPaymentModalInitially: options.openPaymentModalInitially || false,
        };
        this.currentView = 'list'; // 'list', 'form', 'detail', 'history'
        this.selectedPracticante = null;
    }

    async render() {
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

        if (this.options.initialPracticanteId) {
            await this.loadAndShowPracticanteDetail(this.options.initialPracticanteId, this.options.openPaymentModalInitially);
        } else {
            this.showList();
        }
    }

    attachEvents() {
        const newBtn = this.container.querySelector('#new-practicante-btn');
        newBtn.addEventListener('click', () => {
            this.showForm();
        });
    }

    async loadAndShowPracticanteDetail(practicanteId, openPaymentModal = false) {
        try {
            const response = await practicanteApi.getById(practicanteId);
            this.selectedPracticante = response.data;
            if (this.selectedPracticante) {
                this.showDetail(this.selectedPracticante, openPaymentModal);
            } else {
                displayApiError({ message: 'Practicante no encontrado.' }, this.container);
                this.showList(); // Fallback to list
            }
        } catch (error) {
            console.error('Error loading practicante detail:', error);
            displayApiError(error, this.container);
            this.showList(); // Fallback to list on error
        }
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
                this.showDetail(practicante);
            },
            onEdit: (practicante) => {
                this.showForm(practicante);
            },
            onDelete: () => {
                this.selectedPracticante = null;
                if (detailContainer) {
                    detailContainer.innerHTML = '';
                }
            },
            onPayAbono: (practicante) => { // Handle onPayAbono event
                this.selectedPracticante = practicante;
                this.showDetail(practicante, true); // Pass true to open payment modal
            },
            onShowHistory: (practicante) => {
                this.showHistory(practicante);
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

    showDetail(practicante, openPaymentModal = false) { // Added openPaymentModal parameter
        this.currentView = 'detail';
        const content = this.container.querySelector('#practicantes-content');

        content.innerHTML = '<div id="detail-container"></div>';
        const detailContainer = content.querySelector('#detail-container');

        const detail = new PracticanteDetail(detailContainer, {
            onEdit: (p) => this.showForm(p),
            onClose: () => {
                this.showList();
            },
            openPaymentModal: openPaymentModal // Pass the parameter to PracticanteDetail
        });

        detail.render(practicante);
    }

    showHistory(practicante) {
        this.currentView = 'history';
        const content = this.container.querySelector('#practicantes-content');

        content.innerHTML = '<div id="history-container"></div>';
        const historyContainer = content.querySelector('#history-container');

        const history = new PracticanteHistory(historyContainer, {
            practicante: practicante,
            onClose: () => {
                this.showList();
            }
        });

        history.render();
    }
}

export default PracticantesPage;

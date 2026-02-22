/**
 * TiposAbono Page
 * Main page for managing tipos de abono
 */

import TipoAbonoForm from '../components/TipoAbonoForm.js';
import TipoAbonoList from '../components/TipoAbonoList.js';
import TipoAbonoHistory from '../components/TipoAbonoHistory.js';
import { showSuccess } from '../utils/errors.js';

export class TiposAbonoPage {
    constructor(container) {
        this.container = container;
        this.currentView = 'list'; // 'list', 'form', 'history'
        this.selectedTipoAbono = null;
    }

    async render() {
        // Load the HTML content for the tipos de abono page
        const response = await fetch('/src/pages/tiposAbono.html');
        this.container.innerHTML = await response.text();

        this.attachEvents();
        this.showList();
    }

    attachEvents() {
        const newBtn = this.container.querySelector('#new-tipo-abono-btn');
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                this.showForm();
            });
        }
    }

    showList() {
        this.currentView = 'list';
        const content = this.container.querySelector('#tipos-abono-content');
        if (content) {
            content.innerHTML = '<div id="list-container"></div>';
            const listContainer = content.querySelector('#list-container');
            const list = new TipoAbonoList(listContainer, {
                onEdit: (tipoAbono) => {
                    this.showForm(tipoAbono);
                },
                onShowHistory: (tipoAbono) => {
                    this.showHistory(tipoAbono);
                }
            });
            list.render();
        }
    }

    showForm(tipoAbono = null) {
        this.currentView = 'form';
        const content = this.container.querySelector('#tipos-abono-content');
        if (content) {
            content.innerHTML = '<div id="form-container"></div>';
            const formContainer = content.querySelector('#form-container');
            const form = new TipoAbonoForm(formContainer, {
                tipoAbono: tipoAbono,
                onSuccess: (data) => {
                    const message = tipoAbono
                        ? 'Tipo de abono actualizado correctamente'
                        : 'Tipo de abono creado correctamente';
                    showSuccess(message, this.container);
                    this.showList();
                },
                onCancel: () => {
                    this.showList();
                }
            });
            form.render();
        }
    }

    showHistory(tipoAbono) {
        this.currentView = 'history';
        const content = this.container.querySelector('#tipos-abono-content');
        if (content) {
            content.innerHTML = '<div id="history-container"></div>';
            const historyContainer = content.querySelector('#history-container');
            const history = new TipoAbonoHistory(historyContainer, {
                tipoAbono: tipoAbono,
                onClose: () => {
                    this.showList();
                }
            });
            history.render();
        }
    }
}

export default TiposAbonoPage;

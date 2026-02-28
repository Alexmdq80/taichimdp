/**
 * Actividades Page
 * Main page for managing activities
 */

import { ActividadList } from '../components/ActividadList.js';
import { ActividadForm } from '../components/ActividadForm.js';
import { ActividadHistory } from '../components/ActividadHistory.js';

export class ActividadesPage {
  constructor(container) {
    this.container = container;
    this.currentView = 'list'; // 'list', 'form' or 'history'
    this.selectedActividad = null;
  }

  render() {
    this.container.innerHTML = `
      <div id="actividades-page-header" class="flex justify-between items-center" style="margin-bottom: 2rem;">
        <h1>Gestión de Actividades</h1>
        <button id="add-actividad-btn" class="btn btn-primary" style="display: ${this.currentView === 'list' ? 'block' : 'none'};">
          Nueva Actividad
        </button>
      </div>
      <div id="actividades-content"></div>
    `;

    this.attachEvents();
    this.renderContent();
  }

  attachEvents() {
    const addBtn = this.container.querySelector('#add-actividad-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.currentView = 'form';
        this.selectedActividad = null;
        this.render();
      });
    }
  }

  renderContent() {
    const content = this.container.querySelector('#actividades-content');
    if (this.currentView === 'list') {
      const list = new ActividadList(content, {
        onEdit: (actividad) => {
          this.selectedActividad = actividad;
          this.currentView = 'form';
          this.render();
        },
        onShowHistory: (actividad) => {
          this.selectedActividad = actividad;
          this.currentView = 'history';
          this.render();
        }
      });
      list.render();
    } else if (this.currentView === 'form') {
      const form = new ActividadForm(content, {
        actividad: this.selectedActividad,
        onSuccess: () => {
          this.currentView = 'list';
          this.render();
        },
        onCancel: () => {
          this.currentView = 'list';
          this.render();
        }
      });
      form.render();
    } else if (this.currentView === 'history') {
      const history = new ActividadHistory(content, {
        actividad: this.selectedActividad,
        onClose: () => {
          this.currentView = 'list';
          this.render();
        }
      });
      history.render();
    }
  }
}

export default ActividadesPage;

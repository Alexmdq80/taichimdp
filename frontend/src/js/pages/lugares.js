/**
 * Lugares Page
 * Main page for managing class locations
 */

import { LugarList } from '../components/LugarList.js';
import { LugarForm } from '../components/LugarForm.js';
import { LugarHistory } from '../components/LugarHistory.js';

export class LugaresPage {
  constructor(container) {
    this.container = container;
    this.currentView = 'list'; // 'list', 'form' or 'history'
    this.selectedLugar = null;
  }

  render() {
    this.container.innerHTML = `
      <div id="lugares-page-header" class="flex justify-between items-center" style="margin-bottom: 2rem;">
        <h1>Gestión de Lugares</h1>
        <button id="add-lugar-btn" class="btn btn-primary" style="display: ${this.currentView === 'list' ? 'block' : 'none'};">
          Nuevo Lugar
        </button>
      </div>
      <div id="lugares-content"></div>
    `;

    this.attachEvents();
    this.renderContent();
  }

  attachEvents() {
    const addBtn = this.container.querySelector('#add-lugar-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.currentView = 'form';
        this.selectedLugar = null;
        this.render();
      });
    }
  }

  renderContent() {
    const content = this.container.querySelector('#lugares-content');
    if (this.currentView === 'list') {
      const list = new LugarList(content, {
        onEdit: (lugar) => {
          this.selectedLugar = lugar;
          this.currentView = 'form';
          this.render();
        },
        onShowHistory: (lugar) => {
          this.selectedLugar = lugar;
          this.currentView = 'history';
          this.render();
        }
      });
      list.render();
    } else if (this.currentView === 'form') {
      const form = new LugarForm(content, {
        lugar: this.selectedLugar,
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
      const history = new LugarHistory(content, {
        lugar: this.selectedLugar,
        onClose: () => {
          this.currentView = 'list';
          this.render();
        }
      });
      history.render();
    }
  }
}

export default LugaresPage;

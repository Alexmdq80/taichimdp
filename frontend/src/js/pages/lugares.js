/**
 * Lugares Page
 * Main page for managing class locations
 */

import { LugarList } from '../components/LugarList.js';
import { LugarForm } from '../components/LugarForm.js';

export class LugaresPage {
  constructor(container) {
    this.container = container;
    this.currentView = 'list'; // 'list' or 'form'
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
        }
      });
      list.render();
    } else {
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
    }
  }
}

export default LugaresPage;

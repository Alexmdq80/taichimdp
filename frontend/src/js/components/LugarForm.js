/**
 * LugarForm Component
 */

import { makeRequest } from '../api/client.js';
import { displayApiError } from '../utils/errors.js';

export class LugarForm {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      lugar: options.lugar || null,
      onSuccess: options.onSuccess || (() => {}),
      onCancel: options.onCancel || (() => {})
    };
    this.isEditing = !!this.options.lugar;
    this.lugares = [];
  }

  async render() {
    const lugar = this.options.lugar || {};
    
    // Fetch all lugares for parent selection
    try {
      const response = await makeRequest('/lugares', 'GET', null, true);
      this.lugares = response.data || [];
    } catch (error) {
      console.error('Error fetching lugares for parent selection:', error);
    }

    this.container.innerHTML = `
      <form id="lugar-form" class="card">
        <div class="form-group">
          <label for="lugar-nombre">Nombre *</label>
          <input type="text" id="lugar-nombre" name="nombre" value="${lugar.nombre || ''}" required placeholder="Ej: Club Mitre o Salón A" />
        </div>

        <div class="form-group">
          <label for="parent_id">Depende de (Sede/Club)</label>
          <select id="parent_id" name="parent_id">
            <option value="">-- Es una Sede Principal --</option>
            ${this.lugares
              .filter(l => l.id !== (lugar.id || -1) && !l.parent_id) // No puede ser su propio padre y solo mostramos sedes
              .map(l => `
                <option value="${l.id}" ${lugar.parent_id == l.id ? 'selected' : ''}>${l.nombre}</option>
              `).join('')}
          </select>
          <small class="text-muted">Si es un salón, elige el club al que pertenece.</small>
        </div>

        <div class="form-group">
          <label for="lugar-direccion">Dirección</label>
          <textarea id="lugar-direccion" name="direccion" placeholder="Si se deja vacío, se heredará del club/sede">${lugar.direccion || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="flex items-center gap-2 cursor-pointer" style="display: flex; align-items: center; gap: 0.5rem; width: fit-content;">
            <input type="checkbox" name="activo" ${lugar.activo !== false ? 'checked' : ''} style="width: auto; margin: 0;" />
            <span>Activo</span>
          </label>
          <div id="parent-inactive-warning" style="display: ${lugar.parent_id && lugar.parent_activo === false ? 'block' : 'none'}; color: red; font-size: 0.85rem; margin-top: 0.5rem;">
            ¡La sede principal está inactiva! Este lugar no estará operativo aunque esté marcado como activo.
          </div>
        </div>

        <div id="cuota-social-card" class="card" style="margin-bottom: 1rem; border: 1px solid #ddd; padding: 1rem;">
          <h3 style="margin-top: 0; font-size: 1rem;">Configuración de Cuota Social</h3>
          <div class="form-group">
            <label class="flex items-center gap-2 cursor-pointer" style="display: flex; align-items: center; gap: 0.5rem; width: fit-content;">
              <input type="checkbox" id="cobra_cuota_social" name="cobra_cuota_social" ${lugar.cobra_cuota_social ? 'checked' : ''} style="width: auto; margin: 0;" />
              <span>¿Este lugar cobra cuota social?</span>
            </label>
          </div>
          
          <div id="cuota-social-details" style="display: ${lugar.cobra_cuota_social ? 'block' : 'none'};">
            <div class="form-group">
              <label for="cuota_social_general">Valor Cuota General ($)</label>
              <input type="number" step="0.01" id="cuota_social_general" name="cuota_social_general" value="${lugar.cuota_social_general || '0.00'}" />
            </div>
            <div class="form-group">
              <label for="cuota_social_descuento">Valor Cuota con Descuento ($)</label>
              <input type="number" step="0.01" id="cuota_social_descuento" name="cuota_social_descuento" value="${lugar.cuota_social_descuento || '0.00'}" />
            </div>
          </div>
        </div>

        <div id="tarifa-card" class="card" style="margin-bottom: 1rem; border: 1px solid #ddd; padding: 1rem; display: none;">
          <h3 style="margin-top: 0; font-size: 1rem;">Tarifa del Lugar (Costo)</h3>
          <div class="form-group">
            <label for="costo_tarifa">Monto de Tarifa ($)</label>
            <input type="number" step="0.01" id="costo_tarifa" name="costo_tarifa" value="${lugar.costo_tarifa || '0.00'}" />
          </div>
          <div class="form-group">
            <label for="tipo_tarifa">Tipo de Tarifa</label>
            <select id="tipo_tarifa" name="tipo_tarifa">
              <option value="por_hora" ${lugar.tipo_tarifa === 'por_hora' ? 'selected' : ''}>Por Hora</option>
              <option value="mensual" ${lugar.tipo_tarifa === 'mensual' ? 'selected' : ''}>Mensual</option>
            </select>
          </div>
        </div>

        <div class="flex gap-2">
          <button type="submit" class="btn btn-primary">${this.isEditing ? 'Actualizar' : 'Guardar'}</button>
          <button type="button" id="cancel-lugar-btn" class="btn btn-secondary">Cancelar</button>
        </div>
        <div id="lugar-form-error"></div>
      </form>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const form = this.container.querySelector('#lugar-form');
    const cobraCuotaSocialCheckbox = form.querySelector('#cobra_cuota_social');
    const cuotaSocialDetails = form.querySelector('#cuota-social-details');
    const parentIdSelect = form.querySelector('#parent_id');
    const cuotaSocialCard = form.querySelector('#cuota-social-card');
    const tarifaCard = form.querySelector('#tarifa-card');
    const parentWarning = form.querySelector('#parent-inactive-warning');

    // Logic to show/hide cards based on Sede vs Salon
    const updateVisibility = () => {
      const selectedParentId = parentIdSelect.value;
      const isSubLugar = !!selectedParentId;
      
      if (isSubLugar) {
        cuotaSocialCard.style.display = 'none';
        tarifaCard.style.display = 'block';
        
        // Update parent active warning dynamically
        const selectedParent = this.lugares.find(l => l.id == selectedParentId);
        if (selectedParent && selectedParent.activo === false) {
          parentWarning.style.display = 'block';
        } else {
          parentWarning.style.display = 'none';
        }
      } else {
        cuotaSocialCard.style.display = 'block';
        tarifaCard.style.display = 'none';
        parentWarning.style.display = 'none';
      }
    };

    parentIdSelect.addEventListener('change', updateVisibility);
    updateVisibility(); // Initial state

    // Toggle visibility of fee details
    cobraCuotaSocialCheckbox.addEventListener('change', () => {
      cuotaSocialDetails.style.display = cobraCuotaSocialCheckbox.checked ? 'block' : 'none';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        nombre: formData.get('nombre'),
        direccion: formData.get('direccion'),
        activo: formData.get('activo') === 'on',
        cobra_cuota_social: formData.get('cobra_cuota_social') === 'on',
        cuota_social_general: parseFloat(formData.get('cuota_social_general') || 0),
        cuota_social_descuento: parseFloat(formData.get('cuota_social_descuento') || 0),
        costo_tarifa: parseFloat(formData.get('costo_tarifa') || 0),
        tipo_tarifa: formData.get('tipo_tarifa'),
        parent_id: formData.get('parent_id') ? parseInt(formData.get('parent_id'), 10) : null
      };

      try {
        if (this.isEditing) {
          await makeRequest(`/lugares/${this.options.lugar.id}`, 'PUT', data, true);
        } else {
          await makeRequest('/lugares', 'POST', data, true);
        }
        this.options.onSuccess();
      } catch (error) {
        displayApiError(error, this.container.querySelector('#lugar-form-error'));
      }
    });

    this.container.querySelector('#cancel-lugar-btn').addEventListener('click', () => {
      this.options.onCancel();
    });
  }
}

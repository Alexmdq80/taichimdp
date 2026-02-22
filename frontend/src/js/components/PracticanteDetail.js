/**
 * PracticanteDetail Component
 * Display detailed information about a practicante
 */

import { formatDateReadable } from '../utils/formatting.js';
import { makeRequest } from '../api/client.js'; // Import makeRequest
import { showSuccess, displayApiError } from '../utils/errors.js'; // Import success and error messages

export class PracticanteDetail {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onClose: options.onClose || (() => {}),
      onEdit: options.onEdit || (() => {}),
      openPaymentModal: options.openPaymentModal || false // New option
    };
    this.practicante = null;
    this.tiposAbono = []; // To store available subscription types
  }

  async render(practicante) {
    this.practicante = practicante;

    if (!practicante) {
      this.container.innerHTML = '<p class="text-muted">Seleccione un practicante para ver sus detalles</p>';
      return;
    }

    // Fetch tipos de abono for the payment modal
    try {
        const response = await makeRequest('/tipos-abono', 'GET', null, true);
        this.tiposAbono = response.data;
    } catch (error) {
        console.error('Error fetching tipos de abono:', error);
        this.tiposAbono = []; // Ensure it's an empty array on error
    }

    this.container.innerHTML = `
      <div class="card">
        <div class="card-header flex justify-between items-center">
          <h2 class="card-title">Detalles del Practicante</h2>
          <div class="flex gap-2">
            <button id="edit-btn" class="btn">Editar</button>
            <button id="pay-abono-btn" class="btn btn-primary">Pagar Abono</button>
            <button id="close-btn" class="btn btn-secondary">Cerrar</button>
          </div>
        </div>

        <div class="grid grid-2" style="margin-top: 1rem;">
          <div>
            <h3>Información Personal</h3>
            <dl>
              <dt>Nombre Completo:</dt>
              <dd>${this.escapeHtml(practicante.nombre_completo)}</dd>
              
              <dt>Fecha de Nacimiento:</dt>
              <dd>${practicante.fecha_nacimiento ? formatDateReadable(practicante.fecha_nacimiento) : 'No especificada'}</dd>
              
              <dt>Género:</dt>
              <dd>${this.formatGenero(practicante.genero)}</dd>
            </dl>

            <h3>Información de Contacto</h3>
            <dl>
              <dt>Teléfono:</dt>
              <dd>${practicante.telefono || 'No especificado'}</dd>
              
              <dt>Email:</dt>
              <dd>${practicante.email || 'No especificado'}</dd>
              
              <dt>Dirección:</dt>
              <dd>${practicante.direccion || 'No especificada'}</dd>
            </dl>
          </div>

          <div>
            <h3>Información de Salud</h3>
            <dl>
              <dt>Condiciones Médicas:</dt>
              <dd>${practicante.condiciones_medicas || 'Ninguna registrada'}</dd>
              
              <dt>Medicamentos:</dt>
              <dd>${practicante.medicamentos || 'Ninguno registrado'}</dd>
              
              <dt>Limitaciones Físicas:</dt>
              <dd>${practicante.limitaciones_fisicas || 'Ninguna registrada'}</dd>
              
              <dt>Alergias:</dt>
              <dd>${practicante.alergias || 'Ninguna registrada'}</dd>
            </dl>

            <h3>Información del Sistema</h3>
            <dl>
              <dt>Fecha de Registro:</dt>
              <dd>${practicante.created_at ? formatDateReadable(practicante.created_at.split('T')[0]) : 'N/A'}</dd>
              
              <dt>Última Actualización:</dt>
              <dd>${practicante.updated_at ? formatDateReadable(practicante.updated_at.split('T')[0]) : 'N/A'}</dd>
            </dl>
          </div>
        </div>

        <div id="payment-history-section" style="margin-top: 2rem;">
            <h3>Historial de Pagos</h3>
            <div id="payment-history-content"></div>
        </div>
      </div>

      <!-- Payment Modal -->
      <div id="payment-modal" class="modal">
        <div class="modal-content">
          <span class="close-button">&times;</span>
          <h2>Registrar Pago de Abono</h2>
          <form id="payment-form">
            <div class="form-group">
              <label for="tipo-abono-select">Tipo de Abono:</label>
              <select id="tipo-abono-select" name="tipo_abono_id" required>
                <option value="">Seleccione un tipo de abono</option>
                ${this.tiposAbono.map(tipo => `
                    <option 
                        value="${tipo.id}" 
                        data-duracion="${tipo.duracion_dias}" 
                        data-precio="${tipo.precio}"
                    >
                        ${tipo.nombre} ($${parseFloat(tipo.precio).toFixed(2)})
                    </option>
                `).join('')}
              </select>
            </div>
            <div id="selected-abono-details" style="margin-top: 1rem;"></div>
            <div class="form-group">
                <label for="metodo-pago-select">Método de Pago:</label>
                <select id="metodo-pago-select" name="metodo_pago" required>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="otro">Otro</option>
                </select>
            </div>
            <div class="form-group">
                <label for="notas-textarea">Notas:</label>
                <textarea id="notas-textarea" name="notas" rows="3"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Confirmar Pago</button>
            <p class="error-message" id="payment-error-message" style="display: none; color: red;"></p>
          </form>
        </div>
      </div>

      <style>
        dl {
          margin-bottom: 1.5rem;
        }
        dt {
          font-weight: 600;
          margin-top: 0.5rem;
          color: var(--text-muted);
        }
        dd {
          margin-left: 0;
          margin-bottom: 0.5rem;
        }
        .modal {
            display: none; 
            position: fixed; 
            z-index: 1; 
            left: 0;
            top: 0;
            width: 100%; 
            height: 100%; 
            overflow: auto; 
            background-color: rgba(0,0,0,0.4); 
            padding-top: 60px;
        }
        .modal-content {
            background-color: #fefefe;
            margin: 5% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 500px;
            border-radius: 8px;
            position: relative;
        }
        .close-button {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }
        .close-button:hover,
        .close-button:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }
      </style>
    `;

    this.attachEvents();
    this.loadPaymentHistory(); // Load payment history when rendering

    if (this.options.openPaymentModal) {
        this.container.querySelector('#payment-modal').style.display = 'block';
    }
  }

  attachEvents() {
    const editBtn = this.container.querySelector('#edit-btn');
    const closeBtn = this.container.querySelector('#close-btn');
    const payAbonoBtn = this.container.querySelector('#pay-abono-btn');
    const paymentModal = this.container.querySelector('#payment-modal');
    const closeModalButton = this.container.querySelector('.close-button');
    const paymentForm = this.container.querySelector('#payment-form');
    const tipoAbonoSelect = this.container.querySelector('#tipo-abono-select');

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.options.onEdit(this.practicante);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.render(null);
        this.options.onClose();
      });
    }

    if (payAbonoBtn) {
        payAbonoBtn.addEventListener('click', () => {
            paymentModal.style.display = 'block';
        });
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            paymentModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target == paymentModal) {
            paymentModal.style.display = 'none';
        }
    });

    if (tipoAbonoSelect) {
        tipoAbonoSelect.addEventListener('change', this.updateAbonoDetails.bind(this));
    }

    if (paymentForm) {
        paymentForm.addEventListener('submit', this.handlePaymentSubmit.bind(this));
    }
  }

  updateAbonoDetails() {
    const tipoAbonoSelect = this.container.querySelector('#tipo-abono-select');
    const selectedOption = tipoAbonoSelect.options[tipoAbonoSelect.selectedIndex];
    const detailsDiv = this.container.querySelector('#selected-abono-details');

    if (selectedOption && selectedOption.value) {
        const duracion = selectedOption.getAttribute('data-duracion');
        const precio = selectedOption.getAttribute('data-precio');
        detailsDiv.innerHTML = `
            <p><strong>Duración:</strong> ${duracion} días</p>
            <p><strong>Precio:</strong> $${parseFloat(precio).toFixed(2)}</p>
        `;
    } else {
        detailsDiv.innerHTML = '';
    }
  }

  async handlePaymentSubmit(event) {
    event.preventDefault();
    const paymentForm = this.container.querySelector('#payment-form');
    const tipoAbonoSelect = paymentForm.querySelector('#tipo-abono-select');
    const metodoPagoSelect = paymentForm.querySelector('#metodo-pago-select');
    const notasTextarea = paymentForm.querySelector('#notas-textarea');
    const errorMessageElement = paymentForm.querySelector('#payment-error-message');

    const tipo_abono_id = tipoAbonoSelect.value;
    const metodo_pago = metodoPagoSelect.value;
    const notas = notasTextarea.value;

    if (!tipo_abono_id) {
        errorMessageElement.textContent = 'Por favor, seleccione un tipo de abono.';
        errorMessageElement.style.display = 'block';
        return;
    }

    errorMessageElement.style.display = 'none';

    try {
        await makeRequest(
            `/practicantes/${this.practicante.id}/pagar`,
            'POST',
            { tipo_abono_id: parseInt(tipo_abono_id, 10), metodo_pago, notas }, // Pass new fields
            true
        );
        showSuccess('Pago registrado correctamente.', this.container);
        this.container.querySelector('#payment-modal').style.display = 'none';
        this.loadPaymentHistory(); // Refresh history
        this.updateAbonoDetails(); // Clear details
        tipoAbonoSelect.value = ''; // Reset select
    } catch (error) {
        console.error('Error al registrar pago:', error);
        displayApiError(error, errorMessageElement);
    }
  }

  async loadPaymentHistory() {
    const historyContainer = this.container.querySelector('#payment-history-content');
    if (!historyContainer) return;

    historyContainer.innerHTML = '<div class="spinner"></div>'; // Show spinner

    try {
        const response = await makeRequest(`/practicantes/${this.practicante.id}/pagos`, 'GET', null, true);
        const pagos = response.data;

        if (pagos && pagos.length > 0) {
            historyContainer.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Tipo Abono</th>
                            <th>Monto</th>
                            <th>Fecha</th>
                            <th>Método Pago</th>
                            <th>Notas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pagos.map(pago => {
                            return `
                                <tr>
                                    <td>${this.escapeHtml(pago.tipo_abono_nombre || 'Desconocido')}</td>
                                    <td>$${parseFloat(pago.monto).toFixed(2)}</td>
                                    <td>${formatDateReadable(pago.fecha)}</td>
                                    <td>${pago.metodo_pago || '-'}</td>
                                    <td>${pago.notas || '-'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        } else {
            historyContainer.innerHTML = '<p class="text-muted">No hay historial de pagos para este practicante.</p>';
        }
    } catch (error) {
        console.error('Error fetching payment history:', error);
        displayApiError(error, historyContainer);
    }
  }

  formatGenero(genero) {
    const map = {
      'M': 'Masculino',
      'F': 'Femenino',
      'Otro': 'Otro',
      'Prefiero no decir': 'Prefiero no decir'
    };
    return map[genero] || 'No especificado';
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default PracticanteDetail;

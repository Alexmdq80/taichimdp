# Feature Specification: Sistema de Gestión de Tai Chi Chuan

**Feature Branch**: `001-tai-chi-management`  
**Created**: 2026-01-15  
**Status**: Draft  
**Input**: User description: "Construye una aplicación que me ayude a organizar los clientes (practicantes) que asisten a mis clases de tai chi chuan. Me gustaría tener algunos datos personales, de contacto y de salud de cada uno. También que me permita gestionar distintos tipos de abonos. Que me permita gestionar los pagos de los clientes y la asistencia a las clases."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestión de Practicantes (Priority: P1)

Como instructor de tai chi chuan, quiero registrar y gestionar información de mis practicantes (clientes) para mantener un registro organizado de quienes asisten a mis clases, con sus datos personales, de contacto y de salud relevantes.

**Why this priority**: Esta es la funcionalidad central del sistema. Sin registro de practicantes, no se puede gestionar pagos, abonos ni asistencia. Es el MVP mínimo viable que entrega valor inmediato al instructor.

**Independent Test**: Se puede probar completamente creando, consultando, actualizando y eliminando registros de practicantes. El sistema entrega valor al permitir organizar la información básica de los clientes sin necesidad de otras funcionalidades.

**Acceptance Scenarios**:

1. **Given** que soy instructor y no tengo practicantes registrados, **When** registro un nuevo practicante con datos personales, contacto y salud, **Then** el sistema guarda la información y puedo verla en la lista de practicantes

2. **Given** que tengo practicantes registrados, **When** busco un practicante por nombre, **Then** el sistema muestra los resultados que coinciden con mi búsqueda

3. **Given** que tengo un practicante registrado, **When** actualizo su información personal o de contacto, **Then** los cambios se guardan correctamente y se reflejan inmediatamente

4. **Given** que tengo un practicante registrado, **When** actualizo sus datos de salud, **Then** la información se guarda y puedo ver un historial de cambios en sus condiciones de salud

5. **Given** que tengo practicantes registrados, **When** elimino un practicante (con confirmación), **Then** el practicante se elimina del sistema y ya no aparece en la lista

6. **Given** que estoy registrando un practicante, **When** intento guardar sin datos obligatorios, **Then** el sistema muestra mensajes claros indicando qué campos son requeridos

---

### User Story 2 - Gestión de Tipos de Abonos (Priority: P2)

Como instructor, quiero definir diferentes tipos de abonos (por ejemplo, mensual, trimestral, anual, clase suelta) para poder asignarlos a mis practicantes según sus necesidades y preferencias.

**Why this priority**: Los tipos de abonos son necesarios antes de poder gestionar pagos efectivamente. Permite al instructor definir su modelo de negocio y tarifas, lo cual es fundamental para la gestión financiera del estudio.

**Independent Test**: Se puede probar creando diferentes tipos de abonos con sus características (nombre, duración, precio), consultándolos y modificándolos. El sistema entrega valor al permitir configurar la estructura de precios sin necesidad de tener practicantes o pagos registrados.

**Acceptance Scenarios**:

1. **Given** que no tengo tipos de abonos definidos, **When** creo un nuevo tipo de abono con nombre, duración y precio, **Then** el abono se guarda y aparece en la lista de tipos disponibles

2. **Given** que tengo tipos de abonos creados, **When** busco un tipo específico, **Then** el sistema muestra los resultados que coinciden con mi búsqueda

3. **Given** que tengo un tipo de abono registrado, **When** actualizo su precio o duración, **Then** los cambios se guardan y los practicantes existentes con ese abono mantienen su información original

4. **Given** que tengo tipos de abonos con practicantes asociados, **When** intento eliminar un tipo de abono, **Then** el sistema muestra una advertencia si hay practicantes usando ese abono y requiere confirmación

5. **Given** que estoy creando un tipo de abono, **When** intento guardar sin precio o duración, **Then** el sistema muestra mensajes claros indicando qué campos son requeridos

---

### User Story 3 - Gestión de Pagos (Priority: P3)

Como instructor, quiero registrar los pagos que realizan mis practicantes por sus abonos para llevar un control financiero preciso y saber quién está al día con sus pagos.

**Why this priority**: Los pagos son esenciales para la operación del negocio. Permite al instructor saber qué practicantes han pagado, cuándo venció su abono y quién está al corriente. Esta funcionalidad depende de practicantes y tipos de abonos ya existentes.

**Independent Test**: Se puede probar registrando pagos para practicantes con diferentes tipos de abonos, consultando el historial de pagos y verificando estados de pago. El sistema entrega valor al permitir llevar un control financiero preciso y saber quién está al día.

**Acceptance Scenarios**:

1. **Given** que tengo practicantes registrados con abonos asignados, **When** registro un pago para un practicante, **Then** el sistema registra el pago con fecha, monto y método de pago, y actualiza el estado del abono del practicante

2. **Given** que tengo pagos registrados, **When** consulto el historial de pagos de un practicante, **Then** el sistema muestra todos los pagos ordenados por fecha con detalles completos

3. **Given** que tengo practicantes con diferentes abonos, **When** consulto la lista de practicantes, **Then** puedo ver claramente quién está al día con sus pagos y quién tiene pagos vencidos

4. **Given** que tengo un pago registrado, **When** necesito corregir el monto o fecha de un pago, **Then** puedo editar el pago y los cambios se reflejan en el historial

5. **Given** que tengo un pago registrado incorrectamente, **When** elimino un pago (con confirmación), **Then** el pago se elimina y el estado del abono del practicante se actualiza correctamente

6. **Given** que un practicante tiene un abono próximo a vencer, **When** consulto su información, **Then** el sistema muestra una indicación clara de cuándo vence su abono actual

---

### User Story 4 - Gestión de Asistencia a Clases (Priority: P4)

Como instructor, quiero registrar la asistencia de mis practicantes a las clases para llevar un control de frecuencia, identificar patrones de asistencia y tener un registro histórico de quién asistió a cada clase.

**Why this priority**: La asistencia es importante para entender la participación de los practicantes y puede ayudar a identificar quién necesita más seguimiento. Sin embargo, puede funcionar de manera más básica al inicio mientras se establecen las otras funcionalidades core del negocio.

**Independent Test**: Se puede probar creando clases, registrando asistencia de practicantes a esas clases, consultando el historial de asistencia por practicante y por clase. El sistema entrega valor al permitir llevar un control de quién asiste regularmente y quién necesita ser contactado.

**Acceptance Scenarios**:

1. **Given** que tengo practicantes registrados, **When** creo una nueva clase con fecha y hora, **Then** la clase se registra y puedo marcar la asistencia de practicantes a esa clase

2. **Given** que tengo una clase registrada, **When** marco la asistencia de varios practicantes, **Then** el sistema guarda la asistencia y muestra la lista de asistentes para esa clase

3. **Given** que tengo clases con asistencia registrada, **When** consulto el historial de asistencia de un practicante, **Then** el sistema muestra todas las clases a las que asistió ordenadas por fecha

4. **Given** que tengo clases registradas, **When** consulto la asistencia de una clase específica, **Then** el sistema muestra la lista completa de practicantes que asistieron y los que no asistieron

5. **Given** que marco incorrectamente la asistencia de un practicante, **When** corrijo la asistencia, **Then** el sistema actualiza el registro correctamente

6. **Given** que un practicante no ha asistido a clases recientes, **When** consulto su perfil, **Then** el sistema muestra cuántos días han pasado desde su última asistencia

---

### Edge Cases

- ¿Qué sucede cuando un practicante intenta renovar su abono antes de que venza el actual?
- ¿Cómo maneja el sistema cuando un practicante con abono activo no ha pagado aún?
- ¿Qué ocurre si un practicante tiene múltiples abonos activos simultáneamente?
- ¿Cómo se maneja la asistencia si un practicante está registrado pero su abono ha vencido?
- ¿Qué pasa cuando se intenta eliminar un practicante que tiene pagos o asistencia registrada?
- ¿Cómo se maneja la situación cuando se actualiza el precio de un tipo de abono y hay practicantes con ese abono activo?
- ¿Qué sucede si se registra un pago por un monto diferente al precio del abono asignado?
- ¿Cómo maneja el sistema cuando se crea una clase con fecha/hora en el pasado vs futuro?
- ¿Qué ocurre cuando dos practicantes tienen el mismo nombre completo?
- ¿Cómo se maneja la información de salud sensible desde el punto de vista de privacidad?

## Requirements *(mandatory)*

### Functional Requirements

#### Gestión de Practicantes

- **FR-001**: El sistema DEBE permitir registrar nuevos practicantes con datos personales (nombre completo, fecha de nacimiento, género), de contacto (teléfono, email, dirección) y de salud (condiciones médicas relevantes, medicamentos, limitaciones físicas, alergias)
- **FR-002**: El sistema DEBE permitir buscar practicantes por nombre, teléfono o email
- **FR-003**: El sistema DEBE permitir actualizar la información de un practicante existente
- **FR-004**: El sistema DEBE permitir eliminar practicantes con confirmación previa
- **FR-005**: El sistema DEBE validar que campos obligatorios (nombre completo, al menos un método de contacto) estén presentes antes de guardar
- **FR-006**: El sistema DEBE mantener un historial de cambios en los datos de salud de cada practicante
- **FR-007**: El sistema DEBE permitir ver una lista completa de todos los practicantes registrados

#### Gestión de Tipos de Abonos

- **FR-008**: El sistema DEBE permitir crear tipos de abonos con nombre, duración (en días o meses), precio y descripción opcional
- **FR-009**: El sistema DEBE permitir buscar tipos de abonos por nombre
- **FR-010**: El sistema DEBE permitir actualizar la información de un tipo de abono existente
- **FR-011**: El sistema DEBE permitir eliminar tipos de abonos, mostrando advertencia si hay practicantes asociados
- **FR-012**: El sistema DEBE validar que precio y duración sean valores numéricos positivos
- **FR-013**: El sistema DEBE permitir ver una lista de todos los tipos de abonos disponibles

#### Gestión de Pagos

- **FR-014**: El sistema DEBE permitir asignar un tipo de abono a un practicante
- **FR-015**: El sistema DEBE permitir registrar pagos con fecha, monto, método de pago y abono asociado
- **FR-016**: El sistema DEBE calcular automáticamente la fecha de vencimiento del abono basándose en la duración del tipo de abono y la fecha del pago
- **FR-017**: El sistema DEBE permitir consultar el historial de pagos de un practicante
- **FR-018**: El sistema DEBE permitir editar y eliminar pagos (con confirmación)
- **FR-019**: El sistema DEBE indicar claramente qué practicantes tienen abonos activos, próximos a vencer o vencidos
- **FR-020**: El sistema DEBE mostrar la fecha de último pago y próxima fecha de vencimiento para cada practicante

#### Gestión de Asistencia

- **FR-021**: El sistema DEBE permitir crear clases con fecha, hora y descripción opcional
- **FR-022**: El sistema DEBE permitir registrar la asistencia de múltiples practicantes a una clase
- **FR-023**: El sistema DEBE permitir consultar el historial de asistencia de un practicante (todas las clases a las que asistió)
- **FR-024**: El sistema DEBE permitir consultar la lista de asistentes y no asistentes para una clase específica
- **FR-025**: El sistema DEBE permitir corregir la asistencia registrada (marcar/desmarcar asistencia)
- **FR-026**: El sistema DEBE mostrar cuántos días han pasado desde la última asistencia de un practicante
- **FR-027**: El sistema DEBE permitir ver estadísticas de asistencia (frecuencia, patrones) por practicante

#### Requisitos Generales

- **FR-028**: El sistema DEBE proteger la información sensible de salud de acuerdo a estándares de privacidad
- **FR-029**: El sistema DEBE proporcionar mensajes de error claros y accionables cuando ocurran errores de validación
- **FR-030**: El sistema DEBE permitir realizar búsquedas y filtros en todas las listas principales

### Key Entities *(include if feature involves data)*

- **Practicante**: Representa un cliente que asiste a las clases. Incluye datos personales (nombre, fecha de nacimiento, género), información de contacto (teléfono, email, dirección) y datos de salud (condiciones médicas, medicamentos, limitaciones, alergias). Se relaciona con pagos, abonos y registros de asistencia.

- **Tipo de Abono**: Representa una categoría de abono que puede ser ofrecida a los practicantes. Incluye nombre, duración (días/meses), precio y descripción opcional. Se relaciona con practicantes a través de asignaciones de abonos.

- **Abono (Asignación)**: Representa la relación entre un practicante y un tipo de abono, con fecha de inicio, fecha de vencimiento y estado (activo, vencido, próximo a vencer). Se relaciona con el practicante y el tipo de abono, y se actualiza mediante pagos.

- **Pago**: Representa una transacción de pago realizada por un practicante. Incluye fecha, monto, método de pago y está asociado a un abono específico. Se relaciona con el practicante y su abono activo.

- **Clase**: Representa una sesión de tai chi chuan con fecha y hora específicas. Se relaciona con múltiples registros de asistencia.

- **Asistencia**: Representa la participación de un practicante en una clase específica. Se relaciona con el practicante y la clase.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los instructores pueden registrar un nuevo practicante completo (con todos los datos personales, contacto y salud) en menos de 2 minutos

- **SC-002**: El sistema permite encontrar un practicante específico dentro de 5 segundos usando búsqueda por nombre o contacto

- **SC-003**: Los instructores pueden registrar un pago completo para un practicante en menos de 30 segundos

- **SC-004**: El sistema muestra claramente el estado de pago (al día, próximo a vencer, vencido) de todos los practicantes en una vista unificada

- **SC-005**: Los instructores pueden registrar la asistencia de 10 practicantes a una clase en menos de 1 minuto

- **SC-006**: El sistema mantiene un historial completo y preciso de todos los pagos realizados, sin pérdida de información

- **SC-007**: El sistema calcula correctamente las fechas de vencimiento de abonos en el 100% de los casos, considerando la duración del tipo de abono

- **SC-008**: Los instructores pueden consultar el historial de asistencia de cualquier practicante y ver estadísticas básicas en menos de 3 segundos

- **SC-009**: El sistema valida correctamente todos los campos obligatorios antes de guardar información, previniendo errores de datos incompletos

- **SC-010**: Los instructores pueden actualizar o eliminar información con confirmaciones claras, reduciendo errores accidentales a menos del 1% de las operaciones

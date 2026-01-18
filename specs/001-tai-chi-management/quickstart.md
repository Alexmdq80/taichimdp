# Quickstart Guide: Sistema de Gestión de Tai Chi Chuan

**Date**: 2026-01-15  
**Feature**: 001-tai-chi-management

## Prerequisites

1. **Node.js**: Versión 18 o superior
2. **MySQL**: Versión 8.0 o superior instalado y ejecutándose localmente
3. **npm** o **yarn**: Gestor de paquetes

## Setup Inicial

### 1. Instalar Dependencias

```bash
# En el directorio raíz del proyecto
npm install

# En el directorio backend
cd backend
npm install

# En el directorio frontend
cd ../frontend
npm install
```

### 2. Configurar Base de Datos

1. Crear base de datos MySQL:
```sql
CREATE DATABASE taichi_management;
```

2. Configurar conexión en `backend/src/config/database.js`:
```javascript
{
  host: 'localhost',
  user: 'root',
  password: 'tu_password',
  database: 'taichi_management'
}
```

3. Ejecutar migraciones:
```bash
cd backend
mysql -u root -p taichi_management < migrations/001_initial_schema.sql
```

### 3. Iniciar Servidores

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# Servidor corriendo en http://localhost:3000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# Aplicación corriendo en http://localhost:5173 (puerto por defecto de Vite)
```

## Test Scenarios

### Scenario 1: Registrar un Nuevo Practicante (User Story 1, Acceptance 1)

**Objetivo**: Verificar que se puede registrar un practicante completo con todos sus datos.

**Pasos**:
1. Abrir la aplicación en el navegador
2. Navegar a "Practicantes" → "Nuevo Practicante"
3. Llenar el formulario:
   - Nombre completo: "Juan Pérez"
   - Fecha de nacimiento: "1985-05-15"
   - Género: "M"
   - Teléfono: "+1234567890"
   - Email: "juan@example.com"
   - Dirección: "Calle Principal 123"
   - Condiciones médicas: "Hipertensión"
   - Medicamentos: "Medicamento X"
   - Limitaciones físicas: "Problemas de rodilla"
   - Alergias: "Ninguna"
4. Hacer clic en "Guardar"

**Resultado Esperado**:
- Mensaje de éxito: "Practicante registrado correctamente"
- El practicante aparece en la lista de practicantes
- Todos los datos se guardan correctamente

**Criterio de Éxito**: SC-001 - Registro completo en menos de 2 minutos

---

### Scenario 2: Buscar un Practicante (User Story 1, Acceptance 2)

**Objetivo**: Verificar que la búsqueda funciona correctamente.

**Prerequisitos**: Tener al menos 3 practicantes registrados con nombres diferentes.

**Pasos**:
1. Navegar a "Practicantes"
2. En el campo de búsqueda, escribir "Juan"
3. Observar los resultados

**Resultado Esperado**:
- Se muestran solo los practicantes cuyo nombre contiene "Juan"
- Los resultados aparecen en menos de 5 segundos

**Criterio de Éxito**: SC-002 - Búsqueda en menos de 5 segundos

---

### Scenario 3: Crear un Tipo de Abono (User Story 2, Acceptance 1)

**Objetivo**: Verificar que se puede crear un tipo de abono.

**Pasos**:
1. Navegar a "Tipos de Abonos" → "Nuevo Tipo de Abono"
2. Llenar el formulario:
   - Nombre: "Mensual"
   - Duración: 30 días
   - Precio: 50.00
   - Descripción: "Abono mensual estándar"
3. Hacer clic en "Guardar"

**Resultado Esperado**:
- Mensaje de éxito
- El tipo de abono aparece en la lista
- Los datos se guardan correctamente

---

### Scenario 4: Registrar un Pago (User Story 3, Acceptance 1)

**Objetivo**: Verificar que se puede registrar un pago completo.

**Prerequisitos**: 
- Tener al menos un practicante registrado
- Tener al menos un tipo de abono creado
- Asignar el abono al practicante

**Pasos**:
1. Navegar a "Pagos" → "Nuevo Pago"
2. Seleccionar practicante: "Juan Pérez"
3. Seleccionar abono: "Mensual"
4. Llenar:
   - Fecha: "2026-01-15"
   - Monto: 50.00
   - Método de pago: "Efectivo"
5. Hacer clic en "Guardar"

**Resultado Esperado**:
- Mensaje de éxito
- El pago se registra correctamente
- El estado del abono del practicante se actualiza
- La fecha de vencimiento se calcula automáticamente (fecha_inicio + 30 días)

**Criterio de Éxito**: SC-003 - Registro de pago en menos de 30 segundos

---

### Scenario 5: Registrar Asistencia a una Clase (User Story 4, Acceptance 2)

**Objetivo**: Verificar que se puede registrar asistencia de múltiples practicantes.

**Prerequisitos**: 
- Tener al menos 10 practicantes registrados
- Crear una clase con fecha y hora

**Pasos**:
1. Navegar a "Asistencia" → "Nueva Clase"
2. Crear clase:
   - Fecha: "2026-01-15"
   - Hora: "18:00:00"
   - Descripción: "Clase regular"
3. Hacer clic en "Guardar"
4. En la lista de la clase, marcar asistencia de 10 practicantes
5. Hacer clic en "Guardar Asistencia"

**Resultado Esperado**:
- La asistencia se registra correctamente
- Se muestra la lista de asistentes y no asistentes
- Todos los registros se guardan

**Criterio de Éxito**: SC-005 - Registro de 10 practicantes en menos de 1 minuto

---

### Scenario 6: Consultar Historial de Pagos (User Story 3, Acceptance 2)

**Objetivo**: Verificar que se puede consultar el historial de pagos de un practicante.

**Prerequisitos**: 
- Tener un practicante con al menos 3 pagos registrados

**Pasos**:
1. Navegar a "Practicantes"
2. Hacer clic en un practicante
3. Ir a la pestaña "Historial de Pagos"

**Resultado Esperado**:
- Se muestran todos los pagos ordenados por fecha (más recientes primero)
- Cada pago muestra: fecha, monto, método de pago, abono asociado
- La información es completa y precisa

**Criterio de Éxito**: SC-006 - Historial completo y preciso

---

### Scenario 7: Ver Estado de Pago de Practicantes (User Story 3, Acceptance 3)

**Objetivo**: Verificar que se muestra claramente el estado de pago de los practicantes.

**Prerequisitos**: 
- Tener practicantes con diferentes estados:
  - Al menos uno con abono activo y al día
  - Al menos uno con abono próximo a vencer (menos de 7 días)
  - Al menos uno con abono vencido

**Pasos**:
1. Navegar a "Practicantes"
2. Observar la lista de practicantes

**Resultado Esperado**:
- Cada practicante muestra un indicador de estado:
  - Verde: "Al día"
  - Amarillo: "Próximo a vencer"
  - Rojo: "Vencido"
- Se muestra la fecha de último pago
- Se muestra la próxima fecha de vencimiento

**Criterio de Éxito**: SC-004 - Estado de pago claro en vista unificada

---

### Scenario 8: Consultar Historial de Asistencia (User Story 4, Acceptance 3)

**Objetivo**: Verificar que se puede consultar el historial de asistencia de un practicante.

**Prerequisitos**: 
- Tener un practicante con al menos 5 clases registradas

**Pasos**:
1. Navegar a "Practicantes"
2. Hacer clic en un practicante
3. Ir a la pestaña "Historial de Asistencia"

**Resultado Esperado**:
- Se muestran todas las clases ordenadas por fecha
- Se indica si asistió o no a cada clase
- Se muestran estadísticas básicas (total de clases, porcentaje de asistencia)
- Se muestra cuántos días han pasado desde la última asistencia

**Criterio de Éxito**: SC-008 - Historial y estadísticas en menos de 3 segundos

---

### Scenario 9: Validación de Campos Obligatorios (User Story 1, Acceptance 6)

**Objetivo**: Verificar que se validan los campos obligatorios.

**Pasos**:
1. Navegar a "Practicantes" → "Nuevo Practicante"
2. Intentar guardar sin llenar el nombre completo
3. Intentar guardar sin teléfono ni email

**Resultado Esperado**:
- Se muestran mensajes de error claros:
  - "El nombre completo es obligatorio"
  - "Debe proporcionar al menos un método de contacto (teléfono o email)"
- Los mensajes son específicos y accionables

**Criterio de Éxito**: SC-009 - Validación correcta de campos obligatorios

---

### Scenario 10: Eliminar con Confirmación (User Story 1, Acceptance 5)

**Objetivo**: Verificar que las eliminaciones requieren confirmación.

**Pasos**:
1. Navegar a "Practicantes"
2. Hacer clic en "Eliminar" en un practicante
3. Observar el diálogo de confirmación
4. Cancelar la eliminación
5. Intentar eliminar nuevamente y confirmar

**Resultado Esperado**:
- Se muestra un diálogo de confirmación claro
- Al cancelar, no se elimina nada
- Al confirmar, el practicante se elimina
- Se muestra mensaje de éxito

**Criterio de Éxito**: SC-010 - Confirmaciones claras, errores accidentales < 1%

---

## Edge Cases Testing

### Edge Case 1: Renovar Abono Antes de Vencimiento

**Escenario**: Un practicante quiere renovar su abono antes de que venza el actual.

**Pasos**:
1. Tener un practicante con abono activo que vence en 10 días
2. Registrar un nuevo pago para renovar el abono

**Resultado Esperado**:
- Se crea un nuevo abono con fecha de inicio = fecha del pago
- El abono anterior se marca como inactivo o se actualiza su fecha de vencimiento
- No hay conflictos de abonos activos múltiples

---

### Edge Case 2: Pago con Monto Diferente al Precio del Abono

**Escenario**: Registrar un pago por un monto diferente al precio estándar del tipo de abono.

**Pasos**:
1. Tener un tipo de abono con precio 50.00
2. Registrar un pago de 45.00 (descuento) o 55.00 (ajuste)

**Resultado Esperado**:
- El pago se registra correctamente con el monto ingresado
- El sistema permite montos diferentes al precio estándar
- Se registra una nota si es necesario

---

### Edge Case 3: Actualizar Precio de Tipo de Abono con Practicantes Activos

**Escenario**: Actualizar el precio de un tipo de abono que tiene practicantes con abonos activos.

**Pasos**:
1. Tener un tipo de abono "Mensual" con precio 50.00
2. Tener practicantes con abonos activos de este tipo
3. Actualizar el precio a 55.00

**Resultado Esperado**:
- El precio del tipo de abono se actualiza
- Los abonos ya asignados mantienen su información original
- Los nuevos abonos usan el nuevo precio

---

### Edge Case 4: Eliminar Practicante con Pagos y Asistencia

**Escenario**: Intentar eliminar un practicante que tiene pagos y asistencia registrada.

**Pasos**:
1. Tener un practicante con:
   - Al menos 1 pago registrado
   - Al menos 1 registro de asistencia
2. Intentar eliminar el practicante

**Resultado Esperado**:
- Opción 1: Se muestra advertencia y se requiere eliminar primero los datos relacionados
- Opción 2: Se elimina en cascada (pagos, asistencia, abonos) con confirmación explícita
- El comportamiento es consistente y claro

---

## Performance Testing

### Performance Test 1: Búsqueda con Muchos Practicantes

**Objetivo**: Verificar que la búsqueda es rápida incluso con muchos registros.

**Setup**: Crear 100 practicantes en la base de datos

**Pasos**:
1. Navegar a "Practicantes"
2. Realizar búsqueda por nombre

**Resultado Esperado**: 
- Resultados en menos de 5 segundos (SC-002)
- La paginación funciona correctamente

---

### Performance Test 2: Carga Inicial de Página

**Objetivo**: Verificar que la página carga rápidamente.

**Pasos**:
1. Abrir la aplicación en el navegador
2. Medir el tiempo de carga

**Resultado Esperado**: 
- Carga inicial < 2 segundos (Performance Goals)

---

## Database Testing

### Database Test 1: Integridad Referencial

**Objetivo**: Verificar que las foreign keys funcionan correctamente.

**Pasos**:
1. Intentar crear un pago con un `practicante_id` que no existe
2. Intentar crear un pago con un `abono_id` que no existe

**Resultado Esperado**:
- Se rechaza la operación con error de validación
- No se crean registros huérfanos

---

### Database Test 2: Cálculo Automático de Fecha de Vencimiento

**Objetivo**: Verificar que las fechas de vencimiento se calculan correctamente.

**Pasos**:
1. Crear un tipo de abono con duración de 30 días
2. Asignar abono a un practicante con fecha_inicio = "2026-01-15"

**Resultado Esperado**:
- fecha_vencimiento = "2026-02-14" (30 días después)
- El cálculo es correcto en el 100% de los casos (SC-007)

---

## Security Testing

### Security Test 1: Validación de Inputs

**Objetivo**: Verificar que se previene SQL injection.

**Pasos**:
1. Intentar ingresar en el campo de búsqueda: `'; DROP TABLE practicantes; --`
2. Intentar ingresar en el campo de nombre: `<script>alert('XSS')</script>`

**Resultado Esperado**:
- No se ejecuta código SQL malicioso
- No se ejecuta código JavaScript malicioso
- Los inputs se sanitizan correctamente

---

## Notes

- Todos los tests deben ejecutarse en un entorno de desarrollo/QA, no en producción
- Los datos de prueba deben limpiarse después de cada sesión de testing
- Los tiempos de respuesta pueden variar según el hardware y la carga del sistema
- Se recomienda usar herramientas de profiling para identificar cuellos de botella

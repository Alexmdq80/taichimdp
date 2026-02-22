# Especificación: Landing Page de CRUD de Practicantes

## 1. Objetivo

Crear una landing page intuitiva y eficiente que permita a los usuarios administrar la información de los practicantes de Tai Chi. La página debe ofrecer una vista de listado de todos los practicantes y proveer funcionalidades completas de Crear, Leer, Actualizar y Eliminar (CRUD) desde una única interfaz.

## 2. Requisitos Funcionales

### 2.1. Listado de Practicantes (Read)

-   **R1.1:** Al cargar la página, se debe mostrar una lista o tabla con todos los practicantes existentes.
-   **R1.2:** Cada practicante en la lista debe mostrar, como mínimo, su nombre completo.
-   **R1.3:** Si no hay practicantes, se debe mostrar un mensaje indicándolo.

### 2.2. Creación de un Nuevo Practicante (Create)

-   **R2.1:** La página debe tener un botón visible (ej. "Agregar Nuevo Practicante").
-   **R2.2:** Al hacer clic en este botón, se debe mostrar un formulario (modal o en línea) para ingresar los datos del nuevo practicante.
-   **R2.3:** El formulario debe incluir campos para todos los atributos del modelo de datos de `Practicante`.
-   **R2.4:** El formulario debe tener un botón "Guardar" para enviar los datos y un botón "Cancelar" para cerrar el formulario sin guardar.
-   **R2.5:** Tras una creación exitosa, la lista de practicantes debe actualizarse automáticamente para mostrar al nuevo miembro.

### 2.3. Actualización de un Practicante (Update)

-   **R3.1:** Cada elemento en la lista de practicantes debe tener un botón de "Editar".
-   **R3.2:** Al hacer clic en "Editar", se debe mostrar el mismo formulario de creación, pero pre-cargado con los datos del practicante seleccionado.
-   **R3.3:** Tras una actualización exitosa, la lista debe reflejar los cambios realizados.

### 2.4. Eliminación de un Practicante (Delete)

-   **R4.1:** Cada elemento en la lista de practicantes debe tener un botón de "Eliminar".
-   **R4.2:** Al hacer clic en "Eliminar", se debe mostrar un diálogo de confirmación para prevenir borrados accidentales.
-   **R4.3:** Si el usuario confirma, el practicante debe ser eliminado de la base de datos.
-   **R4.4:** Tras una eliminación exitosa, la lista de practicantes debe actualizarse automáticamente.

## 3. Interfaz de Usuario (UI/UX)

-   **UI1:** El diseño debe ser limpio, moderno y responsivo (adaptable a diferentes tamaños de pantalla).
-   **UI2:** Se utilizarán componentes `PracticanteList.js`, `PracticanteForm.js` y `PracticanteDetail.js` existentes como base.
-   **UI3:** Se deben proporcionar notificaciones visuales (feedback) para el usuario después de cada operación (ej. "Practicante guardado con éxito", "Error al eliminar").

## 4. API Endpoints

La interfaz interactuará con los siguientes endpoints del backend:

-   `GET /api/practicantes`: Obtiene la lista de todos los practicantes.
-   `POST /api/practicantes`: Crea un nuevo practicante.
-   `GET /api/practicantes/:id`: Obtiene los detalles de un practicante específico.
-   `PUT /api/practicantes/:id`: Actualiza un practicante existente.
-   `DELETE /api/practicantes/:id`: Elimina un practicante.

## 5. Modelo de Datos: Practicante

El modelo de datos para un practicante se basa en el contrato existente y es el siguiente:

```json
{
  "id": 1,
  "nombre_completo": "Juan Pérez",
  "fecha_nacimiento": "1985-05-15",
  "genero": "M",
  "telefono": "+1234567890",
  "email": "juan@example.com",
  "direccion": "Calle Principal 123",
  "condiciones_medicas": "Hipertensión",
  "medicamentos": "Medicamento X",
  "limitaciones_fisicas": "Problemas de rodilla",
  "alergias": "Ninguna",
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-15T10:00:00Z"
}
```

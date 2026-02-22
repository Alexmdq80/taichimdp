# Plan de Implementación: Landing Page de Practicantes con Angular

## 1. Objetivo

Implementar una Single Page Application (SPA) con Angular para gestionar el CRUD de practicantes, reemplazando la estructura de frontend existente.

## 2. Estrategia General

La estrategia se divide en fases para asegurar una transición controlada desde el frontend de JavaScript vanilla hacia un nuevo ecosistema con Angular.

### Fase 1: Configuración del Entorno de Angular

1.  **Instalar Angular CLI:** Asegurar que `npm` esté disponible y luego instalar `@angular/cli` globalmente si no se ha hecho antes.
    ```bash
    npm install -g @angular/cli
    ```
2.  **Limpiar el Frontend Actual:** Eliminar los archivos y carpetas existentes en el directorio `frontend` para preparar el espacio para la nueva aplicación Angular. Se hará un backup previo por seguridad.
3.  **Crear la Aplicación Angular:** Utilizar el Angular CLI para generar una nueva aplicación llamada `frontend` en el directorio `C:\wamp64\www\taichimdp\`.
    ```bash
    ng new frontend --directory ./frontend --routing --style css --skip-tests=false --standalone=false
    ```
    *   `--routing`: Genera un módulo de enrutamiento.
    *   `--style css`: Define CSS como el preprocesador de estilos.
    *   `--skip-tests=false`: Genera archivos de prueba.
    *   `--standalone=false`: Se usará una estructura basada en `NgModule` por ser más tradicional y fácil de seguir para este caso.

### Fase 2: Andamiaje de Componentes y Servicios

1.  **Generar Servicio:** Crear un servicio para manejar la comunicación con la API del backend.
    ```bash
    ng generate service services/practicante
    ```
2.  **Generar Componentes:** Crear los componentes necesarios para la interfaz de usuario.
    ```bash
    # Componente para listar practicantes
    ng generate component components/practicante-list

    # Componente para el formulario de creación/edición
    ng generate component components/practicante-form

    # Componente para el diálogo de confirmación de borrado
    ng generate component components/confirm-dialog
    ```
3.  **Generar Modelo:** Crear una interfaz de TypeScript para el modelo `Practicante`.
    ```bash
    ng generate interface models/practicante
    ```

### Fase 3: Desarrollo y Lógica de la Aplicación

1.  **Modelo `Practicante`:** Definir la interfaz `practicante.ts` basándose en el contrato de la API.
2.  **Servicio `PracticanteService`:**
    -   Inyectar `HttpClient` para realizar las peticiones HTTP.
    -   Implementar los métodos CRUD: `getPracticantes()`, `getPracticante(id)`, `createPracticante(data)`, `updatePracticante(id, data)`, `deletePracticante(id)`.
3.  **Componente `PracticanteListComponent`:**
    -   Utilizar `PracticanteService` para obtener y mostrar la lista de practicantes.
    -   Implementar botones de "Editar" y "Eliminar" para cada practicante.
    -   Manejar la lógica para mostrar el diálogo de confirmación antes de eliminar.
4.  **Componente `PracticanteFormComponent`:**
    -   Usar `ReactiveFormsModule` para crear un formulario robusto con validaciones.
    -   Manejar dos modos: "Crear" (formulario vacío) y "Editar" (formulario cargado con datos).
    -   Utilizar el `ActivatedRoute` para obtener el ID del practicante en modo de edición.
5.  **Enrutamiento:**
    -   Configurar `app-routing.module.ts` para definir las rutas:
        -   `/practicantes`: Muestra `PracticanteListComponent`.
        -   `/practicantes/nuevo`: Muestra `PracticanteFormComponent` en modo de creación.
        -   `/practicantes/editar/:id`: Muestra `PracticanteFormComponent` en modo de edición.

### Fase 4: Estilos y UX

1.  **Estilos Globales:** Definir estilos base en `styles.css` para mantener la consistencia visual.
2.  **Estilos de Componentes:** Aplicar estilos específicos para cada componente, asegurando un diseño limpio y funcional.
3.  **Feedback al Usuario:** Implementar notificaciones o "toasts" para informar al usuario sobre el resultado de las operaciones (ej. "Practicante guardado").

### Fase 5: Pruebas

1.  **Pruebas Unitarias:** Crear pruebas para el `PracticanteService` (simulando `HttpClient`) y la lógica de los componentes.
2.  **Pruebas de Integración:** Verificar que los componentes interactúan correctamente entre sí y con el servicio.

## 3. Próximos Pasos

Comenzar con la **Fase 1** para configurar el nuevo entorno de Angular.

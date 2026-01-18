# Tasks: Sistema de Gestión de Tai Chi Chuan

**Input**: Design documents from `/specs/001-tai-chi-management/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Tests are included as per Constitution Check (Testing Standards). Tests should be written FIRST and must FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/` (as per plan.md structure)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project root structure (backend/ and frontend/ directories)
- [X] T002 [P] Initialize backend project with package.json in backend/
- [X] T003 [P] Initialize frontend project with package.json and Vite config in frontend/
- [X] T004 [P] Install backend dependencies (express, mysql2, dotenv) in backend/
- [X] T005 [P] Install frontend dependencies (vite, vitest) in frontend/
- [X] T006 [P] Configure ESLint for backend in backend/.eslintrc.js
- [X] T007 [P] Configure ESLint for frontend in frontend/.eslintrc.js
- [X] T008 [P] Create .gitignore in root with Node.js, MySQL, and IDE patterns
- [X] T009 Create environment configuration template (.env.example) in backend/
- [X] T010 [P] Setup Vitest configuration in frontend/vite.config.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T011 Create database configuration module in backend/src/config/database.js
- [X] T012 Create MySQL database schema migration script in backend/migrations/001_initial_schema.sql
- [X] T013 [P] Create error handling utilities in backend/src/utils/errors.js
- [X] T014 [P] Create validation utilities in backend/src/utils/validators.js
- [X] T015 Setup Express server structure in backend/src/api/server.js
- [X] T016 [P] Create API client module for frontend in frontend/src/js/api/client.js
- [X] T017 [P] Create error handling utilities for frontend in frontend/src/js/utils/errors.js
- [X] T018 [P] Create validation utilities for frontend in frontend/src/js/utils/validation.js
- [X] T019 [P] Create formatting utilities (dates, currency) in frontend/src/js/utils/formatting.js
- [X] T020 Create simple router for frontend in frontend/src/js/router.js
- [X] T021 Create main entry point HTML in frontend/index.html
- [X] T022 Create main entry point JavaScript in frontend/src/js/main.js
- [X] T023 [P] Create base CSS structure (main.css, layout.css, components.css) in frontend/src/css/
- [X] T024 Setup CORS middleware in backend/src/api/server.js
- [X] T025 Setup JSON body parsing middleware in backend/src/api/server.js
- [X] T026 Create base API route structure in backend/src/api/routes/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Gestión de Practicantes (Priority: P1) 🎯 MVP

**Goal**: Permitir registrar y gestionar información completa de practicantes (datos personales, contacto y salud) con búsqueda, actualización y eliminación.

**Independent Test**: Se puede probar completamente creando, consultando, actualizando y eliminando registros de practicantes. El sistema entrega valor al permitir organizar la información básica de los clientes sin necesidad de otras funcionalidades.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T027 [P] [US1] Unit test for Practicante model in backend/tests/unit/models/practicante.test.js
- [ ] T028 [P] [US1] Integration test for practicanteService in backend/tests/integration/services/practicanteService.test.js
- [ ] T029 [P] [US1] Contract test for GET /api/practicantes in backend/tests/integration/api/practicantes.test.js
- [ ] T030 [P] [US1] Contract test for POST /api/practicantes in backend/tests/integration/api/practicantes.test.js
- [ ] T031 [P] [US1] Contract test for PUT /api/practicantes/:id in backend/tests/integration/api/practicantes.test.js
- [ ] T032 [P] [US1] Contract test for DELETE /api/practicantes/:id in backend/tests/integration/api/practicantes.test.js
- [ ] T033 [P] [US1] Unit test for PracticanteForm component in frontend/tests/unit/components/PracticanteForm.test.js
- [ ] T034 [P] [US1] Unit test for PracticanteList component in frontend/tests/unit/components/PracticanteList.test.js

### Implementation for User Story 1

#### Backend - Models & Database

- [X] T035 [P] [US1] Create Practicante model in backend/src/models/Practicante.js
- [X] T036 [P] [US1] Create HistorialSalud model in backend/src/models/HistorialSalud.js (for FR-006)
- [X] T037 [US1] Add Practicante table to migration script in backend/migrations/001_initial_schema.sql
- [X] T038 [US1] Add HistorialSalud table to migration script in backend/migrations/001_initial_schema.sql
- [X] T039 [US1] Add indexes for Practicante (nombre, telefono, email) in migration script

#### Backend - Services

- [X] T040 [US1] Implement practicanteService with create method in backend/src/services/practicanteService.js
- [X] T041 [US1] Implement practicanteService with findById method in backend/src/services/practicanteService.js
- [X] T042 [US1] Implement practicanteService with findAll with search in backend/src/services/practicanteService.js
- [X] T043 [US1] Implement practicanteService with update method in backend/src/services/practicanteService.js
- [X] T044 [US1] Implement practicanteService with delete method in backend/src/services/practicanteService.js
- [X] T045 [US1] Implement health history tracking in practicanteService.update (FR-006) in backend/src/services/practicanteService.js
- [X] T046 [US1] Add validation for required fields (nombre_completo, telefono or email) in practicanteService

#### Backend - API Routes

- [X] T047 [US1] Create practicantes routes file in backend/src/api/routes/practicantes.js
- [X] T048 [US1] Implement GET /api/practicantes endpoint (list with search) in backend/src/api/routes/practicantes.js
- [X] T049 [US1] Implement GET /api/practicantes/:id endpoint (get by id) in backend/src/api/routes/practicantes.js
- [X] T050 [US1] Implement POST /api/practicantes endpoint (create) in backend/src/api/routes/practicantes.js
- [X] T051 [US1] Implement PUT /api/practicantes/:id endpoint (update) in backend/src/api/routes/practicantes.js
- [X] T052 [US1] Implement DELETE /api/practicantes/:id endpoint (delete with confirmation check) in backend/src/api/routes/practicantes.js
- [X] T053 [US1] Register practicantes routes in backend/src/api/server.js
- [X] T054 [US1] Add input validation middleware for practicantes routes in backend/src/api/routes/practicantes.js

#### Frontend - Components

- [X] T055 [P] [US1] Create PracticanteForm component in frontend/src/js/components/PracticanteForm.js
- [X] T056 [P] [US1] Create PracticanteList component in frontend/src/js/components/PracticanteList.js
- [X] T057 [P] [US1] Create PracticanteDetail component in frontend/src/js/components/PracticanteDetail.js
- [X] T058 [US1] Add form validation to PracticanteForm (required fields, email format) in frontend/src/js/components/PracticanteForm.js
- [X] T059 [US1] Add search functionality to PracticanteList in frontend/src/js/components/PracticanteList.js
- [X] T060 [US1] Add confirmation dialog for delete in PracticanteList in frontend/src/js/components/PracticanteList.js

#### Frontend - Pages

- [X] T061 [US1] Create practicantes page in frontend/src/js/pages/practicantes.js
- [X] T062 [US1] Integrate PracticanteForm, PracticanteList, and PracticanteDetail in practicantes page
- [X] T063 [US1] Add routing for /practicantes in frontend/src/js/router.js
- [X] T064 [US1] Add error handling and user feedback (success/error messages) in practicantes page

#### Frontend - Styling

- [X] T065 [P] [US1] Add styles for PracticanteForm in frontend/src/css/components.css
- [X] T066 [P] [US1] Add styles for PracticanteList in frontend/src/css/components.css
- [X] T067 [P] [US1] Add styles for PracticanteDetail in frontend/src/css/components.css
- [X] T068 [US1] Ensure accessibility (WCAG 2.1 Level AA) for practicantes components

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Practicantes can be created, searched, updated, and deleted.

---

## Phase 4: User Story 2 - Gestión de Tipos de Abonos (Priority: P2)

**Goal**: Permitir definir diferentes tipos de abonos (nombre, duración, precio) y gestionarlos (crear, buscar, actualizar, eliminar) con validación de dependencias.

**Independent Test**: Se puede probar creando diferentes tipos de abonos con sus características (nombre, duración, precio), consultándolos y modificándolos. El sistema entrega valor al permitir configurar la estructura de precios sin necesidad de tener practicantes o pagos registrados.

### Tests for User Story 2

- [ ] T069 [P] [US2] Unit test for TipoAbono model in backend/tests/unit/models/tipoAbono.test.js
- [ ] T070 [P] [US2] Integration test for abonoService (tipos) in backend/tests/integration/services/abonoService.test.js
- [ ] T071 [P] [US2] Contract test for GET /api/abonos in backend/tests/integration/api/abonos.test.js
- [ ] T072 [P] [US2] Contract test for POST /api/abonos in backend/tests/integration/api/abonos.test.js
- [ ] T073 [P] [US2] Contract test for PUT /api/abonos/:id in backend/tests/integration/api/abonos.test.js
- [ ] T074 [P] [US2] Contract test for DELETE /api/abonos/:id in backend/tests/integration/api/abonos.test.js

### Implementation for User Story 2

#### Backend - Models & Database

- [ ] T075 [P] [US2] Create TipoAbono model in backend/src/models/TipoAbono.js
- [ ] T076 [US2] Add TipoAbono table to migration script in backend/migrations/001_initial_schema.sql
- [ ] T077 [US2] Add index for TipoAbono nombre in migration script

#### Backend - Services

- [ ] T078 [US2] Implement abonoService with createTipoAbono method in backend/src/services/abonoService.js
- [ ] T079 [US2] Implement abonoService with findAllTipos with search in backend/src/services/abonoService.js
- [ ] T080 [US2] Implement abonoService with findTipoById method in backend/src/services/abonoService.js
- [ ] T081 [US2] Implement abonoService with updateTipoAbono method in backend/src/services/abonoService.js
- [ ] T082 [US2] Implement abonoService with deleteTipoAbono with dependency check (FR-011) in backend/src/services/abonoService.js
- [ ] T083 [US2] Add validation for precio and duracion_dias (positive numbers) in abonoService

#### Backend - API Routes

- [ ] T084 [US2] Create abonos routes file in backend/src/api/routes/abonos.js
- [ ] T085 [US2] Implement GET /api/abonos endpoint (list tipos with search) in backend/src/api/routes/abonos.js
- [ ] T086 [US2] Implement GET /api/abonos/:id endpoint (get tipo by id) in backend/src/api/routes/abonos.js
- [ ] T087 [US2] Implement POST /api/abonos endpoint (create tipo) in backend/src/api/routes/abonos.js
- [ ] T088 [US2] Implement PUT /api/abonos/:id endpoint (update tipo) in backend/src/api/routes/abonos.js
- [ ] T089 [US2] Implement DELETE /api/abonos/:id endpoint (delete with dependency warning) in backend/src/api/routes/abonos.js
- [ ] T090 [US2] Register abonos routes in backend/src/api/server.js

#### Frontend - Components

- [ ] T091 [P] [US2] Create AbonoForm component (for tipos) in frontend/src/js/components/AbonoForm.js
- [ ] T092 [P] [US2] Create TipoAbonoList component in frontend/src/js/components/TipoAbonoList.js
- [ ] T093 [US2] Add form validation to AbonoForm (precio, duracion_dias positive) in frontend/src/js/components/AbonoForm.js
- [ ] T094 [US2] Add search functionality to TipoAbonoList in frontend/src/js/components/TipoAbonoList.js
- [ ] T095 [US2] Add dependency warning dialog for delete in TipoAbonoList in frontend/src/js/components/TipoAbonoList.js

#### Frontend - Pages

- [ ] T096 [US2] Create abonos page (tipos) in frontend/src/js/pages/abonos.js
- [ ] T097 [US2] Integrate AbonoForm and TipoAbonoList in abonos page
- [ ] T098 [US2] Add routing for /abonos in frontend/src/js/router.js
- [ ] T099 [US2] Add error handling and user feedback in abonos page

#### Frontend - Styling

- [ ] T100 [P] [US2] Add styles for AbonoForm in frontend/src/css/components.css
- [ ] T101 [P] [US2] Add styles for TipoAbonoList in frontend/src/css/components.css

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Tipos de abonos can be created, searched, updated, and deleted.

---

## Phase 5: User Story 3 - Gestión de Pagos (Priority: P3)

**Goal**: Permitir asignar abonos a practicantes, registrar pagos, consultar historial, y mostrar estados de pago (al día, próximo a vencer, vencido).

**Independent Test**: Se puede probar registrando pagos para practicantes con diferentes tipos de abonos, consultando el historial de pagos y verificando estados de pago. El sistema entrega valor al permitir llevar un control financiero preciso y saber quién está al día.

### Tests for User Story 3

- [ ] T102 [P] [US3] Unit test for Abono model in backend/tests/unit/models/abono.test.js
- [ ] T103 [P] [US3] Unit test for Pago model in backend/tests/unit/models/pago.test.js
- [ ] T104 [P] [US3] Integration test for pagoService in backend/tests/integration/services/pagoService.test.js
- [ ] T105 [P] [US3] Integration test for abonoService (asignaciones) in backend/tests/integration/services/abonoService.test.js
- [ ] T106 [P] [US3] Contract test for POST /api/practicantes/:id/abonos in backend/tests/integration/api/abonos.test.js
- [ ] T107 [P] [US3] Contract test for GET /api/practicantes/:id/abonos in backend/tests/integration/api/abonos.test.js
- [ ] T108 [P] [US3] Contract test for POST /api/pagos in backend/tests/integration/api/pagos.test.js
- [ ] T109 [P] [US3] Contract test for GET /api/pagos in backend/tests/integration/api/pagos.test.js
- [ ] T110 [P] [US3] Contract test for GET /api/practicantes/:id/pagos in backend/tests/integration/api/pagos.test.js
- [ ] T111 [P] [US3] Contract test for GET /api/practicantes/:id/estado-pago in backend/tests/integration/api/pagos.test.js

### Implementation for User Story 3

#### Backend - Models & Database

- [ ] T112 [P] [US3] Create Abono model in backend/src/models/Abono.js
- [ ] T113 [P] [US3] Create Pago model in backend/src/models/Pago.js
- [ ] T114 [US3] Add Abono table to migration script in backend/migrations/001_initial_schema.sql
- [ ] T115 [US3] Add Pago table to migration script in backend/migrations/001_initial_schema.sql
- [ ] T116 [US3] Add foreign keys and indexes for Abono and Pago in migration script

#### Backend - Services

- [ ] T117 [US3] Implement abonoService with assignAbonoToPracticante method (FR-014) in backend/src/services/abonoService.js
- [ ] T118 [US3] Implement abonoService with calculateFechaVencimiento method (FR-016) in backend/src/services/abonoService.js
- [ ] T119 [US3] Implement abonoService with updateAbonoEstado method (activo, vencido, proximo_vencer) in backend/src/services/abonoService.js
- [ ] T120 [US3] Implement abonoService with getPracticanteAbonos method in backend/src/services/abonoService.js
- [ ] T121 [US3] Implement pagoService with create method (FR-015) in backend/src/services/pagoService.js
- [ ] T122 [US3] Implement pagoService with updateAbonoOnPago method (update abono state on payment) in backend/src/services/pagoService.js
- [ ] T123 [US3] Implement pagoService with findAll with filters in backend/src/services/pagoService.js
- [ ] T124 [US3] Implement pagoService with getPracticanteHistorial method (FR-017) in backend/src/services/pagoService.js
- [ ] T125 [US3] Implement pagoService with getPracticanteEstadoPago method (FR-019, FR-020) in backend/src/services/pagoService.js
- [ ] T126 [US3] Implement pagoService with update method (FR-018) in backend/src/services/pagoService.js
- [ ] T127 [US3] Implement pagoService with delete method with abono state update (FR-018) in backend/src/services/pagoService.js

#### Backend - API Routes

- [ ] T128 [US3] Implement POST /api/practicantes/:id/abonos endpoint (assign abono) in backend/src/api/routes/abonos.js
- [ ] T129 [US3] Implement GET /api/practicantes/:id/abonos endpoint (get practicante abonos) in backend/src/api/routes/abonos.js
- [ ] T130 [US3] Create pagos routes file in backend/src/api/routes/pagos.js
- [ ] T131 [US3] Implement POST /api/pagos endpoint (create pago) in backend/src/api/routes/pagos.js
- [ ] T132 [US3] Implement GET /api/pagos endpoint (list with filters) in backend/src/api/routes/pagos.js
- [ ] T133 [US3] Implement GET /api/pagos/:id endpoint (get by id) in backend/src/api/routes/pagos.js
- [ ] T134 [US3] Implement GET /api/practicantes/:id/pagos endpoint (historial) in backend/src/api/routes/pagos.js
- [ ] T135 [US3] Implement GET /api/practicantes/:id/estado-pago endpoint (estado) in backend/src/api/routes/pagos.js
- [ ] T136 [US3] Implement PUT /api/pagos/:id endpoint (update) in backend/src/api/routes/pagos.js
- [ ] T137 [US3] Implement DELETE /api/pagos/:id endpoint (delete with confirmation) in backend/src/api/routes/pagos.js
- [ ] T138 [US3] Register pagos routes in backend/src/api/server.js

#### Frontend - Components

- [ ] T139 [P] [US3] Create PagoForm component in frontend/src/js/components/PagoForm.js
- [ ] T140 [P] [US3] Create PagoList component in frontend/src/js/components/PagoList.js
- [ ] T141 [P] [US3] Create AbonoAsignacionForm component in frontend/src/js/components/AbonoAsignacionForm.js
- [ ] T142 [P] [US3] Create EstadoPagoIndicator component in frontend/src/js/components/EstadoPagoIndicator.js
- [ ] T143 [US3] Add form validation to PagoForm (monto positive, fecha not future) in frontend/src/js/components/PagoForm.js
- [ ] T144 [US3] Add confirmation dialog for delete in PagoList in frontend/src/js/components/PagoList.js
- [ ] T145 [US3] Integrate EstadoPagoIndicator in PracticanteList to show payment status (FR-019) in frontend/src/js/components/PracticanteList.js

#### Frontend - Pages

- [ ] T146 [US3] Create pagos page in frontend/src/js/pages/pagos.js
- [ ] T147 [US3] Integrate PagoForm, PagoList, and AbonoAsignacionForm in pagos page
- [ ] T148 [US3] Add historial de pagos view in PracticanteDetail component
- [ ] T149 [US3] Add routing for /pagos in frontend/src/js/router.js
- [ ] T150 [US3] Add error handling and user feedback in pagos page

#### Frontend - Styling

- [ ] T151 [P] [US3] Add styles for PagoForm in frontend/src/css/components.css
- [ ] T152 [P] [US3] Add styles for PagoList in frontend/src/css/components.css
- [ ] T153 [P] [US3] Add styles for EstadoPagoIndicator (color coding) in frontend/src/css/components.css

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Pagos can be registered, historial consulted, and payment states displayed.

---

## Phase 6: User Story 4 - Gestión de Asistencia a Clases (Priority: P4)

**Goal**: Permitir crear clases, registrar asistencia de practicantes, consultar historial de asistencia, y mostrar estadísticas.

**Independent Test**: Se puede probar creando clases, registrando asistencia de practicantes a esas clases, consultando el historial de asistencia por practicante y por clase. El sistema entrega valor al permitir llevar un control de quién asiste regularmente y quién necesita ser contactado.

### Tests for User Story 4

- [ ] T154 [P] [US4] Unit test for Clase model in backend/tests/unit/models/clase.test.js
- [ ] T155 [P] [US4] Unit test for Asistencia model in backend/tests/unit/models/asistencia.test.js
- [ ] T156 [P] [US4] Integration test for asistenciaService in backend/tests/integration/services/asistenciaService.test.js
- [ ] T157 [P] [US4] Contract test for POST /api/clases in backend/tests/integration/api/asistencia.test.js
- [ ] T158 [P] [US4] Contract test for GET /api/clases in backend/tests/integration/api/asistencia.test.js
- [ ] T159 [P] [US4] Contract test for POST /api/clases/:id/asistencia in backend/tests/integration/api/asistencia.test.js
- [ ] T160 [P] [US4] Contract test for GET /api/clases/:id/asistencia in backend/tests/integration/api/asistencia.test.js
- [ ] T161 [P] [US4] Contract test for GET /api/practicantes/:id/asistencia in backend/tests/integration/api/asistencia.test.js

### Implementation for User Story 4

#### Backend - Models & Database

- [ ] T162 [P] [US4] Create Clase model in backend/src/models/Clase.js
- [ ] T163 [P] [US4] Create Asistencia model in backend/src/models/Asistencia.js
- [ ] T164 [US4] Add Clase table to migration script in backend/migrations/001_initial_schema.sql
- [ ] T165 [US4] Add Asistencia table to migration script in backend/migrations/001_initial_schema.sql
- [ ] T166 [US4] Add foreign keys, indexes, and unique constraint for Asistencia in migration script

#### Backend - Services

- [ ] T167 [US4] Implement asistenciaService with createClase method (FR-021) in backend/src/services/asistenciaService.js
- [ ] T168 [US4] Implement asistenciaService with findAllClases with filters in backend/src/services/asistenciaService.js
- [ ] T169 [US4] Implement asistenciaService with registerAsistencia method (FR-022) in backend/src/services/asistenciaService.js
- [ ] T170 [US4] Implement asistenciaService with getClaseAsistencia method (FR-024) in backend/src/services/asistenciaService.js
- [ ] T171 [US4] Implement asistenciaService with getPracticanteHistorial method (FR-023) in backend/src/services/asistenciaService.js
- [ ] T172 [US4] Implement asistenciaService with updateAsistencia method (FR-025) in backend/src/services/asistenciaService.js
- [ ] T173 [US4] Implement asistenciaService with getDiasDesdeUltimaAsistencia method (FR-026) in backend/src/services/asistenciaService.js
- [ ] T174 [US4] Implement asistenciaService with getPracticanteEstadisticas method (FR-027) in backend/src/services/asistenciaService.js

#### Backend - API Routes

- [ ] T175 [US4] Create asistencia routes file in backend/src/api/routes/asistencia.js
- [ ] T176 [US4] Implement POST /api/clases endpoint (create clase) in backend/src/api/routes/asistencia.js
- [ ] T177 [US4] Implement GET /api/clases endpoint (list clases) in backend/src/api/routes/asistencia.js
- [ ] T178 [US4] Implement GET /api/clases/:id endpoint (get clase by id) in backend/src/api/routes/asistencia.js
- [ ] T179 [US4] Implement POST /api/clases/:id/asistencia endpoint (register asistencia) in backend/src/api/routes/asistencia.js
- [ ] T180 [US4] Implement GET /api/clases/:id/asistencia endpoint (get asistencia for clase) in backend/src/api/routes/asistencia.js
- [ ] T181 [US4] Implement GET /api/practicantes/:id/asistencia endpoint (historial) in backend/src/api/routes/asistencia.js
- [ ] T182 [US4] Implement GET /api/practicantes/:id/estadisticas-asistencia endpoint (estadísticas) in backend/src/api/routes/asistencia.js
- [ ] T183 [US4] Implement PUT /api/asistencia/:id endpoint (update asistencia) in backend/src/api/routes/asistencia.js
- [ ] T184 [US4] Register asistencia routes in backend/src/api/server.js

#### Frontend - Components

- [ ] T185 [P] [US4] Create AsistenciaForm component in frontend/src/js/components/AsistenciaForm.js
- [ ] T186 [P] [US4] Create ClaseForm component in frontend/src/js/components/ClaseForm.js
- [ ] T187 [P] [US4] Create ClaseList component in frontend/src/js/components/ClaseList.js
- [ ] T188 [P] [US4] Create AsistenciaList component in frontend/src/js/components/AsistenciaList.js
- [ ] T189 [US4] Add bulk asistencia registration (multiple practicantes) to AsistenciaForm in frontend/src/js/components/AsistenciaForm.js
- [ ] T190 [US4] Add estadísticas display to PracticanteDetail component in frontend/src/js/components/PracticanteDetail.js

#### Frontend - Pages

- [ ] T191 [US4] Create asistencia page in frontend/src/js/pages/asistencia.js
- [ ] T192 [US4] Integrate ClaseForm, ClaseList, AsistenciaForm, and AsistenciaList in asistencia page
- [ ] T193 [US4] Add historial de asistencia view in PracticanteDetail component
- [ ] T194 [US4] Add routing for /asistencia in frontend/src/js/router.js
- [ ] T195 [US4] Add error handling and user feedback in asistencia page

#### Frontend - Styling

- [ ] T196 [P] [US4] Add styles for AsistenciaForm in frontend/src/css/components.css
- [ ] T197 [P] [US4] Add styles for ClaseForm in frontend/src/css/components.css
- [ ] T198 [P] [US4] Add styles for ClaseList in frontend/src/css/components.css
- [ ] T199 [P] [US4] Add styles for AsistenciaList in frontend/src/css/components.css

**Checkpoint**: All user stories should now be independently functional. Asistencia can be registered, historial consulted, and estadísticas displayed.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T200 [P] Create navigation menu component in frontend/src/js/components/Navigation.js
- [ ] T201 [P] Add navigation menu to main layout in frontend/src/js/main.js
- [ ] T202 [P] Add loading states and spinners across all pages in frontend/src/js/
- [ ] T203 [P] Add consistent error message display component in frontend/src/js/components/ErrorMessage.js
- [ ] T204 [P] Add consistent success message display component in frontend/src/js/components/SuccessMessage.js
- [ ] T205 [P] Implement pagination component for lists in frontend/src/js/components/Pagination.js
- [ ] T206 [P] Add pagination to PracticanteList, TipoAbonoList, PagoList, ClaseList in frontend/src/js/components/
- [ ] T207 [P] Optimize database queries (add missing indexes, optimize JOINs) in backend/src/services/
- [ ] T208 [P] Add input sanitization for XSS prevention in backend/src/utils/validators.js
- [ ] T209 [P] Add SQL injection prevention review (ensure all queries use prepared statements) in backend/src/
- [ ] T210 [P] Add logging for all API operations in backend/src/api/routes/
- [ ] T211 [P] Add comprehensive error logging in backend/src/utils/errors.js
- [ ] T212 [P] Review and ensure WCAG 2.1 Level AA compliance across all components in frontend/src/
- [ ] T213 [P] Add keyboard navigation support for all interactive elements in frontend/src/js/components/
- [ ] T214 [P] Add ARIA labels and roles for accessibility in frontend/src/js/components/
- [ ] T215 [P] Performance testing: Verify SC-002 (búsqueda < 5 segundos) in backend/tests/integration/
- [ ] T216 [P] Performance testing: Verify SC-003 (registro pago < 30 segundos) in backend/tests/integration/
- [ ] T217 [P] Performance testing: Verify SC-005 (asistencia 10 practicantes < 1 minuto) in backend/tests/integration/
- [ ] T218 [P] Run all quickstart.md test scenarios and document results
- [ ] T219 [P] Code cleanup: Remove unused imports and dead code across project
- [ ] T220 [P] Documentation: Add JSDoc comments to all public APIs in backend/src/
- [ ] T221 [P] Documentation: Update README.md with setup instructions and architecture overview
- [ ] T222 [P] Security: Review data encryption for sensitive health information (FR-028) in backend/src/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent, no dependencies on US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 (Practicante) and US2 (TipoAbono) for abono assignments
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Depends on US1 (Practicante) for asistencia registration

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Backend before frontend (for each feature)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Frontend components marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: T027 - Unit test for Practicante model
Task: T028 - Integration test for practicanteService
Task: T029 - Contract test for GET /api/practicantes
Task: T030 - Contract test for POST /api/practicantes
Task: T031 - Contract test for PUT /api/practicantes/:id
Task: T032 - Contract test for DELETE /api/practicantes/:id
Task: T033 - Unit test for PracticanteForm component
Task: T034 - Unit test for PracticanteList component

# Launch all models for User Story 1 together:
Task: T035 - Create Practicante model
Task: T036 - Create HistorialSalud model

# Launch all frontend components together:
Task: T055 - Create PracticanteForm component
Task: T056 - Create PracticanteList component
Task: T057 - Create PracticanteDetail component
Task: T065 - Add styles for PracticanteForm
Task: T066 - Add styles for PracticanteList
Task: T067 - Add styles for PracticanteDetail
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Gestión de Practicantes)
4. **STOP and VALIDATE**: Test User Story 1 independently using quickstart.md scenarios
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add Polish phase → Final polish and optimization
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Practicantes)
   - Developer B: User Story 2 (Tipos de Abonos)
   - Developer C: User Story 3 (Pagos) - after US1 and US2 complete
   - Developer D: User Story 4 (Asistencia) - after US1 complete
3. Stories complete and integrate independently
4. All developers: Polish phase

---

## Task Summary

- **Total Tasks**: 222
- **Phase 1 (Setup)**: 10 tasks
- **Phase 2 (Foundational)**: 16 tasks
- **Phase 3 (User Story 1)**: 34 tasks (8 tests + 26 implementation)
- **Phase 4 (User Story 2)**: 33 tasks (6 tests + 27 implementation)
- **Phase 5 (User Story 3)**: 52 tasks (10 tests + 42 implementation)
- **Phase 6 (User Story 4)**: 46 tasks (8 tests + 38 implementation)
- **Phase 7 (Polish)**: 31 tasks

### Task Count per User Story

- **User Story 1 (P1)**: 34 tasks
- **User Story 2 (P2)**: 33 tasks
- **User Story 3 (P3)**: 52 tasks
- **User Story 4 (P4)**: 46 tasks

### Parallel Opportunities Identified

- **Phase 1**: 8 parallel tasks
- **Phase 2**: 12 parallel tasks
- **Phase 3**: 18 parallel tasks (tests and components)
- **Phase 4**: 12 parallel tasks
- **Phase 5**: 20 parallel tasks
- **Phase 6**: 16 parallel tasks
- **Phase 7**: 31 parallel tasks

### Independent Test Criteria for Each Story

- **User Story 1**: Create, search, update, delete practicantes independently
- **User Story 2**: Create, search, update, delete tipos de abonos independently
- **User Story 3**: Assign abonos, register pagos, consult historial, view estados independently (requires US1 and US2 data)
- **User Story 4**: Create clases, register asistencia, consult historial, view estadísticas independently (requires US1 data)

### Suggested MVP Scope

**MVP = User Story 1 (Gestión de Practicantes) only**

This delivers immediate value:
- Register and manage practicantes with complete information
- Search functionality
- Full CRUD operations
- Health history tracking
- Independent and testable

**Next Increments**:
1. MVP (US1) → Deploy
2. Add US2 (Tipos de Abonos) → Deploy
3. Add US3 (Pagos) → Deploy
4. Add US4 (Asistencia) → Deploy
5. Polish → Final release

### Format Validation

✅ **ALL tasks follow the checklist format**:
- Checkbox: `- [ ]`
- Task ID: T001, T002, etc.
- [P] marker: Included where tasks can run in parallel
- [Story] label: Included for all user story phase tasks (US1, US2, US3, US4)
- Description: Clear action with exact file path

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths follow the structure defined in plan.md (backend/src/, frontend/src/)
- Tests are included as per Constitution Check requirements

# Implementation Plan: Sistema de Gestión de Tai Chi Chuan

**Branch**: `001-tai-chi-management` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-tai-chi-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Aplicación web para gestión de practicantes de Tai Chi Chuan que permite registrar información personal, de contacto y de salud de clientes, gestionar tipos de abonos, registrar pagos y controlar asistencia a clases. La aplicación utiliza Vite como herramienta de desarrollo con mínimo de librerías, HTML/CSS/JavaScript vanilla, y almacena metadatos en una base de datos MySQL local. Las imágenes no se suben a ningún servicio externo.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3  
**Primary Dependencies**: Vite (build tool), MySQL2 (driver para Node.js), Express.js (servidor backend mínimo)  
**Storage**: MySQL local (base de datos relacional para metadatos)  
**Testing**: Vitest (testing framework integrado con Vite)  
**Target Platform**: Navegadores web modernos (Chrome, Firefox, Safari, Edge - últimas 2 versiones)  
**Project Type**: web (aplicación web full-stack con frontend y backend separados)  
**Performance Goals**: 
- Carga inicial de página < 2 segundos
- Respuesta de API < 200ms p95
- Búsqueda de practicantes < 5 segundos (SC-002)
- Registro de pago < 30 segundos (SC-003)
- Registro de asistencia de 10 practicantes < 1 minuto (SC-005)  
**Constraints**: 
- Mínimo de librerías externas (solo Vite, MySQL2, Express.js)
- HTML/CSS/JavaScript vanilla (sin frameworks como React, Vue, Angular)
- Base de datos MySQL local (no cloud)
- Sin subida de imágenes a servicios externos
- Datos sensibles de salud protegidos según estándares de privacidad  
**Scale/Scope**: 
- ~100-500 practicantes (escala pequeña-mediana)
- ~10-20 tipos de abonos
- ~1000-5000 registros de pagos históricos
- ~500-2000 clases registradas
- ~5000-20000 registros de asistencia

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality
✅ **PASS**: El proyecto utilizará HTML/CSS/JavaScript vanilla con estructura modular clara. Se seguirán convenciones de nombres consistentes, manejo de errores apropiado, y documentación para APIs públicas. No se incluirá código muerto ni imports no utilizados.

### II. Testing Standards
✅ **PASS**: Se implementarán tests unitarios para lógica de negocio y tests de integración para endpoints de API e interacciones con base de datos. Los tests se escribirán junto con la implementación. Vitest se utilizará como framework de testing integrado con Vite.

### III. User Experience Consistency
✅ **PASS**: La aplicación seguirá patrones de UX consistentes con mensajes de error claros y accionables, estados de carga, confirmaciones de éxito, y manejo de errores uniforme. Se cumplirán estándares de accesibilidad WCAG 2.1 Level AA.

### IV. Performance Requirements
✅ **PASS**: Los objetivos de rendimiento están definidos en Technical Context. Las consultas a la base de datos se optimizarán con índices apropiados. Los assets del frontend se optimizarán mediante Vite. Se considerarán estrategias de caché para datos frecuentemente accedidos.

**Resultado**: ✅ TODOS LOS GATES PASAN - Proceder con Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de conexión MySQL
│   ├── models/
│   │   ├── Practicante.js       # Modelo de practicante
│   │   ├── TipoAbono.js         # Modelo de tipo de abono
│   │   ├── Abono.js             # Modelo de abono (asignación)
│   │   ├── Pago.js              # Modelo de pago
│   │   ├── Clase.js             # Modelo de clase
│   │   └── Asistencia.js        # Modelo de asistencia
│   ├── services/
│   │   ├── practicanteService.js
│   │   ├── abonoService.js
│   │   ├── pagoService.js
│   │   └── asistenciaService.js
│   ├── api/
│   │   ├── routes/
│   │   │   ├── practicantes.js
│   │   │   ├── abonos.js
│   │   │   ├── pagos.js
│   │   │   └── asistencia.js
│   │   └── server.js            # Servidor Express
│   └── utils/
│       ├── validators.js        # Validaciones de datos
│       └── errors.js            # Manejo de errores
├── tests/
│   ├── integration/
│   │   ├── api.test.js
│   │   └── database.test.js
│   └── unit/
│       ├── services.test.js
│       └── models.test.js
├── migrations/
│   └── 001_initial_schema.sql   # Scripts de migración MySQL
└── package.json

frontend/
├── index.html                   # Punto de entrada HTML
├── src/
│   ├── css/
│   │   ├── main.css            # Estilos principales
│   │   ├── components.css      # Estilos de componentes
│   │   └── layout.css          # Estilos de layout
│   ├── js/
│   │   ├── main.js             # Punto de entrada JavaScript
│   │   ├── api/
│   │   │   └── client.js       # Cliente API para comunicación con backend
│   │   ├── components/
│   │   │   ├── PracticanteForm.js
│   │   │   ├── PracticanteList.js
│   │   │   ├── AbonoForm.js
│   │   │   ├── PagoForm.js
│   │   │   └── AsistenciaForm.js
│   │   ├── pages/
│   │   │   ├── practicantes.js
│   │   │   ├── abonos.js
│   │   │   ├── pagos.js
│   │   │   └── asistencia.js
│   │   ├── utils/
│   │   │   ├── validation.js   # Validaciones del frontend
│   │   │   ├── formatting.js   # Formateo de fechas, monedas, etc.
│   │   │   └── errors.js       # Manejo de errores del frontend
│   │   └── router.js            # Router simple vanilla JS
│   └── assets/                  # Assets estáticos (si los hay)
├── tests/
│   ├── integration/
│   │   └── api.test.js
│   └── unit/
│       ├── components.test.js
│       └── utils.test.js
├── vite.config.js               # Configuración de Vite
└── package.json

package.json                     # Package.json raíz (workspace)
```

**Structure Decision**: Se utiliza una estructura de aplicación web con frontend y backend separados. El backend utiliza Express.js como servidor mínimo con modelos, servicios y rutas API. El frontend utiliza Vite con HTML/CSS/JavaScript vanilla organizado en componentes, páginas y utilidades. Esta separación permite escalabilidad y mantenibilidad mientras mantiene el stack tecnológico mínimo requerido.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No hay violaciones de la constitución que requieran justificación. El proyecto cumple con todos los principios establecidos.

---

## Planning Progress

### Phase 0: Outline & Research ✅ COMPLETED

**Status**: Completado  
**Date**: 2026-01-15

**Artifacts Generated**:
- ✅ `research.md`: Decisiones técnicas documentadas, incluyendo:
  - Stack tecnológico (Vite + Vanilla JS + Express + MySQL)
  - Patrones de diseño y arquitectura
  - Consideraciones de seguridad y rendimiento
  - Todas las decisiones de "NEEDS CLARIFICATION" resueltas

**Key Decisions**:
- Vite como herramienta de build (sin frameworks frontend)
- Express.js como servidor backend mínimo
- MySQL local como base de datos
- MySQL2 como driver de Node.js
- Vitest como framework de testing
- Arquitectura frontend/backend separada
- Router vanilla JavaScript simple
- CSS vanilla sin preprocesadores

---

### Phase 1: Design & Contracts ✅ COMPLETED

**Status**: Completado  
**Date**: 2026-01-15

**Artifacts Generated**:
- ✅ `data-model.md`: Modelo de datos completo con:
  - 6 entidades principales (Practicante, TipoAbono, Abono, Pago, Clase, Asistencia)
  - 1 entidad adicional (HistorialSalud) para auditoría
  - Relaciones, validaciones, índices y reglas de negocio
  - Estrategia de migración y consideraciones de rendimiento

- ✅ `contracts/`: Contratos de API REST completos:
  - `practicantes.md`: Endpoints para gestión de practicantes
  - `abonos.md`: Endpoints para tipos de abonos y asignaciones
  - `pagos.md`: Endpoints para gestión de pagos
  - `asistencia.md`: Endpoints para clases y asistencia
  - Todos los endpoints documentados con request/response examples
  - Validaciones y códigos de estado HTTP

- ✅ `quickstart.md`: Guía de inicio rápido con:
  - Setup inicial paso a paso
  - 10 escenarios de prueba principales
  - Edge cases testing
  - Performance testing
  - Security testing
  - Database testing

**Constitution Check Re-evaluation**:
- ✅ **I. Code Quality**: PASS - Estructura modular definida, convenciones claras
- ✅ **II. Testing Standards**: PASS - Vitest integrado, estrategia de testing definida
- ✅ **III. User Experience Consistency**: PASS - Patrones de UX documentados en contratos
- ✅ **IV. Performance Requirements**: PASS - Objetivos medibles definidos, índices de BD planificados

**Resultado**: ✅ TODOS LOS GATES SIGUEN PASANDO después del diseño

---

### Phase 2: Task Generation

**Status**: Pending  
**Next Command**: `/speckit.tasks`

Esta fase será completada por el comando `/speckit.tasks` que generará `tasks.md` basándose en:
- Este plan (plan.md)
- La especificación (spec.md)
- Los artefactos de diseño generados (data-model.md, contracts/, quickstart.md)

---

## Generated Artifacts Summary

| Artifact | Path | Status | Description |
|----------|------|--------|-------------|
| plan.md | `specs/001-tai-chi-management/plan.md` | ✅ | Plan de implementación completo |
| research.md | `specs/001-tai-chi-management/research.md` | ✅ | Decisiones técnicas y patrones |
| data-model.md | `specs/001-tai-chi-management/data-model.md` | ✅ | Modelo de datos relacional |
| quickstart.md | `specs/001-tai-chi-management/quickstart.md` | ✅ | Guía de inicio y escenarios de prueba |
| contracts/practicantes.md | `specs/001-tai-chi-management/contracts/practicantes.md` | ✅ | API contracts para practicantes |
| contracts/abonos.md | `specs/001-tai-chi-management/contracts/abonos.md` | ✅ | API contracts para abonos |
| contracts/pagos.md | `specs/001-tai-chi-management/contracts/pagos.md` | ✅ | API contracts para pagos |
| contracts/asistencia.md | `specs/001-tai-chi-management/contracts/asistencia.md` | ✅ | API contracts para asistencia |

---

## Next Steps

1. **Ejecutar `/speckit.tasks`**: Generar la lista de tareas implementables basada en este plan
2. **Revisar artefactos generados**: Asegurar que todos los documentos están completos y consistentes
3. **Iniciar implementación**: Comenzar con las tareas según las prioridades definidas en spec.md (P1 → P2 → P3 → P4)

---

## Notes

- El plan está completo y listo para la generación de tareas
- Todos los requisitos funcionales de la especificación están cubiertos en los contratos de API
- El modelo de datos soporta todos los casos de uso definidos
- Los objetivos de rendimiento están alineados con los Success Criteria de la especificación

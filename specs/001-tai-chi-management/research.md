# Research: Sistema de Gestión de Tai Chi Chuan

**Date**: 2026-01-15  
**Feature**: 001-tai-chi-management

## Decisions Made

### 1. Stack Tecnológico: Vite + Vanilla JavaScript

**Decision**: Utilizar Vite como herramienta de build con HTML/CSS/JavaScript vanilla, sin frameworks frontend.

**Rationale**: 
- El usuario especificó explícitamente "mínimo de librerías" y "HTML, CSS, y JavaScript vanilla"
- Vite proporciona hot module replacement (HMR) y optimización de assets sin requerir frameworks pesados
- Permite desarrollo rápido y eficiente manteniendo el código simple y directo
- Compatible con testing moderno (Vitest) sin overhead adicional

**Alternatives Considered**:
- **React/Vue/Angular**: Rechazado porque el usuario requiere vanilla JavaScript
- **Webpack/Rollup**: Rechazado porque Vite es más rápido y moderno, con mejor DX
- **Sin build tool**: Rechazado porque Vite proporciona optimizaciones esenciales (minificación, bundling) sin complejidad

### 2. Backend: Express.js Minimal

**Decision**: Utilizar Express.js como servidor HTTP mínimo para el backend.

**Rationale**:
- Express.js es ligero y minimalista, cumpliendo con el requisito de "mínimo de librerías"
- Proporciona routing y middleware básico necesario para API REST
- Ampliamente documentado y mantenido
- Compatible con MySQL2 para conexiones a base de datos

**Alternatives Considered**:
- **Fastify**: Más rápido pero menos conocido, no agrega valor suficiente para este proyecto
- **Koa.js**: Similar a Express pero con sintaxis async/await, no necesario para este caso
- **Sin framework (Node.js puro)**: Rechazado porque Express simplifica significativamente el código del servidor

### 3. Base de Datos: MySQL Local

**Decision**: Utilizar MySQL como base de datos relacional local.

**Rationale**:
- El usuario especificó explícitamente "MySQL local"
- MySQL es adecuado para datos relacionales estructurados (practicantes, abonos, pagos, asistencia)
- Soporta transacciones ACID necesarias para integridad de datos financieros
- Ampliamente soportado y documentado

**Alternatives Considered**:
- **SQLite**: Más simple pero menos adecuado para aplicaciones multi-usuario
- **PostgreSQL**: Más robusto pero el usuario especificó MySQL
- **NoSQL (MongoDB)**: Inadecuado para datos relacionales estructurados

### 4. Driver de Base de Datos: MySQL2

**Decision**: Utilizar MySQL2 como driver de Node.js para MySQL.

**Rationale**:
- MySQL2 es el driver estándar y más mantenido para Node.js
- Soporta promesas y async/await nativamente
- Mejor rendimiento que mysql (driver original)
- Soporta prepared statements para seguridad

**Alternatives Considered**:
- **mysql (driver original)**: Rechazado porque MySQL2 es más moderno y performante
- **ORM (Sequelize/TypeORM)**: Rechazado porque agrega complejidad innecesaria, violando el principio de "mínimo de librerías"

### 5. Testing: Vitest

**Decision**: Utilizar Vitest como framework de testing.

**Rationale**:
- Vitest está integrado con Vite, manteniendo consistencia en el stack
- Soporta tests unitarios e integración
- Compatible con sintaxis Jest (familiar para desarrolladores)
- Rápido y eficiente

**Alternatives Considered**:
- **Jest**: Más pesado y requiere configuración adicional
- **Mocha + Chai**: Más verboso y requiere más configuración
- **Sin testing**: Rechazado porque viola Constitution Check (Testing Standards)

### 6. Arquitectura: Separación Frontend/Backend

**Decision**: Separar frontend y backend en directorios distintos.

**Rationale**:
- Permite desarrollo y despliegue independiente
- Facilita mantenimiento y escalabilidad
- Clarifica responsabilidades (frontend = UI, backend = API + lógica de negocio)
- Permite reutilización del backend si se necesita en el futuro

**Alternatives Considered**:
- **Monolito con SSR**: Rechazado porque Vite está optimizado para SPA, y no se requiere SSR
- **Todo en frontend (sin backend)**: Rechazado porque se requiere base de datos MySQL y seguridad de datos

### 7. Router Frontend: Vanilla JavaScript Simple

**Decision**: Implementar router simple en JavaScript vanilla sin librerías.

**Rationale**:
- Cumple con el requisito de "mínimo de librerías"
- Para una aplicación de gestión, un router simple es suficiente
- Evita dependencias innecesarias como React Router o Vue Router

**Alternatives Considered**:
- **React Router/Vue Router**: Rechazado porque requiere frameworks
- **Page.js**: Librería ligera pero aún es una dependencia adicional innecesaria

### 8. Manejo de Estado: Vanilla JavaScript (Sin State Management)

**Decision**: No utilizar librerías de manejo de estado, usar JavaScript vanilla con módulos ES6.

**Rationale**:
- Para el alcance de esta aplicación, el estado puede manejarse con módulos JavaScript simples
- Evita complejidad innecesaria
- Cumple con el principio de "mínimo de librerías"

**Alternatives Considered**:
- **Redux/Vuex**: Rechazado porque son frameworks pesados e innecesarios para este caso
- **Zustand/Pinia**: Más ligeros pero aún son dependencias adicionales

### 9. Validación: JavaScript Vanilla + Validaciones del Backend

**Decision**: Implementar validación tanto en frontend (JavaScript vanilla) como en backend.

**Rationale**:
- Validación en frontend proporciona feedback inmediato al usuario
- Validación en backend es crítica para seguridad e integridad de datos
- JavaScript vanilla es suficiente para validaciones básicas

**Alternatives Considered**:
- **Librerías de validación (Joi, Yup)**: Rechazadas porque agregan dependencias innecesarias
- **Solo validación backend**: Rechazado porque la UX se degrada sin feedback inmediato

### 10. Estilos: CSS Vanilla (Sin Preprocesadores)

**Decision**: Utilizar CSS vanilla sin preprocesadores (SASS, LESS) ni frameworks CSS.

**Rationale**:
- Cumple con el requisito de "HTML, CSS, y JavaScript vanilla"
- CSS moderno (CSS3) es suficiente para los requisitos de UI
- Evita dependencias y complejidad de build adicional

**Alternatives Considered**:
- **SASS/LESS**: Rechazados porque agregan dependencias y complejidad
- **Tailwind CSS/Bootstrap**: Rechazados porque son frameworks y el usuario requiere vanilla
- **CSS-in-JS**: Rechazado porque requiere librerías adicionales

## Technical Patterns

### API REST Design
- Utilizar estándares REST: GET (lectura), POST (creación), PUT (actualización), DELETE (eliminación)
- Endpoints organizados por recurso: `/api/practicantes`, `/api/abonos`, `/api/pagos`, `/api/asistencia`
- Respuestas JSON consistentes con formato estándar

### Database Schema
- Utilizar relaciones relacionales apropiadas (foreign keys)
- Índices en campos de búsqueda frecuente (nombre, email, teléfono)
- Timestamps automáticos para auditoría (created_at, updated_at)

### Error Handling
- Errores HTTP estándar (400, 404, 500, etc.)
- Mensajes de error claros y accionables para el usuario
- Logging de errores en backend para debugging

### Security Considerations
- Validación y sanitización de inputs en backend
- Protección de datos sensibles de salud (encriptación en reposo si es necesario)
- Prevención de SQL injection mediante prepared statements
- CORS configurado apropiadamente para desarrollo y producción

## Open Questions Resolved

✅ **Stack tecnológico**: Vite + Vanilla JS + Express + MySQL  
✅ **Estructura de proyecto**: Frontend/Backend separados  
✅ **Testing**: Vitest  
✅ **Validación**: Vanilla JS + validación backend  
✅ **Estilos**: CSS vanilla  
✅ **Router**: Implementación vanilla simple  
✅ **Estado**: Módulos JavaScript ES6  

## Remaining Considerations

- **Despliegue**: No especificado en requisitos, fuera del alcance inicial
- **Autenticación**: No especificada en requisitos, asumimos aplicación de uso interno/single-user
- **Backup de base de datos**: Consideración importante pero fuera del alcance inicial del plan

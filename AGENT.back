# Contexto del Proyecto: Sistema de Gestión de Clases

## Stack Tecnológico
- **Backend:** Node.js (Express) con Módulos ES (ESM).
- **Frontend:** Vite + Vanilla JavaScript (Componentes modulares).
- **Base de Datos:** MySQL (mysql2/promise).
- **Autenticación:** JWT (JSON Web Tokens).
- **Persistencia de Memoria:** Engram (usar herramientas `mem_*`).

## Estructura del Proyecto
- `/backend`: Servidor API Express. Sigue el patrón Model-Route-Service.
- `/backend/migrations`: Archivos SQL correlativos (001 a 056).
- `/frontend`: Aplicación SPA con Vite.
- `/specs`: Documentación de Spec-Driven Development (SDD).

## Convenciones de Código
- **Estilo:** Usar Arrow Functions para controladores y servicios.
- **Nomenclatura:** camelCase para variables/funciones, PascalCase para clases/modelos.
- **Base de Datos:** No modificar el esquema sin crear una nueva migración en `/backend/migrations`.
- **Frontend:** Mantener el sistema de ruteo personalizado actual; no instalar librerías de terceros sin consultar.

## Flujo de Trabajo (Gentleman AI Stack)
- **Metodología:** Seguir estrictamente el flujo SDD (`/sdd-new`, `/sdd-propose`, etc.).
- **Memoria:** Tras finalizar una tarea o decidir un cambio arquitectónico, ejecutar `mem_save` en Engram.
- **Calidad:** Todo nuevo endpoint en el backend DEBE incluir un test de integración en `/backend/tests`.
- **GIT:** Commits siguiendo el estándar Conventional Commits (ej: `feat:`, `fix:`).

## Prohibiciones
- NO exceder este archivo de las 500 líneas.
- NO guardar credenciales o secretos en texto plano; usar variables de entorno.
- NO ignorar los errores detectados por el sub-agente `Verifier`.


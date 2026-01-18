# Data Model: Sistema de Gestión de Tai Chi Chuan

**Date**: 2026-01-15  
**Feature**: 001-tai-chi-management

## Overview

El modelo de datos está diseñado para soportar la gestión de practicantes, abonos, pagos y asistencia a clases. Utiliza una base de datos MySQL relacional con relaciones apropiadas entre entidades.

## Entities

### 1. Practicante

Representa un cliente que asiste a las clases de tai chi chuan.

**Fields**:
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT): Identificador único
- `nombre_completo` (VARCHAR(255), NOT NULL): Nombre completo del practicante
- `fecha_nacimiento` (DATE, NULL): Fecha de nacimiento (opcional)
- `genero` (ENUM('M', 'F', 'Otro', 'Prefiero no decir'), NULL): Género (opcional)
- `telefono` (VARCHAR(20), NULL): Teléfono de contacto
- `email` (VARCHAR(255), NULL): Email de contacto
- `direccion` (TEXT, NULL): Dirección completa
- `condiciones_medicas` (TEXT, NULL): Condiciones médicas relevantes
- `medicamentos` (TEXT, NULL): Medicamentos que toma
- `limitaciones_fisicas` (TEXT, NULL): Limitaciones físicas
- `alergias` (TEXT, NULL): Alergias conocidas
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP): Fecha de última actualización

**Validation Rules**:
- `nombre_completo` es obligatorio (FR-005)
- Al menos uno de `telefono` o `email` debe estar presente (FR-005)
- `email` debe tener formato válido si está presente

**Relationships**:
- Uno a muchos con `Abono` (un practicante puede tener múltiples abonos a lo largo del tiempo)
- Uno a muchos con `Pago` (un practicante puede tener múltiples pagos)
- Uno a muchos con `Asistencia` (un practicante puede asistir a múltiples clases)

**Indexes**:
- `idx_nombre` en `nombre_completo` (para búsqueda rápida - FR-002)
- `idx_telefono` en `telefono` (para búsqueda rápida - FR-002)
- `idx_email` en `email` (para búsqueda rápida - FR-002)

### 2. TipoAbono

Representa una categoría de abono que puede ser ofrecida a los practicantes.

**Fields**:
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT): Identificador único
- `nombre` (VARCHAR(255), NOT NULL): Nombre del tipo de abono (ej: "Mensual", "Trimestral", "Anual", "Clase Suelta")
- `duracion_dias` (INT, NOT NULL): Duración del abono en días
- `precio` (DECIMAL(10,2), NOT NULL): Precio del abono
- `descripcion` (TEXT, NULL): Descripción opcional del abono
- `activo` (BOOLEAN, DEFAULT TRUE): Indica si el tipo de abono está activo
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP): Fecha de última actualización

**Validation Rules**:
- `nombre` es obligatorio (FR-008)
- `duracion_dias` debe ser un número positivo (FR-012)
- `precio` debe ser un número positivo (FR-012)

**Relationships**:
- Uno a muchos con `Abono` (un tipo de abono puede estar asignado a múltiples practicantes)

**Indexes**:
- `idx_nombre` en `nombre` (para búsqueda rápida - FR-009)

**Business Rules**:
- No se puede eliminar un tipo de abono si hay abonos activos asociados (FR-011)
- La actualización de precio o duración no afecta abonos ya asignados (FR-010)

### 3. Abono

Representa la relación entre un practicante y un tipo de abono, con fechas de inicio y vencimiento.

**Fields**:
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT): Identificador único
- `practicante_id` (INT, NOT NULL, FOREIGN KEY): Referencia al practicante
- `tipo_abono_id` (INT, NOT NULL, FOREIGN KEY): Referencia al tipo de abono
- `fecha_inicio` (DATE, NOT NULL): Fecha de inicio del abono
- `fecha_vencimiento` (DATE, NOT NULL): Fecha de vencimiento del abono (calculada automáticamente - FR-016)
- `estado` (ENUM('activo', 'vencido', 'proximo_vencer'), DEFAULT 'activo'): Estado del abono
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP): Fecha de última actualización

**Validation Rules**:
- `fecha_vencimiento` debe ser mayor que `fecha_inicio`
- `fecha_vencimiento` se calcula automáticamente: `fecha_inicio + duracion_dias` (FR-016)

**Relationships**:
- Muchos a uno con `Practicante` (un abono pertenece a un practicante)
- Muchos a uno con `TipoAbono` (un abono es de un tipo específico)
- Uno a muchos con `Pago` (un abono puede tener múltiples pagos asociados)

**Indexes**:
- `idx_practicante` en `practicante_id` (para consultas por practicante)
- `idx_estado` en `estado` (para filtrar por estado - FR-019)
- `idx_fecha_vencimiento` en `fecha_vencimiento` (para identificar abonos próximos a vencer)

**Business Rules**:
- Solo un abono puede estar "activo" por practicante a la vez (lógica de negocio)
- El estado se actualiza automáticamente basándose en `fecha_vencimiento`:
  - "activo": `fecha_vencimiento >= hoy`
  - "proximo_vencer": `fecha_vencimiento` está entre hoy y 7 días
  - "vencido": `fecha_vencimiento < hoy`

### 4. Pago

Representa una transacción de pago realizada por un practicante.

**Fields**:
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT): Identificador único
- `practicante_id` (INT, NOT NULL, FOREIGN KEY): Referencia al practicante
- `abono_id` (INT, NOT NULL, FOREIGN KEY): Referencia al abono asociado
- `fecha` (DATE, NOT NULL): Fecha del pago
- `monto` (DECIMAL(10,2), NOT NULL): Monto del pago
- `metodo_pago` (ENUM('efectivo', 'transferencia', 'tarjeta', 'otro'), NOT NULL): Método de pago utilizado
- `notas` (TEXT, NULL): Notas adicionales sobre el pago
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP): Fecha de creación del registro
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP): Fecha de última actualización

**Validation Rules**:
- `monto` debe ser un número positivo
- `fecha` no puede ser futura (validación de negocio)

**Relationships**:
- Muchos a uno con `Practicante` (un pago pertenece a un practicante)
- Muchos a uno con `Abono` (un pago está asociado a un abono)

**Indexes**:
- `idx_practicante` en `practicante_id` (para historial de pagos - FR-017)
- `idx_fecha` en `fecha` (para ordenar pagos por fecha)
- `idx_abono` en `abono_id` (para consultas por abono)

**Business Rules**:
- Al registrar un pago, se crea o actualiza el abono del practicante (FR-014, FR-016)
- El monto del pago puede diferir del precio del tipo de abono (permite descuentos/ajustes)

### 5. Clase

Representa una sesión de tai chi chuan con fecha y hora específicas.

**Fields**:
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT): Identificador único
- `fecha` (DATE, NOT NULL): Fecha de la clase
- `hora` (TIME, NOT NULL): Hora de inicio de la clase
- `descripcion` (TEXT, NULL): Descripción opcional de la clase
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP): Fecha de creación del registro
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP): Fecha de última actualización

**Validation Rules**:
- `fecha` y `hora` son obligatorios (FR-021)

**Relationships**:
- Uno a muchos con `Asistencia` (una clase puede tener múltiples registros de asistencia)

**Indexes**:
- `idx_fecha` en `fecha` (para ordenar clases por fecha)
- `idx_fecha_hora` en `fecha, hora` (para búsquedas por fecha y hora)

### 6. Asistencia

Representa la participación de un practicante en una clase específica.

**Fields**:
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT): Identificador único
- `practicante_id` (INT, NOT NULL, FOREIGN KEY): Referencia al practicante
- `clase_id` (INT, NOT NULL, FOREIGN KEY): Referencia a la clase
- `asistio` (BOOLEAN, DEFAULT TRUE): Indica si el practicante asistió (permite marcar/desmarcar - FR-025)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP): Fecha de creación del registro
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP): Fecha de última actualización

**Validation Rules**:
- No puede haber registros duplicados de asistencia para el mismo `practicante_id` y `clase_id`

**Relationships**:
- Muchos a uno con `Practicante` (una asistencia pertenece a un practicante)
- Muchos a uno con `Clase` (una asistencia pertenece a una clase)

**Indexes**:
- `idx_practicante` en `practicante_id` (para historial de asistencia - FR-023)
- `idx_clase` en `clase_id` (para lista de asistentes por clase - FR-024)
- `UNIQUE idx_practicante_clase` en `(practicante_id, clase_id)` (previene duplicados)

**Business Rules**:
- Se puede marcar/desmarcar asistencia (FR-025)
- Un practicante puede tener múltiples registros de asistencia (una por clase)

## Additional Tables

### 7. HistorialSalud (Opcional - para FR-006)

Para mantener historial de cambios en datos de salud de practicantes.

**Fields**:
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT): Identificador único
- `practicante_id` (INT, NOT NULL, FOREIGN KEY): Referencia al practicante
- `campo_modificado` (VARCHAR(100), NOT NULL): Nombre del campo modificado (condiciones_medicas, medicamentos, etc.)
- `valor_anterior` (TEXT, NULL): Valor anterior del campo
- `valor_nuevo` (TEXT, NULL): Valor nuevo del campo
- `fecha_modificacion` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP): Fecha de la modificación

**Relationships**:
- Muchos a uno con `Practicante` (un historial pertenece a un practicante)

**Indexes**:
- `idx_practicante` en `practicante_id` (para consultar historial por practicante)

## Database Schema Diagram

```
Practicante (1) ──< (N) Abono
                      │
                      │ (1)
                      │
                      └─── (N) Pago

TipoAbono (1) ──< (N) Abono

Practicante (1) ──< (N) Asistencia
                      │
                      │ (N)
                      │
Clase (1) ────────────┘

Practicante (1) ──< (N) HistorialSalud
```

## Migration Strategy

1. Crear tablas en orden de dependencias:
   - Practicante (sin dependencias)
   - TipoAbono (sin dependencias)
   - Abono (depende de Practicante y TipoAbono)
   - Pago (depende de Practicante y Abono)
   - Clase (sin dependencias)
   - Asistencia (depende de Practicante y Clase)
   - HistorialSalud (depende de Practicante)

2. Crear índices después de crear tablas

3. Crear foreign keys con restricciones apropiadas:
   - ON DELETE RESTRICT para prevenir eliminación accidental
   - ON UPDATE CASCADE para mantener integridad referencial

## Data Integrity Rules

1. **Cascading Deletes**: 
   - Eliminar un practicante elimina sus abonos, pagos, asistencia e historial de salud (con confirmación - FR-004)
   - Eliminar un tipo de abono requiere verificar que no haya abonos activos (FR-011)

2. **Unique Constraints**:
   - Asistencia: único por (practicante_id, clase_id)

3. **Check Constraints**:
   - `duracion_dias > 0` en TipoAbono
   - `precio > 0` en TipoAbono
   - `monto > 0` en Pago
   - `fecha_vencimiento > fecha_inicio` en Abono

## Performance Considerations

1. **Indexes**: Todos los campos de búsqueda frecuente tienen índices
2. **Queries Optimization**: 
   - Usar JOINs apropiados para evitar N+1 queries
   - Considerar vistas materializadas para reportes frecuentes
3. **Pagination**: Implementar paginación en listas grandes (practicantes, pagos, clases)

## Security Considerations

1. **Data Encryption**: Datos sensibles de salud deben considerarse para encriptación en reposo (FR-028)
2. **Access Control**: Asumir aplicación single-user por ahora (autenticación fuera del alcance inicial)
3. **SQL Injection Prevention**: Usar prepared statements en todas las consultas

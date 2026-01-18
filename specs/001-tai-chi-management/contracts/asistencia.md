# API Contracts: Asistencia a Clases

**Resource**: `/api/clases` y `/api/asistencia`  
**Base URL**: `http://localhost:3000/api`

## Endpoints: Clases

### GET /api/clases

Obtiene la lista de clases registradas.

**Query Parameters**:
- `fecha_desde` (date, optional): Filtrar desde fecha (formato YYYY-MM-DD)
- `fecha_hasta` (date, optional): Filtrar hasta fecha (formato YYYY-MM-DD)
- `page` (integer, optional, default: 1): Número de página
- `limit` (integer, optional, default: 50): Cantidad de resultados por página

**Response 200 OK**:
```json
{
  "data": [
    {
      "id": 1,
      "fecha": "2026-01-15",
      "hora": "18:00:00",
      "descripcion": "Clase regular de Tai Chi",
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### GET /api/clases/:id

Obtiene una clase específica por ID.

**Path Parameters**:
- `id` (integer, required): ID de la clase

**Response 200 OK**:
```json
{
  "data": {
    "id": 1,
    "fecha": "2026-01-15",
    "hora": "18:00:00",
    "descripcion": "Clase regular de Tai Chi",
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
}
```

**Response 404 Not Found**:
```json
{
  "error": "Clase not found",
  "details": "No clase found with id 999"
}
```

---

### POST /api/clases

Crea una nueva clase (FR-021).

**Request Body**:
```json
{
  "fecha": "2026-01-15",
  "hora": "18:00:00",
  "descripcion": "Clase regular de Tai Chi"
}
```

**Validation Rules**:
- `fecha` (required): Debe ser una fecha válida en formato YYYY-MM-DD
- `hora` (required): Debe ser una hora válida en formato HH:MM:SS
- `descripcion` (optional): Cadena de texto

**Response 201 Created**:
```json
{
  "data": {
    "id": 1,
    "fecha": "2026-01-15",
    "hora": "18:00:00",
    "descripcion": "Clase regular de Tai Chi",
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
}
```

---

### PUT /api/clases/:id

Actualiza una clase existente.

**Path Parameters**:
- `id` (integer, required): ID de la clase

**Request Body** (todos los campos son opcionales):
```json
{
  "descripcion": "Clase especial de Tai Chi"
}
```

**Response 200 OK**: Mismo formato que GET /api/clases/:id

---

### DELETE /api/clases/:id

Elimina una clase (y todos sus registros de asistencia asociados).

**Path Parameters**:
- `id` (integer, required): ID de la clase

**Response 200 OK**:
```json
{
  "message": "Clase deleted successfully",
  "data": {
    "id": 1
  }
}
```

---

## Endpoints: Asistencia

### GET /api/clases/:id/asistencia

Obtiene la lista de asistentes y no asistentes para una clase específica (FR-024).

**Path Parameters**:
- `id` (integer, required): ID de la clase

**Response 200 OK**:
```json
{
  "data": {
    "clase": {
      "id": 1,
      "fecha": "2026-01-15",
      "hora": "18:00:00",
      "descripcion": "Clase regular de Tai Chi"
    },
    "asistentes": [
      {
        "id": 1,
        "practicante_id": 1,
        "practicante": {
          "id": 1,
          "nombre_completo": "Juan Pérez"
        },
        "asistio": true,
        "created_at": "2026-01-15T18:00:00Z"
      }
    ],
    "no_asistentes": [
      {
        "id": 2,
        "nombre_completo": "María García"
      }
    ],
    "total_asistentes": 1,
    "total_no_asistentes": 1
  }
}
```

**Note**: `no_asistentes` incluye todos los practicantes registrados que no tienen un registro de asistencia para esta clase.

---

### POST /api/clases/:id/asistencia

Registra la asistencia de múltiples practicantes a una clase (FR-022).

**Path Parameters**:
- `id` (integer, required): ID de la clase

**Request Body**:
```json
{
  "practicantes": [
    {
      "practicante_id": 1,
      "asistio": true
    },
    {
      "practicante_id": 2,
      "asistio": false
    }
  ]
}
```

**Validation Rules**:
- `practicantes` (required): Array de objetos con `practicante_id` y `asistio`
- `practicante_id` (required): Debe existir en la base de datos
- `asistio` (required): Boolean

**Response 201 Created**:
```json
{
  "message": "Asistencia registered successfully",
  "data": {
    "clase_id": 1,
    "registros_creados": 2,
    "asistencia": [
      {
        "id": 1,
        "practicante_id": 1,
        "clase_id": 1,
        "asistio": true,
        "created_at": "2026-01-15T18:00:00Z"
      },
      {
        "id": 2,
        "practicante_id": 2,
        "clase_id": 1,
        "asistio": false,
        "created_at": "2026-01-15T18:00:00Z"
      }
    ]
  }
}
```

**Response 400 Bad Request**:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "practicantes[0].practicante_id",
      "message": "practicante_id must exist"
    }
  ]
}
```

---

### PUT /api/asistencia/:id

Actualiza un registro de asistencia específico (FR-025).

**Path Parameters**:
- `id` (integer, required): ID del registro de asistencia

**Request Body**:
```json
{
  "asistio": false
}
```

**Response 200 OK**:
```json
{
  "data": {
    "id": 1,
    "practicante_id": 1,
    "practicante": {
      "id": 1,
      "nombre_completo": "Juan Pérez"
    },
    "clase_id": 1,
    "clase": {
      "id": 1,
      "fecha": "2026-01-15",
      "hora": "18:00:00"
    },
    "asistio": false,
    "created_at": "2026-01-15T18:00:00Z",
    "updated_at": "2026-01-15T19:00:00Z"
  }
}
```

---

### DELETE /api/asistencia/:id

Elimina un registro de asistencia.

**Path Parameters**:
- `id` (integer, required): ID del registro de asistencia

**Response 200 OK**:
```json
{
  "message": "Asistencia deleted successfully",
  "data": {
    "id": 1
  }
}
```

---

### GET /api/practicantes/:id/asistencia

Obtiene el historial de asistencia de un practicante (FR-023).

**Path Parameters**:
- `id` (integer, required): ID del practicante

**Query Parameters**:
- `fecha_desde` (date, optional): Filtrar desde fecha
- `fecha_hasta` (date, optional): Filtrar hasta fecha
- `page` (integer, optional, default: 1): Número de página
- `limit` (integer, optional, default: 50): Cantidad de resultados por página

**Response 200 OK**:
```json
{
  "data": [
    {
      "id": 1,
      "clase_id": 1,
      "clase": {
        "id": 1,
        "fecha": "2026-01-15",
        "hora": "18:00:00",
        "descripcion": "Clase regular de Tai Chi"
      },
      "asistio": true,
      "created_at": "2026-01-15T18:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  },
  "estadisticas": {
    "total_clases": 10,
    "total_asistencias": 8,
    "porcentaje_asistencia": 80.0,
    "ultima_asistencia": "2026-01-15",
    "dias_desde_ultima_asistencia": 0
  }
}
```

**Note**: Los registros se ordenan por fecha descendente (más recientes primero). Las estadísticas incluyen información calculada (FR-026, FR-027).

---

### GET /api/practicantes/:id/estadisticas-asistencia

Obtiene estadísticas detalladas de asistencia de un practicante (FR-027).

**Path Parameters**:
- `id` (integer, required): ID del practicante

**Response 200 OK**:
```json
{
  "data": {
    "practicante_id": 1,
    "total_clases": 50,
    "total_asistencias": 40,
    "total_ausencias": 10,
    "porcentaje_asistencia": 80.0,
    "ultima_asistencia": "2026-01-15",
    "dias_desde_ultima_asistencia": 0,
    "promedio_semanal": 2.5,
    "patron_asistencia": {
      "lunes": 8,
      "martes": 7,
      "miercoles": 9,
      "jueves": 6,
      "viernes": 10
    }
  }
}
```

---

## Error Response Format

Mismo formato que practicantes.md

## Status Codes

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error de validación
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

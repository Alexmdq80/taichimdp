# API Contracts: Tipos de Abonos

**Resource**: `/api/abonos` (tipos de abonos)  
**Base URL**: `http://localhost:3000/api/abonos`

## Endpoints

### GET /api/abonos

Obtiene la lista de tipos de abonos disponibles.

**Query Parameters**:
- `search` (string, optional): Búsqueda por nombre
- `activo` (boolean, optional): Filtrar por estado activo/inactivo
- `page` (integer, optional, default: 1): Número de página
- `limit` (integer, optional, default: 50): Cantidad de resultados por página

**Response 200 OK**:
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Mensual",
      "duracion_dias": 30,
      "precio": 50.00,
      "descripcion": "Abono mensual estándar",
      "activo": true,
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

### GET /api/abonos/:id

Obtiene un tipo de abono específico por ID.

**Path Parameters**:
- `id` (integer, required): ID del tipo de abono

**Response 200 OK**:
```json
{
  "data": {
    "id": 1,
    "nombre": "Mensual",
    "duracion_dias": 30,
    "precio": 50.00,
    "descripcion": "Abono mensual estándar",
    "activo": true,
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
}
```

**Response 404 Not Found**:
```json
{
  "error": "Tipo de abono not found",
  "details": "No tipo de abono found with id 999"
}
```

---

### POST /api/abonos

Crea un nuevo tipo de abono.

**Request Body**:
```json
{
  "nombre": "Mensual",
  "duracion_dias": 30,
  "precio": 50.00,
  "descripcion": "Abono mensual estándar"
}
```

**Validation Rules**:
- `nombre` (required): Debe ser una cadena no vacía
- `duracion_dias` (required): Debe ser un entero positivo
- `precio` (required): Debe ser un número positivo
- `descripcion` (optional): Cadena de texto

**Response 201 Created**:
```json
{
  "data": {
    "id": 1,
    "nombre": "Mensual",
    "duracion_dias": 30,
    "precio": 50.00,
    "descripcion": "Abono mensual estándar",
    "activo": true,
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
}
```

**Response 400 Bad Request**:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "precio",
      "message": "precio must be a positive number"
    }
  ]
}
```

---

### PUT /api/abonos/:id

Actualiza un tipo de abono existente.

**Path Parameters**:
- `id` (integer, required): ID del tipo de abono

**Request Body** (todos los campos son opcionales):
```json
{
  "precio": 55.00,
  "duracion_dias": 31
}
```

**Response 200 OK**: Mismo formato que GET /api/abonos/:id

**Note**: La actualización de precio o duración no afecta abonos ya asignados (FR-010).

---

### DELETE /api/abonos/:id

Elimina un tipo de abono (con advertencia si hay practicantes asociados - FR-011).

**Path Parameters**:
- `id` (integer, required): ID del tipo de abono

**Response 200 OK**:
```json
{
  "message": "Tipo de abono deleted successfully",
  "data": {
    "id": 1
  }
}
```

**Response 409 Conflict** (si hay practicantes usando este tipo de abono):
```json
{
  "error": "Cannot delete tipo de abono",
  "details": "This tipo de abono is currently assigned to 5 practicantes. Please reassign or remove those abonos first.",
  "practicantes_count": 5
}
```

---

## API Contracts: Asignación de Abonos a Practicantes

**Resource**: `/api/practicantes/:id/abonos`  
**Base URL**: `http://localhost:3000/api/practicantes/:id/abonos`

### GET /api/practicantes/:id/abonos

Obtiene los abonos (asignaciones) de un practicante específico.

**Path Parameters**:
- `id` (integer, required): ID del practicante

**Query Parameters**:
- `estado` (string, optional): Filtrar por estado ('activo', 'vencido', 'proximo_vencer')

**Response 200 OK**:
```json
{
  "data": [
    {
      "id": 1,
      "practicante_id": 1,
      "tipo_abono_id": 1,
      "tipo_abono": {
        "id": 1,
        "nombre": "Mensual",
        "duracion_dias": 30,
        "precio": 50.00
      },
      "fecha_inicio": "2026-01-01",
      "fecha_vencimiento": "2026-01-31",
      "estado": "activo",
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-01T10:00:00Z"
    }
  ]
}
```

---

### POST /api/practicantes/:id/abonos

Asigna un nuevo abono a un practicante (FR-014).

**Path Parameters**:
- `id` (integer, required): ID del practicante

**Request Body**:
```json
{
  "tipo_abono_id": 1,
  "fecha_inicio": "2026-01-15"
}
```

**Validation Rules**:
- `tipo_abono_id` (required): Debe existir en la base de datos
- `fecha_inicio` (required): Debe ser una fecha válida en formato YYYY-MM-DD

**Response 201 Created**:
```json
{
  "data": {
    "id": 1,
    "practicante_id": 1,
    "tipo_abono_id": 1,
    "tipo_abono": {
      "id": 1,
      "nombre": "Mensual",
      "duracion_dias": 30,
      "precio": 50.00
    },
    "fecha_inicio": "2026-01-15",
    "fecha_vencimiento": "2026-02-14",
    "estado": "activo",
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
}
```

**Note**: `fecha_vencimiento` se calcula automáticamente: `fecha_inicio + duracion_dias` del tipo de abono (FR-016).

---

## Error Response Format

Mismo formato que practicantes.md

## Status Codes

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error de validación
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto de estado
- `500 Internal Server Error`: Error del servidor

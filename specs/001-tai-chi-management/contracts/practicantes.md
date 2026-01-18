# API Contracts: Practicantes

**Resource**: `/api/practicantes`  
**Base URL**: `http://localhost:3000/api/practicantes`

## Endpoints

### GET /api/practicantes

Obtiene la lista de practicantes con opción de búsqueda y filtrado.

**Query Parameters**:
- `search` (string, optional): Búsqueda por nombre, teléfono o email
- `page` (integer, optional, default: 1): Número de página para paginación
- `limit` (integer, optional, default: 50): Cantidad de resultados por página

**Response 200 OK**:
```json
{
  "data": [
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
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  }
}
```

**Response 400 Bad Request** (parámetros inválidos):
```json
{
  "error": "Invalid query parameters",
  "details": "page must be a positive integer"
}
```

---

### GET /api/practicantes/:id

Obtiene un practicante específico por ID.

**Path Parameters**:
- `id` (integer, required): ID del practicante

**Response 200 OK**:
```json
{
  "data": {
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
}
```

**Response 404 Not Found**:
```json
{
  "error": "Practicante not found",
  "details": "No practicante found with id 999"
}
```

---

### POST /api/practicantes

Crea un nuevo practicante.

**Request Body**:
```json
{
  "nombre_completo": "Juan Pérez",
  "fecha_nacimiento": "1985-05-15",
  "genero": "M",
  "telefono": "+1234567890",
  "email": "juan@example.com",
  "direccion": "Calle Principal 123",
  "condiciones_medicas": "Hipertensión",
  "medicamentos": "Medicamento X",
  "limitaciones_fisicas": "Problemas de rodilla",
  "alergias": "Ninguna"
}
```

**Validation Rules**:
- `nombre_completo` (required): Debe ser una cadena no vacía
- `telefono` o `email` (required): Al menos uno debe estar presente
- `email` (optional): Si está presente, debe ser un email válido
- `fecha_nacimiento` (optional): Debe ser una fecha válida en formato YYYY-MM-DD

**Response 201 Created**:
```json
{
  "data": {
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
}
```

**Response 400 Bad Request** (validación fallida):
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "nombre_completo",
      "message": "nombre_completo is required"
    },
    {
      "field": "telefono",
      "message": "At least one of telefono or email must be provided"
    }
  ]
}
```

---

### PUT /api/practicantes/:id

Actualiza un practicante existente.

**Path Parameters**:
- `id` (integer, required): ID del practicante

**Request Body** (todos los campos son opcionales, solo enviar los que se desean actualizar):
```json
{
  "nombre_completo": "Juan Pérez García",
  "telefono": "+1234567891",
  "condiciones_medicas": "Hipertensión, Diabetes"
}
```

**Response 200 OK**:
```json
{
  "data": {
    "id": 1,
    "nombre_completo": "Juan Pérez García",
    "fecha_nacimiento": "1985-05-15",
    "genero": "M",
    "telefono": "+1234567891",
    "email": "juan@example.com",
    "direccion": "Calle Principal 123",
    "condiciones_medicas": "Hipertensión, Diabetes",
    "medicamentos": "Medicamento X",
    "limitaciones_fisicas": "Problemas de rodilla",
    "alergias": "Ninguna",
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T18:00:00Z"
  }
}
```

**Response 404 Not Found**: Mismo formato que GET /api/practicantes/:id

**Response 400 Bad Request**: Mismo formato que POST /api/practicantes

---

### DELETE /api/practicantes/:id

Elimina un practicante (requiere confirmación en frontend - FR-004).

**Path Parameters**:
- `id` (integer, required): ID del practicante

**Response 200 OK**:
```json
{
  "message": "Practicante deleted successfully",
  "data": {
    "id": 1
  }
}
```

**Response 404 Not Found**: Mismo formato que GET /api/practicantes/:id

**Response 409 Conflict** (si hay datos relacionados que impiden eliminación):
```json
{
  "error": "Cannot delete practicante",
  "details": "Practicante has active abonos or payments. Please handle them first."
}
```

---

## Error Response Format

Todos los errores siguen este formato estándar:

```json
{
  "error": "Error type",
  "details": "Detailed error message or array of validation errors"
}
```

## Status Codes

- `200 OK`: Operación exitosa (GET, PUT, DELETE)
- `201 Created`: Recurso creado exitosamente (POST)
- `400 Bad Request`: Error de validación o parámetros inválidos
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto de estado (ej: no se puede eliminar)
- `500 Internal Server Error`: Error del servidor

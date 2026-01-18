# API Contracts: Pagos

**Resource**: `/api/pagos`  
**Base URL**: `http://localhost:3000/api/pagos`

## Endpoints

### GET /api/pagos

Obtiene la lista de pagos con opción de filtrado.

**Query Parameters**:
- `practicante_id` (integer, optional): Filtrar por practicante
- `abono_id` (integer, optional): Filtrar por abono
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
      "practicante_id": 1,
      "practicante": {
        "id": 1,
        "nombre_completo": "Juan Pérez"
      },
      "abono_id": 1,
      "abono": {
        "id": 1,
        "tipo_abono": {
          "nombre": "Mensual"
        },
        "fecha_vencimiento": "2026-01-31"
      },
      "fecha": "2026-01-15",
      "monto": 50.00,
      "metodo_pago": "efectivo",
      "notas": "Pago completo",
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

### GET /api/pagos/:id

Obtiene un pago específico por ID.

**Path Parameters**:
- `id` (integer, required): ID del pago

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
    "abono_id": 1,
    "abono": {
      "id": 1,
      "tipo_abono": {
        "nombre": "Mensual"
      },
      "fecha_vencimiento": "2026-01-31"
    },
    "fecha": "2026-01-15",
    "monto": 50.00,
    "metodo_pago": "efectivo",
    "notas": "Pago completo",
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
}
```

**Response 404 Not Found**:
```json
{
  "error": "Pago not found",
  "details": "No pago found with id 999"
}
```

---

### POST /api/pagos

Registra un nuevo pago (FR-015).

**Request Body**:
```json
{
  "practicante_id": 1,
  "abono_id": 1,
  "fecha": "2026-01-15",
  "monto": 50.00,
  "metodo_pago": "efectivo",
  "notas": "Pago completo"
}
```

**Validation Rules**:
- `practicante_id` (required): Debe existir en la base de datos
- `abono_id` (required): Debe existir en la base de datos
- `fecha` (required): Debe ser una fecha válida en formato YYYY-MM-DD, no puede ser futura
- `monto` (required): Debe ser un número positivo
- `metodo_pago` (required): Debe ser uno de: 'efectivo', 'transferencia', 'tarjeta', 'otro'
- `notas` (optional): Cadena de texto

**Response 201 Created**:
```json
{
  "data": {
    "id": 1,
    "practicante_id": 1,
    "practicante": {
      "id": 1,
      "nombre_completo": "Juan Pérez"
    },
    "abono_id": 1,
    "abono": {
      "id": 1,
      "tipo_abono": {
        "nombre": "Mensual"
      },
      "fecha_vencimiento": "2026-01-31"
    },
    "fecha": "2026-01-15",
    "monto": 50.00,
    "metodo_pago": "efectivo",
    "notas": "Pago completo",
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
      "field": "monto",
      "message": "monto must be a positive number"
    },
    {
      "field": "fecha",
      "message": "fecha cannot be in the future"
    }
  ]
}
```

**Note**: Al registrar un pago, se actualiza automáticamente el estado del abono del practicante (FR-014, FR-016).

---

### PUT /api/pagos/:id

Actualiza un pago existente (FR-018).

**Path Parameters**:
- `id` (integer, required): ID del pago

**Request Body** (todos los campos son opcionales):
```json
{
  "monto": 55.00,
  "fecha": "2026-01-16",
  "metodo_pago": "transferencia"
}
```

**Response 200 OK**: Mismo formato que GET /api/pagos/:id

**Note**: Al actualizar un pago, se recalcula el estado del abono asociado si es necesario.

---

### DELETE /api/pagos/:id

Elimina un pago (con confirmación - FR-018).

**Path Parameters**:
- `id` (integer, required): ID del pago

**Response 200 OK**:
```json
{
  "message": "Pago deleted successfully",
  "data": {
    "id": 1
  }
}
```

**Response 404 Not Found**: Mismo formato que GET /api/pagos/:id

**Note**: Al eliminar un pago, se actualiza el estado del abono del practicante.

---

### GET /api/practicantes/:id/pagos

Obtiene el historial de pagos de un practicante específico (FR-017).

**Path Parameters**:
- `id` (integer, required): ID del practicante

**Query Parameters**:
- `page` (integer, optional, default: 1): Número de página
- `limit` (integer, optional, default: 50): Cantidad de resultados por página

**Response 200 OK**:
```json
{
  "data": [
    {
      "id": 1,
      "abono_id": 1,
      "abono": {
        "id": 1,
        "tipo_abono": {
          "nombre": "Mensual"
        },
        "fecha_vencimiento": "2026-01-31"
      },
      "fecha": "2026-01-15",
      "monto": 50.00,
      "metodo_pago": "efectivo",
      "notas": "Pago completo",
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

**Note**: Los pagos se ordenan por fecha descendente (más recientes primero).

---

### GET /api/practicantes/:id/estado-pago

Obtiene el estado de pago actual de un practicante (FR-019, FR-020).

**Path Parameters**:
- `id` (integer, required): ID del practicante

**Response 200 OK**:
```json
{
  "data": {
    "practicante_id": 1,
    "abono_activo": {
      "id": 1,
      "tipo_abono": {
        "nombre": "Mensual",
        "precio": 50.00
      },
      "fecha_inicio": "2026-01-01",
      "fecha_vencimiento": "2026-01-31",
      "estado": "activo",
      "dias_restantes": 16
    },
    "ultimo_pago": {
      "id": 1,
      "fecha": "2026-01-15",
      "monto": 50.00,
      "metodo_pago": "efectivo"
    },
    "proximo_vencimiento": "2026-01-31",
    "estado_general": "al_dia"
  }
}
```

**Posibles valores de `estado_general`**:
- `al_dia`: Abono activo y no próximo a vencer
- `proximo_vencer`: Abono activo pero próximo a vencer (menos de 7 días)
- `vencido`: Abono vencido
- `sin_abono`: No tiene abono activo

---

## Error Response Format

Mismo formato que practicantes.md

## Status Codes

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error de validación
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

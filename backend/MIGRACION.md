# Guía de Migración de Base de Datos

## Paso 1: Iniciar MySQL

Antes de ejecutar la migración, necesitas asegurarte de que MySQL esté corriendo.

### Si usas WAMP:
1. Abre WAMP (deberías ver el icono en la bandeja del sistema)
2. Haz clic derecho en el icono de WAMP
3. Ve a: **MySQL** > **Service** > **Start/Resume Service**
4. Verifica que el icono de WAMP esté en color verde (no amarillo o rojo)

### Si usas Laragon:
1. Abre Laragon
2. Haz clic en el botón **"Start All"** o **"Start"** en la sección MySQL
3. Verifica que el estado de MySQL sea verde (corriendo)

### Si usas XAMPP:
1. Abre el Panel de Control de XAMPP
2. Haz clic en **"Start"** junto a MySQL
3. Espera a que el estado cambie a "Running"

## Paso 2: Verificar Conexión

Abre una terminal y ejecuta:

```powershell
mysql -u root -e "SELECT 1"
```

Si ves un resultado (aunque sea vacío), MySQL está funcionando correctamente.

## Paso 3: Ejecutar la Migración

### Opción A: Usando el script PowerShell (Recomendado)

Desde el directorio `backend/`, ejecuta:

```powershell
.\run-migration.ps1
```

El script:
- Verificará que MySQL esté corriendo
- Creará la base de datos `tai_chi_management` si no existe
- Ejecutará el script de migración `migrations/001_initial_schema.sql`
- Mostrará las tablas creadas para verificación

### Opción B: Ejecutar manualmente

```powershell
# Crear base de datos
mysql -u root -e "CREATE DATABASE IF NOT EXISTS tai_chi_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Ejecutar migración
mysql -u root tai_chi_management < migrations/001_initial_schema.sql

# Verificar tablas creadas
mysql -u root -e "USE tai_chi_management; SHOW TABLES;"
```

## Paso 4: Verificar Tablas Creadas

Deberías ver las siguientes tablas:
- `Practicante`
- `TipoAbono`
- `Abono`
- `Pago`
- `Clase`
- `Asistencia`
- `HistorialSalud`

## Paso 5: Configurar .env

Asegúrate de que el archivo `backend/.env` tenga la configuración correcta:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # Déjalo vacío si no tienes contraseña
DB_NAME=tai_chi_management
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Solución de Problemas

### Error: "Can't connect to MySQL server"
- **Solución**: Asegúrate de que el servicio MySQL esté iniciado (ver Paso 1)

### Error: "Access denied for user 'root'@'localhost'"
- **Solución**: Verifica las credenciales en `backend/.env` o usa `mysql -u root -p` y proporciona la contraseña

### Error: "Unknown database"
- **Solución**: Ejecuta primero el comando para crear la base de datos (ver Opción B, Paso 1)

## Próximos Pasos

Una vez completada la migración:
1. Inicia el servidor backend: `npm run dev` (desde `backend/`)
2. Inicia el frontend: `npm run dev` (desde `frontend/`)
3. Abre tu navegador en: `http://localhost:5173`

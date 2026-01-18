# Script para ejecutar la migración de base de datos
# Uso: .\run-migration.ps1

Write-Host "=== Ejecutando migración de base de datos ===" -ForegroundColor Cyan

# Verificar que MySQL esté disponible
$mysqlCmd = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlCmd) {
    Write-Host "ERROR: MySQL no está en el PATH. Por favor, asegúrate de que MySQL esté instalado y corriendo." -ForegroundColor Red
    exit 1
}

# Leer configuración del .env
$envFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: Archivo .env no encontrado. Por favor, cópialo desde env.example." -ForegroundColor Red
    exit 1
}

# Parsear .env (básico)
$dbUser = "root"
$dbPassword = ""
$dbName = "tai_chi_management"

$envContent = Get-Content $envFile
foreach ($line in $envContent) {
    if ($line -match "^DB_USER=(.+)$") {
        $dbUser = $matches[1]
    }
    if ($line -match "^DB_PASSWORD=(.+)$") {
        $dbPassword = $matches[1]
    }
    if ($line -match "^DB_NAME=(.+)$") {
        $dbName = $matches[1]
    }
}

Write-Host "Configuración detectada:" -ForegroundColor Yellow
Write-Host "  Usuario: $dbUser"
Write-Host "  Base de datos: $dbName"
Write-Host ""

# Construir comando de conexión
$mysqlArgs = @("-u", $dbUser)
if ($dbPassword) {
    $mysqlArgs += "-p$dbPassword"
}
$mysqlArgs += "-e"

# Crear base de datos
Write-Host "Creando base de datos (si no existe)..." -ForegroundColor Yellow
$createDbCmd = "CREATE DATABASE IF NOT EXISTS $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
& mysql $mysqlArgs $createDbCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo conectar a MySQL. Asegúrate de que MySQL esté corriendo." -ForegroundColor Red
    Write-Host "En WAMP: Hacer clic derecho en el icono de WAMP > MySQL > Service > Start/Resume Service" -ForegroundColor Yellow
    Write-Host "En Laragon: Asegúrate de que el servicio MySQL esté iniciado" -ForegroundColor Yellow
    exit 1
}

Write-Host "Base de datos creada/verificada." -ForegroundColor Green

# Ejecutar migración
Write-Host "Ejecutando script de migración..." -ForegroundColor Yellow
$migrationFile = Join-Path $PSScriptRoot "migrations\001_initial_schema.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "ERROR: Archivo de migración no encontrado: $migrationFile" -ForegroundColor Red
    exit 1
}

$mysqlArgs = @("-u", $dbUser)
if ($dbPassword) {
    $mysqlArgs += "-p$dbPassword"
}
$mysqlArgs += $dbName

Get-Content $migrationFile | & mysql $mysqlArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: La migración falló." -ForegroundColor Red
    exit 1
}

Write-Host "Migración completada exitosamente!" -ForegroundColor Green

# Verificar tablas creadas
Write-Host "`nVerificando tablas creadas..." -ForegroundColor Yellow
$mysqlArgs = @("-u", $dbUser)
if ($dbPassword) {
    $mysqlArgs += "-p$dbPassword"
}
$mysqlArgs += "-e", "USE $dbName; SHOW TABLES;"

& mysql $mysqlArgs

Write-Host "`n=== Migración completada ===" -ForegroundColor Cyan

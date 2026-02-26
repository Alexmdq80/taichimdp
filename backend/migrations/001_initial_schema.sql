-- Initial database schema for Tai Chi Management System
-- Run this script to create the database and all tables

-- Table: Practicante
CREATE TABLE IF NOT EXISTS Practicante (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  fecha_nacimiento DATE NULL,
  genero ENUM('M', 'F', 'Otro', 'Prefiero no decir') NULL,
  telefono VARCHAR(20) NULL,
  email VARCHAR(255) NULL,
  direccion TEXT NULL,
  condiciones_medicas TEXT NULL,
  medicamentos TEXT NULL,
  limitaciones_fisicas TEXT NULL,
  alergias TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nombre (nombre_completo),
  INDEX idx_telefono (telefono),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: TipoAbono
CREATE TABLE IF NOT EXISTS TipoAbono (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  duracion_dias INT NOT NULL CHECK (duracion_dias > 0),
  precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
  descripcion TEXT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Abono
CREATE TABLE IF NOT EXISTS Abono (
  id INT AUTO_INCREMENT PRIMARY KEY,
  practicante_id INT NOT NULL,
  tipo_abono_id INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado ENUM('activo', 'vencido', 'proximo_vencer') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (practicante_id) REFERENCES Practicante(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (tipo_abono_id) REFERENCES TipoAbono(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_practicante (practicante_id),
  INDEX idx_estado (estado),
  INDEX idx_fecha_vencimiento (fecha_vencimiento),
  CHECK (fecha_vencimiento > fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Pago
CREATE TABLE IF NOT EXISTS Pago (
  id INT AUTO_INCREMENT PRIMARY KEY,
  practicante_id INT NOT NULL,
  abono_id INT NOT NULL,
  fecha DATE NOT NULL,
  monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
  metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta', 'otro') NOT NULL,
  notas TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (practicante_id) REFERENCES Practicante(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (abono_id) REFERENCES Abono(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_practicante (practicante_id),
  INDEX idx_fecha (fecha),
  INDEX idx_abono (abono_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Clase
CREATE TABLE IF NOT EXISTS Clase (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  descripcion TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fecha (fecha),
  INDEX idx_fecha_hora (fecha, hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Asistencia
CREATE TABLE IF NOT EXISTS Asistencia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  practicante_id INT NOT NULL,
  clase_id INT NOT NULL,
  asistio BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (practicante_id) REFERENCES Practicante(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (clase_id) REFERENCES Clase(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_practicante (practicante_id),
  INDEX idx_clase (clase_id),
  UNIQUE KEY idx_practicante_clase (practicante_id, clase_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: HistorialSalud (for FR-006)
CREATE TABLE IF NOT EXISTS HistorialSalud (
  id INT AUTO_INCREMENT PRIMARY KEY,
  practicante_id INT NOT NULL,
  campo_modificado VARCHAR(100) NOT NULL,
  valor_anterior TEXT NULL,
  valor_nuevo TEXT NULL,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (practicante_id) REFERENCES Practicante(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_practicante (practicante_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

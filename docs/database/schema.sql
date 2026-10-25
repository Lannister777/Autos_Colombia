-- ========================================================================
-- MODELO FÍSICO DE BASE DE DATOS (DDL) - PARQUEADERO AUTOS COLOMBIA
-- Iteración 1: Gestión de Entrada y Salida de Vehículos
-- Compatible con SQLite 3 y adaptable a PostgreSQL / MySQL
-- ========================================================================

PRAGMA foreign_keys = ON;

-- 1. TABLA: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_completo VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK(rol IN ('ADMIN', 'OPERADOR')),
    activo INTEGER DEFAULT 1 CHECK(activo IN (0, 1)),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: clientes
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    documento VARCHAR(20) NOT NULL UNIQUE,
    tipo_documento VARCHAR(10) DEFAULT 'CC',
    nombre_completo VARCHAR(120) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    direccion VARCHAR(150),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: vehiculos
CREATE TABLE IF NOT EXISTS vehiculos (
    id_vehiculo INTEGER PRIMARY KEY AUTOINCREMENT,
    placa VARCHAR(10) NOT NULL UNIQUE,
    tipo_vehiculo VARCHAR(20) NOT NULL CHECK(tipo_vehiculo IN ('AUTOMOVIL', 'MOTO', 'CAMIONETA', 'BICICLETA')),
    marca VARCHAR(50),
    linea_modelo VARCHAR(50),
    color VARCHAR(30),
    id_cliente INTEGER NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE SET NULL
);

-- 4. TABLA: celdas
CREATE TABLE IF NOT EXISTS celdas (
    id_celda INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_celda VARCHAR(10) NOT NULL UNIQUE,
    tipo_permitido VARCHAR(20) NOT NULL CHECK(tipo_permitido IN ('AUTOMOVIL', 'MOTO', 'CAMIONETA', 'BICICLETA')),
    estado VARCHAR(20) NOT NULL DEFAULT 'LIBRE' CHECK(estado IN ('LIBRE', 'OCUPADA', 'MANTENIMIENTO')),
    sector VARCHAR(50) NOT NULL
);

-- 5. TABLA: tarifas
CREATE TABLE IF NOT EXISTS tarifas (
    id_tarifa INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_vehiculo VARCHAR(20) NOT NULL UNIQUE CHECK(tipo_vehiculo IN ('AUTOMOVIL', 'MOTO', 'CAMIONETA', 'BICICLETA')),
    valor_hora_fraccion DECIMAL(10,2) NOT NULL,
    valor_dia DECIMAL(10,2) NOT NULL,
    valor_mensualidad DECIMAL(10,2) NOT NULL,
    tiempo_gracia_minutos INTEGER DEFAULT 10,
    activo INTEGER DEFAULT 1 CHECK(activo IN (0, 1))
);

-- 6. TABLA: mensualidades
CREATE TABLE IF NOT EXISTS mensualidades (
    id_mensualidad INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    id_vehiculo INTEGER NOT NULL,
    id_celda_asignada INTEGER NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    valor_mensual DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA' CHECK(estado IN ('ACTIVA', 'VENCIDA', 'CANCELADA')),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE RESTRICT,
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo) ON DELETE RESTRICT,
    FOREIGN KEY (id_celda_asignada) REFERENCES celdas(id_celda) ON DELETE SET NULL
);

-- 7. TABLA: registros_acceso
CREATE TABLE IF NOT EXISTS registros_acceso (
    id_registro INTEGER PRIMARY KEY AUTOINCREMENT,
    folio_ticket VARCHAR(30) NOT NULL UNIQUE,
    id_vehiculo INTEGER NOT NULL,
    id_celda INTEGER NOT NULL,
    fecha_hora_entrada DATETIME NOT NULL,
    fecha_hora_salida DATETIME NULL,
    modalidad VARCHAR(20) NOT NULL CHECK(modalidad IN ('OCASIONAL', 'MENSUALIDAD')),
    minutos_estancia INTEGER DEFAULT 0,
    valor_total DECIMAL(10,2) DEFAULT 0.00,
    estado VARCHAR(20) NOT NULL DEFAULT 'EN_CURSO' CHECK(estado IN ('EN_CURSO', 'FINALIZADO')),
    id_usuario_entrada INTEGER NOT NULL,
    id_usuario_salida INTEGER NULL,
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo) ON DELETE RESTRICT,
    FOREIGN KEY (id_celda) REFERENCES celdas(id_celda) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario_entrada) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario_salida) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

-- 8. TABLA: novedades
CREATE TABLE IF NOT EXISTS novedades (
    id_novedad INTEGER PRIMARY KEY AUTOINCREMENT,
    id_registro INTEGER NULL,
    id_vehiculo INTEGER NOT NULL,
    momento VARCHAR(20) NOT NULL CHECK(momento IN ('ENTRADA', 'ESTANCIA', 'SALIDA')),
    tipo_novedad VARCHAR(30) NOT NULL,
    descripcion TEXT NOT NULL,
    severidad VARCHAR(20) NOT NULL DEFAULT 'BAJA' CHECK(severidad IN ('BAJA', 'MEDIA', 'ALTA')),
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INTEGER NOT NULL,
    FOREIGN KEY (id_registro) REFERENCES registros_acceso(id_registro) ON DELETE SET NULL,
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT
);

-- 9. TABLA: pagos
CREATE TABLE IF NOT EXISTS pagos (
    id_pago INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_comprobante VARCHAR(30) NOT NULL UNIQUE,
    id_registro INTEGER NULL,
    id_mensualidad INTEGER NULL,
    monto_pagado DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(30) NOT NULL CHECK(metodo_pago IN ('EFECTIVO', 'NEQUI', 'DAVIPLATA', 'TARJETA')),
    referencia_transaccion VARCHAR(60) NULL,
    fecha_hora_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INTEGER NOT NULL,
    FOREIGN KEY (id_registro) REFERENCES registros_acceso(id_registro) ON DELETE SET NULL,
    FOREIGN KEY (id_mensualidad) REFERENCES mensualidades(id_mensualidad) ON DELETE SET NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT
);

-- ========================================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE RENDIMIENTO (RNF-01)
-- ========================================================================
CREATE INDEX IF NOT EXISTS idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX IF NOT EXISTS idx_registros_estado ON registros_acceso(estado);
CREATE INDEX IF NOT EXISTS idx_registros_fecha_entrada ON registros_acceso(fecha_hora_entrada);
CREATE INDEX IF NOT EXISTS idx_celdas_estado ON celdas(estado);
CREATE INDEX IF NOT EXISTS idx_celdas_tipo ON celdas(tipo_permitido);
CREATE INDEX IF NOT EXISTS idx_mensualidades_estado ON mensualidades(estado, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_novedades_vehiculo ON novedades(id_vehiculo);

-- ========================================================================
-- DATOS SEMILLA INICIALES (SEED DATA)
-- ========================================================================

-- Usuarios del Sistema
INSERT OR IGNORE INTO usuarios (id_usuario, nombre_completo, username, password_hash, rol, activo) VALUES
(1, 'Administrador Autos Colombia', 'admin', 'admin123', 'ADMIN', 1),
(2, 'Carlos Restrepo - Operador Caseta', 'operador1', 'operador123', 'OPERADOR', 1);

-- Tarifas del Parqueadero
INSERT OR IGNORE INTO tarifas (id_tarifa, tipo_vehiculo, valor_hora_fraccion, valor_dia, valor_mensualidad, tiempo_gracia_minutos, activo) VALUES
(1, 'AUTOMOVIL', 4000.00, 28000.00, 180000.00, 15, 1),
(2, 'MOTO', 2000.00, 14000.00, 90000.00, 15, 1),
(3, 'CAMIONETA', 5000.00, 35000.00, 220000.00, 15, 1),
(4, 'BICICLETA', 1000.00, 7000.00, 35000.00, 15, 1);

-- Inventario de Celdas
INSERT OR IGNORE INTO celdas (codigo_celda, tipo_permitido, estado, sector) VALUES
('A-01', 'AUTOMOVIL', 'LIBRE', 'Sector A - Principal'),
('A-02', 'AUTOMOVIL', 'LIBRE', 'Sector A - Principal'),
('A-03', 'AUTOMOVIL', 'LIBRE', 'Sector A - Principal'),
('A-04', 'AUTOMOVIL', 'LIBRE', 'Sector A - Principal'),
('A-05', 'AUTOMOVIL', 'LIBRE', 'Sector A - Principal'),
('A-06', 'AUTOMOVIL', 'LIBRE', 'Sector A - Principal'),
('C-01', 'CAMIONETA', 'LIBRE', 'Sector C - Camionetas'),
('C-02', 'CAMIONETA', 'LIBRE', 'Sector C - Camionetas'),
('C-03', 'CAMIONETA', 'LIBRE', 'Sector C - Camionetas'),
('M-01', 'MOTO', 'LIBRE', 'Sector M - Motos'),
('M-02', 'MOTO', 'LIBRE', 'Sector M - Motos'),
('M-03', 'MOTO', 'LIBRE', 'Sector M - Motos'),
('M-04', 'MOTO', 'LIBRE', 'Sector M - Motos'),
('B-01', 'BICICLETA', 'LIBRE', 'Sector B - Bicis'),
('B-02', 'BICICLETA', 'LIBRE', 'Sector B - Bicis');

-- Clientes con Mensualidad Registrada
INSERT OR IGNORE INTO clientes (id_cliente, documento, tipo_documento, nombre_completo, telefono, email, direccion) VALUES
(1, '1020304050', 'CC', 'Santiago Morales Gaviria', '3104567890', 'santiago.morales@email.com', 'Calle 45 # 12-34'),
(2, '9876543210', 'CC', 'Valeria Duque Ortiz', '3157891234', 'valeria.duque@email.com', 'Carrera 70 # 33-18');

-- Vehículos Asociados a Mensualidades
INSERT OR IGNORE INTO vehiculos (id_vehiculo, placa, tipo_vehiculo, marca, linea_modelo, color, id_cliente) VALUES
(1, 'COL123', 'AUTOMOVIL', 'Mazda', 'CX-30', 'Rojo Diamante', 1),
(2, 'MED456', 'MOTO', 'Yamaha', 'NMAX 155', 'Negro Mate', 2);

-- Mensualidades Activas
INSERT OR IGNORE INTO mensualidades (id_mensualidad, id_cliente, id_vehiculo, id_celda_asignada, fecha_inicio, fecha_fin, valor_mensual, estado) VALUES
(1, 1, 1, 1, '2026-10-01', '2026-11-01', 180000.00, 'ACTIVA'),
(2, 2, 2, 10, '2026-10-15', '2026-11-15', 90000.00, 'ACTIVA');

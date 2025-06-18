-- Crear base de datos
CREATE DATABASE vehicle_management;

-- Conectar a la base de datos
\c vehicle_management;

-- Habilitar extensión PostGIS para manejo de coordenadas
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabla de roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    foto_perfil TEXT,
    rol_id INTEGER REFERENCES roles(id),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de marcas de vehículos
CREATE TABLE marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tipos de vehículos
CREATE TABLE tipos_vehiculos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de vehículos
CREATE TABLE vehiculos (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    marca_id INTEGER REFERENCES marcas(id),
    modelo VARCHAR(100) NOT NULL,
    año INTEGER NOT NULL CHECK (año >= 1900 AND año <= 2025),
    color VARCHAR(50),
    tipo_vehiculo_id INTEGER REFERENCES tipos_vehiculos(id),
    numero_motor VARCHAR(100),
    numero_chasis VARCHAR(100),
    kilometraje INTEGER DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'asignado', 'mantenimiento', 'fuera_servicio')),
    imagenes TEXT[], -- Array de URLs de imágenes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de asignaciones de vehículos
CREATE TABLE asignaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    vehiculo_id INTEGER REFERENCES vehiculos(id),
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_desasignacion TIMESTAMP,
    activa BOOLEAN DEFAULT true,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vehiculo_id, activa) -- Un vehículo solo puede tener una asignación activa
);

-- Tabla de ubicaciones GPS
CREATE TABLE ubicaciones_gps (
    id SERIAL PRIMARY KEY,
    vehiculo_id INTEGER REFERENCES vehiculos(id),
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    ubicacion GEOMETRY(POINT, 4326), -- PostGIS point
    velocidad DECIMAL(5, 2) DEFAULT 0,
    direccion DECIMAL(5, 2) DEFAULT 0,
    timestamp_gps TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_vehiculos_matricula ON vehiculos(matricula);
CREATE INDEX idx_asignaciones_usuario ON asignaciones(usuario_id);
CREATE INDEX idx_asignaciones_vehiculo ON asignaciones(vehiculo_id);
CREATE INDEX idx_ubicaciones_vehiculo ON ubicaciones_gps(vehiculo_id);
CREATE INDEX idx_ubicaciones_timestamp ON ubicaciones_gps(timestamp_gps);
CREATE INDEX idx_ubicaciones_gps_geom ON ubicaciones_gps USING GIST(ubicacion);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehiculos_updated_at BEFORE UPDATE ON vehiculos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asignaciones_updated_at BEFORE UPDATE ON asignaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar ubicación PostGIS
CREATE OR REPLACE FUNCTION update_ubicacion_point()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ubicacion = ST_SetSRID(ST_MakePoint(NEW.longitud, NEW.latitud), 4326);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ubicacion_gps_point BEFORE INSERT OR UPDATE ON ubicaciones_gps FOR EACH ROW EXECUTE FUNCTION update_ubicacion_point();

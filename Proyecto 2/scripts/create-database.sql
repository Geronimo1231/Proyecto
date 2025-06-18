-- Crear base de datos
CREATE DATABASE IF NOT EXISTS vehicle_management;
USE vehicle_management;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('GlobalAdmin', 'Admin', 'User') DEFAULT 'User',
    photo TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL
);

-- Tabla de vehículos
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    licensePlate VARCHAR(20) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    type VARCHAR(50),
    color VARCHAR(50),
    mileage INT DEFAULT 0,
    engineNumber VARCHAR(100),
    chassisNumber VARCHAR(100),
    image TEXT,
    status ENUM('available', 'assigned', 'maintenance', 'out_of_service') DEFAULT 'available',
    assignedUserId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (assignedUserId) REFERENCES users(id)
);

-- Tabla de asignaciones
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    vehicleId INT NOT NULL,
    assignmentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returnDate TIMESTAMP NULL,
    isActive BOOLEAN DEFAULT TRUE,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (vehicleId) REFERENCES vehicles(id)
);

-- Tabla de ubicaciones GPS
CREATE TABLE IF NOT EXISTS gps_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicleId INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2),
    direction DECIMAL(5, 2),
    gpsTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicleId) REFERENCES vehicles(id)
);

-- Insertar datos de prueba
INSERT INTO users (firstName, lastName, email, password, role) VALUES
('Admin', 'Sistema', 'admin@vehiculos.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'GlobalAdmin'),
('María', 'García', 'maria@vehiculos.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'User');

INSERT INTO vehicles (licensePlate, model, brand, year, type, color) VALUES
('ABC-123', 'Corolla', 'Toyota', 2020, 'Sedán', 'Blanco'),
('XYZ-789', 'Civic', 'Honda', 2021, 'Sedán', 'Negro');

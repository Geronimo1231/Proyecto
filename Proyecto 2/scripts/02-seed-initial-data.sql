-- Insertar usuarios por defecto
INSERT INTO Users (firstName, lastName, email, phone, password, role) VALUES 
('Global', 'Admin', 'admin@vehiculos.com', '+1234567890', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlxO', 'GlobalAdmin'),
('Juan Carlos', 'Pérez López', 'usuario@vehiculos.com', '+0987654321', '$2b$10$rOzJqQqQqQgQgQgQgQgQgOzJqQgQgQgQgQgQgQgQgOzJqQgQgQgQgD', 'User'),
('María Elena', 'González Ruiz', 'maria@vehiculos.com', '+1122334455', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlxO', 'User'),
('Carlos Alberto', 'Rodríguez Sánchez', 'carlos@vehiculos.com', '+5566778899', '$2b$10$rOzJqQqQqQgQgQgQgQgQgOzJqQgQgQgQgQgQgQgQgOzJqQgQgQgQgD', 'User'),
('Ana Sofia', 'Martínez Torres', 'ana@vehiculos.com', '+2233445566', '$2b$10$rOzJqQqQqQgQgQgQgQgQgOzJqQgQgQgQgQgQgQgQgOzJqQgQgQgQgD', 'Admin'),
('Juan', 'Pérez', 'juan@vehiculos.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlxO', 'Admin'),
('María', 'García', 'maria@vehiculos.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlxO', 'User'),
('Carlos', 'López', 'carlos@vehiculos.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlxO', 'User');

-- Insertar vehículos de ejemplo
INSERT INTO Vehicles (licensePlate, model, brand, year, type, status, color, mileage, engineNumber, chassisNumber) VALUES 
('ABC-123', 'Corolla', 'Toyota', 2020, 'Sedán', 'available', 'Blanco', 15000, 'TOY2020001', 'CHASIS001'),
('DEF-456', 'Civic', 'Honda', 2019, 'Sedán', 'available', 'Negro', 22000, 'HON2019001', 'CHASIS002'),
('GHI-789', 'F-150', 'Ford', 2021, 'Pickup', 'available', 'Azul', 8000, 'FOR2021001', 'CHASIS003'),
('JKL-012', 'Silverado', 'Chevrolet', 2023, 'Pickup', 'available', 'Rojo', 12000, 'CHE2023001', 'CHASIS004'),
('MNO-345', 'Altima', 'Nissan', 2022, 'Sedan', 'available', 'Gris', 30000, 'NIS2022001', 'CHASIS005'),
('PQR-678', 'Jetta', 'Volkswagen', 2023, 'Sedan', 'available', 'Blanco', 18000, 'VW2023001', 'CHASIS006'),
('STU-901', 'X3', 'BMW', 2024, 'SUV', 'available', 'Negro', 5000, 'BMW2024001', 'CHASIS007'),
('VWX-234', 'C-Class', 'Mercedes-Benz', 2023, 'Sedan', 'available', 'Plata', 22000, 'MER2023001', 'CHASIS008'),
('YZA-567', 'A4', 'Audi', 2022, 'Sedan', 'available', 'Azul', 28000, 'AUD2022001', 'CHASIS009'),
('BCD-890', 'Elantra', 'Hyundai', 2023, 'Sedan', 'available', 'Rojo', 16000, 'HYU2023001', 'CHASIS010'),
('EFG-123', 'Forte', 'Kia', 2022, 'Sedan', 'available', 'Verde', 24000, 'KIA2022001', 'CHASIS011'),
('HIJ-456', 'CX-5', 'Mazda', 2024, 'SUV', 'available', 'Blanco', 7000, 'MAZ2024001', 'CHASIS012'),
('KLM-789', 'Outback', 'Subaru', 2023, 'SUV', 'available', 'Gris', 19000, 'SUB2023001', 'CHASIS013'),
('NOP-012', 'Wrangler', 'Jeep', 2024, 'SUV', 'available', 'Negro', 3000, 'JEE2024001', 'CHASIS014'),
('QRS-345', '1500', 'Ram', 2023, 'Pickup', 'available', 'Azul', 14000, 'RAM2023001', 'CHASIS015'),
('JKL-012', 'Hilux', 'Toyota', 2022, 'Pickup', 'available', 'Gris', 5000, 'TOY2022002', 'CHASIS016');

-- Crear algunas asignaciones de ejemplo
INSERT INTO Assignments (userId, vehicleId, notes, isActive) VALUES 
(2, 1, 'Asignación inicial para Juan Carlos', TRUE),
(3, 3, 'Asignación inicial para María Elena', TRUE),
(4, 5, 'Asignación inicial para Carlos Alberto', TRUE),
(3, 1, 'Asignación inicial para María', TRUE),
(4, 2, 'Asignación inicial para Carlos', TRUE);

-- Actualizar estado de vehículos asignados
UPDATE Vehicles SET status = 'assigned', assignedTo = 2 WHERE id = 1;
UPDATE Vehicles SET status = 'assigned', assignedTo = 3 WHERE id = 3;
UPDATE Vehicles SET status = 'assigned', assignedTo = 4 WHERE id = 5;
UPDATE Vehicles SET status = 'assigned', assignedUserId = 3 WHERE id = 1;
UPDATE Vehicles SET status = 'assigned', assignedUserId = 4 WHERE id = 2;

-- Insertar ubicaciones GPS de ejemplo
INSERT INTO GpsLocations (vehicleId, latitude, longitude, speed, direction) VALUES 
(1, 19.432608, -99.133209, 45.5, 90.0),
(3, 25.686614, -100.316113, 60.2, 180.0),
(5, 20.659699, -103.349609, 35.8, 270.0),
(1, 19.435608, -99.130209, 50.0, 95.0),
(3, 25.689614, -100.319113, 55.5, 175.0),
(5, 20.662699, -103.352609, 40.2, 265.0),
(1, 19.4326, -99.1332, 45.5, 180.0),
(2, 19.4285, -99.1277, 32.0, 90.0),
(3, 19.4200, -99.1400, 0.0, 0.0),
(4, 19.4350, -99.1300, 55.2, 270.0);

-- Insertar configuraciones del sistema
INSERT INTO SystemConfigs (configKey, configValue, description, dataType) VALUES 
('gps_update_interval', '30', 'Intervalo de actualización GPS en segundos', 'number'),
('max_vehicles_per_user', '5', 'Máximo de vehículos por usuario', 'number'),
('enable_real_time_tracking', 'true', 'Habilitar seguimiento en tiempo real', 'boolean'),
('company_name', 'Sistema de Gestión Vehicular', 'Nombre de la empresa', 'string'),
('map_default_zoom', '10', 'Zoom por defecto del mapa', 'number'),
('map_center_lat', '19.432608', 'Latitud del centro del mapa por defecto', 'string'),
('map_center_lng', '-99.133209', 'Longitud del centro del mapa por defecto', 'string'),
('session_timeout', '24', 'Tiempo de expiración de sesión en horas', 'number'),
('max_login_attempts', '5', 'Máximo de intentos de login', 'number'),
('backup_retention_days', '30', 'Días de retención de backups', 'number');

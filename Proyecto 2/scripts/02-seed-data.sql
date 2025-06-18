-- Insertar roles
INSERT INTO roles (nombre, descripcion) VALUES 
('admin', 'Administrador del sistema con acceso completo'),
('usuario', 'Usuario estándar con acceso limitado');

-- Insertar usuarios de demostración
-- Contraseña para admin: Admin123!
-- Contraseña para usuario: User123!
INSERT INTO usuarios (nombre, apellido, email, telefono, password, rol_id) VALUES 
('Administrador', 'Sistema', 'admin@vehiculos.com', '+1234567890', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 1),
('Juan Carlos', 'Pérez López', 'usuario@vehiculos.com', '+0987654321', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 2),
('María Elena', 'González Ruiz', 'maria@vehiculos.com', '+1122334455', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 2),
('Carlos Alberto', 'Rodríguez Sánchez', 'carlos@vehiculos.com', '+5566778899', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 2);

-- Insertar marcas de vehículos
INSERT INTO marcas (nombre) VALUES 
('Toyota'), ('Honda'), ('Ford'), ('Chevrolet'), ('Nissan'), 
('Volkswagen'), ('BMW'), ('Mercedes-Benz'), ('Audi'), ('Hyundai'),
('Kia'), ('Mazda'), ('Subaru'), ('Jeep'), ('Ram');

-- Insertar tipos de vehículos
INSERT INTO tipos_vehiculos (nombre, descripcion) VALUES 
('Sedán', 'Vehículo de pasajeros de 4 puertas'),
('Pickup', 'Camioneta con área de carga'),
('SUV', 'Vehículo utilitario deportivo'),
('Hatchback', 'Vehículo compacto con portón trasero'),
('Coupé', 'Vehículo de24hivo de 2 puertas'),
('Convertible', 'Vehículo con techo retráctil'),
('Camión', 'Vehículo de carga pesada'),
('Van', 'Vehículo de pasajeros o carga');

-- Insertar 25 vehículos de ejemplo
INSERT INTO vehiculos (matricula, marca_id, modelo, año, color, tipo_vehiculo_id, numero_motor, numero_chasis, kilometraje, estado) VALUES 
('ABC-123', 1, 'Corolla', 2023, 'Blanco', 1, 'TOY2023001', 'CHASIS001', 15000, 'disponible'),
('DEF-456', 2, 'Civic', 2022, 'Negro', 1, 'HON2022001', 'CHASIS002', 25000, 'disponible'),
('GHI-789', 3, 'F-150', 2024, 'Azul', 2, 'FOR2024001', 'CHASIS003', 8000, 'disponible'),
('JKL-012', 4, 'Silverado', 2023, 'Rojo', 2, 'CHE2023001', 'CHASIS004', 12000, 'disponible'),
('MNO-345', 5, 'Altima', 2022, 'Gris', 1, 'NIS2022001', 'CHASIS005', 30000, 'disponible'),
('PQR-678', 6, 'Jetta', 2023, 'Blanco', 1, 'VW2023001', 'CHASIS006', 18000, 'disponible'),
('STU-901', 7, 'X3', 2024, 'Negro', 3, 'BMW2024001', 'CHASIS007', 5000, 'disponible'),
('VWX-234', 8, 'C-Class', 2023, 'Plata', 1, 'MER2023001', 'CHASIS008', 22000, 'disponible'),
('YZA-567', 9, 'A4', 2022, 'Azul', 1, 'AUD2022001', 'CHASIS009', 28000, 'disponible'),
('BCD-890', 10, 'Elantra', 2023, 'Rojo', 1, 'HYU2023001', 'CHASIS010', 16000, 'disponible'),
('EFG-123', 11, 'Forte', 2022, 'Verde', 1, 'KIA2022001', 'CHASIS011', 24000, 'disponible'),
('HIJ-456', 12, 'CX-5', 2024, 'Blanco', 3, 'MAZ2024001', 'CHASIS012', 7000, 'disponible'),
('KLM-789', 13, 'Outback', 2023, 'Gris', 3, 'SUB2023001', 'CHASIS013', 19000, 'disponible'),
('NOP-012', 14, 'Wrangler', 2024, 'Negro', 3, 'JEE2024001', 'CHASIS014', 3000, 'disponible'),
('QRS-345', 15, '1500', 2023, 'Azul', 2, 'RAM2023001', 'CHASIS015', 14000, 'disponible'),
('TUV-678', 1, 'Camry', 2022, 'Plata', 1, 'TOY2022002', 'CHASIS016', 32000, 'disponible'),
('WXY-901', 2, 'Accord', 2023, 'Rojo', 1, 'HON2023002', 'CHASIS017', 11000, 'disponible'),
('ZAB-234', 3, 'Explorer', 2024, 'Negro', 3, 'FOR2024002', 'CHASIS018', 6000, 'disponible'),
('CDE-567', 4, 'Equinox', 2022, 'Blanco', 3, 'CHE2022002', 'CHASIS019', 27000, 'disponible'),
('FGH-890', 5, 'Sentra', 2023, 'Gris', 1, 'NIS2023002', 'CHASIS020', 17000, 'disponible'),
('IJK-123', 6, 'Tiguan', 2024, 'Azul', 3, 'VW2024002', 'CHASIS021', 4000, 'disponible'),
('LMN-456', 7, 'X5', 2023, 'Negro', 3, 'BMW2023002', 'CHASIS022', 13000, 'disponible'),
('OPQ-789', 8, 'GLE', 2022, 'Plata', 3, 'MER2022002', 'CHASIS023', 29000, 'disponible'),
('RST-012', 9, 'Q5', 2024, 'Blanco', 3, 'AUD2024002', 'CHASIS024', 2000, 'disponible'),
('UVW-345', 10, 'Santa Fe', 2023, 'Rojo', 3, 'HYU2023002', 'CHASIS025', 20000, 'disponible');

-- Asignar algunos vehículos a usuarios
INSERT INTO asignaciones (usuario_id, vehiculo_id, observaciones) VALUES 
(2, 1, 'Asignación inicial para Juan Carlos'),
(3, 3, 'Asignación inicial para María Elena'),
(4, 5, 'Asignación inicial para Carlos Alberto');

-- Actualizar estado de vehículos asignados
UPDATE vehiculos SET estado = 'asignado' WHERE id IN (1, 3, 5);

-- Insertar ubicaciones GPS de ejemplo
INSERT INTO ubicaciones_gps (vehiculo_id, latitud, longitud, velocidad, direccion) VALUES 
(1, 19.432608, -99.133209, 45.5, 90.0), -- Ciudad de México
(3, 25.686614, -100.316113, 60.2, 180.0), -- Monterrey
(5, 20.659699, -103.349609, 35.8, 270.0); -- Guadalajara

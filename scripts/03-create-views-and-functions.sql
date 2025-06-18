-- Vista para vehículos con información completa
CREATE OR REPLACE VIEW VehiclesComplete AS
SELECT 
    v.id,
    v.licensePlate,
    v.model,
    v.brand,
    v.year,
    v.type,
    v.color,
    v.mileage,
    v.status,
    v.image,
    v.engineNumber,
    v.chassisNumber,
    CASE 
        WHEN u.id IS NOT NULL THEN JSON_OBJECT(
            'id', u.id,
            'name', CONCAT(u.firstName, ' ', u.lastName),
            'email', u.email,
            'assignmentDate', a.assignmentDate
        )
        ELSE NULL
    END as assignedUser,
    (
        SELECT JSON_OBJECT(
            'latitude', gl.latitude,
            'longitude', gl.longitude,
            'speed', gl.speed,
            'direction', gl.direction,
            'timestamp', gl.gpsTimestamp
        )
        FROM GpsLocations gl 
        WHERE gl.vehicleId = v.id 
        ORDER BY gl.gpsTimestamp DESC 
        LIMIT 1
    ) as lastLocation,
    v.createdAt,
    v.updatedAt
FROM Vehicles v
LEFT JOIN Assignments a ON v.id = a.vehicleId AND a.isActive = TRUE AND a.deletedAt IS NULL
LEFT JOIN Users u ON a.userId = u.id AND u.deletedAt IS NULL
WHERE v.deletedAt IS NULL;

-- Vista para usuarios con información de asignaciones
CREATE OR REPLACE VIEW UsersComplete AS
SELECT 
    u.id,
    u.firstName,
    u.lastName,
    CONCAT(u.firstName, ' ', u.lastName) as fullName,
    u.email,
    u.phone,
    u.role,
    u.photo,
    (
        SELECT COUNT(*)
        FROM Assignments a
        WHERE a.userId = u.id AND a.isActive = TRUE AND a.deletedAt IS NULL
    ) as assignedVehicles,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'vehicleId', v.id,
                'licensePlate', v.licensePlate,
                'model', v.model,
                'brand', v.brand,
                'assignmentDate', a.assignmentDate
            )
        )
        FROM Assignments a
        JOIN Vehicles v ON a.vehicleId = v.id
        WHERE a.userId = u.id AND a.isActive = TRUE 
        AND a.deletedAt IS NULL AND v.deletedAt IS NULL
    ) as vehicles,
    u.createdAt,
    u.updatedAt
FROM Users u
WHERE u.deletedAt IS NULL;

-- Función para obtener estadísticas del dashboard
DELIMITER //
CREATE OR REPLACE FUNCTION GetDashboardStats()
RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    
    SELECT JSON_OBJECT(
        'totalVehicles', (SELECT COUNT(*) FROM Vehicles WHERE deletedAt IS NULL),
        'availableVehicles', (SELECT COUNT(*) FROM Vehicles WHERE status = 'available' AND deletedAt IS NULL),
        'assignedVehicles', (SELECT COUNT(*) FROM Vehicles WHERE status = 'assigned' AND deletedAt IS NULL),
        'maintenanceVehicles', (SELECT COUNT(*) FROM Vehicles WHERE status = 'maintenance' AND deletedAt IS NULL),
        'outOfServiceVehicles', (SELECT COUNT(*) FROM Vehicles WHERE status = 'out_of_service' AND deletedAt IS NULL),
        'totalUsers', (SELECT COUNT(*) FROM Users WHERE deletedAt IS NULL),
        'adminUsers', (SELECT COUNT(*) FROM Users WHERE role IN ('GlobalAdmin', 'Admin') AND deletedAt IS NULL),
        'regularUsers', (SELECT COUNT(*) FROM Users WHERE role = 'User' AND deletedAt IS NULL),
        'activeAssignments', (SELECT COUNT(*) FROM Assignments WHERE isActive = TRUE AND deletedAt IS NULL),
        'vehiclesByBrand', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT('brand', brand, 'count', vehicle_count)
            )
            FROM (
                SELECT brand, COUNT(*) as vehicle_count
                FROM Vehicles
                WHERE deletedAt IS NULL
                GROUP BY brand
                ORDER BY vehicle_count DESC
            ) brand_stats
        )
    ) INTO result;
    
    RETURN result;
END //
DELIMITER ;

-- Función para limpiar sesiones expiradas
DELIMITER //
CREATE OR REPLACE PROCEDURE CleanExpiredSessions()
BEGIN
    DELETE FROM Sessions WHERE expiresAt < NOW();
END //
DELIMITER ;

-- Función para obtener el historial de ubicaciones de un vehículo
DELIMITER //
CREATE OR REPLACE FUNCTION GetVehicleLocationHistory(vehicleId INT, hours INT)
RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'latitude', latitude,
            'longitude', longitude,
            'speed', speed,
            'direction', direction,
            'timestamp', gpsTimestamp
        )
    ) INTO result
    FROM GpsLocations
    WHERE vehicleId = vehicleId 
    AND gpsTimestamp >= DATE_SUB(NOW(), INTERVAL hours HOUR)
    ORDER BY gpsTimestamp ASC;
    
    RETURN COALESCE(result, JSON_ARRAY());
END //
DELIMITER ;

-- Trigger para registrar actividad en logs
DELIMITER //
CREATE OR REPLACE TRIGGER LogUserActivity
AFTER UPDATE ON Users
FOR EACH ROW
BEGIN
    INSERT INTO ActivityLogs (userId, action, tableName, recordId, oldData, newData)
    VALUES (
        NEW.id,
        'UPDATE',
        'Users',
        NEW.id,
        JSON_OBJECT(
            'firstName', OLD.firstName,
            'lastName', OLD.lastName,
            'email', OLD.email,
            'phone', OLD.phone,
            'role', OLD.role
        ),
        JSON_OBJECT(
            'firstName', NEW.firstName,
            'lastName', NEW.lastName,
            'email', NEW.email,
            'phone', NEW.phone,
            'role', NEW.role
        )
    );
END //
DELIMITER ;

-- Trigger para registrar actividad en vehículos
DELIMITER //
CREATE OR REPLACE TRIGGER LogVehicleActivity
AFTER UPDATE ON Vehicles
FOR EACH ROW
BEGIN
    INSERT INTO ActivityLogs (userId, action, tableName, recordId, oldData, newData)
    VALUES (
        NULL,
        'UPDATE',
        'Vehicles',
        NEW.id,
        JSON_OBJECT(
            'licensePlate', OLD.licensePlate,
            'status', OLD.status,
            'assignedTo', OLD.assignedTo,
            'mileage', OLD.mileage
        ),
        JSON_OBJECT(
            'licensePlate', NEW.licensePlate,
            'status', NEW.status,
            'assignedTo', NEW.assignedTo,
            'mileage', NEW.mileage
        )
    );
END //
DELIMITER ;

-- Trigger para registrar asignaciones
DELIMITER //
CREATE OR REPLACE TRIGGER LogAssignmentActivity
AFTER INSERT ON Assignments
FOR EACH ROW
BEGIN
    INSERT INTO ActivityLogs (userId, action, tableName, recordId, newData)
    VALUES (
        NEW.userId,
        'ASSIGN_VEHICLE',
        'Assignments',
        NEW.id,
        JSON_OBJECT(
            'userId', NEW.userId,
            'vehicleId', NEW.vehicleId,
            'notes', NEW.notes
        )
    );
END //
DELIMITER ;

-- Evento para limpiar sesiones expiradas automáticamente
CREATE EVENT IF NOT EXISTS CleanExpiredSessionsEvent
ON SCHEDULE EVERY 1 HOUR
DO
  CALL CleanExpiredSessions();

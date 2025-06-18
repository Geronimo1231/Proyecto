-- Migración para agregar campos adicionales y optimizaciones

-- Agregar índices adicionales para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_rol_activo ON usuarios(rol_id, activo);
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado ON vehiculos(estado);
CREATE INDEX IF NOT EXISTS idx_asignaciones_activa ON asignaciones(activa);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_timestamp_vehiculo ON ubicaciones_gps(vehiculo_id, timestamp_gps DESC);

-- Agregar tabla de sesiones para manejo de JWT
CREATE TABLE IF NOT EXISTS sesiones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sesiones_usuario ON sesiones(usuario_id);
CREATE INDEX idx_sesiones_token ON sesiones(token_hash);
CREATE INDEX idx_sesiones_expires ON sesiones(expires_at);

-- Agregar tabla de logs de actividad
CREATE TABLE IF NOT EXISTS logs_actividad (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id INTEGER,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_usuario ON logs_actividad(usuario_id);
CREATE INDEX idx_logs_fecha ON logs_actividad(created_at);
CREATE INDEX idx_logs_accion ON logs_actividad(accion);

-- Agregar tabla de configuraciones del sistema
CREATE TABLE IF NOT EXISTS configuraciones (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    tipo VARCHAR(20) DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuraciones por defecto
INSERT INTO configuraciones (clave, valor, descripcion, tipo) VALUES 
('gps_update_interval', '30', 'Intervalo de actualización GPS en segundos', 'number'),
('max_vehicles_per_user', '5', 'Máximo de vehículos por usuario', 'number'),
('enable_real_time_tracking', 'true', 'Habilitar seguimiento en tiempo real', 'boolean'),
('company_name', 'Sistema de Gestión Vehicular', 'Nombre de la empresa', 'string'),
('map_default_zoom', '10', 'Zoom por defecto del mapa', 'number'),
('map_center_lat', '19.432608', 'Latitud del centro del mapa por defecto', 'string'),
('map_center_lng', '-99.133209', 'Longitud del centro del mapa por defecto', 'string');

-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_vehiculos', (SELECT COUNT(*) FROM vehiculos),
        'vehiculos_disponibles', (SELECT COUNT(*) FROM vehiculos WHERE estado = 'disponible'),
        'vehiculos_asignados', (SELECT COUNT(*) FROM vehiculos WHERE estado = 'asignado'),
        'vehiculos_mantenimiento', (SELECT COUNT(*) FROM vehiculos WHERE estado = 'mantenimiento'),
        'total_usuarios', (SELECT COUNT(*) FROM usuarios WHERE activo = true),
        'usuarios_admin', (SELECT COUNT(*) FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE r.nombre = 'admin' AND u.activo = true),
        'usuarios_normales', (SELECT COUNT(*) FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE r.nombre = 'usuario' AND u.activo = true),
        'asignaciones_activas', (SELECT COUNT(*) FROM asignaciones WHERE activa = true),
        'marcas_vehiculos', (
            SELECT json_agg(json_build_object('marca', m.nombre, 'cantidad', marca_count.total))
            FROM marcas m
            JOIN (
                SELECT marca_id, COUNT(*) as total
                FROM vehiculos
                GROUP BY marca_id
            ) marca_count ON m.id = marca_count.marca_id
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Vista para vehículos con información completa
CREATE OR REPLACE VIEW vista_vehiculos_completa AS
SELECT 
    v.id,
    v.matricula,
    v.modelo,
    v.año,
    v.color,
    v.kilometraje,
    v.estado,
    v.imagenes,
    m.nombre as marca,
    tv.nombre as tipo_vehiculo,
    tv.descripcion as tipo_descripcion,
    CASE 
        WHEN a.id IS NOT NULL THEN json_build_object(
            'usuario_id', u.id,
            'usuario_nombre', u.nombre || ' ' || u.apellido,
            'usuario_email', u.email,
            'fecha_asignacion', a.fecha_asignacion
        )
        ELSE NULL
    END as asignacion_actual,
    (
        SELECT json_build_object(
            'latitud', ug.latitud,
            'longitud', ug.longitud,
            'velocidad', ug.velocidad,
            'direccion', ug.direccion,
            'timestamp', ug.timestamp_gps
        )
        FROM ubicaciones_gps ug 
        WHERE ug.vehiculo_id = v.id 
        ORDER BY ug.timestamp_gps DESC 
        LIMIT 1
    ) as ultima_ubicacion,
    v.created_at,
    v.updated_at
FROM vehiculos v
LEFT JOIN marcas m ON v.marca_id = m.id
LEFT JOIN tipos_vehiculos tv ON v.tipo_vehiculo_id = tv.id
LEFT JOIN asignaciones a ON v.id = a.vehiculo_id AND a.activa = true
LEFT JOIN usuarios u ON a.usuario_id = u.id;

-- Vista para usuarios con información de rol
CREATE OR REPLACE VIEW vista_usuarios_completa AS
SELECT 
    u.id,
    u.nombre,
    u.apellido,
    u.email,
    u.telefono,
    u.foto_perfil,
    u.activo,
    r.nombre as rol,
    r.descripcion as rol_descripcion,
    (
        SELECT COUNT(*)
        FROM asignaciones a
        WHERE a.usuario_id = u.id AND a.activa = true
    ) as vehiculos_asignados,
    u.created_at,
    u.updated_at
FROM usuarios u
JOIN roles r ON u.rol_id = r.id;

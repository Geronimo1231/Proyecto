module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Habilitar extensión PostGIS
    await queryInterface.sequelize.query("CREATE EXTENSION IF NOT EXISTS postgis;")

    await queryInterface.createTable("ubicaciones_gps", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      vehiculo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "vehiculos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      latitud: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      longitud: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
      },
      velocidad: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
      },
      direccion: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
      },
      timestamp_gps: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    })

    // Agregar columna PostGIS
    await queryInterface.sequelize.query("ALTER TABLE ubicaciones_gps ADD COLUMN ubicacion GEOMETRY(POINT, 4326);")

    // Crear índices
    await queryInterface.addIndex("ubicaciones_gps", ["vehiculo_id"])
    await queryInterface.addIndex("ubicaciones_gps", ["timestamp_gps"])
    await queryInterface.addIndex("ubicaciones_gps", ["vehiculo_id", "timestamp_gps"])

    // Crear índice espacial
    await queryInterface.sequelize.query(
      "CREATE INDEX idx_ubicaciones_gps_geom ON ubicaciones_gps USING GIST(ubicacion);",
    )

    // Crear trigger para actualizar ubicación PostGIS
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_ubicacion_point()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.ubicacion = ST_SetSRID(ST_MakePoint(NEW.longitud, NEW.latitud), 4326);
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `)

    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_ubicacion_gps_point 
      BEFORE INSERT OR UPDATE ON ubicaciones_gps 
      FOR EACH ROW EXECUTE FUNCTION update_ubicacion_point();
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query("DROP TRIGGER IF EXISTS update_ubicacion_gps_point ON ubicaciones_gps;")
    await queryInterface.sequelize.query("DROP FUNCTION IF EXISTS update_ubicacion_point();")
    await queryInterface.dropTable("ubicaciones_gps")
  },
}

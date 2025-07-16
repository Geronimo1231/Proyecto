module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columna geography si no existe
    try {
      await queryInterface.addColumn('GpsLocations', 'location', {
        type: Sequelize.GEOGRAPHY('POINT'),
        allowNull: true,
      });
    } catch (error) {
      console.log('Column location already exists or error:', error.message);
    }

    // Agregar columnas adicionales
    try {
      await queryInterface.addColumn('GpsLocations', 'altitude', {
        type: Sequelize.DECIMAL(8, 2),
        defaultValue: 0,
      });
    } catch (error) {
      console.log('Column altitude already exists or error:', error.message);
    }

    try {
      await queryInterface.addColumn('GpsLocations', 'accuracy', {
        type: Sequelize.DECIMAL(8, 2),
        defaultValue: 0,
      });
    } catch (error) {
      console.log('Column accuracy already exists or error:', error.message);
    }

    // Actualizar ubicaciones existentes para incluir geography
    await queryInterface.sequelize.query(`
      UPDATE "GpsLocations" 
      SET location = ST_GeogFromText('POINT(' || longitude || ' ' || latitude || ')')
      WHERE location IS NULL AND latitude IS NOT NULL AND longitude IS NOT NULL;
    `);

    // Crear función para actualizar automáticamente el campo geography
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_gps_location_geography()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
              NEW.location = ST_GeogFromText('POINT(' || NEW.longitude || ' ' || NEW.latitude || ')');
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Crear trigger para actualizar automáticamente el geography
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_update_gps_geography ON "GpsLocations";
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trigger_update_gps_geography
          BEFORE INSERT OR UPDATE ON "GpsLocations"
          FOR EACH ROW
          EXECUTE FUNCTION update_gps_location_geography();
    `);

    // Crear índices espaciales
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "gps_locations_location_idx" 
      ON "GpsLocations" USING GIST ("location");
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "gps_locations_vehicle_timestamp_idx" 
      ON "GpsLocations" ("vehicleId", "gpsTimestamp" DESC);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "gps_locations_timestamp_idx" 
      ON "GpsLocations" ("gpsTimestamp" DESC);
    `);

    // Insertar datos de prueba adicionales
    await queryInterface.bulkInsert("GpsLocations", [
      {
        vehicleId: 1,
        latitude: 19.4285,
        longitude: -99.1277,
        speed: 25.5,
        direction: 45.0,
        altitude: 2240,
        accuracy: 3.0,
        gpsTimestamp: new Date(Date.now() - 3600000), // 1 hora atrás
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        vehicleId: 1,
        latitude: 19.4295,
        longitude: -99.1267,
        speed: 30.2,
        direction: 50.0,
        altitude: 2245,
        accuracy: 2.5,
        gpsTimestamp: new Date(Date.now() - 1800000), // 30 minutos atrás
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        vehicleId: 2,
        latitude: 25.6901,
        longitude: -100.3161,
        speed: 55.8,
        direction: 180.0,
        altitude: 545,
        accuracy: 4.0,
        gpsTimestamp: new Date(Date.now() - 2700000), // 45 minutos atrás
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        vehicleId: 2,
        latitude: 25.6891,
        longitude: -100.3151,
        speed: 60.1,
        direction: 175.0,
        altitude: 540,
        accuracy: 3.5,
        gpsTimestamp: new Date(Date.now() - 900000), // 15 minutos atrás
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        vehicleId: 3,
        latitude: 20.6580,
        longitude: -103.3496,
        speed: 40.3,
        direction: 270.0,
        altitude: 1570,
        accuracy: 5.0,
        gpsTimestamp: new Date(Date.now() - 1200000), // 20 minutos atrás
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Eliminar trigger y función
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_update_gps_geography ON "GpsLocations";
    `);
    
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS update_gps_location_geography();
    `);

    // Eliminar índices
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "gps_locations_location_idx";
    `);
    
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "gps_locations_vehicle_timestamp_idx";
    `);
    
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "gps_locations_timestamp_idx";
    `);

    // Eliminar columnas
    await queryInterface.removeColumn('GpsLocations', 'location');
    await queryInterface.removeColumn('GpsLocations', 'altitude');
    await queryInterface.removeColumn('GpsLocations', 'accuracy');
  },
};

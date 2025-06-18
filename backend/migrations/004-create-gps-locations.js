module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("GpsLocations", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      vehicleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Vehicles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
      },
      speed: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
      },
      direction: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
      },
      gpsTimestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })

    // Crear índices
    await queryInterface.addIndex("GpsLocations", ["vehicleId"])
    await queryInterface.addIndex("GpsLocations", ["gpsTimestamp"])
    await queryInterface.addIndex("GpsLocations", ["vehicleId", "gpsTimestamp"])

    // Insertar ubicaciones de ejemplo
    await queryInterface.bulkInsert("GpsLocations", [
      {
        vehicleId: 1,
        latitude: 19.432608,
        longitude: -99.133209,
        speed: 45.5,
        direction: 90.0,
        gpsTimestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        vehicleId: 2,
        latitude: 25.686614,
        longitude: -100.316113,
        speed: 60.2,
        direction: 180.0,
        gpsTimestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        vehicleId: 3,
        latitude: 20.659699,
        longitude: -103.349609,
        speed: 35.8,
        direction: 270.0,
        gpsTimestamp: new Date(),
        updatedAt: new Date(),
      },
    ])
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("GpsLocations")
  },
}

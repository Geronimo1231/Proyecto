module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tipos_vehiculos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      Description: {
        type: Sequelize.TEXT,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    })

    // Insertar tipos por defecto
    await queryInterface.bulkInsert("tipos_vehiculos", [
      { name: "Sedán", Description: "Vehículo de pasajeros de 4 puertas", created_at: new Date() },
      { name: "Pickup", Description: "Camioneta con área de carga", created_at: new Date() },
      { name: "SUV", Description: "Vehículo utilitario deportivo", created_at: new Date() },
      { name: "Hatchback", Description: "Vehículo compacto con portón trasero", created_at: new Date() },
      { name: "Coupé", Description: "Vehículo deportivo de 2 puertas", created_at: new Date() },
      { name: "Convertible", Description: "Vehículo con techo retráctil", created_at: new Date() },
      { name: "Camión", Description: "Vehículo de carga pesada", created_at: new Date() },
      { name: "Van", Description: "Vehículo de pasajeros o carga", created_at: new Date() },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tipos_vehiculos")
  },
}

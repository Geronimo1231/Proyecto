module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tipos_vehiculos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nombre: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      descripcion: {
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
      { nombre: "Sedán", descripcion: "Vehículo de pasajeros de 4 puertas", created_at: new Date() },
      { nombre: "Pickup", descripcion: "Camioneta con área de carga", created_at: new Date() },
      { nombre: "SUV", descripcion: "Vehículo utilitario deportivo", created_at: new Date() },
      { nombre: "Hatchback", descripcion: "Vehículo compacto con portón trasero", created_at: new Date() },
      { nombre: "Coupé", descripcion: "Vehículo deportivo de 2 puertas", created_at: new Date() },
      { nombre: "Convertible", descripcion: "Vehículo con techo retráctil", created_at: new Date() },
      { nombre: "Camión", descripcion: "Vehículo de carga pesada", created_at: new Date() },
      { nombre: "Van", descripcion: "Vehículo de pasajeros o carga", created_at: new Date() },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tipos_vehiculos")
  },
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("marcas", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null,
      },
    })

    // Insertar marcas por defecto
    await queryInterface.bulkInsert("marcas", [
      { name: "Toyota", created_at: new Date() },
      { name: "Honda", created_at: new Date() },
      { name: "Ford", created_at: new Date() },
      { name: "Chevrolet", created_at: new Date() },
      { name: "Nissan", created_at: new Date() },
      { name: "Volkswagen", created_at: new Date() },
      { name: "BMW", created_at: new Date() },
      { name: "Mercedes-Benz", created_at: new Date() },
      { name: "Audi", created_at: new Date() },
      { name: "Hyundai", created_at: new Date() },
      { name: "Kia", created_at: new Date() },
      { name: "Mazda", created_at: new Date() },
      { name: "Subaru", created_at: new Date() },
      { name: "Jeep", created_at: new Date() },
      { name: "Ram", created_at: new Date() },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("marcas")
  },
}

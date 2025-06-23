module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("marcas", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    })

    // Insertar marcas por defecto
    await queryInterface.bulkInsert("marcas", [
      { nombre: "Toyota", created_at: new Date() },
      { nombre: "Honda", created_at: new Date() },
      { nombre: "Ford", created_at: new Date() },
      { nombre: "Chevrolet", created_at: new Date() },
      { nombre: "Nissan", created_at: new Date() },
      { nombre: "Volkswagen", created_at: new Date() },
      { nombre: "BMW", created_at: new Date() },
      { nombre: "Mercedes-Benz", created_at: new Date() },
      { nombre: "Audi", created_at: new Date() },
      { nombre: "Hyundai", created_at: new Date() },
      { nombre: "Kia", created_at: new Date() },
      { nombre: "Mazda", created_at: new Date() },
      { nombre: "Subaru", created_at: new Date() },
      { nombre: "Jeep", created_at: new Date() },
      { nombre: "Ram", created_at: new Date() },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("marcas")
  },
}

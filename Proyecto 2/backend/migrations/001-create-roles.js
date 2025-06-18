module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("roles", {
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
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    })

    // Insertar roles por defecto
    await queryInterface.bulkInsert("roles", [
      {
        nombre: "admin",
        descripcion: "Administrador del sistema con acceso completo",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nombre: "usuario",
        descripcion: "Usuario estándar con acceso limitado",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("roles")
  },
}

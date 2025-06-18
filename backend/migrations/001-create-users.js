module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      firstName: {
        type: Sequelize.STRING,
      },
      lastName: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      role: {
        type: Sequelize.ENUM("GlobalAdmin", "Admin", "User"),
      },
      photo: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null,
      },
    })

    // Insertar usuarios por defecto
    await queryInterface.bulkInsert("Users", [
      {
        firstName: "Global",
        lastName: "Admin",
        email: "admin@vehiculos.com",
        phone: "+1234567890",
        password: "$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ",
        role: "GlobalAdmin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Juan Carlos",
        lastName: "Pérez López",
        email: "usuario@vehiculos.com",
        phone: "+0987654321",
        password: "$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ",
        role: "User",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "María Elena",
        lastName: "González Ruiz",
        email: "maria@vehiculos.com",
        phone: "+1122334455",
        password: "$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ",
        role: "User",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Carlos Alberto",
        lastName: "Rodríguez Sánchez",
        email: "carlos@vehiculos.com",
        phone: "+5566778899",
        password: "$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ",
        role: "User",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users")
  },
}

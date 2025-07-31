module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Vehicles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      licensePlate: {
        type: Sequelize.STRING,
        unique: true,
      },
      model: {
        type: Sequelize.STRING,
      },
      brand: {
        type: Sequelize.STRING,
      },
      year: {
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM("available", "assigned", "maintenance", "out_of_service"),
        defaultValue: "available",
      },
      image: {
        type: Sequelize.STRING,
      },
      assignedTo: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        allowNull: true,
      },
      mileage: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      color: {
        type: Sequelize.STRING,
      },
      engineNumber: {
        type: Sequelize.STRING,
      },
      chassisNumber: {
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Vehicles")
  },
}

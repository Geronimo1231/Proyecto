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

    // Insertar vehículos de ejemplo
    await queryInterface.bulkInsert("Vehicles", [
      {
        licensePlate: "ABC-123",
        model: "Corolla",
        brand: "Toyota",
        year: 2023,
        type: "Sedan",
        status: "available",
        color: "Blanco",
        mileage: 15000,
        engineNumber: "TOY2023001",
        chassisNumber: "CHASIS001",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        licensePlate: "DEF-456",
        model: "Civic",
        brand: "Honda",
        year: 2022,
        type: "Sedan",
        status: "available",
        color: "Negro",
        mileage: 25000,
        engineNumber: "HON2022001",
        chassisNumber: "CHASIS002",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        licensePlate: "GHI-789",
        model: "F-150",
        brand: "Ford",
        year: 2024,
        type: "Pickup",
        status: "available",
        color: "Azul",
        mileage: 8000,
        engineNumber: "FOR2024001",
        chassisNumber: "CHASIS003",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Vehicles")
  },
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Assignments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      vehicleId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Vehicles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      assignmentDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      unassignmentDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      notes: {
        type: Sequelize.TEXT,
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
    });

    // Crear índices
    await queryInterface.addIndex("Assignments", ["userId"]);
    await queryInterface.addIndex("Assignments", ["vehicleId"]);
    await queryInterface.addIndex("Assignments", ["isActive"]);

    // Insertar datos de prueba
    await queryInterface.bulkInsert('Assignments', [
      {
        userId: 1,
        vehicleId: 1,
        assignmentDate: new Date('2025-07-01T08:00:00Z'),
        unassignmentDate: null,
        isActive: true,
        notes: 'Asignación inicial para el usuario 1 y vehículo 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        userId: 2,
        vehicleId: 2,
        assignmentDate: new Date('2025-06-15T09:30:00Z'),
        unassignmentDate: new Date('2025-07-10T10:00:00Z'),
        isActive: false,
        notes: 'Asignación finalizada para el usuario 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        userId: 3,
        vehicleId: 3,
        assignmentDate: new Date('2025-07-10T12:00:00Z'),
        unassignmentDate: null,
        isActive: true,
        notes: 'Asignación activa sin notas especiales',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Assignments");
  },
};

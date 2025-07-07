module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("asignaciones", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      vehiculo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "vehiculos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      fecha_asignacion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      fecha_desasignacion: {
        type: Sequelize.DATE,
      },
      activa: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      observaciones: {
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

    // Crear índices
    await queryInterface.addIndex("asignaciones", ["usuario_id"])
    await queryInterface.addIndex("asignaciones", ["vehiculo_id"])
    await queryInterface.addIndex("asignaciones", ["activa"])

    // Crear constraint único para vehículo activo
    await queryInterface.addConstraint("asignaciones", {
      fields: ["vehiculo_id", "activa"],
      type: "unique",
      name: "unique_vehiculo_activo",
      where: {
        activa: true,
      },
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("asignaciones")
  },
}

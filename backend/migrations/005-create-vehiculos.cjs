module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("vehiculos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      matricula: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      marca_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "marcas",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      modelo: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      año: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      color: {
        type: Sequelize.STRING(50),
      },
      tipo_vehiculo_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "tipos_vehiculos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      numero_motor: {
        type: Sequelize.STRING(100),
      },
      numero_chasis: {
        type: Sequelize.STRING(100),
      },
      kilometraje: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      estado: {
        type: Sequelize.ENUM("disponible", "asignado", "mantenimiento", "fuera_servicio"),
        defaultValue: "disponible",
      },
      imagenes: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: [],
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
    await queryInterface.addIndex("vehiculos", ["matricula"])
    await queryInterface.addIndex("vehiculos", ["estado"])
    await queryInterface.addIndex("vehiculos", ["marca_id"])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("vehiculos")
  },
}

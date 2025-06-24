import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

export const Vehiculo = sequelize.define(
  "Vehiculo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    matricula: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "La matrícula es obligatoria" },
      },
    },
    marca_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "marcas",
        key: "id",
      },
    },
    modelo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El modelo es obligatorio" },
      },
    },
    año: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: 1900, msg: "El año debe ser mayor a 1900" },
        max: { args: 2025, msg: "El año no puede ser mayor a 2025" },
      },
    },
    color: {
      type: DataTypes.STRING(50),
    },
    tipo_vehiculo_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "tipos_vehiculos",
        key: "id",
      },
    },
    numero_motor: {
      type: DataTypes.STRING(100),
    },
    numero_chasis: {
      type: DataTypes.STRING(100),
    },
    kilometraje: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: { args: 0, msg: "El kilometraje no puede ser negativo" },
      },
    },
    estado: {
      type: DataTypes.ENUM("disponible", "asignado", "mantenimiento", "fuera_servicio"),
      defaultValue: "disponible",
    },
    imagenes: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
  },
  {
    tableName: "vehiculos",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
)

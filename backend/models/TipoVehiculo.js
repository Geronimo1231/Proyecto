import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

export const TipoVehiculo = sequelize.define(
  "TipoVehiculo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "El nombre del tipo de vehículo es obligatorio" },
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "tipos_vehiculos",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
)

import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

export const UbicacionGPS = sequelize.define(
  "UbicacionGPS",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vehiculo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "vehiculos",
        key: "id",
      },
    },
    latitud: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      validate: {
        min: { args: -90, msg: "La latitud debe estar entre -90 y 90" },
        max: { args: 90, msg: "La latitud debe estar entre -90 y 90" },
      },
    },
    longitud: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      validate: {
        min: { args: -180, msg: "La longitud debe estar entre -180 y 180" },
        max: { args: 180, msg: "La longitud debe estar entre -180 y 180" },
      },
    },
    velocidad: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: {
        min: { args: 0, msg: "La velocidad no puede ser negativa" },
      },
    },
    direccion: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: {
        min: { args: 0, msg: "La dirección debe estar entre 0 y 360" },
        max: { args: 360, msg: "La dirección debe estar entre 0 y 360" },
      },
    },
    timestamp_gps: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "ubicaciones_gps",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
)

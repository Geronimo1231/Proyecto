import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

export const Asignacion = sequelize.define(
  "Asignacion",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id",
      },
    },
    vehiculo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "vehiculos",
        key: "id",
      },
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_desasignacion: {
      type: DataTypes.DATE,
    },
    activa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "asignaciones",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
)

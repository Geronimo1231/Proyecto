import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

export const Marca = sequelize.define(
  "Marca",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "El nombre de la marca es obligatorio" },
      },
    },
  },
  {
    tableName: "marcas",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
)

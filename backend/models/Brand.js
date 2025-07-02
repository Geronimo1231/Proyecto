import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

export const Brand = sequelize.define(
  "Brand",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "El name de la marca es obligatorio" },
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

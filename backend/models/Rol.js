import { DataTypes } from "sequelize"
import sequelize from '../config/database.js' 


export const Rol = sequelize.define(
  "Rol",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "El name del rol es obligatorio" },
      },
    },
    Description: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "roles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
)

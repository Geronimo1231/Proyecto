import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const Vehicle = sequelize.define(
  "Vehicle",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    licensePlate: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    mileage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    engineNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    chassisNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("available", "assigned", "maintenance", "out_of_service"),
      allowNull: false,
      defaultValue: "available",
    },
    assignedUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "vehicles",
    timestamps: true,
    paranoid: true,
  },
)

export { Vehicle }
export default Vehicle

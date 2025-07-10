import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Vehicle = sequelize.define(
  "Vehicle",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    licensePlate: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("available", "assigned", "maintenance", "out_of_service"),
      allowNull: false,
      defaultValue: "available",
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    mileage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    engineNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    chassisNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Vehicles",
    paranoid: true,
  },
)

export default Vehicle

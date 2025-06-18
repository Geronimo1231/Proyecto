import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const GpsLocation = sequelize.define(
  "GpsLocation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vehicleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    speed: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    direction: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    gpsTimestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "gps_locations",
    timestamps: true,
  },
)

export { GpsLocation }
export default GpsLocation

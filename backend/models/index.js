import { sequelize } from "../config/database.js"
import User from "./User.js"
import Vehicle from "./Vehicle.js"
import Assignment from "./Assignment.js"
import GpsLocation from "./GpsLocation.js"

// Definir relaciones
User.hasMany(Assignment, { foreignKey: "userId", as: "assignments" })
Assignment.belongsTo(User, { foreignKey: "userId", as: "user" })

Vehicle.hasMany(Assignment, { foreignKey: "vehicleId", as: "assignments" })
Assignment.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" })

Vehicle.belongsTo(User, { foreignKey: "assignedUserId", as: "assignedUser" })
User.hasMany(Vehicle, { foreignKey: "assignedUserId", as: "assignedVehicles" })

Vehicle.hasMany(GpsLocation, { foreignKey: "vehicleId", as: "gpsLocations" })
GpsLocation.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" })

export { sequelize, User, Vehicle, Assignment, GpsLocation }

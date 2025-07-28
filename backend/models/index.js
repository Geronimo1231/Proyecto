import sequelize from '../config/database.js' 

import User from "./User.js"
import Vehicle from "./Vehicle.js"
import Assignment from "./Assignment.js"
import GpsLocation from "./GpsLocation.js"
import { TipoVehiculo } from "./TipoVehiculo.js"
import { Rol } from "./Rol.js"
import { Marca } from "./Marca.js"

// Definir relaciones
User.hasMany(Assignment, { foreignKey: "userId", as: "assignments" })
Assignment.belongsTo(User, { foreignKey: "userId", as: "user" })

Vehicle.hasMany(Assignment, { foreignKey: "vehicleId", as: "assignments" })
Assignment.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" })

Vehicle.hasMany(GpsLocation, { foreignKey: "vehicleId", as: "gpsLocations" })
GpsLocation.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" })

export { sequelize, User, Vehicle, Assignment, GpsLocation, TipoVehiculo, Rol, Marca}

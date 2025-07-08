import express from "express"
import {
  getAllVehicleLocations,
  getLatestVehicleLocation,
  createGpsLocation,
  getVehicleLocations,
  getUserVehicleLocations,
  bulkCreateGpsLocations,
} from "../controllers/gpsController.js"
import { validateGpsLocation } from "../middleware/validation.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()
router.use(authenticateToken)

// Rutas para usuarios normales
router.get("/user/locations", getUserVehicleLocations)

// Rutas públicas para usuarios autenticados
router.get("/", getAllVehicleLocations)
router.get("/latest", getLatestVehicleLocation)
router.get("/vehicles/:vehicleId/history", getVehicleLocations)

// Rutas para crear ubicaciones (pueden ser usadas por dispositivos GPS)
router.post("/", validateGpsLocation, createGpsLocation)
router.post("/bulk", bulkCreateGpsLocations)

export default router

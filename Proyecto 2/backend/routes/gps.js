import express from "express"
import {
  getAllGpsLocations,
  getLatestLocations,
  createGpsLocation,
  getVehicleLocationHistory,
  getUserVehicleLocations,
  bulkCreateGpsLocations,
} from "../controllers/gpsController.js"
import { validateGpsLocation } from "../middleware/validation.js"

const router = express.Router()

// Rutas para usuarios normales
router.get("/user/locations", getUserVehicleLocations)

// Rutas públicas para usuarios autenticados
router.get("/", getAllGpsLocations)
router.get("/latest", getLatestLocations)
router.get("/vehicle/:vehicleId/history", getVehicleLocationHistory)

// Rutas para crear ubicaciones (pueden ser usadas por dispositivos GPS)
router.post("/", validateGpsLocation, createGpsLocation)
router.post("/bulk", bulkCreateGpsLocations)

export default router

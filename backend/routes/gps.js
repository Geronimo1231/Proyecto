import express from "express"
import {
  createGpsLocation,
  getVehicleLocations,
  getLatestVehicleLocation,
  getAllVehicleLocations,
  getUserVehicleLocations,
  deleteOldLocations,
  bulkCreateGpsLocations,
  createLocation,
  simulateVehicleMovements,
} from "../controllers/gpsController.js"
import { authenticateToken, requireRole } from "../middleware/auth.js"

const router = express.Router()

router.post('/', authenticateToken, requireRole('Admin'), createLocation)

// GPS Locations
router.get("/locations", authenticateToken, getAllVehicleLocations)
router.post("/locations", authenticateToken, requireRole("Admin"), createGpsLocation)
router.post("/locations/bulk", authenticateToken, requireRole("Admin"), bulkCreateGpsLocations)
router.delete("/locations/cleanup", authenticateToken, requireRole("Admin"), deleteOldLocations)

// Por vehículo
router.get("/vehicle/:vehicleId", authenticateToken, getVehicleLocations)
router.get("/vehicle/:vehicleId/latest", authenticateToken, getLatestVehicleLocation)

// Por usuario
router.get("/user/locations", authenticateToken, getUserVehicleLocations)

// Simulación (si es solo para testeo/dev)
router.post('/locations/simulate', simulateVehicleMovements)


export default router

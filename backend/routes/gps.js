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


// Rutas públicas (requieren autenticación)
router.get("/locations", authenticateToken, getAllVehicleLocations)
router.get("/user/locations", authenticateToken, getUserVehicleLocations)
router.get("/vehicle/:vehicleId", authenticateToken, getVehicleLocations)
router.get("/vehicle/:vehicleId/latest", authenticateToken, getLatestVehicleLocation)

// Rutas de administrador
router.post("/locations", authenticateToken, requireRole("Admin"), createGpsLocation)
router.post("/locations/bulk", authenticateToken, requireRole("Admin"), bulkCreateGpsLocations)
router.delete("/cleanup", authenticateToken, requireRole("Admin"), deleteOldLocations)

// Ruta para simular movimientos
router.post('/simulate', simulateVehicleMovements)

export default router

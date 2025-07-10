import express from "express"
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
  getVehicleStats,
} from "../controllers/vehicleController.js"
import { authenticateToken, requireRole } from "../middleware/auth.js"

const router = express.Router()

// Rutas públicas (requieren autenticación)
router.get("/", authenticateToken, getAllVehicles)
router.get("/available", authenticateToken, getAvailableVehicles)
router.get("/stats", authenticateToken, getVehicleStats)
router.get("/:id", authenticateToken, getVehicleById)

// Rutas de administrador
router.post("/", authenticateToken, requireRole("Admin"), createVehicle)
router.put("/:id", authenticateToken, requireRole("Admin"), updateVehicle)
router.delete("/:id", authenticateToken, requireRole("Admin"), deleteVehicle)

export default router

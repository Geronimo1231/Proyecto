import express from "express"
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
} from "../controllers/vehicleController.js"
import { authenticateToken, requireRole } from "../middleware/auth.js"
import { processImageUpload, deleteOldImage } from "../middleware/imageUpload.js"

const router = express.Router()

// Rutas públicas (con autenticación)
router.get("/", authenticateToken, getAllVehicles)
router.get("/available", authenticateToken, getAvailableVehicles)
router.get("/:id", authenticateToken, getVehicleById)

// Rutas de administrador
router.post("/", authenticateToken, requireRole("Admin"), ...processImageUpload("image"), createVehicle)

router.put(
  "/:id",
  authenticateToken,
  requireRole("Admin"),
  ...processImageUpload("image"),
  deleteOldImage,
  updateVehicle,
)

router.delete("/:id", authenticateToken, requireRole("Admin"), deleteVehicle)

export default router

import express from "express"
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController.js"
import { validateVehicle } from "../middleware/validation.js"
import { requireRole } from "../middleware/auth.js"

const router = express.Router()

router.get("/", getAllVehicles)
router.get("/:id", getVehicleById)
router.post("/", requireRole(["GlobalAdmin", "Admin"]), validateVehicle, createVehicle)
router.put("/:id", requireRole(["GlobalAdmin", "Admin"]), validateVehicle, updateVehicle)
router.delete("/:id", requireRole(["GlobalAdmin", "Admin"]), deleteVehicle)

export default router

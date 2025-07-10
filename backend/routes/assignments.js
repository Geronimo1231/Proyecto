import express from "express"
import {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deactivateAssignment,
  deleteAssignment,
  getUserAssignments,
  getVehicleAssignments,
} from "../controllers/assignmentController.js"
import { authenticateToken, requireRole } from "../middleware/auth.js"

const router = express.Router()

// Rutas públicas (requieren autenticación)
router.get("/", authenticateToken, getAllAssignments)
router.get("/:id", authenticateToken, getAssignmentById)
router.post("/", authenticateToken, requireRole("Admin"), createAssignment)
router.put("/:id", authenticateToken, requireRole("Admin"), updateAssignment)
router.put("/:id/deactivate", authenticateToken, requireRole("Admin"), deactivateAssignment)
router.delete("/:id", authenticateToken, requireRole("Admin"), deleteAssignment)

// Rutas específicas
router.get("/user/:userId", authenticateToken, getUserAssignments)
router.get("/vehicle/:vehicleId", authenticateToken, getVehicleAssignments)

export default router

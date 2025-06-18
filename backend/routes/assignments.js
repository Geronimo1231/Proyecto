import express from "express"
import {
  getAllAssignments,
  createAssignment,
  unassignVehicle,
  getUserAssignments,
  getAssignmentById,
} from "../controllers/assignmentController.js"
import { requireAdmin } from "../middleware/auth.js"
import { validateAssignment } from "../middleware/validation.js"

const router = express.Router()

// Rutas para usuarios normales
router.get("/my", getUserAssignments)

// Rutas para administradores
router.get("/", requireAdmin, getAllAssignments)
router.get("/:id", getAssignmentById)
router.post("/", requireAdmin, validateAssignment, createAssignment)
router.patch("/:id/unassign", requireAdmin, unassignVehicle)

export default router

import express from "express"
import {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deactivateAssignment,
  activateAssignment,
  deleteAssignment,
  getUserAssignments,
  getVehicleAssignments,
  getAvailableUsersForAssignment,  // <-- agregar esta línea
} from "../controllers/assignmentController.js"
import { authenticateToken, requireRole } from "../middleware/auth.js"



const router = express.Router()

// Rutas públicas (requieren autenticación)
router.get("/", authenticateToken, getAllAssignments)
router.get("/available-users", authenticateToken, requireRole("Admin"), getAvailableUsersForAssignment)
router.get("/user/:userId", authenticateToken, getUserAssignments)
router.get("/vehicle/:vehicleId", authenticateToken, getVehicleAssignments)
router.get("/:id", authenticateToken, getAssignmentById)

router.post("/", authenticateToken, requireRole("Admin"), createAssignment)
router.put("/:id", authenticateToken, requireRole("Admin"), updateAssignment)
router.patch("/:id/deactivate", authenticateToken, requireRole("Admin"), deactivateAssignment)
router.patch("/:id/activate", authenticateToken, requireRole("Admin"), activateAssignment)
router.delete("/:id", authenticateToken, requireRole("Admin"), deleteAssignment)


export default router

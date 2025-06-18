import express from "express"
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  getUserVehicles,
} from "../controllers/userController.js"
import { requireAdmin } from "../middleware/auth.js"
import { validateUser } from "../middleware/validation.js"

const router = express.Router()

// Rutas para usuarios normales
router.get("/stats", getUserStats)
router.get("/vehicles", getUserVehicles)

// Rutas para administradores
router.get("/", requireAdmin, getAllUsers)
router.get("/:id", requireAdmin, getUserById)
router.post("/", requireAdmin, validateUser, createUser)
router.put("/:id", validateUser, updateUser)
router.delete("/:id", requireAdmin, deleteUser)

export default router

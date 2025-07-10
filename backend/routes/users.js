import express from "express"
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUsersByRole,
  updateUserPhoto,
  changePassword,
  getUserStats,
} from "../controllers/userController.js"
import { authenticateToken, requireRole } from "../middleware/auth.js"

const router = express.Router()

// Rutas públicas (requieren autenticación)
router.get("/", authenticateToken, getAllUsers)
router.get("/stats", authenticateToken, requireRole("Admin"), getUserStats)
router.get("/role/:role", authenticateToken, getUsersByRole)
router.get("/:id", authenticateToken, getUserById)

// Rutas de administrador
router.post("/", authenticateToken, requireRole("Admin"), createUser)
router.put("/:id", authenticateToken, requireRole("Admin"), updateUser)
router.delete("/:id", authenticateToken, requireRole("Admin"), deleteUser)
router.patch("/:id/toggle-status", authenticateToken, requireRole("Admin"), toggleUserStatus)

// Rutas de usuario (pueden actualizar su propia información)
router.put("/:id/photo", authenticateToken, updateUserPhoto)
router.put("/:id/password", authenticateToken, changePassword)

export default router

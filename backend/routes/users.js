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
import { requireRole, authenticateToken } from "../middleware/auth.js"
import { validateUser } from "../middleware/validation.js"

const router = express.Router()
router.use(authenticateToken)

// Rutas para usuarios normales
router.get("/stats", getUserStats)
router.get("/vehicles", getUserVehicles)
router.get("/activity", async (req, res) => {
  try {
    const userId = req.user.id
    // Implementar lógica para obtener actividad del usuario
    res.json({
      success: true,
      data: [],
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Rutas para administradores
router.get("/", requireRole, getAllUsers)
router.get("/:id", requireRole, getUserById)
router.post("/", requireRole, validateUser, createUser)
router.put("/:id", validateUser, updateUser)
router.delete("/:id", requireRole, deleteUser)

export default router

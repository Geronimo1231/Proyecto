import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth.js"
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/userController.js"

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// Rutas que requieren rol de administrador
router.get("/", requireRole(["Admin", "GlobalAdmin"]), getAllUsers)
router.get("/:id", requireRole(["Admin", "GlobalAdmin"]), getUserById)
router.post("/", requireRole(["Admin", "GlobalAdmin"]), createUser)
router.put("/:id", requireRole(["Admin", "GlobalAdmin"]), updateUser)
router.delete("/:id", requireRole(["GlobalAdmin"]), deleteUser)

export default router

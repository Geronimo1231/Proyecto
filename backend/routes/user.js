import express from "express"
import { getUserDashboard, getUserProfile, updateUserProfile } from "../controllers/userDashboardController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()
router.use(authenticateToken)

// Rutas del dashboard de usuario
router.get("/dashboard", getUserDashboard)
router.get("/profile", getUserProfile)
router.put("/profile", updateUserProfile)

export default router

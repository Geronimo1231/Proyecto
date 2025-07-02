import express from "express"
import { authenticateToken } from "../middleware/auth.js"
import { getUserDashboard, getUserProfile, updateUserProfile } from "../controllers/userDashboardController.js"
import { getUserStats, getUserVehicles } from "../controllers/userController.js"
import { getUserActivity } from "../controllers/dashboardController.js"
import { getUserVehicleLocations } from "../controllers/gpsController.js"

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// Dashboard del usuario
router.get("/dashboard", getUserDashboard)

// Perfil del usuario
router.get("/profile", getUserProfile)
router.put("/profile", updateUserProfile)

// Estadísticas del usuario
router.get("/stats", getUserStats)

// Vehículos del usuario
router.get("/vehicles", getUserVehicles)

// Actividad del usuario
router.get("/activity", getUserActivity)

// Ubicaciones GPS de vehículos del usuario
router.get("/gps", getUserVehicleLocations)

export default router

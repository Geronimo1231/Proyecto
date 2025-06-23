import express from "express"
import {
  getDashboardStats,
  getRecentActivity,
  getUserDashboardStats,
  getUserActivity,
  getSystemHealth,
} from "../controllers/dashboardController.js"
import { requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Rutas para usuarios normales
router.get("/user/stats", getUserDashboardStats)
router.get("/user/activity", getUserActivity)

// Rutas para administradores
router.get("/stats", requireAdmin, getDashboardStats)
router.get("/activity", requireAdmin, getRecentActivity)
router.get("/health", requireAdmin, getSystemHealth)

export default router

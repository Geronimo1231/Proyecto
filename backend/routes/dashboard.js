import express from "express"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()
router.use(authenticateToken)

// Obtener estadísticas del dashboard
router.get("/stats", async (req, res) => {
  try {
    const stats = {
      totalUsers: 25,
      totalVehicles: 15,
      activeAssignments: 12,
      totalGpsPoints: 1500,
      recentActivity: [],
    }

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Error en dashboard stats:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Obtener actividad reciente
router.get("/activity", async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const activities = [
      {
        id: 1,
        type: "user",
        description: "Nuevo usuario registrado: Juan Pérez",
        created_at: new Date(),
      },
      {
        id: 2,
        type: "vehicle",
        description: "Vehículo ABC-123 agregado al sistema",
        created_at: new Date(),
      },
      {
        id: 3,
        type: "assign",
        description: "Vehículo ABC-123 asignado a Juan Pérez",
        created_at: new Date(),
      },
    ]

    res.json({
      success: true,
      data: activities.slice(0, Number.parseInt(limit)),
    })
  } catch (error) {
    console.error("Error en dashboard activity:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

export default router

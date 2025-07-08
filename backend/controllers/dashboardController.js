import { User, Vehicle, Assignment, GpsLocation } from "../models/index.js"
import pkg from "../config/config.cjs"
const { logger } = pkg

import { Op } from "sequelize"

export const getAdminDashboard = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.count()
    const totalVehicles = await Vehicle.count()
    const totalAssignments = await Assignment.count()
    const activeAssignments = await Assignment.count({ where: { isActive: true } })

    // Get recent activity
    const recentUsers = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      limit: 5,
    })

    const recentVehicles = await Vehicle.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
    })

    const recentAssignments = await Assignment.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    })

    // Get GPS statistics
    const recentGpsLocations = await GpsLocation.count({
      where: {
        gpsTimestamp: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    })

    const dashboardData = {
      stats: {
        totalUsers,
        totalVehicles,
        totalAssignments,
        activeAssignments,
        recentGpsLocations,
      },
      recentActivity: {
        users: recentUsers,
        vehicles: recentVehicles,
        assignments: recentAssignments,
      },
    }

    res.json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    logger.error("Error en getAdminDashboard:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 10, page = 1 } = req.query
    const offset = (page - 1) * limit

    // Get user's assignments activity
    const assignments = await Assignment.findAll({
      where: { userId },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    })

    // Format activity data
    const activity = assignments.map((assignment) => ({
      id: assignment.id,
      type: "assignment",
      description: `Vehículo ${assignment.vehicle.licensePlate} ${assignment.isActive ? "asignado" : "desasignado"}`,
      vehicle: assignment.vehicle,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      isActive: assignment.isActive,
    }))

    res.json({
      success: true,
      data: activity,
    })
  } catch (error) {
    logger.error("Error en getUserActivity:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getSystemStats = async (req, res) => {
  try {
    const stats = {
      users: {
        total: await User.count(),
        active: await User.count({ where: { isActive: true } }),
        byRole: {
          admin: await User.count({ where: { role: "Admin" } }),
          user: await User.count({ where: { role: "User" } }),
          globalAdmin: await User.count({ where: { role: "GlobalAdmin" } }),
        },
      },
      vehicles: {
        total: await Vehicle.count(),
        active: await Vehicle.count({ where: { status: "active" } }),
        assigned: await Assignment.count({ where: { isActive: true } }),
      },
      assignments: {
        total: await Assignment.count(),
        active: await Assignment.count({ where: { isActive: true } }),
        inactive: await Assignment.count({ where: { isActive: false } }),
      },
      gps: {
        totalLocations: await GpsLocation.count(),
        recentLocations: await GpsLocation.count({
          where: {
            gpsTimestamp: {
              [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
      },
    }

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    logger.error("Error en getSystemStats:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

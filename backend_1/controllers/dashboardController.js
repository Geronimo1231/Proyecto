import { User, Vehicle, Assignment, GpsLocation } from "../models/index.js"
import { logger } from "../config/database.js"
import { Op, sequelize } from "sequelize"

export const getDashboardStats = async (req, res) => {
  try {
    const stats = {
      totalVehicles: await Vehicle.count(),
      availableVehicles: await Vehicle.count({ where: { status: "available" } }),
      assignedVehicles: await Vehicle.count({ where: { status: "assigned" } }),
      maintenanceVehicles: await Vehicle.count({ where: { status: "maintenance" } }),
      outOfServiceVehicles: await Vehicle.count({ where: { status: "out_of_service" } }),
      totalUsers: await User.count(),
      adminUsers: await User.count({ where: { role: { [Op.in]: ["GlobalAdmin", "Admin"] } } }),
      regularUsers: await User.count({ where: { role: "User" } }),
      activeAssignments: await Assignment.count({ where: { isActive: true } }),
    }

    // Estadísticas por marca
    const vehiclesByBrand = await Vehicle.findAll({
      attributes: ["brand", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["brand"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      raw: true,
    })

    // Estadísticas por tipo
    const vehiclesByType = await Vehicle.findAll({
      attributes: ["type", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["type"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      raw: true,
    })

    res.json({
      success: true,
      data: {
        ...stats,
        vehiclesByBrand,
        vehiclesByType,
      },
    })
  } catch (error) {
    logger.error("Error en getDashboardStats:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query

    // Obtener asignaciones recientes
    const recentAssignments = await Assignment.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName"],
        },
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["licensePlate", "model", "brand"],
        },
      ],
      limit: Number.parseInt(limit),
      order: [["createdAt", "DESC"]],
    })

    const activities = recentAssignments.map((assignment) => ({
      id: assignment.id,
      type: assignment.isActive ? "assignment" : "unassignment",
      description: assignment.isActive
        ? `Vehículo ${assignment.vehicle.licensePlate} asignado a ${assignment.user.firstName} ${assignment.user.lastName}`
        : `Vehículo ${assignment.vehicle.licensePlate} desasignado de ${assignment.user.firstName} ${assignment.user.lastName}`,
      createdAt: assignment.createdAt,
    }))

    res.json({
      success: true,
      data: activities,
    })
  } catch (error) {
    logger.error("Error en getRecentActivity:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id

    const userAssignments = await Assignment.findAll({
      where: { userId, isActive: true },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          include: [
            {
              model: GpsLocation,
              as: "gpsLocations",
              limit: 1,
              order: [["gpsTimestamp", "DESC"]],
              required: false,
            },
          ],
        },
      ],
    })

    const stats = {
      assignedVehicles: userAssignments.length,
      vehiclesWithGps: userAssignments.filter((assignment) => assignment.vehicle.gpsLocations?.length > 0).length,
      lastUpdate: userAssignments.reduce((latest, assignment) => {
        const vehicleLastUpdate = assignment.vehicle.gpsLocations?.[0]?.gpsTimestamp
        if (vehicleLastUpdate && (!latest || new Date(vehicleLastUpdate) > new Date(latest))) {
          return vehicleLastUpdate
        }
        return latest
      }, null),
    }

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    logger.error("Error en getUserDashboardStats:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 10 } = req.query

    // Obtener actividad del usuario (asignaciones)
    const userAssignments = await Assignment.findAll({
      where: { userId },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["licensePlate", "model", "brand"],
        },
      ],
      limit: Number.parseInt(limit),
      order: [["createdAt", "DESC"]],
    })

    const activities = userAssignments.map((assignment) => ({
      id: assignment.id,
      type: assignment.isActive ? "vehicle_assigned" : "vehicle_unassigned",
      description: assignment.isActive
        ? `Te asignaron el vehículo ${assignment.vehicle.licensePlate}`
        : `Se desasignó el vehículo ${assignment.vehicle.licensePlate}`,
      createdAt: assignment.createdAt,
    }))

    res.json({
      success: true,
      data: activities,
    })
  } catch (error) {
    logger.error("Error en getUserActivity:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getSystemHealth = async (req, res) => {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: "connected",
      services: {
        api: "running",
        websocket: "running",
        gps: "running",
      },
    }

    // Verificar conexión a la base de datos
    try {
      await sequelize.authenticate()
      health.database = "connected"
    } catch (error) {
      health.database = "disconnected"
      health.status = "unhealthy"
    }

    res.json({
      success: true,
      data: health,
    })
  } catch (error) {
    logger.error("Error en getSystemHealth:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

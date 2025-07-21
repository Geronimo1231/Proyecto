import { User, Vehicle, Assignment, GpsLocation } from "../models/index.js"
import pkg from "../config/config.cjs"
const { logger } = pkg

import { Op } from "sequelize"

export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id

    // Obtener estadísticas del usuario
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Assignment,
          as: "assignments",
          where: { isActive: true },
          required: false,
          include: [
            {
              model: Vehicle,
              as: "vehicle",
              attributes: ["id", "licensePlate", "model", "brand", "status"],
            },
          ],
        },
      ],
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Contar estadísticas
    const totalAssignments = await Assignment.count({ where: { userId } })
    const activeAssignments = await Assignment.count({ where: { userId, isActive: true } })
    const assignedVehicles = user.assignments?.length || 0

    // Obtener actividad reciente
    const recentAssignments = await Assignment.findAll({
      where: { userId },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    })

    // Obtener ubicaciones recientes de vehículos asignados
    const vehicleIds = user.assignments?.map((assignment) => assignment.vehicleId) || []
    let recentLocations = []

    if (vehicleIds.length > 0) {
      recentLocations = await GpsLocation.findAll({
        where: {
          vehicleId: { [Op.in]: vehicleIds },
        },
        include: [
          {
            model: Vehicle,
            as: "vehicle",
            attributes: ["id", "licensePlate", "model", "brand"],
          },
        ],
        order: [["gpsTimestamp", "DESC"]],
        limit: 10,
      })
    }

    const dashboardData = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        photo: user.photo,
      },
      stats: {
        assignedVehicles,
        totalAssignments,
        activeAssignments,
      },
      recentActivity: recentAssignments,
      recentLocations,
      assignedVehicles: user.assignments || [],
    }

    res.status(200).json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    logger.error("Error en getUserDashboard:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    logger.error("Error en getUserProfile:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const { firstName, lastName, phone } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    await user.update({
      firstName,
      lastName,
      phone,
    })

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    })


    res.status(200).json({
      success: true,
      message: "Perfil actualizado correctamente",
      data: updatedUser,
    })
  } catch (error) {
    logger.error("Error en updateUserProfile:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

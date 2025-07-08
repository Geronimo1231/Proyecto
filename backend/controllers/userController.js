import { User, Vehicle, Assignment, GpsLocation } from "../models/index.js"
import pkg from "../config/config.cjs"
const { logger } = pkg

import { Op } from "sequelize"

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "" } = req.query
    const offset = (page - 1) * limit

    const whereClause = {}

    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ]
    }

    if (role) {
      whereClause.role = role
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
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
              attributes: ["id", "licensePlate", "model", "brand"],
            },
          ],
        },
      ],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["createdAt", "DESC"]],
    })

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    })
  } catch (error) {
    logger.error("Error en getAllUsers:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Assignment,
          as: "assignments",
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

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    logger.error("Error en getUserById:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un usuario con este email",
      })
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: role || "User",
    })

    const userResponse = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
    })

    logger.info(`Usuario creado: ${user.email}`)

    res.status(201).json({
      success: true,
      message: "Usuario creado correctamente",
      data: userResponse,
    })
  } catch (error) {
    logger.error("Error en createUser:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { firstName, lastName, phone, role } = req.body

    const user = await User.findByPk(id)
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
      role,
    })

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    })

    logger.info(`Usuario actualizado: ${user.email}`)

    res.json({
      success: true,
      message: "Usuario actualizado correctamente",
      data: updatedUser,
    })
  } catch (error) {
    logger.error("Error en updateUser:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Check if user has active assignments
    const activeAssignments = await Assignment.count({
      where: { userId: id, isActive: true },
    })

    if (activeAssignments > 0) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar un usuario con asignaciones activas",
      })
    }

    await user.destroy()

    logger.info(`Usuario eliminado: ${user.email}`)

    res.json({
      success: true,
      message: "Usuario eliminado correctamente",
    })
  } catch (error) {
    logger.error("Error en deleteUser:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id

    // Get user assignments
    const assignments = await Assignment.findAll({
      where: { userId },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand", "status"],
        },
      ],
    })

    const totalAssignments = assignments.length
    const activeAssignments = assignments.filter((a) => a.isActive).length
    const assignedVehicles = activeAssignments

    // Get recent GPS locations for user's vehicles
    const vehicleIds = assignments.filter((a) => a.isActive).map((a) => a.vehicleId)

    let recentLocations = 0
    if (vehicleIds.length > 0) {
      recentLocations = await GpsLocation.count({
        where: {
          vehicleId: { [Op.in]: vehicleIds },
          gpsTimestamp: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      })
    }

    const stats = {
      assignedVehicles,
      totalAssignments,
      activeAssignments,
      recentLocations,
    }

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    logger.error("Error en getUserStats:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getUserVehicles = async (req, res) => {
  try {
    const userId = req.user.id

    const assignments = await Assignment.findAll({
      where: { userId, isActive: true },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand", "status", "year"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    const vehicles = assignments.map((assignment) => ({
      ...assignment.vehicle.toJSON(),
      assignmentId: assignment.id,
      assignedAt: assignment.createdAt,
    }))

    res.json({
      success: true,
      data: vehicles,
    })
  } catch (error) {
    logger.error("Error en getUserVehicles:", error)
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

    // Get recent assignments
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
      limit: Number.parseInt(limit),
    })

    // Format activity data
    const activity = recentAssignments.map((assignment) => ({
      id: assignment.id,
      type: "assignment",
      description: `Vehículo ${assignment.vehicle.licensePlate} ${assignment.isActive ? "asignado" : "desasignado"}`,
      vehicle: assignment.vehicle,
      createdAt: assignment.createdAt,
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

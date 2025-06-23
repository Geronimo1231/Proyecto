import bcrypt from "bcrypt"
import { User, Vehicle, Assignment, GpsLocation } from "../models/index.js"
import { logger } from "../config/database.js"
import { Op } from "sequelize"

export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query

    const whereClause = {}
    if (role) {
      whereClause.role = role
    }
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ]
    }

    const offset = (page - 1) * limit

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
      data: users,
      pagination: {
        total: count,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        totalPages: Math.ceil(count / limit),
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
    const { firstName, lastName, email, phone, password, role = "User" } = req.body

    // Verificar permisos
    if (req.user.role !== "GlobalAdmin" && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para crear usuarios",
      })
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      })
    }

    // Hashear contraseña
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Crear usuario
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role,
    })

    const userData = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
    })

    logger.info(`Usuario ${user.email} creado por ${req.user.email}`)

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: userData,
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
    const { firstName, lastName, email, phone, role } = req.body

    // Verificar permisos
    if (req.user.role !== "GlobalAdmin" && req.user.role !== "Admin" && req.user.id !== Number.parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar este usuario",
      })
    }

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Verificar si el email ya existe (excepto el usuario actual)
    if (email !== user.email) {
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "El email ya está en uso",
        })
      }
    }

    // Solo admins pueden cambiar roles
    const updateData = { firstName, lastName, email, phone }
    if ((req.user.role === "GlobalAdmin" || req.user.role === "Admin") && role) {
      updateData.role = role
    }

    await user.update(updateData)

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    })

    logger.info(`Usuario ${user.email} actualizado por ${req.user.email}`)

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

    // Verificar permisos
    if (req.user.role !== "GlobalAdmin" && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar usuarios",
      })
    }

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // No permitir eliminar al último GlobalAdmin
    if (user.role === "GlobalAdmin") {
      const adminCount = await User.count({ where: { role: "GlobalAdmin" } })
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "No se puede eliminar al último administrador global",
        })
      }
    }

    // Soft delete
    await user.destroy()

    logger.info(`Usuario ${user.email} eliminado por ${req.user.email}`)

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

    const user = await User.findByPk(userId, {
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

    const stats = {
      assignedVehicles: user.assignments?.length || 0,
      totalAssignments: await Assignment.count({ where: { userId } }),
      activeAssignments: await Assignment.count({ where: { userId, isActive: true } }),
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

    const vehicles = assignments.map((assignment) => ({
      ...assignment.vehicle.toJSON(),
      lastLocation: assignment.vehicle.gpsLocations?.[0] || null,
      assignmentDate: assignment.assignmentDate,
      assignmentNotes: assignment.notes,
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

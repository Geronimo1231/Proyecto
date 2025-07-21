import { Assignment, User, Vehicle } from "../models/index.js"
import pkg from "../config/config.cjs"
const { logger } = pkg

import { Op } from "sequelize"

export const getAllAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "" } = req.query
    const offset = (page - 1) * limit

    const whereClause = {}

    if (status && status !== "") {
      whereClause.isActive = status === "active"
    }

    const { count, rows: assignments } = await Assignment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
          where: search
            ? {
                [Op.or]: [
                  { firstName: { [Op.iLike]: `%${search}%` } },
                  { lastName: { [Op.iLike]: `%${search}%` } },
                  { email: { [Op.iLike]: `%${search}%` } },
                ],
              }
            : undefined,
          required: search ? true : false,
        },
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand", "status"],
        },
      ],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["createdAt", "DESC"]],
    })

    res.status(200).json({
      success: true,
      data: {
        assignments,
        pagination: {
          total: count,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    })
  } catch (error) {
    logger.error("Error en getAllAssignments:", error)
    res.status(400).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params

    const assignment = await Assignment.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        },
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand", "year", "status"],
        },
      ],
    })

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: "Asignación no encontrada",
      })
    }

    res.status(200).json({
      success: true,
      data: assignment,
    })
  } catch (error) {
    logger.error("Error en getAssignmentById:", error)
    res.status(400).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

import { sequelize } from "../models/index.js" // asumiendo que exportas sequelize

export const createAssignment = async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const { userId, vehicleId, notes } = req.body

    // Validaciones...
    const user = await User.findByPk(userId, { transaction: t })
    if (!user) throw new Error("Usuario no encontrado")

    const vehicle = await Vehicle.findByPk(vehicleId, { transaction: t })
    if (!vehicle) throw new Error("Vehículo no encontrado")
    if (vehicle.status !== "available") throw new Error("Vehículo no disponible")

    const activeAssignment = await Assignment.findOne({
      where: { userId, isActive: true },
      transaction: t,
    })
    if (activeAssignment) throw new Error("Usuario ya tiene asignación activa")

    const assignment = await Assignment.create({
      userId,
      vehicleId,
      notes,
      assignmentDate: new Date(),
      isActive: true,
    }, { transaction: t })

    await vehicle.update({
      status: "assigned",
      assignedTo: userId,
    }, { transaction: t })

    await t.commit()

    // Buscar con relaciones fuera de la transacción está OK
    const newAssignment = await Assignment.findByPk(assignment.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "firstName", "lastName", "email"] },
        { model: Vehicle, as: "vehicle", attributes: ["id", "licensePlate", "model", "brand"] },
      ],
    })

    logger.info(`Asignación creada: Usuario ${userId} - Vehículo ${vehicleId}`)

    res.status(200).json({
      success: true,
      message: "Asignación creada correctamente",
      data: newAssignment,
    })
  } catch (error) {
    await t.rollback()
    logger.error("Error en createAssignment:", error)
    res.status(400).json({
      success: false,
      message: error.message || "Error interno del servidor",
    })
  }
}

export const getAvailableUsersForAssignment = async (req, res) => {
  try {
    // Obtener IDs de usuarios que tienen asignaciones activas
    const activeAssignments = await Assignment.findAll({
      where: { isActive: true },
      attributes: ['userId'],
      group: ['userId'],
    })

    const activeUserIds = activeAssignments.map(a => a.userId)

    // Traer usuarios activos con rol 'User' que NO estén en activeUserIds
    const users = await User.findAll({
      where: {
        deletedAt: null,
        isActive: true,
        role: 'User',
        id: {
          [Op.notIn]: activeUserIds.length > 0 ? activeUserIds : [0], // Si no hay usuarios activos, evitar error con id NOT IN [0]
        },
      },
      order: [['firstName', 'ASC']],
      attributes: ['id', 'firstName', 'lastName', 'email'],
    })

    res.status(200).json({
      success: true,
      data: users,
    })
  } catch (error) {
    logger.error("Error en getAvailableUsersForAssignment:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}



export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params
    const { notes } = req.body

    const assignment = await Assignment.findByPk(id)
    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: "Asignación no encontrada",
      })
    }

    await assignment.update({ notes })

    const updatedAssignment = await Assignment.findByPk(id, {
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
    })

    logger.info(`Asignación actualizada: ${id}`)

    res.json({
      success: true,
      message: "Asignación actualizada correctamente",
      data: updatedAssignment,
    })
  } catch (error) {
    logger.error("Error en updateAssignment:", error)
    res.status(400).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const deactivateAssignment = async (req, res) => {
  try {
    const { id } = req.params

    const assignment = await Assignment.findByPk(id, {
      include: [
        {
          model: Vehicle,
          as: "vehicle",
        },
      ],
    })

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: "Asignación no encontrada",
      })
    }

    if (!assignment.isActive) {
      return res.status(400).json({
        success: false,
        message: "La asignación ya está inactiva",
      })
    }

    // Desactivar la asignación
    await assignment.update({
      isActive: false,
      unassignmentDate: new Date(),
    })

    // Actualizar el estado del vehículo
    await assignment.vehicle.update({
      status: "available",
      assignedTo: null,
    })

    logger.info(`Asignación desactivada: ${id}`)

    res.json({
      success: true,
      message: "Asignación desactivada correctamente",
    })
  } catch (error) {
    logger.error("Error en deactivateAssignment:", error)
    res.status(400).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params

    const assignment = await Assignment.findByPk(id, {
      include: [
        {
          model: Vehicle,
          as: "vehicle",
        },
      ],
    })

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: "Asignación no encontrada",
      })
    }

    // Si la asignación está activa, liberar el vehículo
    if (assignment.isActive) {
      await assignment.vehicle.update({
        status: "available",
        assignedTo: null,
      })
    }

    await assignment.destroy()

    logger.info(`Asignación eliminada: ${id}`)

    res.json({
      success: true,
      message: "Asignación eliminada correctamente",
    })
  } catch (error) {
    logger.error("Error en deleteAssignment:", error)
    res.status(400).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const getUserAssignments = async (req, res) => {
  try {
    const { userId } = req.params
    const { active = "" } = req.query

    const whereClause = { userId }
    if (active !== "") {
      whereClause.isActive = active === "true"
    }

    const assignments = await Assignment.findAll({
      where: whereClause,
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand", "status"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    res.json({
      success: true,
      data: assignments,
    })
  } catch (error) {
    logger.error("Error en getUserAssignments:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const getVehicleAssignments = async (req, res) => {
  try {
    const { vehicleId } = req.params

    const assignments = await Assignment.findAll({
      where: { vehicleId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    res.json({
      success: true,
      data: assignments,
    })
  } catch (error) {
    logger.error("Error en getVehicleAssignments:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

import { Assignment, User, Vehicle } from "../models/index.js"
import { logger } from "../config/database.js"

export const getAllAssignments = async (req, res) => {
  try {
    const { userId, vehicleId, isActive, page = 1, limit = 10 } = req.query

    const whereClause = {}
    if (userId) whereClause.userId = userId
    if (vehicleId) whereClause.vehicleId = vehicleId
    if (isActive !== undefined) whereClause.isActive = isActive === "true"

    const offset = (page - 1) * limit

    const { count, rows: assignments } = await Assignment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
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

    res.json({
      success: true,
      data: assignments,
      pagination: {
        total: count,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    logger.error("Error en getAllAssignments:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const createAssignment = async (req, res) => {
  try {
    const { userId, vehicleId, notes } = req.body

    // Verificar permisos
    if (req.user.role !== "GlobalAdmin" && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para crear asignaciones",
      })
    }

    // Verificar que el usuario existe
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Verificar que el vehículo existe y está disponible
    const vehicle = await Vehicle.findByPk(vehicleId)
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado",
      })
    }

    if (vehicle.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "El vehículo no está disponible para asignación",
      })
    }

    // Verificar que no hay una asignación activa para este vehículo
    const existingAssignment = await Assignment.findOne({
      where: { vehicleId, isActive: true },
    })

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "El vehículo ya está asignado",
      })
    }

    // Crear la asignación
    const assignment = await Assignment.create({
      userId,
      vehicleId,
      notes,
      isActive: true,
    })

    // Actualizar el estado del vehículo
    await vehicle.update({
      status: "assigned",
      assignedTo: userId,
    })

    // Obtener la asignación completa
    const fullAssignment = await Assignment.findByPk(assignment.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand", "status"],
        },
      ],
    })

    logger.info(`Vehículo ${vehicle.licensePlate} asignado a ${user.firstName} ${user.lastName} por ${req.user.email}`)

    res.status(201).json({
      success: true,
      message: "Asignación creada exitosamente",
      data: fullAssignment,
    })
  } catch (error) {
    logger.error("Error en createAssignment:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const unassignVehicle = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar permisos
    if (req.user.role !== "GlobalAdmin" && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para desasignar vehículos",
      })
    }

    const assignment = await Assignment.findByPk(id, {
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

    if (!assignment) {
      return res.status(404).json({
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
    await Vehicle.update(
      {
        status: "available",
        assignedTo: null,
      },
      { where: { id: assignment.vehicleId } },
    )

    logger.info(
      `Vehículo ${assignment.vehicle.licensePlate} desasignado de ${assignment.user.firstName} ${assignment.user.lastName} por ${req.user.email}`,
    )

    res.json({
      success: true,
      message: "Vehículo desasignado exitosamente",
    })
  } catch (error) {
    logger.error("Error en unassignVehicle:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getUserAssignments = async (req, res) => {
  try {
    const userId = req.user.id

    const assignments = await Assignment.findAll({
      where: { userId },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand", "status", "image"],
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
          attributes: ["id", "licensePlate", "model", "brand", "year", "color", "status"],
        },
      ],
    })

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Asignación no encontrada",
      })
    }

    res.json({
      success: true,
      data: assignment,
    })
  } catch (error) {
    logger.error("Error en getAssignmentById:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

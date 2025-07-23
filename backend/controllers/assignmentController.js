import { Assignment, User, Vehicle, sequelize } from "../models/index.js";
import pkg from "../config/config.cjs";
const { logger } = pkg;

import { Op } from "sequelize";

// Obtener todas las asignaciones con paginación y búsqueda
export const getAllAssignments = async (req, res) => {
  try {
    const { page = "1", limit = "10", search = "", status = "" } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const whereClause = {};
    if (status === "true" || status === "false") {
      whereClause.isActive = status === "true";
    }


    console.log("Filtros usados:", { pageNum, limitNum, search, status, whereClause });

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
          required: false, // Cambiado a false
        },
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand", "status"],
        },
      ],
      limit: limitNum,
      offset,
      order: [["createdAt", "DESC"]],
    });

    console.log(`Total asignaciones encontradas: ${count}`);

    res.status(200).json({
      success: true,
      data: {
        assignments,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Error en getAllAssignments:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};


// Obtener una asignación por ID
export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

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
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Asignación no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Crear una nueva asignación
export const createAssignment = async (req, res) => {
  let t;
  try {
    t = await sequelize.transaction();

    const { userId, vehicleId, notes } = req.body;

    // Validar parámetros básicos
    if (!userId || !vehicleId) {
      throw new Error("Faltan datos obligatorios: userId y vehicleId");
    }

    // Validar usuario
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) throw new Error("Usuario no encontrado");

    // Validar vehículo y estado
    const vehicle = await Vehicle.findByPk(vehicleId, { transaction: t });
    if (!vehicle) throw new Error("Vehículo no encontrado");
    if ((vehicle.status || "").toLowerCase() !== "available") throw new Error("Vehículo no disponible");

    // Validar que usuario no tenga asignación activa
    const activeAssignment = await Assignment.findOne({
      where: { userId, isActive: true },
      transaction: t,
    });
    if (activeAssignment) throw new Error("Usuario ya tiene asignación activa");

    // Crear asignación
    const assignment = await Assignment.create(
      {
        userId,
        vehicleId,
        notes,
        assignmentDate: new Date(),
        isActive: true,
      },
      { transaction: t }
    );

    // Actualizar estado del vehículo
    await vehicle.update(
      {
        status: "assigned",
        assignedTo: userId,
      },
      { transaction: t }
    );

    await t.commit();

    // Obtener asignación completa con relaciones (fuera de transacción)
    const newAssignment = await Assignment.findByPk(assignment.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "firstName", "lastName", "email"] },
        { model: Vehicle, as: "vehicle", attributes: ["id", "licensePlate", "model", "brand"] },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Asignación creada correctamente",
      data: newAssignment,
    });
  } catch (error) {
    if (t) {
      try {
        await t.rollback();
      } catch (rollbackError) {
        logger.error("Error al hacer rollback:", rollbackError);
      }
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor",
      error: error.stack || String(error),
    });
  }
};



// Obtener usuarios disponibles
export const getAvailableUsersForAssignment = async (req, res) => {
  try {
    const activeAssignments = await Assignment.findAll({
      where: { isActive: true },
      attributes: ["userId"],
      group: ["userId"],
    });

    const activeUserIds = activeAssignments.map(a => a.userId);

    const users = await User.findAll({
      where: {
        deletedAt: null,
        isActive: true,
        role: "User",
        id: {
          [Op.notIn]: activeUserIds.length > 0 ? activeUserIds : [0],
        },
      },
      order: [["firstName", "ASC"]],
      attributes: ["id", "firstName", "lastName", "email"],
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Actualizar una asignación (notas)
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const assignment = await Assignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Asignación no encontrada",
      });
    }

    await assignment.update({ notes });

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
    });

    res.status(200).json({
      success: true,
      message: "Asignación actualizada correctamente",
      data: updatedAssignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Desactivar una asignación activa
export const deactivateAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByPk(id, {
      include: [{ model: Vehicle, as: "vehicle" }],
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Asignación no encontrada",
      });
    }

    if (!assignment.isActive) {
      return res.status(400).json({
        success: false,
        message: "La asignación ya está inactiva",
      });
    }

    // Actualiza asignación
    await assignment.update({ isActive: false, unassignmentDate: new Date() });

    // Actualiza vehículo solo si existe
    if (assignment.vehicle) {
      await assignment.vehicle.update({ status: "available", assignedTo: null });
    } else {
      console.warn(`Asignación ${id} no tiene vehículo asignado.`);
    }

    return res.status(200).json({
      success: true,
      message: "Asignación desactivada correctamente",
    });
  } catch (error) {
    console.error("Error en deactivateAssignment:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

export const activateAssignment = async (req, res) => {
  try {
    const { id } = req.params

    const assignment = await Assignment.findByPk(id, {
      include: [{ model: Vehicle, as: "vehicle" }],
    })

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Asignación no encontrada",
      })
    }

    if (assignment.isActive) {
      return res.status(400).json({
        success: false,
        message: "La asignación ya está activa",
      })
    }

    await assignment.update({
      isActive: true,
      assignmentDate: new Date(),
      unassignmentDate: null,
    })

    await assignment.vehicle.update({
      status: "assigned",
      assignedTo: assignment.userId,
    })

    res.status(200).json({
      success: true,
      message: "Asignación activada correctamente",
    })
  } catch (error) {
    console.error("Error activating assignment:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}


// Eliminar una asignación
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByPk(id, {
      include: [{ model: Vehicle, as: "vehicle" }],
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Asignación no encontrada",
      });
    }

    if (assignment.isActive) {
      await assignment.vehicle.update({ status: "available", assignedTo: null });
    }

    await assignment.destroy();

    res.status(200).json({
      success: true,
      message: "Asignación eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Obtener asignaciones por usuario
export const getUserAssignments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { active = "" } = req.query;

    const whereClause = { userId };
    if (active !== "") whereClause.isActive = active === "true";

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
    });

    res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Obtener asignaciones por vehículo
export const getVehicleAssignments = async (req, res) => {
  try {
    const { vehicleId } = req.params;

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
    });

    res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

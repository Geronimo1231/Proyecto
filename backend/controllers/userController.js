import { User, Assignment, Vehicle } from "../models/index.js"
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

    if (role && role !== "") {
      whereClause.role = role
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
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
      attributes: { exclude: ["password"] },
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
      error: error.message,
    })
  }
}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id, {
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
          order: [["createdAt", "DESC"]],
          limit: 5,
        },
      ],
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
    logger.error("Error en getUserById:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, photo } = req.body

    // Verificar que el email no esté en uso
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      })
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: role || "User",
      photo: photo || "/placeholder.svg?height=100&width=100",
      isActive: true,
    })

    // Remover password de la respuesta
    const userResponse = user.toJSON()
    delete userResponse.password

    res.status(200).json({
      success: true,
      message: "Usuario creado correctamente",
      data: userResponse,
    })
  } catch (error) {
    logger.error("Error en createUser:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { firstName, lastName, email, phone, role, photo, isActive, password } = req.body

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Verificar que el email no esté en uso por otro usuario
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email, id: { [Op.ne]: id } },
      })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "El email ya está registrado",
        })
      }
    }

    const updateData = {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
      phone: phone || user.phone,
      role: role || user.role,
      photo: photo || user.photo,
      isActive: isActive !== undefined ? isActive : user.isActive,
    }

    // Solo actualizar password si se proporciona
    if (password) {
      updateData.password = password
    }

    await user.update(updateData)

    // Remover password de la respuesta
    const userResponse = user.toJSON()
    delete userResponse.password

    logger.info(`Usuario actualizado: ${user.email}`)

    res.json({
      success: true,
      message: "Usuario actualizado correctamente",
      data: userResponse,
    })
  } catch (error) {
    logger.error("Error en updateUser:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
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

    // Verificar que no tenga asignaciones activas
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
      error: error.message,
    })
  }
}

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    await user.update({
      isActive: !user.isActive,
    })

  
   res.status(200).json({
      success: true,
      message: `Usuario ${user.isActive ? "activado" : "desactivado"} correctamente`,
      data: {
        id: user.id,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    logger.error("Error en toggleUserStatus:", error)
    res.status(400).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params

    const users = await User.findAll({
      where: { role, isActive: true },
      attributes: ["id", "firstName", "lastName", "email"],
      order: [["firstName", "ASC"]],
    })

    res.json({
      success: true,
      data: users,
    })
  } catch (error) {
    logger.error("Error en getUsersByRole:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const updateUserPhoto = async (req, res) => {
  try {
    const { id } = req.params
    const { photo } = req.body

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    await user.update({ photo })

    logger.info(`Foto de usuario actualizada: ${user.email}`)

    res.json({
      success: true,
      message: "Foto actualizada correctamente",
      data: {
        id: user.id,
        photo: user.photo,
      },
    })
  } catch (error) {
    logger.error("Error en updateUserPhoto:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { id } = req.params
    const { currentPassword, newPassword } = req.body

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Verificar password actual
    const isValidPassword = await user.comparePassword(currentPassword)
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Password actual incorrecto",
      })
    }

    await user.update({ password: newPassword })

    logger.info(`Password cambiado para usuario: ${user.email}`)

    res.json({
      success: true,
      message: "Password actualizado correctamente",
    })
  } catch (error) {
    logger.error("Error en changePassword:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count()
    const activeUsers = await User.count({ where: { isActive: true } })
    const adminUsers = await User.count({ where: { role: "Admin" } })
    const regularUsers = await User.count({ where: { role: "User" } })
    const usersWithAssignments = await User.count({
      include: [
        {
          model: Assignment,
          as: "assignments",
          where: { isActive: true },
          required: true,
        },
      ],
    })

    const stats = {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      admins: adminUsers,
      users: regularUsers,
      withAssignments: usersWithAssignments,
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
      error: error.message,
    })
  }
}

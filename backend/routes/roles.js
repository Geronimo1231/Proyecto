import express from "express"
import { Rol } from "../models/index.js"
import { authenticateToken, requireRole } from "../middleware/auth.js"

const router = express.Router()
router.use(authenticateToken)

// Obtener todos los roles
router.get("/", async (req, res) => {
  try {
    const roles = [
      { id: 1, nombre: "admin" },
      { id: 2, nombre: "usuario" },
    ]

    res.json({
      success: true,
      data: roles,
    })
  } catch (error) {
    console.error("Error en roles:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Crear nuevo rol (solo Admin)
router.post("/", requireRole(["Admin"]), async (req, res) => {
  try {
    const { name, Description } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "El nombre del rol es requerido",
      })
    }

    const existingRole = await Rol.findOne({ where: { name } })
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: "El rol ya existe",
      })
    }

    const role = await Rol.create({ name, Description })

    res.status(201).json({
      success: true,
      message: "Rol creado exitosamente",
      data: role,
    })
  } catch (error) {
    console.error("Error al crear rol:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Actualizar rol (solo Admin)
router.put("/:id", requireRole(["Admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const { name, Description } = req.body

    const role = await Rol.findByPk(id)
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Rol no encontrado",
      })
    }

    await role.update({ name, Description })

    res.json({
      success: true,
      message: "Rol actualizado exitosamente",
      data: role,
    })
  } catch (error) {
    console.error("Error al actualizar rol:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Eliminar rol (solo Admin)
router.delete("/:id", requireRole(["Admin"]), async (req, res) => {
  try {
    const { id } = req.params

    const role = await Rol.findByPk(id)
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Rol no encontrado",
      })
    }

    await role.destroy()

    res.json({
      success: true,
      message: "Rol eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar rol:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

export default router

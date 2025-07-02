import express from "express"
import { VehicleType } from "../models/index.js"
import { authenticateToken, requireRole } from "../middleware/auth.js"

const router = express.Router()
router.use(authenticateToken)

// Obtener todos los tipos de vehículos
router.get("/", async (req, res) => {
  try {
    const vehicleTypes = await VehicleType.findAll({
      order: [["name", "ASC"]],
    })

    res.json({
      success: true,
      data: vehicleTypes,
    })
  } catch (error) {
    console.error("Error al obtener tipos de vehículos:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Crear nuevo tipo de vehículo (solo admins)
router.post("/", requireRole(["GlobalAdmin", "Admin"]), async (req, res) => {
  try {
    const { name, description } = req.body

    const vehicleType = await VehicleType.create({
      name,
      description,
    })

    res.status(201).json({
      success: true,
      message: "Tipo de vehículo creado exitosamente",
      data: vehicleType,
    })
  } catch (error) {
    console.error("Error al crear tipo de vehículo:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Actualizar tipo de vehículo (solo admins)
router.put("/:id", requireRole(["GlobalAdmin", "Admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body

    const vehicleType = await VehicleType.findByPk(id)
    if (!vehicleType) {
      return res.status(404).json({
        success: false,
        message: "Tipo de vehículo no encontrado",
      })
    }

    await vehicleType.update({ name, description })

    res.json({
      success: true,
      message: "Tipo de vehículo actualizado exitosamente",
      data: vehicleType,
    })
  } catch (error) {
    console.error("Error al actualizar tipo de vehículo:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Eliminar tipo de vehículo (solo admins)
router.delete("/:id", requireRole(["GlobalAdmin", "Admin"]), async (req, res) => {
  try {
    const { id } = req.params

    const vehicleType = await VehicleType.findByPk(id)
    if (!vehicleType) {
      return res.status(404).json({
        success: false,
        message: "Tipo de vehículo no encontrado",
      })
    }

    await vehicleType.destroy()

    res.json({
      success: true,
      message: "Tipo de vehículo eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar tipo de vehículo:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

export default router

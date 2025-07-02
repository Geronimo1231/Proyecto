import express from "express"
import { Marca } from "../models/index.js"
import { authenticateToken, requireRole } from "../middleware/auth.js"

const router = express.Router()
router.use(authenticateToken)

// Obtener todas las marcas
router.get("/", async (req, res) => {
  try {
    const brands = [
      { id: 1, nombre: "Toyota" },
      { id: 2, nombre: "Honda" },
      { id: 3, nombre: "Ford" },
      { id: 4, nombre: "Chevrolet" },
      { id: 5, nombre: "Nissan" },
      { id: 6, nombre: "Volkswagen" },
      { id: 7, nombre: "Hyundai" },
      { id: 8, nombre: "Kia" },
    ]

    res.json({
      success: true,
      data: brands,
    })
  } catch (error) {
    console.error("Error en brands:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Crear nueva marca (solo admins)
router.post("/", requireRole(["Admin"]), async (req, res) => {
  try {
    const { nombre } = req.body

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre de la marca es requerido",
      })
    }

    const existingBrand = await Marca.findOne({ where: { nombre } })
    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: "La marca ya existe",
      })
    }

    const brand = await Marca.create({ nombre })

    res.status(201).json({
      success: true,
      message: "Marca creada exitosamente",
      data: brand,
    })
  } catch (error) {
    console.error("Error al crear marca:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Actualizar marca (solo admins)
router.put("/:id", requireRole(["Admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const { nombre } = req.body

    const brand = await Marca.findByPk(id)
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Marca no encontrada",
      })
    }

    await brand.update({ nombre })

    res.json({
      success: true,
      message: "Marca actualizada exitosamente",
      data: brand,
    })
  } catch (error) {
    console.error("Error al actualizar marca:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Eliminar marca (solo admins)
router.delete("/:id", requireRole(["Admin"]), async (req, res) => {
  try {
    const { id } = req.params

    const brand = await Marca.findByPk(id)
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Marca no encontrada",
      })
    }

    await brand.destroy()

    res.json({
      success: true,
      message: "Marca eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar marca:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

export default router

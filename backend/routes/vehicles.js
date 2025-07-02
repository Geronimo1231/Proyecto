import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth.js"

const router = express.Router()
router.use(authenticateToken)

// Obtener todos los vehículos
router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    // Simulación de datos para que funcione
    const vehicles = [
      {
        id: 1,
        licensePlate: "ABC-123",
        brand: "Toyota",
        model: "Corolla",
        year: 2020,
        color: "Blanco",
        status: "available",
        mileage: 50000,
      },
      {
        id: 2,
        licensePlate: "XYZ-789",
        brand: "Honda",
        model: "Civic",
        year: 2021,
        color: "Negro",
        status: "assigned",
        mileage: 30000,
      },
    ]

    let filteredVehicles = vehicles
    if (status) {
      filteredVehicles = vehicles.filter((v) => v.status === status)
    }

    res.json({
      success: true,
      vehicles: filteredVehicles,
      data: filteredVehicles,
      pagination: {
        total: filteredVehicles.length,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        totalPages: Math.ceil(filteredVehicles.length / limit),
      },
    })
  } catch (error) {
    console.error("Error en vehicles:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Crear vehículo
router.post("/", requireRole, async (req, res) => {
  try {
    const vehicleData = req.body

    // Simulación de creación
    const newVehicle = {
      id: Date.now(),
      ...vehicleData,
      status: "available",
      createdAt: new Date(),
    }

    res.status(201).json({
      success: true,
      message: "Vehículo creado exitosamente",
      data: newVehicle,
    })
  } catch (error) {
    console.error("Error al crear vehículo:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Actualizar vehículo
router.put("/:id", requireRole, async (req, res) => {
  try {
    const { id } = req.params
    const vehicleData = req.body

    res.json({
      success: true,
      message: "Vehículo actualizado correctamente",
      data: { id, ...vehicleData },
    })
  } catch (error) {
    console.error("Error al actualizar vehículo:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Eliminar vehículo
router.delete("/:id", requireRole, async (req, res) => {
  try {
    const { id } = req.params

    res.json({
      success: true,
      message: "Vehículo eliminado correctamente",
    })
  } catch (error) {
    console.error("Error al eliminar vehículo:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

export default router

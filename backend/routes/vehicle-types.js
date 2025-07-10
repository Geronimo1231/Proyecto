import express from "express"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// Obtener todos los tipos de vehículos
router.get("/", async (req, res) => {
  try {
    const vehicleTypes = [
      { id: 1, name: "Sedán", description: "Vehículo de pasajeros de 4 puertas" },
      { id: 2, name: "SUV", description: "Vehículo utilitario deportivo" },
      { id: 3, name: "Hatchback", description: "Vehículo compacto de 3 o 5 puertas" },
      { id: 4, name: "Pickup", description: "Camioneta con caja de carga" },
      { id: 5, name: "Van", description: "Vehículo de carga o pasajeros" },
      { id: 6, name: "Motocicleta", description: "Vehículo de dos ruedas" },
      { id: 7, name: "Camión", description: "Vehículo de carga pesada" },
    ]

    res.json({
      success: true,
      data: vehicleTypes,
    })
  } catch (error) {
    console.error("Error en vehicle-types:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

export default router

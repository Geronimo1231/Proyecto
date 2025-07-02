import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth.js"

const router = express.Router()
router.use(authenticateToken)

// Obtener todas las asignaciones
router.get("/", requireRole, async (req, res) => {
  try {
    const assignments = [
      {
        id: 1,
        usuario_id: 1,
        vehiculo_id: 1,
        activa: true,
        fecha_assignment: new Date(),
        observaciones: "Asignación inicial",
        usuario: {
          nombre: "Juan",
          apellido: "Pérez",
          email: "juan@example.com",
        },
        vehiculo: {
          matricula: "ABC-123",
          modelo: "Corolla",
          marca: { nombre: "Toyota" },
        },
      },
    ]

    res.json({
      success: true,
      data: assignments,
    })
  } catch (error) {
    console.error("Error en assignments:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Crear asignación
router.post("/", requireRole, async (req, res) => {
  try {
    const assignmentData = req.body

    const newAssignment = {
      id: Date.now(),
      ...assignmentData,
      activa: true,
      fecha_assignment: new Date(),
    }

    res.status(201).json({
      success: true,
      message: "Asignación creada exitosamente",
      data: newAssignment,
    })
  } catch (error) {
    console.error("Error al crear asignación:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Desasignar vehículo
router.patch("/:id/unassign", requireRole, async (req, res) => {
  try {
    const { id } = req.params

    res.json({
      success: true,
      message: "Vehículo desasignado correctamente",
    })
  } catch (error) {
    console.error("Error al desasignar:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

export default router

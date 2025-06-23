import { Vehicle, User } from "../models/index.js"

export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      include: [
        {
          model: User,
          as: "assignedUser",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    })

    res.json({
      success: true,
      vehicles,
    })
  } catch (error) {
    console.error("Error al obtener vehículos:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params
    const vehicle = await Vehicle.findByPk(id, {
      include: [
        {
          model: User,
          as: "assignedUser",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    })

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado",
      })
    }

    res.json({
      success: true,
      vehicle,
    })
  } catch (error) {
    console.error("Error al obtener vehículo:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const createVehicle = async (req, res) => {
  try {
    const vehicleData = req.body
    const vehicle = await Vehicle.create(vehicleData)

    res.status(201).json({
      success: true,
      message: "Vehículo creado exitosamente",
      vehicle,
    })
  } catch (error) {
    console.error("Error al crear vehículo:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params
    const vehicleData = req.body

    const vehicle = await Vehicle.findByPk(id)
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado",
      })
    }

    await vehicle.update(vehicleData)

    res.json({
      success: true,
      message: "Vehículo actualizado exitosamente",
      vehicle,
    })
  } catch (error) {
    console.error("Error al actualizar vehículo:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params

    const vehicle = await Vehicle.findByPk(id)
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado",
      })
    }

    await vehicle.destroy()

    res.json({
      success: true,
      message: "Vehículo eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar vehículo:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

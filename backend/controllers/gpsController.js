import { GpsLocation, Vehicle, Assignment } from "../models/index.js"
import pkg from "../config/config.cjs"
const { logger } = pkg

import { Op } from "sequelize"

export const createGpsLocation = async (req, res) => {
  try {
    const { vehicleId, latitude, longitude, speed, heading, altitude, accuracy } = req.body

    // Verify vehicle exists
    const vehicle = await Vehicle.findByPk(vehicleId)
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado",
      })
    }

    const gpsLocation = await GpsLocation.create({
      vehicleId,
      latitude,
      longitude,
      speed: speed || 0,
      heading: heading || 0,
      altitude: altitude || 0,
      accuracy: accuracy || 0,
      gpsTimestamp: new Date(),
    })

    logger.info(`Nueva ubicación GPS creada para vehículo ${vehicleId}`)

    res.status(201).json({
      success: true,
      message: "Ubicación GPS registrada correctamente",
      data: gpsLocation,
    })
  } catch (error) {
    logger.error("Error en createGpsLocation:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getVehicleLocations = async (req, res) => {
  try {
    const { vehicleId } = req.params
    const { limit = 100, startDate, endDate } = req.query

    const whereClause = { vehicleId }

    if (startDate && endDate) {
      whereClause.gpsTimestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    } else if (startDate) {
      whereClause.gpsTimestamp = {
        [Op.gte]: new Date(startDate),
      }
    } else if (endDate) {
      whereClause.gpsTimestamp = {
        [Op.lte]: new Date(endDate),
      }
    }

    const locations = await GpsLocation.findAll({
      where: whereClause,
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand"],
        },
      ],
      order: [["gpsTimestamp", "DESC"]],
      limit: Number.parseInt(limit),
    })

    res.json({
      success: true,
      data: locations,
    })
  } catch (error) {
    logger.error("Error en getVehicleLocations:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getLatestVehicleLocation = async (req, res) => {
  try {
    const { vehicleId } = req.params

    const location = await GpsLocation.findOne({
      where: { vehicleId },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand"],
        },
      ],
      order: [["gpsTimestamp", "DESC"]],
    })

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron ubicaciones para este vehículo",
      })
    }

    res.json({
      success: true,
      data: location,
    })
  } catch (error) {
    logger.error("Error en getLatestVehicleLocation:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getAllVehicleLocations = async (req, res) => {
  try {
    const { limit = 1000, latest = false } = req.query

    let locations

    if (latest === "true") {
      // Get latest location for each vehicle
      const vehicles = await Vehicle.findAll({
        attributes: ["id"],
      })

      const locationPromises = vehicles.map((vehicle) =>
        GpsLocation.findOne({
          where: { vehicleId: vehicle.id },
          include: [
            {
              model: Vehicle,
              as: "vehicle",
              attributes: ["id", "licensePlate", "model", "brand", "status"],
            },
          ],
          order: [["gpsTimestamp", "DESC"]],
        }),
      )

      const allLocations = await Promise.all(locationPromises)
      locations = allLocations.filter((location) => location !== null)
    } else {
      locations = await GpsLocation.findAll({
        include: [
          {
            model: Vehicle,
            as: "vehicle",
            attributes: ["id", "licensePlate", "model", "brand", "status"],
          },
        ],
        order: [["gpsTimestamp", "DESC"]],
        limit: Number.parseInt(limit),
      })
    }

    res.json({
      success: true,
      data: locations,
    })
  } catch (error) {
    logger.error("Error en getAllVehicleLocations:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getUserVehicleLocations = async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 100, latest = false } = req.query

    // Get user's assigned vehicles
    const assignments = await Assignment.findAll({
      where: { userId, isActive: true },
      attributes: ["vehicleId"],
    })

    const vehicleIds = assignments.map((assignment) => assignment.vehicleId)

    if (vehicleIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: "No tienes vehículos asignados",
      })
    }

    let locations

    if (latest === "true") {
      // Get latest location for each assigned vehicle
      const locationPromises = vehicleIds.map((vehicleId) =>
        GpsLocation.findOne({
          where: { vehicleId },
          include: [
            {
              model: Vehicle,
              as: "vehicle",
              attributes: ["id", "licensePlate", "model", "brand", "status"],
            },
          ],
          order: [["gpsTimestamp", "DESC"]],
        }),
      )

      const allLocations = await Promise.all(locationPromises)
      locations = allLocations.filter((location) => location !== null)
    } else {
      locations = await GpsLocation.findAll({
        where: {
          vehicleId: { [Op.in]: vehicleIds },
        },
        include: [
          {
            model: Vehicle,
            as: "vehicle",
            attributes: ["id", "licensePlate", "model", "brand", "status"],
          },
        ],
        order: [["gpsTimestamp", "DESC"]],
        limit: Number.parseInt(limit),
      })
    }

    res.json({
      success: true,
      data: locations,
    })
  } catch (error) {
    logger.error("Error en getUserVehicleLocations:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const deleteOldLocations = async (req, res) => {
  try {
    const { days = 30 } = req.query
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const deletedCount = await GpsLocation.destroy({
      where: {
        gpsTimestamp: {
          [Op.lt]: cutoffDate,
        },
      },
    })

    logger.info(`Eliminadas ${deletedCount} ubicaciones GPS antiguas`)

    res.json({
      success: true,
      message: `Se eliminaron ${deletedCount} ubicaciones GPS anteriores a ${days} días`,
      deletedCount,
    })
  } catch (error) {
    logger.error("Error en deleteOldLocations:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const bulkCreateGpsLocations = async (req, res) => {
  try {
    const { locations } = req.body

    // Validación básica del array recibido
    if (!Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Debes enviar un array de ubicaciones GPS válidas.",
      })
    }

    // Extrae los IDs únicos de vehículos del array
    const vehicleIds = [...new Set(locations.map(loc => loc.vehicleId))]

    // Verifica que los vehículos existen
    const existingVehicles = await Vehicle.findAll({
      where: { id: { [Op.in]: vehicleIds } },
      attributes: ["id"],
    })

    const existingVehicleIds = new Set(existingVehicles.map(v => v.id))

    // Filtra solo ubicaciones con vehicleId válido
    const validLocations = locations.filter(loc => existingVehicleIds.has(loc.vehicleId))

    if (validLocations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Ninguna ubicación tiene un vehicleId válido.",
      })
    }

    // Inserta las ubicaciones en la base de datos
    const created = await GpsLocation.bulkCreate(validLocations.map(loc => ({
      vehicleId: loc.vehicleId,
      latitude: loc.latitude,
      longitude: loc.longitude,
      speed: loc.speed || 0,
      heading: loc.heading || 0,
      altitude: loc.altitude || 0,
      accuracy: loc.accuracy || 0,
      gpsTimestamp: loc.gpsTimestamp ? new Date(loc.gpsTimestamp) : new Date(),
    })))

    logger.info(`Se crearon ${created.length} ubicaciones GPS en bulk`)

    res.status(201).json({
      success: true,
      message: `Se crearon ${created.length} ubicaciones GPS correctamente.`,
      data: created,
    })
  } catch (error) {
    logger.error("Error en bulkCreateGpsLocations:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

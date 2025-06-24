import { GpsLocation, Vehicle, User, Assignment } from "../models/index.js"
import { logger } from "../config/database.js"
import { Op } from "sequelize"
import { emitGpsUpdate, emitBulkGpsUpdate } from "../server.js"

export const getAllGpsLocations = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, page = 1, limit = 100 } = req.query

    const whereClause = {}
    if (vehicleId) whereClause.vehicleId = vehicleId
    if (startDate && endDate) {
      whereClause.gpsTimestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    }

    const offset = (page - 1) * limit

    const { count, rows: locations } = await GpsLocation.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand"],
          include: [
            {
              model: Assignment,
              as: "assignments",
              where: { isActive: true },
              required: false,
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["id", "firstName", "lastName"],
                },
              ],
            },
          ],
        },
      ],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["gpsTimestamp", "DESC"]],
    })

    res.json({
      success: true,
      data: locations,
      pagination: {
        total: count,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    logger.error("Error en getAllGpsLocations:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getLatestLocations = async (req, res) => {
  try {
    // Obtener la última ubicación de cada vehículo
    const locations = await GpsLocation.findAll({
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand", "status"],
          include: [
            {
              model: Assignment,
              as: "assignments",
              where: { isActive: true },
              required: false,
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["id", "firstName", "lastName"],
                },
              ],
            },
          ],
        },
      ],
      order: [["vehicleId"], ["gpsTimestamp", "DESC"]],
    })

    // Filtrar para obtener solo la última ubicación por vehículo
    const latestByVehicle = new Map()
    locations.forEach((location) => {
      if (!latestByVehicle.has(location.vehicleId)) {
        latestByVehicle.set(location.vehicleId, location)
      }
    })

    const latestLocations = Array.from(latestByVehicle.values())

    res.json({
      success: true,
      data: latestLocations,
    })
  } catch (error) {
    logger.error("Error en getLatestLocations:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const createGpsLocation = async (req, res) => {
  try {
    const { vehicleId, latitude, longitude, speed = 0, direction = 0, gpsTimestamp } = req.body

    // Verificar que el vehículo existe
    const vehicle = await Vehicle.findByPk(vehicleId)
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado",
      })
    }

    // Crear la ubicación GPS
    const location = await GpsLocation.create({
      vehicleId,
      latitude,
      longitude,
      speed,
      direction,
      gpsTimestamp: gpsTimestamp || new Date(),
    })

    // Obtener la ubicación completa con información del vehículo
    const fullLocation = await GpsLocation.findByPk(location.id, {
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand"],
          include: [
            {
              model: Assignment,
              as: "assignments",
              where: { isActive: true },
              required: false,
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["id", "firstName", "lastName"],
                },
              ],
            },
          ],
        },
      ],
    })

    // Emitir actualización en tiempo real
    emitGpsUpdate(vehicleId, fullLocation)

    logger.info(`Nueva ubicación GPS registrada para vehículo ${vehicle.licensePlate}`)

    res.status(201).json({
      success: true,
      message: "Ubicación GPS registrada exitosamente",
      data: fullLocation,
    })
  } catch (error) {
    logger.error("Error en createGpsLocation:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getVehicleLocationHistory = async (req, res) => {
  try {
    const { vehicleId } = req.params
    const { hours = 24, limit = 1000 } = req.query

    const startDate = new Date()
    startDate.setHours(startDate.getHours() - Number.parseInt(hours))

    const locations = await GpsLocation.findAll({
      where: {
        vehicleId,
        gpsTimestamp: {
          [Op.gte]: startDate,
        },
      },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand"],
        },
      ],
      limit: Number.parseInt(limit),
      order: [["gpsTimestamp", "ASC"]],
    })

    res.json({
      success: true,
      data: locations,
    })
  } catch (error) {
    logger.error("Error en getVehicleLocationHistory:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getUserVehicleLocations = async (req, res) => {
  try {
    const userId = req.user.id

    // Obtener vehículos asignados al usuario
    const assignments = await Assignment.findAll({
      where: { userId, isActive: true },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "licensePlate", "model", "brand"],
        },
      ],
    })

    const vehicleIds = assignments.map((assignment) => assignment.vehicleId)

    if (vehicleIds.length === 0) {
      return res.json({
        success: true,
        data: [],
      })
    }

    // Obtener las últimas ubicaciones de los vehículos del usuario
    const locations = await GpsLocation.findAll({
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
      order: [["vehicleId"], ["gpsTimestamp", "DESC"]],
    })

    // Filtrar para obtener solo la última ubicación por vehículo
    const latestByVehicle = new Map()
    locations.forEach((location) => {
      if (!latestByVehicle.has(location.vehicleId)) {
        latestByVehicle.set(location.vehicleId, location)
      }
    })

    const userLocations = Array.from(latestByVehicle.values())

    res.json({
      success: true,
      data: userLocations,
    })
  } catch (error) {
    logger.error("Error en getUserVehicleLocations:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const bulkCreateGpsLocations = async (req, res) => {
  try {
    const { locations } = req.body

    if (!Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un array de ubicaciones",
      })
    }

    // Validar que todos los vehículos existen
    const vehicleIds = [...new Set(locations.map((loc) => loc.vehicleId))]
    const vehicles = await Vehicle.findAll({
      where: { id: { [Op.in]: vehicleIds } },
      attributes: ["id"],
    })

    const existingVehicleIds = vehicles.map((v) => v.id)
    const invalidVehicleIds = vehicleIds.filter((id) => !existingVehicleIds.includes(id))

    if (invalidVehicleIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Vehículos no encontrados: ${invalidVehicleIds.join(", ")}`,
      })
    }

    // Crear ubicaciones en lote
    const createdLocations = await GpsLocation.bulkCreate(
      locations.map((loc) => ({
        ...loc,
        gpsTimestamp: loc.gpsTimestamp || new Date(),
      })),
      { validate: true },
    )

    // Emitir actualizaciones en tiempo real
    emitBulkGpsUpdate(createdLocations)

    logger.info(`${createdLocations.length} ubicaciones GPS creadas en lote`)

    res.status(201).json({
      success: true,
      message: `${createdLocations.length} ubicaciones GPS registradas exitosamente`,
      data: createdLocations,
    })
  } catch (error) {
    logger.error("Error en bulkCreateGpsLocations:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

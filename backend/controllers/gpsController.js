import { sequelize } from '../models/index.js'  // o donde esté
import { Op } from 'sequelize'
import { GpsLocation, Vehicle, Assignment, User } from '../models/index.js'


export const createGpsLocation = async (req, res) => {
  try {
    const { vehicleId, latitude, longitude, speed, direction } = req.body

    // Verificar que el vehículo existe
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
      direction: direction || 0,
      gpsTimestamp: new Date(),
    })


    res.status(200).json({
      success: true,
      message: "Ubicación GPS registrada correctamente",
      data: gpsLocation,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
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

    res.status(200).json({
      success: true,
      data: locations,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
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
        {
          model: Assignment,
          required: false,
          where: { isActive: true },
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName"],
            },
          ],
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

    res.status(200).json({
      success: true,
      data: location,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const getAllVehicleLocations = async (req, res) => {
  try {
    const { latest = false, limit = 1000 } = req.query

    if (latest === "true") {
      const query = `
        SELECT gl.*
        FROM (
          SELECT *,
                 ROW_NUMBER() OVER (PARTITION BY "vehicleId" ORDER BY "gpsTimestamp" DESC) as rn
          FROM "GpsLocations"
        ) gl
        WHERE gl.rn = 1
        ORDER BY gl."gpsTimestamp" DESC
        LIMIT :limit;
      `

      const resultsRaw = await sequelize.query(query, {
        replacements: { limit: Number(limit) },
        type: sequelize.QueryTypes.SELECT,  // <-- Asegura que devuelve array de objetos
      })

      console.log('resultsRaw:', resultsRaw)  // Mira qué recibes aquí

      // Ahora resultsRaw debería ser un array, así que:
      const vehicleIds = resultsRaw.map(loc => loc.vehicleId)

     const locations = await GpsLocation.findAll({
  where: { vehicleId: { [Op.in]: vehicleIds } },
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
                separate: true,
                limit: 1,
                order: [["assignmentDate", "DESC"]],
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
  order: [["gpsTimestamp", "DESC"]],
})


      return res.status(200).json({
        success: true,
        data: locations,
      })
    } else {
      const locations = await GpsLocation.findAll({
  where: { vehicleId: { [Op.in]: vehicleIds } },
  include: [
    {
      model: Vehicle,
      as: "vehicle",
      attributes: ["id", "licensePlate", "model", "brand", "status"],
      include: [
        {
          model: Assignment,
          as: "assignments",
          required: false,
          where: { isActive: true },
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
  order: [["gpsTimestamp", "DESC"]],
})
      return res.status(200).json({
        success: true,
        data: locations,
      })
    }
  } catch (error) {
    console.error("Error en getAllVehicleLocations:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}





export const getUserVehicleLocations = async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 100, latest = false } = req.query

    // Obtener vehículos asignados al usuario
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
      // Obtener la última ubicación de cada vehículo asignado
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

    res.status(200).json({
      success: true,
      data: locations,
    })
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
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


    res.status(200).json({
      success: true,
      message: `Se eliminaron ${deletedCount} ubicaciones GPS anteriores a ${days} días`,
      deletedCount,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
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

    // Extraer los IDs únicos de vehículos del array
    const vehicleIds = [...new Set(locations.map((loc) => loc.vehicleId))]

    // Verificar que los vehículos existen
    const existingVehicles = await Vehicle.findAll({
      where: { id: { [Op.in]: vehicleIds } },
      attributes: ["id"],
    })

    const existingVehicleIds = new Set(existingVehicles.map((v) => v.id))

    // Filtrar solo ubicaciones con vehicleId válido
    const validLocations = locations.filter((loc) => existingVehicleIds.has(loc.vehicleId))

    if (validLocations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Ninguna ubicación tiene un vehicleId válido.",
      })
    }

    // Insertar las ubicaciones en la base de datos
    const created = await GpsLocation.bulkCreate(
      validLocations.map((loc) => ({
        vehicleId: loc.vehicleId,
        latitude: loc.latitude,
        longitude: loc.longitude,
        speed: loc.speed || 0,
        direction: loc.direction || 0,
        gpsTimestamp: loc.gpsTimestamp ? new Date(loc.gpsTimestamp) : new Date(),
      })),
    )

    res.status(200).json({
      success: true,
      message: `Se crearon ${created.length} ubicaciones GPS correctamente.`,
      data: created,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const simulateVehicleMovements = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll()

    if (vehicles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No hay vehículos para simular movimiento",
      })
    }

    const latBase = 20.6767
    const lngBase = -103.3475

    const newLocations = vehicles.map(vehicle => {
      const latitude = latBase + (Math.random() - 0.5) * 0.05
      const longitude = lngBase + (Math.random() - 0.5) * 0.05
      const speed = Math.floor(Math.random() * 80)
      const direction = Math.floor(Math.random() * 360)

      return {
        vehicleId: vehicle.id,
        latitude,
        longitude,
        speed,
        direction,
        gpsTimestamp: new Date(),
      }
    })

    const createdLocations = await GpsLocation.bulkCreate(newLocations)

    res.status(200).json({
      success: true,
      message: `Simulación completada para ${createdLocations.length} vehículos`,
      data: createdLocations,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const createLocation = async (req, res) => {
  try {
    const { vehicleId, latitude, longitude, speed, timestamp } = req.body

    if (!vehicleId || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Datos incompletos" })
    }

    const location = await prisma.location.create({
      data: {
        vehicleId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        speed: parseFloat(speed || 0),
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    })

    res.status(201).json({ success: true, data: location })
  } catch (error) {
    console.error("Error al registrar ubicación:", error)
    res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
}
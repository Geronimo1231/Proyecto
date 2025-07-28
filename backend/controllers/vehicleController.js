import { Vehicle, User, Assignment } from "../models/index.js"
import pkg from "../config/config.cjs"
const { logger } = pkg
import { Op } from 'sequelize'
import GpsLocation from "../models/GpsLocation.js"

import { error } from "console"

// Función para manejar errores
const handleError = (res, error, context) => {
  const errorMessage = error && (error.message || error.toString()) || "Unknown error"

  res.status(400).json({
    success: false,
    message: "Error interno del servidor",
    error: errorMessage,
  })
}


export const getAllVehicles = async (req, res) => {
  try {
    const { page = "1", limit = "10", search = "", status = "", brand = "" } = req.query

    let pageNum = parseInt(page)
    let limitNum = parseInt(limit)

    if (isNaN(pageNum) || pageNum < 1) pageNum = 1
    if (isNaN(limitNum) || limitNum < 1) limitNum = 10

    const offset = (pageNum - 1) * limitNum

    const whereClause = {
      deletedAt: null,
    }

    if (search) {
      whereClause[Op.or] = [
        { licensePlate: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
      ]
    }

    if (status) {
      whereClause.status = status
    }

    if (brand) {
      whereClause.brand = { [Op.iLike]: `%${brand}%` }
    }

    const { count, rows: vehicles } = await Vehicle.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "assignedUser",
          attributes: ["id", "firstName", "lastName", "email"],
          required: false,
        },
        {
          model: GpsLocation,
          as: "locations",
          separate: true,
          limit: 1,
          order: [["gpsTimestamp", "DESC"]],
          attributes: ["latitude", "longitude", "speed", "direction", "gpsTimestamp"],
          required: false,
        },
      ],
      limit: limitNum,
      offset: offset,
      order: [["createdAt", "DESC"]],
    })

    const vehiclesWithLastGps = vehicles.map(vehicle => {
      const gpsArray = Array.isArray(vehicle.locations) ? vehicle.locations : []
      const lastGps = gpsArray.length > 0 ? gpsArray[0] : null
      return {
        ...vehicle.toJSON(),
        lastGpsLocation: lastGps,
      }
    })


    res.status(200).json({
      success: true,
      data: {
        vehicles: vehiclesWithLastGps,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum),
        },
      },
    })
  } catch (error) {
    handleError(res, error, 'getAllVehicles')
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
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        },
        {
          model: Assignment,
          as: "assignments",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
          order: [["createdAt", "DESC"]],
          limit: 5,
        },
      ],
    })

    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehículo no encontrado",
      })
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    })
  } catch (error) {
    handleError(res, error, 'getVehicleById')
  }
}

export const createVehicle = async (req, res) => {
  try {
    const { licensePlate, model, brand, year, type, color, mileage, engineNumber, chassisNumber, imageUrl, latitude, longitude } = req.body

    const existingVehicle = await Vehicle.findOne({ where: { licensePlate } })
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un vehículo con esta placa",
      })
    }

    const vehicle = await Vehicle.create({
      licensePlate,
      model,
      brand,
      year,
      type,
      color,
      mileage: mileage || 0,
      engineNumber,
      chassisNumber,
      status: "available",
      image: imageUrl || null,
    })

    // Si envían latitud y longitud, guarda la ubicación
    if (latitude && longitude) {
      await GpsLocation.create({
        vehicleId: vehicle.id,
        latitude,
        longitude,
        speed: 0,
        direction: 0,
        gpsTimestamp: new Date(),
      })
    }

    res.status(200).json({
      success: true,
      message: "Vehículo creado correctamente",
      data: vehicle,
    })
  } catch (error) {
    handleError(res, error, 'createVehicle')
  }
}


export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      licensePlate,
      model,
      brand,
      year,
      type,
      color,
      mileage,
      engineNumber,
      chassisNumber,
      status,
    } = req.body;

    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehículo no encontrado" });
    }

    // Obtenemos la nueva imagen desde multer (req.file)
    // Si no hay archivo nuevo, mantenemos la imagen actual
    const image = req.file ? req.file.filename : vehicle.image;

    // Actualizamos el vehículo (sin latitude y longitude)
    await vehicle.update({
      licensePlate,
      model,
      brand,
      year,
      type,
      color,
      mileage,
      engineNumber,
      chassisNumber,
      status,
      image,
    });

    // Si recibimos latitud y longitud, creamos nuevo registro en GpsLocation
    const { latitude, longitude } = req.body;
    if (latitude && longitude) {
      await GpsLocation.create({
        vehicleId: vehicle.id,
        latitude,
        longitude,
        speed: 0,
        direction: 0,
        gpsTimestamp: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehículo actualizado correctamente",
      data: vehicle,
    });
  } catch (error) {
    handleError(res, error, "updateVehicle");
  }
};




export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehículo no encontrado",
      });
    }

    const activeAssignments = await Assignment.count({
      where: { vehicleId: id, isActive: true },
    });

    if (activeAssignments > 0) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar un vehículo con asignaciones activas",
      });
    }

      await vehicle.destroy();
    
     res.status(200).json({
      success: true,
      message: "Vehículo eliminado correctamente",
    });
  } catch (error) {
    handleError(res, error, 'deleteVehicle');
  }
}


export const getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      where: { status: "available" },
      attributes: ["id", "licensePlate", "model", "brand", "year"],
      order: [["licensePlate", "ASC"]],
    })

    res.json({
      success: true,
      data: vehicles,
    })
  } catch (error) {
    handleError(res, error, 'getAvailableVehicles')
  }
}

export const getVehicleStats = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.count()
    const availableVehicles = await Vehicle.count({ where: { status: "available" } })
    const assignedVehicles = await Vehicle.count({ where: { status: "assigned" } })
    const maintenanceVehicles = await Vehicle.count({ where: { status: "maintenance" } })
    const outOfServiceVehicles = await Vehicle.count({ where: { status: "out_of_service" } })

    const stats = {
      total: totalVehicles,
      available: availableVehicles,
      assigned: assignedVehicles,
      maintenance: maintenanceVehicles,
      outOfService: outOfServiceVehicles,
    }

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    handleError(res, error, 'getVehicleStats')
  }
}

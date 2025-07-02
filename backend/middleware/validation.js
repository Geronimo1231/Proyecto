import Joi from "joi"

export const validateUser = (req, res, next) => {
  const { firstName, lastName, email } = req.body

  if (!firstName || !lastName || !email) {
    return res.status(400).json({
      success: false,
      message: "Nombre, apellido y email son requeridos",
    })
  }

  const schema = Joi.object({
    firstName: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow("", null).optional(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid("Admin", "User").optional(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Datos inválidos",
      errors: error.details.map((detail) => detail.message),
    })
  }

  next()
}

export const validateAssignment = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.number().integer().required(),
    vehicleId: Joi.number().integer().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref("startDate")).optional(),
    isActive: Joi.boolean().optional(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Datos de asignación inválidos",
      errors: error.details.map((detail) => detail.message),
    })
  }

  next()
}

export const validateGpsLocation = (req, res, next) => {
  const { latitud, longitud, vehiculo_id } = req.body

  if (!latitud || !longitud || !vehiculo_id) {
    return res.status(400).json({
      success: false,
      message: "Latitud, longitud y ID del vehículo son requeridos",
    })
  }

  const schema = Joi.object({
    vehicleId: Joi.number().integer().required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    gpsTimestamp: Joi.date().optional(), // opcional según tu modelo
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Datos de ubicación GPS inválidos",
      errors: error.details.map((detail) => detail.message),
    })
  }

  next()
}

export const validateVehicle = (req, res, next) => {
  const schema = Joi.object({
    licensePlate: Joi.string().required(),
    model: Joi.string().required(),
    brand: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(2030).required(),
    type: Joi.string().allow("", null).optional(),
    color: Joi.string().allow("", null).optional(),
    mileage: Joi.number().integer().min(0).optional(),
    engineNumber: Joi.string().allow("", null).optional(),
    chassisNumber: Joi.string().allow("", null).optional(),
    status: Joi.string().valid("available", "assigned", "maintenance", "out_of_service").optional(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Datos inválidos",
      errors: error.details.map((detail) => detail.message),
    })
  }

  next()
}

export const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Datos inválidos",
      errors: error.details.map((detail) => detail.message),
    })
  }

  next()
}

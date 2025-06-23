import Joi from "joi"

export const validateUser = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow("", null).optional(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid("GlobalAdmin", "Admin", "User").optional(),
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

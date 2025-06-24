export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err)

  // Error de validación de Sequelize
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Error de validación",
      errors: err.errors.map((error) => error.message),
    })
  }

  // Error de clave única de Sequelize
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      success: false,
      message: "El registro ya existe",
      errors: err.errors.map((error) => error.message),
    })
  }

  // Error de clave foránea de Sequelize
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Error de referencia de datos",
    })
  }

  // Error de JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token inválido",
    })
  }

  // Error de token expirado
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expirado",
    })
  }

  // Error por defecto
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  })
}

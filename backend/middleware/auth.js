import jwt from "jsonwebtoken"
import { User } from "../models/index.js"
import pkg from "../config/config.cjs"
const { logger } = pkg


const JWT_SECRET = process.env.JWT_SECRET || "2123312231"

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  )
}

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      })
    }

    const decoded = jwt.verify(token, JWT_SECRET)

    // Get user from database to ensure they still exist
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    req.user = user
    next()
  } catch (error) {
    logger.error("Error en authenticateToken:", error)

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      })
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
      })
    }

    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        })
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para acceder a este recurso",
        })
      }

      next()
    } catch (error) {
      logger.error("Error en requireRole:", error)
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  }
}

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        const user = await User.findByPk(decoded.id, {
          attributes: { exclude: ["password"] },
        })

        if (user) {
          req.user = user
        }
      } catch (error) {
        // Token invalid or expired, but continue without user
        logger.warn("Token opcional inválido:", error.message)
      }
    }

    next()
  } catch (error) {
    logger.error("Error en optionalAuth:", error)
    next()
  }
}

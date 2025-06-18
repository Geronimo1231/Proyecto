import jwt from "jsonwebtoken"
import { User } from "../models/index.js"

const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_secreta_muy_segura_12345"

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
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no válido",
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token inválido",
    })
  }
}

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para realizar esta acción",
      })
    }

    next()
  }
}

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "12h" },
  )
}

import jwt from "jsonwebtoken";

const SECRET_KEY = "2123312231";

// Genera token JWT para un usuario
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
}

// Middleware para validar el token JWT y agregar user al req
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Error en authenticateToken:", error);
    return res.status(403).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
};

// Middleware para requerir uno o más roles (ej: Admin, GlobalAdmin)
export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. No tienes permisos suficientes.",
      });
    }
    next();
  };
};

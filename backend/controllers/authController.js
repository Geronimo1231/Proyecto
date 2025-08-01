import bcrypt from "bcrypt"
import { User } from "../models/index.js"
import { generateToken } from "../middleware/auth.js"

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
      });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Gmail es incorrecta",
      });
    }

  
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "Tu cuenta está desactivada. Contacta al administrador.",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Contraseña es incorrecta ",
      });
    }

    const token = generateToken(user);

    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      photo: user.photo,
      isActive: user.isActive,
    };

    res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};



export const register = async (req, res) => {
  try {
    let { firstName, lastName, email, phone, password, role = "User" } = req.body

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
      })
    }

    email = email.toLowerCase()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Formato de email inválido",
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 8 caracteres",
      })
    }

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      })
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      isActive: true,
    })

    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      photo: user.photo,
      isActive: user.isActive,
    }

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: userData,
    })
  } catch (error) {
    console.error("Error en registro:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}


export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    })

    res.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Error en getMe:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

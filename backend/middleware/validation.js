import { body, validationResult } from "express-validator"

export const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Datos de entrada inválidos",
        errors: errors.array(),
      });
    }
    next();
  },
];


export const validateUser = [
  body("firstName")
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("lastName")
    .notEmpty()
    .withMessage("El apellido es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El apellido debe tener entre 2 y 100 caracteres"),

  body("email").isEmail().withMessage("Debe ser un email válido").normalizeEmail(),

  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),

  body("phone").optional().isMobilePhone().withMessage("Debe ser un número de teléfono válido"),

  body("role").optional().isIn(["Admin", "User"]).withMessage("El rol debe ser Admin o User"),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Datos de entrada inválidos",
        errors: errors.array(),
      })
    }
    next()
  },
]

export const validateVehicle = [
  body("licensePlate")
    .notEmpty()
    .withMessage("La matrícula es requerida")
    .isLength({ min: 3, max: 20 })
    .withMessage("La matrícula debe tener entre 3 y 20 caracteres"),

  body("model")
    .notEmpty()
    .withMessage("El modelo es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El modelo debe tener entre 2 y 100 caracteres"),

  body("brand")
    .notEmpty()
    .withMessage("La marca es requerida")
    .isLength({ min: 2, max: 100 })
    .withMessage("La marca debe tener entre 2 y 100 caracteres"),

  body("year")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("El año debe ser válido"),

  body("color").optional().isLength({ max: 50 }).withMessage("El color no puede exceder 50 caracteres"),

  body("vehicleType")
    .optional()
    .isLength({ max: 50 })
    .withMessage("El tipo de vehículo no puede exceder 50 caracteres"),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Datos de entrada inválidos",
        errors: errors.array(),
      })
    }
    next()
  },
]

export const validateAssignment = [
  body("userId").isInt().withMessage("El ID del usuario debe ser un número entero"),

  body("vehicleId").isInt().withMessage("El ID del vehículo debe ser un número entero"),

  body("notes").optional().isLength({ max: 500 }).withMessage("Las notas no pueden exceder 500 caracteres"),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Datos de entrada inválidos",
        errors: errors.array(),
      })
    }
    next()
  },
]

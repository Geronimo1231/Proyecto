import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

export const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre es obligatorio" },
        len: { args: [2, 100], msg: "El nombre debe tener entre 2 y 100 caracteres" },
      },
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El apellido es obligatorio" },
        len: { args: [2, 100], msg: "El apellido debe tener entre 2 y 100 caracteres" },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Debe ser un email válido" },
        notEmpty: { msg: "El email es obligatorio" },
      },
    },
    telefono: {
      type: DataTypes.STRING(20),
      validate: {
        is: { args: /^[+]?[0-9\-$$$$\s]+$/, msg: "Formato de teléfono inválido" },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "La contraseña es obligatoria" },
        len: { args: [8, 255], msg: "La contraseña debe tener al menos 8 caracteres" },
        isStrongPassword(value) {
          const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
          if (!strongPasswordRegex.test(value)) {
            throw new Error(
              "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial",
            )
          }
        },
      },
    },
    foto_perfil: {
      type: DataTypes.TEXT,
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles",
        key: "id",
      },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "usuarios",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
)

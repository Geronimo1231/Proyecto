import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { v4 as uuidv4 } from "uuid" // <-- import UUID
import pkg from "../config/config.cjs"
const { logger } = pkg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname)
    const uniqueName = uuidv4() + extension // <-- usar UUID para nombre único
    cb(null, uniqueName)
  },
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Solo se permiten archivos de imagen"), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})

export const uploadSingle = upload.single("image")

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se ha subido ningún archivo",
      })
    }

    const imageUrl = `/uploads/${req.file.filename}`

    res.status(200).json({
      success: true,
      message: "Imagen subida correctamente",
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: imageUrl,
        size: req.file.size,
        path: req.file.path,
      },
    })
  } catch (error) {
    logger.error("Error al subir imagen:", error)
    res.status(500).json({
      success: false,
      message: "Error al subir la imagen",
      error: error.message,
    })
  }
}

export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params
    const filePath = path.join(uploadDir, filename)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      logger.info(`Imagen eliminada: ${filename}`)
      res.status(200).json({
        success: true,
        message: "Imagen eliminada correctamente",
      })
    } else {
      res.status(404).json({
        success: false,
        message: "Imagen no encontrada",
      })
    }
  } catch (error) {
    logger.error("Error al eliminar imagen:", error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar la imagen",
      error: error.message,
    })
  }
}

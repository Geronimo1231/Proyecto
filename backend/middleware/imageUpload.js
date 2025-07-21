import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import pkg from "../config/config.cjs"
const { logger } = pkg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`
    cb(null, filename)
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
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
})

// Middleware para procesar imagen y convertir a URL
export const processImageUpload = (fieldName = "image") => {
  return [
    upload.single(fieldName),
    (req, res, next) => {
      if (req.file) {
        const imageUrl = `/uploads/${req.file.filename}`

        // Usa photo para que coincida con el controlador
        req.body.photo = imageUrl
        req.body.imageInfo = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: imageUrl,
        }

        logger.info(`Imagen procesada: ${req.file.filename} -> ${imageUrl}`)
      }
      next()
    },
  ]
}


// Middleware para eliminar imagen anterior
export const deleteOldImage = (req, res, next) => {
  if (req.body.oldImage && req.file) {
    try {
      const oldImagePath = req.body.oldImage.replace("/uploads/", "")
      const fullPath = path.join(uploadDir, oldImagePath)

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath)
        logger.info(`Imagen anterior eliminada: ${oldImagePath}`)
      }
    } catch (error) {
      logger.error("Error al eliminar imagen anterior:", error)
    }
  }
  next()
}

export { upload }

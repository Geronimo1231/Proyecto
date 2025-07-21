import express from "express"
import { uploadSingle, uploadImage, deleteImage } from "../controllers/uploadController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Ruta para subir imagen
router.post("/", authenticateToken, uploadSingle, uploadImage)

// Ruta para eliminar imagen
router.delete("/:filename", authenticateToken, deleteImage)

export default router

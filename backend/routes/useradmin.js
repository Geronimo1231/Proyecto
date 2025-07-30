import express from "express"
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAvailableUsers,
  toggleUserStatus,
} from "../controllers/userController.js"
import { authenticateToken, requireRole } from "../middleware/auth.js"
import { processImageUpload, deleteOldImage } from "../middleware/imageUpload.js"

const router = express.Router()

router.put("/me", authenticateToken, ...processImageUpload("image"), deleteOldImage, updateUser)

router.get("/", authenticateToken, getAllUsers)
router.get("/available", authenticateToken, getAvailableUsers)
router.get("/:id", authenticateToken, getUserById)

router.post("/", authenticateToken, requireRole("Admin"), ...processImageUpload("image"), createUser)
router.put("/:id", authenticateToken, ...processImageUpload("image"), deleteOldImage, updateUser)
router.delete("/:id", authenticateToken, requireRole("Admin"), deleteUser)

// Agrega esta línea para toggle status
router.patch("/:id/toggle-status", authenticateToken, requireRole("Admin"), toggleUserStatus)


export default router

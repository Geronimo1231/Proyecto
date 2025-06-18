import express from "express"
import { login, register, getMe } from "../controllers/authController.js"
import { validateLogin, validateUser } from "../middleware/validation.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

router.post("/login", validateLogin, login)
router.post("/register", validateUser, register)
router.get("/me", authenticateToken, getMe)

export default router

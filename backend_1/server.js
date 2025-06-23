import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { sequelize } from "./config/database.js"
import "./models/index.js"

// Importar rutas
import authRoutes from "./routes/auth.js"
import vehicleRoutes from "./routes/vehicles.js"

// Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use("/api/auth", authRoutes)
app.use("/api/vehicles", vehicleRoutes)

// Ruta de health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
  })
})

// Inicializar servidor
async function startServer() {
  try {
    await sequelize.authenticate()
    console.log("✅ Conexión a la base de datos establecida")

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ force: false })
      console.log("✅ Modelos sincronizados")
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`)
    })
  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error)
    process.exit(1)
  }
}

startServer()

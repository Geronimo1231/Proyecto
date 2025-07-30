import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import sequelize from "./config/database.js"  
import "./models/index.js"
import path from "path"



import configFile from "./config/config.cjs"
import { requestLogger } from "./middleware/requestLogger.js"
const appConfig = configFile.app
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log("JWT SECRET:", appConfig.jwt.secret)

// Cargar variables de entorno
dotenv.config()

// Este es el servidor Express
const app = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Rutas
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/useradmin.js"
import vehicleRoutes from "./routes/vehicles.js"
import assignmentRoutes from "./routes/assignments.js"
import dashboardRoutes from "./routes/dashboard.js"
import gpsRoutes from "./routes/gps.js"
import brandRoutes from "./routes/brands.js"
import roleRoutes from "./routes/roles.js"
import vehicleTypeRoutes from "./routes/vehicles-types.js"
import uploadRoutes from "./routes/upload.js"



app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/vehicles", vehicleRoutes)
app.use("/api/assignments", assignmentRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/gps", gpsRoutes)
app.use("/api/brands", brandRoutes)
app.use("/api/roles", roleRoutes)
app.use("/api/vehicles-types", vehicleTypeRoutes)
app.use("/api/upload", uploadRoutes)

let socket;

export function emitGpsUpdate(data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'gps-update', payload: data }));
  } else {
    console.warn('WebSocket no está conectado');
  }
  console.log("emitGpsUpdate", data);
}


export function emitBulkGpsUpdate(dataArray) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'bulk-gps-update', payload: dataArray }));
  } else {
    console.warn('WebSocket no está conectado');
  }
  console.log("emitBulkGpsUpdate", dataArray);
}



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
      console.log(`--------------------------------------
--------------------------------------
--------------------------------------`)
    })
  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error)
    process.exit(1)
  }
}

startServer()

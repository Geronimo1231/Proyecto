import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import sequelize from "./config/database.js"  
import "./models/index.js"



import configFile from "./config/config.cjs"
const appConfig = configFile.app

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

// Rutas
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import vehicleRoutes from "./routes/vehicles.js"
import assignmentRoutes from "./routes/assignments.js"
import dashboardRoutes from "./routes/dashboard.js"
import gpsRoutes from "./routes/gps.js"
import brandRoutes from "./routes/brands.js"
import roleRoutes from "./routes/roles.js"
import vehicleTypeRoutes from "./routes/vehicles-types.js"



app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/vehicles", vehicleRoutes)
app.use("/api/assignments", assignmentRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/gps", gpsRoutes)
app.use("/api/brands", brandRoutes)
app.use("/api/roles", roleRoutes)
app.use("/api/vehicles-types", vehicleTypeRoutes)

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
    })
  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error)
    process.exit(1)
  }
}

startServer()

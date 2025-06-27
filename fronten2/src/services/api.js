import axios from "axios"
import { toast } from 'vue3-toastify'

// Usa la variable de entorno de Vue CLI con prefijo VUE_APP_
const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    } else if (error.response?.status >= 500) {
      toast.error("Error del servidor. Intente nuevamente.")
    }
    return Promise.reject(error)
  }
)

export default api
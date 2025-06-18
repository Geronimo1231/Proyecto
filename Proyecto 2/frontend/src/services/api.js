"use client"

import axios from "axios"
import { useToast } from "vue-toastification"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

const toast = useToast()

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    } else if (error.response?.status >= 500) {
      toast.error("Error del servidor. Intente nuevamente.")
    }
    return Promise.reject(error)
  },
)

export default api

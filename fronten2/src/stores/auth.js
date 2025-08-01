"use client"

import { defineStore } from "pinia"
import { ref, computed } from "vue"
import api from "../services/api"
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'


export const useAuthStore = defineStore("auth", () => {
  const user = ref(JSON.parse(localStorage.getItem("user")))
  const token = ref(localStorage.getItem("token"))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => ["GlobalAdmin", "Admin"].includes(user.value?.role))
  const isUser = computed(() => user.value?.role === "User")
  const isGlobalAdmin = computed(() => user.value?.role === "GlobalAdmin")

  const login = async (credentials) => {

    try {
      //loading.value = true
      const response = await api.post("/auth/login", credentials)

      if (response.data.success) {
        token.value = response.data.token
        user.value = response.data.user
        localStorage.setItem("token", token.value)
        localStorage.setItem("user", JSON.stringify(user.value))
        api.defaults.headers.common["Authorization"] = `Bearer ${token.value}`

        return { success: true, user: user.value }
      } else {
         return { success: false, user: '' }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al iniciar sesión"
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }


  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    toast.info("Sesión cerrada")
  }

  const checkAuth = async () => {
    if (!token.value) return false

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token.value}`
      const response = await api.get("/auth/me")

      if (response.data.success) {
        user.value = response.data.user
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      logout()
      return false
    }
  }

  const updateProfile = async (profileData) => {
    try {
      loading.value = true
      const response = await api.put("/user/profile", profileData)

      if (response.data.success) {
        user.value = { ...user.value, ...response.data.user }
        toast.success("Perfil actualizado correctamente")
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al actualizar perfil"
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (passwordData) => {
    try {
      loading.value = true
      const response = await api.put("/auth/change-password", passwordData)

      if (response.data.success) {
        toast.success("Contraseña cambiada correctamente")
        await useAuthStore() 
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al cambiar contraseña"
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isUser,
    isGlobalAdmin,
    login,
    logout,
    checkAuth,
    updateProfile,
    changePassword,
  }
})

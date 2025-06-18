"use client"

import { defineStore } from "pinia"
import { ref, computed } from "vue"
import api from "../services/api"
import { useToast } from "vue-toastification"

const useUsersStore = defineStore("users", () => {
  const toast = useToast()
  const users = ref([])
  const loading = ref(false)
  const selectedUser = ref(null)

  const activeUsers = computed(() => users.value.filter((user) => !user.deletedAt))

  const adminUsers = computed(() => users.value.filter((user) => ["GlobalAdmin", "Admin"].includes(user.role)))

  const regularUsers = computed(() => users.value.filter((user) => user.role === "User"))

  const fetchUsers = async (filters = {}) => {
    try {
      loading.value = true
      const params = new URLSearchParams(filters).toString()
      const response = await api.get(`/users${params ? `?${params}` : ""}`)
      users.value = response.data.data
      return { success: true, data: response.data.data }
    } catch (error) {
      toast.error("Error al cargar los usuarios")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData) => {
    try {
      loading.value = true
      const response = await api.post("/users", userData)
      users.value.push(response.data.data)
      toast.success("Usuario creado correctamente")
      return { success: true, data: response.data.data }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al crear el usuario")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id, userData) => {
    try {
      loading.value = true
      const response = await api.put(`/users/${id}`, userData)
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index] = response.data.data
      }
      toast.success("Usuario actualizado correctamente")
      return { success: true, data: response.data.data }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al actualizar el usuario")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id) => {
    try {
      loading.value = true
      await api.delete(`/users/${id}`)
      users.value = users.value.filter((u) => u.id !== id)
      toast.success("Usuario eliminado correctamente")
      return { success: true }
    } catch (error) {
      toast.error("Error al eliminar el usuario")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const toggleUserStatus = async (id) => {
    try {
      loading.value = true
      const response = await api.patch(`/users/${id}/toggle-status`)
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index] = response.data.data
      }
      toast.success("Estado del usuario actualizado")
      return { success: true, data: response.data.data }
    } catch (error) {
      toast.error("Error al cambiar el estado del usuario")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const setSelectedUser = (user) => {
    selectedUser.value = user
  }

  return {
    users,
    loading,
    selectedUser,
    activeUsers,
    adminUsers,
    regularUsers,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    setSelectedUser,
  }
})

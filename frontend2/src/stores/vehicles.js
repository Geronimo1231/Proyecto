"use client"

import { defineStore } from "pinia"
import { ref, computed } from "vue"
import api from "../services/api"
import { useToast } from "vue-toastification"

const toast = useToast()

export const useVehiclesStore = defineStore("vehicles", () => {
  const vehicles = ref([])
  const loading = ref(false)
  const selectedVehicle = ref(null)

  const availableVehicles = computed(() => vehicles.value.filter((vehicle) => vehicle.status === "available"))

  const assignedVehicles = computed(() => vehicles.value.filter((vehicle) => vehicle.status === "assigned"))

  const fetchVehicles = async (filters = {}) => {
    try {
      loading.value = true
      const params = new URLSearchParams(filters).toString()
      const response = await api.get(`/vehicles${params ? `?${params}` : ""}`)
      vehicles.value = response.data.data
      return { success: true, data: response.data.data }
    } catch (error) {
      toast.error("Error al cargar los vehículos")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const createVehicle = async (vehicleData) => {
    try {
      loading.value = true
      const response = await api.post("/vehicles", vehicleData)
      vehicles.value.push(response.data.data)
      toast.success("Vehículo creado correctamente")
      return { success: true, data: response.data.data }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al crear el vehículo")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const updateVehicle = async (id, vehicleData) => {
    try {
      loading.value = true
      const response = await api.put(`/vehicles/${id}`, vehicleData)
      const index = vehicles.value.findIndex((v) => v.id === id)
      if (index !== -1) {
        vehicles.value[index] = response.data.data
      }
      toast.success("Vehículo actualizado correctamente")
      return { success: true, data: response.data.data }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al actualizar el vehículo")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const deleteVehicle = async (id) => {
    try {
      loading.value = true
      await api.delete(`/vehicles/${id}`)
      vehicles.value = vehicles.value.filter((v) => v.id !== id)
      toast.success("Vehículo eliminado correctamente")
      return { success: true }
    } catch (error) {
      toast.error("Error al eliminar el vehículo")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const assignVehicle = async (vehicleId, userId, notes = "") => {
    try {
      loading.value = true
      const response = await api.post("/assignments", {
        vehicleId,
        userId,
        notes,
      })

      // Actualizar el estado del vehículo
      const vehicleIndex = vehicles.value.findIndex((v) => v.id === vehicleId)
      if (vehicleIndex !== -1) {
        vehicles.value[vehicleIndex].status = "assigned"
        vehicles.value[vehicleIndex].assignedTo = userId
      }

      toast.success("Vehículo asignado correctamente")
      return { success: true, data: response.data.data }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al asignar el vehículo")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const unassignVehicle = async (vehicleId) => {
    try {
      loading.value = true
      await api.patch(`/assignments/vehicle/${vehicleId}/unassign`)

      // Actualizar el estado del vehículo
      const vehicleIndex = vehicles.value.findIndex((v) => v.id === vehicleId)
      if (vehicleIndex !== -1) {
        vehicles.value[vehicleIndex].status = "available"
        vehicles.value[vehicleIndex].assignedTo = null
      }

      toast.success("Vehículo desasignado correctamente")
      return { success: true }
    } catch (error) {
      toast.error("Error al desasignar el vehículo")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const setSelectedVehicle = (vehicle) => {
    selectedVehicle.value = vehicle
  }

  return {
    vehicles,
    loading,
    selectedVehicle,
    availableVehicles,
    assignedVehicles,
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    assignVehicle,
    unassignVehicle,
    setSelectedVehicle,
  }
})

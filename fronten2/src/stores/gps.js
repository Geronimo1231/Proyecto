"use client"

import { defineStore } from "pinia"
import { ref, computed } from "vue"
import api from "../services/api"
import io from "socket.io-client"
import { toast } from 'vue3-toastify'
//import { useGpsStore } from "@/stores/gps"

const gpsStore = useGpsStore()

console.log(gpsStore.ubicaciones) // o gpsStore.metodo(), etc.


const useGpsStore = defineStore("gps", () => {
  const locations = ref([])
  const loading = ref(false)
  const socket = ref(null)
  const isConnected = ref(false)

  const latestLocations = computed(() => {
    const latest = new Map()
    locations.value.forEach((location) => {
      const existing = latest.get(location.vehicleId)
      if (!existing || new Date(location.gpsTimestamp) > new Date(existing.gpsTimestamp)) {
        latest.set(location.vehicleId, location)
      }
    })
    return Array.from(latest.values())
  })

  const getVehicleLocation = computed(() => (vehicleId) => {
    return locations.value
      .filter((loc) => loc.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.gpsTimestamp) - new Date(a.gpsTimestamp))[0]
  })

  const initSocket = () => {
    if (socket.value) return

    socket.value = io(import.meta.env.VITE_API_URL || "http://localhost:8080")

    socket.value.on("connect", () => {
      isConnected.value = true
      console.log("GPS Socket conectado")
    })

    socket.value.on("disconnect", () => {
      isConnected.value = false
      console.log("GPS Socket desconectado")
    })

    socket.value.on("location-update", (locationData) => {
      updateLocation(locationData)
    })

    socket.value.on("bulk-location-update", (locationsData) => {
      locationsData.forEach((locationData) => {
        updateLocation(locationData)
      })
    })
  }

  const disconnectSocket = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }

  const updateLocation = (locationData) => {
    const existingIndex = locations.value.findIndex(
      (loc) => loc.vehicleId === locationData.vehicleId && loc.gpsTimestamp === locationData.gpsTimestamp,
    )

    if (existingIndex === -1) {
      locations.value.push(locationData)
    } else {
      locations.value[existingIndex] = locationData
    }
  }

  const fetchLocations = async (filters = {}) => {
    try {
      loading.value = true
      const params = new URLSearchParams(filters).toString()
      const response = await api.get(`/gps-locations${params ? `?${params}` : ""}`)
      locations.value = response.data.data
      return { success: true, data: response.data.data }
    } catch (error) {
      toast.error("Error al cargar las ubicaciones GPS")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const fetchLatestLocations = async () => {
    try {
      loading.value = true
      const response = await api.get("/gps-locations/latest")
      locations.value = response.data.data
      return { success: true, data: response.data.data }
    } catch (error) {
      toast.error("Error al cargar las últimas ubicaciones")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }
  const fetchVehicleHistory = async (vehicleId, timeRange = "24h") => {
    try {
      loading.value = true
      const response = await api.get(`/gps-locations/vehicle/${vehicleId}/history?range=${timeRange}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      toast.error("Error al cargar el historial del vehículo")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const addLocation = async (locationData) => {
    try {
      const response = await api.post("/gps-locations", locationData)
      updateLocation(response.data.data)
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error("Error al agregar ubicación:", error)
      return { success: false, error }
    }
  }

  const clearLocations = () => {
    locations.value = []
  }

  return {
    locations,
    loading,
    isConnected,
    latestLocations,
    getVehicleLocation,
    initSocket,
    disconnectSocket,
    fetchLocations,
    fetchLatestLocations,
    fetchVehicleHistory,
    addLocation,
    clearLocations,
  }
})

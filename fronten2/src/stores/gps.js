import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useAuthStore } from "./auth"
import { toast } from "vue3-toastify"

export const useGpsStore = defineStore("gps", () => {
  const locations = ref([])
  const loading = ref(false)
  const realTimeEnabled = ref(false)
  const lastUpdate = ref(null)
  const selectedLocation = ref(null)

  const authStore = useAuthStore()

  // Computed
  const latestLocations = computed(() => {
    const vehicleMap = new Map()
    locations.value.forEach((location) => {
      const vehicleId = location.vehicleId
      if (
        !vehicleMap.has(vehicleId) ||
        new Date(location.gpsTimestamp) > new Date(vehicleMap.get(vehicleId).gpsTimestamp)
      ) {
        vehicleMap.set(vehicleId, location)
      }
    })
    return Array.from(vehicleMap.values())
  })

  const activeVehicleLocations = computed(() =>
    latestLocations.value.filter((location) => location.vehicle && location.vehicle.status === "Asignado"),
  )

  const activeLocations = computed(() => locations.value.filter((location) => location.isActive))

  // Actions
  const fetchAllLocations = async (params = {}) => {
    try {
      loading.value = true
      const queryParams = new URLSearchParams({
        latest: params.latest || "true",
        limit: params.limit || "1000",
      }).toString()

      const response = await authStore.apiCall(`/gps/locations?${queryParams}`, "GET")

      if (response.success) {
        locations.value = response.data
        lastUpdate.value = new Date()
      }
    } catch (error) {
      toast.error("Error al cargar las ubicaciones GPS")
      console.error("Error fetching GPS locations:", error)
    } finally {
      loading.value = false
    }
  }

  const fetchVehicleLocations = async (vehicleId, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        limit: params.limit || "100",
        startDate: params.startDate || "",
        endDate: params.endDate || "",
      }).toString()

      const response = await authStore.apiCall(`/gps/vehicle/${vehicleId}?${queryParams}`, "GET")
      return response.success ? response.data : []
    } catch (error) {
      toast.error("Error al cargar las ubicaciones del vehículo")
      console.error("Error fetching vehicle locations:", error)
      return []
    }
  }

  const fetchUserVehicleLocations = async (params = {}) => {
    try {
      loading.value = true
      const queryParams = new URLSearchParams({
        latest: params.latest || "true",
        limit: params.limit || "100",
      }).toString()

      const response = await authStore.apiCall(`/gps/user/locations?${queryParams}`, "GET")

      if (response.success) {
        locations.value = response.data
        lastUpdate.value = new Date()
      }
    } catch (error) {
      toast.error("Error al cargar las ubicaciones de tus vehículos")
      console.error("Error fetching user vehicle locations:", error)
    } finally {
      loading.value = false
    }
  }

  const getLatestVehicleLocation = async (vehicleId) => {
    try {
      const response = await authStore.apiCall(`/gps/vehicle/${vehicleId}/latest`, "GET")
      return response.success ? response.data : null
    } catch (error) {
      console.error("Error fetching latest vehicle location:", error)
      return null
    }
  }

  const createGpsLocation = async (locationData) => {
    try {
      const response = await authStore.apiCall("/gps/locations", "POST", locationData)

      if (response.success) {
        // Add to local state if successful
        locations.value.unshift(response.data)
        return { success: true, data: response.data }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al crear la ubicación GPS"
      toast.error(message)
      return { success: false, message }
    }
  }

  const bulkCreateGpsLocations = async (locationsData) => {
    try {
      loading.value = true
      const response = await authStore.apiCall("/gps/locations/bulk", "POST", {
        locations: locationsData,
      })

      if (response.success) {
        toast.success(`Se crearon ${response.data.length} ubicaciones GPS`)
        await fetchAllLocations() // Refresh locations
        return { success: true, data: response.data }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al crear las ubicaciones GPS"
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const deleteOldLocations = async (days = 30) => {
    try {
      const response = await authStore.apiCall(`/gps/cleanup?days=${days}`, "DELETE")

      if (response.success) {
        toast.success(`Se eliminaron ubicaciones anteriores a ${days} días`)
        await fetchAllLocations() // Refresh locations
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al limpiar ubicaciones antiguas"
      toast.error(message)
      return { success: false, message }
    }
  }

  const startRealTimeTracking = () => {
    realTimeEnabled.value = true
    // Refresh locations every 30 seconds
    const interval = setInterval(async () => {
      if (realTimeEnabled.value) {
        await fetchAllLocations({ latest: "true" })
      } else {
        clearInterval(interval)
      }
    }, 30000)
  }

  const stopRealTimeTracking = () => {
    realTimeEnabled.value = false
  }

  const getLocationHistory = async (vehicleId, startDate, endDate) => {
    try {
      const response = await authStore.apiCall(
        `/gps/vehicle/${vehicleId}/history?startDate=${startDate}&endDate=${endDate}`,
        "GET",
      )
      return response.success ? response.data : []
    } catch (error) {
      toast.error("Error al cargar el historial de ubicaciones")
      console.error("Error fetching location history:", error)
      return []
    }
  }

  const fetchLocations = async (filters = {}) => {
    try {
      loading.value = true
      const params = new URLSearchParams(filters).toString()
      const response = await authStore.apiCall(`/gps${params ? `?${params}` : ""}`)

      if (response.success) {
        locations.value = response.data
        return { success: true, data: response.data }
      }
    } catch (error) {
      console.error("Error al cargar ubicaciones GPS:", error)
      toast.error("Error al cargar las ubicaciones GPS")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const fetchUserLocations = async () => {
    try {
      loading.value = true
      const response = await authStore.apiCall("/gps/user/locations")

      if (response.success) {
        locations.value = response.data
        return { success: true, data: response.data }
      }
    } catch (error) {
      console.error("Error al cargar ubicaciones del usuario:", error)
      toast.error("Error al cargar las ubicaciones")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const fetchLocationHistory = async (vehicleId, startDate, endDate) => {
    try {
      loading.value = true
      const params = new URLSearchParams({
        vehicleId,
        startDate,
        endDate,
      }).toString()

      const response = await authStore.apiCall(`/gps/history?${params}`)

      if (response.success) {
        return { success: true, data: response.data }
      }
    } catch (error) {
      console.error("Error al cargar historial:", error)
      toast.error("Error al cargar el historial de ubicaciones")
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const updateLocation = (locationData) => {
    const index = locations.value.findIndex((loc) => loc.vehicleId === locationData.vehicleId)
    if (index !== -1) {
      locations.value[index] = locationData
    } else {
      locations.value.push(locationData)
    }
  }

  const setSelectedLocation = (location) => {
    selectedLocation.value = location
  }

  return {
    // State
    locations,
    loading,
    realTimeEnabled,
    lastUpdate,
    selectedLocation,

    // Computed
    latestLocations,
    activeVehicleLocations,
    activeLocations,

    // Actions
    fetchAllLocations,
    fetchVehicleLocations,
    fetchUserVehicleLocations,
    getLatestVehicleLocation,
    createGpsLocation,
    bulkCreateGpsLocations,
    deleteOldLocations,
    startRealTimeTracking,
    stopRealTimeTracking,
    getLocationHistory,
    fetchLocations,
    fetchUserLocations,
    fetchLocationHistory,
    updateLocation,
    setSelectedLocation,
  }
})

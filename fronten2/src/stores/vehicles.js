import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useAuthStore } from "./auth"
import { toast } from "vue3-toastify"

export const useVehiclesStore = defineStore("vehicles", () => {
  const vehicles = ref([])
  const vehicleTypes = ref([])
  const loading = ref(false)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  const authStore = useAuthStore()

  // Computed
  const availableVehicles = computed(() => vehicles.value.filter((vehicle) => vehicle.status === "Disponible"))

  const assignedVehicles = computed(() => vehicles.value.filter((vehicle) => vehicle.status === "Asignado"))

  const activeVehicles = computed(() => vehicles.value.filter((vehicle) => vehicle.isActive))

  // Actions
  const fetchVehicles = async (params = {}) => {
    try {
      loading.value = true
      const queryParams = new URLSearchParams({
        page: params.page || pagination.value.page,
        limit: params.limit || pagination.value.limit,
        search: params.search || "",
        status: params.status || "",
        brand: params.brand || "",
      }).toString()

      const response = await authStore.apiCall(`/vehicles?${queryParams}`, "GET")

      if (response.success) {
        vehicles.value = response.data.vehicles
        pagination.value = response.data.pagination
      }
    } catch (error) {
      toast.error("Error al cargar los vehículos")
      console.error("Error fetching vehicles:", error)
    } finally {
      loading.value = false
    }
  }

  const fetchVehicleTypes = async () => {
    try {
      const response = await authStore.apiCall("/vehicle-types", "GET")
      if (response.success) {
        vehicleTypes.value = response.data
      }
    } catch (error) {
      console.error("Error fetching vehicle types:", error)
    }
  }

  const getVehicleById = async (id) => {
    try {
      const response = await authStore.apiCall(`/vehicles/${id}`, "GET")
      return response.success ? response.data : null
    } catch (error) {
      toast.error("Error al cargar el vehículo")
      console.error("Error fetching vehicle:", error)
      return null
    }
  }

  const createVehicle = async (vehicleData) => {
    try {
      loading.value = true
      const response = await authStore.apiCall("/vehicles", "POST", vehicleData)

      if (response.success) {
        toast.success("Vehículo creado correctamente")
        await fetchVehicles() // Refresh list
        return { success: true, data: response.data }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al crear el vehículo"
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const updateVehicle = async (id, vehicleData) => {
    try {
      loading.value = true
      const response = await authStore.apiCall(`/vehicles/${id}`, "PUT", vehicleData)

      if (response.success) {
        toast.success("Vehículo actualizado correctamente")
        await fetchVehicles() // Refresh list
        return { success: true, data: response.data }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al actualizar el vehículo"
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const deleteVehicle = async (id) => {
    try {
      loading.value = true
      const response = await authStore.apiCall(`/vehicles/${id}`, "DELETE")

      if (response.success) {
        toast.success("Vehículo eliminado correctamente")
        await fetchVehicles() // Refresh list
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al eliminar el vehículo"
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const toggleVehicleStatus = async (id) => {
    try {
      const vehicle = vehicles.value.find((v) => v.id === id)
      if (!vehicle) return { success: false, message: "Vehículo no encontrado" }

      const newStatus = vehicle.status === "Disponible" ? "Mantenimiento" : "Disponible"
      const response = await authStore.apiCall(`/vehicles/${id}`, "PUT", {
        ...vehicle,
        status: newStatus,
      })

      if (response.success) {
        toast.success(`Vehículo marcado como ${newStatus}`)
        await fetchVehicles() // Refresh list
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al cambiar el estado del vehículo"
      toast.error(message)
      return { success: false, message }
    }
  }

  const getAvailableVehicles = async () => {
    try {
      const response = await authStore.apiCall("/vehicles?status=Disponible", "GET")
      return response.success ? response.data.vehicles : []
    } catch (error) {
      console.error("Error fetching available vehicles:", error)
      return []
    }
  }

  const searchVehicles = async (searchTerm) => {
    try {
      const response = await authStore.apiCall(`/vehicles?search=${searchTerm}`, "GET")
      return response.success ? response.data.vehicles : []
    } catch (error) {
      console.error("Error searching vehicles:", error)
      return []
    }
  }

  const getVehicleStats = async () => {
    try {
      const response = await authStore.apiCall("/vehicles/stats", "GET")
      return response.success ? response.data : {}
    } catch (error) {
      console.error("Error fetching vehicle stats:", error)
      return {}
    }
  }

  return {
    // State
    vehicles,
    vehicleTypes,
    loading,
    pagination,

    // Computed
    availableVehicles,
    assignedVehicles,
    activeVehicles,

    // Actions
    fetchVehicles,
    fetchVehicleTypes,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    toggleVehicleStatus,
    getAvailableVehicles,
    searchVehicles,
    getVehicleStats,
  }
})

import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useAuthStore } from "./auth"
import { toast } from "vue3-toastify"

export const useAssignmentsStore = defineStore("assignments", () => {
  const assignments = ref([])
  const loading = ref(false)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  const authStore = useAuthStore()

  // Computed
  const activeAssignments = computed(() => assignments.value.filter((assignment) => assignment.isActive))

  const inactiveAssignments = computed(() => assignments.value.filter((assignment) => !assignment.isActive))

  // Actions
  const fetchAssignments = async (params = {}) => {
    try {
      loading.value = true
      const queryParams = new URLSearchParams({
        page: params.page || pagination.value.page,
        limit: params.limit || pagination.value.limit,
        search: params.search || "",
        status: params.status || "",
      }).toString()

      const response = await authStore.apiCall(`/assignments?${queryParams}`, "GET")

      if (response.success) {
        assignments.value = response.data.assignments
        pagination.value = response.data.pagination
      }
    } catch (error) {
      toast.error("Error al cargar las asignaciones")
      console.error("Error fetching assignments:", error)
    } finally {
      loading.value = false
    }
  }

  const getAssignmentById = async (id) => {
    try {
      const response = await authStore.apiCall(`/assignments/${id}`, "GET")
      return response.success ? response.data : null
    } catch (error) {
      toast.error("Error al cargar la asignación")
      console.error("Error fetching assignment:", error)
      return null
    }
  }

  const createAssignment = async (assignmentData) => {
    try {
      loading.value = true
      const response = await authStore.apiCall("/assignments", "POST", assignmentData)

      if (response.success) {
        toast.success("Asignación creada correctamente")
        await fetchAssignments() // Refresh list
        return { success: true, data: response.data }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al crear la asignación"
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const updateAssignment = async (id, assignmentData) => {
    try {
      loading.value = true
      const response = await authStore.apiCall(`/assignments/${id}`, "PUT", assignmentData)

      if (response.success) {
        toast.success("Asignación actualizada correctamente")
        await fetchAssignments() // Refresh list
        return { success: true, data: response.data }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al actualizar la asignación"
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const deleteAssignment = async (id) => {
    try {
      loading.value = true
      const response = await authStore.apiCall(`/assignments/${id}`, "DELETE")

      if (response.success) {
        toast.success("Asignación eliminada correctamente")
        await fetchAssignments() // Refresh list
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al eliminar la asignación"
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const deactivateAssignment = async (id) => {
    try {
      loading.value = true
      const response = await authStore.apiCall(`/assignments/${id}/deactivate`, "PUT")

      if (response.success) {
        toast.success("Asignación desactivada correctamente")
        await fetchAssignments() // Refresh list
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al desactivar la asignación"
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const getUserAssignments = async (userId) => {
    try {
      const response = await authStore.apiCall(`/assignments/user/${userId}`, "GET")
      return response.success ? response.data : []
    } catch (error) {
      toast.error("Error al cargar las asignaciones del usuario")
      console.error("Error fetching user assignments:", error)
      return []
    }
  }

  const getVehicleAssignments = async (vehicleId) => {
    try {
      const response = await authStore.apiCall(`/assignments/vehicle/${vehicleId}`, "GET")
      return response.success ? response.data : []
    } catch (error) {
      toast.error("Error al cargar las asignaciones del vehículo")
      console.error("Error fetching vehicle assignments:", error)
      return []
    }
  }

  return {
    // State
    assignments,
    loading,
    pagination,

    // Computed
    activeAssignments,
    inactiveAssignments,

    // Actions
    fetchAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    deactivateAssignment,
    getUserAssignments,
    getVehicleAssignments,
  }
})

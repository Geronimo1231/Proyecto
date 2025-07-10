import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useAuthStore } from "./auth"
import { toast } from "vue3-toastify"

export const useUsersStore = defineStore("users", () => {
  const users = ref([])
  const loading = ref(false)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  const authStore = useAuthStore()

  // Computed
  const adminUsers = computed(() => users.value.filter((user) => user.role === "Admin"))

  const regularUsers = computed(() => users.value.filter((user) => user.role === "User"))

  const activeUsers = computed(() => users.value.filter((user) => user.isActive))

  // Actions
  const fetchUsers = async (params = {}) => {
    try {
      loading.value = true
      const queryParams = new URLSearchParams({
        page: params.page || pagination.value.page,
        limit: params.limit || pagination.value.limit,
        search: params.search || "",
        role: params.role || "",
      }).toString()

      const response = await authStore.apiCall(`/users?${queryParams}`, "GET")

      if (response.success) {
        users.value = response.data.users
        pagination.value = response.data.pagination
      }
    } catch (error) {
      toast.error("Error al cargar los usuarios")
      console.error("Error fetching users:", error)
    } finally {
      loading.value = false
    }
  }

  const getUserById = async (id) => {
    try {
      const response = await authStore.apiCall(`/users/${id}`, "GET")
      return response.success ? response.data : null
    } catch (error) {
      toast.error("Error al cargar el usuario")
      console.error("Error fetching user:", error)
      return null
    }
  }

  const createUser = async (userData) => {
    try {
      loading.value = true
      const response = await authStore.apiCall("/users", "POST", userData)

      if (response.success) {
        toast.success("Usuario creado correctamente")
        await fetchUsers() // Refresh list
        return { success: true, data: response.data }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al crear el usuario"
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id, userData) => {
    try {
      loading.value = true
      const response = await authStore.apiCall(`/users/${id}`, "PUT", userData)

      if (response.success) {
        toast.success("Usuario actualizado correctamente")
        await fetchUsers() // Refresh list
        return { success: true, data: response.data }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al actualizar el usuario"
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id) => {
    try {
      loading.value = true
      const response = await authStore.apiCall(`/users/${id}`, "DELETE")

      if (response.success) {
        toast.success("Usuario eliminado correctamente")
        await fetchUsers() // Refresh list
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al eliminar el usuario"
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const toggleUserStatus = async (id) => {
    try {
      const user = users.value.find((u) => u.id === id)
      if (!user) return { success: false, message: "Usuario no encontrado" }

      const response = await authStore.apiCall(`/users/${id}`, "PUT", {
        ...user,
        isActive: !user.isActive,
      })

      if (response.success) {
        toast.success(`Usuario ${user.isActive ? "desactivado" : "activado"} correctamente`)
        await fetchUsers() // Refresh list
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al cambiar el estado del usuario"
      toast.error(message)
      return { success: false, message }
    }
  }

  const getUsersByRole = async (role) => {
    try {
      const response = await authStore.apiCall(`/users?role=${role}`, "GET")
      return response.success ? response.data.users : []
    } catch (error) {
      toast.error("Error al cargar los usuarios por rol")
      console.error("Error fetching users by role:", error)
      return []
    }
  }

  const searchUsers = async (searchTerm) => {
    try {
      const response = await authStore.apiCall(`/users?search=${searchTerm}`, "GET")
      return response.success ? response.data.users : []
    } catch (error) {
      console.error("Error searching users:", error)
      return []
    }
  }

  return {
    // State
    users,
    loading,
    pagination,

    // Computed
    adminUsers,
    regularUsers,
    activeUsers,

    // Actions
    fetchUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUsersByRole,
    searchUsers,
  }
})

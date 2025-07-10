<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow-md">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Gestión de Asignaciones</h1>
          <router-link
            to="/admin/asignaciones/crear"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nueva Asignación
          </router-link>
        </div>
      </div>

      <!-- Filtros -->
      <div class="p-6 border-b border-gray-200 bg-gray-50">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Buscar por usuario o vehículo..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedSearch"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="fetchAssignments"
            >
              <option value="">Todos</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehículo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Asignación
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                Cargando asignaciones...
              </td>
            </tr>
            <tr v-else-if="assignments.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                No se encontraron asignaciones
              </td>
            </tr>
            <tr v-else v-for="assignment in assignments" :key="assignment.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      class="h-10 w-10 rounded-full object-cover"
                      :src="assignment.user?.photo || '/placeholder.svg?height=40&width=40'"
                      :alt="assignment.user?.firstName"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ assignment.user?.firstName }} {{ assignment.user?.lastName }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ assignment.user?.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ assignment.vehicle?.licensePlate }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ assignment.vehicle?.brand }} {{ assignment.vehicle?.model }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(assignment.assignmentDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    assignment.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ assignment.isActive ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="viewAssignment(assignment)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Ver
                </button>
                <button
                  v-if="assignment.isActive"
                  @click="deactivateAssignment(assignment)"
                  class="text-yellow-600 hover:text-yellow-900"
                >
                  Desactivar
                </button>
                <button
                  @click="deleteAssignment(assignment)"
                  class="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Mostrando {{ (pagination.page - 1) * pagination.limit + 1 }} a 
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 
            de {{ pagination.total }} resultados
          </div>
          <div class="flex space-x-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="changePage(page)"
              :class="[
                'px-3 py-1 text-sm border rounded',
                page === pagination.page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              class="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAssignmentsStore } from '@/stores/assignments'
import { toast } from 'vue3-toastify'

const assignmentsStore = useAssignmentsStore()

const loading = ref(false)
const assignments = ref([])
const pagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0
})

const filters = ref({
  search: '',
  status: ''
})

let searchTimeout = null

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, pagination.value.page - 2)
  const end = Math.min(pagination.value.totalPages, pagination.value.page + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchAssignments()
  }, 500)
}

const fetchAssignments = async () => {
  try {
    loading.value = true
    
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: filters.value.search,
      status: filters.value.status
    }

    const response = await assignmentsStore.fetchAssignments(params)
    
    if (response?.success) {
      assignments.value = response.data.assignments || []
      pagination.value = response.data.pagination || pagination.value
    }
  } catch (error) {
    console.error('Error fetching assignments:', error)
    toast.error('Error al cargar las asignaciones')
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    fetchAssignments()
  }
}

const clearFilters = () => {
  filters.value = {
    search: '',
    status: ''
  }
  pagination.value.page = 1
  fetchAssignments()
}

const viewAssignment = (assignment) => {
  // Implementar vista de detalle
  console.log('Ver asignación:', assignment)
}

const deactivateAssignment = async (assignment) => {
  if (confirm('¿Estás seguro de que deseas desactivar esta asignación?')) {
    try {
      const result = await assignmentsStore.deactivateAssignment(assignment.id)
      if (result?.success) {
        await fetchAssignments()
      }
    } catch (error) {
      console.error('Error deactivating assignment:', error)
    }
  }
}

const deleteAssignment = async (assignment) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta asignación? Esta acción no se puede deshacer.')) {
    try {
      const result = await assignmentsStore.deleteAssignment(assignment.id)
      if (result?.success) {
        await fetchAssignments()
      }
    } catch (error) {
      console.error('Error deleting assignment:', error)
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchAssignments()
})
</script>

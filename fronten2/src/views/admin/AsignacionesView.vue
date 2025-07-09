<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Gestión de Asignaciones
        </h2>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <router-link
          to="/asignaciones/crear"
          class="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" />
          Nueva Asignación
        </router-link>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Usuario</label>
          <input
            v-model="filters.usuario"
            type="text"
            placeholder="Nombre del usuario..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Vehículo</label>
          <input
            v-model="filters.vehiculo"
            type="text"
            placeholder="Matrícula, modelo..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            v-model="filters.estado"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos</option>
            <option value="true">Activas</option>
            <option value="false">Inactivas</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Assignments Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
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
              Observaciones
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="assignment in filteredAssignments" :key="assignment.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <img
                    class="h-10 w-10 rounded-full"
                    :src="assignment.user?.photo || '/placeholder.svg?height=40&width=40'"
                    :alt="assignment.user?.firstName"
                  />
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ assignment.user?.firstName }} {{ assignment.user?.lastName }}
                  </div>
                  <div class="text-sm text-gray-500">{{ assignment.user?.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ assignment.vehicle?.licensePlate }}</div>
              <div class="text-sm text-gray-500">
                {{ assignment.vehicle?.brand }} {{ assignment.vehicle?.model }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(assignment.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="assignment.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ assignment.isActive ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
              {{ assignment.notes || 'Sin observaciones' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <button
                v-if="assignment.isActive"
                @click="unassignVehicle(assignment)"
                class="text-red-600 hover:text-red-900"
              >
                Desasignar
              </button>
              <button
                @click="editAssignment(assignment)"
                class="text-blue-600 hover:text-blue-900"
              >
                Editar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import api from '../../services/api'
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const assignments = ref([])
const loading = ref(false)

const filters = ref({
  usuario: '',
  vehiculo: '',
  estado: ''
})

const filteredAssignments = computed(() => {
  return assignments.value.filter(assignment => {
    const matchesUsuario = !filters.value.usuario || 
      `${assignment.user?.firstName} ${assignment.user?.lastName}`.toLowerCase().includes(filters.value.usuario.toLowerCase())
    
    const matchesVehiculo = !filters.value.vehiculo || 
      assignment.vehicle?.licensePlate.toLowerCase().includes(filters.value.vehiculo.toLowerCase()) ||
      assignment.vehicle?.model.toLowerCase().includes(filters.value.vehiculo.toLowerCase())
    
    const matchesEstado = filters.value.estado === '' || 
      assignment.isActive.toString() === filters.value.estado
    
    return matchesUsuario && matchesVehiculo && matchesEstado
  })
})

const fetchData = async () => {
  try {
    loading.value = true
    const response = await api.get('/assignments')
    assignments.value = response.data.data || []
  } catch (error) {
    console.error('Error al cargar los datos:', error)
    toast.error('Error al cargar los datos')
  } finally {
    loading.value = false
  }
}

const unassignVehicle = async (assignment) => {
  if (confirm(`¿Estás seguro de desasignar el vehículo ${assignment.vehicle?.licensePlate}?`)) {
    try {
      await api.patch(`/assignments/${assignment.id}/unassign`)
      toast.success('Vehículo desasignado correctamente')
      await fetchData()
    } catch (error) {
      toast.error('Error al desasignar el vehículo')
    }
  }
}

const editAssignment = (assignment) => {
  console.log('Editar asignación:', assignment)
}

const resetFilters = () => {
  filters.value = {
    usuario: '',
    vehiculo: '',
    estado: ''
  }
}

const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es })
}

onMounted(() => {
  fetchData()
})
</script>

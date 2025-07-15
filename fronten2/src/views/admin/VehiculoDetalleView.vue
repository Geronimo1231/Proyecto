<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <div>
                <router-link to="/admin/vehiculos" class="text-gray-400 hover:text-gray-500">
                  <TruckIcon class="flex-shrink-0 h-5 w-5" />
                  <span class="sr-only">Vehículos</span>
                </router-link>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <ChevronRightIcon class="flex-shrink-0 h-5 w-5 text-gray-400" />
                <span class="ml-4 text-sm font-medium text-gray-500">Detalles del Vehículo</span>
              </div>
            </li>
          </ol>
        </nav>
        <h2 class="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {{ vehicle?.licensePlate || 'Cargando...' }}
        </h2>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0 space-x-3">
        <router-link
          :to="`/admin/vehiculos/editar/${vehicleId}`"
          class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <PencilIcon class="-ml-0.5 mr-1.5 h-5 w-5" />
          Editar
        </router-link>
        <button
          @click="deleteVehicle"
          class="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
        >
          <TrashIcon class="-ml-0.5 mr-1.5 h-5 w-5" />
          Eliminar
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="vehicle" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Información Principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Detalles del Vehículo -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Información del Vehículo</h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Matrícula</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ vehicle.licensePlate || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Marca</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ vehicle.brand || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Modelo</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ vehicle.model || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Año</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ vehicle.year || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Color</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ vehicle.color || 'No especificado' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Tipo</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ vehicle.type || 'No especificado' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Kilometraje</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ vehicle.mileage || 0 }} km</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Estado</dt>
                <dd class="mt-1">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="getStatusClass(vehicle.status)"
                  >
                    {{ getStatusText(vehicle.status) }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Número de Motor</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ vehicle.engineNumber || 'No especificado' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Número de Chasis</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ vehicle.chassisNumber || 'No especificado' }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Fecha de Registro</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(vehicle.createdAt) }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Historial de Asignaciones -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Historial de Asignaciones</h3>
            <div class="flow-root">
              <ul class="-mb-8">
                <li v-for="(assignment, index) in assignments" :key="assignment.id" class="relative pb-8">
                  <div v-if="index !== assignments.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
                  <div class="relative flex space-x-3">
                    <div>
                      <span
                        class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                        :class="assignment.isActive ? 'bg-green-500' : 'bg-gray-400'"
                      >
                        <UserIcon class="h-4 w-4 text-white" />
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-500">
                          {{ assignment.isActive ? 'Asignado a' : 'Fue asignado a' }}
                          <span class="font-medium text-gray-900">
                            {{ getUserName(assignment) }}
                          </span>
                        </p>
                        <p v-if="assignment.notes" class="mt-1 text-sm text-gray-500">{{ assignment.notes }}</p>
                      </div>
                      <div class="text-right text-sm whitespace-nowrap text-gray-500">
                        <time>{{ formatDate(assignment.assignmentDate || assignment.createdAt) }}</time>
                        <p v-if="!assignment.isActive && assignment.unassignmentDate">
                          Hasta: {{ formatDate(assignment.unassignmentDate) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            
            <div v-if="assignments.length === 0" class="text-center py-6">
              <UserIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">Sin asignaciones</h3>
              <p class="mt-1 text-sm text-gray-500">Este vehículo no ha sido asignado a ningún usuario.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Imagen del Vehículo -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Imagen del Vehículo</h3>
            <div class="aspect-w-16 aspect-h-9">
              <img
                :src="vehicle.image || '/placeholder.svg?height=200&width=300'"
                :alt="vehicle.licensePlate"
                class="w-full h-48 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        <!-- Asignación Actual -->
        <div v-if="currentAssignment" class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Asignación Actual</h3>
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <img
                  class="h-10 w-10 rounded-full"
                  :src="getUserPhoto(currentAssignment)"
                  :alt="getUserName(currentAssignment)"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900">
                  {{ getUserName(currentAssignment) }}
                </p>
                <p class="text-sm text-gray-500">{{ getUserEmail(currentAssignment) }}</p>
                <p class="text-xs text-gray-400">
                  Desde: {{ formatDate(currentAssignment.assignmentDate || currentAssignment.createdAt) }}
                </p>
              </div>
            </div>
            <div class="mt-4">
              <button
                @click="unassignVehicle"
                class="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
              >
                Desasignar Vehículo
              </button>
            </div>
          </div>
        </div>

        <!-- Acciones Rápidas -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
            <div class="space-y-3">
              <router-link
                :to="`/admin/vehiculos/editar/${vehicleId}`"
                class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 block text-center"
              >
                Editar Información
              </router-link>
              <button
                v-if="!currentAssignment"
                @click="showAssignModal = true"
                class="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
              >
                Asignar a Usuario
              </button>
              <router-link
                :to="`/admin/mapa?vehiculo=${vehicleId}`"
                class="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 block text-center"
              >
                Ver en Mapa
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Modal -->
    <div v-if="showAssignModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="assignVehicle">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Asignar Vehículo</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
                  <select
                    v-model="assignForm.userId"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Seleccionar usuario</option>
                    <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                      {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    v-model="assignForm.notes"
                    rows="3"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Observaciones sobre la asignación..."
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                :disabled="assignLoading"
                class="w-full inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50"
              >
                {{ assignLoading ? 'Asignando...' : 'Asignar' }}
              </button>
              <button
                type="button"
                @click="showAssignModal = false"
                class="mt-3 w-full inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  TruckIcon, 
  ChevronRightIcon, 
  PencilIcon, 
  TrashIcon, 
  UserIcon 
} from '@heroicons/vue/24/outline'
import api from '../../services/api'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()

const vehicleId = route.params.id
const vehicle = ref(null)
const assignments = ref([])
const availableUsers = ref([])
const loading = ref(true)
const showAssignModal = ref(false)
const assignLoading = ref(false)

const assignForm = ref({
  userId: '',
  notes: ''
})

const currentAssignment = computed(() => {
  return assignments.value.find(a => a.isActive)
})

const fetchVehicleDetails = async () => {
  try {
    loading.value = true
    
    // Cargar datos del vehículo
    const vehicleResponse = await api.get(`/vehicles/${vehicleId}`)
    if (vehicleResponse.data.success) {
      vehicle.value = vehicleResponse.data.data
    } else {
      vehicle.value = vehicleResponse.data.data || vehicleResponse.data
    }
    
    // Cargar asignaciones
    try {
      const assignmentsResponse = await api.get(`/assignments?vehicleId=${vehicleId}`)
      assignments.value = assignmentsResponse.data.data || []
    } catch (error) {
      console.warn('Error loading assignments:', error)
      assignments.value = []
    }
    
    // Cargar usuarios disponibles
    try {
      const usersResponse = await api.get('/users?role=User&isActive=true')
      availableUsers.value = usersResponse.data.data || []
    } catch (error) {
      console.warn('Error loading users:', error)
      availableUsers.value = []
    }
    
  } catch (error) {
    console.error('Error al cargar detalles:', error)
    toast.error('Error al cargar los detalles del vehículo')
    router.push('/admin/vehiculos')
  } finally {
    loading.value = false
  }
}

const assignVehicle = async () => {
  try {
    assignLoading.value = true
    await api.post('/assignments', {
      userId: assignForm.value.userId,
      vehicleId: vehicleId,
      notes: assignForm.value.notes
    })
    
    toast.success('Vehículo asignado correctamente')
    showAssignModal.value = false
    assignForm.value = { userId: '', notes: '' }
    await fetchVehicleDetails()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al asignar el vehículo')
  } finally {
    assignLoading.value = false
  }
}

const unassignVehicle = async () => {
  if (!currentAssignment.value) return
  
  if (confirm('¿Estás seguro de desasignar este vehículo?')) {
    try {
      await api.patch(`/assignments/${currentAssignment.value.id}/unassign`)
      toast.success('Vehículo desasignado correctamente')
      await fetchVehicleDetails()
    } catch (error) {
      toast.error('Error al desasignar el vehículo')
    }
  }
}

const deleteVehicle = async () => {
  if (confirm(`¿Estás seguro de eliminar el vehículo ${vehicle.value?.licensePlate}?`)) {
    try {
      await api.delete(`/vehicles/${vehicleId}`)
      toast.success('Vehículo eliminado correctamente')
      router.push('/admin/vehiculos')
    } catch (error) {
      toast.error('Error al eliminar el vehículo')
    }
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800'
    case 'assigned': return 'bg-blue-100 text-blue-800'
    case 'maintenance': return 'bg-yellow-100 text-yellow-800'
    case 'out_of_service': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'available': return 'Disponible'
    case 'assigned': return 'Asignado'
    case 'maintenance': return 'Mantenimiento'
    case 'out_of_service': return 'Fuera de Servicio'
    default: return status || 'Sin estado'
  }
}

// Helper functions para manejar diferentes estructuras de datos
const getUserName = (assignment) => {
  if (assignment.User) {
    return `${assignment.User.firstName || ''} ${assignment.User.lastName || ''}`.trim()
  }
  if (assignment.user) {
    return `${assignment.user.firstName || ''} ${assignment.user.lastName || ''}`.trim()
  }
  return 'Usuario no disponible'
}

const getUserEmail = (assignment) => {
  if (assignment.User) {
    return assignment.User.email || ''
  }
  if (assignment.user) {
    return assignment.user.email || ''
  }
  return ''
}

const getUserPhoto = (assignment) => {
  const photo = assignment.User?.photo || assignment.user?.photo
  return photo || '/placeholder.svg?height=40&width=40'
}

const formatDate = (date) => {
  if (!date) return 'No disponible'
  try {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}

onMounted(() => {
  fetchVehicleDetails()
})
</script>

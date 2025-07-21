<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <div>
                <router-link to="/admin/asignaciones" class="text-gray-400 hover:text-gray-500">
                  <ClipboardDocumentListIcon class="flex-shrink-0 h-5 w-5" />
                  <span class="sr-only">Asignaciones</span>
                </router-link>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <ChevronRightIcon class="flex-shrink-0 h-5 w-5 text-gray-400" />
                <span class="ml-4 text-sm font-medium text-gray-500">Detalle de Asignación</span>
              </div>
            </li>
          </ol>
        </nav>
        <h2 class="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Detalle de Asignación #{{ assignmentId }}
        </h2>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error al cargar la asignación</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Información Principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Información de la Asignación -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Información de la Asignación</h3>
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="getStatusClass(assignment?.isActive)"
              >
                {{ assignment?.isActive ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
            
            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">ID de Asignación</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ assignment?.id || 'N/A' }}</dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Fecha de Asignación</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ assignment?.assignedAt ? formatDate(assignment.assignedAt) : 'N/A' }}
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Fecha de Finalización</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ assignment?.unassignedAt ? formatDate(assignment.unassignedAt) : 'Sin finalizar' }}
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Estado</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ assignment?.isActive ? 'Activa' : 'Finalizada' }}
                </dd>
              </div>
              
              <div class="sm:col-span-2" v-if="assignment?.notes">
                <dt class="text-sm font-medium text-gray-500">Notas</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ assignment.notes }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Información del Usuario -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Usuario Asignado</h3>
            
            <div v-if="assignment?.user" class="flex items-start space-x-4">
              <img
                :src="assignment.user.photo || '/placeholder.svg?height=80&width=80'"
                :alt="assignment.user.firstName"
                class="w-16 h-16 rounded-full object-cover"
              />
              <div class="flex-1">
                <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Nombre Completo</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ assignment.user.firstName }} {{ assignment.user.lastName }}
                    </dd>
                  </div>
                  
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Email</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ assignment.user.email }}</dd>
                  </div>
                  
                  <div v-if="assignment.user.phone">
                    <dt class="text-sm font-medium text-gray-500">Teléfono</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ assignment.user.phone }}</dd>
                  </div>
                  
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Rol</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ assignment.user.role }}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div v-else class="text-center py-4">
              <p class="text-sm text-gray-500">No hay información del usuario disponible</p>
            </div>
          </div>
        </div>

        <!-- Información del Vehículo -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Vehículo Asignado</h3>
            
            <div v-if="assignment?.vehicle" class="flex items-start space-x-4">
              <img
                :src="assignment.vehicle.image || '/placeholder.svg?height=80&width=120'"
                :alt="assignment.vehicle.licensePlate"
                class="w-20 h-16 rounded object-cover"
              />
              <div class="flex-1">
                <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Matrícula</dt>
                    <dd class="mt-1 text-sm text-gray-900 font-semibold">{{ assignment.vehicle.licensePlate }}</dd>
                  </div>
                  
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Marca y Modelo</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ assignment.vehicle.brand }} {{ assignment.vehicle.model }}
                    </dd>
                  </div>
                  
                  <div v-if="assignment.vehicle.year">
                    <dt class="text-sm font-medium text-gray-500">Año</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ assignment.vehicle.year }}</dd>
                  </div>
                  
                  <div v-if="assignment.vehicle.color">
                    <dt class="text-sm font-medium text-gray-500">Color</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ assignment.vehicle.color }}</dd>
                  </div>
                  
                  <div v-if="assignment.vehicle.type">
                    <dt class="text-sm font-medium text-gray-500">Tipo</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ assignment.vehicle.type }}</dd>
                  </div>
                  
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Estado</dt>
                    <dd class="mt-1">
                      <span
                        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        :class="getVehicleStatusClass(assignment.vehicle.status)"
                      >
                        {{ getVehicleStatusText(assignment.vehicle.status) }}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div v-else class="text-center py-4">
              <p class="text-sm text-gray-500">No hay información del vehículo disponible</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Acciones -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Acciones</h3>
            <div class="space-y-3">
              <router-link
                to="/admin/asignaciones"
                class="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 block text-center"
              >
                Volver a Asignaciones
              </router-link>
              
              <button
                v-if="assignment?.isActive"
                @click="toggleAssignmentStatus"
                :disabled="updating"
                class="w-full bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
              >
                {{ updating ? 'Procesando...' : 'Desactivar Asignación' }}
              </button>
              
              <button
                v-else
                @click="toggleAssignmentStatus"
                :disabled="updating"
                class="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {{ updating ? 'Procesando...' : 'Reactivar Asignación' }}
              </button>
              
              <button
                @click="deleteAssignment"
                :disabled="deleting"
                class="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {{ deleting ? 'Eliminando...' : 'Eliminar Asignación' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Estadísticas</h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">Duración</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ getDuration() }}
                </dd>
              </div>
              
              <div v-if="assignment?.vehicle?.mileage">
                <dt class="text-sm font-medium text-gray-500">Kilometraje</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ assignment.vehicle.mileage.toLocaleString() }} km
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ClipboardDocumentListIcon, 
  ChevronRightIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/vue/24/outline'
import api from '../../services/api'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()

const assignmentId = route.params.id
const assignment = ref(null)
const loading = ref(true)
const updating = ref(false)
const deleting = ref(false)
const error = ref(null)

const fetchAssignment = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await api.get(`/assignments/${assignmentId}`)
    
    if (response.data.success) {
      assignment.value = response.data.data
    } else {
      assignment.value = response.data.data || response.data
    }
    
    if (!assignment.value) {
      throw new Error('No se encontró la asignación')
    }
  } catch (err) {
    console.error('Error al cargar asignación:', err)
    error.value = err.response?.data?.message || err.message || 'Error al cargar la asignación'
  } finally {
    loading.value = false
  }
}

const toggleAssignmentStatus = async () => {
  if (!confirm(`¿Estás seguro de ${assignment.value.isActive ? 'desactivar' : 'reactivar'} esta asignación?`)) {
    return
  }
  
  try {
    updating.value = true
    
    const response = await api.patch(`/assignments/${assignmentId}/toggle-status`)
    
    if (response.data.success) {
      assignment.value.isActive = !assignment.value.isActive
      toast.success(`Asignación ${assignment.value.isActive ? 'reactivada' : 'desactivada'} correctamente`)
    } else {
      throw new Error(response.data.message || 'Error al actualizar el estado')
    }
  } catch (err) {
    console.error('Error al actualizar estado:', err)
    toast.error(err.response?.data?.message || 'Error al actualizar el estado de la asignación')
  } finally {
    updating.value = false
  }
}

const deleteAssignment = async () => {
  if (!confirm('¿Estás seguro de eliminar esta asignación? Esta acción no se puede deshacer.')) {
    return
  }
  
  try {
    deleting.value = true
    
    await api.delete(`/assignments/${assignmentId}`)
    
    toast.success('Asignación eliminada correctamente')
    router.push('/admin/asignaciones')
  } catch (err) {
    console.error('Error al eliminar asignación:', err)
    toast.error(err.response?.data?.message || 'Error al eliminar la asignación')
  } finally {
    deleting.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

const getDuration = () => {
  if (!assignment.value?.assignedAt) return 'N/A'
  
  const startDate = new Date(assignment.value.assignedAt)
  const endDate = assignment.value.unassignedAt ? new Date(assignment.value.unassignedAt) : new Date()
  
  const diffTime = Math.abs(endDate - startDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 día'
  if (diffDays < 30) return `${diffDays} días`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`
  return `${Math.floor(diffDays / 365)} años`
}

const getStatusClass = (isActive) => {
  return isActive 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800'
}

const getVehicleStatusClass = (status) => {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800'
    case 'assigned': return 'bg-blue-100 text-blue-800'
    case 'maintenance': return 'bg-yellow-100 text-yellow-800'
    case 'out_of_service': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getVehicleStatusText = (status) => {
  switch (status) {
    case 'available': return 'Disponible'
    case 'assigned': return 'Asignado'
    case 'maintenance': return 'Mantenimiento'
    case 'out_of_service': return 'Fuera de Servicio'
    default: return status || 'Desconocido'
  }
}

onMounted(() => {
  fetchAssignment()
})
</script>

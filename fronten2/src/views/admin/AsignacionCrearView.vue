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
                <span class="ml-4 text-sm font-medium text-gray-500">Nueva Asignación</span>
              </div>
            </li>
          </ol>
        </nav>
        <h2 class="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Nueva Asignación de Vehículo
        </h2>
      </div>
    </div>

    <form @submit.prevent="createAssignment" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Formulario Principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Selección de Usuario y Vehículo -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Información de Asignación</h3>
              
              <div class="space-y-6">
                <!-- Selección de Usuario -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
                  <select
                    v-model="form.userId"
                    required
                    @change="onUserChange"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Seleccionar usuario</option>
                    <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                      {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
                    </option>
                  </select>
                  
                  <!-- Información del usuario seleccionado -->
                  <div v-if="selectedUser" class="mt-3 p-3 bg-blue-50 rounded-md">
                    <div class="flex items-center space-x-3">
                      <img
                        class="h-10 w-10 rounded-full"
                        :src="selectedUser.photo || '/placeholder.svg?height=40&width=40'"
                        :alt="selectedUser.firstName"
                      />
                      <div>
                        <p class="text-sm font-medium text-blue-900">
                          {{ selectedUser.firstName }} {{ selectedUser.lastName }}
                        </p>
                        <p class="text-sm text-blue-700">{{ selectedUser.email }}</p>
                        <p class="text-xs text-blue-600">
                          Vehículos asignados: {{ selectedUser.activeAssignments || 0 }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Selección de Vehículo -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Vehículo *</label>
                  <select
                    v-model="form.vehicleId"
                    required
                    @change="onVehicleChange"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Seleccionar vehículo</option>
                    <option v-for="vehicle in availableVehicles" :key="vehicle.id" :value="vehicle.id">
                      {{ vehicle.licensePlate }} - {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }})
                    </option>
                  </select>
                  
                  <!-- Información del vehículo seleccionado -->
                  <div v-if="selectedVehicle" class="mt-3 p-3 bg-green-50 rounded-md">
                    <div class="flex items-center space-x-3">
                      <img
                        class="h-16 w-16 rounded-lg object-cover"
                        :src="selectedVehicle.image || '/placeholder.svg?height=64&width=64'"
                        :alt="selectedVehicle.licensePlate"
                      />
                      <div>
                        <p class="text-sm font-medium text-green-900">
                          {{ selectedVehicle.licensePlate }}
                        </p>
                        <p class="text-sm text-green-700">
                          {{ selectedVehicle.brand }} {{ selectedVehicle.model }} {{ selectedVehicle.year }}
                        </p>
                        <p class="text-xs text-green-600">
                          Color: {{ selectedVehicle.color || 'No especificado' }} | 
                          Kilometraje: {{ selectedVehicle.mileage || 0 }} km
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Observaciones -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    v-model="form.notes"
                    rows="4"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Observaciones sobre la asignación (opcional)..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Resumen de Asignación -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Resumen</h3>
              
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Usuario</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {{ selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'No seleccionado' }}
                  </dd>
                </div>
                
                <div>
                  <dt class="text-sm font-medium text-gray-500">Vehículo</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {{ selectedVehicle ? `${selectedVehicle.licensePlate} - ${selectedVehicle.brand} ${selectedVehicle.model}` : 'No seleccionado' }}
                  </dd>
                </div>
                
                <div>
                  <dt class="text-sm font-medium text-gray-500">Fecha de Asignación</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(new Date()) }}</dd>
                </div>
                
                <div>
                  <dt class="text-sm font-medium text-gray-500">Estado</dt>
                  <dd class="mt-1">
                    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                      Activa
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Acciones -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Acciones</h3>
              <div class="space-y-3">
                <button
                  type="submit"
                  :disabled="saving || !isFormValid"
                  class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {{ saving ? 'Creando Asignación...' : 'Crear Asignación' }}
                </button>
                
                <router-link
                  to="/admin/asignaciones"
                  class="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 block text-center"
                >
                  Cancelar
                </router-link>
              </div>
            </div>
          </div>

          <!-- Estadísticas -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Estadísticas</h3>
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Usuarios disponibles:</span>
                  <span class="font-medium">{{ availableUsers.length }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Vehículos disponibles:</span>
                  <span class="font-medium">{{ availableVehicles.length }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Asignaciones activas:</span>
                  <span class="font-medium">{{ totalActiveAssignments }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ClipboardDocumentListIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import api from '../../services/api'
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const router = useRouter()

const availableUsers = ref([])
const availableVehicles = ref([])
const totalActiveAssignments = ref(0)
const saving = ref(false)

const form = ref({
  userId: '',
  vehicleId: '',
  notes: ''
})

const selectedUser = computed(() => {
  return availableUsers.value.find(user => user.id == form.value.userId)
})

const selectedVehicle = computed(() => {
  return availableVehicles.value.find(vehicle => vehicle.id == form.value.vehicleId)
})

const isFormValid = computed(() => {
  return form.value.userId && form.value.vehicleId
})

const fetchData = async () => {
  try {
    const [usersRes, vehiclesRes, statsRes] = await Promise.all([
      api.get('/users?role=User'),
      api.get('/vehicles?status=available'),
      api.get('/assignments?status=true')
    ])
    
    availableUsers.value = usersRes.data.data || []
    availableVehicles.value = vehiclesRes.data.data || []
    totalActiveAssignments.value = statsRes.data.pagination?.total || 0
  } catch (error) {
    console.error('Error al cargar datos:', error)
    toast.error('Error al cargar los datos')
  }
}

const onUserChange = () => {
  // Aquí podrías cargar información adicional del usuario si es necesario
}

const onVehicleChange = () => {
  // Aquí podrías cargar información adicional del vehículo si es necesario
}

const createAssignment = async () => {
  if (!isFormValid.value) {
    toast.error('Por favor selecciona un usuario y un vehículo')
    return
  }

  try {
    saving.value = true
    
    const response = await api.post('/assignments', {
      userId: form.value.userId,
      vehicleId: form.value.vehicleId,
      notes: form.value.notes
    })
    
    toast.success('Asignación creada correctamente')
    router.push('/admin/asignaciones')
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al crear la asignación')
  } finally {
    saving.value = false
  }
}

const formatDate = (date) => {
  return format(date, 'dd/MM/yyyy HH:mm', { locale: es })
}

onMounted(() => {
  fetchData()
})
</script>

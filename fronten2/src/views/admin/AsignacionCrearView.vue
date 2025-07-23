<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Nueva Asignación</h1>
          <button
            @click="handleCancel"
            class="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>

        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Selección de Usuario -->
          <div>
            <label for="userId" class="block text-sm font-medium text-gray-700 mb-2">
              Usuario *
            </label>
            <select
              id="userId"
              v-model="form.userId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar usuario...</option>
              <option
                v-for="user in availableUsers"
                :key="user.id"
                :value="user.id"
              >
                {{ user.firstName }} {{ user.lastName }} - {{ user.email }}
              </option>
            </select>
            <p v-if="availableUsers.length === 0" class="mt-1 text-sm text-gray-500">
              No hay usuarios disponibles para asignar
            </p>
          </div>

          <!-- Selección de Vehículo -->
          <div>
            <label for="vehicleId" class="block text-sm font-medium text-gray-700 mb-2">
              Vehículo *
            </label>
            <select
              id="vehicleId"
              v-model="form.vehicleId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar vehículo...</option>
              <option
                v-for="vehicle in availableVehicles"
                :key="vehicle.id"
                :value="vehicle.id"
              >
                {{ vehicle.licensePlate }} - {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }})
              </option>
            </select>
            <p v-if="availableVehicles.length === 0" class="mt-1 text-sm text-gray-500">
              No hay vehículos disponibles para asignar
            </p>
          </div>

          <!-- Notas -->
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Observaciones sobre la asignación..."
            ></textarea>
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="handleCancel"
              class="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="submitting || !form.userId || !form.vehicleId"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ submitting ? 'Creando...' : 'Crear Asignación' }}
            </button>
          </div>
        </form>

        <!-- Debug Info -->
        <div v-if="debugMode" class="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 class="font-medium text-gray-900 mb-2">Debug Info:</h3>
          <p class="text-sm text-gray-600">Usuarios disponibles: {{ availableUsers.length }}</p>
          <p class="text-sm text-gray-600">Vehículos disponibles: {{ availableVehicles.length }}</p>
          <pre class="text-xs text-gray-500 mt-2">{{ JSON.stringify({ availableUsers, availableVehicles }, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAssignmentsStore } from '@/stores/assignments'
import { useUsersStore } from '@/stores/users'
import { useVehiclesStore } from '@/stores/vehicles'
import { toast } from 'vue3-toastify'
import api from '@/services/api'

const router = useRouter()
const assignmentsStore = useAssignmentsStore()
const usersStore = useUsersStore()
const vehiclesStore = useVehiclesStore()

const loading = ref(true)
const submitting = ref(false)
const debugMode = ref(false) // Cambiar a true para ver debug info
const availableUsers = ref([])
const availableVehicles = ref([])

const form = ref({
  userId: '',
  vehicleId: '',
  notes: ''
})

const loadData = async () => {
  try {
    loading.value = true
    
    // Cargar usuarios activos sin asignaciones activas
    console.log('Cargando usuarios...')
    const usersResponse = await api.get('/users?role=User&isActive=true')
    console.log('Respuesta usuarios:', usersResponse.data)
    
    if (usersResponse.data.success) {
      // Filtrar usuarios que no tengan asignaciones activas
      const allUsers = usersResponse.data.data.users || usersResponse.data.data || []
      availableUsers.value = allUsers
    } else {
      availableUsers.value = []
    }

    // Cargar vehículos disponibles
    console.log('Cargando vehículos...')
    const vehiclesResponse = await api.get('/vehicles?status=available')
    console.log('Respuesta vehículos:', vehiclesResponse.data)
    
    if (vehiclesResponse.data.success) {
      availableVehicles.value = vehiclesResponse.data.data.vehicles || vehiclesResponse.data.data || []
    } else {
      availableVehicles.value = []
    }
    
    console.log('Usuarios disponibles:', availableUsers.value.length)
    console.log('Vehículos disponibles:', availableVehicles.value.length)
    
  } catch (error) {
    console.error('Error loading data:', error)
    toast.error('Error al cargar los datos')
    availableUsers.value = []
    availableVehicles.value = []
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    
    const assignmentData = {
      userId: parseInt(form.value.userId),
      vehicleId: parseInt(form.value.vehicleId),
      notes: form.value.notes.trim() || null
    }

    console.log('Creando asignación:', assignmentData)
    
    const response = await api.post('/assignments', assignmentData)
    
    if (response.data.success) {
      toast.success('Asignación creada correctamente')
      router.push('/admin/asignaciones')
    } else {
      toast.error(response.data.message || 'Error al crear la asignación')
    }
  } catch (error) {
    console.error('Error creating assignment:', error)
    const message = error.response?.data?.message || 'Error al crear la asignación'
    toast.error(message)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.push('/admin/asignaciones')
}

onMounted(() => {
  loadData()
})
</script>

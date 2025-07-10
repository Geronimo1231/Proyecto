<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Nueva Asignación</h1>
          <button
            @click="$router.push('/admin/asignaciones')"
            class="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Selección de Usuario -->
          <div>
            <label for="userId" class="block text-sm font-medium text-gray-700 mb-2">
              Usuario
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
          </div>

          <!-- Selección de Vehículo -->
          <div>
            <label for="vehicleId" class="block text-sm font-medium text-gray-700 mb-2">
              Vehículo
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
                {{ vehicle.licensePlate }} - {{ vehicle.brand }} {{ vehicle.model }}
              </option>
            </select>
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
              @click="$router.push('/admin/asignaciones')"
              class="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading || !form.userId || !form.vehicleId"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ loading ? 'Creando...' : 'Crear Asignación' }}
            </button>
          </div>
        </form>
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

const router = useRouter()
const assignmentsStore = useAssignmentsStore()
const usersStore = useUsersStore()
const vehiclesStore = useVehiclesStore()

const loading = ref(false)
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
    
    // Cargar usuarios activos sin asignaciones
    const usersResponse = await usersStore.fetchUsers({ role: 'User' })
    if (usersResponse?.success) {
      availableUsers.value = usersResponse.data.filter(user => 
        user.isActive && !user.assignments?.some(assignment => assignment.isActive)
      )
    }

    // Cargar vehículos disponibles
    const vehiclesResponse = await vehiclesStore.getAvailableVehicles()
    availableVehicles.value = vehiclesResponse || []
    
  } catch (error) {
    console.error('Error loading data:', error)
    toast.error('Error al cargar los datos')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    
    const result = await assignmentsStore.createAssignment({
      userId: parseInt(form.value.userId),
      vehicleId: parseInt(form.value.vehicleId),
      notes: form.value.notes.trim() || null
    })

    if (result?.success) {
      toast.success('Asignación creada correctamente')
      router.push('/admin/asignaciones')
    } else {
      toast.error(result?.message || 'Error al crear la asignación')
    }
  } catch (error) {
    console.error('Error creating assignment:', error)
    toast.error('Error al crear la asignación')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

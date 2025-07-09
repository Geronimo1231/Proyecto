<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900">Crear Nueva Asignación</h3>
          <p class="mt-1 text-sm text-gray-600">
            Asigne un vehículo disponible a un usuario del sistema.
          </p>
        </div>

        <form @submit.prevent="createAssignment" class="space-y-6">
          <div>
            <label for="userId" class="block text-sm font-medium text-gray-700">
              Usuario *
            </label>
            <select
              id="userId"
              v-model="form.userId"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Seleccionar usuario</option>
              <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
              </option>
            </select>
          </div>

          <div>
            <label for="vehicleId" class="block text-sm font-medium text-gray-700">
              Vehículo *
            </label>
            <select
              id="vehicleId"
              v-model="form.vehicleId"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Seleccionar vehículo</option>
              <option v-for="vehicle in availableVehicles" :key="vehicle.id" :value="vehicle.id">
                {{ vehicle.licensePlate }} - {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }})
              </option>
            </select>
          </div>

          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700">
              Observaciones
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="4"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Observaciones sobre la asignación..."
            ></textarea>
          </div>

          <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">
                  Información importante
                </h3>
                <div class="mt-2 text-sm text-yellow-700">
                  <p>
                    Al crear esta asignación, el vehículo seleccionado cambiará su estado a "Asignado" 
                    y no estará disponible para otras asignaciones hasta que sea liberado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <router-link
              to="/admin/asignaciones"
              class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancelar
            </router-link>
            <button
              type="submit"
              :disabled="loading"
              class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
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
import api from '../../services/api'
import { toast } from 'vue3-toastify'

const router = useRouter()
const loading = ref(false)
const availableUsers = ref([])
const availableVehicles = ref([])

const form = ref({
  userId: '',
  vehicleId: '',
  notes: ''
})

const fetchData = async () => {
  try {
    const [usersRes, vehiclesRes] = await Promise.all([
      api.get('/users?role=User'),
      api.get('/vehicles?status=available')
    ])
    
    availableUsers.value = usersRes.data.data?.users || usersRes.data.data || []
    availableVehicles.value = vehiclesRes.data.data?.vehicles || vehiclesRes.data.data || []
  } catch (error) {
    console.error('Error al cargar datos:', error)
    toast.error('Error al cargar los datos')
  }
}

const createAssignment = async () => {
  try {
    loading.value = true
    
    await api.post('/assignments', form.value)
    
    toast.success('Asignación creada correctamente')
    router.push('/admin/asignaciones')
  } catch (error) {
    console.error('Error al crear asignación:', error)
    toast.error(error.response?.data?.message || 'Error al crear la asignación')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

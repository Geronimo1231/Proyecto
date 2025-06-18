<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Mi Dashboard
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Bienvenido, {{ authStore.user?.nombre }} {{ authStore.user?.apellido }}
        </p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <TruckIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Mis Vehículos</dt>
                <dd class="text-lg font-medium text-gray-900">{{ userStats.vehiculos_asignados || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <MapPinIcon class="h-6 w-6 text-green-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Ubicaciones Activas</dt>
                <dd class="text-lg font-medium text-gray-900">{{ userStats.ubicaciones_activas || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ClockIcon class="h-6 w-6 text-blue-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Última Actualización</dt>
                <dd class="text-sm font-medium text-gray-900">
                  {{ userStats.ultima_actualizacion ? formatDate(userStats.ultima_actualizacion) : 'Sin datos' }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- My Vehicles -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Mis Vehículos Asignados</h3>
        
        <div v-if="vehiculos.length === 0" class="text-center py-8">
          <TruckIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No tienes vehículos asignados</h3>
          <p class="mt-1 text-sm text-gray-500">
            Contacta al administrador para que te asigne un vehículo.
          </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="vehiculo in vehiculos"
            :key="vehiculo.id"
            class="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div class="aspect-w-16 aspect-h-9">
              <img
                :src="vehiculo.imagenes?.[0] || '/placeholder.svg?height=200&width=300'"
                :alt="vehiculo.modelo"
                class="w-full h-32 object-cover"
              />
            </div>
            <div class="p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-lg font-semibold text-gray-900">{{ vehiculo.matricula }}</h4>
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                  Asignado
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-1">{{ vehiculo.marca }} {{ vehiculo.modelo }}</p>
              <p class="text-sm text-gray-600 mb-2">Año: {{ vehiculo.año }}</p>
              
              <div v-if="vehiculo.ultima_ubicacion" class="mb-3 p-2 bg-blue-50 rounded">
                <p class="text-xs text-blue-700">
                  <strong>Última ubicación:</strong><br>
                  Lat: {{ vehiculo.ultima_ubicacion.latitud?.toFixed(6) }}<br>
                  Lng: {{ vehiculo.ultima_ubicacion.longitud?.toFixed(6) }}<br>
                  <strong>Actualizado:</strong> {{ formatDate(vehiculo.ultima_ubicacion.timestamp) }}
                </p>
              </div>

              <div class="flex space-x-2">
                <router-link
                  :to="`/user/mapa?vehiculo=${vehiculo.id}`"
                  class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm text-center hover:bg-blue-700"
                >
                  Ver en Mapa
                </router-link>
                <button
                  @click="viewVehicleDetails(vehiculo)"
                  class="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
                >
                  Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Mi Actividad Reciente</h3>
        <div class="flow-root">
          <ul class="-mb-8">
            <li v-for="(activity, index) in recentActivity" :key="activity.id" class="relative pb-8">
              <div v-if="index !== recentActivity.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
              <div class="relative flex space-x-3">
                <div>
                  <span class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                    <MapPinIcon class="h-4 w-4 text-white" />
                  </span>
                </div>
                <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p class="text-sm text-gray-500">{{ activity.description }}</p>
                  </div>
                  <div class="text-right text-sm whitespace-nowrap text-gray-500">
                    {{ formatDate(activity.created_at) }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Vehicle Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Detalles del Vehículo</h3>
            
            <div v-if="selectedVehicle" class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Matrícula</label>
                  <p class="text-sm text-gray-900">{{ selectedVehicle.matricula }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Estado</label>
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                    {{ selectedVehicle.estado }}
                  </span>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Marca</label>
                  <p class="text-sm text-gray-900">{{ selectedVehicle.marca }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Modelo</label>
                  <p class="text-sm text-gray-900">{{ selectedVehicle.modelo }}</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Año</label>
                  <p class="text-sm text-gray-900">{{ selectedVehicle.año }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Color</label>
                  <p class="text-sm text-gray-900">{{ selectedVehicle.color || 'No especificado' }}</p>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Kilometraje</label>
                <p class="text-sm text-gray-900">{{ selectedVehicle.kilometraje?.toLocaleString() || 0 }} km</p>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              @click="showDetailsModal = false"
              class="w-full inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TruckIcon, MapPinIcon, ClockIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const authStore = useAuthStore()
const toast = useToast()

const userStats = ref({})
const vehiculos = ref([])
const recentActivity = ref([])
const showDetailsModal = ref(false)
const selectedVehicle = ref(null)

const fetchUserData = async () => {
  try {
    const [statsRes, vehiculosRes, activityRes] = await Promise.all([
      api.get('/user/stats'),
      api.get('/user/vehiculos'),
      api.get('/user/activity')
    ])
    
    userStats.value = statsRes.data.data
    vehiculos.value = vehiculosRes.data.data
    recentActivity.value = activityRes.data.data
  } catch (error) {
    toast.error('Error al cargar los datos')
  }
}

const viewVehicleDetails = (vehiculo) => {
  selectedVehicle.value = vehiculo
  showDetailsModal.value = true
}

const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es })
}

onMounted(() => {
  fetchUserData()
})
</script>

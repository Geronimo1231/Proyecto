<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Mis Vehículos
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Vehículos asignados a tu cuenta
        </p>
      </div>
    </div>

    <!-- Vehicles Grid -->
    <div v-if="vehiculos.length === 0" class="text-center py-12">
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
        class="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
      >
        <div class="aspect-w-16 aspect-h-9">
          <img
            :src="vehiculo.image || '/placeholder.svg?height=200&width=300'"
            :alt="vehiculo.model"
            class="w-full h-48 object-cover"
          />
        </div>
        <div class="p-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-900">{{ vehiculo.licensePlate }}</h3>
            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
              Asignado
            </span>
          </div>
          
          <div class="space-y-2 mb-4">
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Marca:</span>
              <span class="text-sm text-gray-900">{{ vehiculo.brand }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Modelo:</span>
              <span class="text-sm text-gray-900">{{ vehiculo.model }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Año:</span>
              <span class="text-sm text-gray-900">{{ vehiculo.year }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Tipo:</span>
              <span class="text-sm text-gray-900">{{ vehiculo.type }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Color:</span>
              <span class="text-sm text-gray-900">{{ vehiculo.color || 'No especificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Kilometraje:</span>
              <span class="text-sm text-gray-900">{{ vehiculo.mileage?.toLocaleString() || 0 }} km</span>
            </div>
          </div>
          
          <div v-if="vehiculo.lastLocation" class="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 class="text-xs font-medium text-blue-900 mb-2">Última Ubicación GPS</h4>
            <div class="space-y-1">
              <div class="flex justify-between">
                <span class="text-xs text-blue-700">Latitud:</span>
                <span class="text-xs text-blue-900">{{ vehiculo.lastLocation.latitude?.toFixed(6) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-blue-700">Longitud:</span>
                <span class="text-xs text-blue-900">{{ vehiculo.lastLocation.longitude?.toFixed(6) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-blue-700">Velocidad:</span>
                <span class="text-xs text-blue-900">{{ vehiculo.lastLocation.speed || 0 }} km/h</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-blue-700">Actualizado:</span>
                <span class="text-xs text-blue-900">{{ formatDate(vehiculo.lastLocation.gpsTimestamp) }}</span>
              </div>
            </div>
          </div>

          <div class="flex space-x-2">
            <router-link
              :to="`/user/mapa?vehiculo=${vehiculo.id}`"
              class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm text-center hover:bg-blue-700 transition duration-200"
            >
              Ver en Mapa
            </router-link>
            <button
              @click="viewVehicleDetails(vehiculo)"
              class="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition duration-200"
            >
              Ver Detalles
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Vehicle Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Detalles del Vehículo</h3>
              <button
                @click="showDetailsModal = false"
                class="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>
            
            <div v-if="selectedVehicle" class="space-y-6">
              <!-- Vehicle Image -->
              <div class="text-center">
                <img
                  :src="selectedVehicle.image || '/placeholder.svg?height=300&width=400'"
                  :alt="selectedVehicle.model"
                  class="mx-auto h-48 w-auto rounded-lg shadow-md"
                />
              </div>
              
              <!-- Vehicle Information -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Matrícula</label>
                  <p class="text-sm text-gray-900 font-semibold">{{ selectedVehicle.licensePlate }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Estado</label>
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                    {{ getStatusText(selectedVehicle.status) }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Marca</label>
                  <p class="text-sm text-gray-900">{{ selectedVehicle.brand }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Modelo</label>
                  <p class="text-sm text-gray-900">{{ selectedVehicle.model }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Año</label>
                  <p class="text-sm text-gray-900">{{ selectedVehicle.year }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tipo</label>
                  <p class="text-sm text-gray-900">{{ selectedVehicle.type }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Color</label>
                  <p class="text-sm text-gray-900">{{ selectedVehicle.color || 'No especificado' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Kilometraje</label>
                  <p class="text-sm text-gray-900">{{ selectedVehicle.mileage?.toLocaleString() || 0 }} km</p>
                </div>
              </div>
              
              <!-- Technical Details -->
              <div v-if="selectedVehicle.engineNumber || selectedVehicle.chassisNumber" class="border-t pt-4">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Detalles Técnicos</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div v-if="selectedVehicle.engineNumber">
                    <label class="block text-sm font-medium text-gray-700">Número de Motor</label>
                    <p class="text-sm text-gray-900">{{ selectedVehicle.engineNumber }}</p>
                  </div>
                  <div v-if="selectedVehicle.chassisNumber">
                    <label class="block text-sm font-medium text-gray-700">Número de Chasis</label>
                    <p class="text-sm text-gray-900">{{ selectedVehicle.chassisNumber }}</p>
                  </div>
                </div>
              </div>
              
              <!-- GPS Information -->
              <div v-if="selectedVehicle.lastLocation" class="border-t pt-4">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Información GPS</h4>
                <div class="bg-blue-50 rounded-lg p-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-medium text-blue-700">Latitud</label>
                      <p class="text-sm text-blue-900">{{ selectedVehicle.lastLocation.latitude?.toFixed(6) }}</p>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-blue-700">Longitud</label>
                      <p class="text-sm text-blue-900">{{ selectedVehicle.lastLocation.longitude?.toFixed(6) }}</p>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-blue-700">Velocidad</label>
                      <p class="text-sm text-blue-900">{{ selectedVehicle.lastLocation.speed || 0 }} km/h</p>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-blue-700">Dirección</label>
                      <p class="text-sm text-blue-900">{{ selectedVehicle.lastLocation.direction || 0 }}°</p>
                    </div>
                  </div>
                  <div class="mt-3">
                    <label class="block text-xs font-medium text-blue-700">Última Actualización</label>
                    <p class="text-sm text-blue-900">{{ formatDate(selectedVehicle.lastLocation.gpsTimestamp) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <router-link
              v-if="selectedVehicle"
              :to="`/user/mapa?vehiculo=${selectedVehicle.id}`"
              class="w-full inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
            >
              Ver en Mapa
            </router-link>
            <button
              @click="showDetailsModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
import { TruckIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import api from '../../services/api'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const toast = useToast()

const vehiculos = ref([])
const showDetailsModal = ref(false)
const selectedVehicle = ref(null)

const fetchVehicles = async () => {
  try {
    const response = await api.get('/user/vehicles')
    vehiculos.value = response.data.data
  } catch (error) {
    toast.error('Error al cargar los vehículos')
  }
}

const viewVehicleDetails = (vehiculo) => {
  selectedVehicle.value = vehiculo
  showDetailsModal.value = true
}

const getStatusText = (status) => {
  switch (status) {
    case 'available': return 'Disponible'
    case 'assigned': return 'Asignado'
    case 'maintenance': return 'Mantenimiento'
    case 'out_of_service': return 'Fuera de Servicio'
    default: return status
  }
}

const formatDate = (date) => {
  if (!date) return 'No disponible'
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es })
}

onMounted(() => {
  fetchVehicles()
})
</script>

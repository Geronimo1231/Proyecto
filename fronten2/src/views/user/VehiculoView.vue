<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Mi Vehículo Asignado
        </h2>
      </div>
    </div>

    <!-- Vehículo asignado -->
    <div v-if="myVehicle" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        class="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
      >
        <div class="aspect-w-16 aspect-h-9">
          <img
            :src="(VITE_APP_IMAGE_URL + myVehicle.image) || '/placeholder.svg?height=200&width=300'"
            :alt="myVehicle.model"
            class="w-full h-48 object-cover"
          />
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold text-gray-900">{{ myVehicle.licensePlate }}</h3>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="getStatusClass(myVehicle.status)"
            >
              {{ getStatusText(myVehicle.status) }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mb-1">{{ myVehicle.brand }} {{ myVehicle.model }}</p>
          <p class="text-sm text-gray-600 mb-2">Año: {{ myVehicle.year }}</p>
        </div>
      </div>
    </div>

    <div v-else class="text-gray-600 text-center py-12">
      No tienes un vehículo asignado.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { toast } from 'vue3-toastify'

const VITE_APP_IMAGE_URL = import.meta.env.VITE_APP_IMAGE_URL || ''

const vehicles = ref([])
const myVehicle = ref(null)
const currentUser = ref(null)

const fetchData = async () => {
  try {
    const [userRes, vehicleRes] = await Promise.all([
      api.get('/auth/me'),
      api.get('/vehicles')
    ])

    // Datos del usuario actual
    currentUser.value = userRes.data.user || userRes.data

    // Lista de vehículos
    vehicles.value = vehicleRes.data.data?.vehicles || vehicleRes.data.data || []

    // Buscar vehículo asignado usando 'assignedTo' (según los datos que me enviaste)
    myVehicle.value = vehicles.value.find(v => String(v.assignedTo) === String(currentUser.value.id))

    if (!myVehicle.value) {
      console.warn('No se encontró vehículo asignado para el usuario con id:', currentUser.value.id)
    } else {
      console.log('Vehículo asignado encontrado:', myVehicle.value)
    }
  } catch (error) {
    console.error('Error al obtener datos:', error)
    toast.error('Error al obtener tu vehículo')
  }
}

const getStatusClass = (estado) => {
  switch (estado) {
    case 'available': return 'bg-green-100 text-green-800'
    case 'assigned': return 'bg-blue-100 text-blue-800'
    case 'maintenance': return 'bg-yellow-100 text-yellow-800'
    case 'out_of_service': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (estado) => {
  switch (estado) {
    case 'available': return 'Disponible'
    case 'assigned': return 'Asignado'
    case 'maintenance': return 'Mantenimiento'
    case 'out_of_service': return 'Fuera de Servicio'
    default: return estado
  }
}

onMounted(fetchData)
</script>

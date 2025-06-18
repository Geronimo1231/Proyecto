<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Mapa GPS - Mis Vehículos
        </h2>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0 space-x-2">
        <button
          @click="refreshLocations"
          class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <ArrowPathIcon class="-ml-0.5 mr-1.5 h-5 w-5" />
          Actualizar
        </button>
      </div>
    </div>

    <!-- Vehicle Selector -->
    <div class="bg-white shadow rounded-lg p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Seleccionar Vehículo</label>
          <select
            v-model="selectedVehicleId"
            @change="filterVehicle"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos mis vehículos</option>
            <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
              {{ vehicle.matricula }} - {{ vehicle.modelo }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mostrar Historial</label>
          <div class="flex items-center">
            <input
              id="show-history"
              v-model="showHistory"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="show-history" class="ml-2 block text-sm text-gray-900">
              Mostrar ruta histórica
            </label>
          </div>
        </div>
        <div class="flex items-end">
          <button
            @click="centerMap"
            class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Centrar en mis vehículos
          </button>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div id="user-map" class="h-96 lg:h-[600px] w-full"></div>
    </div>

    <!-- Vehicle Status -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="location in filteredLocations"
        :key="location.vehiculo_id"
        class="bg-white shadow rounded-lg p-6"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">{{ location.vehiculo?.matricula }}</h3>
          <span
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            :class="getSpeedClass(location.velocidad)"
          >
            {{ location.velocidad }} km/h
          </span>
        </div>
        
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-gray-500">Modelo:</span>
            <span class="text-sm text-gray-900">{{ location.vehiculo?.marca?.nombre }} {{ location.vehiculo?.modelo }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-sm text-gray-500">Latitud:</span>
            <span class="text-sm text-gray-900">{{ location.latitud.toFixed(6) }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-sm text-gray-500">Longitud:</span>
            <span class="text-sm text-gray-900">{{ location.longitud.toFixed(6) }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-sm text-gray-500">Dirección:</span>
            <span class="text-sm text-gray-900">{{ location.direccion }}°</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-sm text-gray-500">Última actualización:</span>
            <span class="text-sm text-gray-900">{{ formatDate(location.timestamp_gps) }}</span>
          </div>
        </div>
        
        <div class="mt-4">
          <button
            @click="focusVehicle(location)"
            class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
          >
            Centrar en Mapa
          </button>
        </div>
      </div>
    </div>

    <!-- No vehicles message -->
    <div v-if="filteredLocations.length === 0" class="bg-white shadow rounded-lg p-6 text-center">
      <MapPinIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No hay ubicaciones disponibles</h3>
      <p class="mt-1 text-sm text-gray-500">
        No se encontraron ubicaciones GPS para tus vehículos asignados.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowPathIcon, MapPinIcon } from '@heroicons/vue/24/outline'
import L from 'leaflet'
import api from '../../services/api'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import io from 'socket.io-client'

const route = useRoute()
const toast = useToast()

const map = ref(null)
const socket = ref(null)
const selectedVehicleId = ref('')
const showHistory = ref(false)

const locations = ref([])
const vehicles = ref([])
const markers = ref(new Map())
const routes = ref(new Map())

const filteredLocations = computed(() => {
  if (!selectedVehicleId.value) {
    return locations.value
  }
  return locations.value.filter(location => location.vehiculo_id == selectedVehicleId.value)
})

const initMap = () => {
  map.value = L.map('user-map').setView([19.432608, -99.133209], 10)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value)
}

const initSocket = () => {
  socket.value = io(import.meta.env.VITE_API_URL || 'http://localhost:8080')
  
  socket.value.on('location-update', (data) => {
    // Solo actualizar si es uno de mis vehículos
    const isMyVehicle = vehicles.value.some(v => v.id === data.vehiculo_id)
    if (isMyVehicle) {
      updateVehicleLocation(data)
    }
  })
}

const fetchData = async () => {
  try {
    const [locationsRes, vehiclesRes] = await Promise.all([
      api.get('/user/ubicaciones'),
      api.get('/user/vehiculos')
    ])
    
    locations.value = locationsRes.data.data
    vehicles.value = vehiclesRes.data.data
    
    // Si hay un vehículo específico en la URL, seleccionarlo
    if (route.query.vehiculo) {
      selectedVehicleId.value = route.query.vehiculo
    }
    
    updateMapMarkers()
  } catch (error) {
    toast.error('Error al cargar las ubicaciones')
  }
}

const updateMapMarkers = () => {
  // Limpiar marcadores existentes
  markers.value.forEach(marker => {
    map.value.removeLayer(marker)
  })
  markers.value.clear()

  // Agregar nuevos marcadores
  filteredLocations.value.forEach(location => {
    const marker = L.marker([location.latitud, location.longitud])
      .bindPopup(`
        <div class="p-2">
          <h3 class="font-bold">${location.vehiculo?.matricula}</h3>
          <p>${location.vehiculo?.marca?.nombre} ${location.vehiculo?.modelo}</p>
          <p><strong>Velocidad:</strong> ${location.velocidad} km/h</p>
          <p><strong>Dirección:</strong> ${location.direccion}°</p>
          <p><strong>Actualizado:</strong> ${formatDate(location.timestamp_gps)}</p>
        </div>
      `)
      .addTo(map.value)
    
    markers.value.set(location.vehiculo_id, marker)
  })
}

const updateVehicleLocation = (locationData) => {
  // Actualizar en la lista de ubicaciones
  const index = locations.value.findIndex(loc => loc.vehiculo_id === locationData.vehiculo_id)
  if (index !== -1) {
    locations.value[index] = locationData
  } else {
    locations.value.push(locationData)
  }
  
  // Actualizar marcador en el mapa
  const marker = markers.value.get(locationData.vehiculo_id)
  if (marker) {
    marker.setLatLng([locationData.latitud, locationData.longitud])
    marker.getPopup().setContent(`
      <div class="p-2">
        <h3 class="font-bold">${locationData.vehiculo?.matricula}</h3>
        <p>${locationData.vehiculo?.marca?.nombre} ${locationData.vehiculo?.modelo}</p>
        <p><strong>Velocidad:</strong> ${locationData.velocidad} km/h</p>
        <p><strong>Dirección:</strong> ${locationData.direccion}°</p>
        <p><strong>Actualizado:</strong> ${formatDate(locationData.timestamp_gps)}</p>
      </div>
    `)
  }
}

const refreshLocations = async () => {
  await fetchData()
  toast.success('Ubicaciones actualizadas')
}

const filterVehicle = () => {
  updateMapMarkers()
  centerMap()
}

const focusVehicle = (location) => {
  map.value.setView([location.latitud, location.longitud], 15)
  const marker = markers.value.get(location.vehiculo_id)
  if (marker) {
    marker.openPopup()
  }
}

const centerMap = () => {
  if (filteredLocations.value.length > 0) {
    const group = new L.featureGroup(Array.from(markers.value.values()))
    map.value.fitBounds(group.getBounds().pad(0.1))
  } else {
    map.value.setView([19.432608, -99.133209], 10)
  }
}

const getSpeedClass = (speed) => {
  if (speed === 0) return 'bg-gray-100 text-gray-800'
  if (speed <= 30) return 'bg-green-100 text-green-800'
  if (speed <= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm:ss', { locale: es })
}

onMounted(async () => {
  initMap()
  initSocket()
  await fetchData()
})

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect()
  }
})
</script>

<style>
@import 'leaflet/dist/leaflet.css';
</style>

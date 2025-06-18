<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Mapa GPS - Todas las Ubicaciones
        </h2>
      </div>
      <div class="mt-4 flex md:mt-0 space-x-2">
        <button
          @click="toggleAutoRefresh"
          :class="[
            'inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm',
            autoRefresh 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-600 text-white hover:bg-gray-700'
          ]"
        >
          <ArrowPathIcon class="-ml-0.5 mr-1.5 h-5 w-5" :class="{ 'animate-spin': autoRefresh }" />
          {{ autoRefresh ? 'Auto-actualización ON' : 'Auto-actualización OFF' }}
        </button>
        <button
          @click="refreshLocations"
          class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <MapPinIcon class="-ml-0.5 mr-1.5 h-5 w-5" />
          Actualizar Ubicaciones
        </button>
      </div>
    </div>

    <!-- Map Controls -->
    <div class="bg-white shadow rounded-lg p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Usuario</label>
          <select
            v-model="selectedUser"
            @change="filterVehicles"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos los usuarios</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.nombre }} {{ user.apellido }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Vehículo</label>
          <select
            v-model="selectedVehicle"
            @change="filterVehicles"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos los vehículos</option>
            <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
              {{ vehicle.matricula }} - {{ vehicle.modelo }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mostrar Rutas</label>
          <div class="flex items-center">
            <input
              id="show-routes"
              v-model="showRoutes"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="show-routes" class="ml-2 block text-sm text-gray-900">
              Mostrar trayectorias
            </label>
          </div>
        </div>
        <div class="flex items-end">
          <button
            @click="centerMap"
            class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Centrar Mapa
          </button>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div id="map" class="h-96 lg:h-[600px] w-full"></div>
    </div>

    <!-- Vehicle List -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Vehículos en Tiempo Real</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="location in filteredLocations"
            :key="location.vehiculo_id"
            class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
            @click="focusVehicle(location)"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-gray-900">{{ location.vehiculo?.matricula }}</h4>
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="getSpeedClass(location.velocidad)"
              >
                {{ location.velocidad }} km/h
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-1">
              {{ location.vehiculo?.marca?.nombre }} {{ location.vehiculo?.modelo }}
            </p>
            <p class="text-sm text-gray-600 mb-2">
              <strong>Usuario:</strong> {{ location.vehiculo?.asignacion_actual?.usuario_nombre || 'Sin asignar' }}
            </p>
            <div class="text-xs text-gray-500">
              <p><strong>Lat:</strong> {{ location.latitud.toFixed(6) }}</p>
              <p><strong>Lng:</strong> {{ location.longitud.toFixed(6) }}</p>
              <p><strong>Última actualización:</strong> {{ formatDate(location.timestamp_gps) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ArrowPathIcon, MapPinIcon } from '@heroicons/vue/24/outline'
import L from 'leaflet'
import api from '../../services/api'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import io from 'socket.io-client'

const toast = useToast()

const map = ref(null)
const socket = ref(null)
const autoRefresh = ref(true)
const showRoutes = ref(false)
const selectedUser = ref('')
const selectedVehicle = ref('')

const locations = ref([])
const users = ref([])
const vehicles = ref([])
const markers = ref(new Map())
const routes = ref(new Map())

const filteredLocations = computed(() => {
  return locations.value.filter(location => {
    const matchesUser = !selectedUser.value || 
      location.vehiculo?.asignacion_actual?.usuario_id == selectedUser.value
    
    const matchesVehicle = !selectedVehicle.value || 
      location.vehiculo_id == selectedVehicle.value
    
    return matchesUser && matchesVehicle
  })
})

const initMap = () => {
  map.value = L.map('map').setView([19.432608, -99.133209], 10)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value)
}

const initSocket = () => {
  socket.value = io(import.meta.env.VITE_API_URL || 'http://localhost:8080')
  
  socket.value.on('location-update', (data) => {
    updateVehicleLocation(data)
  })
  
  socket.value.on('connect', () => {
    console.log('Conectado al servidor de ubicaciones')
  })
  
  socket.value.on('disconnect', () => {
    console.log('Desconectado del servidor de ubicaciones')
  })
}

const fetchData = async () => {
  try {
    const [locationsRes, usersRes, vehiclesRes] = await Promise.all([
      api.get('/ubicaciones/latest'),
      api.get('/usuarios?rol=usuario&activo=true'),
      api.get('/vehiculos?estado=asignado')
    ])
    
    locations.value = locationsRes.data.data
    users.value = usersRes.data.data
    vehicles.value = vehiclesRes.data.data
    
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
          <p><strong>Usuario:</strong> ${location.vehiculo?.asignacion_actual?.usuario_nombre || 'Sin asignar'}</p>
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
        <p><strong>Usuario:</strong> ${locationData.vehiculo?.asignacion_actual?.usuario_nombre || 'Sin asignar'}</p>
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

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    toast.success('Auto-actualización activada')
  } else {
    toast.info('Auto-actualización desactivada')
  }
}

const filterVehicles = () => {
  updateMapMarkers()
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

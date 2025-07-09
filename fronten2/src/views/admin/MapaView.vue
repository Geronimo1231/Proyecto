<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Mapa de Vehículos
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Ubicación en tiempo real de todos los vehículos
        </p>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <button
          @click="generateMockData"
          :disabled="loading"
          class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          <MapPinIcon class="-ml-0.5 mr-1.5 h-5 w-5" />
          {{ loading ? 'Generando...' : 'Generar Datos GPS' }}
        </button>
        <button
          @click="refreshLocations"
          :disabled="loading"
          class="ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowPathIcon class="-ml-0.5 mr-1.5 h-5 w-5" />
          Actualizar
        </button>
      </div>
    </div>

    <!-- Map Container -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="p-6">
        <div id="map" class="h-96 w-full rounded-lg"></div>
      </div>
    </div>

    <!-- Vehicle List -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Vehículos Activos</h3>
        
        <div v-if="vehicles.length === 0" class="text-center py-8">
          <MapPinIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay ubicaciones</h3>
          <p class="mt-1 text-sm text-gray-500">
            No se encontraron ubicaciones GPS recientes.
          </p>
          <div class="mt-6">
            <button
              @click="generateMockData"
              class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" />
              Generar Datos de Prueba
            </button>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="vehicle in vehicles"
            :key="vehicle.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-gray-900">{{ vehicle.licensePlate }}</h4>
              <span
                :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  getStatusColor(vehicle.status)
                ]"
              >
                {{ getStatusText(vehicle.status) }}
              </span>
            </div>
            
            <p class="text-sm text-gray-600 mb-2">
              {{ vehicle.brand }} {{ vehicle.model }}
            </p>
            
            <div v-if="vehicle.lastLocation" class="text-xs text-gray-500 space-y-1">
              <p>
                <strong>Última ubicación:</strong>
                {{ formatDate(vehicle.lastLocation.gpsTimestamp) }}
              </p>
              <p>
                <strong>Coordenadas:</strong>
                {{ vehicle.lastLocation.latitude.toFixed(6) }}, {{ vehicle.lastLocation.longitude.toFixed(6) }}
              </p>
              <p v-if="vehicle.lastLocation.speed">
                <strong>Velocidad:</strong>
                {{ Math.round(vehicle.lastLocation.speed) }} km/h
              </p>
            </div>
            
            <div class="mt-3 flex space-x-2">
              <button
                @click="centerMapOnVehicle(vehicle)"
                class="flex-1 bg-blue-50 text-blue-700 text-xs font-medium py-1 px-2 rounded hover:bg-blue-100"
              >
                Ver en Mapa
              </button>
              <button
                @click="viewVehicleHistory(vehicle.id)"
                class="flex-1 bg-gray-50 text-gray-700 text-xs font-medium py-1 px-2 rounded hover:bg-gray-100"
              >
                Historial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { MapPinIcon, ArrowPathIcon, PlusIcon } from '@heroicons/vue/24/outline'
import api from '../../services/api'
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { io } from 'socket.io-client'

const loading = ref(false)
const vehicles = ref([])
let map = null
let markers = {}
let socket = null

// Coordenadas de Guadalajara, Jalisco
const GUADALAJARA_CENTER = {
  lat: 20.6597,
  lng: -103.3496
}

const initializeMap = () => {
  // Crear el mapa centrado en Guadalajara
  map = new window.google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: GUADALAJARA_CENTER,
    mapTypeId: window.google.maps.MapTypeId.ROADMAP,
  })

  // Agregar marcador del centro de Guadalajara
  new window.google.maps.Marker({
    position: GUADALAJARA_CENTER,
    map: map,
    title: 'Guadalajara, Jalisco',
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#10B981"/>
          <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(24, 24),
    },
  })
}

const loadGoogleMaps = () => {
  return new Promise((resolve) => {
    if (window.google && window.google.maps) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dO_BcqbJVQrxhg&libraries=places`
    script.async = true
    script.defer = true
    script.onload = resolve
    document.head.appendChild(script)
  })
}

const fetchVehicleLocations = async () => {
  try {
    loading.value = true
    const response = await api.get('/gps/latest')
    
    if (response.data.success) {
      vehicles.value = response.data.data.map(location => ({
        id: location.vehicle.id,
        licensePlate: location.vehicle.licensePlate,
        model: location.vehicle.model,
        brand: location.vehicle.brand,
        status: location.vehicle.status,
        lastLocation: location
      }))
      
      updateMapMarkers()
    }
  } catch (error) {
    console.error('Error fetching vehicle locations:', error)
    toast.error('Error al cargar las ubicaciones de vehículos')
  } finally {
    loading.value = false
  }
}

const updateMapMarkers = () => {
  if (!map) return

  // Limpiar marcadores existentes
  Object.values(markers).forEach(marker => marker.setMap(null))
  markers = {}

  // Agregar nuevos marcadores
  vehicles.value.forEach(vehicle => {
    if (vehicle.lastLocation) {
      const marker = new window.google.maps.Marker({
        position: {
          lat: vehicle.lastLocation.latitude,
          lng: vehicle.lastLocation.longitude
        },
        map: map,
        title: `${vehicle.licensePlate} - ${vehicle.brand} ${vehicle.model}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C11.58 2 8 5.58 8 10c0 7 8 18 8 18s8-11 8-18c0-4.42-3.58-8-8-8z" fill="#3B82F6"/>
              <circle cx="16" cy="10" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      })

      // Info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold">${vehicle.licensePlate}</h3>
            <p class="text-sm">${vehicle.brand} ${vehicle.model}</p>
            <p class="text-xs text-gray-600">
              Última actualización: ${formatDate(vehicle.lastLocation.gpsTimestamp)}
            </p>
            ${vehicle.lastLocation.speed ? `<p class="text-xs">Velocidad: ${Math.round(vehicle.lastLocation.speed)} km/h</p>` : ''}
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })

      markers[vehicle.id] = marker
    }
  })
}

const centerMapOnVehicle = (vehicle) => {
  if (map && vehicle.lastLocation) {
    map.setCenter({
      lat: vehicle.lastLocation.latitude,
      lng: vehicle.lastLocation.longitude
    })
    map.setZoom(15)
    
    // Abrir info window del marcador
    if (markers[vehicle.id]) {
      window.google.maps.event.trigger(markers[vehicle.id], 'click')
    }
  }
}

const viewVehicleHistory = (vehicleId) => {
  // Implementar navegación al historial del vehículo
  toast.info('Función de historial en desarrollo')
}

const generateMockData = async () => {
  try {
    loading.value = true
    const response = await api.post('/gps/mock')
    
    if (response.data.success) {
      toast.success(response.data.message)
      await fetchVehicleLocations()
    }
  } catch (error) {
    console.error('Error generating mock data:', error)
    toast.error('Error al generar datos de prueba')
  } finally {
    loading.value = false
  }
}

const refreshLocations = () => {
  fetchVehicleLocations()
}

const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'inactive':
      return 'bg-red-100 text-red-800'
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'active':
      return 'Activo'
    case 'inactive':
      return 'Inactivo'
    case 'maintenance':
      return 'Mantenimiento'
    default:
      return 'Desconocido'
  }
}

const formatDate = (date) => {
  if (!date) return 'No disponible'
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es })
}

const initializeSocket = () => {
  socket = io('http://localhost:8080')
  
  socket.on('connect', () => {
    console.log('Conectado al servidor de Socket.IO')
  })
  
  socket.on('location-update', (data) => {
    console.log('Actualización de ubicación recibida:', data)
    // Actualizar la ubicación del vehículo en tiempo real
    const vehicleIndex = vehicles.value.findIndex(v => v.id === data.vehicleId)
    if (vehicleIndex !== -1) {
      vehicles.value[vehicleIndex].lastLocation = data.location
      updateMapMarkers()
    }
  })
  
  socket.on('disconnect', () => {
    console.log('Desconectado del servidor de Socket.IO')
  })
}

onMounted(async () => {
  await loadGoogleMaps()
  initializeMap()
  await fetchVehicleLocations()
  initializeSocket()
})

onUnmounted(() => {
  if (socket) {
    socket.disconnect()
  }
})
</script>

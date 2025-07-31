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
          <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Vehículo</label>
          <select
            v-model="selectedVehicle"
            @change="filterVehicles"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos los vehículos</option>
            <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
              {{ vehicle.licensePlate }} - {{ vehicle.model }}
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
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="filteredLocations.length === 0" class="text-center py-8 text-gray-500">
          No hay ubicaciones disponibles
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="location in filteredLocations"
            :key="location.id || location.vehicleId"
            class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
            @click="focusVehicle(location)"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-gray-900">{{ getVehiclePlate(location) }}</h4>
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="getSpeedClass(location.speed || location.velocidad || 0)"
              >
                {{ location.speed || location.velocidad || 0 }} km/h
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-1">
              {{ getVehicleInfo(location) }}
            </p>
            <div class="text-xs text-gray-500">
              <p><strong>Lat:</strong> {{ Number(location.latitude || location.latitud || 0).toFixed(6) }}</p>
              <p><strong>Lng:</strong> {{ Number(location.longitude || location.longitud || 0).toFixed(6) }}</p>
              <p><strong>Última actualización:</strong> {{ formatDate(location.timestamp || location.timestamp_gps || location.updatedAt) }}</p>
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
import api from '../../services/api'
import { toast } from 'vue3-toastify'

const map = ref(null)
const autoRefresh = ref(false)
const showRoutes = ref(false)
const selectedUser = ref('')
const selectedVehicle = ref('')
const loading = ref(true)

const locations = ref([])
const users = ref([])
const vehicles = ref([])
const markers = ref(new Map())

let refreshInterval = null

const filteredLocations = computed(() => {
  return locations.value.filter(location => {
    const matchesUser = !selectedUser.value || 
      String(getUserId(location)) === String(selectedUser.value)

    const matchesVehicle = !selectedVehicle.value || 
      String(getVehicleId(location)) === String(selectedVehicle.value)

    return matchesUser && matchesVehicle
  })
})



const initMap = async () => {
  try {
    // Importar Leaflet dinámicamente
    const L = await import('leaflet')
    
    map.value = L.map('map').setView([20.6597, -103.3496], 12)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.value)
    
    // Cargar datos iniciales
    await fetchData()
  } catch (error) {
    console.error('Error initializing map:', error)
    toast.error('Error al inicializar el mapa')
  }
}

const fetchData = async () => {
  try {
    loading.value = true

    const [locationRes, userRes, vehicleRes] = await Promise.all([
      api.get('/gps/locations'),     
      api.get('/users'),             
      api.get('/vehicles', { params: { page: 1, limit: 10 } })  
    ])

    locations.value = Array.isArray(locationRes.data.data) ? locationRes.data.data : []
    users.value = Array.isArray(userRes.data.data) ? userRes.data.data : []
    vehicles.value = Array.isArray(vehicleRes.data.data.vehicles) ? vehicleRes.data.data.vehicles : []

    await updateMapMarkers()

  } catch (error) {
    console.error('Error fetching data:', error)
    toast.error('Error al cargar los datos reales')
  } finally {
    loading.value = false
  }
}
const vehiclePaths = ref(new Map()) // Mapa de historial de ubicaciones






const polylines = ref(new Map())

const updateMapMarkers = async () => {
  if (!map.value) return
  try {
    const L = await import('leaflet')

    const activeVehicleIds = new Set()

    filteredLocations.value.forEach(location => {
      const vehicleId = getVehicleId(location)
      if (!vehicleId) return

      activeVehicleIds.add(vehicleId)

      const lat = location.latitude || location.latitud
      const lng = location.longitude || location.longitud

      if (lat === undefined || lng === undefined) return

      const existingMarker = markers.value.get(vehicleId)

      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold">${getVehiclePlate(location)}</h3>
          <p>${getVehicleInfo(location)}</p>
          <p><strong>Velocidad:</strong> ${location.speed || location.velocidad || 0} km/h</p>
          <p><strong>Actualizado:</strong> ${formatDate(location.timestamp || location.timestamp_gps || location.updatedAt)}</p>
        </div>
      `

        
        // Guardar historial de ubicaciones para trazo
          if (!vehiclePaths.value.has(vehicleId)) {
            vehiclePaths.value.set(vehicleId, [])
          }
          vehiclePaths.value.get(vehicleId).push([lat, lng])

      if (existingMarker) {
        // Mover marcador si cambió la posición
        const currentLatLng = existingMarker.getLatLng()
        if (currentLatLng.lat !== lat || currentLatLng.lng !== lng) {
          existingMarker.setLatLng([lat, lng])
        }
        // Actualizar contenido del popup
        existingMarker.setPopupContent(popupContent)
      } else {
        // Crear marcador nuevo
        const marker = L.marker([lat, lng])
          .bindPopup(popupContent)
          .addTo(map.value)

        markers.value.set(vehicleId, marker)
      }
    })

    // Eliminar marcadores que ya no están en la lista filtrada
    markers.value.forEach((marker, vehicleId) => {
      if (!activeVehicleIds.has(vehicleId)) {
        map.value.removeLayer(marker)
        markers.value.delete(vehicleId)
      }
    })

    // Polylines (si usas rutas)
    polylines.value.forEach(line => {
      map.value.removeLayer(line)
    })
    polylines.value.clear()

    if (showRoutes.value) {
      const grouped = {}
      filteredLocations.value.forEach(loc => {
        const vid = getVehicleId(loc)
        if (!vid) return
        if (!grouped[vid]) grouped[vid] = []
        grouped[vid].push(loc)
      })

      Object.entries(grouped).forEach(([vehicleId, locs]) => {
        locs.sort((a, b) => new Date(a.timestamp || a.timestamp_gps || a.updatedAt) - new Date(b.timestamp || b.timestamp_gps || b.updatedAt))
        const latlngs = locs.map(loc => [loc.latitude || loc.latitud, loc.longitude || loc.longitud]).filter(coord => coord[0] && coord[1])
        if (showRoutes.value) {
            vehiclePaths.value.forEach((path, vehicleId) => {
              if (path.length > 1) {
                const polyline = L.polyline(path, { color: 'blue' }).addTo(map.value)
                polylines.value.set(vehicleId, polyline)
              }
            })
          }
      })
    }

  } catch (error) {
    console.error('Error updating markers:', error)
  }
}

const simulateMovement = () => {
  locations.value = locations.value.map(loc => {
    let lat = parseFloat(loc.latitude || loc.latitud)
    let lng = parseFloat(loc.longitude || loc.longitud)

    if (!isFinite(lat) || !isFinite(lng)) return loc

    // Movimiento aleatorio
    const offsetLat = (Math.random() - 0.5) * 0.001
    const offsetLng = (Math.random() - 0.5) * 0.001

    const newLat = lat + offsetLat
    const newLng = lng + offsetLng

    const simulatedSpeed = Math.random() < 0.2 ? 0 : Number((Math.random() * 80 + 10).toFixed(1))

    return {
      ...loc,
      latitude: newLat,
      longitude: newLng,
      speed: simulatedSpeed,
      timestamp: new Date().toISOString()
      // mantenemos los campos originales
    }
  })

  updateMapMarkers()
}




const refreshLocations = async () => {
  await fetchData()
  toast.success('Ubicaciones actualizadas')
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value

  if (autoRefresh.value) {
    refreshInterval = setInterval(() => {
      simulateMovement() // ← usamos simulación en vez de fetch real
    }, 2000) // cada 2 segundos
    toast.success('Simulación activada')
  } else {
    clearInterval(refreshInterval)
    refreshInterval = null
    toast.info('Simulación desactivada')
  }
}

const filterVehicles = () => {
  updateMapMarkers()
}

const focusVehicle = (location) => {
  if (!map.value || !map.value._container) return 

  const lat = Number(location.latitude || location.latitud)
  const lng = Number(location.longitude || location.longitud)

  if (isFinite(lat) && isFinite(lng)) {
    map.value.setView([lat, lng], 15)
    const marker = markers.value.get(getVehicleId(location))
    if (marker) {
      marker.openPopup()
    }
  }
}


const centerMap = async () => {
  if (!map.value || !map.value._container) return

  try {
    const L = await import('leaflet')

    if (filteredLocations.value.length > 0) {
      const group = new L.featureGroup(Array.from(markers.value.values()))
      map.value.fitBounds(group.getBounds().pad(0.1))
    } else {
      map.value.setView([20.6767, -103.3475], 10)
    }
  } catch (error) {
    console.error('Error centering map:', error)
  }
}


// Helper functions para manejar diferentes estructuras de datos
const getVehicleId = (location) => {
  return location.vehicleId || location.vehiculo_id || location.Vehicle?.id
}

const getVehiclePlate = (location) => {
  if (location.Vehicle) {
    return location.Vehicle.licensePlate || 'N/A'
  }
  if (location.vehicle) {
    return location.vehicle.licensePlate || location.vehicle.matricula || 'N/A'
  }
  // Buscar en la lista de vehículos
  const vehicle = vehicles.value.find(v => v.id === getVehicleId(location))
  return vehicle?.licensePlate || vehicle?.matricula || 'N/A'
}

const getVehicleInfo = (location) => {
  if (location.Vehicle) {
    return `${location.Vehicle.brand || ''} ${location.Vehicle.model || ''}`.trim()
  }
  if (location.vehicle) {
    return `${location.vehicle.brand || location.vehicle.marca?.nombre || ''} ${location.vehicle.model || location.vehicle.modelo || ''}`.trim()
  }
  // Buscar en la lista de vehículos
  const vehicle = vehicles.value.find(v => v.id === getVehicleId(location))
  return vehicle ? `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() : ''
}

const getUserId = (location) => {
  return (
    location.userId ||
    location.usuario_id ||
    location.User?.id ||
    location.user?.id ||
    location.vehicle?.userId ||
    location.Vehicle?.userId ||
    // 🔧 Extra: buscar por vehículo
    vehicles.value.find(v => v.id === getVehicleId(location))?.userId
  )
}




const getUserName = (location) => {
  if (location.User) {
    return `${location.User.firstName || ''} ${location.User.lastName || ''}`.trim()
  }
  if (location.user) {
    return `${location.user.firstName || location.user.nombre || ''} ${location.user.lastName || location.user.apellido || ''}`.trim()
  }

  // ✅ Validación defensiva
  if (!Array.isArray(users.value)) return 'Sin asignar'

  const user = users.value.find(u => u.id === getUserId(location))
  return user ? `${user.firstName || user.nombre || ''} ${user.lastName || user.apellido || ''}`.trim() : 'Sin asignar'
}

const getSpeedClass = (speed) => {
  if (speed === 0) return 'bg-gray-100 text-gray-800'
  if (speed <= 30) return 'bg-green-100 text-green-800'
  if (speed <= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const formatDate = (date) => {
  if (!date) return 'No disponible'
  try {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}

onMounted(async () => {
  await initMap()
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style>
@import 'leaflet/dist/leaflet.css';
</style>
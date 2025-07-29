<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Mapa GPS – Mi Vehículo
        </h2>
      </div>
      <div class="mt-4 flex md:mt-0 space-x-2">
        <button
          @click="toggleAutoRefresh"
          :class="[
            'inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm',
            autoRefresh ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-600 text-white hover:bg-gray-700'
          ]"
        >
          <ArrowPathIcon class="-ml-0.5 mr-1.5 h-5 w-5" :class="{ 'animate-spin': autoRefresh }" />
          {{ autoRefresh ? 'Auto‑actualización ON' : 'Auto‑actualización OFF' }}
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

    <!-- Info del vehículo asignado -->
    <div class="bg-white shadow rounded-lg p-4">
      <p class="text-sm text-gray-600">Vehículo asignado:</p>
      <p class="font-medium text-gray-900">
        {{ myVehiclePlate }} – {{ myVehicleInfo }}
      </p>
    </div>

    <!-- Map Container -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div id="map" class="h-96 lg:h-[600px] w-full"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ArrowPathIcon, MapPinIcon } from '@heroicons/vue/24/outline'
import api from '../../services/api'
import { toast } from 'vue3-toastify'

let refreshInterval = null

const map = ref(null)
const autoRefresh = ref(false)
const loading = ref(true)

const currentUser = ref(null)
const locations = ref([])
const vehicles = ref([])
const myVehicle = ref(null)

const markers = ref(new Map()) // Map vehicleId => marker

const myVehiclePlate = computed(() => {
  return myVehicle.value?.licensePlate || myVehicle.value?.matricula || 'N/A'
})

const myVehicleInfo = computed(() => {
  const v = myVehicle.value
  return v ? `${v.brand || v.marca?.nombre || ''} ${v.model || v.modelo || ''}`.trim() : ''
})

const getCurrentUser = async () => {
  try {
    const res = await api.get('/auth/me')
    currentUser.value = res.data.user || res.data
  } catch (err) {
    console.error('Error al obtener el usuario:', err)
  }
}

const fetchData = async () => {
  try {
    loading.value = true
    await getCurrentUser()

    const [locRes, vehRes] = await Promise.all([
      api.get('/gps/locations'),
      api.get('/vehicles', { params: { page: 1, limit: 100 } })
    ])

    locations.value = Array.isArray(locRes.data.data) ? locRes.data.data : []
    vehicles.value = Array.isArray(vehRes.data.data.vehicles) ? vehRes.data.data.vehicles : []

    // Cambiado a assignedTo para buscar vehículo asignado
    myVehicle.value = vehicles.value.find(
      v => String(v.assignedTo) === String(currentUser.value?.id)
    ) || null

    console.log('Usuario actual:', currentUser.value)
    console.log('Vehículos cargados:', vehicles.value)
    console.log('Vehículo asignado encontrado:', myVehicle.value)

    await updateMapMarkers()

    // Centrar el mapa en la última ubicación del vehículo asignado
    if (myVehicle.value) {
      const vehicleLocs = locations.value.filter(loc => getVehicleId(loc) === myVehicle.value.id)
      console.log('Ubicaciones vehículo asignado:', vehicleLocs)
      if (vehicleLocs.length) {
        vehicleLocs.sort(
          (a, b) =>
            new Date(b.timestamp || b.timestamp_gps || b.updatedAt) -
            new Date(a.timestamp || a.timestamp_gps || a.updatedAt)
        )
        focusVehicle(vehicleLocs[0])
      }
    }
  } catch (err) {
    console.error('Fetch error:', err)
    toast.error('Error al cargar los datos')
  } finally {
    loading.value = false
  }
}

const initMap = async () => {
  try {
    const L = await import('leaflet')
    map.value = L.map('map').setView([20.6597, -103.3496], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.value)

    await fetchData()
  } catch (err) {
    console.error('Error inicializando mapa:', err)
    toast.error('Error al inicializar el mapa')
  }
}

const updateMapMarkers = async () => {
  if (!map.value || !myVehicle.value) return
  try {
    const L = await import('leaflet')
    const vehicleId = myVehicle.value.id

    // Obtener sólo las ubicaciones del vehículo asignado
    const vehicleLocations = locations.value.filter(loc => getVehicleId(loc) === vehicleId)

    // Si no hay ubicaciones, borrar marcador y salir
    if (vehicleLocations.length === 0) {
      const oldMarker = markers.value.get(vehicleId)
      if (oldMarker) {
        map.value.removeLayer(oldMarker)
        markers.value.delete(vehicleId)
      }
      return
    }

    // Tomar la última ubicación (ordenada por fecha descendente)
    vehicleLocations.sort(
      (a, b) =>
        new Date(b.timestamp || b.timestamp_gps || b.updatedAt) -
        new Date(a.timestamp || a.timestamp_gps || a.updatedAt)
    )
    const latestLoc = vehicleLocations[0]
    const lat = Number(latestLoc.latitude ?? latestLoc.latitud)
    const lng = Number(latestLoc.longitude ?? latestLoc.longitud)
    if (!isFinite(lat) || !isFinite(lng)) return

    const popup = `
      <div class="p-2">
        <h3 class="font-bold">${getVehiclePlate(latestLoc)}</h3>
        <p>${getVehicleInfo(latestLoc)}</p>
        <p><strong>Velocidad:</strong> ${latestLoc.speed || latestLoc.velocidad || 0} km/h</p>
        <p><strong>Actualizado:</strong> ${formatDate(latestLoc.timestamp || latestLoc.timestamp_gps || latestLoc.updatedAt)}</p>
      </div>`

    const existingMarker = markers.value.get(vehicleId)
    if (existingMarker) {
      existingMarker.setLatLng([lat, lng]).setPopupContent(popup)
    } else {
      const marker = L.marker([lat, lng]).bindPopup(popup).addTo(map.value)
      markers.value.set(vehicleId, marker)
    }
  } catch (err) {
    console.error('Error actualizando marcadores:', err)
  }
}

const focusVehicle = (location) => {
  if (!map.value) return
  const lat = Number(location.latitude ?? location.latitud)
  const lng = Number(location.longitude ?? location.longitud)
  if (isFinite(lat) && isFinite(lng)) {
    map.value.setView([lat, lng], 15)
    const marker = markers.value.get(getVehicleId(location))
    marker?.openPopup()
  }
}

const refreshLocations = async () => {
  await fetchData()
  toast.success('Ubicaciones actualizadas')
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    refreshInterval = setInterval(() => {
      simulateMovement()
    }, 2000)
    toast.success('Simulación activada')
  } else {
    clearInterval(refreshInterval)
    toast.info('Simulación desactivada')
  }
}

const simulateMovement = () => {
  locations.value = locations.value.map(loc => {
    const lat = Number(loc.latitude ?? loc.latitud)
    const lng = Number(loc.longitude ?? loc.longitud)
    if (!isFinite(lat) || !isFinite(lng)) return loc
    const offsetLat = (Math.random() - 0.5) * 0.001
    const offsetLng = (Math.random() - 0.5) * 0.001
    const speed = Math.random() < 0.2 ? 0 : Number((Math.random() * 80 + 10).toFixed(1))
    return {
      ...loc,
      latitude: lat + offsetLat,
      longitude: lng + offsetLng,
      speed,
      timestamp: new Date().toISOString()
    }
  })
  updateMapMarkers()
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

// Helpers para datos
const getVehicleId = loc => loc.vehicleId || loc.vehiculo_id || loc.Vehicle?.id
const getVehiclePlate = loc =>
  loc.Vehicle?.licensePlate ||
  loc.vehicle?.licensePlate ||
  loc.vehicle?.matricula ||
  vehicles.value.find(v => v.id === getVehicleId(loc))?.licensePlate ||
  'N/A'

const getVehicleInfo = loc => {
  if (loc.Vehicle) return `${loc.Vehicle.brand || ''} ${loc.Vehicle.model || ''}`.trim()
  if (loc.vehicle) return `${loc.vehicle.brand || loc.vehicle.marca?.nombre || ''} ${loc.vehicle.model || loc.vehicle.modelo || ''}`.trim()
  const v = vehicles.value.find(v => v.id === getVehicleId(loc))
  return v ? `${v.brand || v.marca?.nombre || ''} ${v.model || v.modelo || ''}`.trim() : ''
}

const formatDate = date => {
  if (!date) return 'No disponible'
  try {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Fecha inválida'
  }
}
</script>

<style>
@import 'leaflet/dist/leaflet.css';
</style>

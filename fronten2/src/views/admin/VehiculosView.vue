<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Gestión de Vehículos
        </h2>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <router-link
          to="/vehiculos/crear"
          class="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" />
          Agregar Vehículo
        </router-link>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Matrícula, modelo..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Marca</label>
          <input
            v-model="filters.marca"
            type="text"
            placeholder="Marca..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            v-model="filters.estado"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="available">Disponible</option>
            <option value="assigned">Asignado</option>
            <option value="maintenance">Mantenimiento</option>
            <option value="out_of_service">Fuera de Servicio</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Vehicles Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="vehiculo in filteredVehicles"
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
        <div class="p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold text-gray-900">{{ vehiculo.licensePlate }}</h3>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="getStatusClass(vehiculo.status)"
            >
              {{ getStatusText(vehiculo.status) }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mb-1">{{ vehiculo.brand }} {{ vehiculo.model }}</p>
          <p class="text-sm text-gray-600 mb-2">Año: {{ vehiculo.year }}</p>
          
          <div class="flex space-x-2">
            <router-link
              :to="`/vehiculos/${vehiculo.id}/editar`"
              class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 text-center"
            >
              Editar
            </router-link>
            <router-link
              :to="`/vehiculos/${vehiculo.id}`"
              class="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 text-center"
            >
              Ver Detalles
            </router-link>
            <button
              @click="deleteVehicle(vehiculo)"
              class="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
            >
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import api from '../../services/api'
import { toast } from 'vue3-toastify'

const vehicles = ref([])
const loading = ref(false)

const filters = ref({
  search: '',
  marca: '',
  estado: ''
})

const filteredVehicles = computed(() => {
  return vehicles.value.filter(vehiculo => {
    const matchesSearch = !filters.value.search || 
      vehiculo.licensePlate?.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      vehiculo.model?.toLowerCase().includes(filters.value.search.toLowerCase())
    
    const matchesMarca = !filters.value.marca || 
      vehiculo.brand?.toLowerCase().includes(filters.value.marca.toLowerCase())
    const matchesEstado = !filters.value.estado || vehiculo.status === filters.value.estado
    
    return matchesSearch && matchesMarca && matchesEstado
  })
})

const fetchData = async () => {
  try {
    loading.value = true
    const response = await api.get('/vehicles')
    vehicles.value = response.data.data?.vehicles || response.data.data || []
  } catch (error) {
    console.error('Error al cargar los datos:', error)
    toast.error('Error al cargar los datos')
  } finally {
    loading.value = false
  }
}

const deleteVehicle = async (vehiculo) => {
  if (confirm(`¿Estás seguro de eliminar el vehículo ${vehiculo.licensePlate}?`)) {
    try {
      await api.delete(`/vehicles/${vehiculo.id}`)
      toast.success('Vehículo eliminado correctamente')
      await fetchData()
    } catch (error) {
      toast.error('Error al eliminar el vehículo')
    }
  }
}

const resetFilters = () => {
  filters.value = {
    search: '',
    marca: '',
    estado: ''
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

onMounted(() => {
  fetchData()
})
</script>

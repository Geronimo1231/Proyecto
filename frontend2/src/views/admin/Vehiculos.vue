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
        <button
          @click="showAddModal = true"
          class="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" />
          Agregar Vehículo
        </button>
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
          <select
            v-model="filters.marca"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todas las marcas</option>
            <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
              {{ marca.nombre }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            v-model="filters.estado"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="asignado">Asignado</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="fuera_servicio">Fuera de Servicio</option>
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
        v-for="vehiculo in filteredVehiculos"
        :key="vehiculo.id"
        class="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
      >
        <div class="aspect-w-16 aspect-h-9">
          <img
            :src="vehiculo.imagenes?.[0] || '/placeholder.svg?height=200&width=300'"
            :alt="vehiculo.modelo"
            class="w-full h-48 object-cover"
          />
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold text-gray-900">{{ vehiculo.matricula }}</h3>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="getStatusClass(vehiculo.estado)"
            >
              {{ getStatusText(vehiculo.estado) }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mb-1">{{ vehiculo.marca }} {{ vehiculo.modelo }}</p>
          <p class="text-sm text-gray-600 mb-2">Año: {{ vehiculo.año }}</p>
          
          <div v-if="vehiculo.asignacion_actual" class="mb-3 p-2 bg-blue-50 rounded">
            <p class="text-xs text-blue-700">
              <strong>Asignado a:</strong> {{ vehiculo.asignacion_actual.usuario_nombre }}
            </p>
          </div>

          <div class="flex space-x-2">
            <button
              @click="editVehicle(vehiculo)"
              class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
            >
              Editar
            </button>
            <button
              @click="viewVehicle(vehiculo)"
              class="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
            >
              Ver Detalles
            </button>
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

    <!-- Add/Edit Vehicle Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="saveVehicle">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {{ showAddModal ? 'Agregar Nuevo Vehículo' : 'Editar Vehículo' }}
              </h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Matrícula *</label>
                  <input
                    v-model="vehicleForm.matricula"
                    type="text"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                    <select
                      v-model="vehicleForm.marca_id"
                      required
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Seleccionar marca</option>
                      <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
                        {{ marca.nombre }}
                      </option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                    <select
                      v-model="vehicleForm.tipo_vehiculo_id"
                      required
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Seleccionar tipo</option>
                      <option v-for="tipo in tiposVehiculos" :key="tipo.id" :value="tipo.id">
                        {{ tipo.nombre }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                    <input
                      v-model="vehicleForm.modelo"
                      type="text"
                      required
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Año *</label>
                    <input
                      v-model="vehicleForm.año"
                      type="number"
                      min="1900"
                      max="2025"
                      required
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      v-model="vehicleForm.color"
                      type="text"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Kilometraje</label>
                    <input
                      v-model="vehicleForm.kilometraje"
                      type="number"
                      min="0"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Número de Motor</label>
                    <input
                      v-model="vehicleForm.numero_motor"
                      type="text"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Número de Chasis</label>
                    <input
                      v-model="vehicleForm.numero_chasis"
                      type="text"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                :disabled="loading"
                class="w-full inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50"
              >
                {{ loading ? 'Guardando...' : 'Guardar' }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="mt-3 w-full inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import api from '../../services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()

const vehiculos = ref([])
const marcas = ref([])
const tiposVehiculos = ref([])
const loading = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)

const filters = ref({
  search: '',
  marca: '',
  estado: ''
})

const vehicleForm = ref({
  matricula: '',
  marca_id: '',
  modelo: '',
  año: new Date().getFullYear(),
  color: '',
  tipo_vehiculo_id: '',
  numero_motor: '',
  numero_chasis: '',
  kilometraje: 0
})

const filteredVehiculos = computed(() => {
  return vehiculos.value.filter(vehiculo => {
    const matchesSearch = !filters.value.search || 
      vehiculo.matricula.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      vehiculo.modelo.toLowerCase().includes(filters.value.search.toLowerCase())
    
    const matchesMarca = !filters.value.marca || vehiculo.marca_id == filters.value.marca
    const matchesEstado = !filters.value.estado || vehiculo.estado === filters.value.estado
    
    return matchesSearch && matchesMarca && matchesEstado
  })
})

const fetchData = async () => {
  try {
    const [vehiculosRes, marcasRes, tiposRes] = await Promise.all([
      api.get('/vehiculos'),
      api.get('/marcas'),
      api.get('/tipos-vehiculos')
    ])
    
    vehiculos.value = vehiculosRes.data.data
    marcas.value = marcasRes.data.data
    tiposVehiculos.value = tiposRes.data.data
  } catch (error) {
    toast.error('Error al cargar los datos')
  }
}

const saveVehicle = async () => {
  try {
    loading.value = true
    
    if (showEditModal.value) {
      await api.put(`/vehiculos/${vehicleForm.value.id}`, vehicleForm.value)
      toast.success('Vehículo actualizado correctamente')
    } else {
      await api.post('/vehiculos', vehicleForm.value)
      toast.success('Vehículo agregado correctamente')
    }
    
    await fetchData()
    closeModal()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al guardar el vehículo')
  } finally {
    loading.value = false
  }
}

const editVehicle = (vehiculo) => {
  vehicleForm.value = { ...vehiculo }
  showEditModal.value = true
}

const deleteVehicle = async (vehiculo) => {
  if (confirm(`¿Estás seguro de eliminar el vehículo ${vehiculo.matricula}?`)) {
    try {
      await api.delete(`/vehiculos/${vehiculo.id}`)
      toast.success('Vehículo eliminado correctamente')
      await fetchData()
    } catch (error) {
      toast.error('Error al eliminar el vehículo')
    }
  }
}

const viewVehicle = (vehiculo) => {
  // Implementar vista de detalles
  console.log('Ver detalles:', vehiculo)
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  vehicleForm.value = {
    matricula: '',
    marca_id: '',
    modelo: '',
    año: new Date().getFullYear(),
    color: '',
    tipo_vehiculo_id: '',
    numero_motor: '',
    numero_chasis: '',
    kilometraje: 0
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
    case 'disponible': return 'bg-green-100 text-green-800'
    case 'asignado': return 'bg-blue-100 text-blue-800'
    case 'mantenimiento': return 'bg-yellow-100 text-yellow-800'
    case 'fuera_servicio': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (estado) => {
  switch (estado) {
    case 'disponible': return 'Disponible'
    case 'asignado': return 'Asignado'
    case 'mantenimiento': return 'Mantenimiento'
    case 'fuera_servicio': return 'Fuera de Servicio'
    default: return estado
  }
}

onMounted(() => {
  fetchData()
})
</script>

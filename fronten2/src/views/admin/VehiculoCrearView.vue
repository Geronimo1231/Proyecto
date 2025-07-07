<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <div>
                <router-link to="/admin/vehiculos" class="text-gray-400 hover:text-gray-500">
                  <TruckIcon class="flex-shrink-0 h-5 w-5" />
                  <span class="sr-only">Vehículos</span>
                </router-link>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <ChevronRightIcon class="flex-shrink-0 h-5 w-5 text-gray-400" />
                <span class="ml-4 text-sm font-medium text-gray-500">Crear Vehículo</span>
              </div>
            </li>
          </ol>
        </nav>
        <h2 class="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Crear Nuevo Vehículo
        </h2>
      </div>
    </div>

    <form @submit.prevent="createVehicle" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Formulario Principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Información Básica -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
              
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Matrícula *</label>
                  <input
                    v-model="form.licensePlate"
                    type="text"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="ABC-123"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                  <select
                    v-model="form.brand"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Seleccionar marca</option>
                    <option v-for="marca in marcas" :key="marca.id" :value="marca.name">
                      {{ marca.name }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                  <input
                    v-model="form.model"
                    type="text"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Corolla"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Año *</label>
                  <input
                    v-model="form.year"
                    type="number"
                    min="1900"
                    max="2025"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    v-model="form.color"
                    type="text"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Blanco"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    v-model="form.type"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option v-for="tipo in tiposVehicle" :key="tipo.id" :value="tipo.name">
                      {{ tipo.name }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Kilometraje</label>
                  <input
                    v-model="form.mileage"
                    type="number"
                    min="0"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    v-model="form.status"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="available">Disponible</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="out_of_service">Fuera de Servicio</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Información Adicional -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Información Adicional</h3>
              
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Número de Motor</label>
                  <input
                    v-model="form.engineNumber"
                    type="text"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="TOY2024001"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Número de Chasis</label>
                  <input
                    v-model="form.chassisNumber"
                    type="text"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="CHASIS001"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Imagen del Vehículo -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Imagen del Vehículo</h3>
              
              <!-- Vista previa de la imagen -->
              <div class="mb-4">
                <div class="aspect-w-16 aspect-h-9">
                  <img
                    :src="imagePreview || '/placeholder.svg?height=200&width=300'"
                    alt="Vista previa"
                    class="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              </div>
              
              <!-- Input para imagen -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar Imagen
                </label>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleImageChange"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p class="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF hasta 5MB
                </p>
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Acciones</h3>
              <div class="space-y-3">
                <button
                  type="submit"
                  :disabled="saving"
                  class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {{ saving ? 'Creando...' : 'Crear Vehículo' }}
                </button>
                
                <router-link
                  to="/admin/vehiculos"
                  class="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 block text-center"
                >
                  Cancelar
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TruckIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import api from '../../services/api'
import { toast } from 'vue3-toastify'

const router = useRouter()

const marcas = ref([])
const tiposVehicle = ref([])
const saving = ref(false)
const imagePreview = ref(null)
const fileInput = ref(null)

const form = ref({
  licensePlate: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  color: '',
  type: '',
  mileage: 0,
  status: 'available',
  engineNumber: '',
  chassisNumber: ''
})

const fetchData = async () => {
  try {
    const [marcasRes, tiposRes] = await Promise.all([
      api.get('/brands'),
      api.get('/vehicle-types')
    ])
    
    marcas.value = marcasRes.data.data || []
    tiposVehicle.value = tiposRes.data.data || []
  } catch (error) {
    console.error('Error al cargar datos:', error)
    toast.error('Error al cargar los datos')
  }
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede ser mayor a 5MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const createVehicle = async () => {
  try {
    saving.value = true
    
    const formData = new FormData()
    Object.keys(form.value).forEach(key => {
      formData.append(key, form.value[key])
    })
    
    // Agregar imagen si se seleccionó
    if (fileInput.value?.files[0]) {
      formData.append('image', fileInput.value.files[0])
    }
    
    const response = await api.post('/vehicles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    toast.success('Vehículo creado correctamente')
    router.push(`/admin/vehiculos/${response.data.data.id}`)
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al crear el vehículo')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

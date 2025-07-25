<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900">Crear Nuevo Vehículo</h3>
          <p class="mt-1 text-sm text-gray-600">
            Complete la información para registrar un nuevo vehículo en el sistema.
          </p>
        </div>

        <form @submit.prevent="createVehicle" class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Información básica -->
            <div class="space-y-6">
              <div>
                <label for="licensePlate" class="block text-sm font-medium text-gray-700">
                  Matrícula *
                </label>
                <input
                  id="licensePlate"
                  v-model="form.licensePlate"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="ABC-123"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="brand" class="block text-sm font-medium text-gray-700">
                    Marca *
                  </label>
                  <select
                    id="brand"
                    v-model="form.brand"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Seleccionar marca</option>
                    <option v-for="marca in brands" :key="marca.id" :value="marca.nombre">
                      {{ marca.nombre }}
                    </option>
                  </select>
                </div>

                <div>
                  <label for="model" class="block text-sm font-medium text-gray-700">
                    Modelo *
                  </label>
                  <input
                    id="model"
                    v-model="form.model"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Corolla"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="year" class="block text-sm font-medium text-gray-700">
                    Año *
                  </label>
                  <input
                    id="year"
                    v-model="form.year"
                    type="number"
                    min="1900"
                    :max="new Date().getFullYear() + 1"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label for="color" class="block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <input
                    id="color"
                    v-model="form.color"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Blanco"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="type" class="block text-sm font-medium text-gray-700">
                    Tipo de Vehículo
                  </label>
                  <select
                    id="type"
                    v-model="form.type"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option v-for="tipo in vehicleTypes" :key="tipo.id" :value="tipo.nombre">
                      {{ tipo.nombre }}
                    </option>
                  </select>
                </div>

                <div>
                  <label for="mileage" class="block text-sm font-medium text-gray-700">
                    Kilometraje
                  </label>
                  <input
                    id="mileage"
                    v-model="form.mileage"
                    type="number"
                    min="0"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="engineNumber" class="block text-sm font-medium text-gray-700">
                    Número de Motor
                  </label>
                  <input
                    id="engineNumber"
                    v-model="form.engineNumber"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="ENG123456"
                  />
                </div>

                <div>
                  <label for="chassisNumber" class="block text-sm font-medium text-gray-700">
                    Número de Chasis
                  </label>
                  <input
                    id="chassisNumber"
                    v-model="form.chassisNumber"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="CHS123456"
                  />
                </div>
              </div>

              <!-- Nuevos campos Latitud y Longitud -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="latitude" class="block text-sm font-medium text-gray-700">
                    Latitud
                  </label>
                  <input
                    id="latitude"
                    v-model="form.latitude"
                    type="number"
                    step="any"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="-12.04318"
                  />
                </div>

                <div>
                  <label for="longitude" class="block text-sm font-medium text-gray-700">
                    Longitud
                  </label>
                  <input
                    id="longitude"
                    v-model="form.longitude"
                    type="number"
                    step="any"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="-77.02824"
                  />
                </div>
              </div>

              <button
                type="button"
                @click="getCurrentLocation"
                class="mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Usar mi ubicación actual
              </button>

              <div>
                <label for="status" class="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  id="status"
                  v-model="form.status"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="available">Disponible</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="out_of_service">Fuera de Servicio</option>
                </select>
              </div>
            </div>

            <!-- Imagen del vehículo -->
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del Vehículo (Opcional)
                </label>
                <ImageUploader
                  v-model="form.image"
                  :storage-key="`vehicle-create-${Date.now()}`"
                  @uploaded="handleImageUploaded"
                  @error="handleImageError"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <router-link
              to="/admin/vehiculos"
              class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancelar
            </router-link>
            <button
              type="submit"
              :disabled="loading"
              class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {{ loading ? 'Creando...' : 'Crear Vehículo' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { toast } from 'vue3-toastify'
import ImageUploader from '@/components/ImageUploader.vue'

const router = useRouter()
const loading = ref(false)
const brands = ref([])
const vehicleTypes = ref([])

const form = ref({
  licensePlate: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  color: '',
  type: '',
  mileage: 0,
  engineNumber: '',
  chassisNumber: '',
  status: 'available',
  image: '',
  latitude: '',    // Nuevos campos
  longitude: ''
})

const fetchData = async () => {
  try {
    const [brandsRes, typesRes] = await Promise.all([
      api.get('/brands'),
      api.get('/vehicles-types')
    ])
    
    brands.value = brandsRes.data.data || []
    vehicleTypes.value = typesRes.data.data || []
  } catch (error) {
    console.error('Error al cargar datos:', error)
    toast.error('Error al cargar los datos de marcas y tipos')
  }
}

const handleImageUploaded = (imageData) => {
  console.log('Imagen subida:', imageData)
  form.value.image = imageData.url || imageData // Ajusta según lo que retorne tu uploader
}

const handleImageError = (error) => {
  console.error('Error al subir imagen:', error)
  toast.error('Error al subir la imagen')
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    toast.error('La geolocalización no está soportada por este navegador.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      form.value.latitude = position.coords.latitude
      form.value.longitude = position.coords.longitude
      toast.success('Ubicación obtenida correctamente')
    },
    error => {
      toast.error('No se pudo obtener la ubicación: ' + error.message)
    }
  )
}

const createVehicle = async () => {
  try {
    loading.value = true
    
    const formData = new FormData()
    
    // Agregar todos los campos del formulario excepto 'image'
    Object.keys(form.value).forEach(key => {
      if (key !== 'image' && form.value[key] !== '') {
        formData.append(key, form.value[key])
      }
    })
    
    // Enviar la URL de la imagen si existe
    if (form.value.image) {
      formData.append('imageUrl', form.value.image)
    }
    
    const response = await api.post('/vehicles', formData)
    
    if (response.data.success) {
      toast.success('Vehículo creado correctamente')
      router.push('/admin/vehiculos')
    } else {
      toast.error(response.data.message || 'Error al crear el vehículo')
    }
  } catch (error) {
    console.error('Error al crear vehículo:', error)
    toast.error(error.response?.data?.message || 'Error al crear el vehículo')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

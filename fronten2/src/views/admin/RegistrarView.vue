<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Registro Rápido
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Registra nuevos usuarios y vehículos de forma rápida
        </p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Register User -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Registrar Nuevo Usuario</h3>
          
          <form @submit.prevent="registerUser" class="space-y-4">
            <!-- Foto de perfil -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Foto de perfil</label>
              <ImageUploader
                v-model="userForm.photo"
                alt="Foto de perfil"
                :storage-key="`user-photo-${Date.now()}`"
                @uploaded="onUserPhotoUploaded"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  v-model="userForm.firstName"
                  type="text"
                  required
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                <input
                  v-model="userForm.lastName"
                  type="text"
                  required
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                v-model="userForm.email"
                type="email"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                v-model="userForm.phone"
                type="tel"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
              <input
                v-model="userForm.password"
                type="password"
                required
                minlength="8"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <p class="mt-1 text-xs text-gray-500">
                Mínimo 8 caracteres
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
              <select
                v-model="userForm.role"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Seleccionar rol</option>
                <option value="Admin">Administrador</option>
                <option value="User">Usuario</option>
              </select>
            </div>
            
            <button
              type="submit"
              :disabled="userLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {{ userLoading ? 'Registrando...' : 'Registrar Usuario' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Register Vehicle -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Registrar Nuevo Vehículo</h3>
          
          <form @submit.prevent="registerVehicle" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Matrícula *</label>
              <input
                v-model="vehicleForm.licensePlate"
                type="text"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                <input
                  v-model="vehicleForm.brand"
                  type="text"
                  required
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                <input
                  v-model="vehicleForm.model"
                  type="text"
                  required
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Año *</label>
                <input
                  v-model="vehicleForm.year"
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
                  v-model="vehicleForm.color"
                  type="text"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <button
              type="submit"
              :disabled="vehicleLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {{ vehicleLoading ? 'Registrando...' : 'Registrar Vehículo' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Quick Assign -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Asignación Rápida</h3>
        
        <form @submit.prevent="quickAssign" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <select
              v-model="assignForm.userId"
              required
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Seleccionar usuario</option>
              <option v-for="usuario in usersDisponibles" :key="usuario.id" :value="usuario.id">
                {{ usuario.firstName }} {{ usuario.lastName }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
            <select
              v-model="assignForm.vehicleId"
              required
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Seleccionar vehículo</option>
              <option v-for="vehiculo in vehicleDisponibles" :key="vehiculo.id" :value="vehiculo.id">
                {{ vehiculo.licensePlate }} - {{ vehiculo.model }}
              </option>
            </select>
          </div>
          
          <div class="flex items-end">
            <button
              type="submit"
              :disabled="assignLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {{ assignLoading ? 'Asignando...' : 'Asignar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
        <div class="flow-root">
          <ul class="-mb-8">
            <li v-for="(activity, index) in recentActivity" :key="activity.id" class="relative pb-8">
              <div v-if="index !== recentActivity.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
              <div class="relative flex space-x-3">
                <div>
                  <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                        :class="getActivityColor(activity.type)">
                    <component :is="getActivityIcon(activity.type)" class="h-4 w-4 text-white" />
                  </span>
                </div>
                <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p class="text-sm text-gray-500">{{ activity.description }}</p>
                  </div>
                  <div class="text-right text-sm whitespace-nowrap text-gray-500">
                    {{ formatDate(activity.created_at) }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PlusIcon, TruckIcon, UserPlusIcon } from '@heroicons/vue/24/outline'
import ImageUploader from '../../components/ImageUploader.vue'
import api from '../../services/api'
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const usersDisponibles = ref([])
const vehicleDisponibles = ref([])
const recentActivity = ref([])

const userLoading = ref(false)
const vehicleLoading = ref(false)
const assignLoading = ref(false)

const userForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  role: '',
  photo: ''
})

const vehicleForm = ref({
  licensePlate: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  color: ''
})

const assignForm = ref({
  userId: '',
  vehicleId: ''
})

const fetchData = async () => {
  try {
    const [usersRes, vehiclesRes, activityRes] = await Promise.all([
      api.get('/users?role=User'),
      api.get('/vehicles?status=available'),
      api.get('/dashboard/activity?limit=10')
    ])
    
    usersDisponibles.value = usersRes.data.data?.users || usersRes.data.data || []
    vehicleDisponibles.value = vehiclesRes.data.vehicles || vehiclesRes.data.data || []
    recentActivity.value = activityRes.data.data || []
  } catch (error) {
    console.error('Error al cargar los datos:', error)
    toast.error('Error al cargar los datos')
  }
}

const onUserPhotoUploaded = (imageData) => {
  console.log('Foto subida:', imageData)
}

const registerUser = async () => {
  try {
    userLoading.value = true
    
    const userData = {
      firstName: userForm.value.firstName,
      lastName: userForm.value.lastName,
      email: userForm.value.email,
      phone: userForm.value.phone,
      password: userForm.value.password,
      role: userForm.value.role,
      photo: userForm.value.photo || '/placeholder.svg?height=100&width=100'
    }
    
    await api.post('/users', userData)
    toast.success('Usuario registrado correctamente')
    
    // Reset form
    userForm.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: '',
      photo: ''
    }
    
    await fetchData()
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    toast.error(error.response?.data?.message || 'Error al registrar el usuario')
  } finally {
    userLoading.value = false
  }
}

const registerVehicle = async () => {
  try {
    vehicleLoading.value = true
    await api.post('/vehicles', vehicleForm.value)
    toast.success('Vehículo registrado correctamente')
    
    // Reset form
    vehicleForm.value = {
      licensePlate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: ''
    }
    
    await fetchData()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al registrar el vehículo')
  } finally {
    vehicleLoading.value = false
  }
}

const quickAssign = async () => {
  try {
    assignLoading.value = true
    await api.post('/assignments', assignForm.value)
    toast.success('Vehículo asignado correctamente')
    
    // Reset form
    assignForm.value = {
      userId: '',
      vehicleId: ''
    }
    
    await fetchData()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al asignar el vehículo')
  } finally {
    assignLoading.value = false
  }
}

const getActivityIcon = (type) => {
  switch (type) {
    case 'user': return UserPlusIcon
    case 'vehicle': return TruckIcon
    case 'assign': return PlusIcon
    default: return PlusIcon
  }
}

const getActivityColor = (type) => {
  switch (type) {
    case 'user': return 'bg-blue-500'
    case 'vehicle': return 'bg-green-500'
    case 'assign': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}

const formatDate = (date) => {
  return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: es })
}

onMounted(() => {
  fetchData()
})
</script>

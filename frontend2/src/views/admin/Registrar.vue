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
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  v-model="userForm.nombre"
                  type="text"
                  required
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                <input
                  v-model="userForm.apellido"
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
                v-model="userForm.telefono"
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
                Mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
              <select
                v-model="userForm.rol_id"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Seleccionar rol</option>
                <option v-for="rol in roles" :key="rol.id" :value="rol.id">
                  {{ rol.nombre === 'admin' ? 'Administrador' : 'Usuario' }}
                </option>
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
              v-model="assignForm.usuario_id"
              required
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Seleccionar usuario</option>
              <option v-for="usuario in usuariosDisponibles" :key="usuario.id" :value="usuario.id">
                {{ usuario.nombre }} {{ usuario.apellido }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
            <select
              v-model="assignForm.vehiculo_id"
              required
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Seleccionar vehículo</option>
              <option v-for="vehiculo in vehiculosDisponibles" :key="vehiculo.id" :value="vehiculo.id">
                {{ vehiculo.matricula }} - {{ vehiculo.modelo }}
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
import api from '../../services/api'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const toast = useToast()

const roles = ref([])
const marcas = ref([])
const tiposVehiculos = ref([])
const usuariosDisponibles = ref([])
const vehiculosDisponibles = ref([])
const recentActivity = ref([])

const userLoading = ref(false)
const vehicleLoading = ref(false)
const assignLoading = ref(false)

const userForm = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  password: '',
  rol_id: ''
})

const vehicleForm = ref({
  matricula: '',
  marca_id: '',
  modelo: '',
  año: new Date().getFullYear(),
  color: '',
  tipo_vehiculo_id: '',
  kilometraje: 0
})

const assignForm = ref({
  usuario_id: '',
  vehiculo_id: ''
})

const fetchData = async () => {
  try {
    const [rolesRes, marcasRes, tiposRes, usuariosRes, vehiculosRes, activityRes] = await Promise.all([
      api.get('/roles'),
      api.get('/marcas'),
      api.get('/tipos-vehiculos'),
      api.get('/usuarios?rol=usuario&activo=true'),
      api.get('/vehiculos?estado=disponible'),
      api.get('/dashboard/activity?limit=10')
    ])
    
    roles.value = rolesRes.data.data
    marcas.value = marcasRes.data.data
    tiposVehiculos.value = tiposRes.data.data
    usuariosDisponibles.value = usuariosRes.data.data
    vehiculosDisponibles.value = vehiculosRes.data.data
    recentActivity.value = activityRes.data.data
  } catch (error) {
    toast.error('Error al cargar los datos')
  }
}

const registerUser = async () => {
  try {
    userLoading.value = true
    await api.post('/usuarios', userForm.value)
    toast.success('Usuario registrado correctamente')
    
    // Reset form
    userForm.value = {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      password: '',
      rol_id: ''
    }
    
    await fetchData()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al registrar el usuario')
  } finally {
    userLoading.value = false
  }
}

const registerVehicle = async () => {
  try {
    vehicleLoading.value = true
    await api.post('/vehiculos', vehicleForm.value)
    toast.success('Vehículo registrado correctamente')
    
    // Reset form
    vehicleForm.value = {
      matricula: '',
      marca_id: '',
      modelo: '',
      año: new Date().getFullYear(),
      color: '',
      tipo_vehiculo_id: '',
      kilometraje: 0
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
    await api.post('/asignaciones', assignForm.value)
    toast.success('Vehículo asignado correctamente')
    
    // Reset form
    assignForm.value = {
      usuario_id: '',
      vehiculo_id: ''
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

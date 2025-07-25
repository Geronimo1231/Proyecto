<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Mi Perfil de Administrador
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Information -->
      <div class="lg:col-span-2">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
            
            <form @submit.prevent="updateProfile" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    v-model="profileForm.firstName"
                    type="text"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input
                    v-model="profileForm.lastName"
                    type="text"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  v-model="profileForm.email"
                  type="email"
                  required
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  v-model="profileForm.phone"
                  type="tel"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Foto de Perfil</label>
                <div class="mt-1 flex items-center space-x-4">
                  <img
                    class="h-12 w-12 rounded-full"
                    :src="profileForm.photo || '/placeholder.svg?height=48&width=48'"
                    :alt="profileForm.firstName"
                  />
                  <input
                    ref="photoInput"
                    type="file"
                    accept="image/*"
                    @change="handlePhotoChange"
                    class="hidden"
                  />
                  <button
                    type="button"
                    @click="$refs.photoInput.click()"
                    class="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cambiar foto
                  </button>
                </div>
              </div>
              
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="profileLoading"
                  class="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {{ profileLoading ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Change Password -->
        <div class="bg-white shadow rounded-lg mt-6">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Cambiar Contraseña</h3>
            
            <form @submit.prevent="changePassword" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual *</label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  required
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña *</label>
                <input
                  v-model="passwordForm.newPassword"
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
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña *</label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  required
                  minlength="8"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="passwordLoading"
                  class="bg-red-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {{ passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Profile Summary -->
      <div class="space-y-6">
        <!-- Account Info -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Información de Cuenta</h3>
            
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">Rol</dt>
                <dd class="text-sm text-gray-900">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800">
                    {{ getRoleText(authStore.user?.role) }}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Fecha de Registro</dt>
                <dd class="text-sm text-gray-900">{{ formatDate(authStore.user?.createdAt) }}</dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Última Actualización</dt>
                <dd class="text-sm text-gray-900">{{ formatDate(authStore.user?.updatedAt) }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- System Stats -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Estadísticas del Sistema</h3>
            
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Total Usuarios:</span>
                <span class="text-sm font-medium text-gray-900">{{ systemStats.totalUsers || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Total Vehículos:</span>
                <span class="text-sm font-medium text-gray-900">{{ systemStats.totalVehicles || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Asignaciones Activas:</span>
                <span class="text-sm font-medium text-gray-900">{{ systemStats.activeAssignments || 0 }}</span>
              </div>
            </div>
            
            <div class="mt-4">
              <router-link
                to="/admin/dashboard"
                class="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700"
              >
                Ver Dashboard Completo
              </router-link>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
            
            <div class="space-y-3">
              <router-link
                to="/admin/usuarios/crear"
                class="w-full bg-green-50 text-green-700 text-sm font-medium py-2 px-3 rounded hover:bg-green-100 flex items-center"
              >
                <UserPlusIcon class="h-4 w-4 mr-2" />
                Crear Usuario
              </router-link>
              
              <router-link
                to="/admin/vehiculos/crear"
                class="w-full bg-blue-50 text-blue-700 text-sm font-medium py-2 px-3 rounded hover:bg-blue-100 flex items-center"
              >
                <TruckIcon class="h-4 w-4 mr-2" />
                Agregar Vehículo
              </router-link>
              
              <router-link
                to="/admin/asignaciones/crear"
                class="w-full bg-yellow-50 text-yellow-700 text-sm font-medium py-2 px-3 rounded hover:bg-yellow-100 flex items-center"
              >
                <ClipboardDocumentListIcon class="h-4 w-4 mr-2" />
                Nueva Asignación
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { UserPlusIcon, TruckIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const authStore = useAuthStore()

const profileLoading = ref(false)
const passwordLoading = ref(false)
const systemStats = ref({})

const profileForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  photo: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const fetchSystemStats = async () => {
  try {
    const response = await api.get('/dashboard/stats')
    if (response.data.success) {
      systemStats.value = response.data.data.stats
    }
  } catch (error) {
    console.error('Error fetching system stats:', error)
  }
}

const updateProfile = async () => {
  try {
    profileLoading.value = true
    const response = await api.put('/user/profile', profileForm.value)
    
    if (response.data.success) {
      // Actualizar datos del usuario en el store
      authStore.user = { ...authStore.user, ...response.data.data }
      toast.success('Perfil actualizado correctamente')
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al actualizar el perfil')
  } finally {
    profileLoading.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error('Las contraseñas no coinciden')
    return
  }

  try {
    passwordLoading.value = true
    await api.put('/user/change-password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    toast.success('Contraseña cambiada correctamente')
    
    // Limpiar formulario
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al cambiar la contraseña')
  } finally {
    passwordLoading.value = false
  }
}

const handlePhotoChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('photo', file)

  try {
    const response = await api.post('/user/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (response.data.success) {
      profileForm.value.photo = response.data.photoUrl
      authStore.user.photo = response.data.photoUrl
      toast.success('Foto actualizada correctamente')
    }
  } catch (error) {
    toast.error('Error al subir la foto')
  }
}

const getRoleText = (role) => {
  switch (role) {
    case 'GlobalAdmin': return 'Administrador Global'
    case 'Admin': return 'Administrador'
    case 'User': return 'Usuario'
    default: return role
  }
}

const formatDate = (date) => {
  if (!date) return 'No disponible'
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es })
}

onMounted(() => {
  // Inicializar formulario con datos del usuario
  if (authStore.user) {
    profileForm.value = {
      firstName: authStore.user.firstName || '',
      lastName: authStore.user.lastName || '',
      email: authStore.user.email || '',
      phone: authStore.user.phone || '',
      photo: authStore.user.photo || ''
    }
  }
  
  fetchSystemStats()
})
</script>

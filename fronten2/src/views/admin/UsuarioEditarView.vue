<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <div>
                <router-link to="/admin/usuarios" class="text-gray-400 hover:text-gray-500">
                  <UserIcon class="flex-shrink-0 h-5 w-5" />
                  <span class="sr-only">Usuarios</span>
                </router-link>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <ChevronRightIcon class="flex-shrink-0 h-5 w-5 text-gray-400" />
                <span class="ml-4 text-sm font-medium text-gray-500">Editar Usuario</span>
              </div>
            </li>
          </ol>
        </nav>
        <h2 class="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Editar Usuario
        </h2>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <form v-else @submit.prevent="updateUser" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Formulario Principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Información Personal -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
              
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    v-model="form.firstName"
                    type="text"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input
                    v-model="form.lastName"
                    type="text"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                  <select
                    v-model="form.role"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="Admin">Administrador</option>
                    <option value="User">Usuario</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    v-model="form.isActive"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option :value="true">Activo</option>
                    <option :value="false">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Cambiar Contraseña -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Cambiar Contraseña</h3>
              <p class="text-sm text-gray-600 mb-4">Deja en blanco si no deseas cambiar la contraseña</p>
              
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                  <input
                    v-model="form.password"
                    type="password"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                  <input
                    v-model="form.confirmPassword"
                    type="password"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Foto del Usuario -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Foto del Usuario</h3>
              
              <!-- Vista previa de la imagen actual -->
              <div class="mb-4">
                <div class="flex justify-center">
                  <img
                    :src="imagePreview || user?.photo || '/placeholder.svg?height=150&width=150'"
                    :alt="form.firstName"
                    class="w-32 h-32 object-cover rounded-full"
                  />
                </div>
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
                  {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
                
                <router-link
                  to="/admin/usuarios"
                  class="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 block text-center"
                >
                  Cancelar
                </router-link>
                
                <button
                  type="button"
                  @click="deleteUser"
                  class="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                >
                  Eliminar Usuario
                </button>
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
import { useRoute, useRouter } from 'vue-router'
import { UserIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import api from '../../services/api'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()

const userId = route.params.id
const user = ref(null)
const loading = ref(true)
const saving = ref(false)
const imagePreview = ref(null)
const fileInput = ref(null)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: '',
  isActive: true,
  password: '',
  confirmPassword: ''
})

const fetchUser = async () => {
  try {
    loading.value = true
    const response = await api.get(`/users/${userId}`)
    
    if (response.data.success) {
      user.value = response.data.data
    } else {
      user.value = response.data.data || response.data
    }
    
    // Llenar el formulario con los datos del usuario
    if (user.value) {
      form.value = {
        firstName: user.value.firstName || '',
        lastName: user.value.lastName || '',
        email: user.value.email || '',
        phone: user.value.phone || '',
        role: user.value.role || '',
        isActive: user.value.isActive !== undefined ? user.value.isActive : true,
        password: '',
        confirmPassword: ''
      }
    }
  } catch (error) {
    console.error('Error al cargar usuario:', error)
    toast.error('Error al cargar los datos del usuario')
    router.push('/admin/usuarios')
  } finally {
    loading.value = false
  }
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 20 * 1024 * 1024) {
      toast.error('La imagen no puede ser mayor a 20MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const updateUser = async () => {
  try {
    // Validar contraseñas si se proporcionaron
    if (form.value.password && form.value.password !== form.value.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    
    saving.value = true
    
    const formData = new FormData()
    Object.keys(form.value).forEach(key => {
      if (key !== 'confirmPassword' && form.value[key] !== null && form.value[key] !== undefined) {
        // Solo enviar la contraseña si no está vacía
        if (key === 'password' && !form.value[key]) {
          return
        }
        formData.append(key, form.value[key])
      }
    })
    
    // Agregar imagen si se seleccionó una nueva
    if (fileInput.value?.files[0]) {
      formData.append('photo', fileInput.value.files[0])
    }
    
    const response = await api.put(`/users/${userId}`, formData, 
    
  )
    
    if (response.data.success || response.status === 200) {
      toast.success('Usuario actualizado correctamente')
      router.push('/admin/usuarios')
    } else {
      throw new Error(response.data.message || 'Error al actualizar')
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    toast.error(error.response?.data?.message || 'Error al actualizar el usuario')
  } finally {
    saving.value = false
  }
}

const deleteUser = async () => {
  if (confirm(`¿Estás seguro de eliminar al usuario ${user.value?.firstName} ${user.value?.lastName}? Esta acción no se puede deshacer.`)) {
    try {
      await api.delete(`/users/${userId}`)
      toast.success('Usuario eliminado correctamente')
      router.push('/admin/usuarios')
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      toast.error('Error al eliminar el usuario')
    }
  }
}

onMounted(() => {
  fetchUser()
})
</script>

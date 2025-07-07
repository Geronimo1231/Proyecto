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
                <span class="ml-4 text-sm font-medium text-gray-500">Crear Usuario</span>
              </div>
            </li>
          </ol>
        </nav>
        <h2 class="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Crear Nuevo Usuario
        </h2>
      </div>
    </div>

    <form @submit.prevent="createUser" class="space-y-6">
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
                    placeholder="Juan"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input
                    v-model="form.lastName"
                    type="text"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Pérez"
                  />
                </div>
                
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="juan.perez@ejemplo.com"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="+52 33 1234 5678"
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
              </div>
            </div>
          </div>

          <!-- Información de Acceso -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Información de Acceso</h3>
              
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                  <input
                    v-model="form.password"
                    type="password"
                    required
                    minlength="8"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos.
                  </p>
                </div>
                
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
                  <input
                    v-model="form.confirmPassword"
                    type="password"
                    required
                    minlength="8"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Confirmar contraseña"
                  />
                  <p v-if="form.password && form.confirmPassword && form.password !== form.confirmPassword" 
                     class="mt-1 text-xs text-red-600">
                    Las contraseñas no coinciden
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Foto de Perfil -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Foto de Perfil</h3>
              
              <!-- Vista previa de la imagen -->
              <div class="mb-4 flex justify-center">
                <div class="h-32 w-32">
                  <img
                    :src="imagePreview || '/placeholder.svg?height=128&width=128'"
                    alt="Vista previa"
                    class="h-32 w-32 object-cover rounded-full"
                  />
                </div>
              </div>
              
              <!-- Input para imagen -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar Foto
                </label>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleImageChange"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p class="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF hasta 2MB
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
                  :disabled="saving || !isFormValid"
                  class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {{ saving ? 'Creando...' : 'Crear Usuario' }}
                </button>
                
                <router-link
                  to="/admin/usuarios"
                  class="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 block text-center"
                >
                  Cancelar
                </router-link>
              </div>
            </div>
          </div>

          <!-- Información Adicional -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Información</h3>
              <div class="text-sm text-gray-600 space-y-2">
                <p>• Los usuarios con rol "Administrador" tendrán acceso completo al sistema.</p>
                <p>• Los usuarios con rol "Usuario" solo podrán ver sus vehículos asignados.</p>
                <p>• Se enviará un email de bienvenida al usuario creado.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { UserIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import api from '../../services/api'
import { toast } from 'vue3-toastify'

const router = useRouter()

const saving = ref(false)
const imagePreview = ref(null)
const fileInput = ref(null)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: ''
})

const isFormValid = computed(() => {
  return form.value.firstName && 
         form.value.lastName && 
         form.value.email && 
         form.value.password && 
         form.value.confirmPassword &&
         form.value.role &&
         form.value.password === form.value.confirmPassword &&
         form.value.password.length >= 8
})

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede ser mayor a 2MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const createUser = async () => {
  if (!isFormValid.value) {
    toast.error('Por favor completa todos los campos requeridos')
    return
  }

  try {
    saving.value = true
    
    const formData = new FormData()
    formData.append('firstName', form.value.firstName)
    formData.append('lastName', form.value.lastName)
    formData.append('email', form.value.email)
    formData.append('phone', form.value.phone)
    formData.append('password', form.value.password)
    formData.append('role', form.value.role)
    
    // Agregar imagen si se seleccionó
    if (fileInput.value?.files[0]) {
      formData.append('photo', fileInput.value.files[0])
    }
    
    const response = await api.post('/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    toast.success('Usuario creado correctamente')
    router.push('/admin/usuarios')
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al crear el usuario')
  } finally {
    saving.value = false
  }
}
</script>

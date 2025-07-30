<template> 
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Editar Mi Perfil
        </h2>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <form v-else @submit.prevent="updateUser" class="space-y-6" enctype="multipart/form-data">
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
                  <input
                    type="text"
                    :value="form.role"
                    disabled
                    class="block w-full rounded-md border-gray-300 bg-gray-100 cursor-not-allowed sm:text-sm"
                  />
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
              
              <!-- Componente para subir imagen -->
              <ImageUploader
                v-model="form.photo"
                :storage-key="`user-profile-${Date.now()}`"
                @uploaded="handleImageUploaded"
                @error="handleImageError"
              />
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
                  to="/"
                  class="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 block text-center"
                >
                  Cancelar
                </router-link>

                <!-- Eliminar NO disponible para usuarios -->
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
import api from '../../services/api'
import { toast } from 'vue3-toastify'
import ImageUploader from '@/components/ImageUploader.vue'

const router = useRouter()

const user = ref(null)
const loading = ref(true)
const saving = ref(false)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: '',
  photo: null,
  password: '',
  confirmPassword: ''
})

const fetchUser = async () => {
  try {
    loading.value = true
    const response = await api.get('/auth/me')
    const userData = response.data.user || response.data

    user.value = userData

    form.value = {
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      phone: userData.phone || '',
      role: userData.role || '',
      photo: userData.photo || null,
      password: '',
      confirmPassword: ''
    }
  } catch (error) {
    console.error('Error al cargar usuario:', error)
    toast.error('Error al cargar tus datos')
    router.push('/')
  } finally {
    loading.value = false
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

const updateUser = async () => {
  try {
    if (form.value.password && form.value.password !== form.value.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    saving.value = true

    const formData = new FormData()
    console.log('form', form.value)

    Object.keys(form.value).forEach(key => {
      // No enviar confirmPassword ni role (no editable por usuario)
      if (key !== 'confirmPassword' && key !== 'role' &&
          form.value[key] !== null && form.value[key] !== undefined) {

        // No enviar password si está vacío
        if (key === 'password' && !form.value[key]) return

        // Para la imagen, puede ser string (url) o File
        if (key === 'image' && typeof form.value.image === 'string') {
          // Si es url, no la enviamos, porque no es un archivo nuevo
          return
        }

        formData.append(key, form.value[key])
      }
    })

    // Si usas input file en otro lado, lo agregarías aquí
    // formData.append('photo', fileInput.value.files[0]) 

    const response = await api.put('/users/me', formData)

    if (response.data.success || response.status === 200) {
      toast.success('Datos actualizados correctamente')
      router.push('/user/perfil')
    } else {
      throw new Error(response.data.message || 'Error al actualizar')
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    toast.error(error.response?.data?.message || 'Error al actualizar')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchUser()
})
</script>
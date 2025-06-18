<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Gestión de Usuarios
        </h2>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <button
          @click="showAddModal = true"
          class="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" />
          Agregar Usuario
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Nombre, email..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            v-model="filters.rol"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="usuario">Usuario</option>
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

    <!-- Users Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contacto
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vehículos
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="usuario in filteredUsuarios" :key="usuario.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <img
                    class="h-10 w-10 rounded-full"
                    :src="usuario.foto_perfil || '/placeholder.svg?height=40&width=40'"
                    :alt="usuario.nombre"
                  />
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ usuario.nombre }} {{ usuario.apellido }}
                  </div>
                  <div class="text-sm text-gray-500">{{ usuario.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ usuario.telefono || 'No especificado' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="usuario.rol === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'"
              >
                {{ usuario.rol === 'admin' ? 'Administrador' : 'Usuario' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ usuario.vehiculos_asignados || 0 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ usuario.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <button
                @click="editUser(usuario)"
                class="text-blue-600 hover:text-blue-900"
              >
                Editar
              </button>
              <button
                @click="toggleUserStatus(usuario)"
                :class="usuario.activo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
              >
                {{ usuario.activo ? 'Desactivar' : 'Activar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="saveUser">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {{ showAddModal ? 'Agregar Nuevo Usuario' : 'Editar Usuario' }}
              </h3>
              
              <div class="space-y-4">
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
                
                <div v-if="showAddModal">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                  <input
                    v-model="userForm.password"
                    type="password"
                    required
                    minlength="8"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    Mínimo 8 caracteres, debe incluir mayúscula, minúscula, número y carácter especial
                  </p>
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
import { PlusIcon } from '@heroicons/vue/24/outline'
import api from '../../services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()

const usuarios = ref([])
const roles = ref([])
const loading = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)

const filters = ref({
  search: '',
  rol: ''
})

const userForm = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  password: '',
  rol_id: ''
})

const filteredUsuarios = computed(() => {
  return usuarios.value.filter(usuario => {
    const matchesSearch = !filters.value.search || 
      usuario.nombre.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      usuario.email.toLowerCase().includes(filters.value.search.toLowerCase())
    
    const matchesRol = !filters.value.rol || usuario.rol === filters.value.rol
    
    return matchesSearch && matchesRol
  })
})

const fetchData = async () => {
  try {
    const [usuariosRes, rolesRes] = await Promise.all([
      api.get('/usuarios'),
      api.get('/roles')
    ])
    
    usuarios.value = usuariosRes.data.data
    roles.value = rolesRes.data.data
  } catch (error) {
    toast.error('Error al cargar los datos')
  }
}

const saveUser = async () => {
  try {
    loading.value = true
    
    if (showEditModal.value) {
      await api.put(`/usuarios/${userForm.value.id}`, userForm.value)
      toast.success('Usuario actualizado correctamente')
    } else {
      await api.post('/usuarios', userForm.value)
      toast.success('Usuario agregado correctamente')
    }
    
    await fetchData()
    closeModal()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al guardar el usuario')
  } finally {
    loading.value = false
  }
}

const editUser = (usuario) => {
  userForm.value = { ...usuario }
  showEditModal.value = true
}

const toggleUserStatus = async (usuario) => {
  try {
    await api.patch(`/usuarios/${usuario.id}/toggle-status`)
    toast.success(`Usuario ${usuario.activo ? 'desactivado' : 'activado'} correctamente`)
    await fetchData()
  } catch (error) {
    toast.error('Error al cambiar el estado del usuario')
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  userForm.value = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    rol_id: ''
  }
}

const resetFilters = () => {
  filters.value = {
    search: '',
    rol: ''
  }
}

onMounted(() => {
  fetchData()
})
</script>

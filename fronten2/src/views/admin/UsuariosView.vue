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
        <router-link
          to="/admin/usuarios/crear"
          class="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" />
          Agregar Usuario
        </router-link>
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
            <option value="Admin">Administrador</option>
            <option value="User">Usuario</option>
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
              Estado
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="usuario in filteredUsers" :key="usuario.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <img
                    class="h-10 w-10 rounded-full"
                    :src="usuario.photo || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKkAAACUCAMAAADf7/luAAAAYFBMVEXZ3OFwd3/c3+Ryd3xydn9weHtweH1scXXh5OnZ3eBtdHxrdXfQ09hvdHjV2N1sdHrHytC+wsZ/hom2ur+Wm5+HjJBmbXSPkpewtbmfpKh7gIWprrJlbnDJztGNlZmFi5S+luYFAAAE4klEQVR4nO2c2ZajIBBAtVBxAfcVNf3/fzmYTKY73VlAMGXP8Z4z89QP94AURVHEcQ4ODg4ODg4ODg4ODg4ODg5eAAuh/Ict8hwInbwah2EYq9wJdysLkFaN68ZxlmVx7Lpdle5yZMGZB95KwX/ElNe5szvXcK4JJe4NhFO/nkNstRsAejd27xG7454+AZi79q7nMrC0m3ejCnmZ+A9NCS3znahGBbk/81cyUuxCFQrOn4rKlcX3oAo54eSFqfwL/A8AWPl86i/wEn1ZRU2iICojQIMsGo5toGLquu2IugXAnKl5ShLc+e80TDtET6jIi2X/Bd/HDFXNqwD11TTBW1RQtOqickwntEENTyqh9JPshLT8gb3YRX/OP8MZ1HBUX/hnAj7imMJJaXv6hPAOxVTu+NqmJcr0Q0Eeps+PVHESVei/n/BeE1copsMK0wFB1InqFaa1EyGonjS20qvpKcIw1dn0r6ZN+itMPS9uUGb/PzdNEUSdbsV3ipP3r4tSCKyI/IQOGJ8pjLqmvk9HBNEV+77vJz1OLsU1cynP83ByqVxomwqcQlqqVpL6avqBEk6dsNY0DZIa6RzVa5uiLCiZoP6aU7QTfmhWJhqswiRUD+927tKinKLOpEJj/gkXOCt/IdLZUAlFqqAsACvVCz5IZYmrak991Y2KIoWov4Snx/eQt8Qd7qU0MKEW/mOBOfdn1cJXCap+gH8fGRYPbvZvRnQXd7xQiOzZFQohQSb2ICqj6lzSx6pkueBHvzT9C4SjoA9NuRh31I8E8xC0WfAVKSn/zyYx7GVALwCwsZymxP+HG8fJNJUj22EfErC+bkpxERVCfNQ9g331IF0BgIjlRVFUVZHnLNpT+9FP4BNslYOD/4ToDLbFa2So2rvpEpgYY3N+hrHU2WOsArlDFf1QN40Q3rn+WDaneugLtidZ6ZLmQ+n7yULsSVOpyjlPljSgHIp0H7bgzNUpbuNHiX8ct6SuZnRXgKoWSeKdB/I+nkcoFUPlYCYrEPXiPMUvTAmRfyV6tPxPpqT+pF5D8Scx4jR3RH1DfV+nW47TBmFcIW/O864s6i75dcKbHN66JwAbqGZB+gLhdHjnJxAWzZNz81NTQqbmbYd/cEY3I+tMperybOI9XyukXfskKCkQTF36BlWYyyQwNPWTZvMiQAS5QsHsNfHmDf5QrFvzP9j62cTSGL1uJX2H8E0LlVBwG1N/dd1OFYpJtzvymSmhW32rMItM8UGEmirf6LofUo3LJzWSZpO4Cl1ic0QXfLpFO3I4Uosf6YXAzezfUELhW4pPtyS2AwCwkm9javs2NRweXjmYEbS11ZOg3EStf6RXWqvzn67o31Uls9npCb2dtOQuVjt+mLAd829MBbMlGg6qzwrXqVp7jAiOWYr/Cs8jls5VMG5taquXhpVbm8Z2wj9Umu17+gTcTs+X7oOtFfCTDVGm32KuT5ubi+o3bq8ytbCmwmCTHOo7xDikwqzXD7mWybioEo72zs3PSIz3qUjzne5qU9PVr/jjDOYYd1LK49NbRM0feGr3l682NX6JPLzLlBo+8EzfsJVeTHlndkhh4h1hfyE2zPxn7bfP61WNtn7IdX6fwYzWqPCn+7bAyNQoRw3HN5oa7afqP3ZjDjUzHbar8nwnHn6NqVEpLaz3Y/oH0JxL9ikte0gAAAAASUVORK5CYII='"
                    :alt="usuario.firstName"
                  />
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ usuario.firstName }} {{ usuario.lastName }}
                  </div>
                  <div class="text-sm text-gray-500">{{ usuario.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ usuario.phone || 'No especificado' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="usuario.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'"
              >
                {{ usuario.role === 'Admin' ? 'Administrador' : 'Usuario' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="usuario.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ usuario.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <router-link
                :to="`/admin/usuarios/editar/${usuario.id}`"
                class="text-blue-600 hover:text-blue-900"
              >
                Editar
              </router-link>
              <button
                @click="toggleUserStatus(usuario)"
                :class="usuario.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
              >
                {{ usuario.isActive ? 'Desactivar' : 'Activar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import api from '../../services/api'
import { toast } from 'vue3-toastify'

const users = ref([])
const loading = ref(false)

const filters = ref({
  search: '',
  rol: ''
})

const filteredUsers = computed(() => {
  return users.value.filter(usuario => {
    const matchesSearch = !filters.value.search || 
      usuario.firstName?.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      usuario.lastName?.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(filters.value.search.toLowerCase())
    
    const matchesRol = !filters.value.rol || usuario.role === filters.value.rol
    
    return matchesSearch && matchesRol
  })
})

const fetchData = async () => {
  try {
    loading.value = true
    const response = await api.get('/users')
    users.value = response.data.data?.users || response.data.data || []
  } catch (error) {
    console.error('Error al cargar los datos:', error)
    toast.error('Error al cargar los datos')
  } finally {
    loading.value = false
  }
}

const toggleUserStatus = async (usuario) => {
    const action = usuario.isActive ? 'desactivar' : 'activar'
    if (confirm(`¿Estás seguro de ${action} este usuario?`)) {
      await api.patch(`/users/${usuario.id}/toggle-status`)
      .then(() => {
        toast.success(`Usuario ${action}do correctamente`)
        fetchData()
      })
      .catch((error) => {
        console.log(error)
        toast.error('Error al cambiar el estado del usuario')
      })
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

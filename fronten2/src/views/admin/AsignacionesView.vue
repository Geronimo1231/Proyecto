<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Gestión de Asignaciones
        </h2>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <button
          @click="showAssignModal = true"
          class="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" />
          Nueva Asignación
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Usuario</label>
          <input
            v-model="filters.usuario"
            type="text"
            placeholder="Nombre del usuario..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Vehículo</label>
          <input
            v-model="filters.vehiculo"
            type="text"
            placeholder="Matrícula, modelo..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            v-model="filters.estado"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos</option>
            <option value="true">Activas</option>
            <option value="false">Inactivas</option>
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

    <!-- Assignments Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vehículo
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha Asignación
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Observaciones
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="assignment in filteredassignmentes" :key="assignment.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <img
                    class="h-10 w-10 rounded-full"
                    :src="assignment.usuario?.foto_perfil || '/placeholder.svg?height=40&width=40'"
                    :alt="assignment.usuario?.nombre"
                  />
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ assignment.usuario?.nombre }} {{ assignment.usuario?.apellido }}
                  </div>
                  <div class="text-sm text-gray-500">{{ assignment.usuario?.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ assignment.vehiculo?.matricula }}</div>
              <div class="text-sm text-gray-500">
                {{ assignment.vehiculo?.marca?.nombre }} {{ assignment.vehiculo?.modelo }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(assignment.fecha_assignment) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="assignment.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ assignment.activa ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
              {{ assignment.observaciones || 'Sin observaciones' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <button
                v-if="assignment.activa"
                @click="unassignVehicle(assignment)"
                class="text-red-600 hover:text-red-900"
              >
                Desasignar
              </button>
              <button
                @click="editAssignment(assignment)"
                class="text-blue-600 hover:text-blue-900"
              >
                Editar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Assign Vehicle Modal -->
    <div v-if="showAssignModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="assignVehicle">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Nueva Asignación de Vehículo</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
                  <select
                    v-model="assignForm.usuario_id"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Seleccionar usuario</option>
                    <option v-for="usuario in usersDisponibles" :key="usuario.id" :value="usuario.id">
                      {{ usuario.nombre }} {{ usuario.apellido }} ({{ usuario.email }})
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Vehículo *</label>
                  <select
                    v-model="assignForm.vehiculo_id"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Seleccionar vehículo</option>
                    <option v-for="vehiculo in vehicleDisponibles" :key="vehiculo.id" :value="vehiculo.id">
                      {{ vehiculo.matricula }} - {{ vehiculo.marca?.nombre }} {{ vehiculo.modelo }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    v-model="assignForm.observaciones"
                    rows="3"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Observaciones sobre la asignación..."
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                :disabled="loading"
                class="w-full inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50"
              >
                {{ loading ? 'Asignando...' : 'Asignar Vehículo' }}
              </button>
              <button
                type="button"
                @click="closeAssignModal"
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
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'


const assignmentes = ref([])
const usersDisponibles = ref([])
const vehicleDisponibles = ref([])
const loading = ref(false)
const showAssignModal = ref(false)

const filters = ref({
  usuario: '',
  vehiculo: '',
  estado: ''
})

const assignForm = ref({
  usuario_id: '',
  vehiculo_id: '',
  observaciones: ''
})

const filteredassignmentes = computed(() => {
  return assignmentes.value.filter(assignment => {
    const matchesUsuario = !filters.value.usuario || 
      `${assignment.usuario?.nombre} ${assignment.usuario?.apellido}`.toLowerCase().includes(filters.value.usuario.toLowerCase())
    
    const matchesVehiculo = !filters.value.vehiculo || 
      assignment.vehiculo?.matricula.toLowerCase().includes(filters.value.vehiculo.toLowerCase()) ||
      assignment.vehiculo?.modelo.toLowerCase().includes(filters.value.vehiculo.toLowerCase())
    
    const matchesEstado = filters.value.estado === '' || 
      assignment.activa.toString() === filters.value.estado
    
    return matchesUsuario && matchesVehiculo && matchesEstado
  })
})

const fetchData = async () => {
  try {
    const [assignmentesRes, usersRes, vehicleRes] = await Promise.all([
      api.get('/assigments'),
      api.get('/users?rol=usuario&activo=true'),
      api.get('/vehicle?estado=disponible')
    ])
    
    assignmentes.value = assignmentesRes.data.data
    usersDisponibles.value = usersRes.data.data
    vehicleDisponibles.value = vehicleRes.data.data
  } catch (error) {
    toast.error('Error al cargar los datos')
  }
}

const assignVehicle = async () => {
  try {
    loading.value = true
    await api.post('/assignmentes', assignForm.value)
    toast.success('Vehículo asignado correctamente')
    await fetchData()
    closeAssignModal()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al asignar el vehículo')
  } finally {
    loading.value = false
  }
}

const unassignVehicle = async (assignment) => {
  if (confirm(`¿Estás seguro de desasignar el vehículo ${assignment.vehiculo?.matricula}?`)) {
    try {
      await api.patch(`/assignmentes/${assignment.id}/unassign`)
      toast.success('Vehículo desasignado correctamente')
      await fetchData()
    } catch (error) {
      toast.error('Error al desasignar el vehículo')
    }
  }
}

const editAssignment = (assignment) => {
  // Implementar edición de asignación
  console.log('Editar asignación:', assignment)
}

const closeAssignModal = () => {
  showAssignModal.value = false
  assignForm.value = {
    usuario_id: '',
    vehiculo_id: '',
    observaciones: ''
  }
}

const resetFilters = () => {
  filters.value = {
    usuario: '',
    vehiculo: '',
    estado: ''
  }
}

const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es })
}

onMounted(() => {
  fetchData()
})
</script>


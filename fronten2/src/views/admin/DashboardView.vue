<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Dashboard Administrativo
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Resumen general del sistema de gestión vehicular
        </p>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <button
          @click="refreshData"
          :disabled="loading"
          class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          <ArrowPathIcon class="-ml-0.5 mr-1.5 h-5 w-5" :class="{ 'animate-spin': loading }" />
          Actualizar
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Total Users -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UsersIcon class="h-6 w-6 text-blue-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Usuarios</dt>
                <dd class="text-lg font-medium text-gray-900">{{ dashboardData.stats?.totalUsers || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <router-link to="/admin/usuarios" class="font-medium text-blue-600 hover:text-blue-500">
              Ver todos los usuarios
            </router-link>
          </div>
        </div>
      </div>

      <!-- Total Vehicles -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <TruckIcon class="h-6 w-6 text-green-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Vehículos</dt>
                <dd class="text-lg font-medium text-gray-900">{{ dashboardData.stats?.totalVehicles || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <router-link to="/admin/vehiculos" class="font-medium text-green-600 hover:text-green-500">
              Ver todos los vehículos
            </router-link>
          </div>
        </div>
      </div>

      <!-- Active Assignments -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ClipboardDocumentListIcon class="h-6 w-6 text-yellow-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Asignaciones Activas</dt>
                <dd class="text-lg font-medium text-gray-900">{{ dashboardData.stats?.activeAssignments || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <router-link to="/admin/asignaciones" class="font-medium text-yellow-600 hover:text-yellow-500">
              Ver asignaciones
            </router-link>
          </div>
        </div>
      </div>

      <!-- GPS Locations -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <MapPinIcon class="h-6 w-6 text-purple-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Ubicaciones GPS (24h)</dt>
                <dd class="text-lg font-medium text-gray-900">{{ dashboardData.stats?.recentGpsLocations || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <router-link to="/admin/mapa" class="font-medium text-purple-600 hover:text-purple-500">
              Ver mapa GPS
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Vehicle Status Chart -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Vehículos por Estado</h3>
        <div class="h-64">
          <canvas ref="vehicleStatusChart"></canvas>
        </div>
      </div>

      <!-- User Role Chart -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Usuarios por Rol</h3>
        <div class="h-64">
          <canvas ref="userRoleChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
        
        <div v-if="recentActivity.length === 0" class="text-center py-8">
          <ClipboardDocumentListIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay actividad reciente</h3>
          <p class="mt-1 text-sm text-gray-500">
            La actividad del sistema aparecerá aquí.
          </p>
        </div>

        <div v-else class="flow-root">
          <ul class="-mb-8">
            <li v-for="(activity, index) in recentActivity" :key="activity.id" class="relative pb-8">
              <div v-if="index !== recentActivity.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
              <div class="relative flex space-x-3">
                <div>
                  <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                    <component :is="getActivityIcon(activity.type)" class="h-4 w-4 text-white" />
                  </span>
                </div>
                <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p class="text-sm text-gray-500">{{ activity.description }}</p>
                    <p v-if="activity.user" class="text-xs text-gray-400">
                      Usuario: {{ activity.user.firstName }} {{ activity.user.lastName }}
                    </p>
                  </div>
                  <div class="text-right text-sm whitespace-nowrap text-gray-500">
                    {{ formatDate(activity.createdAt) }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import {
  UsersIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  ArrowPathIcon,
  UserPlusIcon,
  PlusIcon,
  MapIcon
} from '@heroicons/vue/24/outline'
import api from '../../services/api'
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Chart from 'chart.js/auto'

const loading = ref(false)
const dashboardData = ref({})
const recentActivity = ref([])
const vehicleStatusChart = ref(null)
const userRoleChart = ref(null)
let vehicleChart = null
let userChart = null

const fetchDashboardData = async () => {
  try {
    loading.value = true
    const [dashboardResponse, activityResponse] = await Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/activity?limit=10')
    ])
    
    if (dashboardResponse.data.success) {
      dashboardData.value = dashboardResponse.data.data
    }
    
    if (activityResponse.data.success) {
      recentActivity.value = activityResponse.data.data
    }

    await nextTick()
    createCharts()
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    toast.error('Error al cargar los datos del dashboard')
  } finally {
    loading.value = false
  }
}

const createCharts = () => {
  createVehicleStatusChart()
  createUserRoleChart()
}

const createVehicleStatusChart = () => {
  if (vehicleChart) {
    vehicleChart.destroy()
  }

  const ctx = vehicleStatusChart.value?.getContext('2d')
  if (!ctx) return

  const vehiclesByStatus = dashboardData.value.stats?.vehiclesByStatus || {}
  
  vehicleChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Disponibles', 'Asignados', 'Mantenimiento', 'Fuera de Servicio'],
      datasets: [{
        data: [
          vehiclesByStatus.available || 0,
          vehiclesByStatus.assigned || 0,
          vehiclesByStatus.maintenance || 0,
          vehiclesByStatus.out_of_service || 0
        ],
        backgroundColor: [
          '#10B981', // green
          '#3B82F6', // blue
          '#F59E0B', // yellow
          '#EF4444'  // red
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

const createUserRoleChart = () => {
  if (userChart) {
    userChart.destroy()
  }

  const ctx = userRoleChart.value?.getContext('2d')
  if (!ctx) return

  const usersByRole = dashboardData.value.stats?.usersByRole || {}
  
  userChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Administradores', 'Usuarios', 'Super Admin'],
      datasets: [{
        label: 'Cantidad',
        data: [
          usersByRole.Admin || 0,
          usersByRole.User || 0,
          usersByRole.GlobalAdmin || 0
        ],
        backgroundColor: [
          '#8B5CF6', // purple
          '#06B6D4', // cyan
          '#F97316'  // orange
        ],
        borderWidth: 1,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })
}

const refreshData = () => {
  fetchDashboardData()
  toast.success('Datos actualizados')
}

const getActivityIcon = (type) => {
  switch (type) {
    case 'assignment': return ClipboardDocumentListIcon
    case 'user': return UsersIcon
    case 'vehicle': return TruckIcon
    case 'gps': return MapPinIcon
    default: return ClipboardDocumentListIcon
  }
}

const formatDate = (date) => {
  if (!date) return 'No disponible'
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es })
}

onMounted(() => {
  fetchDashboardData()
})
</script>

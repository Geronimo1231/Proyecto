<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Dashboard Administrativo
        </h2>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <TruckIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Vehículos</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.total_vehiculos || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-6 w-6 text-green-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Disponibles</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.vehiculos_disponibles || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UserGroupIcon class="h-6 w-6 text-blue-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Asignados</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.vehiculos_asignados || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UsersIcon class="h-6 w-6 text-purple-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Usuarios</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.total_usuarios || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Vehículos por Estado -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Vehículos por Estado</h3>
        <div class="h-64">
          <Doughnut :data="vehicleStatusData" :options="chartOptions" />
        </div>
      </div>

      <!-- Vehículos por Marca -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Vehículos por Marca</h3>
        <div class="h-64">
          <Bar :data="vehicleBrandData" :options="chartOptions" />
        </div>
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
                  <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
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
import { ref, onMounted, computed } from 'vue'
import { 
  TruckIcon, 
  CheckCircleIcon, 
  UserGroupIcon, 
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'
import api from '../../services/api'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const stats = ref({})
const recentActivity = ref([])
const loading = ref(true)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

const vehicleStatusData = computed(() => ({
  labels: ['Disponibles', 'Asignados', 'Mantenimiento', 'Fuera de Servicio'],
  datasets: [{
    data: [
      stats.value.vehiculos_disponibles || 0,
      stats.value.vehiculos_asignados || 0,
      stats.value.vehiculos_mantenimiento || 0,
      stats.value.vehiculos_fuera_servicio || 0
    ],
    backgroundColor: [
      '#10B981',
      '#3B82F6',
      '#F59E0B',
      '#EF4444'
    ]
  }]
}))

const vehicleBrandData = computed(() => ({
  labels: stats.value.marcas_vehiculos?.map(m => m.marca) || [],
  datasets: [{
    label: 'Cantidad',
    data: stats.value.marcas_vehiculos?.map(m => m.cantidad) || [],
    backgroundColor: '#3B82F6'
  }]
}))

const fetchDashboardData = async () => {
  try {
    loading.value = true
    const [statsResponse, activityResponse] = await Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/activity')
    ])
    
    stats.value = statsResponse.data.data
    recentActivity.value = activityResponse.data.data
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const getActivityIcon = (type) => {
  switch (type) {
    case 'create': return PlusIcon
    case 'update': return PencilIcon
    case 'delete': return TrashIcon
    default: return PlusIcon
  }
}

const formatDate = (date) => {
  return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: es })
}

onMounted(() => {
  fetchDashboardData()
})
</script>

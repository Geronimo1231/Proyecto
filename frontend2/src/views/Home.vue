<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
    <!-- Header -->
    <header class="relative z-10">
      <nav class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <TruckIcon class="h-8 w-8 text-white" />
            <span class="text-xl font-bold text-white">VehicleTracker</span>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              to="/login"
              class="bg-white text-blue-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
            >
              Iniciar Sesión
            </router-link>
          </div>
        </div>
      </nav>
    </header>

    <!-- Hero Section -->
    <main class="container mx-auto px-6 py-20">
      <div class="text-center">
        <h1 class="text-5xl md:text-6xl font-bold text-white mb-6">
          Sistema de Gestión
          <span class="text-blue-300">Vehicular</span>
        </h1>
        <p class="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Controla y monitorea tu flota de vehículos en tiempo real. 
          Gestiona asignaciones, ubicaciones GPS y mantén un control total de tu inventario vehicular.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/login"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 inline-flex items-center justify-center"
          >
            <LoginIcon class="h-5 w-5 mr-2" />
            Acceder al Sistema
          </router-link>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="mt-20 grid md:grid-cols-3 gap-8">
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <MapPinIcon class="h-12 w-12 text-blue-300 mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-white mb-2">Tracking GPS</h3>
          <p class="text-blue-100">
            Monitoreo en tiempo real de la ubicación de todos tus vehículos
          </p>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <UsersIcon class="h-12 w-12 text-blue-300 mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-white mb-2">Gestión de Usuarios</h3>
          <p class="text-blue-100">
            Administra usuarios y asigna vehículos de manera eficiente
          </p>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <ChartBarIcon class="h-12 w-12 text-blue-300 mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-white mb-2">Dashboard Completo</h3>
          <p class="text-blue-100">
            Estadísticas detalladas y reportes de tu flota vehicular
          </p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="absolute bottom-0 w-full py-6 text-center text-blue-200">
      <p>&copy; 2024 Sistema de Gestión Vehicular. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<script setup>
import { 
  TruckIcon, 
  LoginIcon, 
  MapPinIcon, 
  UsersIcon, 
  ChartBarIcon 
} from '@heroicons/vue/24/outline'
</script>

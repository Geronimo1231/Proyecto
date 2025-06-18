<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="flex justify-center">
          <TruckIcon class="h-12 w-12 text-white" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
          Iniciar Sesión
        </h2>
        <p class="mt-2 text-center text-sm text-blue-200">
          Accede a tu cuenta del sistema
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-blue-200 mb-1">
              Correo Electrónico
            </label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="admin@vehiculos.com"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-blue-200 mb-1">
              Contraseña
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
          >
            <span v-if="authStore.loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando sesión...
            </span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </div>

        <!-- Credenciales de demostración -->
        <div class="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
          <h3 class="text-sm font-medium text-white mb-2">Credenciales de Demostración:</h3>
          <div class="space-y-2 text-xs text-blue-200">
            <div>
              <strong>Administrador:</strong><br>
              Email: admin@vehiculos.com<br>
              Contraseña: Admin123!
            </div>
            <div>
              <strong>Usuario:</strong><br>
              Email: usuario@vehiculos.com<br>
              Contraseña: User123!
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { TruckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)

const handleLogin = async () => {
  const result = await authStore.login(form.value)
  
  if (result.success) {
    // Redirigir según el rol del usuario
    if (result.user.rol === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/user/dashboard')
    }
  }
}
</script>

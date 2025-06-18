<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out" :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }">
      <div class="flex items-center justify-center h-16 bg-green-600">
        <TruckIcon class="h-8 w-8 text-white" />
        <span class="ml-2 text-xl font-semibold text-white">Mi Panel</span>
      </div>
      
      <nav class="mt-8">
        <div class="px-4 space-y-2">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200"
            :class="[
              $route.path === item.href
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
          >
            <component :is="item.icon" class="mr-3 h-5 w-5" />
            {{ item.name }}
          </router-link>
        </div>
      </nav>
    </div>

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Top navigation -->
      <div class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <button
          type="button"
          class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          @click="sidebarOpen = !sidebarOpen"
        >
          <Bars3Icon class="h-6 w-6" />
        </button>

        <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div class="flex flex-1"></div>
          <div class="flex items-center gap-x-4 lg:gap-x-6">
            <!-- Profile dropdown -->
            <div class="relative">
              <button
                type="button"
                class="flex items-center gap-x-2 text-sm font-semibold leading-6 text-gray-900"
                @click="showProfileMenu = !showProfileMenu"
              >
                <img
                  class="h-8 w-8 rounded-full bg-gray-50"
                  :src="authStore.user?.foto_perfil || '/placeholder.svg?height=32&width=32'"
                  :alt="authStore.user?.nombre"
                />
                <span>{{ authStore.user?.nombre }} {{ authStore.user?.apellido }}</span>
                <ChevronDownIcon class="h-5 w-5 text-gray-400" />
              </button>

              <div
                v-if="showProfileMenu"
                class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <router-link
                  to="/user/perfil"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showProfileMenu = false"
                >
                  Mi Perfil
                </router-link>
                <button
                  @click="logout"
                  class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Page content -->
      <main class="py-8">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
      @click="sidebarOpen = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  TruckIcon,
  Bars3Icon,
  ChevronDownIcon,
  HomeIcon,
  MapPinIcon,
  UserIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const showProfileMenu = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/user/dashboard', icon: HomeIcon },
  { name: 'Mis Vehículos', href: '/user/vehiculos', icon: TruckIcon },
  { name: 'Mapa GPS', href: '/user/mapa', icon: MapPinIcon },
  { name: 'Mi Perfil', href: '/user/perfil', icon: UserIcon }
]

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const handleClickOutside = (event) => {
  if (showProfileMenu.value && !event.target.closest('.relative')) {
    showProfileMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

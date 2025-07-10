<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out" :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }">
      <div class="flex items-center justify-center h-16 bg-blue-600">
        <TruckIcon class="h-8 w-8 text-white" />
        <span class="ml-2 text-xl font-semibold text-white">Admin Panel</span>
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
                ? 'bg-blue-100 text-blue-700'
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
                  :src="authStore.user?.photo || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKkAAACUCAMAAADf7/luAAAAYFBMVEXZ3OFwd3/c3+Ryd3xydn9weHtweH1scXXh5OnZ3eBtdHxrdXfQ09hvdHjV2N1sdHrHytC+wsZ/hom2ur+Wm5+HjJBmbXSPkpewtbmfpKh7gIWprrJlbnDJztGNlZmFi5S+luYFAAAE4klEQVR4nO2c2ZajIBBAtVBxAfcVNf3/fzmYTKY73VlAMGXP8Z4z89QP94AURVHEcQ4ODg4ODg4ODg4ODg4ODg5eAAuh/Ict8hwInbwah2EYq9wJdysLkFaN68ZxlmVx7Lpdle5yZMGZB95KwX/ElNe5szvXcK4JJe4NhFO/nkNstRsAejd27xG7454+AZi79q7nMrC0m3ejCnmZ+A9NCS3znahGBbk/81cyUuxCFQrOn4rKlcX3oAo54eSFqfwL/A8AWPl86i/wEn1ZRU2iICojQIMsGo5toGLquu2IugXAnKl5ShLc+e80TDtET6jIi2X/Bd/HDFXNqwD11TTBW1RQtOqickwntEENTyqh9JPshLT8gb3YRX/OP8MZ1HBUX/hnAj7imMJJaXv6hPAOxVTu+NqmJcr0Q0Eeps+PVHESVei/n/BeE1copsMK0wFB1InqFaa1EyGonjS20qvpKcIw1dn0r6ZN+itMPS9uUGb/PzdNEUSdbsV3ipP3r4tSCKyI/IQOGJ8pjLqmvk9HBNEV+77vJz1OLsU1cynP83ByqVxomwqcQlqqVpL6avqBEk6dsNY0DZIa6RzVa5uiLCiZoP6aU7QTfmhWJhqswiRUD+927tKinKLOpEJj/gkXOCt/IdLZUAlFqqAsACvVCz5IZYmrak991Y2KIoWov4Snx/eQt8Qd7qU0MKEW/mOBOfdn1cJXCap+gH8fGRYPbvZvRnQXd7xQiOzZFQohQSb2ICqj6lzSx6pkueBHvzT9C4SjoA9NuRh31I8E8xC0WfAVKSn/zyYx7GVALwCwsZymxP+HG8fJNJUj22EfErC+bkpxERVCfNQ9g331IF0BgIjlRVFUVZHnLNpT+9FP4BNslYOD/4ToDLbFa2So2rvpEpgYY3N+hrHU2WOsArlDFf1QN40Q3rn+WDaneugLtidZ6ZLmQ+n7yULsSVOpyjlPljSgHIp0H7bgzNUpbuNHiX8ct6SuZnRXgKoWSeKdB/I+nkcoFUPlYCYrEPXiPMUvTAmRfyV6tPxPpqT+pF5D8Scx4jR3RH1DfV+nW47TBmFcIW/O864s6i75dcKbHN66JwAbqGZB+gLhdHjnJxAWzZNz81NTQqbmbYd/cEY3I+tMperybOI9XyukXfskKCkQTF36BlWYyyQwNPWTZvMiQAS5QsHsNfHmDf5QrFvzP9j62cTSGL1uJX2H8E0LlVBwG1N/dd1OFYpJtzvymSmhW32rMItM8UGEmirf6LofUo3LJzWSZpO4Cl1ic0QXfLpFO3I4Uosf6YXAzezfUELhW4pPtyS2AwCwkm9javs2NRweXjmYEbS11ZOg3EStf6RXWqvzn67o31Uls9npCb2dtOQuVjt+mLAd829MBbMlGg6qzwrXqVp7jAiOWYr/Cs8jls5VMG5taquXhpVbm8Z2wj9Umu17+gTcTs+X7oOtFfCTDVGm32KuT5ubi+o3bq8ytbCmwmCTHOo7xDikwqzXD7mWybioEo72zs3PSIz3qUjzne5qU9PVr/jjDOYYd1LK49NbRM0feGr3l682NX6JPLzLlBo+8EzfsJVeTHlndkhh4h1hfyE2zPxn7bfP61WNtn7IdX6fwYzWqPCn+7bAyNQoRw3HN5oa7afqP3ZjDjUzHbar8nwnHn6NqVEpLaz3Y/oH0JxL9ikte0gAAAAASUVORK5CYII='"
                  :alt="`${authStore.user?.firstName} ${authStore.user?.lastName}`"
                />
                <span>{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
                <ChevronDownIcon class="h-5 w-5 text-gray-400" />
              </button>

              <div
                v-if="showProfileMenu"
                class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <router-link
                  to="/admin/perfil"
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
  UsersIcon,
  MapPinIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(true)
const showProfileMenu = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Vehículos', href: '/admin/vehiculos', icon: TruckIcon },
  { name: 'Usuarios', href: '/admin/usuarios', icon: UsersIcon },
  { name: 'Asignaciones', href: '/admin/asignaciones', icon: ClipboardDocumentListIcon },
  { name: 'Mapa GPS', href: '/admin/mapa', icon: MapPinIcon },
  //{ name: 'Registrar', href: '/admin/registrar', icon: UserPlusIcon }
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

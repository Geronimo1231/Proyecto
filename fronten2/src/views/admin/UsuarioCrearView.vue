<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900">Crear Nuevo Usuario</h3>
          <p class="mt-1 text-sm text-gray-600">
            Complete la información para crear un nuevo usuario en el sistema.
          </p>
        </div>

        <form @submit.prevent="createUser" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700">
                Nombre *
              </label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Ingrese el nombre"
              />
            </div>

            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700">
                Apellido *
              </label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Ingrese el apellido"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Correo Electrónico *
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="+52 33 1234 5678"
            />
          </div>

          <div>
            <label for="role" class="block text-sm font-medium text-gray-700">
              Rol *
            </label>
            <select
              id="role"
              v-model="form.role"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Seleccionar rol</option>
              <option value="Admin">Administrador</option>
              <option value="User">Usuario</option>
            </select>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Contraseña *
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              minlength="8"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Mínimo 8 caracteres"
            />
            <p class="mt-1 text-xs text-gray-500">
              La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y carácter especial.
            </p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirmar Contraseña *
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              minlength="8"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Confirme la contraseña"
            />
          </div>

          <div class="flex justify-end space-x-3">
            <router-link
              to="/admin/usuarios"
              class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancelar
            </router-link>
            <button
              type="submit"
              :disabled="loading"
              class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {{ loading ? 'Creando...' : 'Crear Usuario' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { toast } from 'vue3-toastify'

const router = useRouter()
const loading = ref(false)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: '',
  password: '',
  confirmPassword: ''
})

const createUser = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    toast.error('Las contraseñas no coinciden')
    return
  }

  if (form.value.password.length < 8) {
    toast.error('La contraseña debe tener al menos 8 caracteres')
    return
  }

  try {
    loading.value = true
    
    const userData = {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      email: form.value.email,
      phone: form.value.phone,
      role: form.value.role,
      password: form.value.password
    }

    await api.post('/users', userData)
    
    toast.success('Usuario creado correctamente')
    router.push('/admin/usuarios')
  } catch (error) {
    console.error('Error al crear usuario:', error)
    toast.error(error.response?.data?.message || 'Error al crear el usuario')
  } finally {
    loading.value = false
  }
}
</script>

import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "../stores/auth.js"

// Vistas globales
import Home from "../views/HomeView.vue"
import Login from "../views/LoginForm.vue"

// Vistas de administrador
import AdminLayout from "../layouts/AdminLayout.vue"
import AdminDashboard from "../views/admin/DashboardView.vue"
import AdminAsignaciones from "../views/admin/AsignacionesView.vue"
import AdminMapa from "../views/admin/MapaView.vue"
import AdminRegistrar from "../views/admin/RegistrarView.vue"
import AdminUsuarios from "../views/admin/UsuariosView.vue"
import AdminVehiculos from "../views/admin/VehiculosView.vue"

// Vistas de usuario
import UserLayout from "../layouts/UserLayout.vue"
import UserDashboard from "../views/user/DashboardUser.vue"
import UserMapa from "../views/user/MapaviewUser.vue"
import UserPerfil from "../views/user/PerfilView.vue"
import UserVehiculos from "../views/user/VehiculoView.vue"

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requiresAuth: false },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, requiresRole: "admin" },
    children: [
      {
        path: "",
        redirect: "/admin/dashboard",
      },
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: AdminDashboard,
      },
      {
        path: "asignaciones",
        name: "AdminAsignaciones",
        component: AdminAsignaciones,
      },
      {
        path: "mapa",
        name: "AdminMapa",
        component: AdminMapa,
      },
      {
        path: "registrar",
        name: "AdminRegistrar",
        component: AdminRegistrar,
      },
      {
        path: "usuarios",
        name: "AdminUsuarios",
        component: AdminUsuarios,
      },
      {
        path: "vehiculos",
        name: "AdminVehiculos",
        component: AdminVehiculos,
      },
    ],
  },
  {
    path: "/user",
    component: UserLayout,
    meta: { requiresAuth: true, requiresRole: "usuario" },
    children: [
      {
        path: "",
        redirect: "/user/dashboard",
      },
      {
        path: "dashboard",
        name: "UserDashboard",
        component: UserDashboard,
      },
      {
        path: "mapa",
        name: "UserMapa",
        component: UserMapa,
      },
      {
        path: "perfil",
        name: "UserPerfil",
        component: UserPerfil,
      },
      {
        path: "vehiculos",
        name: "UserVehiculos",
        component: UserVehiculos,
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next("/login")
      return
    }

    if (to.meta.requiresRole && authStore.user?.rol !== to.meta.requiresRole) {
      // Redirigir según el rol del usuario
      if (authStore.user?.rol === "admin") {
        next("/admin/DashboardView.vue")
      } else {
        next("/user/DashboardUser.vue")
      }
      return
    }
  }

  // Si está autenticado y trata de ir a login, redirigir al dashboard correspondiente
  if (to.name === "Login" && authStore.isAuthenticated) {
    if (authStore.user?.rol === "admin") {
      next("/admin/DashboardView.vue")
    } else {
      next("/user/DashboardView.vue")
    }
    return
  }

  next()
})

export default router

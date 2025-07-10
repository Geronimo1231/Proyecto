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
import UsuarioCrearView from "../views/admin/UsuarioCrearView.vue"
import VehiculoCrearView from "../views/admin/VehiculoCrearView.vue"
import VehiculoDetalleView from "../views/admin/VehiculoDetalleView.vue"
import VehiculoEditarView from "../views/admin/VehiculoEditarView.vue"
import AsignacionCrearView from "../views/admin/AsignacionCrearView.vue"
import PerfilAdminView from "../views/admin/PerfilAdminView.vue"

// Vistas de usuario
import UserLayout from "../layouts/UserLayout.vue"
import UserDashboard from "../views/user/DashboardUser.vue"
import UserMapa from "../views/user/MapaviewUser.vue"
import UserPerfil from "../views/user/PerfilView.vue"
import UserVehiculos from "../views/user/VehiculoView.vue"

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/home",
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
  // Rutas de administrador con layout
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, requiresRole: "Admin" },
    children: [
      { path: "", redirect: "/admin/dashboard" },
      { path: "dashboard", name: "AdminDashboard", component: AdminDashboard },
      { path: "vehiculos", name: "AdminVehiculos", component: AdminVehiculos },
      { path: "vehiculos/crear", name: "VehiculoCrear", component: VehiculoCrearView },
      { path: "vehiculos/:id", name: "VehiculoDetalle", component: VehiculoDetalleView, props: true },
      { path: "vehiculos/:id/editar", name: "VehiculoEditar", component: VehiculoEditarView, props: true },
      { path: "usuarios", name: "AdminUsuarios", component: AdminUsuarios },
      { path: "usuarios/crear", name: "UsuarioCrear", component: UsuarioCrearView },
      { path: "asignaciones", name: "AdminAsignaciones", component: AdminAsignaciones },
      { path: "asignaciones/crear", name: "AsignacionCrear", component: AsignacionCrearView },
      { path: "mapa", name: "AdminMapa", component: AdminMapa },
      { path: "registrar", name: "AdminRegistrar", component: AdminRegistrar },
      { path: "perfil", name: "PerfilAdmin", component: PerfilAdminView },
    ],
  },
  // Rutas de usuario con layout
  {
    path: "/user",
    component: UserLayout,
    meta: { requiresAuth: true, requiresRole: "User" },
    children: [
      { path: "", redirect: "/user/dashboard" },
      { path: "dashboard", name: "UserDashboard", component: UserDashboard },
      { path: "vehiculos", name: "UserVehiculos", component: UserVehiculos },
      { path: "mapa", name: "UserMapa", component: UserMapa },
      { path: "perfil", name: "UserPerfil", component: UserPerfil },
    ],
  },
  // Rutas directas (sin layout) - para compatibilidad
  {
    path: "/dashboard",
    redirect: "/admin/dashboard",
  },
  {
    path: "/vehiculos",
    redirect: "/admin/vehiculos",
  },
  {
    path: "/usuarios",
    redirect: "/admin/usuarios",
  },
  {
    path: "/asignaciones",
    redirect: "/admin/asignaciones",
  },
  {
    path: "/mapa",
    redirect: "/admin/mapa",
  },
  {
    path: "/dashboarduser",
    redirect: "/user/dashboard",
  },
  {
    path: "/uservehiculos",
    redirect: "/user/vehiculos",
  },
  {
    path: "/usermapa",
    redirect: "/user/mapa",
  },
  {
    path: "/userperfil",
    redirect: "/user/perfil",
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/login",
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next({ name: "Login" })
    }

    // Verificar rol si es necesario
    if (to.meta.requiresRole) {
      if (authStore.user?.role !== to.meta.requiresRole) {
        // Redirigir según el rol del usuario
        if (authStore.user?.role === "Admin") {
          return next({ name: "AdminDashboard" })
        } else {
          return next({ name: "UserDashboard" })
        }
      }
    }
  }

  // Si está autenticado y trata de ir al login, redirigir al dashboard
  if (to.name === "Login" && authStore.isAuthenticated) {
    if (authStore.user?.role === "Admin") {
      return next({ name: "AdminDashboard" })
    } else {
      return next({ name: "UserDashboard" })
    }
  }

  next()
})

export default router

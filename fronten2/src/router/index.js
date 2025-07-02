import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

// Vistas globales
import Home from "../views/HomeView.vue";
import Login from "../views/LoginForm.vue";

// Vistas de administrador
import AdminLayout from "../layouts/AdminLayout.vue";
import AdminDashboard from "../views/admin/DashboardView.vue";
import AdminAsignaciones from "../views/admin/AsignacionesView.vue";
import AdminMapa from "../views/admin/MapaView.vue";
import AdminRegistrar from "../views/admin/RegistrarView.vue";
import AdminUsuarios from "../views/admin/UsuariosView.vue";
import AdminVehiculos from "../views/admin/VehiculosView.vue";

// Vistas de usuario
import UserLayout from "../layouts/UserLayout.vue";
import UserDashboard from "../views/user/DashboardUser.vue";
import UserMapa from "../views/user/MapaviewUser.vue";
import UserPerfil from "../views/user/PerfilView.vue";
import UserVehiculos from "../views/user/VehiculoView.vue";

const routes = [
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
    {
    path: "/vehiculos",
    name: "vehiculos",
    component: AdminVehiculos,
    meta: { requiresAuth: false },
  },
   {
    path: "/asignaciones",
    name: "asignaciones",
    component: AdminAsignaciones,
    meta: { requiresAuth: false },
  },
  {
    path: "/mapa",
    name: "mapa",
    component: AdminMapa,
    meta: { requiresAuth: false },
  },
  {
    path: "/registrar",
    name: "registrar",
    component: AdminRegistrar,
    meta: { requiresAuth: false },
  },
   {
    path: "/usuarios",
    name: "usuarios",
    component: AdminUsuarios,
    meta: { requiresAuth: false },
  },
    {
    path: "/dashboarduser",
    name: "dashboarduser",
    component: UserDashboard,
    meta: { requiresAuth: false },
  },
     {
    path: "/usermapa",
    name: "usermapa",
    component: UserMapa,
    meta: { requiresAuth: false },
  },
     {
    path: "/userperfil",
    name: "userperfil",
    component: UserPerfil,
    meta: { requiresAuth: false },
  },
     {
    path: "/uservehiculos",
    name: "uservehiculos",
    component: UserVehiculos,
    meta: { requiresAuth: false },
  },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, requiresRole: "admin" },
    children: [
      { path: "", redirect: "/admin/dashboard" },
      { path: "home", name: "AdminLayout", component: AdminLayout },
      { path: "dashboard", name: "AdminDashboard", component: AdminDashboard },
      { path: "asignaciones", name: "AdminAsignaciones", component: AdminAsignaciones },
      { path: "mapa", name: "AdminMapa", component: AdminMapa },
      { path: "registrar", name: "AdminRegistrar", component: AdminRegistrar },
      { path: "usuarios", name: "AdminUsuarios", component: AdminUsuarios },
      { path: "vehiculos", name: "AdminVehiculos", component: AdminVehiculos },
    ],
  },
  {
    path: "/user",
    component: UserLayout,
    meta: { requiresAuth: true, requiresRole: "usuario" },
    children: [
      { path: "", redirect: "/user/dashboarduser" },
      { path: "dashboarduser", name: "UserDashboard", component: UserDashboard },
      { path: "usermapa", name: "UserMapa", component: UserMapa },
      { path: "userperfil", name: "UserPerfil", component: UserPerfil },
      { path: "uservehiculos", name: "UserVehiculos", component: UserVehiculos },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      if (to.name !== "Login") {
        return next({ name: "Login" });
      } else {
        return next(); // Ya estás en login, continúa normalmente
      }
    }

    if (to.meta.requiresRole && authStore.user?.role !== to.meta.requiresrolee) {
      if (authStore.user?.role === "admin") {
        if (to.name !== "AdminDashboard") {
          return next({ name: "AdminDashboard" });
        }
      } else {
        if (to.name !== "UserDashboard") {
          return next({ name: "UserDashboard" });
        }
      }
      return next(); // Si ya estás en dashboard correcto
    }
  }

  if (to.name === "Login" && authStore.isAuthenticated) {
    if (authStore.user?.role === "admin") {
      if (to.name !== "AdminDashboard") {
        return next({ name: "AdminDashboard" });
      }
    } else {
      if (to.name !== "UserDashboard") {
        return next({ name: "UserDashboard" });
      }
    }
    return next(); // Ya estás en dashboard correcto
  }

  next();
});

export default router;

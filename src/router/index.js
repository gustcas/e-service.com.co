import { createRouter, createWebHistory } from 'vue-router';

// Landing Page Components
import Landing from '@/views/Landing.vue';
import Login from '@/views/Login.vue';

// Dashboard Clientes
import DashboardClient from '@/views/DashboardClient.vue';

// Dashboard Profesionales
import DashboardProfessional from '@/views/DashboardProfessional.vue';

// Dashboard Admin
import DashboardAdmin from '@/views/DashboardAdmin.vue';
import UsuariosScreen from '@/views/admin/UsuariosScreen.vue';
import CategoryScreen from '@/views/admin/Categories.vue';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: Landing,
    meta: { title: 'IService - Encuentra profesionales de confianza' },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Iniciar Sesión - IService' },
  },

  // ── Cliente ────────────────────────────────────────────────
  {
    path: '/dashboard/client',
    name: 'DashboardClient',
    component: DashboardClient,
    meta: { requiresAuth: true, role: 'client', title: 'Dashboard Cliente - IService' },
    children: [
      {
        path: '',
        name: 'ClienteHome',
        component: () => import('@/views/cliente/ClienteHome.vue'),
      },
      {
        path: 'solicitudes',
        name: 'MisSolicitudes',
        component: () => import('@/views/cliente/MisSolicitudes.vue'),
        meta: { requiresAuth: true, role: 'client' },
      },
    ],
  },

  // ── Profesional ────────────────────────────────────────────
  {
    path: '/dashboard/professional',
    component: DashboardProfessional,
    meta: { requiresAuth: true, role: 'professional' },
    children: [
      {
        path: '',
        name: 'ProfessionalHome',
        component: () => import('@/views/profesional/ProfessionalHome.vue'),
      },
      {
        path: 'profile',
        name: 'ProfileProfesional',
        component: () => import('@/views/profesional/ProfessionalProfile.vue'),
      },
      {
        path: 'trabajos',
        name: 'MisTrabajos',
        component: () => import('@/views/profesional/MisTrabajos.vue'),
        meta: { requiresAuth: true, role: 'professional' },
      },
      {
        path: 'ingresos',
        name: 'MisIngresos',
        component: () => import('@/views/profesional/MisIngresos.vue'),
        meta: { requiresAuth: true, role: 'professional' },
      },
      {
        path: 'datos-pago',
        name: 'DatosPago',
        component: () => import('@/views/profesional/DatosPago.vue'),
        meta: { requiresAuth: true, role: 'professional' },
      },
    ],
  },

  // ── Admin ──────────────────────────────────────────────────
  {
    path: '/dashboard/admin',
    component: DashboardAdmin,
    meta: { requiresAuth: true, role: 'admin', title: 'Panel Admin - IService' },
    children: [
      {
        path: '',
        name: 'DashboardAdmin',
        component: () => import('@/views/admin/AdminHome.vue'),
        meta: { requiresAuth: true, role: 'admin', title: 'Panel Admin - IService' },
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: UsuariosScreen,
        meta: {
          requiresAuth: true,
          role: 'admin',
          module: 'users',              // ← protegido por módulo
          title: 'Panel Usuarios - IService',
        },
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: CategoryScreen,
        meta: {
          requiresAuth: true,
          role: 'admin',
          module: 'categories',         // ← protegido por módulo
          title: 'Panel Categorias - IService',
        },
      },
      {
        path: 'reports',
        name: 'AdminReports',
        component: () => import('@/views/admin/AdminReports.vue'),
        meta: { requiresAuth: true, role: 'admin', title: 'Reportes - IService' },
      },
      {
        path: 'payments',
        name: 'AdminPayments',
        component: () => import('@/views/admin/AdminPayments.vue'),
        meta: {
          requiresAuth: true,
          role: 'admin',
          module: 'payments',
          title: 'Pagos - IService',
        },
      },
      {
        path: 'live-services',
        name: 'AdminLiveServices',
        component: () => import('@/views/admin/AdminLiveServices.vue'),
        meta: {
          requiresAuth: true,
          role: 'admin',
          module: 'live_services',
          title: 'Servicios en Vivo - IService',
        },
      },
      {
        path: 'logs',
        name: 'AdminLogs',
        component: () => import('@/views/admin/AdminLogs.vue'),
        meta: {
          requiresAuth: true,
          role: 'admin',
          superAdminOnly: true,
          title: 'Auditoría - IService',
        },
      },
      {
        path: 'sub-admins',
        name: 'AdminSubAdmins',
        component: () => import('@/views/admin/AdminSubAdmins.vue'),
        meta: {
          requiresAuth: true,
          role: 'admin',
          superAdminOnly: true,
          title: 'Administradores - IService',
        },
      },
    ],
  },

  // ── Redirects ──────────────────────────────────────────────
  {
    path: '/dashboard',
    redirect: () => {
      const userRole = localStorage.getItem('userRole');
      return `/dashboard/${userRole || 'client'}`;
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition)   return savedPosition;
    if (to.hash)         return { el: to.hash, behavior: 'smooth' };
    return { top: 0, behavior: 'smooth' };
  },
});

// ── Navigation Guard ───────────────────────────────────────
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'IService';

  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole        = localStorage.getItem('userRole');

  // 1. No autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }

  // 2. Rol incorrecto
  if (to.meta.requiresAuth && to.meta.role && to.meta.role !== userRole) {
    console.warn(`Acceso denegado: rol '${userRole}' no puede entrar a ruta de '${to.meta.role}'`);
    return next(`/dashboard/${userRole}`);
  }

  // 3. Ya autenticado intentando entrar al login
  if (to.path === '/login' && isAuthenticated) {
    return next(`/dashboard/${userRole}`);
  }

  // 4. Guards de módulos admin
  if (to.meta.role === 'admin' && (to.meta.module || to.meta.superAdminOnly)) {
    const storedUser   = localStorage.getItem('user');
    const user         = storedUser ? JSON.parse(storedUser) : null;
    const isSuperAdmin = user?.is_super_admin ?? false;

    // Solo super admin puede entrar a rutas superAdminOnly
    if (to.meta.superAdminOnly && !isSuperAdmin) {
      return next({ name: 'DashboardAdmin' });
    }

    // Verificar acceso al módulo
    if (to.meta.module) {
      const perm      = user?.permissions?.[to.meta.module];
      const hasAccess = isSuperAdmin || (perm && (typeof perm === 'boolean' ? perm : perm.enabled === true));
      if (!hasAccess) {
        console.warn(`Sin acceso al módulo: ${to.meta.module}`);
        return next({ name: 'DashboardAdmin' });
      }
    }
  }

  next();
});

// ── After each ────────────────────────────────────────────
router.afterEach((to, from) => {
  if (import.meta.env.DEV) {
    console.log(`Navegó de ${from.path} a ${to.path}`);
  }
});

export default router;
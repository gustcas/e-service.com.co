<template>
  <div class="dashboard admin" :class="{ 'sidebar-open': sidebarOpen }">

    <!-- Mobile overlay -->
    <div class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand">
          <a href="/" class="logo">
            <img src="/images/logo-services-sin-fondo.png" alt="logo" class="logo-img" />
          </a>
        </div>
        <div class="admin-badge-header">
          <span>⚙️</span>
          <span>Admin Panel</span>
        </div>
        <button class="sidebar-close-btn" @click="sidebarOpen = false">✕</button>
      </div>

      <nav class="sidebar-nav">
        <a
          v-for="item in navItems"
          :key="item.id"
          href="#"
          @click.prevent="navigate(item.id)"
          :class="['nav-item', { active: isActive(item.id) }]"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile" @click="settingsOpen = true" style="cursor:pointer;flex:1">
          <img
            :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${authStore.user?.name}`"
            alt="Admin"
            class="user-avatar"
          />
          <div class="user-info">
            <div class="user-name">{{ authStore.user?.name ?? 'Admin' }}</div>
            <div class="user-role">{{ roleLabel }}</div>
          </div>
        </div>
        <button class="settings-btn" @click="settingsOpen = true" title="Configuración">⚙️</button>
        <button class="logout-btn" @click="handleLogout" title="Cerrar sesión">🚪</button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">

      <!-- Mobile Topbar -->
      <div class="mobile-topbar">
        <button class="hamburger-btn" @click="sidebarOpen = true">☰</button>
        <div class="mobile-brand">
          <a href="/" class="logo">
            <img src="/images/logo-services.png" alt="logo" class="logo-img" />
          </a>
        </div>
        <button class="icon-btn small" @click="refreshStats" :disabled="loadingStats">
          <span :class="{ spinning: loadingStats }">🔄</span>
        </button>
      </div>

      <!-- Desktop Header -->
      <header class="content-header">
        <div class="header-left">
          <h1 class="page-title">Panel de Administración</h1>
          <p class="page-subtitle">
            Bienvenido, <strong>{{ authStore.user?.name }}</strong>
            <span class="date-text"> · {{ currentDate }}</span>
          </p>
        </div>
        <div class="header-right">
          <div class="user-chip">
            <span class="chip-dot"></span>
            <span class="chip-email">{{ authStore.user?.email }}</span>
          </div>
          <button class="icon-btn" @click="refreshStats" :disabled="loadingStats" title="Actualizar">
            <span :class="{ spinning: loadingStats }">🔄</span>
          </button>
        </div>
      </header>

      <RouterView />
    </main>

    <AccountSettings v-model="settingsOpen" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import AccountSettings from '@/components/AccountSettings.vue';

const route     = useRoute();
const router    = useRouter();
const authStore = useAuthStore();

// ── Estado ─────────────────────────────────────────────────
const sidebarOpen  = ref(false);
const settingsOpen = ref(false);
const loadingStats = ref(false);
const loadingUsers = ref(false);
const apiError     = ref('');
const stats        = ref({});
const recentUsers  = ref([]);

// ── Permisos reactivos desde el store ──────────────────────
const isSuperAdmin = computed(() => authStore.user?.is_super_admin ?? false);
const hasModule    = (module) => isSuperAdmin.value || (authStore.user?.permissions?.[module] === true);

// ── NavItems filtrados según permisos ──────────────────────
const allNavItems = [
  { id: 'dashboard',  icon: '📊', label: 'Dashboard',        module: null,         superAdminOnly: false },
  { id: 'users',      icon: '👥', label: 'Usuarios',         module: 'users',      superAdminOnly: false },
  { id: 'categories', icon: '🏷️', label: 'Categorías',      module: 'categories', superAdminOnly: false },
  { id: 'reports',    icon: '📈', label: 'Reportes',        module: null,         superAdminOnly: false },
  { id: 'logs',       icon: '📋', label: 'Auditoría',       module: null,         superAdminOnly: true  },
  { id: 'sub-admins', icon: '🛡️', label: 'Administradores', module: null,         superAdminOnly: true  },
];

const navItems = computed(() =>
  allNavItems.filter(item => {
    if (item.superAdminOnly) return isSuperAdmin.value;
    if (!item.module)        return true;
    return hasModule(item.module);
  })
);

// ── Sincronizar sección activa con la ruta ─────────────────
watch(() => route.name, (name) => {
  // no se usa activeSection para nada crítico, isActive() usa route.name directamente
}, { immediate: true });

// ── Cerrar sidebar con Escape ──────────────────────────────
const onKeydown = (e) => { if (e.key === 'Escape') sidebarOpen.value = false; };
onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));

// ── Navegación ─────────────────────────────────────────────
const routeMap = {
  dashboard:    { name: 'DashboardAdmin' },
  users:        { name: 'AdminUsers' },
  categories:   { name: 'AdminCategories' },
  reports:      { name: 'AdminReports' },
  logs:         { name: 'AdminLogs' },
  'sub-admins': { name: 'AdminSubAdmins' },
};

const navigate = (id) => {
  sidebarOpen.value = false;
  if (routeMap[id]) router.push(routeMap[id]);
};

const nameMap = {
  dashboard:    'DashboardAdmin',
  users:        'AdminUsers',
  categories:   'AdminCategories',
  reports:      'AdminReports',
  logs:         'AdminLogs',
  'sub-admins': 'AdminSubAdmins',
};

const isActive = (id) => route.name === nameMap[id];

// ── Computed de UI ─────────────────────────────────────────
const roleMap = {
  admin:        'Super Administrador',
  client:       'Cliente',
  professional: 'Profesional',
};

const roleLabel = computed(() => {
  // Si tiene adminPermission → es sub-admin
  const user = authStore.user;
  if (!user) return '';
  if (isSuperAdmin.value) return 'Super Administrador';
  return 'Sub-Administrador';
});

const currentDate = computed(() =>
  new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
);

// ── Fetch stats ────────────────────────────────────────────
const fetchStats = async () => {
  loadingStats.value = true;
  apiError.value = '';
  try {
    const { data } = await api.get('/admin/stats');
    if (data.success) stats.value = { ...stats.value, ...data.stats };
  } catch {
    // fallback silencioso — el dashboard hijo maneja sus propios datos
  } finally {
    loadingStats.value = false;
  }
};

const fetchRecentUsers = async () => {
  // Solo cargar si tiene acceso al módulo usuarios
  if (!hasModule('users')) return;
  loadingUsers.value = true;
  try {
    const { data } = await api.get('/admin/users?per_page=4&sort=created_at');
    if (data.success) recentUsers.value = data.users.data ?? data.users;
  } catch {
    recentUsers.value = [];
  } finally {
    loadingUsers.value = false;
  }
};

const refreshStats = () => Promise.all([fetchStats(), fetchRecentUsers()]);

const handleLogout = () => authStore.logout();

// ── Init ───────────────────────────────────────────────────
onMounted(() => {
  if (authStore.user?.role !== 'admin') {
    authStore.logout();
    return;
  }
  fetchStats();
  fetchRecentUsers();
});
</script>

<style>
*, *::before, *::after { box-sizing: border-box; }

/* ─── Layout ─── */
.dashboard.admin {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Outfit', -apple-system, sans-serif;
  position: relative;
}

/* ─── Overlay ─── */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  z-index: 40;
  backdrop-filter: blur(3px);
}

/* ─── Sidebar ─── */
.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0;
  height: 100vh;
  z-index: 50;
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px 16px 18px;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.brand { display:flex; align-items:center; justify-content:center; }
.brand-icon { font-size:32px; }
.brand-name {
  font-size:24px; font-weight:900;
  background:linear-gradient(135deg,#2563eb,#4f46e5);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
}

.admin-badge-header {
  display:inline-flex; align-items:center; gap:6px;
  background:linear-gradient(135deg,#fee2e2,#fecaca);
  color:#dc2626; padding:6px 14px; border-radius:8px;
  font-size:12px; font-weight:800;
}

.sidebar-close-btn {
  display: none;
  position:absolute; top:16px; right:16px;
  width:32px; height:32px; border-radius:8px;
  border:none; background:#f1f5f9;
  font-size:16px; font-weight:700; color:#64748b;
  cursor:pointer; align-items:center; justify-content:center;
}

.sidebar-nav { flex:1; padding:16px 12px; overflow-y:auto; }

.nav-item {
  display:flex; align-items:center; gap:12px;
  padding:12px 16px; margin-bottom:4px; border-radius:12px;
  color:#64748b; text-decoration:none;
  font-weight:600; font-size:15px; transition:all 0.2s;
}
.nav-item:hover  { background:#f8fafc; color:#2563eb; }
.nav-item.active { background:linear-gradient(135deg,#eff6ff,#dbeafe); color:#2563eb; }

.nav-icon  { font-size:20px; width:24px; text-align:center; flex-shrink:0; }
.nav-label { flex:1; }
.nav-badge { background:#ef4444; color:white; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:800; }

.sidebar-footer {
  padding:16px 20px; border-top:1px solid #f1f5f9;
  display:flex; align-items:center; gap:12px;
}
.user-profile { display:flex; align-items:center; gap:12px; flex:1; min-width:0; }
.user-avatar  { width:44px; height:44px; border-radius:12px; border:2px solid #e2e8f0; flex-shrink:0; }
.user-info    { min-width:0; }
.user-name    { font-weight:700; font-size:14px; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.user-role    { font-size:12px; color:#64748b; }
.logout-btn   { width:40px; height:40px; border-radius:10px; border:none; background:#fee2e2; font-size:18px; cursor:pointer; transition:all 0.2s; flex-shrink:0; }
.logout-btn:hover { background:#fca5a5; }

/* ─── Main Content ─── */
.main-content { flex:1; margin-left:280px; padding:32px 40px; min-width:0; }

/* ─── Mobile Topbar (hidden on desktop) ─── */
.mobile-topbar {
  display:none; align-items:center; justify-content:space-between;
  padding:12px 16px; background:white; border-bottom:1px solid #e2e8f0;
  position:sticky; top:0; z-index:30;
  margin:-32px -40px 24px;
}
.hamburger-btn {
  width:44px; height:44px; border-radius:12px; border:none; background:#f1f5f9;
  font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center;
}
.mobile-brand {
  display:flex; align-items:center; gap:8px; font-size:20px; font-weight:900;
  background:linear-gradient(135deg,#2563eb,#4f46e5);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
}

/* ─── Desktop Header ─── */
.content-header {
  display:flex; justify-content:space-between; align-items:center;
  margin-bottom:32px; gap:16px;
}
.page-title    { font-size:32px; font-weight:900; color:#0f172a; margin-bottom:4px; line-height:1.2; }
.page-subtitle { color:#64748b; font-size:14px; }
.header-right  { display:flex; align-items:center; gap:12px; flex-shrink:0; }

.user-chip {
  display:flex; align-items:center; gap:8px;
  background:#dcfce7; color:#16a34a;
  padding:8px 16px; border-radius:20px; font-size:13px; font-weight:700; white-space:nowrap;
}
.chip-dot {
  width:8px; height:8px; background:#16a34a; border-radius:50%; flex-shrink:0;
  animation:pulse 2s infinite;
}
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }

.icon-btn {
  width:44px; height:44px; border-radius:12px; border:none; background:white;
  font-size:20px; cursor:pointer; transition:all 0.2s;
  box-shadow:0 1px 3px rgba(0,0,0,.1);
  display:flex; align-items:center; justify-content:center;
}
.icon-btn.small { width:40px; height:40px; font-size:18px; box-shadow:none; background:#f1f5f9; }
.icon-btn:disabled { opacity:.5; cursor:not-allowed; }

@keyframes spin { to{transform:rotate(360deg)} }
.spinning { display:inline-block; animation:spin 1s linear infinite; }

/* ─── Loading / Error ─── */
.loading-overlay {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:80px 0; color:#64748b; gap:16px;
}
.loading-spinner {
  width:40px; height:40px; border:4px solid #e2e8f0; border-top-color:#2563eb;
  border-radius:50%; animation:spin .8s linear infinite;
}
.inner-loading { text-align:center; color:#94a3b8; padding:20px; font-size:14px; }

.api-error-banner {
  display:flex; justify-content:space-between; align-items:center;
  background:#fef3c7; border:1px solid #fcd34d; color:#92400e;
  padding:12px 20px; border-radius:12px; margin-bottom:24px;
  font-size:14px; font-weight:600; gap:12px;
}
.close-error { background:none; border:none; cursor:pointer; font-size:16px; color:#92400e; flex-shrink:0; }

/* ─── Stats Grid ─── */
.main-stats-grid {
  display:grid; grid-template-columns:repeat(4,1fr);
  gap:24px; margin-bottom:32px;
}
.main-stat-card {
  background:white; padding:24px; border-radius:20px;
  box-shadow:0 1px 3px rgba(0,0,0,.05); transition:all .3s; overflow:hidden;
}
.main-stat-card:hover { transform:translateY(-4px); box-shadow:0 12px 40px rgba(0,0,0,.1); }

.stat-header   { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
.stat-icon-wrapper { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:26px; }

.main-stat-card.users .stat-icon-wrapper        { background:linear-gradient(135deg,#dbeafe,#bfdbfe); }
.main-stat-card.revenue .stat-icon-wrapper      { background:linear-gradient(135deg,#dcfce7,#bbf7d0); }
.main-stat-card.services .stat-icon-wrapper     { background:linear-gradient(135deg,#fef3c7,#fde68a); }
.main-stat-card.satisfaction .stat-icon-wrapper { background:linear-gradient(135deg,#fce7f3,#fbcfe8); }

.stat-trend          { padding:5px 10px; border-radius:8px; font-size:12px; font-weight:800; }
.stat-trend.positive { background:#dcfce7; color:#16a34a; }

.stat-value         { font-size:36px; font-weight:900; color:#0f172a; margin-bottom:6px; line-height:1; }
.stat-label         { font-size:14px; color:#64748b; font-weight:600; margin-bottom:14px; }
.stat-breakdown     { display:flex; flex-direction:column; gap:7px; }
.breakdown-item     { display:flex; align-items:center; gap:8px; font-size:13px; color:#475569; font-weight:600; }
.breakdown-dot      { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.breakdown-dot.clients { background:#3b82f6; }
.breakdown-dot.pros    { background:#f59e0b; }
.mini-chart         { display:flex; align-items:flex-end; gap:3px; height:36px; }
.mini-bar           { flex:1; background:linear-gradient(135deg,#dcfce7,#86efac); border-radius:2px; min-height:6px; }
.stat-detail        { font-size:13px; color:#64748b; }
.detail-highlight   { color:#2563eb; font-weight:800; }
.rating-bars        { display:flex; flex-direction:column; gap:5px; }
.rating-bar         { height:4px; background:#f1f5f9; border-radius:2px; overflow:hidden; }
.bar-fill           { height:100%; background:linear-gradient(90deg,#fbbf24,#f59e0b); border-radius:2px; }

/* ─── Analytics ─── */
.section        { margin-bottom:32px; }
.analytics-card { background:white; padding:28px; border-radius:20px; box-shadow:0 1px 3px rgba(0,0,0,.05); }

.analytics-header {
  display:flex; justify-content:space-between; align-items:center;
  margin-bottom:28px; gap:16px; flex-wrap:wrap;
}
.analytics-title    { font-size:22px; font-weight:800; color:#0f172a; margin-bottom:4px; }
.analytics-subtitle { font-size:13px; color:#64748b; }
.analytics-filters  { display:flex; gap:8px; flex-wrap:wrap; }

.filter-btn {
  padding:9px 18px; background:#f8fafc; border:none; border-radius:10px;
  font-weight:600; font-size:13px; color:#64748b; cursor:pointer; transition:all .2s; white-space:nowrap;
}
.filter-btn.active { background:linear-gradient(135deg,#2563eb,#3b82f6); color:white; }

.analytics-chart   { position:relative; height:260px; }
.chart-grid        { position:absolute; inset:0; display:flex; flex-direction:column; justify-content:space-between; }
.grid-line         { width:100%; height:1px; background:#f1f5f9; }
.chart-bars        { position:relative; display:flex; align-items:flex-end; gap:6px; height:100%; padding-top:36px; }
.chart-column      { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; min-width:0; }
.chart-bar-wrapper { width:100%; display:flex; justify-content:center; align-items:flex-end; height:100%; }

.chart-bar {
  width:80%; background:linear-gradient(180deg,#3b82f6,#2563eb);
  border-radius:6px 6px 0 0; position:relative; transition:all .2s; cursor:pointer;
}
.chart-bar:hover { background:linear-gradient(180deg,#60a5fa,#3b82f6); }

.bar-value {
  position:absolute; top:-22px; left:50%; transform:translateX(-50%);
  font-size:11px; font-weight:800; color:#0f172a;
  opacity:0; transition:opacity .2s; white-space:nowrap;
}
.chart-bar:hover .bar-value { opacity:1; }
.chart-label { margin-top:8px; font-size:11px; color:#94a3b8; font-weight:600; }

/* ─── Actions ─── */
.section-title      { font-size:22px; font-weight:800; color:#0f172a; margin-bottom:16px; }
.admin-actions-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }

.admin-action-card {
  display:flex; align-items:center; gap:14px; padding:20px;
  background:white; border:2px solid #f1f5f9; border-radius:18px;
  cursor:pointer; transition:all .2s; text-align:left; width:100%;
}
.admin-action-card:hover { border-color:#dbeafe; transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.08); }
.action-icon  { font-size:28px; flex-shrink:0; }
.action-name  { font-weight:700; color:#0f172a; margin-bottom:3px; font-size:14px; line-height:1.3; }
.action-count { font-size:13px; color:#2563eb; font-weight:700; }

/* ─── Two Columns ─── */
.two-column-section { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; margin-bottom:32px; }
.section-card { background:white; padding:24px; border-radius:20px; box-shadow:0 1px 3px rgba(0,0,0,.05); }
.card-header  { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; gap:8px; }
.card-title   { font-size:18px; font-weight:800; color:#0f172a; }
.view-link    { color:#2563eb; font-size:13px; font-weight:700; text-decoration:none; white-space:nowrap; }

.users-list       { display:flex; flex-direction:column; gap:12px; }
.user-item        { display:flex; align-items:center; gap:12px; padding:14px; background:#f8fafc; border-radius:12px; }
.user-item-avatar { width:40px; height:40px; border-radius:10px; border:2px solid white; flex-shrink:0; }
.user-item-info   { flex:1; min-width:0; }
.user-item-name   { font-weight:700; color:#0f172a; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.user-item-type   { font-size:12px; color:#64748b; }
.user-item-status { padding:5px 10px; border-radius:7px; font-size:11px; font-weight:800; white-space:nowrap; flex-shrink:0; }
.user-item-status.active  { background:#dcfce7; color:#16a34a; }
.user-item-status.pending { background:#fef3c7; color:#d97706; }
.empty-state { text-align:center; color:#94a3b8; padding:20px; font-size:14px; }

.approvals-list { display:flex; flex-direction:column; gap:12px; }
.approval-item  { display:flex; align-items:center; gap:14px; padding:14px; background:#f8fafc; border-radius:12px; }
.approval-icon  { font-size:28px; flex-shrink:0; }
.approval-info  { flex:1; min-width:0; }
.approval-title { font-weight:700; color:#0f172a; margin-bottom:3px; font-size:14px; }
.approval-desc  { font-size:13px; color:#64748b; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.approval-time  { font-size:11px; color:#94a3b8; font-weight:600; }
.approval-actions { display:flex; gap:6px; flex-shrink:0; }
.approve-btn,.reject-btn { width:34px; height:34px; border-radius:8px; border:none; font-size:14px; font-weight:800; cursor:pointer; transition:all .2s; }
.approve-btn { background:#dcfce7; color:#16a34a; }
.approve-btn:hover { background:#16a34a; color:white; }
.reject-btn  { background:#fee2e2; color:#dc2626; }
.reject-btn:hover { background:#dc2626; color:white; }

/* ─── Table ─── */
.export-btn {
  display:flex; align-items:center; gap:6px; padding:9px 18px;
  background:#f8fafc; border:none; border-radius:10px;
  font-weight:700; font-size:13px; color:#475569; cursor:pointer; white-space:nowrap;
}
.export-btn:hover { background:#f1f5f9; }
.stats-table { overflow-x:auto; -webkit-overflow-scrolling:touch; }
table  { width:100%; border-collapse:collapse; min-width:400px; }
thead  { background:#f8fafc; }
th     { padding:14px 16px; text-align:left; font-weight:800; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:.5px; white-space:nowrap; }
td     { padding:18px 16px; border-top:1px solid #f1f5f9; font-size:14px; color:#475569; }
.table-category { display:flex; align-items:center; gap:10px; font-weight:700; color:#0f172a; }
.category-icon  { font-size:18px; flex-shrink:0; }
.revenue-value  { font-weight:800; color:#0f172a; }
.rating-badge   { background:#fef3c7; color:#d97706; padding:5px 10px; border-radius:7px; font-size:12px; font-weight:800; }
.trend-indicator      { font-weight:800; font-size:13px; }
.trend-indicator.up   { color:#16a34a; }
.trend-indicator.down { color:#dc2626; }

/* ─── Mobile Bottom Nav ─── */
.mobile-bottom-nav {
  display:none; position:fixed; bottom:0; left:0; right:0;
  background:white; border-top:1px solid #e2e8f0;
  padding:8px 0 max(8px, env(safe-area-inset-bottom));
  z-index:30; justify-content:space-around;
  box-shadow:0 -4px 20px rgba(0,0,0,.08);
}
.mobile-nav-item {
  display:flex; flex-direction:column; align-items:center; gap:3px;
  text-decoration:none; padding:6px 10px; border-radius:12px; transition:all .2s; min-width:52px;
}
.mobile-nav-item.active { background:#eff6ff; }
.mobile-nav-icon  { font-size:22px; }
.mobile-nav-label { font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.3px; }
.mobile-nav-item.active .mobile-nav-label { color:#2563eb; }

.mobile-bottom-spacer { display:none; height:80px; }

/* ═══════════════════════════════════════════════════════
   BREAKPOINTS
═══════════════════════════════════════════════════════ */

/* 1400px — laptop pequeño */
@media (max-width: 1400px) {
  .main-content       { padding:28px 32px; }
  .main-stats-grid    { grid-template-columns:repeat(2,1fr); }
  .admin-actions-grid { grid-template-columns:repeat(2,1fr); }
}

/* 1100px — tablet landscape */
@media (max-width: 1100px) {
  .sidebar      { width:240px; }
  .main-content { margin-left:240px; padding:24px 24px; }
  .page-title   { font-size:26px; }
  .chip-email   { display:none; }
  .user-chip    { padding:8px 12px; }
}

/* 900px — tablet portrait: sidebar se convierte en drawer */
@media (max-width: 900px) {
  .sidebar       { transform:translateX(-100%); width:280px; }
  .main-content  { margin-left:0; padding:0 20px 20px; }

  .mobile-topbar         { display:flex; margin:-0 -20px 20px; }
  .content-header        { display:none; }
  .sidebar-close-btn     { display:flex; }

  .sidebar-open .sidebar          { transform:translateX(0); }
  .sidebar-open .sidebar-overlay  { display:block; }

  .main-stats-grid    { grid-template-columns:repeat(2,1fr); gap:16px; }
  .admin-actions-grid { grid-template-columns:repeat(2,1fr); gap:12px; }
  .two-column-section { grid-template-columns:1fr; gap:16px; }

  .analytics-chart { height:220px; }
  .analytics-card  { padding:20px; }
  .section         { margin-bottom:24px; }

  .mobile-bottom-nav    { display:flex; }
  .mobile-bottom-spacer { display:block; }
}

/* 640px — teléfono grande */
@media (max-width: 640px) {
  .main-content  { padding:0 16px 16px; }
  .mobile-topbar { margin:0 -16px 16px; }

  .main-stats-grid    { grid-template-columns:repeat(2,1fr); gap:12px; }
  .admin-actions-grid { grid-template-columns:repeat(2,1fr); gap:10px; }

  .main-stat-card    { padding:16px; border-radius:16px; }
  .stat-value        { font-size:28px; }
  .stat-icon-wrapper { width:44px; height:44px; font-size:22px; }
  .stat-breakdown    { display:none; }

  .admin-action-card { padding:14px; gap:10px; }
  .action-icon       { font-size:24px; }
  .action-name       { font-size:13px; }

  .analytics-chart  { height:180px; }
  .analytics-header { flex-direction:column; align-items:flex-start; gap:12px; }

  .section-card { padding:16px; }
  .date-text    { display:none; }

  .approval-item    { flex-wrap:wrap; }
  .approval-actions { width:100%; justify-content:flex-end; margin-top:4px; }
}

/* 480px — teléfono estándar */
@media (max-width: 480px) {
  .main-stats-grid    { gap:10px; }
  .admin-actions-grid { gap:10px; }

  .main-stat-card { padding:14px; }
  .stat-value     { font-size:26px; }
  .stat-label     { font-size:12px; margin-bottom:10px; }
  .stat-trend     { padding:4px 8px; font-size:11px; }

  .section-title   { font-size:18px; }
  .analytics-title { font-size:18px; }
  .card-title      { font-size:16px; }

  .user-item        { padding:12px; gap:10px; }
  .user-item-avatar { width:36px; height:36px; }

  .hide-sm      { display:none; }
  .export-label { display:none; }

  .mobile-nav-item  { min-width:44px; padding:6px 6px; }
  .mobile-nav-label { font-size:9px; }
}

/* 360px — teléfono pequeño */
@media (max-width: 360px) {
  .main-stats-grid    { grid-template-columns:1fr; }
  .admin-actions-grid { grid-template-columns:1fr 1fr; }
  .main-stat-card     { padding:16px; }
  .stat-value         { font-size:32px; }
  .stat-breakdown     { display:flex; }
}

.logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.logo-img {
  height: 56px;
  width: auto;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 2px 8px rgba(37, 99, 235, 0.15));
}

@media (max-width: 900px) {
  .logo-img { height: 44px; }
}
</style>
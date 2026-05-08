<template>
  <div class="dashboard professional" :class="{ 'sidebar-open': sidebarOpen }">

    <!-- Overlay -->
    <div class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <!-- Sidebar -->
    <aside class="sidebar">

      <div class="sidebar-header">
        <div class="brand">
          <a href="/" class="logo">
            <img src="/images/logo-services-sin-fondo.png" alt="logo" class="logo-img" />
          </a>
        </div>

        <div class="pro-badge-header">
          💼 Profesional
        </div>

        <button class="sidebar-close-btn" @click="sidebarOpen = false">✕</button>
      </div>

      <nav class="sidebar-nav">

        <router-link :to="{ name: 'ProfessionalHome' }" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">Panel de Servicio</span>
        </router-link>

        <router-link :to="{ name: 'ProfileProfesional' }" class="nav-item">
          <span class="nav-icon">👤</span>
          <span class="nav-label">Mi Perfil</span>
        </router-link>

        <router-link :to="{ name: 'MisTrabajos' }" class="nav-item">
          <span class="nav-icon">🗂️</span>
          <span class="nav-label">Mis Trabajos</span>
        </router-link>

        <router-link :to="{ name: 'MisIngresos' }" class="nav-item">
          <span class="nav-icon">💰</span>
          <span class="nav-label">Mis Ingresos</span>
        </router-link>

        <router-link :to="{ name: 'DatosPago' }" class="nav-item">
          <span class="nav-icon">💳</span>
          <span class="nav-label">Datos de Pago</span>
        </router-link>

      </nav>

      <div class="sidebar-footer">

        <div class="user-profile" @click="settingsOpen = true" style="cursor:pointer;flex:1">
          <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`" class="user-avatar" />

          <div class="user-info">
            <div class="user-name">{{ user?.name }}</div>
            <div class="user-role">{{ formattedRole }}</div>
          </div>
        </div>

        <button class="settings-btn" @click="settingsOpen = true" title="Configuración">⚙️</button>
        <button class="logout-btn" @click="handleLogout">🚪</button>

      </div>

    </aside>

    <AccountSettings v-model="settingsOpen" />

    <!-- MAIN -->
    <main class="main-content">

      <!-- Mobile Topbar -->
      <div class="mobile-topbar">

        <button class="hamburger-btn" @click="sidebarOpen = true">
          ☰
        </button>

        <div class="mobile-brand">
          <a href="/" class="logo">
            <img src="/images/logo-services.png" alt="logo" class="logo-img" />
          </a>
        </div>

      </div>

      <!-- Header desktop -->
      <header class="content-header">

        <div>
          <h1 class="page-title">Panel Profesional</h1>
          <p class="page-subtitle">
            Bienvenido {{ user?.name }}
          </p>
        </div>

      </header>

      <router-view />

    </main>

  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AccountSettings from '@/components/AccountSettings.vue'
import api from '@/services/api'

const authStore = useAuthStore()

const sidebarOpen  = ref(false)
const settingsOpen = ref(false)

let heartbeatTimer = null
onMounted(() => {
  api.get('/heartbeat').catch(() => {})
  heartbeatTimer = setInterval(() => api.get('/heartbeat').catch(() => {}), 30000)
})
onUnmounted(() => clearInterval(heartbeatTimer))

const user = ref(null)

if (localStorage.getItem('user')) {
  user.value = JSON.parse(localStorage.getItem('user'))
}

const formattedRole = computed(() => {

  if (!user.value?.role) return ''

  if (user.value.role === 'professional') {
    return 'Profesional'
  }

  return user.value.role

})

const handleLogout = () => {
  authStore.logout()
}
</script>

<style>
.dashboard.professional {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Outfit', -apple-system, sans-serif;
}

/* overlay */

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
}

/* sidebar */

.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 50;
  transition: transform .3s ease;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
}

.sidebar-close-btn {
  display: none;
  position: absolute;
  top: 16px;
  right: 16px;
  border: none;
  background: #f1f5f9;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  width: 35px;
  height: 35px;
  border-radius: 8px;
}

.brand-name {
  font-size: 22px;
  font-weight: 900;
}

.pro-badge-header {
  margin-top: 10px;
  background: #fde68a;
  color: #92400e;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: #64748b;
  font-weight: 600;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #2563eb;
}

.nav-item.router-link-active {
  background: #eff6ff;
  color: #2563eb;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
}

.settings-btn {
  border: none;
  background: #eff6ff;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background .15s;
}
.settings-btn:hover { background: #dbeafe; }

.logout-btn {
  border: none;
  background: #fee2e2;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  flex-shrink: 0;
}

/* main */

.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 40px;
}

/* header */

.page-title {
  font-size: 32px;
  font-weight: 900;
}

.page-subtitle {
  color: #64748b;
}

/* mobile topbar */

.mobile-topbar {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.hamburger-btn {
  border: none;
  background: #f1f5f9;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 20px;
  cursor: pointer;
}

.mobile-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
}

.brand-logo-mobile {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}

/* =========================
   RESPONSIVE
   ========================= */

@media (max-width:900px) {

  .sidebar {
    transform: translateX(-100%);
  }

  .main-content {
    margin-left: 0;
    padding: 0 20px 20px;
  }

  .mobile-topbar {
    display: flex;
  }

  .content-header {
    display: none;
  }

  .sidebar-close-btn {
    display: block;
  }

  .sidebar-open .sidebar {
    transform: translateX(0);
  }

  .sidebar-open .sidebar-overlay {
    display: block;
  }

}

@media (max-width:640px) {

  .main-content {
    padding: 0 16px 16px;
  }

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
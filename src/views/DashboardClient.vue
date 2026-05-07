<template>
  <div class="dashboard client" :class="{ 'sidebar-open': sidebarOpen }">

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
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">

        <router-link
          v-for="item in navItems"
          :key="item.id"
          :to="item.route"
          class="nav-item"
          @click="sidebarOpen = false"
        >
          <span class="nav-icon">{{ item.icon }}</span>

          <span class="nav-label">
            {{ item.label }}
          </span>

          <span v-if="item.badge" class="nav-badge">
            {{ item.badge }}
          </span>

        </router-link>

      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">

        <div class="user-profile" @click="settingsOpen = true" style="cursor:pointer;flex:1">

          <img
            :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${authStore.user?.name}`"
            class="user-avatar"
          />

          <div class="user-info">
            <div class="user-name">{{ authStore.user?.name }}</div>
            <div class="user-role">{{ roleLabel }}</div>
          </div>

        </div>

        <button class="settings-btn" @click="settingsOpen = true" title="Configuración">⚙️</button>
        <button class="logout-btn" @click="handleLogout">🚪</button>

      </div>

    </aside>

    <!-- Main -->
    <main class="main-content">

      <!-- Mobile Topbar -->
      <div class="mobile-topbar">

        <button
          class="hamburger-btn"
          @click="sidebarOpen = true"
        >
          ☰
        </button>

        <div class="mobile-brand">
          <a href="/" class="logo">
            <img src="/images/logo-services-sin-fondo.png" alt="logo" class="logo-img" />
          </a>
        </div>

        <button class="icon-btn small">
          🔔
        </button>

      </div>

      <!-- Desktop Header -->
      <header class="content-header">

        <div class="header-left">

          <h1 class="page-title">
            Panel de Cliente
          </h1>

          <p class="page-subtitle">

            Bienvenido
            <strong>{{ authStore.user?.name }}</strong>

            <span class="date-text">
              · {{ currentDate }}
            </span>

          </p>

        </div>

        <div class="header-right">

          <button class="icon-btn">
            <span class="notification-dot"></span>
            🔔
          </button>
        </div>

      </header>

      <RouterView />

    </main>

    <AccountSettings v-model="settingsOpen" />

  </div>
</template>

<script setup>

import { ref, computed, onMounted, onUnmounted } from 'vue'
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
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(() => {}, () => {})
  }
})
onUnmounted(() => clearInterval(heartbeatTimer))

const currentDate = computed(() =>
  new Date().toLocaleDateString(
    'es-CO',
    {
      weekday:'long',
      year:'numeric',
      month:'long',
      day:'numeric'
    }
  )
)

const roleMap = {
  client:'Cliente Premium',
  professional:'Profesional',
  admin:'Administrador'
}

const roleLabel = computed(() =>
  roleMap[authStore.user?.role] ??
  authStore.user?.role ??
  'Cliente'
)

const handleLogout = () => {
  authStore.logout()
}

const navItems = [
  {
    id: 'dashboard',
    icon: '🏠',
    label: 'Panel de Solicitudes',
    route: { name: 'ClienteHome' }
  },
  {
    id: 'solicitudes',
    icon: '📋',
    label: 'Mis Solicitudes',
    route: { name: 'MisSolicitudes' }
  },
]

</script>

<style>
.sidebar-header {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f1f5f9;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-img {
  width: 160px;
  height: auto;
  object-fit: contain;
  display: block;
}

@media (max-width: 768px) {
  .logo-img { width: 120px; }
  .sidebar-header { padding: 16px; }
}
</style>
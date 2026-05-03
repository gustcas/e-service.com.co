<template>

  <!-- Loading -->
  <div v-if="loadingStats" class="loading-overlay">
    <div class="loading-spinner"></div>
    <p>Cargando estadísticas...</p>
  </div>

  <!-- Error -->
  <div v-if="apiError" class="api-error-banner">
    ⚠️ {{ apiError }}
  </div>

  <!-- ALERTA -->
  <div v-if="stats.pendingProfessionals > 0" class="alert-banner">
    ⚠️ {{ stats.pendingProfessionals }} profesionales pendientes de aprobación
  </div>

  <!-- MAIN STATS -->
  <div class="main-stats-grid" v-if="!loadingStats">

    <div class="main-stat-card">
      <span class="stat-icon">👥</span>
      <div class="stat-value">{{ stats.totalUsers }}</div>
      <div class="stat-label">Usuarios</div>
    </div>

    <div class="main-stat-card">
      <span class="stat-icon">💼</span>
      <div class="stat-value">{{ stats.totalProfessionals }}</div>
      <div class="stat-label">Profesionales</div>
    </div>

    <div class="main-stat-card">
      <span class="stat-icon">👤</span>
      <div class="stat-value">{{ stats.totalClients }}</div>
      <div class="stat-label">Clientes</div>
    </div>

    <div class="main-stat-card">
      <span class="stat-icon">🟢</span>
      <div class="stat-value">{{ stats.activeUsers }}</div>
      <div class="stat-label">Activos</div>
    </div>

  </div>

  <!-- HEALTH -->
  <div class="health-grid">

    <div class="health-card success">
      <span>✔</span>
      <div>
        <div class="health-title">Activos</div>
        <div class="health-value">{{ stats.activeUsers }}</div>
      </div>
    </div>

    <div class="health-card warning">
      <span>⏳</span>
      <div>
        <div class="health-title">Pendientes</div>
        <div class="health-value">{{ stats.pendingProfessionals }}</div>
      </div>
    </div>

    <div class="health-card danger">
      <span>🚫</span>
      <div>
        <div class="health-title">Inactivos</div>
        <div class="health-value">{{ stats.inactiveUsers }}</div>
      </div>
    </div>

    <div class="health-card info">
      <span>📊</span>
      <div>
        <div class="health-title">Conversión</div>
        <div class="health-value">{{ conversionRate }}%</div>
      </div>
    </div>

  </div>

  <!-- USUARIOS RECIENTES -->
  <div class="recent-section">
    <div class="recent-header">
      <h3 class="recent-title">Usuarios Recientes</h3>
      <span class="recent-count">{{ recentUsers.length }} registros</span>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loadingUsers" class="users-grid">
      <div v-for="n in 5" :key="n" class="user-card skeleton-card">
        <div class="sk-line sk-badge"></div>
        <div class="sk-avatar"></div>
        <div class="sk-line sk-name"></div>
        <div class="sk-line sk-sub"></div>
        <div class="sk-line sk-btn"></div>
      </div>
    </div>

    <!-- Cards grid -->
    <div v-else class="users-grid">
      <div v-for="user in recentUsers" :key="user.id" class="user-card" :class="user.role">

        <!-- Top: role chip + status -->
        <div class="uc-top">
          <span :class="['uc-role-chip', user.role]">
            {{ user.role === 'professional' ? '💼' : '👤' }}
            {{ roleMap[user.role] ?? user.role }}
          </span>
          <span :class="['uc-status', user.email_verified_at ? 'active' : 'pending']">
            {{ user.email_verified_at ? 'ACTIVO' : 'PENDIENTE' }}
          </span>
        </div>

        <!-- Avatar -->
        <div class="uc-avatar-wrap">
          <img
            :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`"
            class="uc-avatar"
            :alt="user.name"
          />
        </div>

        <!-- Info -->
        <div class="uc-info">
          <div class="uc-name">{{ user.name }}</div>
          <div class="uc-email">{{ user.email }}</div>
        </div>

        <!-- Date chip -->
        <div class="uc-date">
          📅 {{ formatUserDate(user.created_at) }}
        </div>

        <!-- Action -->
        <div class="uc-footer">
          <span class="uc-id">#{{ String(user.id).padStart(4, '0') }}</span>
          <button class="uc-btn" @click="goToUsers">Ver perfil →</button>
        </div>

      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const loadingStats = ref(false)
const loadingUsers = ref(false)
const apiError = ref('')

const stats = ref({
  totalUsers: 0,
  totalClients: 0,
  totalProfessionals: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  pendingProfessionals: 0,
})

const recentUsers = ref([])

const roleMap = {
  client: 'Cliente',
  professional: 'Profesional'
}

const conversionRate = computed(() => {
  if (!stats.value.totalUsers) return 0
  return Math.round(
    (stats.value.totalProfessionals / stats.value.totalUsers) * 100
  )
})

const fetchStats = async () => {
  loadingStats.value = true
  try {
    const { data } = await api.get('/admin/stats')
    if (data.success) {
      const s = data.stats
      stats.value = {
        totalUsers:           s.totalUsers           ?? s.total         ?? 0,
        totalClients:         s.totalClients         ?? s.clients       ?? 0,
        totalProfessionals:   s.totalProfessionals   ?? s.professionals ?? 0,
        activeUsers:          s.activeUsers          ?? s.active        ?? 0,
        inactiveUsers:        s.inactiveUsers        ?? s.inactive      ?? 0,
        pendingProfessionals: s.pendingProfessionals ?? 0,
        totalRequests:        s.totalRequests        ?? 0,
        completedRequests:    s.completedRequests    ?? 0,
      }
    }
  } catch {
    apiError.value = 'Error cargando estadísticas'
  } finally {
    loadingStats.value = false
  }
}

const fetchRecentUsers = async () => {
  loadingUsers.value = true
  try {
    const { data } = await api.get('/admin/users?per_page=5')
    if (data.success) recentUsers.value = data.users.data
  } catch {
    recentUsers.value = []
  } finally {
    loadingUsers.value = false
  }
}

const formatUserDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const goToUsers = () => router.push({ name: 'AdminUsers' })

onMounted(() => {
  fetchStats()
  fetchRecentUsers()
})
</script>


<style>
.main-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.main-stat-card {
  background: white;
  padding: 16px;
  border-radius: 14px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0,0,0,.05);
}

.stat-icon {
  font-size: 22px;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 15px;
}

.health-card {
  display: flex;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: white;
}

.success { border-left: 4px solid #22c55e; }
.warning { border-left: 4px solid #f59e0b; }
.danger  { border-left: 4px solid #ef4444; }
.info    { border-left: 4px solid #3b82f6; }

.alert-banner {
  background: #fef3c7;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 12px;
}

/* ── USUARIOS RECIENTES ──────────────────────────────── */
.recent-section {
  margin-top: 20px;
}
.recent-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.recent-title { font-size: 18px; font-weight: 900; color: #0f172a; margin: 0; }
.recent-count {
  font-size: 12px; font-weight: 700; color: #94a3b8;
  background: #f1f5f9; padding: 4px 10px; border-radius: 20px;
}

/* Grid */
.users-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  align-items: start;
}

/* Card */
.user-card {
  background: white;
  border-radius: 18px;
  border: 1.5px solid #f1f5f9;
  padding: 16px 14px 14px;
  display: flex; flex-direction: column; gap: 10px;
  transition: box-shadow .2s, transform .2s;
  position: relative;
  overflow: hidden;
}
.user-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #e2e8f0, #f1f5f9);
}
.user-card.professional::before { background: linear-gradient(90deg, #fde68a, #f59e0b); }
.user-card.client::before       { background: linear-gradient(90deg, #bfdbfe, #3b82f6); }
.user-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.09); transform: translateY(-3px); }

/* Top row */
.uc-top { display: flex; align-items: center; justify-content: space-between; gap: 4px; }

.uc-role-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px;
  white-space: nowrap;
}
.uc-role-chip.professional { background: #fef3c7; color: #d97706; }
.uc-role-chip.client       { background: #dbeafe; color: #2563eb; }

.uc-status {
  font-size: 9px; font-weight: 900; letter-spacing: .5px;
  padding: 3px 7px; border-radius: 5px; text-transform: uppercase;
}
.uc-status.active  { background: #dcfce7; color: #15803d; }
.uc-status.pending { background: #fef9c3; color: #b45309; }

/* Avatar */
.uc-avatar-wrap {
  display: flex; justify-content: center; padding: 6px 0;
}
.uc-avatar {
  width: 72px; height: 72px; border-radius: 16px;
  border: 3px solid #f1f5f9;
  background: #f8fafc;
}

/* Info */
.uc-info { text-align: center; }
.uc-name  { font-size: 13px; font-weight: 800; color: #0f172a; line-height: 1.3; }
.uc-email {
  font-size: 10px; color: #94a3b8; margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* Date */
.uc-date {
  font-size: 10px; color: #64748b; font-weight: 600;
  background: #f8fafc; border: 1px solid #f1f5f9;
  padding: 4px 8px; border-radius: 7px; text-align: center;
}

/* Footer */
.uc-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 2px;
}
.uc-id { font-size: 10px; color: #cbd5e1; font-weight: 700; }
.uc-btn {
  font-size: 11px; font-weight: 700; color: #2563eb;
  background: #eff6ff; border: 1px solid #bfdbfe;
  padding: 5px 10px; border-radius: 8px; cursor: pointer;
  font-family: inherit; transition: background .15s;
  white-space: nowrap;
}
.uc-btn:hover { background: #dbeafe; }

/* Skeleton */
.skeleton-card { gap: 12px; }
.sk-line {
  border-radius: 6px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%; animation: shimmerU 1.4s infinite;
}
@keyframes shimmerU { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.sk-badge  { height: 20px; width: 60%; border-radius: 6px; }
.sk-avatar { width: 72px; height: 72px; border-radius: 16px; margin: 0 auto;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%; animation: shimmerU 1.4s infinite; }
.sk-name   { height: 14px; width: 80%; margin: 0 auto; }
.sk-sub    { height: 10px; width: 60%; margin: 0 auto; }
.sk-btn    { height: 28px; width: 100%; border-radius: 8px; }

/* Responsive */
@media (max-width: 1200px) { .users-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 900px)  { .users-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 640px)  { .users-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 400px)  { .users-grid { grid-template-columns: 1fr; } }
</style>
<template>
  <div class="admin-dashboard">

    <!-- ── Alerta profesionales pendientes ─────────────────── -->
    <div v-if="stats.pendingProfessionals > 0" class="alert-banner">
      <span class="alert-icon">⚠️</span>
      <span>
        <strong>{{ stats.pendingProfessionals }}</strong>
        profesional{{ stats.pendingProfessionals !== 1 ? 'es' : '' }} pendiente{{ stats.pendingProfessionals !== 1 ? 's' : '' }} de aprobación
      </span>
      <button class="alert-link" @click="goTo('AdminUsers')">Revisar →</button>
    </div>

    <div v-if="apiError" class="api-error-banner">⚠️ {{ apiError }}</div>

    <!-- ── Métricas principales (6 tarjetas) ─────────────────── -->
    <div class="metrics-grid">
      <div class="metric-card blue" @click="goTo('AdminUsers')">
        <div class="metric-top">
          <div class="metric-icon-wrap blue">👥</div>
          <div class="metric-trend up">{{ stats.activeUsers }} activos</div>
        </div>
        <div class="metric-value">
          <span v-if="loadingStats" class="sk-val"></span>
          <span v-else>{{ stats.totalUsers }}</span>
        </div>
        <div class="metric-label">Usuarios totales</div>
        <div class="metric-sub">
          {{ stats.totalClients }} clientes · {{ stats.totalProfessionals }} profesionales
        </div>
      </div>

      <div class="metric-card amber" @click="goTo('AdminUsers')">
        <div class="metric-top">
          <div class="metric-icon-wrap amber">💼</div>
          <div v-if="stats.pendingProfessionals > 0" class="metric-trend warn">{{ stats.pendingProfessionals }} pendientes</div>
        </div>
        <div class="metric-value">
          <span v-if="loadingStats" class="sk-val"></span>
          <span v-else>{{ stats.totalProfessionals }}</span>
        </div>
        <div class="metric-label">Profesionales</div>
        <div class="metric-sub">{{ stats.totalProfessionals - stats.pendingProfessionals }} verificados</div>
      </div>

      <div class="metric-card green" @click="goTo('AdminPayments')">
        <div class="metric-top">
          <div class="metric-icon-wrap green">💰</div>
        </div>
        <div class="metric-value metric-value-sm">
          <span v-if="loadingStats" class="sk-val"></span>
          <span v-else>{{ formatCOP(stats.totalCollected) }}</span>
        </div>
        <div class="metric-label">Total recaudado</div>
        <div class="metric-sub">{{ stats.completedRequests }} servicios completados</div>
      </div>

      <div class="metric-card purple">
        <div class="metric-top">
          <div class="metric-icon-wrap purple">📋</div>
        </div>
        <div class="metric-value">
          <span v-if="loadingStats" class="sk-val"></span>
          <span v-else>{{ stats.totalRequests }}</span>
        </div>
        <div class="metric-label">Solicitudes totales</div>
        <div class="metric-sub">{{ stats.todayRequests }} hoy</div>
      </div>

      <div class="metric-card teal" @click="goTo('AdminLiveServices')">
        <div class="metric-top">
          <div class="metric-icon-wrap teal">⚙️</div>
          <div v-if="stats.acceptedRequests > 0" class="metric-trend info">En tiempo real</div>
        </div>
        <div class="metric-value">
          <span v-if="loadingStats" class="sk-val"></span>
          <span v-else>{{ stats.acceptedRequests }}</span>
        </div>
        <div class="metric-label">Servicios en curso</div>
        <div class="metric-sub">{{ stats.pendingRequests }} en espera de profesional</div>
      </div>

      <div class="metric-card rose">
        <div class="metric-top">
          <div class="metric-icon-wrap rose">🚫</div>
        </div>
        <div class="metric-value">
          <span v-if="loadingStats" class="sk-val"></span>
          <span v-else>{{ stats.inactiveUsers }}</span>
        </div>
        <div class="metric-label">Usuarios inactivos</div>
        <div class="metric-sub">{{ stats.cancelledRequests }} solicitudes canceladas</div>
      </div>
    </div>

    <!-- ── Dos columnas: barras + accesos rápidos ────────────── -->
    <div class="two-col">

      <!-- Distribución de solicitudes -->
      <div class="panel">
        <div class="panel-header">
          <h3 class="panel-title">Estado de solicitudes</h3>
          <span class="panel-total">{{ stats.totalRequests }} total</span>
        </div>

        <div v-if="loadingStats" class="sk-bars">
          <div v-for="n in 5" :key="n" class="sk-bar-row">
            <div class="sk-line" style="width:90px;height:11px"></div>
            <div class="sk-line" style="flex:1;height:8px"></div>
            <div class="sk-line" style="width:30px;height:11px"></div>
          </div>
        </div>
        <div v-else-if="stats.totalRequests > 0" class="status-bars">
          <div v-for="bar in statusBars" :key="bar.label" class="status-bar-row">
            <span :class="['bar-dot', bar.color]"></span>
            <span class="bar-label">{{ bar.label }}</span>
            <div class="bar-track">
              <div class="bar-fill" :class="bar.color"
                :style="{ width: pct(bar.value, stats.totalRequests) + '%' }"></div>
            </div>
            <span class="bar-count">{{ bar.value }}</span>
            <span class="bar-pct">{{ pct(bar.value, stats.totalRequests) }}%</span>
          </div>
        </div>
        <div v-else class="empty-state-sm">Sin solicitudes registradas aún.</div>
      </div>

      <!-- Accesos rápidos -->
      <div class="panel">
        <div class="panel-header">
          <h3 class="panel-title">Acciones rápidas</h3>
        </div>
        <div class="quick-links">
          <button class="quick-link" @click="goTo('AdminUsers')">
            <span class="ql-icon blue">👥</span>
            <div class="ql-text">
              <span class="ql-label">Gestión de usuarios</span>
              <span class="ql-sub">Aprobar, filtrar y exportar</span>
            </div>
            <span class="ql-arrow">→</span>
          </button>
          <button class="quick-link" @click="goTo('AdminLiveServices')">
            <span class="ql-icon teal">🔴</span>
            <div class="ql-text">
              <span class="ql-label">Servicios en vivo</span>
              <span class="ql-sub">Monitoreo y reasignaciones</span>
            </div>
            <span class="ql-arrow">→</span>
          </button>
          <button class="quick-link" @click="goTo('AdminPayments')">
            <span class="ql-icon green">💳</span>
            <div class="ql-text">
              <span class="ql-label">Pagos y dispersiones</span>
              <span class="ql-sub">Cobros y pagos a profesionales</span>
            </div>
            <span class="ql-arrow">→</span>
          </button>
          <button class="quick-link" @click="goTo('AdminCategories')">
            <span class="ql-icon purple">📂</span>
            <div class="ql-text">
              <span class="ql-label">Categorías y servicios</span>
              <span class="ql-sub">Gestionar catálogo de servicios</span>
            </div>
            <span class="ql-arrow">→</span>
          </button>
          <button class="quick-link" @click="goTo('AdminReports')">
            <span class="ql-icon amber">📊</span>
            <div class="ql-text">
              <span class="ql-label">Reportes</span>
              <span class="ql-sub">Estadísticas y exportaciones</span>
            </div>
            <span class="ql-arrow">→</span>
          </button>
          <button class="quick-link" @click="goTo('AdminLogs')">
            <span class="ql-icon rose">🗂️</span>
            <div class="ql-text">
              <span class="ql-label">Auditoría</span>
              <span class="ql-sub">Historial de acciones del sistema</span>
            </div>
            <span class="ql-arrow">→</span>
          </button>
        </div>
      </div>

    </div>

    <!-- ── Usuarios recientes ─────────────────────────────────── -->
    <div class="panel">
      <div class="panel-header">
        <h3 class="panel-title">Usuarios recientes</h3>
        <span class="panel-total">{{ recentUsers.length }} registros</span>
        <button class="panel-link" @click="goTo('AdminUsers')">Ver todos →</button>
      </div>

      <div v-if="loadingUsers" class="users-grid">
        <div v-for="n in 5" :key="n" class="user-card skeleton-card">
          <div class="sk-line sk-badge"></div>
          <div class="sk-avatar"></div>
          <div class="sk-line sk-name"></div>
          <div class="sk-line sk-sub"></div>
          <div class="sk-line sk-btn"></div>
        </div>
      </div>

      <div v-else class="users-grid">
        <div v-for="user in recentUsers" :key="user.id" class="user-card" :class="user.role">
          <div class="uc-top">
            <span :class="['uc-role-chip', user.role]">
              {{ user.role === 'professional' ? '💼' : '👤' }}
              {{ roleMap[user.role] ?? user.role }}
            </span>
            <span :class="['uc-status', user.is_active ? 'active' : 'inactive']">
              {{ user.is_active ? 'ACTIVO' : 'INACTIVO' }}
            </span>
          </div>
          <div class="uc-avatar-wrap">
            <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`" class="uc-avatar" :alt="user.name" />
          </div>
          <div class="uc-info">
            <div class="uc-name">{{ user.name }}</div>
            <div class="uc-email">{{ user.email }}</div>
          </div>
          <div class="uc-date">{{ formatUserDate(user.created_at) }}</div>
          <div class="uc-footer">
            <span class="uc-id">#{{ String(user.id).padStart(4, '0') }}</span>
            <button class="uc-btn" @click="goTo('AdminUsers')">Ver →</button>
          </div>
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

const loadingStats = ref(true)
const loadingUsers = ref(true)
const apiError = ref('')

const stats = ref({
  totalUsers: 0, totalClients: 0, totalProfessionals: 0,
  activeUsers: 0, inactiveUsers: 0, pendingProfessionals: 0,
  totalRequests: 0, pendingRequests: 0, acceptedRequests: 0,
  completedRequests: 0, cancelledRequests: 0, paymentPendingRequests: 0, todayRequests: 0,
  totalCollected: 0, pendingPayments: 0,
})

const recentUsers = ref([])
const roleMap = { client: 'Cliente', professional: 'Profesional' }

const formatCOP = (v) =>
  Number(v || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

const pct = (val, total) => total ? Math.round((val / total) * 100) : 0

const statusBars = computed(() => [
  { label: 'Completadas',    value: stats.value.completedRequests,      color: 'green' },
  { label: 'En curso',       value: stats.value.acceptedRequests,       color: 'purple' },
  { label: 'Pendientes',     value: stats.value.pendingRequests,        color: 'amber' },
  { label: 'Pago pendiente', value: stats.value.paymentPendingRequests, color: 'orange' },
  { label: 'Canceladas',     value: stats.value.cancelledRequests,      color: 'rose' },
])

const fetchStats = async () => {
  loadingStats.value = true
  apiError.value = ''
  try {
    const { data } = await api.get('/admin/stats')
    if (data.success) {
      const s = data.stats
      Object.assign(stats.value, {
        totalUsers:              s.totalUsers           ?? s.total         ?? 0,
        totalClients:            s.totalClients         ?? s.clients       ?? 0,
        totalProfessionals:      s.totalProfessionals   ?? s.professionals ?? 0,
        activeUsers:             s.activeUsers          ?? s.active        ?? 0,
        inactiveUsers:           s.inactiveUsers        ?? s.inactive      ?? 0,
        pendingProfessionals:    s.pendingProfessionals ?? 0,
        totalRequests:           s.totalRequests        ?? 0,
        pendingRequests:         s.pendingRequests      ?? 0,
        acceptedRequests:        s.acceptedRequests     ?? 0,
        completedRequests:       s.completedRequests    ?? 0,
        cancelledRequests:       s.cancelledRequests    ?? 0,
        paymentPendingRequests:  s.paymentPendingRequests ?? 0,
        todayRequests:           s.todayRequests        ?? 0,
        totalCollected:          s.totalCollected       ?? 0,
        pendingPayments:         s.pendingPayments      ?? 0,
      })
    }
  } catch {
    apiError.value = 'Error al cargar las estadísticas del sistema.'
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

const refresh = () => {
  fetchStats()
  fetchRecentUsers()
}

const formatUserDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const goTo = (name) => router.push({ name })

onMounted(refresh)
</script>

<style scoped>
.admin-dashboard { display: flex; flex-direction: column; gap: 20px; font-family: 'Outfit', system-ui, sans-serif; }

/* ── Alertas ──────────────────────────────────────────────── */
.alert-banner {
  display: flex; align-items: center; gap: 10px;
  background: #fffbeb; border: 1.5px solid #fde68a;
  border-radius: 14px; padding: 12px 18px;
  font-size: 13px; font-weight: 600; color: #92400e;
}
.alert-icon { font-size: 16px; }
.alert-banner span { flex: 1; }
.alert-link {
  background: none; border: 1.5px solid #fbbf24;
  color: #b45309; font-size: 12px; font-weight: 700;
  cursor: pointer; padding: 5px 12px; border-radius: 8px;
  font-family: inherit; white-space: nowrap;
  transition: background .15s;
}
.alert-link:hover { background: #fef9c3; }

.api-error-banner {
  background: #fef2f2; border: 1.5px solid #fca5a5;
  border-radius: 14px; padding: 12px 18px;
  font-size: 13px; color: #991b1b;
}

/* ── Métricas principales ──────────────────────────────────── */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.metric-card {
  background: white; border-radius: 18px; border: 1.5px solid #f1f5f9;
  padding: 20px; cursor: pointer;
  position: relative; overflow: hidden;
  transition: box-shadow .2s, transform .2s;
}
.metric-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; border-radius: 18px 18px 0 0;
}
.metric-card.blue::before   { background: linear-gradient(90deg, #3b82f6, #6366f1); }
.metric-card.amber::before  { background: linear-gradient(90deg, #f59e0b, #f97316); }
.metric-card.green::before  { background: linear-gradient(90deg, #22c55e, #16a34a); }
.metric-card.purple::before { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }
.metric-card.teal::before   { background: linear-gradient(90deg, #14b8a6, #0d9488); }
.metric-card.rose::before   { background: linear-gradient(90deg, #f43f5e, #e11d48); }
.metric-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,.1); transform: translateY(-3px); }
.metric-top {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
}
.metric-icon-wrap {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.metric-icon-wrap.blue   { background: #eff6ff; }
.metric-icon-wrap.amber  { background: #fffbeb; }
.metric-icon-wrap.green  { background: #f0fdf4; }
.metric-icon-wrap.purple { background: #f5f3ff; }
.metric-icon-wrap.teal   { background: #f0fdfa; }
.metric-icon-wrap.rose   { background: #fff1f2; }

.metric-trend {
  font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 20px;
}
.metric-trend.up   { background: #dcfce7; color: #15803d; }
.metric-trend.warn { background: #fef9c3; color: #a16207; }
.metric-trend.info { background: #eff6ff; color: #1d4ed8; }

.metric-value {
  font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1; margin-bottom: 5px;
}
.metric-value-sm { font-size: 24px; }
.metric-label { font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 3px; }
.metric-sub   { font-size: 11px; color: #94a3b8; font-weight: 600; }

/* ── Dos columnas ──────────────────────────────────────────── */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

/* ── Panel genérico ────────────────────────────────────────── */
.panel {
  background: white; border-radius: 18px; border: 1.5px solid #f1f5f9; padding: 20px;
}
.panel-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
}
.panel-title  { font-size: 15px; font-weight: 800; color: #0f172a; margin: 0; }
.panel-total  {
  font-size: 11px; font-weight: 700; color: #94a3b8;
  background: #f1f5f9; padding: 3px 10px; border-radius: 20px;
}
.panel-link {
  margin-left: auto; background: none; border: none;
  font-size: 12px; font-weight: 700; color: #2563eb;
  cursor: pointer; font-family: inherit; padding: 0;
}
.panel-link:hover { text-decoration: underline; }

/* ── Barras de estado ──────────────────────────────────────── */
.status-bars { display: flex; flex-direction: column; gap: 12px; }
.sk-bars { display: flex; flex-direction: column; gap: 12px; }
.sk-bar-row { display: flex; align-items: center; gap: 10px; }

.status-bar-row {
  display: grid; grid-template-columns: 10px 120px 1fr 38px 40px;
  align-items: center; gap: 8px;
}
.bar-dot {
  width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
}
.bar-dot.green  { background: #22c55e; }
.bar-dot.purple { background: #8b5cf6; }
.bar-dot.amber  { background: #f59e0b; }
.bar-dot.orange { background: #fb923c; }
.bar-dot.rose   { background: #f43f5e; }
.bar-label { font-size: 12px; font-weight: 600; color: #475569; }
.bar-track  { background: #f1f5f9; border-radius: 4px; height: 7px; overflow: hidden; }
.bar-fill   { height: 100%; border-radius: 4px; transition: width .5s ease; }
.bar-fill.green  { background: #22c55e; }
.bar-fill.purple { background: #8b5cf6; }
.bar-fill.amber  { background: #f59e0b; }
.bar-fill.orange { background: #fb923c; }
.bar-fill.rose   { background: #f43f5e; }
.bar-count { font-size: 12px; font-weight: 700; color: #0f172a; text-align: right; }
.bar-pct   { font-size: 11px; color: #94a3b8; text-align: right; }

.empty-state-sm { font-size: 13px; color: #94a3b8; padding: 16px 0; }

/* ── Accesos rápidos ───────────────────────────────────────── */
.quick-links { display: flex; flex-direction: column; gap: 6px; }
.quick-link {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 12px; border: 1.5px solid #f1f5f9;
  background: white; cursor: pointer; font-family: inherit; text-align: left;
  transition: border-color .15s, background .15s, transform .15s;
  width: 100%;
}
.quick-link:hover { border-color: #bfdbfe; background: #f8fbff; transform: translateX(2px); }
.ql-icon {
  width: 36px; height: 36px; border-radius: 10px; font-size: 18px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ql-icon.blue   { background: #eff6ff; }
.ql-icon.teal   { background: #f0fdfa; }
.ql-icon.green  { background: #f0fdf4; }
.ql-icon.purple { background: #f5f3ff; }
.ql-icon.amber  { background: #fffbeb; }
.ql-icon.rose   { background: #fff1f2; }
.ql-text { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.ql-label { font-size: 13px; font-weight: 700; color: #0f172a; }
.ql-sub   { font-size: 11px; color: #94a3b8; }
.ql-arrow { font-size: 14px; color: #cbd5e1; transition: color .15s; }
.quick-link:hover .ql-arrow { color: #2563eb; }

/* ── Usuarios recientes ────────────────────────────────────── */
.users-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
}
.user-card {
  background: #fafafa; border-radius: 14px; border: 1.5px solid #f1f5f9;
  padding: 14px 12px 12px;
  display: flex; flex-direction: column; gap: 8px;
  transition: box-shadow .2s, transform .2s;
  position: relative; overflow: hidden;
}
.user-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: #e2e8f0;
}
.user-card.professional::before { background: linear-gradient(90deg, #fde68a, #f59e0b); }
.user-card.client::before       { background: linear-gradient(90deg, #bfdbfe, #3b82f6); }
.user-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.08); transform: translateY(-2px); }

.uc-top { display: flex; align-items: center; justify-content: space-between; gap: 4px; }
.uc-role-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 6px;
}
.uc-role-chip.professional { background: #fef3c7; color: #d97706; }
.uc-role-chip.client       { background: #dbeafe; color: #2563eb; }
.uc-status {
  font-size: 9px; font-weight: 900; letter-spacing: .4px;
  padding: 2px 6px; border-radius: 4px; text-transform: uppercase;
}
.uc-status.active   { background: #dcfce7; color: #15803d; }
.uc-status.inactive { background: #fee2e2; color: #b91c1c; }

.uc-avatar-wrap { display: flex; justify-content: center; padding: 2px 0; }
.uc-avatar { width: 52px; height: 52px; border-radius: 12px; border: 2px solid #e2e8f0; background: #f8fafc; }
.uc-info { text-align: center; }
.uc-name  { font-size: 12px; font-weight: 800; color: #0f172a; line-height: 1.3; }
.uc-email { font-size: 10px; color: #94a3b8; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.uc-date  { font-size: 10px; color: #64748b; font-weight: 600; background: #f1f5f9; padding: 3px 7px; border-radius: 6px; text-align: center; }
.uc-footer { display: flex; align-items: center; justify-content: space-between; }
.uc-id  { font-size: 10px; color: #cbd5e1; font-weight: 700; }
.uc-btn {
  font-size: 11px; font-weight: 700; color: #2563eb;
  background: #eff6ff; border: 1px solid #bfdbfe;
  padding: 4px 9px; border-radius: 7px; cursor: pointer; font-family: inherit;
  transition: background .15s;
}
.uc-btn:hover { background: #dbeafe; }

/* ── Skeleton ──────────────────────────────────────────────── */
.skeleton-card { gap: 10px; }
.sk-line {
  border-radius: 6px; display: block;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.sk-badge  { height: 18px; width: 55%; }
.sk-avatar { width: 52px; height: 52px; border-radius: 12px; margin: 0 auto;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite; }
.sk-name   { height: 12px; width: 80%; margin: 0 auto; }
.sk-sub    { height: 10px; width: 60%; margin: 0 auto; }
.sk-btn    { height: 24px; width: 100%; }
.sk-val {
  display: inline-block; height: 32px; width: 70px; border-radius: 6px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1280px) {
  .metrics-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .two-col { grid-template-columns: 1fr; }
  .users-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .metrics-grid { grid-template-columns: 1fr 1fr; }
  .users-grid   { grid-template-columns: repeat(2, 1fr); }
  .status-bar-row { grid-template-columns: 10px 90px 1fr 36px; }
  .bar-pct { display: none; }
}
@media (max-width: 400px) {
  .metrics-grid { grid-template-columns: 1fr; }
  .users-grid   { grid-template-columns: 1fr; }
}

/* Spinner */
.spinning { display: inline-block; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

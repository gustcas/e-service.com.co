<template>
  <div class="reports-page">

    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">📈</div>
        <div>
          <h2 class="section-title">Reportes</h2>
          <p class="section-subtitle">Visión general de la operación</p>
        </div>
      </div>
      <button class="btn-refresh" @click="loadReports" :disabled="loading">
        <span :class="{ spinning: loading }">🔄</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando reportes…</p>
    </div>

    <template v-else-if="data">

      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon blue">📋</div>
          <div class="kpi-body">
            <div class="kpi-value">{{ totalRequests }}</div>
            <div class="kpi-label">Total solicitudes</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green">✅</div>
          <div class="kpi-body">
            <div class="kpi-value">{{ data.by_status?.completed ?? 0 }}</div>
            <div class="kpi-label">Completadas</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon yellow">⏳</div>
          <div class="kpi-body">
            <div class="kpi-value">{{ data.by_status?.pending ?? 0 }}</div>
            <div class="kpi-label">Pendientes</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon purple">💰</div>
          <div class="kpi-body">
            <div class="kpi-value">{{ formatCurrency(data.revenue?.completed ?? 0) }}</div>
            <div class="kpi-label">Revenue completado</div>
          </div>
        </div>
      </div>

      <!-- Row 1: Por estado + Usuarios -->
      <div class="two-col">

        <!-- Estado -->
        <div class="report-card">
          <div class="rc-header">
            <h3 class="rc-title">Estado de solicitudes</h3>
          </div>
          <div class="status-bars">
            <div v-for="(count, status) in data.by_status" :key="status" class="status-bar-item">
              <div class="sb-label-row">
                <span class="sb-label">{{ statusLabel(status) }}</span>
                <span class="sb-count">{{ count }}</span>
              </div>
              <div class="sb-track">
                <div class="sb-fill" :class="status" :style="{ width: barWidth(count, totalRequests) }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Usuarios -->
        <div class="report-card">
          <div class="rc-header">
            <h3 class="rc-title">Usuarios</h3>
          </div>
          <div class="user-stats">
            <div class="us-item">
              <span class="us-icon">👤</span>
              <div class="us-info">
                <div class="us-value">{{ data.user_stats?.total_clients ?? 0 }}</div>
                <div class="us-label">Clientes</div>
              </div>
            </div>
            <div class="us-item">
              <span class="us-icon">💼</span>
              <div class="us-info">
                <div class="us-value">{{ data.user_stats?.total_professionals ?? 0 }}</div>
                <div class="us-label">Profesionales</div>
              </div>
            </div>
            <div class="us-item">
              <span class="us-icon">✅</span>
              <div class="us-info">
                <div class="us-value">{{ data.user_stats?.verified_pros ?? 0 }}</div>
                <div class="us-label">Profesionales verificados</div>
              </div>
            </div>
            <div class="us-item">
              <span class="us-icon">⏳</span>
              <div class="us-info">
                <div class="us-value">{{ data.user_stats?.pending_pros ?? 0 }}</div>
                <div class="us-label">Pendientes aprobación</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Row 2: Por categoría -->
      <div class="report-card">
        <div class="rc-header">
          <h3 class="rc-title">Servicios por categoría</h3>
        </div>
        <div v-if="data.by_category?.length === 0" class="empty-inner">Sin datos aún</div>
        <div v-else class="category-table">
          <table>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Total</th>
                <th>Completados</th>
                <th>Revenue</th>
                <th>Conversión</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in data.by_category" :key="cat.name">
                <td><strong>{{ cat.name }}</strong></td>
                <td>{{ cat.total }}</td>
                <td>{{ cat.completed }}</td>
                <td>{{ formatCurrency(cat.revenue) }}</td>
                <td>
                  <span class="conv-badge">
                    {{ cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0 }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Row 3: Actividad mensual -->
      <div class="report-card" v-if="data.by_month?.length > 0">
        <div class="rc-header">
          <h3 class="rc-title">Actividad últimos 6 meses</h3>
        </div>
        <div class="month-chart">
          <div v-for="m in data.by_month" :key="m.month" class="month-col">
            <div class="month-bars">
              <div
                class="month-bar total"
                :style="{ height: barPx(m.total, maxMonth, 100) }"
                :title="`${m.total} solicitudes`"
              ></div>
              <div
                class="month-bar completed"
                :style="{ height: barPx(m.completed, maxMonth, 100) }"
                :title="`${m.completed} completadas`"
              ></div>
            </div>
            <div class="month-label">{{ m.month }}</div>
          </div>
        </div>
        <div class="chart-legend">
          <span class="legend-item total">Total solicitudes</span>
          <span class="legend-item completed">Completadas</span>
        </div>
      </div>

      <!-- Row 4: Top profesionales -->
      <div class="report-card" v-if="data.top_professionals?.length > 0">
        <div class="rc-header">
          <h3 class="rc-title">Top profesionales</h3>
        </div>
        <div class="top-pros">
          <div v-for="(pro, i) in data.top_professionals" :key="pro.id" class="top-pro-item">
            <div class="rank-badge" :class="['rank-' + (i + 1)]">{{ i + 1 }}</div>
            <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${pro.name}`" class="pro-avatar" />
            <div class="pro-info">
              <div class="pro-name">{{ pro.name }}</div>
              <div class="pro-stats">{{ pro.jobs }} trabajos · {{ formatCurrency(pro.revenue) }}</div>
            </div>
          </div>
        </div>
      </div>

    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(true)
const data    = ref(null)

const totalRequests = computed(() => {
  if (!data.value?.by_status) return 0
  return Object.values(data.value.by_status).reduce((a, b) => a + b, 0)
})

const maxMonth = computed(() => {
  if (!data.value?.by_month?.length) return 1
  return Math.max(...data.value.by_month.map(m => m.total), 1)
})

const statusLabel = (s) => ({ pending: 'Pendiente', accepted: 'En curso', completed: 'Completada', rejected: 'Rechazada' }[s] ?? s)

const barWidth = (val, total) => total > 0 ? `${Math.round((val / total) * 100)}%` : '0%'
const barPx    = (val, max, maxPx) => max > 0 ? `${Math.round((val / max) * maxPx)}px` : '4px'

const formatCurrency = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val ?? 0)

const loadReports = async () => {
  loading.value = true
  try {
    const { data: res } = await api.get('/admin/reports')
    if (res.success) data.value = res.data
  } catch {
    // silencioso
  } finally {
    loading.value = false
  }
}

onMounted(loadReports)
</script>

<style scoped>
.reports-page { display: flex; flex-direction: column; gap: 24px; }

.page-header  { display: flex; justify-content: space-between; align-items: center; }
.header-left  { display: flex; align-items: center; gap: 16px; }
.header-icon  { font-size: 36px; }
.section-title    { font-size: 26px; font-weight: 900; color: #0f172a; margin: 0; }
.section-subtitle { color: #64748b; font-size: 14px; margin-top: 2px; }

.btn-refresh {
  width: 44px; height: 44px; border-radius: 12px; border: none;
  background: #f1f5f9; font-size: 20px; cursor: pointer; display: flex;
  align-items: center; justify-content: center; transition: all .2s;
}
.btn-refresh:disabled { opacity: .5; cursor: not-allowed; }
@keyframes spin { to { transform: rotate(360deg); } }
.spinning { display: inline-block; animation: spin .8s linear infinite; }

/* Loading */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 80px 0; gap: 16px; color: #64748b;
}
.loading-spinner {
  width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2563eb;
  border-radius: 50%; animation: spin .8s linear infinite;
}

/* KPIs */
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.kpi-card {
  background: white; border-radius: 18px; padding: 20px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.kpi-icon {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0;
}
.kpi-icon.blue   { background: #dbeafe; }
.kpi-icon.green  { background: #dcfce7; }
.kpi-icon.yellow { background: #fef9c3; }
.kpi-icon.purple { background: #ede9fe; }

.kpi-value { font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1; }
.kpi-label { font-size: 12px; color: #64748b; font-weight: 600; margin-top: 3px; }

/* Two col */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* Report card */
.report-card {
  background: white; border-radius: 20px; padding: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.rc-header { margin-bottom: 20px; }
.rc-title  { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }

/* Status bars */
.status-bars   { display: flex; flex-direction: column; gap: 14px; }
.status-bar-item { display: flex; flex-direction: column; gap: 6px; }
.sb-label-row  { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; }
.sb-label      { color: #475569; }
.sb-count      { color: #0f172a; font-weight: 800; }
.sb-track      { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
.sb-fill       { height: 100%; border-radius: 4px; transition: width .5s ease; }
.sb-fill.pending   { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
.sb-fill.accepted  { background: linear-gradient(90deg, #60a5fa, #2563eb); }
.sb-fill.completed { background: linear-gradient(90deg, #4ade80, #16a34a); }
.sb-fill.rejected  { background: linear-gradient(90deg, #f87171, #dc2626); }

/* User stats */
.user-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.us-item    { display: flex; align-items: center; gap: 12px; padding: 14px; background: #f8fafc; border-radius: 12px; }
.us-icon    { font-size: 24px; flex-shrink: 0; }
.us-value   { font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1; }
.us-label   { font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px; }

/* Category table */
.category-table { overflow-x: auto; }
table  { width: 100%; border-collapse: collapse; }
thead  { background: #f8fafc; }
th     { padding: 12px 14px; text-align: left; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
td     { padding: 14px 14px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #475569; }
.conv-badge { background: #eff6ff; color: #1d4ed8; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; }

.empty-inner { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }

/* Month chart */
.month-chart {
  display: flex; gap: 12px; align-items: flex-end;
  height: 120px; padding-bottom: 4px;
}
.month-col   { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.month-bars  { display: flex; gap: 3px; align-items: flex-end; flex: 1; }
.month-bar   { flex: 1; border-radius: 4px 4px 0 0; min-height: 4px; transition: height .4s ease; }
.month-bar.total     { background: #bfdbfe; }
.month-bar.completed { background: #2563eb; }
.month-label { font-size: 11px; color: #94a3b8; font-weight: 600; white-space: nowrap; }

.chart-legend { display: flex; gap: 16px; margin-top: 12px; justify-content: center; }
.legend-item  { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; font-weight: 600; }
.legend-item::before { content: ''; width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
.legend-item.total::before     { background: #bfdbfe; }
.legend-item.completed::before { background: #2563eb; }

/* Top pros */
.top-pros   { display: flex; flex-direction: column; gap: 12px; }
.top-pro-item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px; background: #f8fafc; border-radius: 12px;
}
.rank-badge {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 13px;
}
.rank-1 { background: #fde68a; color: #92400e; }
.rank-2 { background: #e2e8f0; color: #475569; }
.rank-3 { background: #fed7aa; color: #9a3412; }
.rank-4, .rank-5 { background: #f1f5f9; color: #64748b; }

.pro-avatar { width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0; }
.pro-name   { font-weight: 700; font-size: 14px; color: #0f172a; }
.pro-stats  { font-size: 12px; color: #64748b; margin-top: 2px; }

@media (max-width: 900px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .two-col  { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .kpi-grid   { grid-template-columns: 1fr 1fr; gap: 10px; }
  .user-stats { grid-template-columns: 1fr; }
}
</style>

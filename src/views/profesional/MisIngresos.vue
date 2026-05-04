<template>
  <div class="ingresos-container">

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">Cargando tus ingresos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="error-state">
      <p>⚠️ {{ errorMsg }}</p>
    </div>

    <template v-else>

      <!-- ── RESUMEN ────────────────────────────────────── -->
      <div class="summary-grid">
        <div class="summary-card blue">
          <div class="sum-icon">💼</div>
          <div class="sum-value">{{ summary.total_jobs }}</div>
          <div class="sum-label">Servicios completados</div>
        </div>
        <div class="summary-card green">
          <div class="sum-icon">💰</div>
          <div class="sum-value">{{ formatCurrency(summary.total_earned) }}</div>
          <div class="sum-label">Total neto ganado</div>
        </div>
        <div class="summary-card yellow">
          <div class="sum-icon">⏳</div>
          <div class="sum-value">{{ summary.pending_jobs }}</div>
          <div class="sum-label">Servicios en curso</div>
        </div>
        <div class="summary-card gray">
          <div class="sum-icon">📊</div>
          <div class="sum-value">{{ summary.commission_pct }}%</div>
          <div class="sum-label">Comisión plataforma</div>
        </div>
      </div>

      <!-- Nota comisión -->
      <div class="commission-note">
        La plataforma retiene el {{ summary.commission_pct }}% de cada servicio como comisión. El monto neto es lo que recibes tú.
      </div>

      <!-- ── BARRA SUPERIOR ─────────────────────────────── -->
      <div class="top-bar">
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab.key"
            :class="['tab-btn', { active: activeTab === tab.key }]"
            @click="setTab(tab.key)">
            {{ tab.label }}
            <span v-if="countByTab(tab.key)" class="tab-badge">{{ countByTab(tab.key) }}</span>
          </button>
        </div>

        <div class="controls">
          <div class="sort-group">
            <span class="sort-lbl">Ordenar:</span>
            <button v-for="s in sortOptions" :key="s.key"
              :class="['sort-chip', { active: sortBy === s.key }]"
              @click="setSort(s.key)">{{ s.label }}</button>
          </div>
          <div class="view-toggle">
            <button :class="['vt-btn', { active: viewMode === 'grid' }]" @click="setView('grid')" title="Cuadrícula">
              <svg width="15" height="15" viewBox="0 0 14 14" fill="currentColor">
                <rect x="0" y="0" width="6" height="6" rx="1.2"/>
                <rect x="8" y="0" width="6" height="6" rx="1.2"/>
                <rect x="0" y="8" width="6" height="6" rx="1.2"/>
                <rect x="8" y="8" width="6" height="6" rx="1.2"/>
              </svg>
            </button>
            <button :class="['vt-btn', { active: viewMode === 'list' }]" @click="setView('list')" title="Lista">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <line x1="5" y1="4" x2="15" y2="4"/>
                <line x1="5" y1="8" x2="15" y2="8"/>
                <line x1="5" y1="12" x2="15" y2="12"/>
                <circle cx="2" cy="4" r="1.2" fill="currentColor" stroke="none"/>
                <circle cx="2" cy="8" r="1.2" fill="currentColor" stroke="none"/>
                <circle cx="2" cy="12" r="1.2" fill="currentColor" stroke="none"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- EMPTY -->
      <div v-if="sortedFiltered.length === 0" class="empty-state">
        <img src="/images/logo-services-sin-fondo.png" class="empty-logo" alt="e-service" />
        <p class="empty-title">Sin ingresos en esta sección</p>
        <small>Aquí verás tus ganancias cuando completes servicios.</small>
      </div>

      <!-- ── GRID VIEW ───────────────────────────────────── -->
      <TransitionGroup v-else-if="viewMode === 'grid'" name="fade" tag="div" class="earnings-grid">
        <div v-for="item in paginated" :key="item.id"
          class="earning-card" :class="item.status">

          <div class="ec-top">
            <div class="ec-svc">{{ item.service_name }}</div>
            <span :class="['status-pill', item.status]">
              {{ item.status === 'completed' ? 'Completado' : 'En curso' }}
            </span>
          </div>

          <div class="ec-client">
            <span class="client-avatar">{{ initials(item.client_name) }}</span>
            <span class="client-name">{{ item.client_name }}</span>
            <span class="earning-date">📅 {{ item.service_date }}</span>
          </div>

          <div class="earning-amounts">
            <div class="ec-net-block">
              <span class="ec-net-label">Tu ganancia neta</span>
              <span class="ec-net-value">{{ formatCurrency(item.net_amount) }}</span>
            </div>
          </div>

        </div>
      </TransitionGroup>

      <!-- ── LIST VIEW ───────────────────────────────────── -->
      <div v-else class="list-view">
        <div class="list-header">
          <span class="lh-svc">Servicio</span>
          <span class="lh-client hide-sm">Cliente</span>
          <span class="lh-date">Fecha</span>
          <span class="lh-total hide-sm">Total</span>
          <span class="lh-net">Neto</span>
          <span class="lh-status">Estado</span>
          <span class="lh-arrow"></span>
        </div>

        <div v-for="item in paginated" :key="item.id" class="list-item-wrap">
          <div :class="['list-row', item.status, { 'is-expanded': expandedId === item.id }]"
            @click="toggleExpand(item.id)">

            <div class="lr-svc">
              <div :class="['lr-icon', item.status]">💰</div>
              <div>
                <div class="lr-name">{{ item.service_name }}</div>
                <div class="lr-mini-desc">{{ item.client_name }}</div>
              </div>
            </div>

            <div class="lr-client hide-sm">
              <span class="client-avatar sm">{{ initials(item.client_name) }}</span>
              <span class="lr-client-name">{{ item.client_name }}</span>
            </div>

            <div class="lr-date">
              <span>{{ item.service_date }}</span>
            </div>

            <span class="lr-total hide-sm">{{ formatCurrency(item.amount) }}</span>
            <span class="lr-net">{{ formatCurrency(item.net_amount) }}</span>

            <span :class="['lr-pill', item.status]">
              {{ item.status === 'completed' ? 'Completado' : 'En curso' }}
            </span>

            <span class="lr-arrow" :class="{ open: expandedId === item.id }">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="2,4 6,8 10,4"/>
              </svg>
            </span>
          </div>

          <Transition name="expand">
            <div v-if="expandedId === item.id" class="row-detail">
              <div class="rd-amounts">
                <div class="rd-amount-row green">
                  <span>Tu ganancia neta</span>
                  <span>{{ formatCurrency(item.net_amount) }}</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- ── PAGINACIÓN ──────────────────────────────────── -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="pg-btn" :disabled="page === 1" @click="page--">← Anterior</button>
        <div class="pg-numbers">
          <button v-for="p in totalPages" :key="p"
            :class="['pg-num', { active: p === page }]"
            @click="page = p">{{ p }}</button>
        </div>
        <button class="pg-btn" :disabled="page === totalPages" @click="page++">Siguiente →</button>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const loading  = ref(true)
const errorMsg = ref('')
const summary  = ref({ total_jobs: 0, total_earned: 0, pending_jobs: 0, commission_pct: 15 })
const earnings = ref([])

const tabs = [
  { key: 'all',       label: 'Todos' },
  { key: 'accepted',  label: 'En curso' },
  { key: 'completed', label: 'Completados' },
]
const activeTab = ref('all')

const viewMode   = ref('grid')
const sortBy     = ref('recent')
const page       = ref(1)
const expandedId = ref(null)

const sortOptions = [
  { key: 'recent', label: 'Más recientes' },
  { key: 'amount', label: 'Mayor valor' },
  { key: 'name',   label: 'Alfabéticamente' },
]

const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

const formatCurrency = (val) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(val ?? 0)

const countByTab = (key) => {
  if (key === 'all') return earnings.value.length
  return earnings.value.filter(e => e.status === key).length
}

const filtered = computed(() => {
  if (activeTab.value === 'all') return earnings.value
  return earnings.value.filter(e => e.status === activeTab.value)
})

const perPage = computed(() => viewMode.value === 'grid' ? 6 : 10)

const sortedFiltered = computed(() => {
  const arr = [...filtered.value]
  if (sortBy.value === 'amount') return arr.sort((a, b) => b.net_amount - a.net_amount)
  if (sortBy.value === 'name')   return arr.sort((a, b) => a.service_name.localeCompare(b.service_name))
  return arr.sort((a, b) => b.id - a.id)
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedFiltered.value.length / perPage.value)))

const paginated = computed(() => {
  const start = (page.value - 1) * perPage.value
  return sortedFiltered.value.slice(start, start + perPage.value)
})

const setTab    = (key)  => { activeTab.value = key; page.value = 1; expandedId.value = null }
const setSort   = (key)  => { sortBy.value = key; page.value = 1 }
const setView   = (mode) => { viewMode.value = mode; page.value = 1; expandedId.value = null }
const toggleExpand = (id) => { expandedId.value = expandedId.value === id ? null : id }

const loadEarnings = async () => {
  try {
    const { data } = await api.get('/professional/earnings')
    if (data.success) {
      summary.value  = data.summary
      earnings.value = data.earnings
    } else {
      errorMsg.value = data.message || 'No se pudo cargar la información.'
    }
  } catch (e) {
    errorMsg.value = e.response?.data?.message || 'Error al conectar con el servidor.'
  } finally {
    loading.value = false
  }
}

onMounted(loadEarnings)
</script>

<style scoped>
.ingresos-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 32px;
}

/* ── SUMMARY ── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.summary-card {
  background: white;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  text-align: center;
}

.summary-card.blue   { border-top: 3px solid #3b82f6; }
.summary-card.green  { border-top: 3px solid #22c55e; }
.summary-card.yellow { border-top: 3px solid #f59e0b; }
.summary-card.gray   { border-top: 3px solid #94a3b8; }

.sum-icon  { font-size: 26px; }
.sum-value { font-size: 20px; font-weight: 900; color: #0f172a; line-height: 1; }
.sum-label { font-size: 11px; color: #64748b; font-weight: 600; }

/* ── COMMISSION NOTE ── */
.commission-note {
  background: #fef9c3;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 12px;
  color: #854d0e;
  font-weight: 600;
}

/* ── TOP BAR ── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  gap: 6px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 9px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  font-family: inherit;
  white-space: nowrap;
}

.tab-btn.active {
  background: white;
  color: #2563eb;
  box-shadow: 0 1px 6px rgba(0,0,0,.08);
}

.tab-badge {
  background: #2563eb;
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 20px;
  min-width: 16px;
  text-align: center;
}

.tab-btn:not(.active) .tab-badge { background: #94a3b8; }

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.sort-group {
  display: flex;
  align-items: center;
  gap: 5px;
}

.sort-lbl {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  white-space: nowrap;
}

.sort-chip {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  border: 1.5px solid transparent;
  padding: 5px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}

.sort-chip.active {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.view-toggle {
  display: flex;
  background: #f1f5f9;
  border-radius: 9px;
  padding: 3px;
  gap: 2px;
}

.vt-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 7px;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.15s;
}

.vt-btn.active {
  background: white;
  color: #2563eb;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}

/* ── EMPTY ── */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1.5px dashed #e2e8f0;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-logo {
  width: 90px;
  height: 90px;
  object-fit: contain;
  margin-bottom: 12px;
  opacity: 0.85;
}

.empty-title {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  margin: 0 0 4px;
}

/* ── GRID VIEW ── */
.earnings-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  align-items: start;
}

.earning-card {
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: box-shadow 0.2s, transform 0.2s;
}

.earning-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.07); transform: translateY(-2px); }
.earning-card.completed { border-color: #bbf7d0; background: #f0fdf4; }
.earning-card.accepted  { border-color: #bfdbfe; }

.ec-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.ec-svc {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
  flex: 1;
}

.status-pill {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .5px;
  padding: 3px 9px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-pill.completed { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
.status-pill.accepted  { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

.ec-client {
  display: flex;
  align-items: center;
  gap: 8px;
}

.client-avatar {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: #e0e7ff;
  color: #3730a3;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.client-name {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  flex: 1;
}

.earning-date {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
}

.earning-amounts {
  margin-top: 4px;
}

.ec-net-block {
  background: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ec-net-label {
  font-size: 13px;
  font-weight: 700;
  color: #15803d;
}

.ec-net-value {
  font-size: 22px;
  font-weight: 900;
  color: #16a34a;
  letter-spacing: -0.5px;
}

/* ── LIST VIEW ── */
.list-view {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1.2fr 0.9fr 0.9fr 0.9fr 0.8fr 28px;
  gap: 8px;
  padding: 6px 14px;
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.list-item-wrap {
  display: flex;
  flex-direction: column;
}

.list-row {
  display: grid;
  grid-template-columns: 2fr 1.2fr 0.9fr 0.9fr 0.9fr 0.8fr 28px;
  gap: 8px;
  align-items: center;
  padding: 10px 14px;
  background: white;
  border: 1.5px solid #f1f5f9;
  border-radius: 12px;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;
}

.list-row:hover { box-shadow: 0 2px 10px rgba(0,0,0,.06); border-color: #e2e8f0; }
.list-row.is-expanded { border-color: #bfdbfe; border-bottom-left-radius: 0; border-bottom-right-radius: 0; }

.lr-svc {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.lr-icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
}

.lr-icon.accepted  { background: #eff6ff; }
.lr-icon.completed { background: #dcfce7; }

.lr-name {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lr-mini-desc {
  font-size: 10px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lr-client {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.client-avatar.sm {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  font-size: 9px;
}

.lr-client-name {
  font-size: 11px;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lr-date {
  font-size: 11px;
  color: #475569;
  font-weight: 600;
}

.lr-total {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.lr-net {
  font-size: 13px;
  font-weight: 900;
  color: #16a34a;
}

.lr-pill {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  padding: 3px 7px;
  border-radius: 5px;
  white-space: nowrap;
}

.lr-pill.accepted  { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.lr-pill.completed { background: #dcfce7; color: #166534; border: 1px solid #86efac; }

.lr-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  transition: transform 0.2s;
}

.lr-arrow.open { transform: rotate(180deg); }

/* Row detail */
.row-detail {
  background: #f8fafc;
  border: 1.5px solid #bfdbfe;
  border-top: none;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  padding: 12px 14px;
  overflow: hidden;
}

.rd-amounts {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rd-amount-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.rd-amount-row.red  { color: #dc2626; }
.rd-amount-row.green { color: #16a34a; font-weight: 900; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 2px; }

/* Expand transition */
.expand-enter-active {
  transition: max-height 0.3s ease, opacity 0.25s ease;
  max-height: 200px;
}
.expand-leave-active {
  transition: max-height 0.2s ease, opacity 0.15s ease;
  max-height: 200px;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Fade transition (grid) */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from   { opacity: 0; transform: translateY(6px) scale(0.98); }
.fade-leave-to     { opacity: 0; transform: scale(0.97); }

/* ── PAGINATION ── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 4px;
}

.pg-btn {
  font-size: 12px;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  border: 1.5px solid #bfdbfe;
  padding: 7px 14px;
  border-radius: 9px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  white-space: nowrap;
}

.pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.pg-btn:not(:disabled):hover { background: #dbeafe; }

.pg-numbers { display: flex; gap: 4px; }

.pg-num {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: white;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.pg-num.active { background: #2563eb; border-color: #2563eb; color: white; }
.pg-num:not(.active):hover { background: #f8fafc; border-color: #cbd5e1; }

/* ── LOADING ── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 24px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
  margin: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── ERROR ── */
.error-state {
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  border-radius: 14px;
  padding: 20px 24px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .summary-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 860px) {
  .hide-sm { display: none !important; }
  .list-header,
  .list-row { grid-template-columns: 2fr 0.9fr 0.9fr 0.8fr 28px; }
}

@media (max-width: 900px) {
  .earnings-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 640px) {
  .earnings-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .earnings-grid { grid-template-columns: 1fr; }
  .summary-grid  { grid-template-columns: repeat(2, 1fr); }
  .top-bar { flex-direction: column; align-items: flex-start; }
  .list-header,
  .list-row { grid-template-columns: 2fr 0.9fr 0.8fr 28px; }
}
</style>

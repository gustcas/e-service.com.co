<template>
  <div class="solicitudes-container">

    <!-- ── BARRA SUPERIOR ──────────────────────────────────────── -->
    <div class="top-bar">
      <!-- Tabs -->
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="setTab(tab.key)">
          {{ tab.label }}
          <span v-if="countByTab(tab.key)" class="tab-badge">{{ countByTab(tab.key) }}</span>
        </button>
      </div>

      <!-- Controles derechos: sort + view toggle -->
      <div class="controls">
        <div class="sort-group">
          <span class="sort-lbl">Ordenar:</span>
          <button v-for="s in sortOptions" :key="s.key"
            :class="['sort-chip', { active: sortBy === s.key }]"
            @click="setSort(s.key)">{{ s.label }}</button>
        </div>
        <div class="view-toggle">
          <button :class="['vt-btn', { active: viewMode === 'grid' }]"
            @click="setView('grid')" title="Vista cuadrícula">
            <svg width="15" height="15" viewBox="0 0 14 14" fill="currentColor">
              <rect x="0" y="0" width="6" height="6" rx="1.2"/>
              <rect x="8" y="0" width="6" height="6" rx="1.2"/>
              <rect x="0" y="8" width="6" height="6" rx="1.2"/>
              <rect x="8" y="8" width="6" height="6" rx="1.2"/>
            </svg>
          </button>
          <button :class="['vt-btn', { active: viewMode === 'list' }]"
            @click="setView('list')" title="Vista lista">
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

    <!-- ── LOADING ─────────────────────────────────────────────── -->
    <div v-if="loading" class="skeleton-list">
      <div v-for="n in 3" :key="n" class="skeleton-card">
        <div class="skeleton-line w-60"></div>
        <div class="skeleton-line w-90 short"></div>
        <div class="skeleton-line w-40 short"></div>
      </div>
    </div>

    <!-- ── EMPTY ───────────────────────────────────────────────── -->
    <div v-else-if="sortedFiltered.length === 0" class="empty-state">
      <img src="/images/logo-services-sin-fondo.png" class="empty-logo" alt="e-service" />
      <p class="empty-title">Sin solicitudes en esta sección</p>
    </div>

    <!-- ── GRID VIEW ───────────────────────────────────────────── -->
    <TransitionGroup v-else-if="viewMode === 'grid'" name="fade" tag="div" class="cards-grid">
      <div v-for="req in paginated" :key="req.id" class="req-card" :class="req.status">

        <!-- Status badge -->
        <span :class="['status-pill', req.status]">{{ statusLabel(req.status) }}</span>

        <!-- Cabecera: icono + nombre servicio -->
        <div class="card-head">
          <div class="service-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <span class="card-svc">{{ req.service_name }}</span>
        </div>

        <div class="card-budget">${{ Number(req.budget).toLocaleString('es-CO') }}</div>

        <p class="card-desc">{{ req.description }}</p>

        <div class="card-chips">
          <span class="chip">📅 {{ req.service_date }} {{ req.service_time }}</span>
          <span v-if="req.address" class="chip">📍 {{ req.address }}</span>
          <span v-else class="chip chip-virtual">💻 Virtual</span>
          <span v-if="req.people_count >= 1" class="chip chip-people">
            👥 {{ req.people_count }} persona{{ req.people_count > 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Profesional asignado -->
        <div v-if="req.professional" class="pro-box">
          <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${req.professional.name}`" class="pro-avatar"/>
          <div class="pro-data">
            <span class="pro-label">Profesional asignado</span>
            <span class="pro-name">{{ req.professional.name }}</span>
            <span v-if="req.professional.phone" class="pro-phone">📞 {{ req.professional.phone }}</span>
          </div>
        </div>

        <div class="card-divider"></div>

        <!-- Footer: código / generar / completado -->
        <div class="card-footer">
          <div v-if="req.status === 'accepted' && req.completion_code" class="code-box">
            <div class="code-lbl">CÓDIGO ACTIVO</div>
            <div class="code-digits">
              <span v-for="(d, i) in req.completion_code.split('')" :key="i" class="code-digit">{{ d }}</span>
            </div>
            <div class="code-hint">Válido por ~15 min · Compártelo solo con el profesional</div>
            <button class="btn-regen" @click.stop="generateCode(req)">🔄 Regenerar</button>
          </div>

          <button v-else-if="req.status === 'accepted'"
            class="btn-gen"
            :disabled="generating === req.id"
            @click.stop="generateCode(req)">
            {{ generating === req.id ? 'Generando…' : '🔐 Generar código de aprobación' }}
          </button>

          <div v-else-if="req.status === 'completed'" class="comprobante">
            <div class="comprobante-hdr">
              <span class="comp-check">✅</span>
              <div>
                <div class="comp-title">Trabajo completado</div>
                <div v-if="req.completed_at" class="comp-date">{{ formatDate(req.completed_at) }}</div>
              </div>
            </div>
            <div class="comp-total-row">
              <span class="comp-lbl">Total pagado</span>
              <span class="comp-total">${{ Number(req.budget).toLocaleString('es-CO') }}</span>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <!-- ── LIST VIEW ───────────────────────────────────────────── -->
    <div v-else class="list-view">
      <!-- Encabezado de columnas -->
      <div class="list-header">
        <span class="lh-svc">Servicio</span>
        <span class="lh-date">Fecha</span>
        <span class="lh-addr hide-sm">Ubicación</span>
        <span class="lh-budget">Valor</span>
        <span class="lh-status">Estado</span>
        <span class="lh-arrow"></span>
      </div>

      <!-- Filas -->
      <div v-for="req in paginated" :key="req.id" class="list-item-wrap">
        <div :class="['list-row', req.status, { 'is-expanded': expandedId === req.id }]"
          @click="toggleExpand(req.id)">

          <div class="lr-svc">
            <div :class="['lr-icon', req.status]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div>
              <div class="lr-name">{{ req.service_name }}</div>
              <div class="lr-mini-desc">{{ req.description }}</div>
            </div>
          </div>

          <div class="lr-date">
            <span>{{ req.service_date }}</span>
            <span class="lr-time">{{ req.service_time }}</span>
          </div>

          <span class="lr-addr hide-sm">{{ req.address || '💻 Virtual' }}</span>

          <span class="lr-budget">${{ Number(req.budget).toLocaleString('es-CO') }}</span>

          <span :class="['lr-pill', req.status]">{{ statusLabel(req.status) }}</span>

          <span class="lr-arrow" :class="{ open: expandedId === req.id }">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="2,4 6,8 10,4"/>
            </svg>
          </span>
        </div>

        <!-- Detalle expandible -->
        <Transition name="expand">
          <div v-if="expandedId === req.id" class="row-detail">
            <p class="rd-desc">{{ req.description }}</p>

            <div v-if="req.professional" class="pro-box">
              <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${req.professional.name}`" class="pro-avatar"/>
              <div class="pro-data">
                <span class="pro-label">Profesional asignado</span>
                <span class="pro-name">{{ req.professional.name }}</span>
                <span v-if="req.professional.phone" class="pro-phone">📞 {{ req.professional.phone }}</span>
              </div>
            </div>

            <div v-if="req.status === 'accepted' && req.completion_code" class="code-box">
              <div class="code-lbl">CÓDIGO ACTIVO</div>
              <div class="code-digits">
                <span v-for="(d, i) in req.completion_code.split('')" :key="i" class="code-digit">{{ d }}</span>
              </div>
              <div class="code-hint">Válido por ~15 min · Compártelo solo con el profesional</div>
              <button class="btn-regen" @click.stop="generateCode(req)">🔄 Regenerar</button>
            </div>

            <button v-else-if="req.status === 'accepted'"
              class="btn-gen"
              :disabled="generating === req.id"
              @click.stop="generateCode(req)">
              {{ generating === req.id ? 'Generando…' : '🔐 Generar código de aprobación' }}
            </button>

            <div v-else-if="req.status === 'completed'" class="comprobante">
              <div class="comprobante-hdr">
                <span class="comp-check">✅</span>
                <div>
                  <div class="comp-title">Trabajo completado</div>
                  <div v-if="req.completed_at" class="comp-date">{{ formatDate(req.completed_at) }}</div>
                </div>
              </div>
              <div class="comp-total-row">
                <span class="comp-lbl">Total pagado</span>
                <span class="comp-total">${{ Number(req.budget).toLocaleString('es-CO') }}</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- ── PAGINACIÓN ──────────────────────────────────────────── -->
    <div v-if="!loading && totalPages > 1" class="pagination">
      <button class="pg-btn" :disabled="page === 1" @click="page--">← Anterior</button>
      <div class="pg-numbers">
        <button v-for="p in totalPages" :key="p"
          :class="['pg-num', { active: p === page }]"
          @click="page = p">{{ p }}</button>
      </div>
      <button class="pg-btn" :disabled="page === totalPages" @click="page++">Siguiente →</button>
    </div>

    <!-- ── TOAST ───────────────────────────────────────────────── -->
    <Transition name="toast">
      <div v-if="toast.visible" class="toast" :class="toast.type">{{ toast.message }}</div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

// ── Tabs ──────────────────────────────────────────────────────
const tabs = [
  { key: 'pending',   label: 'Pendientes' },
  { key: 'accepted',  label: 'En curso' },
  { key: 'completed', label: 'Completadas' },
]
const activeTab = ref('accepted')

// ── Vista ─────────────────────────────────────────────────────
const viewMode = ref('grid')   // 'grid' | 'list'

// ── Sort ─────────────────────────────────────────────────────
const sortOptions = [
  { key: 'recent', label: 'Más recientes' },
  { key: 'date',   label: 'Por fecha' },
  { key: 'name',   label: 'Alfabéticamente' },
]
const sortBy = ref('recent')

// ── Paginación ────────────────────────────────────────────────
const page   = ref(1)
const perPage = computed(() => viewMode.value === 'grid' ? 6 : 10)

// ── Estado ────────────────────────────────────────────────────
const loading    = ref(true)
const requests   = ref([])
const generating = ref(null)
const expandedId = ref(null)
const toast      = ref({ visible: false, message: '', type: '' })
let toastTimer   = null

// ── Computed ──────────────────────────────────────────────────
const filtered = computed(() => requests.value.filter(r => r.status === activeTab.value))

const sortedFiltered = computed(() => {
  const arr = [...filtered.value]
  if (sortBy.value === 'name') return arr.sort((a, b) => a.service_name.localeCompare(b.service_name))
  if (sortBy.value === 'date') return arr.sort((a, b) => new Date(a.service_date) - new Date(b.service_date))
  return arr.sort((a, b) => b.id - a.id)
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedFiltered.value.length / perPage.value)))

const paginated = computed(() => {
  const start = (page.value - 1) * perPage.value
  return sortedFiltered.value.slice(start, start + perPage.value)
})

const countByTab = (key) => requests.value.filter(r => r.status === key).length

// ── Acciones de control ───────────────────────────────────────
const setTab = (key) => { activeTab.value = key; page.value = 1; expandedId.value = null }
const setSort = (key) => { sortBy.value = key; page.value = 1 }
const setView = (mode) => { viewMode.value = mode; page.value = 1; expandedId.value = null }
const toggleExpand = (id) => { expandedId.value = expandedId.value === id ? null : id }

// ── Helpers ───────────────────────────────────────────────────
const statusLabel = (s) => ({ pending: 'Pendiente', accepted: 'En curso', completed: 'Completada', rejected: 'Rechazada' }[s] || s)

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const showToast = (message, type = '') => {
  clearTimeout(toastTimer)
  toast.value = { visible: true, message, type }
  toastTimer = setTimeout(() => { toast.value.visible = false }, 3500)
}

// ── API ───────────────────────────────────────────────────────
const loadRequests = async () => {
  try {
    const res = await api.get('/client/requests')
    requests.value = res.data
  } catch {
    showToast('Error al cargar solicitudes', 'error')
  } finally {
    loading.value = false
  }
}

const generateCode = async (req) => {
  generating.value = req.id
  try {
    const res = await api.post(`/client/requests/${req.id}/generate-code`)
    const found = requests.value.find(r => r.id === req.id)
    if (found) {
      found.completion_code            = res.data.code
      found.completion_code_expires_at = res.data.expires_at
    }
    showToast('✓ Código generado — compártelo con el profesional', 'success')
  } catch {
    showToast('Error al generar el código', 'error')
  } finally {
    generating.value = null
  }
}

onMounted(loadRequests)
</script>

<style scoped>
.solicitudes-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 32px;
}

/* ── BARRA SUPERIOR ─────────────────────────────────────────── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
}
.tab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 16px; border-radius: 9px; border: none;
  background: transparent; font-size: 13px; font-weight: 700;
  color: #64748b; cursor: pointer; font-family: inherit;
  transition: background .2s, color .2s;
}
.tab-btn.active { background: white; color: #2563eb; box-shadow: 0 1px 6px rgba(0,0,0,.08); }
.tab-badge {
  background: #2563eb; color: white; font-size: 10px; font-weight: 800;
  padding: 1px 6px; border-radius: 20px; min-width: 18px; text-align: center;
}
.tab-btn:not(.active) .tab-badge { background: #94a3b8; }

/* Controls right */
.controls { display: flex; align-items: center; gap: 12px; }

.sort-group { display: flex; align-items: center; gap: 6px; }
.sort-lbl { font-size: 12px; font-weight: 600; color: #94a3b8; white-space: nowrap; }
.sort-chip {
  padding: 6px 12px; border-radius: 8px; border: 1.5px solid #e2e8f0;
  background: white; font-size: 12px; font-weight: 600; color: #64748b;
  cursor: pointer; font-family: inherit; transition: all .15s;
}
.sort-chip.active { background: #0f172a; color: white; border-color: #0f172a; }
.sort-chip:not(.active):hover { border-color: #94a3b8; }

/* View toggle */
.view-toggle { display: flex; gap: 2px; background: #f1f5f9; padding: 3px; border-radius: 9px; }
.vt-btn {
  width: 30px; height: 30px; border-radius: 7px; border: none;
  background: transparent; color: #94a3b8; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.vt-btn.active { background: white; color: #2563eb; box-shadow: 0 1px 4px rgba(0,0,0,.1); }

/* ── SKELETON ───────────────────────────────────────────────── */
.skeleton-list { display: flex; flex-direction: column; gap: 10px; }
.skeleton-card {
  background: white; border: 1px solid #f1f5f9; border-radius: 14px;
  padding: 18px; display: flex; flex-direction: column; gap: 10px;
}
.skeleton-line {
  height: 13px; border-radius: 6px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}
.skeleton-line.short { height: 10px; }
.skeleton-line.w-90  { width: 90%; }
.skeleton-line.w-60  { width: 60%; }
.skeleton-line.w-40  { width: 40%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── EMPTY ──────────────────────────────────────────────────── */
.empty-state {
  text-align: center; padding: 52px 24px;
  background: #f8fafc; border-radius: 16px;
  border: 1.5px dashed #e2e8f0; color: #94a3b8;
}
.empty-logo  { width: 90px; height: 90px; object-fit: contain; margin-bottom: 12px; opacity: .85; }
.empty-title { font-size: 14px; font-weight: 700; color: #64748b; margin: 0; }

/* ── GRID VIEW ──────────────────────────────────────────────── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  align-items: start;  /* cards keep their natural height — asimétrico */
}

.req-card {
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  position: relative;
  transition: box-shadow .2s, transform .2s;
}
.req-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.08); transform: translateY(-2px); }
.req-card.accepted  { border-color: #bfdbfe; }
.req-card.completed { border-color: #bbf7d0; background: #f0fdf4; }

/* Status pill */
.status-pill {
  position: absolute; top: 12px; right: 12px;
  font-size: 10px; font-weight: 800; letter-spacing: .4px;
  text-transform: uppercase; padding: 3px 9px; border-radius: 6px;
}
.status-pill.pending   { background: #fef9c3; color: #854d0e; border: 1px solid #fde68a; }
.status-pill.accepted  { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.status-pill.completed { background: #dcfce7; color: #166534; border: 1px solid #86efac; }

/* Card head */
.card-head {
  display: flex; align-items: center; gap: 9px;
  margin-bottom: 4px; padding-right: 80px;
}
.service-icon {
  width: 30px; height: 30px; border-radius: 8px;
  background: #eff6ff; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0; color: #2563eb;
}
.card-svc { font-weight: 700; font-size: 14px; color: #0f172a; line-height: 1.3; }
.card-budget { font-size: 22px; font-weight: 900; color: #2563eb; letter-spacing: -0.5px; margin: 4px 0 8px; }
.card-desc {
  font-size: 13px; color: #475569; line-height: 1.5; margin: 0 0 10px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* Chips */
.card-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
.chip {
  display: inline-flex; align-items: center; gap: 4px;
  background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b;
  font-size: 11px; padding: 4px 9px; border-radius: 7px;
}
.chip-virtual { background: #f0f9ff; border-color: #bae6fd; color: #0369a1; }
.chip-people  { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; font-weight: 600; }

/* Profesional box (shared grid+list) */
.pro-box {
  display: flex; align-items: center; gap: 10px;
  background: #f0f9ff; border: 1px solid #bae6fd;
  border-radius: 12px; padding: 10px 12px; margin-bottom: 12px;
}
.pro-avatar { width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0; }
.pro-data   { display: flex; flex-direction: column; gap: 1px; }
.pro-label  { font-size: 9px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: .5px; }
.pro-name   { font-size: 13px; font-weight: 700; color: #0c4a6e; }
.pro-phone  { font-size: 11px; color: #0369a1; }

.card-divider { height: 1px; background: #f1f5f9; margin-bottom: 12px; }
.card-footer  { display: flex; flex-direction: column; }

/* ── CODE BOX (shared) ──────────────────────────────────────── */
.code-box {
  background: #fffbeb; border: 1.5px solid #fde68a;
  border-radius: 14px; padding: 14px 16px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.code-lbl {
  font-size: 10px; font-weight: 800; color: #92400e;
  text-transform: uppercase; letter-spacing: .5px;
}
.code-digits { display: flex; gap: 5px; }
.code-digit {
  width: 34px; height: 42px; background: white; border: 2px solid #f59e0b;
  border-radius: 9px; display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 900; color: #b45309;
}
.code-hint { font-size: 10px; color: #92400e; text-align: center; }

.btn-regen {
  background: transparent; border: 1px solid #f59e0b; color: #b45309;
  padding: 5px 14px; border-radius: 8px; font-size: 12px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background .15s;
}
.btn-regen:hover { background: #fef3c7; }

/* ── GEN BUTTON (shared) ────────────────────────────────────── */
.btn-gen {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: white; border: none; border-radius: 11px;
  font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: opacity .15s, transform .15s;
}
.btn-gen:hover:not(:disabled) { transform: translateY(-1px); }
.btn-gen:disabled { opacity: .5; cursor: not-allowed; }

/* ── COMPROBANTE (shared) ───────────────────────────────────── */
.comprobante {
  background: #f0fdf4; border: 1.5px solid #86efac;
  border-radius: 12px; overflow: hidden;
}
.comprobante-hdr {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; background: #dcfce7;
}
.comp-check { font-size: 18px; }
.comp-title { font-size: 13px; font-weight: 800; color: #166534; }
.comp-date  { font-size: 11px; color: #166534; }
.comp-total-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; font-size: 13px;
}
.comp-lbl   { color: #475569; font-weight: 600; }
.comp-total { color: #16a34a; font-size: 15px; font-weight: 900; }

/* ── LIST VIEW ──────────────────────────────────────────────── */
.list-view {
  background: white;
  border-radius: 16px;
  border: 1.5px solid #e2e8f0;
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 1fr 110px 120px 100px 90px 32px;
  gap: 12px;
  padding: 11px 20px;
  background: #f8fafc;
  border-bottom: 1.5px solid #f1f5f9;
  font-size: 11px; font-weight: 800; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .4px;
}

.list-item-wrap + .list-item-wrap { border-top: 1px solid #f1f5f9; }

.list-row {
  display: grid;
  grid-template-columns: 1fr 110px 120px 100px 90px 32px;
  gap: 12px;
  align-items: center;
  padding: 13px 20px;
  cursor: pointer;
  transition: background .15s;
}
.list-row:hover { background: #f8fafc; }
.list-row.is-expanded { background: #f8fafc; }

/* Left border colored by status on hover/expand */
.list-row.accepted.is-expanded  { border-left: 3px solid #3b82f6; }
.list-row.pending.is-expanded   { border-left: 3px solid #f59e0b; }
.list-row.completed.is-expanded { border-left: 3px solid #22c55e; }

/* LR cells */
.lr-svc {
  display: flex; align-items: center; gap: 10px; min-width: 0;
}
.lr-icon {
  width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.lr-icon.accepted  { background: #eff6ff; color: #2563eb; }
.lr-icon.pending   { background: #fef9c3; color: #b45309; }
.lr-icon.completed { background: #dcfce7; color: #16a34a; }

.lr-name { font-size: 13px; font-weight: 700; color: #0f172a; }
.lr-mini-desc {
  font-size: 11px; color: #94a3b8; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; max-width: 200px;
}

.lr-date { font-size: 12px; color: #475569; display: flex; flex-direction: column; gap: 1px; }
.lr-time { font-size: 11px; color: #94a3b8; }

.lr-addr { font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lr-budget { font-size: 14px; font-weight: 800; color: #2563eb; }

.lr-pill {
  display: inline-block; padding: 4px 9px; border-radius: 6px;
  font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .3px;
}
.lr-pill.pending   { background: #fef9c3; color: #854d0e; }
.lr-pill.accepted  { background: #eff6ff; color: #1d4ed8; }
.lr-pill.completed { background: #dcfce7; color: #166534; }

.lr-arrow {
  display: flex; align-items: center; justify-content: center;
  color: #94a3b8; transition: transform .2s;
}
.lr-arrow.open { transform: rotate(180deg); }

/* Row detail (expanded) */
.row-detail {
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
  background: #fafbff;
  display: flex; flex-direction: column; gap: 12px;
}
.rd-desc { font-size: 13px; color: #475569; margin: 0; line-height: 1.6; }

/* Expand transition */
.expand-enter-active, .expand-leave-active {
  transition: max-height .3s ease, opacity .25s ease;
  overflow: hidden;
  max-height: 600px;
}
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; }

/* ── FADE TRANSITION (grid) ─────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease, transform .2s ease; }
.fade-enter-from { opacity: 0; transform: translateY(6px) scale(.98); }
.fade-leave-to   { opacity: 0; }

/* ── PAGINACIÓN ──────────────────────────────────────────────── */
.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; margin-top: 4px;
}
.pg-btn {
  padding: 8px 18px; border-radius: 10px; border: 1.5px solid #e2e8f0;
  background: white; font-size: 13px; font-weight: 700; color: #475569;
  cursor: pointer; font-family: inherit; transition: all .15s;
}
.pg-btn:hover:not(:disabled) { border-color: #2563eb; color: #2563eb; }
.pg-btn:disabled { opacity: .4; cursor: not-allowed; }

.pg-numbers { display: flex; gap: 4px; }
.pg-num {
  width: 34px; height: 34px; border-radius: 9px;
  border: 1.5px solid #e2e8f0; background: white;
  font-size: 13px; font-weight: 700; color: #64748b;
  cursor: pointer; font-family: inherit; transition: all .15s;
}
.pg-num.active {
  background: #2563eb; color: white; border-color: #2563eb;
}
.pg-num:not(.active):hover { border-color: #2563eb; color: #2563eb; }

/* ── TOAST ───────────────────────────────────────────────────── */
.toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  background: #1e293b; color: white;
  padding: 12px 22px; border-radius: 12px;
  font-size: 13px; font-weight: 600; z-index: 9999;
  white-space: nowrap; box-shadow: 0 8px 24px rgba(0,0,0,.2);
  pointer-events: none;
}
.toast.success { background: #14532d; }
.toast.error   { background: #7f1d1d; }
.toast-enter-active, .toast-leave-active {
  transition: opacity .25s ease, transform .3s cubic-bezier(.34,1.56,.64,1);
}
.toast-enter-from { opacity: 0; transform: translateX(-50%) translateY(16px) scale(.95); }
.toast-leave-to   { opacity: 0; transform: translateX(-50%) translateY(10px); }

/* ── RESPONSIVE ──────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .cards-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .top-bar { flex-direction: column; align-items: flex-start; }
  .controls { flex-wrap: wrap; }
  .sort-group { flex-wrap: wrap; }
  .sort-lbl { display: none; }
  .cards-grid { grid-template-columns: 1fr; }

  .list-header,
  .list-row { grid-template-columns: 1fr 90px 80px 28px; }
  .lh-addr, .lh-status, .lr-addr, .lr-pill { display: none; }
}

@media (max-width: 480px) {
  .tabs { width: 100%; }
  .tab-btn { flex: 1; justify-content: center; padding: 7px 6px; font-size: 12px; }
  .sort-chip { padding: 5px 9px; font-size: 11px; }
  .list-header,
  .list-row { grid-template-columns: 1fr 80px 28px; }
  .lh-date, .lr-date { display: none; }
  .hide-sm { display: none; }
}
</style>

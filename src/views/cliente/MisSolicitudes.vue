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
        <div class="card-top-row">
          <span class="req-number">#{{ String(req.id).padStart(4, '0') }}</span>
          <span :class="['status-pill', req.status]">{{ statusLabel(req.status) }}</span>
        </div>

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
          <button class="btn-chat-pro" @click.stop="openChat(req)">
            💬 Chatear
            <span v-if="unreadCounts[req.id]" class="chat-badge-pro">{{ unreadCounts[req.id] }}</span>
          </button>
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

          <div v-else-if="req.status === 'payment_pending'" class="pay-pending-actions">
            <button class="btn-pay-now" @click.stop="goToPay(req)">
              💳 Completar pago
            </button>
            <button class="btn-cancel-sr" :disabled="cancelling === req.id" @click.stop="cancelRequest(req)">
              {{ cancelling === req.id ? 'Cancelando…' : 'Cancelar' }}
            </button>
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
            <button class="btn-evidencias" @click.stop="openEvidences(req)">🖼️ Ver evidencias</button>
            <button class="btn-factura" @click.stop="openInvoice(req)">🧾 Ver comprobante</button>
            <button v-if="isCapacitacion(req)" class="btn-acta" :disabled="downloadingActa === req.id" @click.stop="downloadActa(req)">
              {{ downloadingActa === req.id ? 'Descargando…' : '📄 Descargar acta' }}
            </button>
            <button v-if="!req._rated" class="btn-calificar" @click.stop="openRating(req)">⭐ Calificar profesional</button>
            <div v-else class="rating-done-badge">✅ Ya calificaste este servicio</div>
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
              <button class="btn-chat-pro" @click.stop="openChat(req)">
            💬 Chatear
            <span v-if="unreadCounts[req.id]" class="chat-badge-pro">{{ unreadCounts[req.id] }}</span>
          </button>
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
              <button class="btn-evidencias" @click.stop="openEvidences(req)">🖼️ Ver evidencias</button>
              <button class="btn-factura" @click.stop="openInvoice(req)">🧾 Ver comprobante</button>
              <button v-if="isCapacitacion(req)" class="btn-acta" :disabled="downloadingActa === req.id" @click.stop="downloadActa(req)">
                {{ downloadingActa === req.id ? 'Descargando…' : '📄 Descargar acta' }}
              </button>
              <button v-if="!req._rated" class="btn-calificar" @click.stop="openRating(req)">⭐ Calificar profesional</button>
              <div v-else class="rating-done-badge">✅ Ya calificaste este servicio</div>
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

    <!-- CHAT -->
    <ChatModal
      v-if="chatRequest"
      v-model="chatOpen"
      :request-id="chatRequest.id"
      :other-name="chatRequest.professional ? chatRequest.professional.name : 'Profesional'"
      :service-name="chatRequest.service_name || ''"
      @read="onChatRead"
    />

    <!-- MODAL FACTURA -->
    <InvoiceModal
      v-if="invoiceModal.request"
      :open="invoiceModal.open"
      :request="invoiceModal.request"
      type="client"
      :user-name="authStore.user ? authStore.user.name : ''"
      @close="invoiceModal.open = false"
    />

    <!-- MODAL CALIFICACIÓN -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="ratingModal.open" class="modal-overlay-ev" @click.self="ratingModal.open = false">
          <div class="modal-ev modal-rating">
            <div class="modal-ev-header">
              <h3 class="modal-ev-title">Calificar profesional</h3>
              <button class="modal-ev-close" @click="ratingModal.open = false">✕</button>
            </div>
            <div class="rating-body">
              <p class="rating-sub">¿Cómo fue tu experiencia con <strong>{{ ratingModal.professionalName }}</strong>?</p>

              <!-- Estrellas -->
              <div class="stars-row">
                <button v-for="n in 5" :key="n"
                  :class="['star-btn', { filled: n <= ratingModal.score }]"
                  @click="ratingModal.score = n">★</button>
              </div>
              <p class="stars-label">{{ starLabel(ratingModal.score) }}</p>

              <!-- Comentario -->
              <textarea
                v-model="ratingModal.comment"
                class="rating-comment"
                placeholder="Cuéntanos más (opcional)…"
                maxlength="500"
                rows="3"
              ></textarea>
              <span class="rating-chars">{{ ratingModal.comment.length }}/500</span>

              <button
                class="btn-submit-rating"
                :disabled="ratingModal.score === 0 || ratingModal.submitting"
                @click="submitRating">
                {{ ratingModal.submitting ? 'Enviando…' : 'Enviar calificación' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL EVIDENCIAS -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="evidenceModal.open" class="modal-overlay-ev" @click.self="evidenceModal.open = false">
          <div class="modal-ev">
            <div class="modal-ev-header">
              <h3 class="modal-ev-title">Evidencias del servicio <span class="ev-id">#{{ String(evidenceModal.requestId).padStart(4,'0') }}</span></h3>
              <button class="modal-ev-close" @click="evidenceModal.open = false">✕</button>
            </div>

            <div v-if="evidenceModal.loading" class="ev-loading">Cargando evidencias…</div>

            <div v-else-if="evidenceModal.items.length === 0" class="ev-empty">
              <span>🔍</span>
              <p>El profesional aún no ha subido evidencias.</p>
            </div>

            <div v-else class="ev-grid">
              <div v-for="ev in evidenceModal.items" :key="ev.id" class="ev-item">
                <a :href="ev.file_url" target="_blank" rel="noopener">
                  <img v-if="ev.file_type === 'image'" :src="ev.file_url" class="ev-img" :alt="ev.note || 'Evidencia'" />
                  <div v-else class="ev-doc-thumb">
                    <span>{{ ev.file_type === 'pdf' ? '📄' : '🎬' }}</span>
                    <span class="ev-doc-type">{{ ev.file_type.toUpperCase() }}</span>
                  </div>
                </a>
                <p v-if="ev.note" class="ev-note">{{ ev.note }}</p>
                <span class="ev-date">{{ ev.created_at }}</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import ChatModal from '@/components/ChatModal.vue'
import InvoiceModal from '@/components/InvoiceModal.vue'
import chatService from '@/services/chatService'
import { useAuthStore } from '@/stores/auth'

const router   = useRouter()
const authStore = useAuthStore()

const goToPay = (req) => {
  router.push({ name: 'ClienteHome', query: { pay: req.id } })
}

const chatOpen     = ref(false)
const chatRequest  = ref(null)
const unreadCounts = ref({})

const openChat = (req) => {
  chatRequest.value = req
  chatOpen.value    = true
}

const onChatRead = () => { loadUnreads() }

const loadUnreads = async () => {
  try {
    const { data } = await chatService.getUnreads()
    unreadCounts.value = data
  } catch { /* silent */ }
}

// ── Tabs ──────────────────────────────────────────────────────
const tabs = [
  { key: 'pending',   label: 'Pendientes' },
  { key: 'accepted',  label: 'En curso' },
  { key: 'completed', label: 'Completadas' },
]
const activeTab = ref('accepted')

// Incluir 'payment_pending' en el tab 'pending'
const PENDING_STATUSES = ['pending', 'payment_pending']

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
const cancelling = ref(null)
const expandedId = ref(null)
const toast      = ref({ visible: false, message: '', type: '' })
let toastTimer   = null

// ── Computed ──────────────────────────────────────────────────
const filtered = computed(() => requests.value.filter(r =>
  activeTab.value === 'pending'
    ? PENDING_STATUSES.includes(r.status)
    : r.status === activeTab.value
))

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

const countByTab = (key) => requests.value.filter(r =>
  key === 'pending' ? PENDING_STATUSES.includes(r.status) : r.status === key
).length

// ── Acciones de control ───────────────────────────────────────
const setTab = (key) => { activeTab.value = key; page.value = 1; expandedId.value = null }
const setSort = (key) => { sortBy.value = key; page.value = 1 }
const setView = (mode) => { viewMode.value = mode; page.value = 1; expandedId.value = null }
const toggleExpand = (id) => { expandedId.value = expandedId.value === id ? null : id }

// ── Helpers ───────────────────────────────────────────────────
const statusLabel = (s) => ({
  payment_pending: '💳 Pago pendiente',
  pending:         'Pendiente',
  accepted:        'En curso',
  completed:       'Completada',
  rejected:        'Rechazada',
}[s] || s)

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
    const list = res.data
    // Marcar cuáles ya fueron calificadas (paralelo, ignorar errores individuales)
    await Promise.all(
      list.filter(r => r.status === 'completed').map(async (r) => {
        try {
          const { data } = await api.get(`/client/requests/${r.id}/my-rating`)
          r._rated = data.rated
        } catch {
          r._rated = false
        }
      })
    )
    requests.value = list
  } catch {
    showToast('Error al cargar solicitudes', 'error')
  } finally {
    loading.value = false
  }
}

const cancelRequest = async (req) => {
  if (!confirm('¿Cancelar esta solicitud? Esta acción no se puede deshacer.')) return
  cancelling.value = req.id
  try {
    await api.delete(`/client/requests/${req.id}`)
    requests.value = requests.value.filter(r => r.id !== req.id)
    showToast('Solicitud cancelada correctamente.', 'success')
  } catch {
    showToast('No se pudo cancelar la solicitud.', 'error')
  } finally {
    cancelling.value = null
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

// ── Modal factura ─────────────────────────────────────────
const invoiceModal = ref({ open: false, request: null })
const openInvoice  = (req) => { invoiceModal.value = { open: true, request: req } }

// ── Acta de capacitación ──────────────────────────────────
const downloadingActa = ref(null)

const isCapacitacion = (req) =>
  /capacit/i.test(req.service_name || '')

const downloadActa = async (req, doc = 1) => {
  downloadingActa.value = req.id
  try {
    const res = await api.get(`/client/requests/${req.id}/document/${doc}`, { responseType: 'blob' })
    const url  = URL.createObjectURL(new Blob([res.data], { type: res.data.type }))
    const link = document.createElement('a')
    link.href     = url
    link.download = `Acta-Capacitacion-${String(req.id).padStart(4, '0')}.docx`
    link.click()
    URL.revokeObjectURL(url)
  } catch {
    showToast('No se pudo descargar el acta', 'error')
  } finally {
    downloadingActa.value = null
  }
}

// ── Modal de calificación ─────────────────────────────────
const ratingModal = ref({
  open: false, submitting: false,
  requestId: null, professionalName: '',
  score: 0, comment: '',
})

const starLabel = (n) => ['', 'Muy malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'][n] || ''

const openRating = async (req) => {
  ratingModal.value = {
    open: true, submitting: false,
    requestId: req.id,
    professionalName: req.professional ? req.professional.name : 'el profesional',
    score: 0, comment: '',
  }
}

const submitRating = async () => {
  if (ratingModal.value.score === 0) return
  ratingModal.value.submitting = true
  try {
    await api.post(`/client/requests/${ratingModal.value.requestId}/rate`, {
      score:   ratingModal.value.score,
      comment: ratingModal.value.comment,
    })
    const found = requests.value.find(r => r.id === ratingModal.value.requestId)
    if (found) found._rated = true
    ratingModal.value.open = false
    showToast('¡Calificación enviada! Gracias por tu opinión.', 'success')
  } catch (e) {
    const msg = e.response && e.response.data && e.response.data.message
      ? e.response.data.message
      : 'Error al enviar la calificación'
    showToast(msg, 'error')
  } finally {
    ratingModal.value.submitting = false
  }
}

// ── Modal de evidencias ───────────────────────────────────
const evidenceModal = ref({ open: false, loading: false, requestId: null, items: [] })

const openEvidences = async (req) => {
  evidenceModal.value = { open: true, loading: true, requestId: req.id, items: [] }
  try {
    const { data } = await api.get(`/client/requests/${req.id}/evidences`)
    evidenceModal.value.items = data
  } catch {
    showToast('Error al cargar las evidencias', 'error')
    evidenceModal.value.open = false
  } finally {
    evidenceModal.value.loading = false
  }
}

let unreadTimer = null

onMounted(() => {
  loadRequests()
  loadUnreads()
  unreadTimer = setInterval(loadUnreads, 5000)
})

onUnmounted(() => clearInterval(unreadTimer))
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

/* Card top row: number + status */
.card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.req-number {
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.3px;
}

/* Status pill */
.status-pill {
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
.btn-chat-pro {
  position: relative; margin-left: auto; flex-shrink: 0;
  background: #22c55e; color: #fff; border: none;
  padding: 7px 12px; border-radius: 10px;
  font-size: 12px; font-weight: 700; cursor: pointer;
  transition: background .15s, transform .15s;
  display: inline-flex; align-items: center; gap: 5px;
}
.btn-chat-pro:hover { background: #16a34a; transform: translateY(-1px); }
.chat-badge-pro {
  display: inline-flex; align-items: center; justify-content: center;
  background: #ef4444; color: #fff;
  font-size: 10px; font-weight: 800;
  min-width: 18px; height: 18px; border-radius: 9px;
  padding: 0 4px; line-height: 1;
}
.pro-avatar { width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0; }
.pro-data   { flex: 1; display: flex; flex-direction: column; gap: 1px; }
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

/* ── PAY PENDING ACTIONS ─────────────────────────────────────── */
.pay-pending-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.btn-pay-now {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg, #15803d, #16a34a);
  color: white; border: none; border-radius: 11px;
  font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: opacity .15s, transform .15s;
}
.btn-pay-now:hover { transform: translateY(-1px); opacity: 0.92; }
.btn-cancel-sr {
  width: 100%; padding: 9px;
  background: none; border: 1.5px solid #fca5a5; border-radius: 11px;
  color: #dc2626; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: background .15s, color .15s;
}
.btn-cancel-sr:hover:not(:disabled) { background: #fef2f2; }
.btn-cancel-sr:disabled { opacity: .5; cursor: not-allowed; }

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

/* ── Botón evidencias ────────────────────────────────────── */
.btn-evidencias {
  width: 100%; margin-top: 8px; padding: 9px;
  background: none; border: 1.5px solid #c4b5fd;
  border-radius: 10px; color: #7c3aed;
  font-size: 12px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: background .15s;
}
.btn-evidencias:hover { background: #f5f3ff; }

/* ── Modal evidencias overlay ───────────────────────────── */
.modal-overlay-ev {
  position: fixed; inset: 0; background: rgba(15,23,42,.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 9998; padding: 16px;
}
.modal-ev {
  background: white; border-radius: 20px;
  width: 100%; max-width: 640px;
  max-height: 80vh; overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0,0,0,.18);
}
.modal-ev-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1.5px solid #f1f5f9;
  position: sticky; top: 0; background: white; z-index: 1;
}
.modal-ev-title { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; }
.ev-id { font-size: 13px; color: #94a3b8; margin-left: 6px; }
.modal-ev-close {
  width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid #e2e8f0;
  background: #f8fafc; cursor: pointer; font-size: 14px; color: #64748b;
  display: flex; align-items: center; justify-content: center;
}
.modal-ev-close:hover { background: #f1f5f9; }
.ev-loading, .ev-empty {
  padding: 32px; text-align: center; color: #94a3b8; font-size: 13px;
}
.ev-empty span { font-size: 28px; display: block; margin-bottom: 8px; }
.ev-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px; padding: 20px 24px;
}
.ev-item {
  display: flex; flex-direction: column; gap: 6px;
  border: 1.5px solid #f1f5f9; border-radius: 12px; overflow: hidden;
}
.ev-img {
  width: 100%; aspect-ratio: 4/3; object-fit: cover;
  display: block; transition: opacity .2s;
}
.ev-img:hover { opacity: .85; }
.ev-doc-thumb {
  width: 100%; aspect-ratio: 4/3;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: #f8fafc; gap: 6px; font-size: 28px;
}
.ev-doc-type { font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: .5px; }
.ev-note { font-size: 11px; color: #475569; padding: 0 10px; margin: 0; line-height: 1.4; }
.ev-date { font-size: 10px; color: #94a3b8; padding: 0 10px 8px; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* ── Botón calificar ─────────────────────────────────────── */
.btn-factura {
  width: 100%; margin-top: 6px; padding: 9px;
  background: none; border: 1.5px solid #bfdbfe;
  border-radius: 10px; color: #1d4ed8;
  font-size: 12px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: background .15s;
}
.btn-factura:hover { background: #eff6ff; }

.btn-acta {
  width: 100%; margin-top: 6px; padding: 9px;
  background: none; border: 1.5px solid #bbf7d0;
  border-radius: 10px; color: #166534;
  font-size: 12px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: background .15s;
}
.btn-acta:hover:not(:disabled) { background: #f0fdf4; }
.btn-acta:disabled { opacity: .6; cursor: not-allowed; }

.btn-calificar {
  width: 100%; margin-top: 6px; padding: 9px;
  background: none; border: 1.5px solid #fde68a;
  border-radius: 10px; color: #92400e;
  font-size: 12px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: background .15s;
}
.btn-calificar:hover { background: #fefce8; }

.rating-done-badge {
  margin-top: 6px; padding: 7px; border-radius: 10px;
  background: #f0fdf4; border: 1px solid #86efac;
  color: #166534; font-size: 11px; font-weight: 700;
  text-align: center;
}

/* ── Modal de calificación ──────────────────────────────── */
.modal-rating { max-width: 420px; }

.rating-body {
  padding: 20px 24px 24px;
  display: flex; flex-direction: column; gap: 10px;
}
.rating-sub { font-size: 14px; color: #475569; margin: 0; }

.stars-row { display: flex; gap: 6px; }
.star-btn {
  font-size: 34px; background: none; border: none;
  color: #e2e8f0; cursor: pointer; padding: 0;
  transition: color .15s, transform .1s;
  line-height: 1;
}
.star-btn.filled { color: #f59e0b; }
.star-btn:hover  { transform: scale(1.15); }

.stars-label {
  font-size: 13px; font-weight: 700; color: #f59e0b;
  min-height: 18px; margin: 0;
}

.rating-comment {
  width: 100%; padding: 10px 12px; border-radius: 10px;
  border: 1.5px solid #e2e8f0; font-size: 13px; font-family: inherit;
  color: #0f172a; resize: none; outline: none; box-sizing: border-box;
  transition: border-color .15s;
}
.rating-comment:focus { border-color: #f59e0b; }
.rating-chars { font-size: 10px; color: #94a3b8; text-align: right; }

.btn-submit-rating {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg, #d97706, #f59e0b);
  color: white; border: none; border-radius: 11px;
  font-size: 14px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: opacity .15s, transform .15s;
}
.btn-submit-rating:hover:not(:disabled) { transform: translateY(-1px); }
.btn-submit-rating:disabled { opacity: .5; cursor: not-allowed; }
</style>

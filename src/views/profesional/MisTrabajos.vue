<template>
    <div class="trabajos-container">

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

        <!-- LOADING -->
        <div v-if="loading" class="skeleton-list">
            <div v-for="n in 3" :key="n" class="skeleton-card">
                <div class="skeleton-line w-60"></div>
                <div class="skeleton-line w-90 short"></div>
                <div class="skeleton-line w-40 short"></div>
            </div>
        </div>

        <!-- EMPTY -->
        <div v-else-if="sortedFiltered.length === 0" class="empty-state">
            <img src="/images/logo-services-sin-fondo.png" class="empty-logo" alt="e-service" />
            <p class="empty-title">Sin trabajos en esta sección</p>
        </div>

        <!-- ── GRID VIEW ───────────────────────────────────── -->
        <TransitionGroup v-else-if="viewMode === 'grid'" name="fade" tag="div" class="jobs-grid">
            <div v-for="job in paginated" :key="job.id" class="job-card" :class="job.status">

                <div class="card-top-row">
                    <span class="job-id-badge">#{{ String(job.id).padStart(4, '0') }}</span>
                    <span :class="['status-pill', job.status]">{{ statusLabel(job.status) }}</span>
                </div>

                <!-- Dos columnas: contenido (izq) + Chat centrado (der) -->
                <div class="card-body-cols">
                    <div class="card-body-left">
                        <div class="job-head">
                            <div class="svc-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                                </svg>
                            </div>
                            <span class="job-svc">{{ job.service_name }}</span>
                        </div>
                        <div class="job-budget">${{ Number(job.budget).toLocaleString('es-CO') }}</div>
                        <p class="job-desc">{{ job.description }}</p>
                        <div class="job-chips">
                            <span class="chip">📅 {{ job.service_date }} {{ job.service_time }}</span>
                            <span v-if="job.address" class="chip">📍 {{ job.address }}</span>
                            <span v-else class="chip chip-virtual">💻 Virtual</span>
                        </div>
                        <div class="job-divider"></div>
                        <div class="client-info">
                            <div class="client-avatar">{{ getInitials(job.client_name) }}</div>
                            <div>
                                <span class="client-name">{{ job.client_name }}</span>
                                <span v-if="job.client_phone" class="client-phone">{{ job.client_phone }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Chat flotante al centro-derecha -->
                    <div class="card-body-right">
                        <button class="btn-chat" @click.stop="openChat(job)">
                            💬 Chat
                            <span v-if="unreadCounts[job.id]" class="chat-badge">{{ unreadCounts[job.id] }}</span>
                        </button>
                    </div>
                </div>

                <!-- Botones de acción al fondo (ancho completo) -->
                <div class="card-actions">
                    <button v-if="job.status === 'accepted'" class="btn-evidence" @click.stop="openEvidenceModal(job)">📷 Evidencias</button>
                    <button v-if="job.status === 'accepted'" class="btn-complete" @click.stop="openCodeModal(job)">✓ Completar</button>
                    <button v-if="job.status === 'completed'" class="btn-view-ev" @click.stop="openEvidenceModal(job)">🖼️ Ver evidencias</button>
                    <button v-if="job.status === 'completed'" class="btn-factura-pro" @click.stop="openInvoice(job)">🧾 Comprobante</button>
                    <button v-if="job.status === 'completed' && !job._rated" class="btn-rate-client" @click.stop="openRating(job)">⭐ Calificar cliente</button>
                    <span v-if="job.status === 'completed' && job._rated" class="rated-badge">✅ Calificado</span>
                </div>
            </div>
        </TransitionGroup>

        <!-- ── LIST VIEW ───────────────────────────────────── -->
        <div v-else class="list-view">
          <div class="list-header">
            <span class="lh-svc">Servicio</span>
            <span class="lh-date">Fecha</span>
            <span class="lh-addr hide-sm">Ubicación</span>
            <span class="lh-budget">Valor</span>
            <span class="lh-client hide-sm">Cliente</span>
            <span class="lh-status">Estado</span>
            <span class="lh-arrow"></span>
          </div>

          <div v-for="job in paginated" :key="job.id" class="list-item-wrap">
            <div :class="['list-row', job.status, { 'is-expanded': expandedId === job.id }]"
              @click="toggleExpand(job.id)">
              <div class="lr-svc">
                <div :class="['lr-icon', job.status]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                  </svg>
                </div>
                <div>
                  <div class="lr-name">{{ job.service_name }} <span class="lr-id">#{{ String(job.id).padStart(4,'0') }}</span></div>
                  <div class="lr-mini-desc">{{ job.description }}</div>
                </div>
              </div>
              <div class="lr-date">
                <span>{{ job.service_date }}</span>
                <span class="lr-time">{{ job.service_time }}</span>
              </div>
              <span class="lr-addr hide-sm">{{ job.address || '💻 Virtual' }}</span>
              <span class="lr-budget">${{ Number(job.budget).toLocaleString('es-CO') }}</span>
              <div class="lr-client hide-sm">
                <div class="client-avatar sm">{{ getInitials(job.client_name) }}</div>
                <span class="lr-client-name">{{ job.client_name }}</span>
              </div>
              <span :class="['lr-pill', job.status]">{{ statusLabel(job.status) }}</span>
              <span class="lr-arrow" :class="{ open: expandedId === job.id }">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="2,4 6,8 10,4"/>
                </svg>
              </span>
            </div>

            <Transition name="expand">
              <div v-if="expandedId === job.id" class="row-detail">
                <p class="rd-desc">{{ job.description }}</p>
                <div class="rd-actions">
                  <button class="btn-chat" @click.stop="openChat(job)">
                    💬 Chat con cliente
                    <span v-if="unreadCounts[job.id]" class="chat-badge">{{ unreadCounts[job.id] }}</span>
                  </button>
                  <button v-if="job.status === 'accepted'" class="btn-evidence" @click.stop="openEvidenceModal(job)">📷 Evidencias</button>
                  <button v-if="job.status === 'accepted'" class="btn-complete" @click.stop="openCodeModal(job)">✓ Completar</button>
                  <button v-if="job.status === 'completed'" class="btn-view-ev" @click.stop="openEvidenceModal(job)">🖼️ Ver evidencias</button>
                  <button v-if="job.status === 'completed'" class="btn-factura-pro" @click.stop="openInvoice(job)">🧾 Comprobante</button>
                  <button v-if="job.status === 'completed' && !job._rated" class="btn-rate-client" @click.stop="openRating(job)">⭐ Calificar cliente</button>
                  <span v-if="job.status === 'completed' && job._rated" class="rated-badge">✅ Calificado</span>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- ── PAGINACIÓN ──────────────────────────────────── -->
        <div v-if="!loading && totalPages > 1" class="pagination">
          <button class="pg-btn" :disabled="page === 1" @click="page--">← Anterior</button>
          <div class="pg-numbers">
            <button v-for="p in totalPages" :key="p" :class="['pg-num', { active: p === page }]" @click="page = p">{{ p }}</button>
          </div>
          <button class="pg-btn" :disabled="page === totalPages" @click="page++">Siguiente →</button>
        </div>

        <!-- ===================== -->
        <!-- MODAL EVIDENCIAS      -->
        <!-- ===================== -->
        <Transition name="modal">
            <div v-if="evidenceModal" class="modal-overlay" @click.self="evidenceModal = false">
                <div class="modal-evidence">

                    <div class="modal-ev-header">
                        <div>
                            <h3>Evidencias del trabajo</h3>
                            <p>{{ selectedJob?.service_name }} — {{ selectedJob?.client_name }}</p>
                        </div>
                        <button class="btn-modal-close" @click="evidenceModal = false">✕</button>
                    </div>

                    <!-- Lista de evidencias subidas -->
                    <div class="evidences-grid" v-if="evidences.length">
                        <div v-for="ev in evidences" :key="ev.id" class="evidence-item">
                            <img v-if="ev.file_type === 'image'" :src="ev.file_url" class="ev-preview" />
                            <div v-else class="ev-file-icon">
                                {{ ev.file_type === 'video' ? '🎥' : '📄' }}
                            </div>
                            <p class="ev-note">{{ ev.note || 'Sin nota' }}</p>
                            <span class="ev-date">{{ ev.created_at }}</span>
                        </div>
                    </div>
                    <p v-else class="no-evidences">Aún no hay evidencias subidas.</p>

                    <!-- Subir nueva evidencia -->
                    <div v-if="selectedJob?.status === 'accepted'" class="upload-section">
                        <p class="upload-title">Subir nueva evidencia</p>

                        <label class="file-drop" :class="{ 'has-file': uploadFile }">
                            <input type="file" accept="image/*,video/*,.pdf" @change="onFileChange"
                                class="hidden-input" />
                            <span v-if="!uploadFile">
                                📎 Toca para seleccionar imagen, video o PDF
                            </span>
                            <span v-else class="file-selected">
                                ✓ {{ uploadFile.name }}
                            </span>
                        </label>

                        <textarea v-model="uploadNote" class="note-input"
                            placeholder="Nota opcional (ej: trabajo finalizado en cocina)" rows="2"></textarea>

                        <button class="btn-upload" :disabled="!uploadFile || uploading" @click="submitEvidence">
                            {{ uploading ? 'Subiendo…' : '⬆️ Subir evidencia' }}
                        </button>
                    </div>

                </div>
            </div>
        </Transition>

        <!-- MODAL CÓDIGO -->
        <Transition name="modal">
            <div v-if="codeModal" class="modal-overlay" @click.self="codeModal = false">
                <div class="modal-code">

                    <div class="modal-code-header">
                        <div class="code-icon">🔐</div>
                        <div>
                            <h3>Código de aprobación</h3>
                            <p>Ingresa el código de 6 dígitos que el cliente te proporcionó</p>
                        </div>
                    </div>

                    <div class="code-inputs">
                        <input v-for="(digit, i) in codeDigits" :key="i" :ref="el => digitRefs[i] = el"
                            v-model="codeDigits[i]" type="text" inputmode="numeric" maxlength="1" class="digit-input"
                            :class="{ filled: digit }" @input="onDigitInput(i)" @keydown.backspace="onBackspace(i)"
                            @paste.prevent="onPaste($event)" />
                    </div>

                    <p v-if="codeError" class="code-error">{{ codeError }}</p>

                    <div class="modal-code-actions">
                        <button class="btn-cancel-code" @click="codeModal = false">Cancelar</button>
                        <button class="btn-verify" :disabled="fullCode.length < 6 || verifying" @click="submitCode">
                            {{ verifying ? 'Verificando…' : 'Verificar →' }}
                        </button>
                    </div>

                </div>
            </div>
        </Transition>

        <!-- TOAST -->
        <Transition name="toast">
            <div v-if="toast.visible" class="toast" :class="toast.type">
                {{ toast.message }}
            </div>
        </Transition>

        <!-- CHAT -->
        <ChatModal
          v-if="chatRequest"
          v-model="chatOpen"
          :request-id="chatRequest.id"
          :other-name="chatRequest.client_name ?? 'Cliente'"
          :service-name="chatRequest.service_name ?? ''"
          @read="onChatRead"
        />

        <!-- MODAL FACTURA -->
        <InvoiceModal
          v-if="invoiceModal.job"
          :open="invoiceModal.open"
          :request="invoiceModal.job"
          type="professional"
          :user-name="authStore.user ? authStore.user.name : ''"
          @close="invoiceModal.open = false"
        />

        <!-- MODAL CALIFICACIÓN -->
        <Teleport to="body">
          <Transition name="modal">
            <div v-if="ratingModal.open" class="modal-overlay modal-center" @click.self="ratingModal.open = false">
              <div class="modal-rating">
                <div class="modal-ev-header">
                  <div>
                    <h3>Calificar cliente</h3>
                    <p>¿Cómo fue la experiencia con <strong>{{ ratingModal.clientName }}</strong>?</p>
                  </div>
                  <button class="btn-modal-close" @click="ratingModal.open = false">✕</button>
                </div>
                <div class="rating-body">
                  <div class="stars-row">
                    <button v-for="n in 5" :key="n"
                      :class="['star-btn', { filled: n <= ratingModal.score }]"
                      @click="ratingModal.score = n">★</button>
                  </div>
                  <p class="stars-label">{{ starLabel(ratingModal.score) }}</p>
                  <textarea
                    v-model="ratingModal.comment"
                    class="rating-comment"
                    placeholder="Comentario opcional…"
                    maxlength="500"
                    rows="3"
                  ></textarea>
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

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/services/api'
import ChatModal from '@/components/ChatModal.vue'
import InvoiceModal from '@/components/InvoiceModal.vue'
import chatService from '@/services/chatService'
import { useAuthStore } from '@/stores/auth'

const authStore   = useAuthStore()
const chatOpen    = ref(false)
const chatRequest = ref(null)
const unreadCounts = ref({})

const openChat = (job) => {
  chatRequest.value = job
  chatOpen.value    = true
}

const onChatRead = () => {
  loadUnreads()
}

const loadUnreads = async () => {
  try {
    const { data } = await chatService.getUnreads()
    unreadCounts.value = data
  } catch { /* silent */ }
}

const tabs = [
    { key: 'accepted', label: 'En curso' },
    { key: 'completed', label: 'Completados' },
]
const activeTab = ref('accepted')
const loading = ref(true)
const completing = ref(null)
const jobs = ref([])

const evidenceModal = ref(false)
const selectedJob = ref(null)
const evidences = ref([])
const uploadFile = ref(null)
const uploadNote = ref('')
const uploading = ref(false)


const codeModal   = ref(false)
const codeDigits  = ref(['', '', '', '', '', ''])
const digitRefs   = ref([])
const codeError   = ref('')
const verifying   = ref(null)
const codeJob     = ref(null)

const fullCode = computed(() => codeDigits.value.join(''))

const openCodeModal = (job) => {
  codeJob.value    = job
  codeDigits.value = ['', '', '', '', '', '']
  codeError.value  = ''
  codeModal.value  = true
  // focus al primer input después del render
  setTimeout(() => { digitRefs.value[0]?.focus() }, 100)
}

const onDigitInput = (i) => {
  // Solo números
  codeDigits.value[i] = codeDigits.value[i].replace(/\D/, '')
  codeError.value = ''
  if (codeDigits.value[i] && i < 5) {
    digitRefs.value[i + 1]?.focus()
  }
}

const onBackspace = (i) => {
  if (!codeDigits.value[i] && i > 0) {
    codeDigits.value[i - 1] = ''
    digitRefs.value[i - 1]?.focus()
  }
}

const onPaste = (e) => {
  const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  text.split('').forEach((char, i) => {
    codeDigits.value[i] = char
  })
  digitRefs.value[Math.min(text.length, 5)]?.focus()
}

const submitCode = async () => {
  if (fullCode.value.length < 6) return
  verifying.value = true
  codeError.value = ''

  try {
    await api.post(`/professional/requests/${codeJob.value.id}/verify-code`, {
      code: fullCode.value,
    })

    // Actualizar estado local
    const found = jobs.value.find(j => j.id === codeJob.value.id)
    if (found) found.status = 'completed'

    codeModal.value = false
    showToast('✓ Trabajo completado y aprobado', 'success')

  } catch (error) {
    codeError.value = error.response?.data?.message || 'Código incorrecto'
    // Limpiar inputs en error
    codeDigits.value = ['', '', '', '', '', '']
    setTimeout(() => digitRefs.value[0]?.focus(), 50)
  } finally {
    verifying.value = false
  }
}

const toast = ref({ visible: false, message: '', type: '' })
let toastTimer = null

/* ============ utils ============ */
const getInitials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

const statusLabel = (s) => ({
    accepted: 'En curso',
    completed: 'Completado',
}[s] || s)

const countByTab = (key) => jobs.value.filter(j => j.status === key).length

const filtered = computed(() => jobs.value.filter(j => j.status === activeTab.value))

const viewMode = ref('grid')
const sortBy   = ref('recent')
const page     = ref(1)
const expandedId = ref(null)

const sortOptions = [
  { key: 'recent', label: 'Más recientes' },
  { key: 'date',   label: 'Por fecha' },
  { key: 'name',   label: 'Alfabéticamente' },
]

const perPage = computed(() => viewMode.value === 'grid' ? 6 : 10)

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

const setTab    = (key)  => { activeTab.value = key; page.value = 1; expandedId.value = null }
const setSort   = (key)  => { sortBy.value = key; page.value = 1 }
const setView   = (mode) => { viewMode.value = mode; page.value = 1; expandedId.value = null }
const toggleExpand = (id) => { expandedId.value = expandedId.value === id ? null : id }

const showToast = (message, type = '') => {
    clearTimeout(toastTimer)
    toast.value = { visible: true, message, type }
    toastTimer = setTimeout(() => { toast.value.visible = false }, 3000)
}

/* ============ invoice ============ */
const invoiceModal = ref({ open: false, job: null })
const openInvoice  = (job) => { invoiceModal.value = { open: true, job } }

/* ============ rating ============ */
const ratingModal = ref({
  open: false, submitting: false,
  jobId: null, clientName: '',
  score: 0, comment: '',
})

const starLabel = (n) => ['', 'Muy malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'][n] || ''

const openRating = (job) => {
  ratingModal.value = {
    open: true, submitting: false,
    jobId: job.id,
    clientName: job.client_name || 'el cliente',
    score: 0, comment: '',
  }
}

const submitRating = async () => {
  if (ratingModal.value.score === 0) return
  ratingModal.value.submitting = true
  try {
    await api.post(`/professional/requests/${ratingModal.value.jobId}/rate-client`, {
      score:   ratingModal.value.score,
      comment: ratingModal.value.comment,
    })
    const found = jobs.value.find(j => j.id === ratingModal.value.jobId)
    if (found) found._rated = true
    ratingModal.value.open = false
    showToast('¡Calificación enviada!', 'success')
  } catch (e) {
    const msg = e.response && e.response.data && e.response.data.message
      ? e.response.data.message
      : 'Error al enviar la calificación'
    showToast(msg, 'error')
  } finally {
    ratingModal.value.submitting = false
  }
}

/* ============ load ============ */
const loadJobs = async () => {
    try {
        const res = await api.get('/professional/requests/accepted')
        const list = res.data
        await Promise.all(
          list.filter(j => j.status === 'completed').map(async (j) => {
            try {
              const { data } = await api.get(`/professional/requests/${j.id}/my-rating`)
              j._rated = data.rated
            } catch {
              j._rated = false
            }
          })
        )
        jobs.value = list
    } catch {
        showToast('Error al cargar trabajos', 'error')
    } finally {
        loading.value = false
    }
}

/* ============ complete ============ */
const markComplete = async (job) => {
    try {
        completing.value = job.id
        await api.post(`/professional/requests/${job.id}/complete`)
        const found = jobs.value.find(j => j.id === job.id)
        if (found) found.status = 'completed'
        showToast('✓ Trabajo marcado como completado', 'success')
    } catch {
        showToast('Error al completar el trabajo', 'error')
    } finally {
        completing.value = null
    }
}

/* ============ evidences ============ */
const openEvidenceModal = async (job) => {
    selectedJob.value = job
    evidences.value = []
    uploadFile.value = null
    uploadNote.value = ''
    evidenceModal.value = true

    try {
        const res = await api.get(`/professional/requests/${job.id}/evidences`)
        evidences.value = res.data
    } catch {
        showToast('Error al cargar evidencias', 'error')
    }
}

const onFileChange = (e) => {
    uploadFile.value = e.target.files[0] || null
}

const submitEvidence = async () => {
    if (!uploadFile.value) return
    uploading.value = true

    try {
        const form = new FormData()
        form.append('file', uploadFile.value)
        form.append('note', uploadNote.value)

        const res = await api.post(
            `/professional/requests/${selectedJob.value.id}/evidences`,
            form,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )

        evidences.value.unshift({
            id: res.data.id,
            file_url: res.data.file_url,
            file_type: uploadFile.value.type.startsWith('image') ? 'image' : 'file',
            note: uploadNote.value,
            created_at: 'Ahora',
        })

        uploadFile.value = null
        uploadNote.value = ''
        showToast('✓ Evidencia subida', 'success')
    } catch {
        showToast('Error al subir la evidencia', 'error')
    } finally {
        uploading.value = false
    }
}

let unreadTimer = null

onMounted(() => {
  loadJobs()
  loadUnreads()
  unreadTimer = setInterval(loadUnreads, 5000)
})

onUnmounted(() => clearInterval(unreadTimer))
</script>

<style scoped>
/* ======================= */
/* CONTAINER               */
/* ======================= */
.trabajos-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 32px;
}

/* ======================= */
/* TABS                    */
/* ======================= */
.tabs {
    display: flex;
    gap: 8px;
    background: #f1f5f9;
    padding: 4px;
    border-radius: 12px;
    width: fit-content;
}

.tab-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 9px;
    border: none;
    background: transparent;
    font-size: 13px;
    font-weight: 700;
    color: #64748b;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    font-family: inherit;
}

.tab-btn.active {
    background: white;
    color: #2563eb;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

.tab-badge {
    background: #2563eb;
    color: white;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 20px;
    min-width: 18px;
    text-align: center;
}

.tab-btn:not(.active) .tab-badge {
    background: #94a3b8;
}

/* ======================= */
/* SKELETON                */
/* ======================= */
.skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.skeleton-card {
    background: white;
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.skeleton-line {
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
}

.skeleton-line.short {
    height: 11px;
}

.skeleton-line.w-90 {
    width: 90%;
}

.skeleton-line.w-60 {
    width: 60%;
}

.skeleton-line.w-40 {
    width: 40%;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

/* ======================= */
/* EMPTY                   */
/* ======================= */
.empty-state {
    text-align: center;
    padding: 48px 24px;
    background: #f8fafc;
    border-radius: 16px;
    border: 1.5px dashed #e2e8f0;
    color: #94a3b8;
}

.empty-icon {
    font-size: 28px;
    margin-bottom: 10px;
}

.empty-title {
    font-size: 14px;
    font-weight: 700;
    color: #64748b;
    margin: 0;
}

/* ======================= */
/* CARD GROUP              */
/* ======================= */
.card-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.card-enter-active,
.card-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.card-enter-from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
}

.card-leave-to {
    opacity: 0;
    transform: translateX(-12px);
}

/* ======================= */
/* JOB CARD                */
/* ======================= */
.job-card {
    background: white;
    border: 1.5px solid #e2e8f0;
    border-radius: 16px;
    padding: 16px;
    position: relative;
    transition: box-shadow 0.2s;
}

.job-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
}

.job-card.completed {
    border-color: #bbf7d0;
    background: #f0fdf4;
}

.card-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.job-id-badge {
    font-size: 11px;
    font-weight: 800;
    color: #94a3b8;
    letter-spacing: 0.3px;
}

.status-pill {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 6px;
}

.status-pill.accepted {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
}

.status-pill.completed {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #86efac;
}

.job-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    padding-right: 88px;
}

.service-icon-wrap {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: #eff6ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.job-service {
    font-weight: 700;
    font-size: 14px;
    flex: 1;
}

.job-budget {
    font-weight: 800;
    font-size: 18px;
    color: #2563eb;
    letter-spacing: -0.5px;
}

.job-description {
    font-size: 13px;
    color: #475569;
    line-height: 1.5;
    margin: 0 0 10px;
}

.job-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 14px;
}

.meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #64748b;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 8px;
}

/* Layout dos columnas: contenido izq + chat der centrado */
.card-body-cols {
    display: flex;
    gap: 12px;
    align-items: center;
}
.card-body-left {
    flex: 1;
    min-width: 0;
}
.card-body-right {
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.job-divider {
    height: 1px;
    background: #e2e8f0;
    margin: 12px 0;
}

.client-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

/* Botones de acción al pie de la tarjeta */
.card-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 12px;
}

.client-avatar {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #e0e7ff;
    color: #3730a3;
    font-size: 11px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.client-name {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    display: block;
}

.client-phone {
    font-size: 11px;
    color: #64748b;
}


.btn-chat {
    position: relative;
    background: #f0fdf4;
    color: #15803d;
    border: 1px solid #86efac;
    padding: 7px 13px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background .15s, transform .15s;
    display: inline-flex; align-items: center; gap: 5px;
}
.btn-chat:hover { background: #dcfce7; transform: translateY(-1px); }
.chat-badge {
    display: inline-flex; align-items: center; justify-content: center;
    background: #ef4444; color: #fff;
    font-size: 10px; font-weight: 800;
    min-width: 18px; height: 18px; border-radius: 9px;
    padding: 0 4px; line-height: 1;
}

.btn-evidence {
    background: #ecfdf5;
    color: #065f46;
    border: 1px solid #a7f3d0;
    padding: 9px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s, transform 0.15s;
}

.btn-evidence:hover {
    background: #d1fae5;
    transform: translateY(-1px);
}

.btn-complete {
    background: linear-gradient(135deg, #1d4ed8, #2563eb);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
}

.btn-complete:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
}

.btn-complete:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.btn-view-ev {
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #86efac;
    padding: 9px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: background .15s, transform .15s;
}
.btn-view-ev:hover { background: #dcfce7; transform: translateY(-1px); }

/* ======================= */
/* MODAL EVIDENCIAS        */
/* ======================= */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    z-index: 999;
    padding: 0;
}

.modal-evidence {
    background: white;
    width: 100%;
    max-width: 480px;
    border-radius: 20px 20px 0 0;
    padding: 20px;
    max-height: 85vh;
    overflow-y: auto;
    animation: slideUp 0.25s ease;
}

@keyframes slideUp {
    from {
        transform: translateY(60px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-ev-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.modal-ev-header h3 {
    font-size: 16px;
    font-weight: 800;
    margin: 0 0 3px;
}

.modal-ev-header p {
    font-size: 12px;
    color: #64748b;
    margin: 0;
}

.btn-modal-close {
    background: #f1f5f9;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    flex-shrink: 0;
}

/* Grid evidencias */
.evidences-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
    margin-bottom: 16px;
}

.evidence-item {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 8px;
    text-align: center;
}

.ev-preview {
    width: 100%;
    height: 80px;
    object-fit: cover;
    border-radius: 6px;
    margin-bottom: 6px;
}

.ev-file-icon {
    font-size: 32px;
    margin-bottom: 6px;
}

.ev-note {
    font-size: 11px;
    color: #475569;
    margin: 0 0 3px;
}

.ev-date {
    font-size: 10px;
    color: #94a3b8;
}

.no-evidences {
    font-size: 13px;
    color: #94a3b8;
    text-align: center;
    padding: 16px 0;
}

/* Upload */
.upload-section {
    border-top: 1px solid #f1f5f9;
    padding-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.upload-title {
    font-size: 13px;
    font-weight: 700;
    color: #334155;
    margin: 0;
}

.file-drop {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    font-size: 13px;
    color: #64748b;
    transition: border-color 0.2s, background 0.2s;
    text-align: center;
}

.file-drop:hover {
    border-color: #2563eb;
    background: #eff6ff;
}

.file-drop.has-file {
    border-color: #22c55e;
    background: #f0fdf4;
}

.file-drop .file-selected {
    color: #15803d;
    font-weight: 700;
}

.hidden-input {
    display: none;
}

.note-input {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 13px;
    font-family: inherit;
    color: #334155;
    resize: none;
    box-sizing: border-box;
    transition: border-color 0.2s;
}

.note-input:focus {
    outline: none;
    border-color: #2563eb;
}

.btn-upload {
    background: linear-gradient(135deg, #1d4ed8, #2563eb);
    color: white;
    border: none;
    padding: 12px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.15s;
}

.btn-upload:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* ======================= */
/* MODAL TRANSITION        */
/* ======================= */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

/* ======================= */
/* TOAST                   */
/* ======================= */
.toast {
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    color: #fff;
    padding: 12px 22px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    z-index: 9999;
    white-space: nowrap;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    pointer-events: none;
}

.toast.success {
    background: #14532d;
}

.toast.error {
    background: #7f1d1d;
}

.toast-enter-active,
.toast-leave-active {
    transition: opacity 0.25s ease, transform 0.3s cubic-bezier(.34, 1.56, .64, 1);
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(-50%) translateY(16px) scale(0.95);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
}

/* ======================= */
/* RESPONSIVE              */
/* ======================= */
@media (max-width: 480px) {
    .job-footer {
        flex-direction: column;
        align-items: stretch;
    }

    .job-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }

    .btn-complete {
        grid-column: span 2;
        padding: 13px;
    }

    .modal-evidence {
        border-radius: 20px 20px 0 0;
    }
}

/* ======================= */
/* MODAL CÓDIGO            */
/* ======================= */
.modal-code {
  background: white;
  width: 100%;
  max-width: 360px;
  border-radius: 20px 20px 0 0;
  padding: 28px 24px;
  animation: slideUp 0.25s ease;
}

.modal-code-header {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.code-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  background: #eff6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-code-header h3 {
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 4px;
  color: #0f172a;
}

.modal-code-header p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

/* Inputs de dígitos */
.code-inputs {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 8px;
}

.digit-input {
  width: 44px;
  height: 54px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  background: #f8fafc;
}

.digit-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background: white;
}

.digit-input.filled {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
}

.code-error {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #dc2626;
  margin: 4px 0 12px;
  min-height: 18px;
}

.modal-code-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.btn-cancel-code {
  flex: 1;
  padding: 12px;
  border: 1.5px solid #e2e8f0;
  background: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  font-family: inherit;
}

.btn-verify {
  flex: 2;
  padding: 12px;
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}

.btn-verify:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ======================= */
/* TOP BAR                 */
/* ======================= */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

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

/* ======================= */
/* GRID VIEW               */
/* ======================= */
.jobs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  align-items: start;
}

.job-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 80px;
}

.svc-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #2563eb;
}

.job-svc {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
}

.job-desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.job-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
}

.chip-virtual {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #15803d;
}

/* ======================= */
/* LIST VIEW               */
/* ======================= */
.list-view {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1.2fr 0.8fr 1fr 0.7fr 28px;
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
  grid-template-columns: 2fr 1fr 1.2fr 0.8fr 1fr 0.7fr 28px;
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
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lr-icon.accepted  { background: #eff6ff; color: #2563eb; }
.lr-icon.completed { background: #dcfce7; color: #15803d; }

.lr-id {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  margin-left: 5px;
}

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

.lr-date {
  display: flex;
  flex-direction: column;
  gap: 1px;
  font-size: 11px;
  color: #475569;
  font-weight: 600;
}

.lr-time {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 400;
}

.lr-addr {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lr-budget {
  font-size: 13px;
  font-weight: 800;
  color: #2563eb;
}

.lr-client {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.client-avatar.sm {
  width: 24px;
  height: 24px;
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

.rd-desc {
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
  margin: 0 0 10px;
}

.rd-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Expand transition */
.expand-enter-active {
  transition: max-height 0.3s ease, opacity 0.25s ease;
  max-height: 300px;
}
.expand-leave-active {
  transition: max-height 0.2s ease, opacity 0.15s ease;
  max-height: 300px;
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

/* ======================= */
/* PAGINATION              */
/* ======================= */
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

.pg-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pg-btn:not(:disabled):hover { background: #dbeafe; }

.pg-numbers {
  display: flex;
  gap: 4px;
}

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

.pg-num.active {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.pg-num:not(.active):hover { background: #f8fafc; border-color: #cbd5e1; }

/* ======================= */
/* EMPTY LOGO              */
/* ======================= */
.empty-logo {
  width: 90px;
  height: 90px;
  object-fit: contain;
  margin-bottom: 12px;
  opacity: 0.85;
}

/* ======================= */
/* HIDE-SM (tablet)        */
/* ======================= */
@media (max-width: 860px) {
  .hide-sm { display: none !important; }
  .list-header,
  .list-row {
    grid-template-columns: 2fr 1fr 0.8fr 0.7fr 28px;
  }
}

@media (max-width: 760px) {
  .jobs-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .jobs-grid { grid-template-columns: 1fr; }
  .top-bar { flex-direction: column; align-items: flex-start; }
  .list-header,
  .list-row {
    grid-template-columns: 2fr 1fr 0.7fr 28px;
  }
}

/* ── Comprobante ─────────────────────────────────────────── */
.btn-factura-pro {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  padding: 7px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background .15s;
  white-space: nowrap;
}
.btn-factura-pro:hover { background: #dbeafe; }

/* ── Calificar cliente ───────────────────────────────────── */
.btn-rate-client {
  background: #fefce8;
  color: #92400e;
  border: 1px solid #fde68a;
  padding: 7px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background .15s;
  white-space: nowrap;
}
.btn-rate-client:hover { background: #fef9c3; }

.rated-badge {
  font-size: 11px;
  font-weight: 700;
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #86efac;
  padding: 5px 10px;
  border-radius: 8px;
  white-space: nowrap;
}

/* ── Overlay centrado (para rating) ─────────────────────── */
.modal-center {
  align-items: center !important;
}

/* Header dentro del modal de calificación */
.modal-rating .modal-ev-header {
  padding: 22px 24px 16px;
  border-bottom: 1.5px solid #f1f5f9;
  margin-bottom: 0;
}
.modal-rating .modal-ev-header h3 { font-size: 18px; }
.modal-rating .modal-ev-header p  { font-size: 13px; }

/* ── Modal calificación ─────────────────────────────────── */
.modal-rating {
  background: white;
  width: 90%;
  max-width: 460px;
  border-radius: 24px;
  padding: 0;
  box-shadow: 0 24px 60px rgba(0,0,0,.2);
  animation: scaleIn 0.22s cubic-bezier(0.34, 1.4, 0.64, 1);
}

@keyframes scaleIn {
  from { transform: scale(0.88); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}

.rating-body {
  padding: 20px 28px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.stars-row {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.star-btn {
  font-size: 44px;
  background: none;
  border: none;
  color: #e2e8f0;
  cursor: pointer;
  padding: 0;
  transition: color .15s, transform .12s;
  line-height: 1;
}
.star-btn.filled { color: #f59e0b; }
.star-btn:hover  { transform: scale(1.2); color: #fbbf24; }

.stars-label {
  font-size: 14px;
  font-weight: 700;
  color: #f59e0b;
  min-height: 20px;
  margin: 0;
  text-align: center;
}

.rating-comment {
  width: 100%;
  padding: 11px 14px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  font-size: 14px;
  font-family: inherit;
  color: #0f172a;
  resize: none;
  outline: none;
  box-sizing: border-box;
  transition: border-color .15s;
}
.rating-comment:focus { border-color: #f59e0b; }

.btn-submit-rating {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #d97706, #f59e0b);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.2px;
  transition: opacity .15s, transform .15s;
}
.btn-submit-rating:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
.btn-submit-rating:disabled { opacity: .45; cursor: not-allowed; }
.btn-submit-rating:hover:not(:disabled) { transform: translateY(-1px); }
.btn-submit-rating:disabled { opacity: .5; cursor: not-allowed; }
</style>
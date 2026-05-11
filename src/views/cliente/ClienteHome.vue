<template>
  <div class="client-home">

    <!-- ======================== -->
    <!-- HERO GREETING            -->
    <!-- ======================== -->
    <div class="hero-greeting">
      <div class="hero-left">
        <p class="hero-eyebrow">Hola de nuevo 👋</p>
        <h1 class="hero-title">¿Qué necesitas<br><span class="hero-accent">hoy?</span></h1>
        <p class="hero-sub">Selecciona una categoría y encuentra al profesional ideal</p>
      </div>
      <div class="hero-right">
        <div class="hero-stat">
          <span class="stat-num">{{ categories.length }}</span>
          <span class="stat-label">Categorías</span>
        </div>
        <div class="hero-stat">
          <span class="stat-num">{{ allServices.length }}</span>
          <span class="stat-label">Servicios</span>
        </div>
      </div>
    </div>

    <!-- ======================== -->
    <!-- CATEGORÍAS GRID          -->
    <!-- ======================== -->
    <div class="section-header">
      <div class="section-title-row">
        <button v-if="navLevel > 0" class="nav-back-btn" @click="navGoBack">‹ Volver</button>
        <h2 class="section-title">Categorías</h2>
      </div>
      <span class="section-count">{{ categories.length }} disponibles</span>
    </div>

    <div v-if="loadingCats" class="skeleton-grid">
      <div v-for="n in 6" :key="n" class="skeleton-cat"></div>
    </div>

    <!-- NIVEL 0: Grupos principales -->
    <div v-else-if="navLevel === 0" class="categories-grid nav-2col">
      <button
        v-for="grp in mainGroups"
        :key="grp.id"
        class="category-card"
        :class="[grp.colorClass, { 'nav-disabled': grp.comingSoon }]"
        @click="selectMainGroup(grp)"
      >
        <div class="cat-icon-wrap">
          <span class="cat-emoji">{{ grp.icon }}</span>
        </div>
        <div class="cat-text">
          <span class="cat-name">{{ grp.name }}</span>
          <span v-if="grp.comingSoon" class="cat-soon">Próximamente disponible</span>
        </div>
        <div class="cat-arrow" :style="grp.comingSoon ? 'opacity:0.35' : ''">→</div>
      </button>
    </div>

    <!-- NIVEL 1: Sub-grupos -->
    <div v-else-if="navLevel === 1" class="categories-grid nav-2col">
      <button
        v-for="sub in currentSubGroups"
        :key="sub.id"
        class="category-card"
        :class="[sub.colorClass, { 'nav-disabled': !sub.hasCategories }]"
        @click="selectSubGroup(sub)"
      >
        <div class="cat-icon-wrap">
          <span class="cat-emoji">{{ sub.icon }}</span>
        </div>
        <div class="cat-text">
          <span class="cat-brand">{{ sub.brand }}</span>
          <span class="cat-name">{{ sub.name }}</span>
          <span v-if="!sub.hasCategories" class="cat-soon">Próximamente disponible</span>
        </div>
        <div class="cat-arrow" :style="!sub.hasCategories ? 'opacity:0.35' : ''">→</div>
      </button>
    </div>

    <!-- NIVEL 2: Grilla real de categorías -->
    <div v-else class="categories-grid">
      <button v-for="cat in categories" :key="cat.id" class="category-card" @click="openCategoryModal(cat)">
        <div class="cat-icon-wrap">
          <span class="cat-emoji">{{ catEmoji(cat.name) }}</span>
        </div>
        <div class="cat-text">
          <span class="cat-name">{{ cat.name }}</span>
          <span class="cat-count">{{ serviceCountFor(cat.id) }} servicios</span>
        </div>
        <div class="cat-arrow">→</div>
      </button>
    </div>

    <!-- ======================== -->
    <!-- MODAL: SERVICIOS         -->
    <!-- ======================== -->
    <Transition name="modal-fade">
      <div v-if="showServicesModal" class="modal-overlay">
        <div class="modal-sheet modal-services">

          <div class="modal-drag-bar"></div>

          <div class="modal-services-header">
            <div class="modal-cat-badge">
              <span>{{ catEmoji(selectedCategory?.name) }}</span>
            </div>
            <div>
              <h3 class="modal-title">{{ selectedCategory?.name }}</h3>
              <p class="modal-subtitle">{{ filteredServices.length }} servicios disponibles</p>
            </div>
            <button class="btn-close-modal" @click="showServicesModal = false">✕</button>
          </div>

          <div class="services-list">
            <div v-for="service in filteredServices" :key="service.id" class="service-item"
              @click="openRequestModal(service)">
              <div class="service-item-left">
                <div class="service-item-icon">⚡</div>
                <div>
                  <p class="service-item-name">{{ service.name }}</p>
                  <p class="service-item-desc">{{ service.description || 'Servicio profesional disponible' }}</p>
                </div>
              </div>
              <div class="service-item-right">
                <span class="service-item-price">${{ formatCOP(service.price) }}</span>
                <span class="service-item-arrow">›</span>
              </div>
            </div>

            <div v-if="filteredServices.length === 0" class="empty-services">
              <span>😕</span>
              <p>Sin servicios en esta categoría</p>
            </div>
          </div>

        </div>
      </div>
    </Transition>

    <!-- ======================== -->
    <!-- MODAL: FORMULARIO        -->
    <!-- ======================== -->
    <Transition name="modal-fade">
      <div v-if="showRequestModal" class="modal-overlay">
        <div class="modal-sheet modal-request">

          <div class="modal-drag-bar"></div>

          <!-- Header -->
          <div class="modal-request-header">
            <button class="btn-back" @click="backToServices">← Volver</button>
            <div class="modal-request-title-wrap">
              <h3 class="modal-title">{{ selectedService?.name }}</h3>
              <span class="modal-price-tag">${{ formatCOP(totalPrice) }}</span>
            </div>
            <button class="btn-close-modal" @click="closeRequestModal">✕</button>
          </div>

          <!-- Steps indicator -->
          <div class="steps-bar">
            <div v-for="(step, i) in visibleSteps" :key="i" class="step-dot"
              :class="{ active: currentStep >= i, done: currentStep > i }"></div>
          </div>
          <p class="step-label">Paso {{ currentStep + 1 }} de {{ visibleSteps.length }}: {{ visibleSteps[currentStep] }}</p>

          <!-- Virtual badge -->
          <div v-if="isVirtual" class="virtual-badge">
            💻 Servicio virtual: Sin desplazamiento requerido.
          </div>

          <!-- ---- STEP: Descripción ---- -->
          <div v-if="currentStepName === 'Descripción'" class="step-body">           
            <p class="field-hint" style="margin-top:-6px;margin-bottom:8px;color:#64748b;font-size:13px;">Descripción del servicio que necesitas</p>
            <textarea v-model="form.description" class="field-textarea" rows="4"></textarea>

            <div v-if="isCapacitacion" class="people-field">
              <label class="field-label">👥 Número de personas</label>
              <div class="number-stepper">
                <button class="stepper-btn" @click="form.people_count = Math.max(1, form.people_count - 1)">−</button>
                <span class="stepper-val">{{ form.people_count }}</span>
                <button class="stepper-btn" @click="form.people_count++">+</button>
              </div>
              <p class="field-hint">El costo se multiplica por cantidad de personas</p>
            </div>

            <div v-if="isCapacitacion" class="people-names">
              <label class="field-label">🧑‍🤝‍🧑 Participantes</label>

              <div class="people-container">
                <div v-for="(name, index) in form.people_names" :key="index" class="person-card">
                  <span class="person-index">#{{ index + 1 }}</span>

                  <input v-model="form.people_names[index]" class="person-input-field"
                    :placeholder="`Nombre del participante ${index + 1}`" />

                  <input v-model="form.people_identifications[index]" class="person-input-field"
                    inputmode="numeric"
                    placeholder="Número de identificación" />
                </div>
              </div>
            </div>
          </div>

          <!-- ---- STEP: Empresa ---- -->
          <div v-if="currentStepName === 'Empresa'" class="step-body">
            <label class="field-label">🏢 Empresa / establecimiento</label>
            <input v-model="form.company_name" class="field-input" placeholder="Nombre de la empresa o establecimiento" />

            <label class="field-label">📍 Dirección de la empresa</label>
            <input v-model="form.company_address" class="field-input" placeholder="Dirección" />

            <label class="field-label">👤 Propietarios/as</label>
            <input v-model="form.company_owners" class="field-input" placeholder="Nombre del propietario o representante" />

            <label class="field-label">🪪 Nit / No. Cédula</label>
            <input v-model="form.company_nit" class="field-input" placeholder="Nit o número de cédula" />

            <label class="field-label">📱 Celular</label>
            <input v-model="form.company_phone" class="field-input" placeholder="Número de celular" type="tel" />

            <label class="field-label">🌆 Ciudad</label>
            <select v-model="form.city_id" class="field-select">
              <option value="" disabled>Selecciona una ciudad</option>
              <option v-for="city in cities" :key="city.id" :value="city.id">
                {{ city.name }} — {{ city.department }}
              </option>
            </select>
          </div>

          <!-- ---- STEP: Ubicación ---- -->
          <div v-if="currentStepName === 'Ubicación'" class="step-body step-body-map">
            <label class="field-label-big">📍 Ubicación para el servicio</label>

            <!-- Buscador con autocompletado -->
            <div class="map-search-wrap">
              <div class="map-search-row">
                <input
                  v-model="mapSearch"
                  class="field-input"
                  placeholder="Busca tu dirección, ej: Calle 68 Bogotá"
                  autocomplete="off"
                  @input="onMapSearchInput"
                  @keyup.enter="searchMapAddress"
                  @keydown.escape="mapSuggestions = []"
                  @blur="onSearchBlur"
                  @focus="mapSearch && mapSuggestions.length && (showSuggestions = true)"
                />
                <button class="btn-map-search" :disabled="mapSearching" @click="searchMapAddress">
                  <svg v-if="!mapSearching" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <span v-else class="spin-sm">⟳</span>
                </button>
              </div>

              <!-- Dropdown de sugerencias -->
              <div v-if="showSuggestions && mapSuggestions.length" class="suggestions-dropdown">
                <div
                  v-for="(s, i) in mapSuggestions"
                  :key="i"
                  class="suggestion-item"
                  @mousedown.prevent="selectSuggestion(s)"
                >
                  <svg class="sug-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div class="sug-text">
                    <span class="sug-main">{{ s.main }}</span>
                    <span class="sug-secondary">{{ s.secondary }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mapa -->
            <div ref="mapPickerRef" class="map-picker"></div>

            <label class="field-label">🗺️ Referencia adicional</label>
            <input v-model="form.reference" class="field-input" placeholder="Ej: frente al parque, edificio azul" />

            <label class="field-label">🏙️ Ciudad</label>
            <select v-model="form.city_id" class="field-select">
              <option value="" disabled>Selecciona una ciudad</option>
              <option v-for="city in cities" :key="city.id" :value="city.id">
                {{ city.name }} — {{ city.department }}
              </option>
            </select>
          </div>

          <!-- ---- STEP: Fecha y hora ---- -->
          <div v-if="currentStepName === 'Fecha y hora'" class="step-body">
            <label class="field-label">📅 Fecha del servicio</label>
            <input type="date" v-model="form.service_date" class="field-input" :min="minDate" />

            <label class="field-label">⏰ Hora preferida</label>
            <div class="time-picker-row">
              <select v-model="timeHour" class="field-select time-select">
                <option value="" disabled>HH</option>
                <option v-for="h in timeHours" :key="h" :value="h">
                  {{ String(h).padStart(2,'0') }}{{ h < 12 ? ' am' : h === 12 ? ' m' : ` pm` }}
                </option>
              </select>
              <span class="time-sep">:</span>
              <select v-model="timeMinute" class="field-select time-select">
                <option value="" disabled>MM</option>
                <option v-for="m in timeMinutes" :key="m" :value="m">{{ String(m).padStart(2,'0') }}</option>
              </select>
            </div>
            <p class="field-hint">Horario disponible: 6:00 am – 9:00 pm</p>
          </div>

          <!-- ---- STEP: Confirmar ---- -->
          <div v-if="currentStepName === 'Confirmar'" class="step-body">
            <div class="summary-card">
              <div class="summary-row">
                <span>Servicio</span>
                <strong>{{ selectedService?.name }}</strong>
              </div>
              <div class="summary-row">
                <span>Descripción</span>
                <strong>{{ form.description || '—' }}</strong>
              </div>
              <div class="summary-row">
                <span>Modalidad</span>
                <strong>{{ isVirtual ? '💻 Virtual (en línea)' : (form.address || '—') }}</strong>
              </div>
              <div v-if="showEmpresaStep && form.company_name" class="summary-row">
                <span>Empresa</span>
                <strong>{{ form.company_name }}</strong>
              </div>
              <div class="summary-row">
                <span>Fecha</span>
                <strong>{{ form.service_date || '—' }} {{ form.service_time || '' }}</strong>
              </div>
              <div v-if="isCapacitacion" class="summary-row">
                <span>Personas</span>
                <strong>{{ form.people_count }}</strong>
              </div>
              <div class="summary-divider"></div>
              <div v-if="isCapacitacion && form.people_count > 1" class="summary-row price-breakdown">
                <span>Cálculo</span>
                <strong>${{ formatCOP(selectedService?.price) }} × {{ form.people_count }} personas</strong>
              </div>
              <div class="summary-row total-row">
                <span>Total a pagar</span>
                <strong class="total-amount">${{ formatCOP(totalPrice) }}</strong>
              </div>
            </div>

            <p v-if="budgetError" class="error-msg">
              ⚠️ El presupuesto mínimo es ${{ formatCOP(selectedService?.price) }}
            </p>
          </div>

          <!-- Footer navegación -->
          <div class="modal-request-footer">
            <button v-if="currentStep > 0" class="btn-prev" @click="currentStep--">
              ← Anterior
            </button>

            <button v-if="currentStep < visibleSteps.length - 1" class="btn-next" :disabled="!stepValid"
              @click="currentStep++">
              Siguiente →
            </button>

            <button v-if="currentStep === visibleSteps.length - 1" class="btn-send" :disabled="budgetError || sending"
              @click="sendRequest">
              <span v-if="sending" class="spinner"></span>
              {{ sending ? 'Enviando…' : '🚀 Enviar solicitud' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>

    <!-- ======================== -->
    <!-- MODAL: ÉXITO             -->
    <!-- ======================== -->
    <Transition name="modal-fade">
      <div v-if="showSuccessModal" class="modal-overlay">
        <div class="modal-success">
          <div class="success-icon-wrap">
            <div class="success-icon">✓</div>
          </div>
          <h3 class="success-title">¡Solicitud enviada!</h3>
          <p class="success-sub">
            Estamos buscando al profesional ideal para ti. Te notificaremos cuando alguien acepte.
          </p>
          <div class="success-detail">
            <span>{{ successService }}</span>
            <strong>${{ formatCOP(successPrice) }}</strong>
          </div>
          <button class="btn-success-close" @click="showSuccessModal = false">
            Entendido 👍
          </button>
        </div>
      </div>
    </Transition>

    <!-- ======================== -->
    <!-- MODAL: PAGO WOMPI        -->
    <!-- ======================== -->
    <Transition name="modal-fade">
      <div v-if="showPaymentModal" class="modal-overlay">
        <div class="modal-payment">
          <div class="payment-icon-wrap">
            <span class="payment-icon">💳</span>
          </div>
          <h3 class="payment-title">¡Solicitud registrada!</h3>
          <p class="payment-sub">Para activarla, completa el pago de forma segura con Wompi.</p>

          <div class="payment-summary">
            <div class="payment-row">
              <span>Servicio</span>
              <strong>{{ pendingPayment?.service_name }}</strong>
            </div>
            <div class="payment-row total">
              <span>Total a pagar</span>
              <strong class="payment-amount">{{ pendingPayment?.amount_formatted }}</strong>
            </div>
          </div>

          <div class="payment-security">
            <span class="security-badge">🔒 Pago seguro con Wompi</span>
            <small>Bancolombia · Nequi · Tarjeta débito/crédito · PSE</small>
          </div>

          <button class="btn-pay" :disabled="redirectingPay" @click="goToWompiCheckout">
            <span v-if="redirectingPay">Cargando…</span>
            <span v-else>Pagar ahora →</span>
          </button>
          <button class="btn-pay-cancel" @click="showPaymentModal = false">
            Cancelar
          </button>
        </div>
      </div>
    </Transition>

    <!-- ======================== -->
    <!-- MODAL: RESULTADO PAGO    -->
    <!-- ======================== -->
    <Transition name="modal-fade">
      <div v-if="showPaymentResultModal" class="modal-overlay">
        <div class="modal-payment">
          <!-- APROBADO -->
          <template v-if="paymentResult === 'success'">
            <div class="payment-icon-wrap success">
              <span class="payment-icon">✅</span>
            </div>
            <h3 class="payment-title">¡Pago exitoso!</h3>
            <p class="payment-sub">Tu solicitud está activa. Buscaremos el profesional ideal.</p>
            <button class="btn-pay" @click="closePaymentResult">
              Ver categorías
            </button>
          </template>

          <!-- PENDIENTE -->
          <template v-else-if="paymentResult === 'pending'">
            <div class="payment-icon-wrap pending">
              <span class="payment-icon">⏳</span>
            </div>
            <h3 class="payment-title">Pago en proceso</h3>
            <p class="payment-sub">Wompi está procesando tu pago. Te notificaremos cuando se confirme.</p>
            <button class="btn-pay" @click="closePaymentResult">
              Entendido
            </button>
          </template>

          <!-- FALLIDO -->
          <template v-else>
            <div class="payment-icon-wrap failed">
              <span class="payment-icon">❌</span>
            </div>
            <h3 class="payment-title">Pago no completado</h3>
            <p class="payment-sub">No pudimos procesar el pago. Intenta de nuevo o usa otro método.</p>
            <button class="btn-pay" @click="closePaymentResult">
              Volver
            </button>
          </template>
        </div>
      </div>
    </Transition>

    <!-- TOAST -->
    <Transition name="toast">
      <div v-if="toast.visible" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import categoryService from '@/services/categoryService'

const route  = useRoute()
const router = useRouter()

/* ======================== */
/* STATE                    */
/* ======================== */
const categories = ref([])
const allServices = ref([])
const cities = ref([])
const loadingCats = ref(true)

const selectedCategory = ref(null)
const selectedService = ref(null)

const showServicesModal = ref(false)
const showRequestModal = ref(false)
const showSuccessModal  = ref(false)
const successPrice      = ref(0)
const successService    = ref('')

const currentStep = ref(0)
const sending = ref(false)


const form = ref({
  description: '',
  address: '',
  reference: '',
  lat: null,
  lng: null,
  city_id: '',
  service_date: '',
  service_time: '',
  budget: '',
  people_count: 1,
  people_names: [''],
  people_identifications: [''],
  company_name: '',
  company_address: '',
  company_owners: '',
  company_nit: '',
  company_phone: '',
})

watch(() => form.value.people_count, (newVal) => {
  const currentLength = form.value.people_names.length
  if (newVal > currentLength) {
    for (let i = currentLength; i < newVal; i++) {
      form.value.people_names.push('')
      form.value.people_identifications.push('')
    }
  } else if (newVal < currentLength) {
    form.value.people_names.splice(newVal)
    form.value.people_identifications.splice(newVal)
  }
}, { immediate: true })

const toast = ref({ visible: false, message: '', type: '' })
let toastTimer = null

/* ======================== */
/* MAP PICKER               */
/* ======================== */
const mapPickerRef    = ref(null)
const mapSearch       = ref('')
const mapSearching    = ref(false)
const mapSuggestions  = ref([])
const showSuggestions = ref(false)
let   pickerMap       = null
let   pickerMarker    = null
let   searchDebounce  = null

const DEFAULT_LAT    = 4.7110
const DEFAULT_LNG    = -74.0721

const initPickerMap = async () => {
  await nextTick()
  if (!mapPickerRef.value || pickerMap) return

  const L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')

  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl : new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl       : new URL('leaflet/dist/images/marker-icon.png',    import.meta.url).href,
    shadowUrl     : new URL('leaflet/dist/images/marker-shadow.png',  import.meta.url).href,
  })

  const startLat = form.value.lat ?? DEFAULT_LAT
  const startLng = form.value.lng ?? DEFAULT_LNG

  pickerMap = L.map(mapPickerRef.value, { zoomControl: true }).setView([startLat, startLng], 14)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(pickerMap)

  pickerMarker = L.marker([startLat, startLng], { draggable: true }).addTo(pickerMap)
  pickerMarker.bindPopup('Arrastra para ajustar la ubicación').openPopup()

  pickerMarker.on('dragend', async () => {
    const { lat, lng } = pickerMarker.getLatLng()
    form.value.lat = lat
    form.value.lng = lng
    await reverseGeocode(lat, lng)
  })

  pickerMap.on('click', async (e) => {
    const { lat, lng } = e.latlng
    pickerMarker.setLatLng([lat, lng])
    form.value.lat = lat
    form.value.lng = lng
    await reverseGeocode(lat, lng)
  })
}

const geocodeProxy = (params) => {
  const qs = new URLSearchParams(params).toString()
  return api.get(`/geocode?${qs}`).then(r => r.data).catch(() => null)
}

const reverseGeocode = async (lat, lng) => {
  const data = await geocodeProxy({ type: 'reverse', lat, lng })
  if (data?.display_name) {
    const a = data.address ?? {}
    const parts = [
      a.house_number ? `${a.road ?? ''} # ${a.house_number}` : (a.road ?? ''),
      a.suburb || a.neighbourhood || '',
      a.city || a.town || a.village || '',
    ].filter(Boolean)
    form.value.address = parts.length ? parts.join(', ') : data.display_name
  }
}

/* Devuelve el query tal como lo escribió el usuario — el backend agrega Colombia */
const buildSearchQuery = (q) => q.trim()

const buildSuggestionLabel = (r) => {
  const a         = r.address ?? {}
  const main      = a.road || r.display_name.split(',')[0] || ''
  const secondary = [a.suburb, a.city].filter(Boolean).join(', ')
  return { main, secondary }
}

const onMapSearchInput = () => {
  clearTimeout(searchDebounce)
  const q = mapSearch.value.trim()
  if (q.length < 3) { mapSuggestions.value = []; showSuggestions.value = false; return }
  searchDebounce = setTimeout(() => fetchSuggestions(q), 400)
}

const fetchSuggestions = async (q) => {
  try {
    const data = await geocodeProxy({ type: 'search', q: buildSearchQuery(q), limit: 6 }) ?? []
    mapSuggestions.value  = data.map(r => ({ ...buildSuggestionLabel(r), lat: parseFloat(r.lat), lng: parseFloat(r.lon), full: r.display_name }))
    showSuggestions.value = mapSuggestions.value.length > 0
  } catch { /* ignore */ }
}

const selectSuggestion = (s) => {
  mapSearch.value       = [s.main, s.secondary].filter(Boolean).join(', ')
  form.value.address    = s.main + (s.secondary ? ', ' + s.secondary : '')
  form.value.lat        = s.lat
  form.value.lng        = s.lng
  mapSuggestions.value  = []
  showSuggestions.value = false
  if (pickerMarker && pickerMap) {
    pickerMarker.setLatLng([s.lat, s.lng])
    pickerMap.setView([s.lat, s.lng], 17)
  }
}

const searchMapAddress = async () => {
  if (!mapSearch.value.trim()) return
  mapSuggestions.value  = []
  showSuggestions.value = false
  mapSearching.value    = true
  try {
    const data = await geocodeProxy({ type: 'search', q: buildSearchQuery(mapSearch.value), limit: 1 })
    if (data?.length) {
      const r    = data[0]
      const latN = parseFloat(r.lat)
      const lngN = parseFloat(r.lon)
      const { main, secondary } = buildSuggestionLabel(r)
      pickerMarker.setLatLng([latN, lngN])
      pickerMap.setView([latN, lngN], 17)
      form.value.lat     = latN
      form.value.lng     = lngN
      form.value.address = [main, secondary].filter(Boolean).join(', ')
    } else {
      showToast('No se encontró. Prueba con más detalle o arrastra el pin.', 'error')
    }
  } catch {
    showToast('Error al buscar la dirección', 'error')
  } finally {
    mapSearching.value = false
  }
}

const onSearchBlur = () => {
  setTimeout(() => { showSuggestions.value = false }, 150)
}

const destroyPickerMap = () => {
  if (pickerMap) { pickerMap.remove(); pickerMap = null; pickerMarker = null }
  mapSuggestions.value  = []
  showSuggestions.value = false
}

/* ======================== */
/* COMPUTED                 */
/* ======================== */
const filteredServices = computed(() =>
  selectedCategory.value
    ? allServices.value.filter(s => s.category_id === selectedCategory.value.id)
    : []
)

const totalPrice = computed(() => {
  if (!selectedService.value) return 0
  const people = parseInt(form.value.people_count || 1)
  const price = parseFloat(selectedService.value.price || 0)
  return people * price
})

const budgetError = computed(() => {
  if (!form.value.budget) return false
  return parseFloat(form.value.budget) < parseFloat(selectedService.value?.price || 0)
})

const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

/* Time picker 6am–9pm */
const timeHours   = Array.from({ length: 16 }, (_, i) => i + 6)  // 6..21
const timeMinutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

const timeHour = computed({
  get: () => {
    if (!form.value.service_time) return ''
    return parseInt(form.value.service_time.split(':')[0], 10)
  },
  set: (h) => {
    const m = form.value.service_time ? form.value.service_time.split(':')[1] : '00'
    form.value.service_time = `${String(h).padStart(2,'0')}:${m}`
  },
})

const timeMinute = computed({
  get: () => {
    if (!form.value.service_time) return ''
    return parseInt(form.value.service_time.split(':')[1], 10)
  },
  set: (m) => {
    const h = form.value.service_time ? form.value.service_time.split(':')[0] : '06'
    form.value.service_time = `${h}:${String(m).padStart(2,'0')}`
  },
})

const isVirtual = computed(() =>
  selectedService.value?.name?.toLowerCase().includes('virtual') ?? false
)

const isCapacitacion = computed(() => {
  const name = selectedCategory.value?.name?.toLowerCase() ?? ''
  return name.includes('capacit')
})

const showEmpresaStep = computed(() =>
  isVirtual.value || isCapacitacion.value
)

watch(isVirtual, (val) => {
  currentStep.value = 0
  if (val) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    form.value.service_date = tomorrow.toISOString().split('T')[0]
    form.value.service_time = '09:00'
  }
})

const visibleSteps = computed(() => {
  const steps = ['Descripción']
  if (showEmpresaStep.value) steps.push('Empresa')
  if (!isVirtual.value) {
    steps.push('Ubicación')
    steps.push('Fecha y hora')
  }
  steps.push('Confirmar')
  return steps
})

const currentStepName = computed(() => visibleSteps.value[currentStep.value] ?? '')

const stepValid = computed(() => {
  const name = currentStepName.value
  if (name === 'Ubicación')    return !!(form.value.address.trim() && form.value.city_id)
  if (name === 'Fecha y hora') {
    if (!form.value.service_date || !form.value.service_time) return false
    const [h, m] = form.value.service_time.split(':').map(Number)
    const totalMin = h * 60 + m
    return totalMin >= 6 * 60 && totalMin <= 21 * 60
  }
  if (name === 'Empresa')      return !!(form.value.company_name.trim() && form.value.company_nit.trim())
  if (name === 'Descripción') {
    if (isCapacitacion.value) {
      return form.value.people_names.every(n => n.trim().length > 0)
        && form.value.people_identifications.every(id => id.trim().length > 0)
    }
    return true
  }
  return true
})

/* ======================== */
/* UTILS                    */
/* ======================== */
const formatCOP = (val) =>
  Number(val || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const catEmoji = (name = '') => {
  const map = {
    'electricidad': '⚡', 'electric': '⚡',
    'plomería': '🔧', 'plomeria': '🔧', 'plom': '🔧',
    'limpieza': '🧹', 'clean': '🧹',
    'jardinería': '🌿', 'jardin': '🌿',
    'pintura': '🎨', 'paint': '🎨',
    'carpintería': '🪚', 'carpint': '🪚',
    'capacitación': '📚', 'capacitacion': '📚',
    'seguridad': '🔒',
    'mudanza': '📦',
    'tecnología': '💻', 'tecnologia': '💻',
  }
  const lower = name.toLowerCase()
  for (const key in map) {
    if (lower.includes(key)) return map[key]
  }
  return '🛠️'
}

const serviceCountFor = (catId) =>
  allServices.value.filter(s => s.category_id === catId).length

const showToast = (message, type = '') => {
  clearTimeout(toastTimer)
  toast.value = { visible: true, message, type }
  toastTimer = setTimeout(() => { toast.value.visible = false }, 3000)
}

const resetForm = () => {
  form.value = {
    description: '',
    address: '',
    reference: '',
    lat: null,
    lng: null,
    city_id: '',
    service_date: '',
    service_time: '',
    budget: '',
    people_count: 1,
    people_names: [''],
    people_identifications: [''],
    company_name: '',
    company_address: '',
    company_owners: '',
    company_nit: '',
    company_phone: '',
  }
  currentStep.value = 0
  destroyPickerMap()
}

/* ======================== */
/* NAVEGACIÓN POR NIVELES   */
/* ======================== */
const navLevel = ref(0)
const selectedMainGroup = ref(null)

const mainGroups = [
  {
    id: 'empresariales',
    name: 'SERVICIO EMPRESARIALES',
    icon: '🏢',
    colorClass: 'nav-blue',
    hasSubGroups: true,
  },
  {
    id: 'domesticos',
    name: 'SERVICIO DOMÉSTICOS',
    icon: '🔧',
    colorClass: 'nav-green',
    hasSubGroups: false,
    comingSoon: true,
  },
]

const navSubGroups = {
  empresariales: [
    {
      id: 'empresas_alimentos',
      brand: 'Ase Calidad:',
      name: 'Servicios de asesoría en documentación en empresas y alimentos',
      icon: '📋',
      colorClass: 'nav-purple',
      hasCategories: true,
    },
    {
      id: 'establecimientos',
      brand: 'Ase Calidad',
      name: 'Servicios de asesoría en documentación y normativas de establecimientos de comercio',
      icon: '🏪',
      colorClass: 'nav-pink',
      hasCategories: false,
    },
  ],
}

const currentSubGroups = computed(() =>
  selectedMainGroup.value ? (navSubGroups[selectedMainGroup.value.id] ?? []) : []
)

const selectMainGroup = (grp) => {
  if (grp.comingSoon) return
  selectedMainGroup.value = grp
  navLevel.value = grp.hasSubGroups ? 1 : 2
}

const selectSubGroup = (sub) => {
  if (!sub.hasCategories) return
  navLevel.value = 2
}

const navGoBack = () => {
  if (navLevel.value === 2) {
    navLevel.value = selectedMainGroup.value?.hasSubGroups ? 1 : 0
    if (!selectedMainGroup.value?.hasSubGroups) selectedMainGroup.value = null
  } else if (navLevel.value === 1) {
    navLevel.value = 0
    selectedMainGroup.value = null
  }
}

/* ======================== */
/* MODALS                   */
/* ======================== */
const openCategoryModal = (cat) => {
  selectedCategory.value = cat
  showServicesModal.value = true
}

const openRequestModal = (service) => {
  selectedService.value = service
  form.value.budget = service.price
  showServicesModal.value = false
  showRequestModal.value = true
  currentStep.value = 0
}

const backToServices = () => {
  showRequestModal.value = false
  showServicesModal.value = true
}

const closeRequestModal = () => {
  showRequestModal.value = false
  resetForm()
}

/* ======================== */
/* LOADERS                  */
/* ======================== */
const loadCategories = async () => {
  try {
    const res = await categoryService.getAllProfesional()
    categories.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loadingCats.value = false
  }
}

const loadServices = async () => {
  try {
    const res = await api.get('/services')
    allServices.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const loadCities = async () => {
  try {
    const res = await api.get('/cities')
    cities.value = res.data
  } catch (e) {
    console.error(e)
  }
}

/* ======================== */
/* SEND                     */
/* ======================== */
const sendRequest = async () => {

  if (!isVirtual.value && !form.value.city_id) {
    showToast('Selecciona una ciudad', 'error'); return
  }
  if (budgetError.value) {
    showToast(`Presupuesto mínimo: $${formatCOP(selectedService.value.price)}`, 'error'); return
  }

  try {
    sending.value = true
    const { data } = await api.post('/client/service-request', {
      category_id: selectedCategory.value.id,
      service_id: selectedService.value.id,
      description: form.value.description,
      address: form.value.address || '',
      reference: form.value.reference,
      lat: form.value.lat,
      lng: form.value.lng,
      city_id: form.value.city_id || null,
      service_date: form.value.service_date,
      service_time: form.value.service_time,
      people_count: form.value.people_count,
      people_names: form.value.people_names,
      people_identifications: form.value.people_identifications,
      company_name: form.value.company_name,
      company_address: form.value.company_address,
      company_owners: form.value.company_owners,
      company_nit: form.value.company_nit,
      company_phone: form.value.company_phone,
      budget: totalPrice.value,
    })

    // Guardar datos para el modal de pago
    pendingPayment.value = {
      service_request_id: data.service_request_id,
      amount:             data.amount,
      amount_formatted:   data.amount_formatted,
      service_name:       selectedService.value?.name ?? '',
    }
    showRequestModal.value  = false
    showPaymentModal.value  = true
    resetForm()

  } catch (e) {
    console.error(e)
    const validationMessage = e.response?.data?.message
    showToast(validationMessage || 'Error al enviar la solicitud', 'error')
  } finally {
    sending.value = false
  }
}

/* ======================== */
/* PAGO WOMPI               */
/* ======================== */
const showPaymentModal  = ref(false)
const pendingPayment    = ref(null)
const redirectingPay    = ref(false)
const paymentResult     = ref(null)  // 'success' | 'pending' | 'failed' | null

const loadWompiWidget = () => {
  return new Promise((resolve) => {
    if (window.WidgetCheckout) { resolve(); return }
    const s = document.createElement('script')
    s.src = 'https://checkout.wompi.co/widget.js'
    s.onload = resolve
    document.head.appendChild(s)
  })
}

let _widgetTimeoutId = null
let _paymentHandled  = false   // evita que el timeout actúe tras un pago exitoso

const goToWompiCheckout = async () => {
  if (!pendingPayment.value) return
  try {
    redirectingPay.value = true
    const { data } = await api.post('/client/payment/init', {
      service_request_id: pendingPayment.value.service_request_id,
    })

    await loadWompiWidget()

    const checkout = new window.WidgetCheckout({
      currency:       'COP',
      amountInCents:  data.amount_in_cents,
      reference:      data.reference,
      publicKey:      data.public_key,
      signature:      { integrity: data.integrity },
    })

    redirectingPay.value   = false
    showPaymentModal.value = false
    _paymentHandled        = false

    // Timeout: si el iframe falla (403) y el widget nunca responde, restaurar modal de pago
    _widgetTimeoutId = setTimeout(() => {
      if (!_paymentHandled) {
        showPaymentModal.value = true
        showToast('El widget de pago no cargó. Intenta de nuevo.', 'error')
      }
    }, 12000)

    checkout.open(async function (result) {
      clearTimeout(_widgetTimeoutId)
      _paymentHandled = true

      const tx = result?.transaction ?? null
      if (!tx) {
        // Cerrado con la X sin pagar → volver al modal de pago
        showPaymentModal.value = true
        return
      }
      const status = tx.status ?? ''

      // Confirmar con el backend enviando la transacción del widget directamente
      // (evita depender del webhook en desarrollo)
      if (status === 'APPROVED' && data.reference) {
        try {
          await api.post('/client/payment/confirm', {
            reference:   data.reference,
            transaction: tx,   // objeto completo del widget → el backend lo procesa directamente
          })
        } catch (_) { /* silent */ }
      }

      paymentResult.value = status === 'APPROVED' ? 'success'
        : status === 'PENDING' ? 'pending' : 'failed'
      showPaymentResultModal.value = true
    })

  } catch (e) {
    console.error(e)
    clearTimeout(_widgetTimeoutId)
    _paymentHandled = true
    showToast('Error al iniciar el pago. Intenta de nuevo.', 'error')
    redirectingPay.value   = false
    showPaymentModal.value = true
  }
}

const checkPaymentReturn = () => {
  // Sin redirectUrl no hay redirect de Wompi; limpia cualquier param residual
  const params = new URLSearchParams(window.location.search)
  if (params.has('payment') || params.has('id')) {
    window.history.replaceState({}, '', window.location.pathname)
  }
}

const showPaymentResultModal = ref(false)

const closePaymentResult = () => {
  showPaymentResultModal.value = false
  showPaymentModal.value       = false
  pendingPayment.value         = null
  paymentResult.value          = null
  navLevel.value               = 0
  // Si el pago fue iniciado desde "Mis Solicitudes", volver allá para refrescar la lista
  if (_cameFromSolicitudes.value) {
    _cameFromSolicitudes.value = false
    router.push({ name: 'MisSolicitudes' })
  }
}

watch(currentStepName, (name, prev) => {
  if (name === 'Ubicación') {
    initPickerMap()
  } else if (prev === 'Ubicación') {
    destroyPickerMap()
  }
})

const _cameFromSolicitudes = ref(false)

const autoOpenPayment = async () => {
  const srId = route.query.pay
  if (!srId) return
  _cameFromSolicitudes.value = true
  window.history.replaceState({}, '', window.location.pathname)
  try {
    const { data } = await api.post('/client/payment/init', {
      service_request_id: Number(srId),
    })
    pendingPayment.value = {
      service_request_id: Number(srId),
      amount:             data.amount_in_cents / 100,
      amount_formatted:   '$' + Number(data.amount_in_cents / 100).toLocaleString('es-CO'),
      service_name:       data.service_name || 'Servicio',
    }
    showPaymentModal.value = true
  } catch (e) {
    showToast('No se pudo retomar el pago. Intenta desde la solicitud.', 'error')
  }
}

onMounted(() => {
  loadCategories()
  loadServices()
  loadCities()
  checkPaymentReturn()
  autoOpenPayment()
})

onUnmounted(() => {
  destroyPickerMap()
})
</script>

<style scoped>
/* ======================== */
/* BASE                     */
/* ======================== */
.client-home {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 40px;
  font-family: 'Outfit', -apple-system, sans-serif;
}

/* ======================== */
/* HERO                     */
/* ======================== */
.hero-greeting {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%);
  border-radius: 20px;
  padding: 28px 28px 24px;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-greeting::before {
  content: '';
  position: absolute;
  top: -30px;
  right: -30px;
  width: 160px;
  height: 160px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
}

.hero-greeting::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 40%;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
}

.hero-eyebrow {
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 6px;
  letter-spacing: 0.3px;
}

.hero-title {
  font-size: 32px;
  font-weight: 900;
  color: white;
  margin: 0 0 8px;
  line-height: 1.1;
  letter-spacing: -0.5px;
}

.hero-accent {
  color: #93c5fd;
}

.hero-sub {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.hero-right {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 12px 18px;
  backdrop-filter: blur(4px);
}

.stat-num {
  font-size: 28px;
  font-weight: 900;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.92);
  margin-top: 3px;
  font-weight: 700;
}

/* ======================== */
/* SECTION HEADER           */
/* ======================== */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.3px;
}

.section-count {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 20px;
}

/* ======================== */
/* SKELETON                 */
/* ======================== */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  align-items: start;
}

.skeleton-cat {
  height: 180px;
  border-radius: 20px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}


@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* ======================== */
/* CATEGORIES GRID          */
/* ======================== */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  align-items: stretch;
}

/* Grid de 2 columnas para niveles 0 y 1 */
.nav-2col {
  grid-template-columns: repeat(2, 1fr);
  max-width: 780px;
}

/* Botón volver */
.section-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}
.nav-back-btn:hover { background: #e2e8f0; color: #1e293b; }

/* Colores explícitos para tarjetas de navegación */
.nav-blue::before  { background: linear-gradient(90deg, #3b82f6, #2563eb) !important; }
.nav-green::before { background: linear-gradient(90deg, #10b981, #059669) !important; }
.nav-purple::before{ background: linear-gradient(90deg, #8b5cf6, #7c3aed) !important; }
.nav-pink::before  { background: linear-gradient(90deg, #ec4899, #db2777) !important; }

.nav-blue  .cat-icon-wrap { background: #eff6ff; }
.nav-green .cat-icon-wrap { background: #f0fdf4; }
.nav-purple.cat-icon-wrap,
.nav-purple .cat-icon-wrap { background: #f5f3ff; }
.nav-pink  .cat-icon-wrap { background: #fdf2f8; }

/* Sub-grupo: etiqueta de marca */
.cat-brand {
  display: block;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 3px;
}

/* Texto "Próximamente" */
.cat-soon {
  display: inline-block;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #f59e0b;
  background: #fffbeb;
  border-radius: 6px;
  padding: 2px 8px;
}

/* Tarjeta deshabilitada */
.nav-disabled {
  cursor: not-allowed;
  opacity: 0.75;
}
.nav-disabled:hover { transform: none !important; box-shadow: none !important; }

.category-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px 18px 20px;
  cursor: pointer;
  text-align: left;
  position: relative;
  transition: border-color 0.2s, box-shadow 0.25s, transform 0.2s;
  font-family: inherit;
  overflow: hidden;
  min-height: 185px;
}

/* Franja de color superior por posición */
.category-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  border-radius: 20px 20px 0 0;
}
.category-card:nth-child(1)::before { background: linear-gradient(90deg, #3b82f6, #2563eb); }
.category-card:nth-child(2)::before { background: linear-gradient(90deg, #f59e0b, #f97316); }
.category-card:nth-child(3)::before { background: linear-gradient(90deg, #10b981, #059669); }
.category-card:nth-child(4)::before { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }
.category-card:nth-child(5)::before { background: linear-gradient(90deg, #ec4899, #db2777); }

/* Círculo decorativo de fondo */
.category-card::after {
  content: '';
  position: absolute;
  bottom: -24px; right: -24px;
  width: 80px; height: 80px;
  border-radius: 50%;
  background: #f8fafc;
  transition: transform 0.3s;
}

.category-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,.1); }
.category-card:hover::after { transform: scale(1.4); }

/* Icon colors per position */
.category-card:nth-child(1) .cat-icon-wrap { background: #eff6ff; }
.category-card:nth-child(2) .cat-icon-wrap { background: #fffbeb; }
.category-card:nth-child(3) .cat-icon-wrap { background: #f0fdf4; }
.category-card:nth-child(4) .cat-icon-wrap { background: #f5f3ff; }
.category-card:nth-child(5) .cat-icon-wrap { background: #fdf2f8; }

.cat-icon-wrap {
  width: 52px;
  height: 52px;
  background: #eff6ff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  margin-bottom: 4px;
}

.cat-emoji {
  font-size: 26px;
}

.cat-text {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
  width: 100%;
}

.cat-name {
  display: block;
  font-size: 15px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.25;
  margin-bottom: 4px;
}

.cat-count {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
}

.cat-arrow {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 30px;
  height: 30px;
  background: #eff6ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #2563eb;
  transition: color 0.2s, background 0.2s, transform 0.2s;
  z-index: 1;
}

.category-card:hover .cat-arrow {
  background: #2563eb;
  color: white;
  transform: translateX(2px);
}

/* ======================== */
/* MODAL BASE               */
/* ======================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.modal-sheet {
  background: white;
  width: 100%;
  max-width: 520px;
  border-radius: 24px 24px 0 0;
  padding: 0 0 32px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-drag-bar {
  width: 40px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  margin: 12px auto 0;
}

.btn-close-modal {
  width: 32px;
  height: 32px;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
  color: #64748b;
  transition: background 0.15s;
}

.btn-close-modal:hover {
  background: #e2e8f0;
}

/* ======================== */
/* MODAL SERVICIOS          */
/* ======================== */
.modal-services-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-cat-badge {
  width: 46px;
  height: 46px;
  background: #eff6ff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.modal-title {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 2px;
}

.modal-subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.services-list {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.service-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
  gap: 14px;
}

.service-item:hover {
  border-color: #2563eb;
  background: #f8fbff;
  transform: translateX(2px);
}

.service-item-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.service-item-icon {
  width: 48px;
  height: 48px;
  background: #fef3c7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.service-item-name {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
}

.service-item-desc {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.service-item-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.service-item-price {
  font-size: 24px;
  font-weight: 900;
  color: #2563eb;
  background: #eff6ff;
  padding: 10px 20px;
  border-radius: 999px;
  line-height: 1.1;
  white-space: nowrap;
}

.service-item-arrow {
  font-size: 24px;
  color: #cbd5e1;
  font-weight: 300;
}

.empty-services {
  text-align: center;
  padding: 32px;
  color: #94a3b8;
}

.empty-services span {
  font-size: 28px;
}

.empty-services p {
  font-size: 13px;
  margin-top: 8px;
}

/* ======================== */
/* MODAL REQUEST            */
/* ======================== */
.modal-request {
  padding-bottom: 0;
}

.modal-request-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 18px 10px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-request-title-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.modal-price-tag {
  font-size: 19px;
  font-weight: 900;
  color: #2563eb;
  background: #eff6ff;
  padding: 8px 18px;
  border-radius: 999px;
  margin-top: 6px;
  line-height: 1.1;
  white-space: nowrap;
}

.btn-back {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  padding: 6px 0;
  font-family: inherit;
  white-space: nowrap;
}

/* Steps bar */
.steps-bar {
  display: flex;
  gap: 6px;
  padding: 14px 20px 0;
  justify-content: center;
}

.step-dot {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background: #e2e8f0;
  transition: background 0.3s;
}

.step-dot.active {
  background: #2563eb;
}

.step-dot.done {
  background: #93c5fd;
}

.step-label {
  text-align: center;
  font-size: 14px;
  font-weight: 800;
  color: #2563eb;
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

/* Step body */
.step-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 220px;
}

.step-body-map {
  min-height: unset;
  padding-bottom: 24px;
}

.map-search-wrap {
  position: relative;
}

.map-search-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.map-search-row .field-input {
  flex: 1;
}

.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 9999;
  overflow: hidden;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f1f5f9;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: #f8fafc;
}

.sug-icon {
  flex-shrink: 0;
  color: #64748b;
}

.sug-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.sug-main {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sug-secondary {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-map-search {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-map-search:hover { background: #1d4ed8; }
.btn-map-search:disabled { background: #93c5fd; cursor: not-allowed; }

.spin-sm {
  display: inline-block;
  animation: spin 0.7s linear infinite;
  font-size: 18px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.map-picker {
  width: 100%;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid #e2e8f0;
  z-index: 0;
}

.field-label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  display: block;
  margin-bottom: -6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.field-label-big {
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
  display: block;
  margin-bottom: -4px;
}

.field-input,
.field-select {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: #0f172a;
  background: white;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.field-input:focus,
.field-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.field-textarea {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: #0f172a;
  resize: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.field-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.time-picker-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-select {
  flex: 1;
}

.time-sep {
  font-size: 20px;
  font-weight: 700;
  color: #334155;
  line-height: 1;
  flex-shrink: 0;
}

.field-hint {
  font-size: 11px;
  color: #94a3b8;
  margin: -4px 0 0;
}

/* Stepper personas */
.people-field {
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.number-stepper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stepper-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: white;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  transition: background 0.15s, border-color 0.15s;
}

.stepper-btn:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

.stepper-val {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  min-width: 30px;
  text-align: center;
}

/* Summary */
.summary-card {
  background: #f8fafc;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 13px;
  gap: 12px;
}

.summary-row span {
  color: #64748b;
  flex-shrink: 0;
}

.summary-row strong {
  color: #0f172a;
  text-align: right;
  font-weight: 700;
}

.summary-divider {
  height: 1px;
  background: #e2e8f0;
}

.total-row span {
  font-weight: 700;
  color: #0f172a;
  font-size: 14px;
}

.price-breakdown strong {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.total-amount {
  font-size: 22px;
  font-weight: 900;
  color: #2563eb;
  letter-spacing: -0.5px;
}

.error-msg {
  font-size: 13px;
  color: #dc2626;
  font-weight: 600;
  background: #fef2f2;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #fecaca;
}

/* Modal footer */
.modal-request-footer {
  display: flex;
  gap: 8px;
  padding: 12px 20px 28px;
  border-top: 1px solid #f1f5f9;
  background: white;
  position: sticky;
  bottom: 0;
}

.btn-prev {
  flex: 1;
  padding: 12px;
  border: 1.5px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  font-family: inherit;
}

.btn-next {
  flex: 2;
  padding: 12px;
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}

.btn-next:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-send {
  flex: 2;
  padding: 13px;
  background: linear-gradient(135deg, #15803d, #16a34a);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.15s;
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ======================== */
/* MODAL ÉXITO              */
/* ======================== */
.modal-success {
  background: white;
  width: 90%;
  max-width: 340px;
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin: auto;
}

@keyframes scaleIn {
  from {
    transform: scale(0.85);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.success-icon-wrap {
  margin: 0 auto 16px;
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #15803d, #16a34a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  font-size: 32px;
  color: white;
  font-weight: 900;
}

.success-title {
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 8px;
}

.success-sub {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 18px;
}

.success-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 18px;
  font-size: 14px;
  color: #166534;
}

.success-detail strong {
  font-size: 18px;
  font-weight: 900;
}

.btn-success-close {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
}

/* ======================== */
/* MODAL OVERLAY CENTRADO   */
/* ======================== */
.modal-success~.modal-overlay,
.modal-overlay:has(.modal-success) {
  align-items: center;
}

/* ======================== */
/* TOAST                    */
/* ======================== */
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

.toast.error {
  background: #7f1d1d;
}

.toast.success {
  background: #14532d;
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

/* ======================== */
/* MODAL TRANSITIONS        */
/* ======================== */
.modal-fade-enter-active {
  transition: opacity 0.2s ease;
}

.modal-fade-leave-active {
  transition: opacity 0.15s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-sheet,
.modal-fade-enter-active .modal-success {
  animation: slideUp 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* ======================== */
/* RESPONSIVE               */
/* ======================== */
@media (max-width: 1100px) {
  .categories-grid,
  .skeleton-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .hero-greeting {
    padding: 20px;
  }

  .hero-title {
    font-size: 26px;
  }

  .hero-right {
    display: none;
  }

  .categories-grid,
  .skeleton-grid {
    grid-template-columns: repeat(2, 1fr);
  }


  .modal-sheet {
    max-height: 92vh;
  }
}

@media (min-width: 641px) {
  .modal-overlay {
    align-items: center;
  }

  .modal-sheet {
    border-radius: 24px;
    margin: 20px;
    max-height: 85vh;
  }
}
.people-names {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Contenedor con scroll si hay muchos */
.people-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 4px;
}

/* Tarjeta individual */
.person-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

/* Hover más moderno */
.person-card:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

/* Número de persona */
.person-index {
  min-width: 32px;
  height: 32px;
  background: #2563eb;
  color: white;
  font-size: 12px;
  font-weight: 800;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Input más cómodo */
.person-input-field {
  flex: 1;
  min-width: 180px;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  color: #0f172a;
  font-family: inherit;
}

/* Placeholder */
.person-input-field::placeholder {
  color: #94a3b8;
}

.person-input-field + .person-input-field {
  border-left: 1px solid #e2e8f0;
  padding-left: 12px;
}

@media (max-width: 640px) {
  .person-card {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .person-index {
    align-self: center;
  }

  .person-input-field {
    flex-basis: calc(100% - 44px);
    min-width: 0;
  }

  .person-input-field + .person-input-field {
    border-left: none;
    border-top: 1px solid #e2e8f0;
    margin-left: 44px;
    padding-left: 0;
    padding-top: 10px;
  }
}

/* Virtual service badge */
.virtual-badge {
  margin: 6px 20px 0;
  padding: 8px 14px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  font-size: 19px;
  font-weight: 700;
  color: #1d4ed8;
  text-align: center;
}

/* ======================== */
/* MODAL PAGO WOMPI         */
/* ======================== */
.modal-payment {
  background: white;
  width: 90%;
  max-width: 420px;
  border-radius: 24px;
  padding: 36px 28px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.payment-icon-wrap {
  width: 72px;
  height: 72px;
  background: #eff6ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.payment-icon-wrap.success { background: #dcfce7; }
.payment-icon-wrap.pending { background: #fef9c3; }
.payment-icon-wrap.failed  { background: #fee2e2; }
.payment-icon { font-size: 32px; }

.payment-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.payment-sub {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.payment-summary {
  width: 100%;
  background: #f8fafc;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #475569;
}

.payment-row.total {
  border-top: 1px solid #e2e8f0;
  padding-top: 10px;
  font-weight: 700;
  font-size: 15px;
  color: #0f172a;
}

.payment-amount {
  font-size: 20px;
  color: #2563eb;
}

.payment-security {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.security-badge {
  font-size: 12px;
  font-weight: 700;
  color: #166534;
  background: #dcfce7;
  padding: 4px 12px;
  border-radius: 20px;
}

.payment-security small {
  font-size: 11px;
  color: #94a3b8;
}

.btn-pay {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s, transform 0.15s;
}
.btn-pay:hover { opacity: 0.92; transform: translateY(-1px); }
.btn-pay:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.btn-pay-cancel {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  padding: 4px;
}
.btn-pay-cancel:hover { color: #64748b; }

.modal-overlay:has(.modal-payment) {
  align-items: center;
}
</style>

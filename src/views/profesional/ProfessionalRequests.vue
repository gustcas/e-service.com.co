    <template>
      <div class="requests-container">

        <!-- MAPA -->
        <div id="pro-map" ref="mapRef"></div>

        <!-- HEADER -->
        <div class="requests-header">
          <div>
            <h2>Solicitudes disponibles</h2>
            <p class="subtitle">
              {{ subtitleText }}
            </p>
          </div>
          <div class="live-badge">
            <span class="live-dot"></span>
            En vivo
          </div>
        </div>

        <!-- LISTA DE SOLICITUDES -->
        <div class="requests-list">

          <div v-if="loading" class="skeleton-list">
            <div v-for="n in 2" :key="n" class="skeleton-card">
              <div class="skeleton-line w-60"></div>
              <div class="skeleton-line w-90 short"></div>
              <div class="skeleton-line w-40 short"></div>
              <div class="skeleton-footer">
                <div class="skeleton-circle"></div>
                <div class="skeleton-line w-30 short"></div>
              </div>
            </div>
          </div>

          <div v-else-if="requests.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24">
                <path
                  d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 011-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 011.52 0C14.51 3.81 17 5 19 5a1 1 0 011 1z" />
              </svg>
            </div>
            <p class="empty-title">Sin solicitudes por ahora</p>
            <small>Actualizando cada 5 segundos...</small>
          </div>

          <TransitionGroup name="card" tag="div" class="card-group">
            <div v-for="req in requests" :key="req.id" class="request-card" :class="{ 'request-new': req.isNew }">

              <!-- Badge nueva -->
              <span v-if="req.isNew" class="new-badge">Nueva</span>

              <!-- Top -->
              <div class="request-top">
                <div class="service-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" width="16" height="16">
                    <path
                      d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div class="request-service">{{ req.service_name }}</div>
                <div class="request-budget">${{ Number(req.budget).toLocaleString('es-CO') }}</div>
              </div>

              <!-- Descripción -->
              <p class="request-description">{{ req.description }}</p>

              <!-- Meta chips -->
              <div class="request-meta">
                <span class="meta-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {{ req.service_date }} {{ req.service_time }}
                </span>
                <span v-if="req.address" class="meta-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {{ req.address }}
                </span>
                <span v-if="req.people_count && req.people_count > 1" class="meta-chip chip-people">
                  👥 {{ req.people_count }} personas
                </span>
              </div>

              <div class="request-divider"></div>

              <!-- Footer -->
              <div class="request-footer">
                <div class="client-info">
                  <div class="client-avatar">{{ getInitials(req.client_name) }}</div>
                  <span class="client-name">
                    {{ req.client_name }}
                  </span>
                </div>

                <div class="actions">
                  <button class="btn-distance" @click="viewDistance(req)">
                    Distancia
                  </button>
                  <button class="btn-detail" @click="openDetails(req)">
                    Detalles
                  </button>
                  <button class="btn-accept" @click="acceptRequest(req)" :disabled="accepting === req.id">
                    {{ accepting === req.id ? 'Aceptando...' : 'Aceptar →' }}
                  </button>
                </div>

              </div>

            </div>
          </TransitionGroup>

        </div>

        <div v-if="showDetailsModal" class="modal-overlay">
          <div class="modal-pro">

            <!-- HEADER -->
            <div class="modal-header">
              <div class="avatar-big">
                {{ getInitials(selectedRequest?.client_name) }}
              </div>
              <div>
                <h3>{{ selectedRequest?.client_name }}</h3>
                <p class="service-tag">{{ selectedRequest?.service_name }}</p>
              </div>
            </div>

            <!-- INFO -->
            <div class="modal-body">

              <div class="info-card">
                <span>📍 Dirección</span>
                <p>{{ selectedRequest?.address }}</p>
              </div>

              <div class="info-card">
                <span>📝 Descripción</span>
                <p>{{ selectedRequest?.description }}</p>
              </div>

              <div v-if="selectedRequest?.people_count" class="info-card">
                <span>👥 Personas</span>
                <p>{{ selectedRequest?.people_count }}</p>
              </div>

              <p v-if="selectedRequest?.people_count" class="request-people">
                👥 {{ selectedRequest?.people_count }} personas
              </p>
              <div class="info-row">
                <div class="mini-card">
                  <span>📅</span>
                  <p>{{ selectedRequest?.service_date }}</p>
                </div>

                <div class="mini-card">
                  <span>⏰</span>
                  <p>{{ selectedRequest?.service_time }}</p>
                </div>
              </div>

              <div class="price-card">
                ${{ Number(selectedRequest?.budget || 0).toLocaleString('es-CO') }}
              </div>

            </div>

            <!-- ACTIONS -->
            <div class="modal-actions">
              <button class="btn-close" @click="showDetailsModal = false">
                Cerrar
              </button>

              <button class="btn-go" @click="viewDistance(selectedRequest)">
                Ver ruta
              </button>
            </div>

          </div>
        </div>

        <!-- TOAST -->
        <Transition name="toast">
          <div v-if="toast.visible" class="toast" :class="toast.type">
            {{ toast.message }}
          </div>
        </Transition>

      </div>
    </template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import api from "@/services/api"


const subtitleText = computed(() => {
  if (requests.value.length > 0) {
    return requests.value.length + ' solicitud' +
      (requests.value.length > 1 ? 'es' : '') +
      ' cerca tuyo'
  }
  return 'Tu zona y servicio'
})

const myLocation = ref(null)

const getMyLocation = () => {
  if (!navigator.geolocation) {
    showToast("Geolocalización no soportada", "error")
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      myLocation.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      console.log('📍 ubicación obtenida:', myLocation.value)  // 👈
    },
    (err) => {
      console.error('geo error:', err.code, err.message)  // 👈 verás el código exacto
      showToast("No se pudo obtener tu ubicación", "error")
    }
  )
}
/* ======================= */
/* STATES                  */
/* ======================= */
const mapRef = ref(null)
const requests = ref([])
const accepting = ref(null)
const loading = ref(true)
const toast = ref({ visible: false, message: '', type: '' })

let map = null
let markers = []
let pollRequests = null
let toastTimer = null
let cityCenter = { lat: 4.7110, lng: -74.0721 }
let previousIds = []

const showDetailsModal = ref(false)
const selectedRequest = ref(null)

let routeLayer = null


const drawRoute = async (from, to) => {
  try {
    if (routeLayer) map.removeLayer(routeLayer)

    const url = `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' }  // 👈
    })

    if (!res.ok) {  // 👈 captura 403, 429, etc.
      showToast(`Error OSRM: ${res.status}`, 'error')
      return
    }

    const data = await res.json()

    const route = data.routes[0].geometry

    routeLayer = L.geoJSON(route, {
      style: {
        color: "#2563eb",
        weight: 5,
        opacity: 0.9
      }
    }).addTo(map)

    map.fitBounds(routeLayer.getBounds())

  } catch (e) {
    showToast("No se pudo trazar la ruta", "error")
  }
}


const openDetails = (req) => {
  selectedRequest.value = req
  showDetailsModal.value = true
}

/* ======================= */
/* UTILS                   */
/* ======================= */
const getInitials = (name = '') => {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

const showToast = (message, type = '') => {
  clearTimeout(toastTimer)
  toast.value = { visible: true, message, type }
  toastTimer = setTimeout(() => {
    toast.value.visible = false
  }, 3000)
}

/* ======================= */
/* RANDOM POSITION         */
/* ======================= */
const randomNearby = (lat, lng, radiusKm = 5) => {
  const r = radiusKm / 111
  const u = Math.random()
  const v = Math.random()
  const w = r * Math.sqrt(u)
  const t = 2 * Math.PI * v
  return {
    lat: lat + w * Math.cos(t),
    lng: lng + w * Math.sin(t),
  }
}

/* ======================= */
/* CLIENT ICON             */
/* ======================= */
const createClientIcon = () => {
  return L.divIcon({
    className: '',
    html: `
          <div class="client-marker">
            <div class="client-ring"></div>
            <div class="client-core">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" width="12" height="12">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>
        `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

/* ======================= */
/* INIT MAP                */
/* ======================= */
const initMap = async () => {
  try {
    const profile = await api.get("/professional/dashboard")
    const cityId = profile.data.professional?.city_id

    if (cityId) {
      const res = await api.get(`/cities/${cityId}`)
      const city = res.data
      cityCenter = {
        lat: city.lat || 4.7110,
        lng: city.lng || -74.0721,
      }
    }
  } catch {
    console.warn("Usando coordenadas por defecto")
  }

  map = L.map(mapRef.value, { zoomControl: false }).setView(
    [cityCenter.lat, cityCenter.lng], 13
  )

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '© <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  // 👇 AÑADE ESTO
  setTimeout(() => {
    map.invalidateSize()
  }, 300)
}

/* ======================= */
/* LOAD REQUESTS           */
/* ======================= */
const loadRequests = async () => {
  try {
    const res = await api.get("/professional/requests/available")
    const newData = res.data

    // detectar nuevos
    const newIds = newData.map(r => r.id)
    const addedIds = newIds.filter(id => !previousIds.includes(id))

    // marcar nuevos
    newData.forEach(r => {
      r.isNew = addedIds.includes(r.id)
    })

    previousIds = newIds
    requests.value = newData

    // limpiar markers anteriores
    markers.forEach(m => map.removeLayer(m))
    markers = []

    // crear markers
    newData.forEach(req => {
      let lat = req.lat
      let lng = req.lng

      if (!lat || !lng) {
        lat = cityCenter.lat
        lng = cityCenter.lng
      }

      const marker = L.marker([lat, lng], { icon: createClientIcon() })
        .addTo(map)
        .bindPopup(`
              <div style="min-width:160px;padding:4px;font-family:inherit">
                <strong style="font-size:13px">${req.service_name || 'Servicio'}</strong><br>
                <span style="color:#64748b;font-size:12px">${req.description?.substring(0, 60)}...</span><br>
                <strong style="color:#2563eb;font-size:14px">$${Number(req.budget).toLocaleString('es-CO')}</strong>
              </div>
            `)

      markers.push(marker)
    })

  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

/* ======================= */
/* ACCEPT REQUEST          */
/* ======================= */
const acceptRequest = async (req) => {
  try {
    accepting.value = req.id

    await api.post(`/professional/requests/${req.id}/accept`)

    requests.value = requests.value.filter(r => r.id !== req.id)
    showToast(`✓ Solicitud aceptada — contacta al cliente`, 'success')

  } catch (error) {
    if (error.response?.status === 404) {
      showToast('Esta solicitud ya fue tomada por otro profesional', 'warning')
      loadRequests()
    } else {
      showToast('Error al aceptar la solicitud', 'error')
    }
  } finally {
    accepting.value = null
  }
}


const getCoordsFromAddress = async (address, city) => {
  try {
    const fullAddress = `${address}, ${city}` // 👈 AQUÍ la magia

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
    )

    const data = await res.json()

    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
    }

    return null
  } catch (e) {
    return null
  }
}

const viewDistance = async (req) => {

  if (!myLocation.value) {
    showToast("Ubicación no disponible", "warning")
    return
  }

  let lat = req.lat
  let lng = req.lng

  if (!lat || !lng) {
    if (!req.address) {
      showToast("Servicio virtual — sin ubicación física", "warning")
      return
    }

    const coords = await getCoordsFromAddress(req.address, req.city_name)

    if (!coords) {
      showToast("No se pudo ubicar la dirección", "error")
      return
    }

    lat = coords.lat
    lng = coords.lng
  }

  const distance = calculateDistance(
    myLocation.value.lat,
    myLocation.value.lng,
    lat,
    lng
  )

  // ✅ SIEMPRE mostrar distancia
  showToast(`Distancia: ${distance} km`, 'success')

  // ✅ SIEMPRE dibujar ruta
  drawRoute(
    myLocation.value,
    { lat, lng }
  )
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return (R * c).toFixed(2)
}

/* ======================= */
/* LIFECYCLE               */
/* ======================= */
onMounted(async () => {
  await initMap()
  getMyLocation()
  await loadRequests()
  pollRequests = setInterval(loadRequests, 5000)
})

onUnmounted(() => {
  clearInterval(pollRequests)
  clearTimeout(toastTimer)
  if (map) map.remove()
})
</script>

<style scoped>
#pro-map {
  width: 100%;
  height: 240px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;

  position: relative;
  /* 👈 CLAVE */
  z-index: 1;
  /* 👈 CLAVE */
}

:global(.leaflet-pane),
:global(.leaflet-top),
:global(.leaflet-bottom) {
  z-index: 1 !important;
}

/* ======================= */
/* CONTAINER               */
/* ======================= */
.requests-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 32px;
  max-width: 560px;
  position: relative;
}

/* ======================= */
/* MAPA                    */
/* ======================= */
#pro-map {
  width: 100%;
  height: 240px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

/* ======================= */
/* HEADER                  */
/* ======================= */
.requests-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.requests-header h2 {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 3px;
  letter-spacing: -0.4px;
}

.subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #dcfce7;
  color: #166534;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 20px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.live-dot {
  width: 7px;
  height: 7px;
  background: #16a34a;
  border-radius: 50%;
  animation: livePulse 1.4s ease-in-out infinite;
}

@keyframes livePulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.4;
    transform: scale(1.5);
  }
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

.skeleton-line.w-30 {
  width: 30%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.skeleton-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.skeleton-circle {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  flex-shrink: 0;
}

/* ======================= */
/* EMPTY STATE             */
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
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.empty-title {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  margin: 0 0 4px;
}

.empty-state small {
  font-size: 12px;
}

/* ======================= */
/* CARD GROUP (transition) */
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
/* REQUEST CARD            */
/* ======================= */
.request-card {
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  transition: box-shadow 0.2s;
  position: relative;
}

.request-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
}

.request-new {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.07);
}

/* Badge nueva */
.new-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid #bfdbfe;
}

/* Top row */
.request-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding-right: 52px;
  /* espacio para badge */
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

.request-service {
  font-weight: 700;
  font-size: 14px;
  flex: 1;
}

.request-budget {
  font-weight: 800;
  font-size: 18px;
  color: #2563eb;
  letter-spacing: -0.5px;
}

/* Descripción */
.request-description {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
  margin: 0 0 10px;
}

/* Meta chips */
.request-meta {
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

.chip-people {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
  font-weight: 600;
}

/* Divider */
.request-divider {
  height: 1px;
  background: #f1f5f9;
  margin-bottom: 14px;
}

/* Footer */
.request-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* Actions */
.actions {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
  justify-content: flex-end;
}

.btn-distance,
.btn-detail,
.btn-reject,
.btn-accept {
  flex-shrink: 0;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .request-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    justify-content: stretch;
  }

  .btn-distance,
  .btn-detail,
  .btn-reject,
  .btn-accept {
    width: 100%;
    text-align: center;
    padding: 11px 8px;
    font-size: 13px;
  }

  /* Aceptar ocupa toda la fila */
  .btn-accept {
    grid-column: span 2;
    padding: 13px;
    font-size: 14px;
  }
}

.client-info {
  display: flex;
  align-items: center;
  gap: 8px;
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
}



.btn-reject {
  background: #fff5f5;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 9px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
  font-family: inherit;
}

.btn-reject:hover {
  background: #fef2f2;
  transform: translateY(-1px);
}

.btn-accept {
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
  font-family: inherit;
}

.btn-accept:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
}

.btn-accept:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

.toast.warning {
  background: #78350f;
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
/* LEAFLET MARKER CUSTOM   */
/* ======================= */
:global(.client-marker) {
  position: relative;
  width: 30px;
  height: 30px;
}

:global(.client-core) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 26px;
  height: 26px;
  background: #f59e0b;
  border: 2.5px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.45);
}

:global(.client-ring) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  background: rgba(245, 158, 11, 0.25);
  border-radius: 50%;
  animation: clientPulse 1.8s ease-out infinite;
  z-index: 1;
}

@keyframes clientPulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -50%) scale(2.2);
    opacity: 0;
  }
}

.btn-detail {
  background: #eef2ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn-distance {
  background: #ecfeff;
  color: #0e7490;
  border: 1px solid #a5f3fc;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 320px;
}

.btn-close {
  margin-top: 10px;
  background: #e5e7eb;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
}

.modal-pro {
  background: white;
  width: 340px;
  border-radius: 18px;
  padding: 18px;
  animation: scaleIn 0.2s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0
  }

  to {
    transform: scale(1);
    opacity: 1
  }
}

.modal-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}

.avatar-big {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.service-tag {
  font-size: 12px;
  color: #64748b;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-card {
  background: #f8fafc;
  padding: 10px;
  border-radius: 10px;
  font-size: 12px;
}

.info-row {
  display: flex;
  gap: 8px;
}

.mini-card {
  flex: 1;
  background: #eef2ff;
  padding: 10px;
  border-radius: 10px;
  text-align: center;
  font-size: 12px;
}

.price-card {
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: white;
  text-align: center;
  padding: 12px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 800;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
}

.btn-go {
  background: #22c55e;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
}

.request-people {
  font-size: 12px;
  color: #0f172a;
  font-weight: 600;
  margin-bottom: 6px;
}
</style>
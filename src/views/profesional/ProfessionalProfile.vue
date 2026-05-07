<template>
  <div class="profile-page">
    <div class="profile-card">

      <div class="profile-header">
        <img :src="photoPreview || 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProfessionalProfile'"
          class="profile-avatar" />
        <div class="form-group full">
          <label>Foto Profesional *</label>
          <input type="file" @change="handleFile($event, 'photo')" />
          <small v-if="errors.photo" class="error">{{ errors.photo[0] }}</small>
        </div>
        <div>
          <h2>Mi Perfil Profesional</h2>
          <p>Tu perfil quedará pendiente hasta verificación del administrador</p>
          <div class="verification-status" :class="verificationStatusClass">
            <span class="vs-dot"></span>
            {{ verificationStatusLabel }}
          </div>
        </div>
      </div>

      <div class="form-grid">

        <!-- Especialidades — dropdown multi-selección con checkboxes -->
        <div class="form-group full" ref="catDropdownRef">
          <label>Especialidades * <small style="font-weight:400;color:#64748b">(puedes elegir varias)</small></label>

          <!-- Trigger / Campo visible -->
          <div class="ms-field" :class="{ open: catOpen }" @click="catOpen = !catOpen">
            <span v-if="!form.category_ids.length" class="ms-placeholder">Selecciona especialidades...</span>
            <span v-else class="ms-label-text">{{ selectedCategoryLabel }}</span>
            <div class="ms-icons">
              <button v-if="form.category_ids.length" type="button" class="ms-clear" @click.stop="form.category_ids = []; form.service_ids = []" title="Limpiar">×</button>
              <span class="ms-chevron" :class="{ rotated: catOpen }">▼</span>
            </div>
          </div>

          <!-- Dropdown -->
          <div v-if="catOpen" class="ms-dropdown">
            <!-- Fila de búsqueda + limpiar todo -->
            <div class="ms-header-row" @click.stop>
              <span
                class="ms-checkbox"
                :class="{ checked: allCatsSelected, partial: form.category_ids.length > 0 && !allCatsSelected }"
                @click="toggleAllCategories"
              >
                <svg v-if="allCatsSelected" viewBox="0 0 12 10" fill="none" width="11" height="9">
                  <polyline points="1,5 4.5,8.5 11,1" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span v-else-if="form.category_ids.length > 0" class="ms-partial-bar"></span>
              </span>
              <input v-model="catSearch" class="ms-search" placeholder="Buscar especialidad..." @click.stop />
              <button class="ms-header-close" @click.stop="catOpen = false">×</button>
            </div>
            <div class="ms-options">
              <div
                v-for="cat in filteredCategories"
                :key="cat.id"
                class="ms-option"
                :class="{ checked: form.category_ids.includes(cat.id) }"
                @click.stop="toggleCategory(cat.id)"
              >
                <span class="ms-checkbox" :class="{ checked: form.category_ids.includes(cat.id) }">
                  <svg v-if="form.category_ids.includes(cat.id)" viewBox="0 0 12 10" fill="none" width="11" height="9">
                    <polyline points="1,5 4.5,8.5 11,1" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span class="ms-option-label">{{ cat.name }}</span>
              </div>
              <div v-if="filteredCategories.length === 0" class="ms-empty">Sin resultados</div>
            </div>
          </div>

          <small v-if="errors['category_ids']" class="error">{{ errors['category_ids'][0] }}</small>
        </div>

        <!-- Servicios acumulados de todas las especialidades seleccionadas -->
        <div class="form-group full">
          <label>Servicios que ofreces *</label>

          <div v-if="!form.category_ids.length" class="chips-hint">
            Selecciona primero una o más especialidades
          </div>

          <div v-else-if="availableServices.length === 0" class="chips-hint">
            No hay servicios disponibles para las especialidades seleccionadas
          </div>

          <template v-else>
            <div
              v-for="cat in categoriesWithServices"
              :key="cat.id"
              class="service-group"
            >
              <div class="service-group-label">{{ cat.name }}</div>
              <div class="service-chips">
                <button
                  v-for="service in cat.services"
                  :key="service.id"
                  type="button"
                  class="service-chip"
                  :class="{ selected: form.service_ids.includes(service.id) }"
                  @click="toggleService(service.id)"
                >
                  <span v-if="form.service_ids.includes(service.id)" class="chip-check">✓</span>
                  {{ service.name }}
                </button>
              </div>
            </div>
          </template>

          <small v-if="errors['service_ids'] || errors['service_ids.0']" class="error">
            {{ (errors['service_ids'] || errors['service_ids.0'])[0] }}
          </small>
        </div>

        <!-- Número documento -->
        <div class="form-group">
          <label>Número de Documento *</label>
          <input type="text" v-model="form.document_number" />
          <small v-if="errors.document_number" class="error">{{ errors.document_number[0] }}</small>
        </div>

        <!-- Documento identidad -->
        <div class="form-group">
          <label>Documento de Identidad (PDF/JPG) *</label>
          <input type="file" @change="handleFile($event, 'identity_card')" />
          <div v-if="existingFiles.identity_card" class="file-indicator">
            ✅ Documento ya subido —
            <a :href="existingFiles.identity_card" target="_blank">Ver documento</a>
          </div>
          <small v-if="errors.identity_card" class="error">{{ errors.identity_card[0] }}</small>
        </div>

        <!-- Tarjeta profesional -->
        <div class="form-group">
          <label>Tarjeta Profesional (PDF/JPG) *</label>
          <input type="file" @change="handleFile($event, 'professional_card')" />
          <div v-if="existingFiles.professional_card" class="file-indicator">
            ✅ Documento ya subido —
            <a :href="existingFiles.professional_card" target="_blank">Ver documento</a>
          </div>
          <small v-if="errors.professional_card" class="error">{{ errors.professional_card[0] }}</small>
        </div>

        <!-- Hoja de vida -->
        <div class="form-group">
          <label>Hoja de vida (PDF/JPG) *</label>
          <input type="file" @change="handleFile($event, 'professional_title')" />
          <div v-if="existingFiles.professional_title" class="file-indicator">
            ✅ Documento ya subido —
            <a :href="existingFiles.professional_title" target="_blank">Ver documento</a>
          </div>
          <small v-if="errors.professional_title" class="error">{{ errors.professional_title[0] }}</small>
        </div>

        <!-- Teléfono -->
        <div class="form-group">
          <label>Teléfono *</label>
          <input type="text" v-model="form.phone" />
          <small v-if="errors.phone" class="error">{{ errors.phone[0] }}</small>
        </div>

        <!-- Dirección -->
        <div class="form-group">
          <label>Dirección</label>
          <input type="text" v-model="form.address" />
        </div>

        <!-- Ciudad -->
        <div class="form-group">
          <label>Ciudad *</label>
          <select v-model="form.city_id">
            <option value="" disabled>Selecciona una ciudad</option>
            <option v-for="city in cities" :key="city.id" :value="city.id">
              {{ city.name }} — {{ city.department }}
            </option>
          </select>
          <small v-if="errors.city_id" class="error">{{ errors.city_id[0] }}</small>
        </div>

      </div>

      <!-- Bio -->
      <div class="form-group full">
        <label>Descripción Profesional</label>
        <textarea rows="4" v-model="form.bio"></textarea>
      </div>

      <div class="form-actions">
        <button class="save-btn" @click="saveProfile" :disabled="saving">
          {{ saving ? "Enviando..." : "Enviar para verificación" }}
        </button>
      </div>

      <div v-if="message" class="success-message">
        {{ message }}
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import categoryService from "@/services/categoryService"
import api from "@/services/api"

const categories = ref([])
const saving = ref(false)
const message = ref(null)
const errors = ref({})
const professionalStatus = ref(null)
const professionalVerified = ref(false)

const verificationStatusLabel = computed(() => {
  if (professionalVerified.value) return 'Verificado como profesional'
  if (professionalStatus.value === 'pending') return 'Por verificar'
  if (professionalStatus.value === 'under_review') return 'En curso de verificación'
  return 'Por verificar'
})
const verificationStatusClass = computed(() => {
  if (professionalVerified.value) return 'vs-verified'
  if (professionalStatus.value === 'under_review') return 'vs-review'
  return 'vs-pending'
})
const photoPreview = ref(null)

const services = ref([])
const allServices = ref([])

const cities = ref([])

const loadCities = async () => {
  const response = await api.get("/cities")
  cities.value = response.data
}


const existingFiles = ref({
  identity_card: null,
  professional_card: null,
  professional_title: null,
})

const form = ref({
  category_ids: [],
  service_ids: [],
  document_number: "",
  identity_card: null,
  professional_card: null,
  professional_title: null,
  photo: null,
  phone: "",
  bio: "",
  address: "",
  city_id: "",
})

/* Servicios disponibles (union de todas las categorías seleccionadas) */
const availableServices = computed(() =>
  allServices.value.filter(s => form.value.category_ids.includes(Number(s.category_id)))
)

/* Categorías seleccionadas con sus servicios (para mostrar agrupado) */
const categoriesWithServices = computed(() =>
  categories.value
    .filter(c => form.value.category_ids.includes(c.id))
    .map(c => ({
      ...c,
      services: allServices.value.filter(s => Number(s.category_id) === c.id),
    }))
    .filter(c => c.services.length > 0)
)

/* ── Dropdown multi-select de categorías ── */
const catOpen        = ref(false)
const catSearch      = ref('')
const catDropdownRef = ref(null)

const filteredCategories = computed(() =>
  catSearch.value.trim()
    ? categories.value.filter(c => c.name.toLowerCase().includes(catSearch.value.toLowerCase()))
    : categories.value
)

const MAX_LABELS = 3
const selectedCategoryLabel = computed(() => {
  const names = form.value.category_ids
    .map(id => categories.value.find(c => c.id === id)?.name)
    .filter(Boolean)
  if (names.length <= MAX_LABELS) return names.join(', ')
  return names.slice(0, MAX_LABELS).join(', ') + ` (+${names.length - MAX_LABELS} más)`
})

const allCatsSelected = computed(() =>
  categories.value.length > 0 && form.value.category_ids.length === categories.value.length
)

const toggleAllCategories = () => {
  if (allCatsSelected.value) {
    form.value.category_ids = []
    form.value.service_ids = []
  } else {
    form.value.category_ids = categories.value.map(c => c.id)
    const allSvcIds = allServices.value.map(s => s.id)
    form.value.service_ids = [...new Set(allSvcIds)]
  }
}

const onClickOutside = (e) => {
  if (catDropdownRef.value && !catDropdownRef.value.contains(e.target)) {
    catOpen.value = false
    catSearch.value = ''
  }
}
onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

const toggleCategory = (id) => {
  const idx = form.value.category_ids.indexOf(id)
  if (idx === -1) {
    form.value.category_ids.push(id)
    // Auto-seleccionar todos los servicios de la nueva categoría
    const newServices = allServices.value
      .filter(s => Number(s.category_id) === id)
      .map(s => s.id)
    newServices.forEach(sid => {
      if (!form.value.service_ids.includes(sid)) form.value.service_ids.push(sid)
    })
  } else {
    form.value.category_ids.splice(idx, 1)
    // Quitar servicios de la categoría deseleccionada
    const removedServices = allServices.value
      .filter(s => Number(s.category_id) === id)
      .map(s => s.id)
    form.value.service_ids = form.value.service_ids.filter(sid => !removedServices.includes(sid))
  }
}

const toggleService = (id) => {
  const idx = form.value.service_ids.indexOf(id)
  if (idx === -1) form.value.service_ids.push(id)
  else form.value.service_ids.splice(idx, 1)
}

const handleFile = (event, field) => {
  const file = event.target.files[0]
  form.value[field] = file

  if (field === "photo" && file) {
    photoPreview.value = URL.createObjectURL(file)
  }
}

const loadCategories = async () => {
  const response = await categoryService.getAllProfesional()
  categories.value = response.data
}

const loadServices = async () => {
  const response = await api.get("/services")
  allServices.value = response.data
}

const filterServices = () => {
  // no-op: availableServices es computed reactivo
}
/* ===============================
   🔥 NUEVO: CARGAR PERFIL SI EXISTE
================================== */
const loadProfile = async () => {
  try {
    const response = await api.get("/professional/dashboard")

    if (response.data.professional) {
      const professional = response.data.professional

      professionalStatus.value  = professional.status
      professionalVerified.value = professional.is_verified

      form.value.category_ids   = professional.category_ids?.length
        ? professional.category_ids.map(Number)
        : (professional.category_id ? [Number(professional.category_id)] : [])
      form.value.document_number = professional.document_number
      form.value.phone = professional.phone
      form.value.bio = professional.bio
      form.value.address = professional.address
      form.value.city_id = professional.city_id
      if (professional.service_ids?.length) {
        form.value.service_ids = professional.service_ids
      } else if (professional.service_id) {
        form.value.service_ids = [professional.service_id]
      }

      const baseURL = import.meta.env.VITE_API_URL.replace('/api', '') + '/storage/'

      // 🔥 FOTO
      if (professional.photo) {
        photoPreview.value = baseURL + professional.photo
      }

      // 🔥 DOCUMENTOS EXISTENTES
      existingFiles.value.identity_card = professional.identity_card ? baseURL + professional.identity_card : null
      existingFiles.value.professional_card = professional.professional_card ? baseURL + professional.professional_card : null
      existingFiles.value.professional_title = professional.professional_title ? baseURL + professional.professional_title : null
    }
  } catch (error) {
    console.log("No hay perfil aún")
  }
}

const saveProfile = async () => {
  try {
    saving.value = true
    errors.value = {}
    message.value = null

    const formData = new FormData()

    Object.keys(form.value).forEach(key => {
      const val = form.value[key]
      if (val === null || val === undefined) return
      if (Array.isArray(val)) {
        val.forEach(v => formData.append(`${key}[]`, v))
      } else {
        formData.append(key, val)
      }
    })

    const response = await api.post(
      "/professional/profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    )

    message.value = response.data.message

    // Siempre que se guarda, vuelve a pendiente de verificación
    professionalStatus.value  = 'pending'
    professionalVerified.value = false

  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
    }
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadCategories()
  await loadServices()   // 👈 debe terminar ANTES de loadProfile
  await loadCities()
  await loadProfile()    // 👈 aquí ya filterServices() funciona bien
})
</script>

<style scoped>
/* =========================
   CONTENEDOR GENERAL
========================= */

.profile-page {
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: center;
}

.profile-card {
  width: 100%;
  max-width: 1100px;
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05);
}

/* =========================
   HEADER
========================= */

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 40px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 24px;
}

.profile-header h2 {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
}

.profile-header p {
  color: #64748b;
  margin-top: 6px;
  font-size: 14px;
}

.verification-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}
.vs-dot {
  width: 8px; height: 8px; border-radius: 50%;
}
.verification-status.vs-verified { background: #dcfce7; color: #166534; }
.verification-status.vs-verified .vs-dot { background: #22c55e; }
.verification-status.vs-review   { background: #fef9c3; color: #854d0e; }
.verification-status.vs-review   .vs-dot { background: #f59e0b; }
.verification-status.vs-pending  { background: #f1f5f9; color: #475569; }
.verification-status.vs-pending  .vs-dot { background: #94a3b8; }

.profile-avatar {
  width: 110px;
  height: 110px;
  border-radius: 24px;
  border: 3px solid #e2e8f0;
}

/* =========================
   FORM GRID
========================= */

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
}

.full {
  grid-column: 1 / -1;
}

/* =========================
   INPUTS
========================= */

label {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
}

input,
select,
textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

textarea {
  resize: none;
}

/* =========================
   BUTTON
========================= */

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
  padding: 14px 28px;
  border-radius: 14px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* =========================
   MENSAJES
========================= */

.error {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}

.success-message {
  margin-top: 20px;
  padding: 14px;
  background: #dcfce7;
  color: #166534;
  border-radius: 10px;
  font-weight: 600;
}

/* =========================
   RESPONSIVE
========================= */

/* Tablet */
@media (max-width: 1024px) {
  .profile-card {
    padding: 30px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Mobile */
@media (max-width: 640px) {

  .profile-page {
    padding: 12px;
  }

  .profile-card {
    padding: 20px;
    border-radius: 16px;
  }

  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 16px;
  }

  .profile-avatar {
    width: 90px;
    height: 90px;
  }

  .form-actions {
    justify-content: center;
  }

  .save-btn {
    width: 100%;
  }
}

/* =========================
   CHIPS DE SERVICIOS
========================= */

.chips-hint {
  padding: 12px 14px;
  background: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: 12px;
  font-size: 13px;
  color: #94a3b8;
}

.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.service-group {
  margin-bottom: 14px;
}

.service-group-label {
  font-size: 11px;
  font-weight: 700;
  color: #2563eb;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding-left: 2px;
}

.service-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.service-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 999px;
  background: white;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}

.service-chip:hover {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}

.service-chip.selected {
  border-color: #2563eb;
  background: #2563eb;
  color: white;
}

.chip-check {
  font-size: 12px;
  font-weight: 900;
}

.file-indicator {
  margin-top: 6px;
  font-size: 12px;
  color: #16a34a;
}

.file-indicator a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.file-indicator a:hover {
  text-decoration: underline;
}

/* =========================
   MULTI-SELECT ESPECIALIDADES
========================= */

/* Campo trigger */
.ms-field {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 46px;
  padding: 0 10px 0 14px;
  border: 1.5px solid #ced4da;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  user-select: none;
  gap: 8px;
}

.ms-field:hover {
  border-color: #0ea5e9;
}

.ms-field.open {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
}

.ms-placeholder {
  flex: 1;
  font-size: 14px;
  color: #9ca3af;
}

.ms-label-text {
  flex: 1;
  font-size: 14px;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ms-icons {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.ms-clear {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 18px;
  line-height: 1;
  padding: 2px 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.ms-clear:hover {
  color: #64748b;
}

.ms-chevron {
  font-size: 10px;
  color: #6b7280;
  transition: transform 0.2s ease;
  display: inline-block;
}

.ms-chevron.rotated {
  transform: rotate(180deg);
}

/* Dropdown panel */
.ms-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  z-index: 300;
  overflow: hidden;
}

/* Fila superior: checkbox "todos" + search + cerrar */
.ms-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid #f1f5f9;
  background: white;
}

.ms-search {
  flex: 1;
  padding: 6px 10px !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
  font-size: 13px !important;
  outline: none !important;
  background: white !important;
  box-shadow: none !important;
  min-width: 0;
}

.ms-search:focus {
  border-color: #0ea5e9 !important;
  box-shadow: none !important;
}

.ms-header-close {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 18px;
  line-height: 1;
  padding: 2px 6px;
  cursor: pointer;
  transition: color 0.15s;
  flex-shrink: 0;
}

.ms-header-close:hover {
  color: #374151;
}

/* Lista de opciones */
.ms-options {
  max-height: 240px;
  overflow-y: auto;
}

.ms-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: background 0.1s;
}

.ms-option:hover {
  background: #f0f9ff;
}

.ms-option.checked {
  background: #e0f2fe;
  color: #0369a1;
}

.ms-option-label {
  font-size: 14px;
}

/* Checkbox cuadrado estilo PrimeVue */
.ms-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #ced4da;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.15s, background 0.15s;
  background: white;
  cursor: pointer;
}

.ms-checkbox.checked {
  border-color: #0ea5e9;
  background: #0ea5e9;
}

.ms-checkbox.partial {
  border-color: #0ea5e9;
  background: #0ea5e9;
}

.ms-partial-bar {
  width: 10px;
  height: 2px;
  background: white;
  border-radius: 1px;
  display: block;
}

.ms-empty {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}
</style>
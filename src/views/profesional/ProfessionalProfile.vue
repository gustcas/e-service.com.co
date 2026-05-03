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
        </div>
      </div>

      <div class="form-grid">

        <!-- Categoría -->
        <div class="form-group">
          <label>Especialidad *</label>
          <select v-model="form.category_id" @change="filterServices">
            <option value="" disabled>Selecciona una categoría</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <small v-if="errors.category_id" class="error">{{ errors.category_id[0] }}</small>
        </div>

        <!-- Servicios (chips multi-selección) -->
        <div class="form-group full">
          <label>Servicios que ofreces *</label>

          <div v-if="!form.category_id" class="chips-hint">
            Selecciona primero una especialidad
          </div>

          <div v-else-if="services.length === 0" class="chips-hint">
            No hay servicios disponibles para esta especialidad
          </div>

          <div v-else class="service-chips">
            <button
              v-for="service in services"
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
import { ref, onMounted } from "vue"
import categoryService from "@/services/categoryService"
import api from "@/services/api"

const categories = ref([])
const saving = ref(false)
const message = ref(null)
const errors = ref({})
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
  category_id: "",
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

const toggleService = (id) => {
  const idx = form.value.service_ids.indexOf(id)
  if (idx === -1) {
    form.value.service_ids.push(id)
  } else {
    form.value.service_ids.splice(idx, 1)
  }
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

  services.value = allServices.value.filter(
    s => Number(s.category_id) === Number(form.value.category_id)
  )

}
/* ===============================
   🔥 NUEVO: CARGAR PERFIL SI EXISTE
================================== */
const loadProfile = async () => {
  try {
    const response = await api.get("/professional/dashboard")

    if (response.data.professional) {
      const professional = response.data.professional

      form.value.category_id = professional.category_id
      form.value.document_number = professional.document_number
      form.value.phone = professional.phone
      form.value.bio = professional.bio
      form.value.address = professional.address
      form.value.city_id = professional.city_id
      filterServices()
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
</style>
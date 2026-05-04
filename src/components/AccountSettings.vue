<template>
  <Transition name="modal">
    <div v-if="modelValue" class="settings-overlay" @click.self="close">
      <div class="settings-modal">

        <!-- Header -->
        <div class="settings-header">
          <div class="settings-header-left">
            <div class="settings-avatar">{{ initials }}</div>
            <div>
              <div class="settings-username">{{ localName }}</div>
              <div class="settings-email-small">{{ localEmail }}</div>
            </div>
          </div>
          <button class="settings-close" @click="close">✕</button>
        </div>

        <!-- Body -->
        <div class="settings-body">

          <!-- Información personal -->
          <div class="settings-card">
            <div class="settings-card-title">
              <span class="settings-card-icon">👤</span> Información personal
            </div>
            <div class="field-group">
              <label>Nombre completo</label>
              <input v-model="nameForm.name" type="text" placeholder="Tu nombre" />
            </div>
            <p v-if="nameMsg.text" :class="['msg', nameMsg.type]">{{ nameMsg.text }}</p>
            <button class="btn-save" :disabled="nameSaving || !nameForm.name.trim()" @click="saveName">
              {{ nameSaving ? 'Guardando...' : 'Guardar nombre' }}
            </button>
          </div>

          <!-- Correo electrónico -->
          <div class="settings-card">
            <div class="settings-card-title">
              <span class="settings-card-icon">✉️</span> Correo electrónico
            </div>
            <div class="field-group">
              <label>Nuevo correo</label>
              <input v-model="emailForm.email" type="email" placeholder="nuevo@correo.com" />
            </div>
            <div class="field-group">
              <label>Contraseña actual (para confirmar)</label>
              <input v-model="emailForm.current_password" type="password" placeholder="••••••••" />
            </div>
            <p v-if="emailMsg.text" :class="['msg', emailMsg.type]">{{ emailMsg.text }}</p>
            <button class="btn-save" :disabled="emailSaving || !emailForm.email.trim() || !emailForm.current_password" @click="saveEmail">
              {{ emailSaving ? 'Guardando...' : 'Cambiar correo' }}
            </button>
          </div>

          <!-- Contraseña -->
          <div class="settings-card">
            <div class="settings-card-title">
              <span class="settings-card-icon">🔒</span> Cambiar contraseña
            </div>
            <div class="field-group">
              <label>Contraseña actual</label>
              <input v-model="passForm.current_password" type="password" placeholder="••••••••" />
            </div>
            <div class="field-group">
              <label>Nueva contraseña</label>
              <input v-model="passForm.new_password" type="password" placeholder="Mínimo 8 caracteres" />
            </div>
            <div class="field-group">
              <label>Confirmar nueva contraseña</label>
              <input v-model="passForm.new_password_confirmation" type="password" placeholder="Repite la nueva contraseña" />
            </div>
            <p v-if="passMsg.text" :class="['msg', passMsg.type]">{{ passMsg.text }}</p>
            <button class="btn-save"
              :disabled="passSaving || !passForm.current_password || !passForm.new_password || passForm.new_password !== passForm.new_password_confirmation"
              @click="savePassword">
              {{ passSaving ? 'Guardando...' : 'Cambiar contraseña' }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({ modelValue: Boolean })
const emit  = defineEmits(['update:modelValue'])

const authStore = useAuthStore()

const localName  = ref('')
const localEmail = ref('')

const initials = computed(() =>
  (localName.value || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
)

const syncFromStore = () => {
  const u = authStore.user || JSON.parse(localStorage.getItem('user') || '{}')
  localName.value       = u.name  || ''
  localEmail.value      = u.email || ''
  nameForm.value.name   = u.name  || ''
  emailForm.value.email = u.email || ''
}

watch(() => props.modelValue, (v) => { if (v) syncFromStore() })

// ── Nombre ──────────────────────────────────────────────────
const nameForm   = ref({ name: '' })
const nameSaving = ref(false)
const nameMsg    = ref({ text: '', type: '' })

const saveName = async () => {
  nameSaving.value = true
  nameMsg.value    = { text: '', type: '' }
  try {
    const { data } = await api.put('/account/settings', { name: nameForm.value.name })
    localName.value = data.user.name
    updateStored(data.user)
    nameMsg.value = { text: '✓ Nombre actualizado', type: 'success' }
  } catch (e) {
    nameMsg.value = { text: e?.response?.data?.message || 'Error al guardar', type: 'error' }
  } finally {
    nameSaving.value = false
  }
}

// ── Email ───────────────────────────────────────────────────
const emailForm   = ref({ email: '', current_password: '' })
const emailSaving = ref(false)
const emailMsg    = ref({ text: '', type: '' })

const saveEmail = async () => {
  emailSaving.value = true
  emailMsg.value    = { text: '', type: '' }
  try {
    const { data } = await api.put('/account/settings', {
      email:            emailForm.value.email,
      current_password: emailForm.value.current_password,
    })
    localEmail.value              = data.user.email
    emailForm.value.current_password = ''
    updateStored(data.user)
    emailMsg.value = { text: '✓ Correo actualizado', type: 'success' }
  } catch (e) {
    const errors = e?.response?.data?.errors
    const msg    = errors
      ? Object.values(errors).flat().join(' ')
      : e?.response?.data?.message || 'Error al guardar'
    emailMsg.value = { text: msg, type: 'error' }
  } finally {
    emailSaving.value = false
  }
}

// ── Contraseña ──────────────────────────────────────────────
const passForm   = ref({ current_password: '', new_password: '', new_password_confirmation: '' })
const passSaving = ref(false)
const passMsg    = ref({ text: '', type: '' })

const savePassword = async () => {
  passSaving.value = true
  passMsg.value    = { text: '', type: '' }
  try {
    await api.put('/account/settings', {
      current_password:      passForm.value.current_password,
      new_password:          passForm.value.new_password,
      new_password_confirmation: passForm.value.new_password_confirmation,
    })
    passForm.value = { current_password: '', new_password: '', new_password_confirmation: '' }
    passMsg.value  = { text: '✓ Contraseña cambiada correctamente', type: 'success' }
  } catch (e) {
    const errors = e?.response?.data?.errors
    const msg    = errors
      ? Object.values(errors).flat().join(' ')
      : e?.response?.data?.message || 'Error al guardar'
    passMsg.value = { text: msg, type: 'error' }
  } finally {
    passSaving.value = false
  }
}

// ── helpers ─────────────────────────────────────────────────
const updateStored = (user) => {
  const stored = JSON.parse(localStorage.getItem('user') || '{}')
  const merged = { ...stored, ...user }
  localStorage.setItem('user', JSON.stringify(merged))
  if (authStore.updateUser) authStore.updateUser(merged)
}

const close = () => emit('update:modelValue', false)
</script>

<style scoped>
.settings-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}

.settings-modal {
  background: #fff;
  border-radius: 20px;
  width: 100%; max-width: 460px;
  max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,.25);
  overflow: hidden;
}

/* Header */
.settings-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  flex-shrink: 0;
}
.settings-header-left { display: flex; align-items: center; gap: 14px; }
.settings-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,.22);
  border: 2px solid rgba(255,255,255,.4);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 18px; color: #fff;
  flex-shrink: 0;
}
.settings-username  { font-weight: 700; font-size: 15px; color: #fff; }
.settings-email-small { font-size: 12px; color: rgba(255,255,255,.75); margin-top: 2px; }
.settings-close {
  background: rgba(255,255,255,.15); border: none; color: #fff;
  width: 32px; height: 32px; border-radius: 50%; font-size: 14px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .15s; flex-shrink: 0;
}
.settings-close:hover { background: rgba(255,255,255,.28); }

/* Body */
.settings-body {
  flex: 1; overflow-y: auto;
  padding: 20px;
  display: flex; flex-direction: column; gap: 16px;
  background: #f8fafc;
}

/* Cards */
.settings-card {
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px;
  display: flex; flex-direction: column; gap: 12px;
}
.settings-card-title {
  font-weight: 700; font-size: 14px; color: #0f172a;
  display: flex; align-items: center; gap: 8px;
}
.settings-card-icon { font-size: 16px; }

/* Fields */
.field-group { display: flex; flex-direction: column; gap: 5px; }
.field-group label {
  font-size: 12px; font-weight: 600; color: #64748b;
}
.field-group input {
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 14px; color: #1e293b; font-family: inherit;
  background: #f8fafc; outline: none;
  transition: border-color .2s, background .2s;
}
.field-group input:focus { border-color: #2563eb; background: #fff; }

/* Messages */
.msg { font-size: 12px; font-weight: 600; margin: 0; }
.msg.success { color: #16a34a; }
.msg.error   { color: #dc2626; }

/* Save button */
.btn-save {
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: #fff; border: none;
  padding: 10px 20px; border-radius: 10px;
  font-size: 13px; font-weight: 700; font-family: inherit;
  cursor: pointer; align-self: flex-end;
  transition: opacity .15s, transform .15s;
}
.btn-save:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
.btn-save:disabled { background: #bfdbfe; cursor: not-allowed; }

/* Scrollbar */
.settings-body::-webkit-scrollbar { width: 4px; }
.settings-body::-webkit-scrollbar-track { background: transparent; }
.settings-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

/* Transition */
.modal-enter-active, .modal-leave-active { transition: opacity .2s, transform .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.96); }
</style>

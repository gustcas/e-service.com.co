<template>
  <div class="datos-pago-wrap">
    <div class="dp-card">
      <div class="dp-card-header">
        <div class="dp-icon-wrap">
          <span>💳</span>
        </div>
        <div>
          <h2 class="dp-title">Datos de Pago</h2>
          <p class="dp-subtitle">Registra tu cuenta para recibir tus pagos por servicios realizados.</p>
        </div>
      </div>

      <!-- Tabs método -->
      <div class="method-tabs">
        <button
          v-for="m in methods"
          :key="m.key"
          :class="['method-tab', { active: form.payment_method === m.key }]"
          @click="form.payment_method = m.key"
        >
          <span>{{ m.icon }}</span> {{ m.label }}
        </button>
      </div>

      <form @submit.prevent="save" class="dp-form">

        <!-- Tipo y número de documento -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tipo de Documento *</label>
            <select v-model="form.id_type" class="form-input" required>
              <option value="CC">Cédula de Ciudadanía (CC)</option>
              <option value="NIT">NIT</option>
              <option value="CE">Cédula de Extranjería (CE)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Número de Documento *</label>
            <input v-model="form.id_number" class="form-input" placeholder="Ej. 1000123456" required />
          </div>
        </div>

        <!-- Nombre completo -->
        <div class="form-group">
          <label class="form-label">Nombre completo del titular * <span class="hint">(debe coincidir con el titular de la cuenta)</span></label>
          <input v-model="form.full_name" class="form-input" placeholder="Ej. Juan Carlos Pérez López" required />
        </div>

        <!-- Email y número de cuenta -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Email del titular *</label>
            <input v-model="form.email" class="form-input" type="email" placeholder="correo@ejemplo.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">Número de cuenta *</label>
            <input v-model="form.account_number" class="form-input" placeholder="Ej. 12345678901" required />
          </div>
        </div>

        <!-- Banco y tipo de cuenta (solo bank_transfer) -->
        <template v-if="form.payment_method === 'bank_transfer'">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Banco *</label>
              <select v-model="form.bank_id" class="form-input" required @change="onBankChange">
                <option value="">Selecciona un banco</option>
                <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Tipo de cuenta *</label>
              <div class="account-type-row">
                <button
                  type="button"
                  :class="['acc-btn', { active: form.account_type === 'AHORROS' }]"
                  @click="form.account_type = 'AHORROS'"
                >
                  🏦 Ahorros
                </button>
                <button
                  type="button"
                  :class="['acc-btn', { active: form.account_type === 'CORRIENTE' }]"
                  @click="form.account_type = 'CORRIENTE'"
                >
                  🗂️ Corriente
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- Aviso Nequi/Daviplata -->
        <div v-if="form.payment_method !== 'bank_transfer'" class="wallet-notice">
          <span>📱</span>
          <p>Para {{ form.payment_method === 'nequi' ? 'Nequi' : 'Daviplata' }}, ingresa el número de celular como número de cuenta.</p>
        </div>

        <div v-if="saved" class="saved-banner">✅ Datos guardados correctamente.</div>
        <div v-if="errorMsg" class="error-banner">⚠️ {{ errorMsg }}</div>

        <button type="submit" class="btn-save" :disabled="saving">
          <span v-if="saving" class="spin">⟳</span>
          {{ saving ? 'Guardando…' : 'Guardar datos de pago' }}
        </button>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const methods = [
  { key: 'bank_transfer', label: 'Cuenta Bancaria', icon: '🏦' },
  { key: 'nequi',         label: 'Nequi',           icon: '📱' },
  { key: 'daviplata',     label: 'Daviplata',        icon: '💜' },
]

const form = ref({
  payment_method: 'bank_transfer',
  id_type:        'CC',
  id_number:      '',
  full_name:      '',
  email:          '',
  account_number: '',
  bank_id:        '',
  bank_code:      '',
  bank_name:      '',
  account_type:   'AHORROS',
})

const banks    = ref([])
const saving   = ref(false)
const saved    = ref(false)
const errorMsg = ref('')

const onBankChange = () => {
  const b = banks.value.find(b => b.id === form.value.bank_id)
  form.value.bank_name = b ? b.name  : ''
  form.value.bank_code = b ? b.code  : ''
}

const loadBanks = async () => {
  try {
    const { data } = await api.get('/professional/banks')
    banks.value = data.banks ?? []
  } catch { /* usa fallback visual */ }
}

const loadInfo = async () => {
  try {
    const { data } = await api.get('/professional/payment-info')
    if (data.payment_info) {
      const pi = data.payment_info
      form.value = {
        payment_method: pi.payment_method ?? 'bank_transfer',
        id_type:        pi.id_type        ?? 'CC',
        id_number:      pi.id_number      ?? '',
        full_name:      pi.full_name      ?? '',
        email:          pi.email          ?? '',
        account_number: pi.account_number ?? '',
        bank_id:        pi.bank_id        ?? '',
        bank_code:      pi.bank_code      ?? '',
        bank_name:      pi.bank_name      ?? '',
        account_type:   pi.account_type   ?? 'AHORROS',
      }
    }
  } catch { /* sin datos previos */ }
}

const save = async () => {
  saving.value   = true
  saved.value    = false
  errorMsg.value = ''
  try {
    await api.post('/professional/payment-info', form.value)
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e) {
    errorMsg.value = e.response?.data?.message ?? 'Error al guardar. Revisa los campos.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadBanks()
  await loadInfo()
})
</script>

<style scoped>
.datos-pago-wrap {
  max-width: 700px;
  margin: 0 auto;
}

.dp-card {
  background: white;
  border-radius: 20px;
  border: 1.5px solid #e2e8f0;
  padding: 32px 36px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dp-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dp-icon-wrap {
  width: 52px;
  height: 52px;
  background: #eff6ff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.dp-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
}

.dp-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* Tabs */
.method-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1.5px solid #e2e8f0;
  padding-bottom: 0;
}

.method-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 1.5px solid transparent;
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  background: #f8fafc;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  margin-bottom: -2px;
}

.method-tab.active {
  background: white;
  border-color: #e2e8f0;
  color: #2563eb;
  border-bottom-color: white;
}

/* Form */
.dp-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.hint {
  font-size: 11px;
  color: #94a3b8;
  text-transform: none;
  font-weight: 400;
  letter-spacing: 0;
}

.form-input {
  padding: 11px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: #0f172a;
  background: white;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

/* Account type */
.account-type-row {
  display: flex;
  gap: 8px;
}

.acc-btn {
  flex: 1;
  padding: 10px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.acc-btn.active {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
}

/* Wallet notice */
.wallet-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  color: #0369a1;
}

.wallet-notice p { margin: 0; }

/* Feedback */
.saved-banner {
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #166534;
}

.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #dc2626;
}

/* Submit */
.btn-save {
  align-self: center;
  padding: 13px 36px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.2s;
}

.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-save:hover:not(:disabled) { opacity: 0.9; }

.spin {
  display: inline-block;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .dp-card { padding: 20px 16px; }
  .form-row { grid-template-columns: 1fr; }
}
</style>

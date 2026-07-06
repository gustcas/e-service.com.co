<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-[18px] font-black text-[#0f172a]">Cuentas bancarias</h2>
        <p class="text-[13px] text-slate-400 mt-0.5">Gestiona las cuentas destino para dispersión de pagos</p>
      </div>
      <button @click="openModal(null)"
        class="bg-[#2563ff] text-white text-[13px] font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
        + Nueva cuenta
      </button>
    </div>

    <!-- Lista de cuentas -->
    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse">
        <div class="h-4 bg-slate-200 rounded-full w-1/3 mb-3"></div>
        <div class="h-3 bg-slate-100 rounded-full w-1/2"></div>
      </div>
    </div>

    <div v-else-if="accounts.length === 0" class="bg-white border border-slate-100 rounded-2xl p-10 text-center text-slate-400">
      <p class="text-[14px] font-semibold">No hay cuentas registradas</p>
      <p class="text-[12px] mt-1">Crea la primera cuenta bancaria para comenzar</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="acc in accounts" :key="acc.id"
        class="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between hover:border-slate-200 transition">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-[14px] font-black text-[#0f172a]">{{ acc.entity_name }}</span>
            <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full uppercase', entityTypeColor(acc.entity_type)]">
              {{ entityTypeLabel(acc.entity_type) }}
            </span>
            <span v-if="!acc.is_active" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500 uppercase">Inactiva</span>
          </div>
          <p class="text-[12px] text-slate-500">{{ acc.bank_name }} — {{ acc.account_type === 'ahorros' ? 'Ahorros' : 'Corriente' }} {{ acc.account_number }}</p>
          <p class="text-[12px] text-slate-400">Titular: {{ acc.account_holder }} · CC {{ acc.document_number }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="openModal(acc)"
            class="text-[12px] font-semibold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition">
            Editar
          </button>
          <button @click="deleteAccount(acc.id)"
            class="text-[12px] font-semibold text-red-500 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal crear/editar -->
    <Transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4" style="background:rgba(15,23,42,0.55);">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between px-7 py-5 border-b border-slate-100">
            <h3 class="font-black text-[#0f172a]">{{ editing ? 'Editar cuenta' : 'Nueva cuenta bancaria' }}</h3>
            <button @click="showModal = false" class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition text-lg">×</button>
          </div>
          <div class="p-7 space-y-4">

            <!-- Nombre empresa -->
            <div>
              <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Nombre de la empresa</label>
              <input v-model="form.entity_name" type="text" placeholder="Ej: ASECALIDAD Bogotá Norte"
                :class="['w-full border rounded-xl px-4 py-2.5 text-[13px] outline-none transition bg-slate-50 focus:bg-white', errors.entity_name ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-blue-400']" />
              <p v-if="errors.entity_name" class="text-[11px] text-red-500 mt-1">{{ errors.entity_name }}</p>
            </div>

            <!-- Entidad -->
            <div>
              <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Entidad</label>
              <select v-model="form.entity_type"
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-blue-400 transition bg-slate-50 focus:bg-white">
                <option value="asecalidad">ASECALIDAD</option>
                <option value="imavicx">IMAVICX</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
            </div>

            <!-- Banco y tipo cuenta -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Banco</label>
                <select v-model="form.bank_code"
                  :class="['w-full border rounded-xl px-4 py-2.5 text-[13px] outline-none transition bg-slate-50 focus:bg-white', errors.bank_code ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-blue-400']"
                  @change="onBankChange">
                  <option value="">Seleccionar banco</option>
                  <option v-for="b in banks" :key="b.code" :value="b.code">{{ b.name }}</option>
                </select>
                <p v-if="errors.bank_code" class="text-[11px] text-red-500 mt-1">{{ errors.bank_code }}</p>
              </div>
              <div>
                <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Tipo de cuenta</label>
                <select v-model="form.account_type"
                  class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-blue-400 transition bg-slate-50 focus:bg-white">
                  <option value="ahorros">Ahorros</option>
                  <option value="corriente">Corriente</option>
                </select>
              </div>
            </div>

            <!-- Número y titular -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Número de cuenta</label>
                <input v-model="form.account_number" type="text" placeholder="0000000000"
                  @input="form.account_number = form.account_number.replace(/\D/g, '')"
                  :class="['w-full border rounded-xl px-4 py-2.5 text-[13px] outline-none transition bg-slate-50 focus:bg-white', errors.account_number ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-blue-400']" />
                <p v-if="errors.account_number" class="text-[11px] text-red-500 mt-1">{{ errors.account_number }}</p>
              </div>
              <div>
                <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Titular de la cuenta</label>
                <input v-model="form.account_holder" type="text" placeholder="Nombre completo"
                  @input="form.account_holder = form.account_holder.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')"
                  :class="['w-full border rounded-xl px-4 py-2.5 text-[13px] outline-none transition bg-slate-50 focus:bg-white', errors.account_holder ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-blue-400']" />
                <p v-if="errors.account_holder" class="text-[11px] text-red-500 mt-1">{{ errors.account_holder }}</p>
              </div>
            </div>

            <!-- Cédula y email -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Cédula del titular</label>
                <input v-model="form.document_number" type="text" placeholder="00000000"
                  @input="form.document_number = form.document_number.replace(/\D/g, '')"
                  :class="['w-full border rounded-xl px-4 py-2.5 text-[13px] outline-none transition bg-slate-50 focus:bg-white', errors.document_number ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-blue-400']" />
                <p v-if="errors.document_number" class="text-[11px] text-red-500 mt-1">{{ errors.document_number }}</p>
              </div>
              <div>
                <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Email (opcional)</label>
                <input v-model="form.email" type="email" placeholder="correo@empresa.com"
                  :class="['w-full border rounded-xl px-4 py-2.5 text-[13px] outline-none transition bg-slate-50 focus:bg-white', errors.email ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-blue-400']" />
                <p v-if="errors.email" class="text-[11px] text-red-500 mt-1">{{ errors.email }}</p>
              </div>
            </div>

            <!-- Activa -->
            <div class="flex items-center gap-3">
              <input type="hidden" name="is_active" value="1" />
            </div>

            <!-- Botones -->
            <div class="flex gap-3 pt-2">
              <button @click="showModal = false"
                class="flex-1 border border-slate-200 text-slate-600 text-[13px] font-bold py-2.5 rounded-xl hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button @click="saveAccount" :disabled="saving"
                class="flex-1 bg-[#2563ff] text-white text-[13px] font-bold py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
                {{ saving ? 'Guardando...' : 'Guardar cuenta' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/services/api'
import { useFormValidation } from '@/composables/useFormValidation'

const { errors, validate, clearErrors } = useFormValidation()

const accounts  = ref([])
const loading   = ref(true)
const showModal = ref(false)
const editing   = ref(null)
const saving    = ref(false)

const banks = ref([])

const loadBanks = async () => {
  try {
    const { data } = await api.get('/admin/banks')
    if (data?.banks?.length) banks.value = data.banks
  } catch { /* usar fallback */ }
}

const form = reactive({
  entity_name:    '',
  entity_type:    'asecalidad',
  bank_name:      '',
  bank_code:      '',
  account_type:   'ahorros',
  account_number: '',
  account_holder: '',
  document_number:'',
  email:          '',
  is_active:      true,
})

const entityTypeLabel = (type) => {
  const labels = { asecalidad: 'ASECALIDAD', imavicx: 'IMAVICX', maintenance: 'Mantenimiento' }
  return labels[type] ?? type
}

const entityTypeColor = (type) => {
  const colors = {
    asecalidad:  'bg-blue-50 text-blue-600',
    imavicx:     'bg-purple-50 text-purple-600',
    maintenance: 'bg-teal-50 text-teal-600',
  }
  return colors[type] ?? 'bg-slate-100 text-slate-500'
}

const onBankChange = () => {
  const bank = banks.value.find(b => b.code === form.bank_code)
  form.bank_name = bank ? bank.name : ''
}

const loadAccounts = async () => {
  try {
    loading.value = true
    const { data } = await api.get('/admin/payout-accounts')
    accounts.value = data.accounts
  } catch { accounts.value = [] }
  finally { loading.value = false }
}

const openModal = (acc) => {
  editing.value = acc
  clearErrors()
  if (acc) {
    Object.assign(form, {
      entity_name:    acc.entity_name,
      entity_type:    acc.entity_type,
      bank_name:      acc.bank_name      ?? '',
      bank_code:      acc.bank_code      ?? '',
      account_type:   acc.account_type   ?? 'ahorros',
      account_number: acc.account_number,
      account_holder: acc.account_holder,
      document_number:acc.document_number ?? '',
      email:          acc.email           ?? '',
      is_active:      true,
    })
  } else {
    Object.assign(form, {
      entity_name: '', entity_type: 'asecalidad', bank_name: '',
      bank_code: '', account_type: 'ahorros', account_number: '',
      account_holder: '', document_number: '', email: '', is_active: true,
    })
  }
  showModal.value = true
}

const saveAccount = async () => {
  const ok = validate({
    entity_name:    { value: form.entity_name,    label: 'Nombre',           required: true },
    bank_code:      { value: form.bank_code,      label: 'Banco',            required: true },
    account_number: { value: form.account_number, label: 'Número de cuenta', required: true },
    account_holder: { value: form.account_holder, label: 'Titular',          required: true },
    document_number:{ value: form.document_number,label: 'Cédula',           required: true },
    email:          { value: form.email,          label: 'Email',            required: false, email: true },
  })
  if (!ok) return
  try {
    saving.value = true
    const payload = { ...form, email: form.email || null }
    if (editing.value) {
      await api.put(`/admin/payout-accounts/${editing.value.id}`, payload)
    } else {
      await api.post('/admin/payout-accounts', payload)
    }
    await loadAccounts()
    showModal.value = false
  } catch (err) {
    const backendErrors = err?.response?.data?.errors ?? {}
    Object.entries(backendErrors).forEach(([field, messages]) => {
      errors[field] = Array.isArray(messages) ? messages[0] : messages
    })
  }
  finally { saving.value = false }
}

const deleteAccount = async (id) => {
  if (!confirm('¿Eliminar esta cuenta bancaria?')) return
  try {
    await api.delete(`/admin/payout-accounts/${id}`)
    await loadAccounts()
  } catch { /* silenciar */ }
}

onMounted(async () => {
  await Promise.all([loadAccounts(), loadBanks()])
})

</script>

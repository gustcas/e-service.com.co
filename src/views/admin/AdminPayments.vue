<template>
  <div class="payments-page">

    <!-- Cabecera -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">💳</div>
        <div>
          <h2 class="section-title">Pagos y Dispersiones</h2>
          <p class="section-subtitle">Gestión de cobros al cliente y pagos al profesional</p>
        </div>
      </div>
      <button class="btn-refresh" @click="loadAll" :disabled="loading">
        <span :class="{ spinning: loading }">🔄</span>
      </button>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid" v-if="stats">
      <div class="kpi-card">
        <div class="kpi-icon green">💰</div>
        <div class="kpi-body">
          <div class="kpi-value">{{ stats.total_cobrado_fmt }}</div>
          <div class="kpi-label">Total cobrado</div>
          <div class="kpi-sub">{{ stats.cobros_aprobados }} pagos aprobados</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon yellow">⏳</div>
        <div class="kpi-body">
          <div class="kpi-value">${{ fmtNum(stats.cobros_pendientes) }}</div>
          <div class="kpi-label">Cobros pendientes</div>
          <div class="kpi-sub">{{ stats.cobros_fallidos }} fallidos</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon blue">🏦</div>
        <div class="kpi-body">
          <div class="kpi-value">{{ stats.total_dispersado_fmt }}</div>
          <div class="kpi-label">Total dispersado</div>
          <div class="kpi-sub">a profesionales</div>
        </div>
      </div>
      <div class="kpi-card" :class="{ 'kpi-alert': stats.dispersiones_pendientes > 0 }">
        <div class="kpi-icon red">🔔</div>
        <div class="kpi-body">
          <div class="kpi-value">{{ stats.dispersiones_pendientes }}</div>
          <div class="kpi-label">Dispersiones pendientes</div>
          <div class="kpi-sub">requieren atención</div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-row">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ tab.label }}
        <span v-if="tab.id === 'pending' && stats?.dispersiones_pendientes > 0" class="tab-badge">
          {{ stats.dispersiones_pendientes }}
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando…</p>
    </div>

    <template v-else>

      <!-- ── Tab: Cobros al cliente ── -->
      <div v-if="activeTab === 'payments'" class="table-card">
        <div class="table-header">
          <h3 class="table-title">Cobros al cliente</h3>
          <div class="filter-row">
            <select v-model="paymentFilter" @change="loadPayments" class="filter-select">
              <option value="">Todos los estados</option>
              <option value="approved">Aprobados</option>
              <option value="pending">Pendientes</option>
              <option value="failed">Fallidos</option>
            </select>
          </div>
        </div>

        <!-- Simulador de pago (solo dev) -->
        <div class="sim-box">
          <span class="sim-label">🧪 Modo desarrollo</span>
          <input v-model="simSrId" type="number" placeholder="ID de solicitud (SR#)" class="sim-input" />
          <button class="btn-simulate" :disabled="simulating || !simSrId" @click="simulatePayment">
            <span v-if="simulating" class="spinning">⏳</span>
            <span v-else>Simular pago aprobado</span>
          </button>
          <span v-if="simResult" class="sim-result" :class="simResult.success ? 'ok' : 'err'">{{ simResult.message }}</span>
        </div>

        <div v-if="payments.data?.length === 0" class="empty-state">
          Sin cobros registrados aún
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Referencia</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in payments.data" :key="p.id">
                <td class="mono">{{ p.id }}</td>
                <td class="mono small">{{ p.reference }}</td>
                <td><strong>{{ p.client_name }}</strong></td>
                <td>
                  {{ p.service_name }}
                  <span v-if="p.service_request_id" class="sr-link">#{{ p.service_request_id }}</span>
                </td>
                <td class="amount">{{ p.amount_formatted }}</td>
                <td><span class="badge" :class="p.status">{{ statusLabel(p.status) }}</span></td>
                <td class="date">{{ p.paid_at ?? p.created_at }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination" v-if="payments.last_page > 1">
          <button :disabled="payments.current_page <= 1" @click="loadPayments(payments.current_page - 1)">‹</button>
          <span>Página {{ payments.current_page }} / {{ payments.last_page }}</span>
          <button :disabled="payments.current_page >= payments.last_page" @click="loadPayments(payments.current_page + 1)">›</button>
        </div>
      </div>

      <!-- ── Tab: Dispersiones ── -->
      <div v-else-if="activeTab === 'payouts'" class="table-card">
        <div class="table-header">
          <h3 class="table-title">Dispersiones al profesional</h3>
          <div class="filter-row">
            <select v-model="payoutFilter" @change="loadPayouts" class="filter-select">
              <option value="">Todos los estados</option>
              <option value="processing">En proceso</option>
              <option value="approved">Aprobadas</option>
              <option value="failed">Fallidas</option>
            </select>
          </div>
        </div>

        <div v-if="payouts.data?.length === 0" class="empty-state">
          Sin dispersiones registradas aún
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Profesional</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Estado Wompi</th>
                <th>Estado</th>
                <th>Origen</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in payouts.data" :key="p.id">
                <td class="mono">{{ p.id }}</td>
                <td><strong>{{ p.professional_name }}</strong></td>
                <td class="amount">{{ p.amount_formatted }}</td>
                <td>{{ methodLabel(p.payment_method) }}</td>
                <td><span class="badge wompi" :class="(p.wompi_status ?? '').toLowerCase()">{{ p.wompi_status ?? '—' }}</span></td>
                <td><span class="badge" :class="p.status">{{ statusLabel(p.status) }}</span></td>
                <td>
                  <span class="trigger-badge" :class="p.triggered_by">
                    {{ p.triggered_by === 'auto' ? 'Automático' : 'Manual' }}
                  </span>
                </td>
                <td class="date">{{ p.paid_at ?? p.created_at }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination" v-if="payouts.last_page > 1">
          <button :disabled="payouts.current_page <= 1" @click="loadPayouts(payouts.current_page - 1)">‹</button>
          <span>Página {{ payouts.current_page }} / {{ payouts.last_page }}</span>
          <button :disabled="payouts.current_page >= payouts.last_page" @click="loadPayouts(payouts.current_page + 1)">›</button>
        </div>
      </div>

      <!-- ── Tab: Pendientes de dispersar ── -->
      <div v-else-if="activeTab === 'pending'" class="table-card">
        <div class="table-header">
          <h3 class="table-title">Pendientes de dispersar</h3>
          <p class="table-subtitle">Servicios completados y pagados donde el profesional aún no ha recibido su pago</p>
        </div>

        <div v-if="pending.data?.length === 0" class="empty-state">
          No hay dispersiones pendientes
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SR#</th>
                <th>Servicio</th>
                <th>Profesional</th>
                <th>Monto bruto</th>
                <th>Estado payout</th>
                <th>Última actualización</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sr in pending.data" :key="sr.id">
                <td class="mono">{{ sr.id }}</td>
                <td>{{ sr.service_name }}</td>
                <td><strong>{{ sr.professional_name }}</strong></td>
                <td class="amount">{{ sr.budget_formatted }}</td>
                <td>
                  <span class="badge" :class="sr.payout_status === 'payout_failed' ? 'failed' : 'processing'">
                    {{ sr.payout_status === 'payout_failed' ? 'Falló' : 'Pendiente' }}
                  </span>
                </td>
                <td class="date">{{ sr.updated_at }}</td>
                <td>
                  <button
                    class="btn-disburse"
                    :disabled="disbursing === sr.id"
                    @click="disburse(sr.id)"
                  >
                    <span v-if="disbursing === sr.id" class="spinning">⏳</span>
                    <span v-else>💸 Dispersar</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Resultado de dispersión -->
        <div v-if="disburseResult" class="disburse-result" :class="disburseResult.success ? 'result-ok' : 'result-err'">
          {{ disburseResult.message }}
          <button class="close-result" @click="disburseResult = null">✕</button>
        </div>

        <div class="pagination" v-if="pending.last_page > 1">
          <button :disabled="pending.current_page <= 1" @click="loadPending(pending.current_page - 1)">‹</button>
          <span>Página {{ pending.current_page }} / {{ pending.last_page }}</span>
          <button :disabled="pending.current_page >= pending.last_page" @click="loadPending(pending.current_page + 1)">›</button>
        </div>
      </div>

    </template>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/services/api'

const loading       = ref(false)
const activeTab     = ref('pending')
const paymentFilter = ref('')
const payoutFilter  = ref('')
const disbursing    = ref(null)
const disburseResult = ref(null)
const simSrId       = ref('')
const simulating    = ref(false)
const simResult     = ref(null)

const stats    = ref(null)
const payments = ref({ data: [], last_page: 1, current_page: 1 })
const payouts  = ref({ data: [], last_page: 1, current_page: 1 })
const pending  = ref({ data: [], last_page: 1, current_page: 1 })

const tabs = [
  { id: 'pending',  icon: '🔔', label: 'Pendientes de dispersar' },
  { id: 'payments', icon: '💳', label: 'Cobros al cliente' },
  { id: 'payouts',  icon: '🏦', label: 'Dispersiones' },
]

const fmtNum = (v) => new Intl.NumberFormat('es-CO').format(v ?? 0)

const statusLabel = (s) => ({
  approved:   'Aprobado',
  pending:    'Pendiente',
  failed:     'Fallido',
  processing: 'En proceso',
}[s] ?? s)

const methodLabel = (m) => ({
  bank_transfer: 'Transferencia',
  nequi:         'Nequi',
  daviplata:     'Daviplata',
}[m] ?? m)

const loadStats = async () => {
  try {
    const { data } = await api.get('/admin/payments/stats')
    stats.value = data
  } catch { /* silencioso */ }
}

const loadPayments = async (page = 1) => {
  try {
    const params = { page }
    if (paymentFilter.value) params.status = paymentFilter.value
    const { data } = await api.get('/admin/payments', { params })
    payments.value = data
  } catch { /* silencioso */ }
}

const loadPayouts = async (page = 1) => {
  try {
    const params = { page }
    if (payoutFilter.value) params.status = payoutFilter.value
    const { data } = await api.get('/admin/payouts', { params })
    payouts.value = data
  } catch { /* silencioso */ }
}

const loadPending = async (page = 1) => {
  try {
    const { data } = await api.get('/admin/payments/pending-payouts', { params: { page } })
    pending.value = data
  } catch { /* silencioso */ }
}

const loadAll = async () => {
  loading.value = true
  await Promise.all([loadStats(), loadPayments(), loadPayouts(), loadPending()])
  loading.value = false
}

const disburse = async (srId) => {
  disbursing.value = srId
  disburseResult.value = null
  try {
    const { data } = await api.post(`/admin/payouts/${srId}/disburse`)
    disburseResult.value = { success: data.success, message: data.message }
    if (data.success) {
      await Promise.all([loadPending(), loadPayouts(), loadStats()])
    }
  } catch (err) {
    const msg = err.response?.data?.message ?? 'Error al dispersar'
    disburseResult.value = { success: false, message: msg }
  } finally {
    disbursing.value = null
  }
}

const simulatePayment = async () => {
  simulating.value = true
  simResult.value  = null
  try {
    const { data } = await api.post(`/admin/payments/${simSrId.value}/simulate`)
    simResult.value = { success: true, message: data.message }
    simSrId.value = ''
    await Promise.all([loadPayments(), loadStats()])
  } catch (err) {
    simResult.value = { success: false, message: err.response?.data?.message ?? 'Error al simular' }
  } finally {
    simulating.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'payments' && !payments.value.data.length) loadPayments()
  if (tab === 'payouts'  && !payouts.value.data.length)  loadPayouts()
})

onMounted(loadAll)
</script>

<style scoped>
.payments-page { display: flex; flex-direction: column; gap: 24px; }

/* Cabecera */
.page-header  { display: flex; justify-content: space-between; align-items: center; }
.header-left  { display: flex; align-items: center; gap: 16px; }
.header-icon  { font-size: 36px; }
.section-title    { font-size: 26px; font-weight: 900; color: #0f172a; margin: 0; }
.section-subtitle { color: #64748b; font-size: 14px; margin-top: 2px; }
.btn-refresh {
  width: 44px; height: 44px; border-radius: 12px; border: none;
  background: #f1f5f9; font-size: 20px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.btn-refresh:disabled { opacity: .5; cursor: not-allowed; }
@keyframes spin { to { transform: rotate(360deg); } }
.spinning { display: inline-block; animation: spin .8s linear infinite; }

/* KPIs */
.kpi-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
}
.kpi-card {
  background: white; border-radius: 18px; padding: 20px;
  display: flex; align-items: flex-start; gap: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  transition: box-shadow .2s;
}
.kpi-card.kpi-alert { border: 2px solid #fca5a5; background: #fff5f5; }
.kpi-icon {
  width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 26px;
}
.kpi-icon.green  { background: #dcfce7; }
.kpi-icon.yellow { background: #fef9c3; }
.kpi-icon.blue   { background: #dbeafe; }
.kpi-icon.red    { background: #fee2e2; }
.kpi-value { font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1.2; }
.kpi-label { font-size: 12px; color: #64748b; font-weight: 600; margin-top: 3px; }
.kpi-sub   { font-size: 11px; color: #94a3b8; margin-top: 2px; }

/* Tabs */
.tabs-row { display: flex; gap: 8px; flex-wrap: wrap; }
.tab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: 12px; border: none;
  background: #f1f5f9; color: #64748b; font-weight: 700; font-size: 14px;
  cursor: pointer; transition: all .2s; white-space: nowrap;
}
.tab-btn.active { background: linear-gradient(135deg, #eff6ff, #dbeafe); color: #2563eb; }
.tab-badge {
  background: #ef4444; color: white; padding: 2px 8px;
  border-radius: 10px; font-size: 11px; font-weight: 800;
}

/* Loading */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 80px 0; gap: 16px; color: #64748b;
}
.spinner {
  width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2563eb;
  border-radius: 50%; animation: spin .8s linear infinite;
}

/* Table card */
.table-card {
  background: white; border-radius: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06); overflow: hidden;
}
.table-header {
  padding: 24px 24px 16px; display: flex; justify-content: space-between;
  align-items: flex-start; gap: 16px; flex-wrap: wrap;
}
.table-title    { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }
.table-subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
.filter-row { display: flex; gap: 8px; }
.filter-select {
  padding: 8px 14px; border-radius: 10px; border: 1px solid #e2e8f0;
  font-size: 13px; font-weight: 600; color: #475569; background: #f8fafc;
  cursor: pointer;
}

/* Table */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 600px; }
thead { background: #f8fafc; }
th {
  padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800;
  color: #64748b; text-transform: uppercase; letter-spacing: .5px; white-space: nowrap;
}
td { padding: 14px 16px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #475569; }
td.mono  { font-family: monospace; font-size: 12px; }
td.small { font-size: 11px; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
td.amount { font-weight: 800; color: #0f172a; white-space: nowrap; }
.sr-link {
  display: inline-block; margin-left: 6px;
  font-size: 10px; font-weight: 700; color: #2563eb;
  background: #eff6ff; border: 1px solid #bfdbfe;
  padding: 1px 6px; border-radius: 4px; font-family: monospace;
}
td.date   { font-size: 12px; color: #94a3b8; white-space: nowrap; }

/* Badges */
.badge {
  display: inline-block; padding: 4px 10px; border-radius: 8px;
  font-size: 11px; font-weight: 800; white-space: nowrap;
}
.badge.approved, .badge.approved   { background: #dcfce7; color: #16a34a; }
.badge.pending                     { background: #fef9c3; color: #d97706; }
.badge.failed                      { background: #fee2e2; color: #dc2626; }
.badge.processing                  { background: #dbeafe; color: #2563eb; }

/* Wompi status badges */
.badge.wompi.approved { background: #dcfce7; color: #16a34a; }
.badge.wompi.pending  { background: #fef9c3; color: #d97706; }
.badge.wompi.declined, .badge.wompi.error { background: #fee2e2; color: #dc2626; }
.badge.wompi.simulated { background: #f3e8ff; color: #7c3aed; }

.trigger-badge {
  display: inline-block; padding: 3px 8px; border-radius: 6px;
  font-size: 11px; font-weight: 700;
}
.trigger-badge.auto   { background: #f0fdf4; color: #16a34a; }
.trigger-badge.manual { background: #eff6ff; color: #2563eb; }

/* Disburse button */
.btn-disburse {
  padding: 8px 16px; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #2563eb, #3b82f6); color: white;
  font-weight: 700; font-size: 13px; cursor: pointer; transition: all .2s;
  white-space: nowrap;
}
.btn-disburse:hover:not(:disabled) { background: linear-gradient(135deg, #1d4ed8, #2563eb); }
.btn-disburse:disabled { opacity: .5; cursor: not-allowed; }

/* Disburse result */
.disburse-result {
  margin: 0 24px 24px; padding: 14px 18px; border-radius: 12px;
  font-size: 14px; font-weight: 600; display: flex; justify-content: space-between; align-items: center;
}
.result-ok  { background: #dcfce7; color: #15803d; }
.result-err { background: #fee2e2; color: #dc2626; }
.close-result { background: none; border: none; cursor: pointer; font-size: 16px; opacity: .7; }

/* Empty */
.empty-state { text-align: center; color: #94a3b8; padding: 48px; font-size: 14px; }

/* Pagination */
.pagination {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  padding: 20px; border-top: 1px solid #f1f5f9; font-size: 13px; color: #64748b; font-weight: 600;
}
.pagination button {
  width: 36px; height: 36px; border-radius: 10px; border: none;
  background: #f1f5f9; font-size: 18px; font-weight: 700; cursor: pointer; transition: all .2s;
}
.pagination button:hover:not(:disabled) { background: #dbeafe; color: #2563eb; }
.pagination button:disabled { opacity: .3; cursor: not-allowed; }

/* Simulador dev */
.sim-box {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin: 0 24px 16px; padding: 12px 16px; background: #fefce8;
  border: 1px dashed #fbbf24; border-radius: 12px;
}
.sim-label { font-size: 12px; font-weight: 800; color: #92400e; white-space: nowrap; }
.sim-input {
  padding: 7px 12px; border-radius: 8px; border: 1px solid #e2e8f0;
  font-size: 13px; width: 160px;
}
.btn-simulate {
  padding: 8px 16px; border-radius: 10px; border: none;
  background: #f59e0b; color: white; font-weight: 700; font-size: 13px;
  cursor: pointer; transition: all .2s; white-space: nowrap;
}
.btn-simulate:hover:not(:disabled) { background: #d97706; }
.btn-simulate:disabled { opacity: .5; cursor: not-allowed; }
.sim-result { font-size: 12px; font-weight: 700; }
.sim-result.ok  { color: #16a34a; }
.sim-result.err { color: #dc2626; }

@media (max-width: 900px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .kpi-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .kpi-value { font-size: 18px; }
  .table-header { flex-direction: column; }
}
</style>

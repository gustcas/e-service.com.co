<template>
  <div class="live-page">

    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">🔴</div>
        <div>
          <h1 class="page-title">Servicios en Vivo</h1>
          <p class="page-subtitle">
            <span class="live-dot"></span>
            Monitoreo en tiempo real · Actualiza cada {{ POLL_INTERVAL / 1000 }}s
            <span class="subtitle-sep">·</span>
            <span class="last-update">Última: {{ lastUpdate }}</span>
          </p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-refresh" @click="refreshAll" :disabled="loadingSummary">
          <span :class="{ spinning: loadingSummary }">🔄</span>
          <span class="btn-text">Actualizar</span>
        </button>
      </div>
    </div>

    <!-- ── KPI Cards ───────────────────────────────────────────── -->
    <div class="stat-row">
      <div v-for="kpi in kpis" :key="kpi.key" :class="['mini-stat', kpi.color]">
        <span class="mini-stat-icon">{{ kpi.icon }}</span>
        <div>
          <div class="mini-stat-value">
            <span v-if="loadingSummary" class="sk-val"></span>
            <span v-else>{{ summary[kpi.key] ?? 0 }}</span>
          </div>
          <div class="mini-stat-label">{{ kpi.label }}</div>
        </div>
      </div>
    </div>

    <!-- ── Tabs ────────────────────────────────────────────────── -->
    <div class="live-tabs">
      <button v-for="tab in tabs" :key="tab.key"
        :class="['live-tab', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key">
        <span>{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
        <span v-if="tabBadge(tab.key)" class="tab-badge">{{ tabBadge(tab.key) }}</span>
      </button>
    </div>

    <!-- ── Filtros ─────────────────────────────────────────────── -->
    <div class="filters-bar">
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" placeholder="Buscar por cliente, profesional o ID..."
          class="search-input" @input="onSearch" />
        <button v-if="search" class="search-clear" @click="search = ''">✕</button>
      </div>

      <div v-if="activeTab === 'requests'" class="filter-group">
        <button v-for="s in statusFilters" :key="s.value"
          :class="['filter-chip', { active: statusFilter === s.value }]"
          @click="setStatusFilter(s.value)">
          <span :class="['status-dot-mini', s.value]"></span>
          {{ s.label }}
        </button>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- TAB: SOLICITUDES                                          -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'requests'">
      <div v-if="loadingRequests" class="skeleton-list">
        <div v-for="n in 5" :key="n" class="skeleton-row">
          <div class="sk sk-avatar"></div>
          <div class="sk-info"><div class="sk sk-line wide"></div><div class="sk sk-line narrow"></div></div>
          <div class="sk sk-badge"></div><div class="sk sk-badge"></div><div class="sk sk-btn"></div>
        </div>
      </div>

      <div v-else-if="filteredRequests.length === 0" class="empty-state">
        <span class="empty-icon">📋</span>
        <p class="empty-title">Sin solicitudes</p>
        <p class="empty-sub">No hay solicitudes que coincidan con los filtros</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Servicio</th>
              <th>Cliente</th>
              <th class="hide-md">Profesional</th>
              <th>Estado</th>
              <th class="hide-sm">Creado</th>
              <th class="hide-sm">Actualizado</th>
              <th class="hide-sm">Tiempo</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in filteredRequests" :key="req.id" class="user-row">
              <td class="td-id">
                <span class="req-id">#{{ String(req.id).padStart(4,'0') }}</span>
              </td>
              <td>
                <span class="svc-name">{{ req.service_name }}</span>
              </td>
              <td class="td-user">
                <div class="user-cell">
                  <div class="avatar-wrap">
                    <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${req.client_name}`"
                      class="user-avatar" />
                    <span :class="['online-dot', req.client_online ? 'active' : 'inactive']"></span>
                  </div>
                  <div class="user-meta">
                    <span class="user-name">{{ req.client_name }}</span>
                    <span class="user-id hide-desktop">{{ req.client_email }}</span>
                  </div>
                </div>
              </td>
              <td class="td-user hide-md">
                <div v-if="req.professional_name" class="user-cell">
                  <div class="avatar-wrap">
                    <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${req.professional_name}`"
                      class="user-avatar" />
                    <span :class="['online-dot', req.professional_online ? 'active' : 'inactive']"></span>
                  </div>
                  <div class="user-meta">
                    <span class="user-name">{{ req.professional_name }}</span>
                  </div>
                </div>
                <span v-else class="no-prof">Sin asignar</span>
              </td>
              <td>
                <span :class="['status-badge', statusClass(req.status)]">
                  <span class="status-dot"></span>
                  {{ statusLabel(req.status) }}
                </span>
              </td>
              <td class="hide-sm">
                <span class="date-text">{{ req.created_at }}</span>
              </td>
              <td class="hide-sm">
                <span class="date-text">{{ req.updated_at }}</span>
              </td>
              <td class="hide-sm">
                <span :class="['elapsed-badge', req.elapsed.includes('h') || req.elapsed.includes('d') ? 'slow' : '']">
                  {{ req.elapsed }}
                </span>
              </td>
              <td>
                <button class="btn-eye" @click="openDetail(req)" title="Ver detalle">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- TAB: USUARIOS CONECTADOS                                  -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'users'">
      <div v-if="loadingUsers" class="skeleton-list">
        <div v-for="n in 4" :key="n" class="skeleton-row">
          <div class="sk sk-avatar"></div>
          <div class="sk-info"><div class="sk sk-line wide"></div><div class="sk sk-line narrow"></div></div>
          <div class="sk sk-badge"></div>
        </div>
      </div>
      <div v-else class="connected-grid">

        <!-- Clientes conectados -->
        <div class="connected-section">
          <div class="section-head">
            <span class="section-head-icon">👤</span>
            <span class="section-head-title">Clientes conectados</span>
            <span class="section-count">{{ connectedUsers.clients.length }}</span>
          </div>
          <div v-if="connectedUsers.clients.length === 0" class="empty-state small">
            <span class="empty-icon">👤</span>
            <p class="empty-title">Ningún cliente conectado</p>
          </div>
          <div v-else class="connected-list">
            <div v-for="u in filteredClients" :key="u.id" class="connected-card">
              <div class="avatar-wrap">
                <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`" class="user-avatar" />
                <span class="online-dot active"></span>
              </div>
              <div class="connected-info">
                <div class="user-name">{{ u.name }}</div>
                <div class="user-id">{{ u.email }}</div>
              </div>
              <div class="connected-right">
                <span v-if="u.active_request" class="status-badge status-pending">
                  <span class="status-dot"></span>
                  Sol. #{{ u.active_request }}
                </span>
                <span v-else class="status-badge status-neutral">
                  <span class="status-dot"></span>Navegando
                </span>
                <span class="date-text">{{ u.last_seen_at }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Profesionales conectados -->
        <div class="connected-section">
          <div class="section-head">
            <span class="section-head-icon">💼</span>
            <span class="section-head-title">Profesionales conectados</span>
            <span class="section-count">{{ connectedUsers.professionals.length }}</span>
          </div>
          <div v-if="connectedUsers.professionals.length === 0" class="empty-state small">
            <span class="empty-icon">💼</span>
            <p class="empty-title">Ningún profesional conectado</p>
          </div>
          <div v-else class="connected-list">
            <div v-for="u in filteredProfessionals" :key="u.id" class="connected-card">
              <div class="avatar-wrap">
                <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`" class="user-avatar" />
                <span class="online-dot active"></span>
              </div>
              <div class="connected-info">
                <div class="user-name">{{ u.name }}</div>
                <div class="user-id">{{ u.email }}</div>
              </div>
              <div class="connected-right">
                <span v-if="u.is_busy" class="status-badge status-active">
                  <span class="status-dot"></span>En servicio
                </span>
                <span v-else class="status-badge status-neutral">
                  <span class="status-dot"></span>Disponible
                </span>
                <span class="date-text">{{ u.last_seen_at }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- TAB: CHATS ACTIVOS                                        -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'chats'">
      <div v-if="loadingChats" class="skeleton-list">
        <div v-for="n in 4" :key="n" class="skeleton-row">
          <div class="sk sk-avatar"></div>
          <div class="sk-info"><div class="sk sk-line wide"></div><div class="sk sk-line narrow"></div></div>
          <div class="sk sk-badge"></div>
        </div>
      </div>
      <div v-else-if="filteredChats.length === 0" class="empty-state">
        <span class="empty-icon">💬</span>
        <p class="empty-title">Sin chats activos</p>
        <p class="empty-sub">No hay conversaciones en las últimas 24 horas</p>
      </div>
      <div v-else class="table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>Solicitud</th>
              <th>Cliente</th>
              <th>Profesional</th>
              <th>Último mensaje</th>
              <th class="hide-sm">Hora</th>
              <th class="hide-sm">Mensajes</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="chat in filteredChats" :key="chat.request_id" class="user-row">
              <td><span class="req-id">#{{ String(chat.request_id).padStart(4,'0') }}</span></td>
              <td>
                <div class="user-cell">
                  <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.client_name}`" class="user-avatar" />
                  <span class="user-name">{{ chat.client_name }}</span>
                </div>
              </td>
              <td>
                <div class="user-cell">
                  <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.professional_name}`" class="user-avatar" />
                  <span class="user-name">{{ chat.professional_name }}</span>
                </div>
              </td>
              <td>
                <div class="last-msg">
                  <span class="msg-sender">{{ chat.sender_name }}:</span>
                  <span class="msg-text">{{ truncate(chat.last_message, 40) }}</span>
                </div>
              </td>
              <td class="hide-sm"><span class="date-text">{{ chat.last_message_time }}</span></td>
              <td class="hide-sm">
                <button class="msg-count-btn" @click="openChatViewer(chat)" title="Ver conversación">
                  {{ chat.total_messages }}
                </button>
              </td>
              <td>
                <span :class="['status-badge', statusClass(chat.status)]">
                  <span class="status-dot"></span>
                  {{ statusLabel(chat.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- TAB: INCIDENCIAS                                          -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'incidents'">
      <div v-if="loadingIncidents" class="skeleton-list">
        <div v-for="n in 3" :key="n" class="skeleton-row">
          <div class="sk sk-avatar"></div>
          <div class="sk-info"><div class="sk sk-line wide"></div><div class="sk sk-line narrow"></div></div>
          <div class="sk sk-badge"></div>
        </div>
      </div>
      <div v-else-if="filteredIncidents.length === 0" class="empty-state">
        <span class="empty-icon">✅</span>
        <p class="empty-title">Sin incidencias</p>
        <p class="empty-sub">No hay solicitudes pendientes por más de 30 minutos sin profesional asignado</p>
      </div>
      <div v-else class="incident-list">
        <div v-for="inc in filteredIncidents" :key="inc.id" class="incident-card">
          <div class="incident-left">
            <div class="incident-icon">⚠️</div>
            <div>
              <div class="incident-title">{{ inc.label }}</div>
              <div class="incident-sub">Sol. #{{ String(inc.id).padStart(4,'0') }} · {{ inc.service_name }}</div>
            </div>
          </div>
          <div class="incident-mid">
            <div class="user-cell">
              <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${inc.client_name}`" class="user-avatar sm" />
              <div class="user-meta">
                <span class="user-name">{{ inc.client_name }}</span>
                <span class="user-id">{{ inc.client_email }}</span>
              </div>
            </div>
          </div>
          <div class="incident-right">
            <span class="elapsed-badge slow">{{ inc.elapsed }}</span>
            <span class="date-text">{{ inc.created_at }}</span>
            <span :class="['status-badge', statusClass(inc.status)]">
              <span class="status-dot"></span>
              {{ statusLabel(inc.status) }}
            </span>
            <button class="btn-reassign" @click="openReassign(inc)">↺ Reasignar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- MODAL: Detalle de Solicitud                              -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="detailModal.open" class="chat-overlay" @click.self="detailModal.open = false">
          <div class="detail-modal">
            <div class="chat-header">
              <div class="chat-header-left">
                <span class="req-id-badge" style="font-size:14px">#{{ String(detailModal.req.id).padStart(4,'0') }}</span>
                <span style="font-size:15px;font-weight:700;margin-left:8px">{{ detailModal.req.service_name }}</span>
              </div>
              <button class="chat-close-btn" @click="detailModal.open = false">✕</button>
            </div>
            <div class="detail-body">
              <div class="detail-section">
                <div class="detail-section-title">👤 Cliente</div>
                <div class="detail-row"><span>Nombre</span><strong>{{ detailModal.req.client_name }}</strong></div>
                <div class="detail-row"><span>Email</span><strong>{{ detailModal.req.client_email }}</strong></div>
                <div class="detail-row">
                  <span>Estado conexión</span>
                  <span :class="['online-pill', detailModal.req.client_online ? 'on' : 'off']">
                    {{ detailModal.req.client_online ? 'En línea' : 'Desconectado' }}
                  </span>
                </div>
              </div>
              <div class="detail-section">
                <div class="detail-section-title">💼 Profesional</div>
                <template v-if="detailModal.req.professional_name">
                  <div class="detail-row"><span>Nombre</span><strong>{{ detailModal.req.professional_name }}</strong></div>
                  <div class="detail-row"><span>Email</span><strong>{{ detailModal.req.professional_email }}</strong></div>
                  <div class="detail-row">
                    <span>Estado conexión</span>
                    <span :class="['online-pill', detailModal.req.professional_online ? 'on' : 'off']">
                      {{ detailModal.req.professional_online ? 'En línea' : 'Desconectado' }}
                    </span>
                  </div>
                </template>
                <div v-else class="detail-row"><span>Asignado</span><strong>Sin asignar</strong></div>
              </div>
              <div class="detail-section">
                <div class="detail-section-title">📋 Solicitud</div>
                <div class="detail-row"><span>Estado</span>
                  <span :class="['status-badge', statusClass(detailModal.req.status)]">
                    <span class="status-dot"></span>{{ statusLabel(detailModal.req.status) }}
                  </span>
                </div>
                <div class="detail-row"><span>Presupuesto</span><strong>${{ Number(detailModal.req.budget||0).toLocaleString('es-CO') }}</strong></div>
                <div v-if="detailModal.req.description" class="detail-row"><span>Descripción</span><strong>{{ detailModal.req.description }}</strong></div>
                <div v-if="detailModal.req.address" class="detail-row"><span>Dirección</span><strong>{{ detailModal.req.address }}</strong></div>
                <div v-if="detailModal.req.service_date" class="detail-row"><span>Fecha</span><strong>{{ detailModal.req.service_date }}</strong></div>
                <div v-if="detailModal.req.service_time" class="detail-row"><span>Hora</span><strong>{{ detailModal.req.service_time }}</strong></div>
                <div v-if="detailModal.req.people_count" class="detail-row"><span>Personas</span><strong>{{ detailModal.req.people_count }}</strong></div>
                <div class="detail-row"><span>Creado</span><strong>{{ detailModal.req.created_at }}</strong></div>
                <div class="detail-row"><span>Actualizado</span><strong>{{ detailModal.req.updated_at }}</strong></div>
                <div class="detail-row"><span>Tiempo</span><strong>{{ detailModal.req.elapsed }}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- MODAL: Reasignación de Incidencia                        -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="reassignModal.open" class="chat-overlay" @click.self="reassignModal.open = false">
          <div class="detail-modal">
            <div class="chat-header">
              <div class="chat-header-left">
                <span style="font-size:15px;font-weight:700">↺ Reasignar Sol. #{{ String(reassignModal.incidentId).padStart(4,'0') }}</span>
              </div>
              <button class="chat-close-btn" @click="reassignModal.open = false">✕</button>
            </div>
            <div class="detail-body">
              <p style="font-size:13px;color:#64748b;margin:0 0 12px">Selecciona un profesional disponible (en línea, con capacidad para este servicio):</p>
              <div v-if="reassignModal.loading" style="text-align:center;padding:24px;color:#94a3b8">Buscando profesionales...</div>
              <div v-else-if="reassignModal.professionals.length === 0" style="text-align:center;padding:24px;color:#94a3b8">
                No hay profesionales disponibles en línea para este servicio.
              </div>
              <div v-else class="reassign-list">
                <div v-for="p in reassignModal.professionals" :key="p.id"
                  :class="['reassign-item', { selected: reassignModal.selectedId === p.id }]"
                  @click="reassignModal.selectedId = p.id">
                  <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`" class="user-avatar" />
                  <span class="user-name">{{ p.name }}</span>
                  <span v-if="reassignModal.selectedId === p.id" style="margin-left:auto;color:#2563eb;font-weight:800">✓</span>
                </div>
              </div>
              <div v-if="reassignModal.error" class="error-banner" style="margin-top:8px">{{ reassignModal.error }}</div>
              <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
                <button class="btn-refresh" @click="reassignModal.open = false">Cancelar</button>
                <button class="btn-reassign-confirm"
                  :disabled="!reassignModal.selectedId || reassignModal.saving"
                  @click="confirmReassign">
                  {{ reassignModal.saving ? 'Asignando...' : '✓ Confirmar asignación' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- MODAL: Visor de Chat (solo lectura)                      -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="chatViewer.open" class="chat-overlay" @click.self="chatViewer.open = false">
          <div class="chat-modal-admin">

            <!-- Header -->
            <div class="chat-header">
              <div class="chat-header-left">
                <div class="chat-avatar-lg">{{ initials(chatViewer.clientName) }}</div>
                <div class="chat-header-info">
                  <div class="chat-other-name">
                    {{ chatViewer.clientName }}
                    <span class="req-id-badge">#{{ String(chatViewer.requestId).padStart(4,'0') }}</span>
                  </div>
                  <div class="chat-sub">con {{ chatViewer.professionalName }}</div>
                </div>
              </div>
              <div class="chat-header-right">
                <span class="admin-badge">👁️ Solo lectura</span>
                <button class="chat-close-btn" @click="chatViewer.open = false">✕</button>
              </div>
            </div>

            <!-- Leyenda -->
            <div class="chat-legend">
              <span class="legend-client">👤 {{ chatViewer.clientName }}</span>
              <span class="legend-pro">💼 {{ chatViewer.professionalName }}</span>
            </div>

            <!-- Body -->
            <div class="chat-body-admin" ref="chatBodyRef">
              <div v-if="chatViewer.loading" class="chat-loading">Cargando mensajes...</div>
              <div v-else-if="chatViewer.messages.length === 0" class="chat-empty">
                <p>Sin mensajes en esta conversación</p>
              </div>
              <template v-else>
                <div v-for="msg in chatViewer.messages" :key="msg.id"
                  :class="['msg-row-admin', msg.sender_id === chatViewer.professionalUserId ? 'right' : 'left']">
                  <div :class="['bubble-admin', msg.sender_id === chatViewer.professionalUserId ? 'pro' : 'client']">
                    <span class="bubble-sender">{{ msg.sender_name }}</span>
                    <span class="bubble-text">{{ msg.message }}</span>
                    <span class="bubble-time">{{ msg.created_at }}</span>
                  </div>
                </div>
              </template>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Error global -->
    <div v-if="globalError" class="error-banner">
      <span>⚠️</span> {{ globalError }}
      <button @click="refreshAll">Reintentar</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import api from '@/services/api'

const POLL_INTERVAL = 10000 // 10 segundos

// ── Estado ──────────────────────────────────────────────────
const activeTab  = ref('requests')
const search     = ref('')
const statusFilter = ref('')
const lastUpdate = ref('—')
const globalError = ref('')

const summary           = ref({})
const requests          = ref([])
const connectedUsers    = ref({ clients: [], professionals: [] })
const chats             = ref([])
const incidents         = ref([])

const loadingSummary   = ref(true)
const loadingRequests  = ref(true)
const loadingUsers     = ref(true)
const loadingChats     = ref(true)
const loadingIncidents = ref(true)

// ── KPI config ───────────────────────────────────────────────
const kpis = [
  { key: 'requests_today',       icon: '📋', label: 'Solicitudes hoy',      color: 'blue'   },
  { key: 'clients_online',       icon: '👤', label: 'Clientes online',       color: 'green'  },
  { key: 'professionals_online', icon: '💼', label: 'Profesionales online',  color: 'green'  },
  { key: 'professionals_active', icon: '🔧', label: 'Profesionales activos', color: 'blue'   },
  { key: 'requests_pending',     icon: '⏳', label: 'Solicitudes pendientes',color: 'yellow' },
  { key: 'requests_completed',   icon: '✅', label: 'Completadas hoy',       color: 'green'  },
  { key: 'active_chats',         icon: '💬', label: 'Chats activos',         color: 'blue'   },
  { key: 'incidents',            icon: '⚠️', label: 'Incidencias',           color: 'red'    },
]

// ── Tabs ─────────────────────────────────────────────────────
const tabs = [
  { key: 'requests',  icon: '📋', label: 'Solicitudes'      },
  { key: 'users',     icon: '👥', label: 'Usuarios online'  },
  { key: 'chats',     icon: '💬', label: 'Chats activos'    },
  { key: 'incidents', icon: '⚠️', label: 'Incidencias'      },
]

const tabBadge = (key) => {
  if (key === 'incidents') return summary.value.incidents || null
  if (key === 'chats')     return summary.value.active_chats || null
  if (key === 'users')     return (summary.value.clients_online || 0) + (summary.value.professionals_online || 0) || null
  return null
}

// ── Status config ─────────────────────────────────────────────
const STATUS_MAP = {
  pending:   { label: 'Pendiente',  cls: 'status-pending' },
  accepted:  { label: 'Aceptada',   cls: 'status-active'  },
  completed: { label: 'Completada', cls: 'status-completed'},
  cancelled: { label: 'Cancelada',  cls: 'status-cancelled'},
}
const statusLabel = (s) => STATUS_MAP[s]?.label ?? s ?? '—'
const statusClass = (s) => STATUS_MAP[s]?.cls   ?? 'status-neutral'

const statusFilters = [
  { value: '',          label: 'Todos'      },
  { value: 'pending',   label: 'Pendientes' },
  { value: 'accepted',  label: 'Aceptadas'  },
  { value: 'completed', label: 'Completadas'},
  { value: 'cancelled', label: 'Canceladas' },
]
const setStatusFilter = (v) => { statusFilter.value = v }

// ── Búsqueda / filtros ────────────────────────────────────────
const onSearch = () => { /* reactivo */ }

const filteredRequests = computed(() => {
  let list = requests.value
  if (statusFilter.value) list = list.filter(r => r.status === statusFilter.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(r =>
      r.client_name.toLowerCase().includes(q) ||
      (r.professional_name || '').toLowerCase().includes(q) ||
      String(r.id).includes(q)
    )
  }
  return list
})

const filteredClients = computed(() => {
  if (!search.value.trim()) return connectedUsers.value.clients
  const q = search.value.toLowerCase()
  return connectedUsers.value.clients.filter(u =>
    u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  )
})

const filteredProfessionals = computed(() => {
  if (!search.value.trim()) return connectedUsers.value.professionals
  const q = search.value.toLowerCase()
  return connectedUsers.value.professionals.filter(u =>
    u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  )
})

const filteredChats = computed(() => {
  if (!search.value.trim()) return chats.value
  const q = search.value.toLowerCase()
  return chats.value.filter(c =>
    c.client_name.toLowerCase().includes(q) ||
    c.professional_name.toLowerCase().includes(q)
  )
})

const filteredIncidents = computed(() => {
  if (!search.value.trim()) return incidents.value
  const q = search.value.toLowerCase()
  return incidents.value.filter(i =>
    i.client_name.toLowerCase().includes(q) ||
    i.service_name.toLowerCase().includes(q)
  )
})

// ── API calls ─────────────────────────────────────────────────
const fetchSummary = async () => {
  try {
    const { data } = await api.get('/admin/live-services/summary')
    summary.value = data
  } catch { globalError.value = 'Error al cargar el resumen.' }
  finally { loadingSummary.value = false }
}

const fetchRequests = async () => {
  try {
    const { data } = await api.get('/admin/live-services/requests')
    requests.value = data.requests
  } catch { /* silencioso en polling */ }
  finally { loadingRequests.value = false }
}

const fetchUsers = async () => {
  try {
    const { data } = await api.get('/admin/live-services/connected-users')
    connectedUsers.value = data
  } catch { /* silencioso */ }
  finally { loadingUsers.value = false }
}

const fetchChats = async () => {
  try {
    const { data } = await api.get('/admin/live-services/chats')
    chats.value = data.chats
  } catch { /* silencioso */ }
  finally { loadingChats.value = false }
}

const fetchIncidents = async () => {
  try {
    const { data } = await api.get('/admin/live-services/incidents')
    incidents.value = data.incidents
  } catch { /* silencioso */ }
  finally { loadingIncidents.value = false }
}

const refreshAll = async () => {
  loadingSummary.value = true
  globalError.value = ''
  await Promise.all([fetchSummary(), fetchRequests(), fetchUsers(), fetchChats(), fetchIncidents()])
  lastUpdate.value = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ── Helpers ───────────────────────────────────────────────────
const truncate = (str, len) => str && str.length > len ? str.slice(0, len) + '…' : str

// ── Detail Modal ─────────────────────────────────────────────
const detailModal = ref({ open: false, req: {} })
const openDetail = (req) => { detailModal.value = { open: true, req } }

// ── Reassign Modal ────────────────────────────────────────────
const reassignModal = ref({
  open: false, loading: false, saving: false,
  incidentId: null, professionals: [], selectedId: null, error: '',
})

const openReassign = async (inc) => {
  reassignModal.value = { open: true, loading: true, saving: false, incidentId: inc.id, professionals: [], selectedId: null, error: '' }
  try {
    const { data } = await api.get(`/admin/live-services/requests/${inc.id}/available-professionals`)
    reassignModal.value.professionals = data.professionals
  } catch {
    reassignModal.value.error = 'Error al cargar profesionales disponibles.'
  } finally {
    reassignModal.value.loading = false
  }
}

const confirmReassign = async () => {
  if (!reassignModal.value.selectedId) return
  reassignModal.value.saving = true
  reassignModal.value.error  = ''
  try {
    await api.post(`/admin/live-services/requests/${reassignModal.value.incidentId}/reassign`, {
      professional_id: reassignModal.value.selectedId,
    })
    reassignModal.value.open = false
    await refreshAll()
  } catch (e) {
    reassignModal.value.error = e.response?.data?.message || 'Error al reasignar.'
  } finally {
    reassignModal.value.saving = false
  }
}

// ── Chat Viewer ───────────────────────────────────────────────
const chatBodyRef = ref(null)
const chatViewer  = ref({
  open:             false,
  loading:          false,
  requestId:        null,
  clientName:       '',
  professionalName: '',
  clientId:         null,
  professionalUserId: null,
  messages:         [],
})

const initials = (name) =>
  (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

const openChatViewer = async (chat) => {
  chatViewer.value = {
    open:               true,
    loading:            true,
    requestId:          chat.request_id,
    clientName:         chat.client_name,
    professionalName:   chat.professional_name,
    clientId:           null,
    professionalUserId: null,
    messages:           [],
  }
  try {
    const { data } = await api.get(`/admin/live-services/chat/${chat.request_id}/messages`)
    chatViewer.value.messages           = data.messages
    chatViewer.value.clientId           = data.client_id
    chatViewer.value.professionalUserId = data.professional_user_id
    nextTick(() => {
      if (chatBodyRef.value) chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
    })
  } catch (e) {
    chatViewer.value.messages = []
  } finally {
    chatViewer.value.loading = false
  }
}

// ── Polling ───────────────────────────────────────────────────
let pollTimer = null

onMounted(() => {
  refreshAll()
  pollTimer = setInterval(refreshAll, POLL_INTERVAL)
})

onUnmounted(() => clearInterval(pollTimer))
</script>

<style scoped>
/* ── Page ───────────────────────────────────────────────────── */
.live-page {
  display: flex; flex-direction: column; gap: 20px; padding-bottom: 32px;
}

/* ── Header ─────────────────────────────────────────────────── */
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}
.header-left  { display: flex; align-items: center; gap: 16px; }
.header-icon  {
  width: 48px; height: 48px; border-radius: 14px;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;
}
.page-title   { font-size: 26px; font-weight: 900; color: #0f172a; margin: 0; }
.page-subtitle{ font-size: 13px; color: #64748b; margin: 4px 0 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.subtitle-sep { color: #cbd5e1; }
.last-update  { color: #94a3b8; }
.live-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34,197,94,.2); flex-shrink: 0;
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 3px rgba(34,197,94,.2); } 50% { box-shadow: 0 0 0 6px rgba(34,197,94,.05); } }
.header-actions { display: flex; gap: 8px; }
.btn-refresh {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border: 1.5px solid #e2e8f0;
  background: white; border-radius: 10px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background .15s;
}
.btn-refresh:hover:not(:disabled) { background: #f8fafc; }
.btn-refresh:disabled { opacity: .5; cursor: not-allowed; }
.btn-text { display: none; }
@media (min-width: 480px) { .btn-text { display: inline; } }

/* ── KPI Cards (reutiliza clases globales stat-row / mini-stat) ─ */
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.mini-stat {
  background: white; border: 1.5px solid #e2e8f0; border-radius: 14px;
  padding: 16px 14px; display: flex; align-items: center; gap: 12px;
  transition: box-shadow .15s;
}
.mini-stat:hover { box-shadow: 0 4px 14px rgba(0,0,0,.06); }
.mini-stat-icon { font-size: 22px; flex-shrink: 0; }
.mini-stat-value { font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1; }
.mini-stat-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .4px; margin-top: 3px; }
.mini-stat.blue   { border-left: 3px solid #2563eb; }
.mini-stat.green  { border-left: 3px solid #22c55e; }
.mini-stat.yellow { border-left: 3px solid #f59e0b; }
.mini-stat.red    { border-left: 3px solid #ef4444; }
.sk-val { display: inline-block; width: 40px; height: 22px; background: #e2e8f0; border-radius: 6px; animation: shimmer 1.4s infinite; }

/* ── Tabs ───────────────────────────────────────────────────── */
.live-tabs {
  display: flex; gap: 4px; background: #f1f5f9;
  padding: 4px; border-radius: 12px; width: fit-content; flex-wrap: wrap;
}
.live-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 9px; border: none;
  background: transparent; font-size: 13px; font-weight: 700;
  color: #64748b; cursor: pointer; transition: background .2s, color .2s; font-family: inherit;
}
.live-tab.active { background: white; color: #2563eb; box-shadow: 0 1px 6px rgba(0,0,0,.08); }
.tab-badge {
  background: #ef4444; color: white; font-size: 10px; font-weight: 800;
  padding: 1px 6px; border-radius: 20px; min-width: 18px; text-align: center;
}
.live-tab.active .tab-badge { background: #2563eb; }

/* ── Filters (reutiliza clases globales) ────────────────────── */
.filters-bar {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
}
.search-wrapper {
  position: relative; display: flex; align-items: center;
}
.search-icon {
  position: absolute; left: 12px; font-size: 14px; pointer-events: none;
}
.search-input {
  padding: 9px 12px 9px 36px; border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 13px; font-family: inherit; color: #334155; width: 260px;
  transition: border-color .2s;
}
.search-input:focus { outline: none; border-color: #2563eb; }
.search-clear {
  position: absolute; right: 10px; background: none; border: none;
  color: #94a3b8; cursor: pointer; font-size: 12px;
}
.filter-group { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-chip {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border: 1.5px solid #e2e8f0; border-radius: 9px;
  background: white; font-size: 12px; font-weight: 600; color: #64748b;
  cursor: pointer; font-family: inherit; transition: all .15s;
}
.filter-chip.active { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
.status-dot-mini {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
}
.status-dot-mini.pending   { background: #f59e0b; }
.status-dot-mini.accepted  { background: #22c55e; }
.status-dot-mini.completed { background: #2563eb; }
.status-dot-mini.cancelled { background: #94a3b8; }

/* ── Table (reutiliza .users-table, .user-row, etc.) ─────────── */
.table-wrapper {
  background: white; border: 1.5px solid #e2e8f0; border-radius: 14px; overflow: auto;
}
.users-table {
  width: 100%; border-collapse: collapse; font-size: 13px;
}
.users-table thead th {
  padding: 10px 14px; font-size: 10px; font-weight: 800; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .5px; border-bottom: 1.5px solid #f1f5f9; background: #fafafa;
  white-space: nowrap;
}
.user-row td { padding: 10px 14px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
.user-row:last-child td { border-bottom: none; }
.user-row:hover { background: #fafafa; }
.user-cell { display: flex; align-items: center; gap: 8px; }
.avatar-wrap { position: relative; flex-shrink: 0; }
.user-avatar { width: 32px; height: 32px; border-radius: 9px; }
.online-dot {
  position: absolute; bottom: 0; right: 0;
  width: 9px; height: 9px; border-radius: 50%; border: 2px solid white;
}
.online-dot.active  { background: #22c55e; }
.online-dot.inactive{ background: #cbd5e1; }
.user-name  { font-size: 13px; font-weight: 600; color: #1e293b; display: block; }
.user-id    { font-size: 11px; color: #94a3b8; display: block; }
.req-id     { font-size: 12px; font-weight: 700; color: #2563eb; }
.svc-name   { font-size: 12px; font-weight: 600; color: #475569; }
.date-text  { font-size: 11px; color: #64748b; }
.no-prof    { font-size: 11px; color: #94a3b8; }
.td-id      { white-space: nowrap; }

/* ── Status badges (reutiliza patrón global) ─────────────────── */
.status-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 7px; font-size: 11px; font-weight: 700;
  white-space: nowrap;
}
.status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.status-active    { background: #dcfce7; color: #166534; }
.status-active .status-dot { background: #22c55e; }
.status-pending   { background: #fef3c7; color: #92400e; }
.status-pending .status-dot { background: #f59e0b; }
.status-neutral   { background: #f1f5f9; color: #475569; }
.status-neutral .status-dot { background: #94a3b8; }
.status-completed { background: #dbeafe; color: #1e40af; }
.status-completed .status-dot { background: #2563eb; }
.status-cancelled { background: #f1f5f9; color: #64748b; }
.status-cancelled .status-dot { background: #94a3b8; }

/* ── Elapsed badge ───────────────────────────────────────────── */
.elapsed-badge {
  display: inline-block; padding: 2px 8px; border-radius: 6px;
  font-size: 11px; font-weight: 700;
  background: #f0fdf4; color: #166534;
}
.elapsed-badge.slow { background: #fef2f2; color: #dc2626; }

/* ── Connected grid ──────────────────────────────────────────── */
.connected-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
}
.connected-section {
  background: white; border: 1.5px solid #e2e8f0; border-radius: 14px; overflow: hidden;
}
.section-head {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; background: #f8fafc; border-bottom: 1.5px solid #f1f5f9;
}
.section-head-icon  { font-size: 16px; }
.section-head-title { font-size: 13px; font-weight: 700; color: #334155; flex: 1; }
.section-count {
  background: #e2e8f0; color: #475569; font-size: 11px; font-weight: 800;
  padding: 2px 8px; border-radius: 10px; min-width: 22px; text-align: center;
}
.connected-list  { display: flex; flex-direction: column; max-height: 400px; overflow-y: auto; }
.connected-card  {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  border-bottom: 1px solid #f8fafc; transition: background .1s;
}
.connected-card:last-child { border-bottom: none; }
.connected-card:hover { background: #fafafa; }
.connected-info  { flex: 1; min-width: 0; }
.connected-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }

/* ── Chat section ────────────────────────────────────────────── */
.last-msg    { display: flex; flex-direction: column; gap: 1px; }
.msg-sender  { font-size: 10px; font-weight: 700; color: #64748b; }
.msg-text    { font-size: 12px; color: #334155; }
.msg-count   {
  display: inline-block; padding: 2px 8px; border-radius: 6px;
  background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700;
}

/* ── Incident list ───────────────────────────────────────────── */
.incident-list  { display: flex; flex-direction: column; gap: 8px; }
.incident-card  {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  background: white; border: 1.5px solid #fee2e2; border-radius: 12px;
  padding: 14px 16px;
}
.incident-left  { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 200px; }
.incident-icon  { font-size: 22px; flex-shrink: 0; }
.incident-title { font-size: 13px; font-weight: 700; color: #991b1b; }
.incident-sub   { font-size: 11px; color: #64748b; margin-top: 2px; }
.incident-mid   { flex: 1; min-width: 160px; }
.incident-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.user-avatar.sm { width: 26px; height: 26px; border-radius: 7px; }

/* ── Skeleton ────────────────────────────────────────────────── */
.skeleton-list  { display: flex; flex-direction: column; gap: 8px; }
.skeleton-row   {
  display: flex; align-items: center; gap: 12px;
  background: white; border: 1px solid #f1f5f9; border-radius: 12px; padding: 14px 16px;
}
.sk-info        { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.sk             { border-radius: 6px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
.sk-avatar      { width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0; }
.sk-line.wide   { height: 12px; width: 60%; }
.sk-line.narrow { height: 10px; width: 35%; }
.sk-badge       { width: 60px; height: 22px; border-radius: 7px; }
.sk-btn         { width: 32px; height: 32px; border-radius: 9px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Empty state ─────────────────────────────────────────────── */
.empty-state {
  text-align: center; padding: 48px 24px;
  background: #f8fafc; border-radius: 14px; border: 1.5px dashed #e2e8f0; color: #94a3b8;
}
.empty-state.small { padding: 24px 16px; border: none; border-radius: 0; background: transparent; }
.empty-icon  { font-size: 28px; display: block; margin-bottom: 10px; }
.empty-title { font-size: 14px; font-weight: 700; color: #64748b; margin: 0 0 4px; }
.empty-sub   { font-size: 12px; margin: 0; }

/* ── Error ───────────────────────────────────────────────────── */
.error-banner {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; background: #fef2f2; border: 1.5px solid #fecaca;
  border-radius: 10px; font-size: 13px; color: #dc2626;
}
.error-banner button {
  margin-left: auto; padding: 4px 12px; border: 1.5px solid #fca5a5;
  background: white; color: #dc2626; border-radius: 7px; cursor: pointer; font-family: inherit; font-size: 12px; font-weight: 600;
}

/* ── Msg count button ────────────────────────────────────────── */
.msg-count-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 3px 12px; border-radius: 7px;
  background: #eff6ff; color: #2563eb; font-size: 12px; font-weight: 700;
  border: 1.5px solid #bfdbfe; cursor: pointer; font-family: inherit;
  transition: background .15s, transform .15s;
}
.msg-count-btn:hover { background: #dbeafe; transform: scale(1.05); }

/* ── Eye button ─────────────────────────────────────────────── */
.btn-eye {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 8px;
  background: #eff6ff; border: 1.5px solid #bfdbfe;
  color: #2563eb; cursor: pointer; transition: background 0.15s;
}
.btn-eye:hover { background: #dbeafe; }

/* ── Reassign button ─────────────────────────────────────────── */
.btn-reassign {
  font-size: 11px; font-weight: 700; color: #d97706;
  background: #fffbeb; border: 1.5px solid #fde68a;
  padding: 5px 10px; border-radius: 8px; cursor: pointer; font-family: inherit;
  transition: background 0.15s; white-space: nowrap;
}
.btn-reassign:hover { background: #fef3c7; }

.btn-reassign-confirm {
  font-size: 12px; font-weight: 700; color: white;
  background: #2563eb; border: none; padding: 8px 16px;
  border-radius: 10px; cursor: pointer; font-family: inherit;
  transition: background 0.15s;
}
.btn-reassign-confirm:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-reassign-confirm:not(:disabled):hover { background: #1d4ed8; }

/* ── Detail & Reassign Modals ────────────────────────────────── */
.detail-modal {
  background: #fff; border-radius: 18px;
  width: 100%; max-width: 520px; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
}
.detail-body {
  padding: 16px 20px 20px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 16px;
}
.detail-section { display: flex; flex-direction: column; gap: 6px; }
.detail-section-title {
  font-size: 11px; font-weight: 800; color: #2563eb;
  text-transform: uppercase; letter-spacing: 0.5px;
  padding-bottom: 4px; border-bottom: 1.5px solid #e2e8f0;
}
.detail-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12px; color: #475569; gap: 8px;
}
.detail-row strong { color: #0f172a; font-weight: 700; text-align: right; max-width: 60%; word-break: break-word; }
.online-pill {
  font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px;
}
.online-pill.on  { background: #dcfce7; color: #166534; }
.online-pill.off { background: #f1f5f9; color: #64748b; }

/* ── Reassign list ───────────────────────────────────────────── */
.reassign-list { display: flex; flex-direction: column; gap: 6px; }
.reassign-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
  border: 1.5px solid #e2e8f0; cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.reassign-item:hover { border-color: #bfdbfe; background: #f0f9ff; }
.reassign-item.selected { border-color: #2563eb; background: #eff6ff; }

/* ── Chat Viewer Modal ───────────────────────────────────────── */
.chat-overlay {
  position: fixed; inset: 0; z-index: 3000;
  background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.chat-modal-admin {
  background: #fff; border-radius: 18px;
  width: 100%; max-width: 480px; height: 580px;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,.25); overflow: hidden;
}
.chat-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  flex-shrink: 0;
}
.chat-header-left  { display: flex; align-items: center; gap: 12px; }
.chat-avatar-lg {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(255,255,255,.22); border: 2px solid rgba(255,255,255,.4);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 16px; color: #fff; flex-shrink: 0;
}
.chat-header-info  { display: flex; flex-direction: column; gap: 2px; }
.chat-other-name   { font-weight: 700; font-size: 14px; color: #fff; display: flex; align-items: center; gap: 6px; }
.req-id-badge      { font-size: 10px; opacity: .5; font-weight: 400; }
.chat-sub          { font-size: 11px; color: rgba(255,255,255,.75); }
.chat-header-right { display: flex; align-items: center; gap: 8px; }
.admin-badge {
  background: rgba(255,255,255,.2); color: #fff;
  font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px;
}
.chat-close-btn {
  background: rgba(255,255,255,.15); border: none; color: #fff;
  width: 30px; height: 30px; border-radius: 50%; font-size: 13px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.chat-close-btn:hover { background: rgba(255,255,255,.28); }
.chat-body-admin {
  flex: 1; overflow-y: auto; padding: 14px 14px;
  background: #f0f2f5; display: flex; flex-direction: column; gap: 8px;
  scroll-behavior: smooth;
}
/* Leyenda */
.chat-legend {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 14px; background: rgba(255,255,255,.85);
  border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.legend-client { color: #475569; }
.legend-pro    { color: #2563eb; }

/* Filas */
.msg-row-admin { display: flex; margin-bottom: 4px; }
.msg-row-admin.left  { justify-content: flex-start; }
.msg-row-admin.right { justify-content: flex-end; }

/* Burbujas */
.bubble-admin {
  max-width: 72%; padding: 7px 11px 5px;
  border-radius: 14px; display: flex; flex-direction: column;
  word-break: break-word; gap: 2px;
}
.bubble-admin.client {
  background: #fff; border-bottom-left-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,.1); color: #1e293b;
}
.bubble-admin.pro {
  background: #2563eb; border-bottom-right-radius: 4px; color: #fff;
}
.bubble-sender {
  font-size: 10px; font-weight: 700;
}
.bubble-admin.client .bubble-sender { color: #64748b; }
.bubble-admin.pro    .bubble-sender { color: rgba(255,255,255,.7); }
.bubble-text { font-size: 13px; line-height: 1.45; }
.bubble-time { font-size: 10px; text-align: right; margin-top: 1px; }
.bubble-admin.client .bubble-time { color: rgba(0,0,0,.35); }
.bubble-admin.pro    .bubble-time { color: rgba(255,255,255,.6); }

.chat-loading { text-align: center; color: #94a3b8; font-size: 13px; margin: auto; }
.chat-empty   { margin: auto; text-align: center; color: #94a3b8; font-size: 13px; }
.chat-body-admin::-webkit-scrollbar       { width: 4px; }
.chat-body-admin::-webkit-scrollbar-track { background: transparent; }
.chat-body-admin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.modal-enter-active, .modal-leave-active  { transition: opacity .2s, transform .2s; }
.modal-enter-from, .modal-leave-to        { opacity: 0; transform: scale(.96); }

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .stat-row { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 860px) {
  .stat-row        { grid-template-columns: repeat(2, 1fr); }
  .connected-grid  { grid-template-columns: 1fr; }
  .hide-md         { display: none !important; }
}
@media (max-width: 600px) {
  .stat-row { grid-template-columns: repeat(2, 1fr); }
  .hide-sm  { display: none !important; }
  .search-input { width: 200px; }
  .live-tab { padding: 7px 10px; font-size: 12px; }
}
</style>

<template>
  <div class="logs-page">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">📋</div>
        <div>
          <h2 class="section-title">Auditoría</h2>
          <p class="section-subtitle">Registro de acciones de administradores, clientes y profesionales</p>
        </div>
      </div>
      <button class="btn-refresh" @click="fetchLogs(1)" :disabled="loading">
        <span v-if="loading" class="spinner-sm"></span>
        <span v-else>↻</span>
        Actualizar
      </button>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <div class="search-box">
        <span>🔍</span>
        <input v-model="search" type="text" placeholder="Buscar por usuario o descripción…" class="search-input" @input="debouncedFetch" />
      </div>
      <select v-model="filterEntity" class="filter-select" @change="fetchLogs(1)">
        <option value="">Todas las entidades</option>
        <option value="user">Usuarios</option>
        <option value="sub-admin">Sub-admins</option>
        <option value="category">Categorías</option>
        <option value="service">Servicios</option>
        <option value="service_request">Solicitudes</option>
      </select>
      <select v-model="filterAction" class="filter-select" @change="fetchLogs(1)">
        <option value="">Todas las acciones</option>
        <option value="create">Crear</option>
        <option value="update">Actualizar</option>
        <option value="delete">Eliminar</option>
        <option value="verify">Verificar</option>
        <option value="toggle">Cambiar estado</option>
        <option value="cancel">Cancelar</option>
        <option value="complete">Completar</option>
        <option value="upload_evidence">Evidencias</option>
        <option value="rate">Calificar</option>
        <option value="reassign">Reasignar</option>
      </select>
    </div>

    <!-- Stats rápidas -->
    <div class="quick-stats">
      <div class="qs-card">
        <span class="qs-icon">📝</span>
        <div>
          <div class="qs-val">{{ total }}</div>
          <div class="qs-label">Total acciones</div>
        </div>
      </div>
      <div class="qs-card">
        <span class="qs-icon">✅</span>
        <div>
          <div class="qs-val">{{ actionCount('create') }}</div>
          <div class="qs-label">Creaciones</div>
        </div>
      </div>
      <div class="qs-card">
        <span class="qs-icon">✏️</span>
        <div>
          <div class="qs-val">{{ actionCount('update') }}</div>
          <div class="qs-label">Ediciones</div>
        </div>
      </div>
      <div class="qs-card">
        <span class="qs-icon">🗑️</span>
        <div>
          <div class="qs-val">{{ actionCount('delete') }}</div>
          <div class="qs-label">Eliminaciones</div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && logs.length === 0" class="loading-state">
      <div class="spinner-lg"></div>
      <p>Cargando registros…</p>
    </div>

    <!-- Empty -->
    <div v-else-if="!loading && logs.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>Sin registros aún</h3>
      <p>Las acciones del panel de administración aparecerán aquí.</p>
    </div>

    <!-- Tabla -->
    <div v-else class="section-card table-card">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Admin</th>
            <th>Acción</th>
            <th>Entidad</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id" class="log-row">
            <td class="td-date">{{ formatDate(log.created_at) }}</td>
            <td>
              <div class="admin-cell">
                <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.admin_name}`" class="mini-avatar" />
                <span>{{ log.admin_name }}</span>
              </div>
            </td>
            <td>
              <span :class="['action-badge', log.action]">
                {{ actionLabel(log.action) }}
              </span>
            </td>
            <td>
              <span class="entity-badge">{{ entityLabel(log.entity) }}</span>
            </td>
            <td class="td-desc">{{ log.description }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div v-if="pages > 1" class="pagination">
        <button :disabled="currentPage === 1" class="page-btn" @click="fetchLogs(currentPage - 1)">← Anterior</button>
        <span class="page-info">Página {{ currentPage }} de {{ pages }}</span>
        <button :disabled="currentPage === pages" class="page-btn" @click="fetchLogs(currentPage + 1)">Siguiente →</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const logs        = ref([]);
const total       = ref(0);
const pages       = ref(1);
const currentPage = ref(1);
const loading     = ref(true);
const search      = ref('');
const filterEntity = ref('');
const filterAction = ref('');

let debounceTimer = null;
const debouncedFetch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchLogs(1), 400);
};

const fetchLogs = async (page = 1) => {
  loading.value = true;
  try {
    const params = { page, per_page: 50 };
    if (search.value.trim())  params.search = search.value.trim();
    if (filterEntity.value)   params.entity = filterEntity.value;
    if (filterAction.value)   params.action = filterAction.value;

    const { data } = await api.get('/admin/logs', { params });
    logs.value        = data.logs;
    total.value       = data.total;
    pages.value       = data.pages;
    currentPage.value = data.current;
  } catch {
    /* silent */
  } finally {
    loading.value = false;
  }
};

const actionCount = (action) => logs.value.filter(l => l.action === action).length;

const ACTION_LABELS  = {
  create: 'Crear', update: 'Editar', delete: 'Eliminar',
  verify: 'Verificar', toggle: 'Estado', cancel: 'Cancelar',
  complete: 'Completar', upload_evidence: 'Evidencia', rate: 'Calificación',
  reassign: 'Reasignar',
};
const ENTITY_LABELS  = {
  user: 'Usuario', 'sub-admin': 'Sub-admin',
  category: 'Categoría', service: 'Servicio',
  service_request: 'Solicitud',
};

const actionLabel = (a) => ACTION_LABELS[a] ?? a;
const entityLabel = (e) => ENTITY_LABELS[e] ?? e;

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => fetchLogs(1));
</script>

<style scoped>
.logs-page { display: flex; flex-direction: column; gap: 24px; }

.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.header-icon { font-size: 36px; }
.section-title    { font-size: 26px; font-weight: 900; color: #0f172a; margin: 0; }
.section-subtitle { color: #64748b; font-size: 14px; margin-top: 2px; }

.btn-refresh {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; background: #f1f5f9; color: #475569;
  border: none; border-radius: 12px; font-weight: 700; font-size: 14px;
  cursor: pointer; transition: background .2s;
}
.btn-refresh:hover:not(:disabled) { background: #e2e8f0; }
.btn-refresh:disabled { opacity: .5; cursor: not-allowed; }

/* Filtros */
.filters-bar { display: flex; gap: 12px; flex-wrap: wrap; }
.search-box {
  display: flex; align-items: center; gap: 8px;
  background: white; border: 1.5px solid #e2e8f0; border-radius: 12px;
  padding: 10px 16px; flex: 1; min-width: 200px;
}
.search-input { border: none; outline: none; font-size: 14px; color: #0f172a; width: 100%; }
.filter-select {
  padding: 10px 14px; background: white; border: 1.5px solid #e2e8f0;
  border-radius: 12px; font-size: 13px; color: #475569; cursor: pointer; outline: none;
}
.filter-select:focus { border-color: #2563eb; }

/* Quick stats */
.quick-stats { display: flex; gap: 14px; flex-wrap: wrap; }
.qs-card {
  display: flex; align-items: center; gap: 14px;
  background: white; border-radius: 16px; padding: 16px 22px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06); flex: 1; min-width: 130px;
}
.qs-icon { font-size: 22px; }
.qs-val   { font-size: 26px; font-weight: 900; color: #0f172a; line-height: 1; }
.qs-label { font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px; }

/* Loading / Empty */
.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 80px 0; gap: 16px; color: #64748b;
}
.empty-icon { font-size: 56px; }
.empty-state h3 { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
.empty-state p  { font-size: 14px; color: #64748b; margin: 0; }

/* Tabla */
.table-card { padding: 0; overflow: hidden; border-radius: 20px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
table { width: 100%; border-collapse: collapse; }
thead tr { background: #f8fafc; }
th { padding: 14px 18px; text-align: left; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #f1f5f9; }
.log-row td { padding: 13px 18px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
.log-row:last-child td { border-bottom: none; }
.log-row:hover { background: #fafbff; }

.td-date { font-size: 12px; color: #94a3b8; white-space: nowrap; }
.td-desc { font-size: 13px; color: #334155; max-width: 320px; }

.admin-cell { display: flex; align-items: center; gap: 8px; }
.mini-avatar { width: 28px; height: 28px; border-radius: 8px; border: 1.5px solid #e2e8f0; }

.action-badge {
  display: inline-block; padding: 4px 10px; border-radius: 6px;
  font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .3px;
}
.action-badge.create { background: #dcfce7; color: #16a34a; }
.action-badge.update { background: #dbeafe; color: #1d4ed8; }
.action-badge.delete { background: #fee2e2; color: #dc2626; }
.action-badge.verify { background: #fef3c7; color: #d97706; }
.action-badge.toggle { background: #f3e8ff; color: #7c3aed; }

.entity-badge {
  display: inline-block; padding: 4px 10px; background: #f1f5f9;
  border-radius: 6px; font-size: 12px; color: #475569; font-weight: 600;
}

/* Paginación */
.pagination {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  padding: 16px; border-top: 1px solid #f1f5f9;
}
.page-btn {
  padding: 8px 18px; background: #f1f5f9; border: none; border-radius: 10px;
  font-size: 13px; font-weight: 700; cursor: pointer; transition: background .2s;
}
.page-btn:hover:not(:disabled) { background: #e2e8f0; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-info { font-size: 13px; color: #64748b; font-weight: 600; }

/* Spinners */
.spinner-sm {
  width: 12px; height: 12px; border: 2px solid #cbd5e1;
  border-top-color: #475569; border-radius: 50%; animation: spin .7s linear infinite;
}
.spinner-lg {
  width: 40px; height: 40px; border: 4px solid #e2e8f0;
  border-top-color: #2563eb; border-radius: 50%; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Responsive */
@media (max-width: 640px) {
  .quick-stats { flex-direction: column; }
  .filters-bar { flex-direction: column; }
  table { font-size: 12px; }
  th, .log-row td { padding: 10px 12px; }
  .td-desc { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
</style>

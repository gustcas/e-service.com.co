<template>
  <div class="sub-admins-page">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">🛡️</div>
        <div>
          <h2 class="section-title">Administradores</h2>
          <p class="section-subtitle">Gestiona accesos al panel de administración</p>
        </div>
      </div>
      <button class="btn-primary" @click="openCreate">
        <span class="btn-icon">＋</span> Nuevo Admin
      </button>
    </div>

    <!-- Stats rápidas -->
    <div class="quick-stats">
      <div class="quick-stat">
        <div class="qs-icon blue">👥</div>
        <div>
          <div class="qs-value">{{ admins.length }}</div>
          <div class="qs-label">Sub-admins</div>
        </div>
      </div>
      <div class="quick-stat">
        <div class="qs-icon green">✅</div>
        <div>
          <div class="qs-value">{{ admins.filter(a => a.is_active).length }}</div>
          <div class="qs-label">Activos</div>
        </div>
      </div>
      <div class="quick-stat">
        <div class="qs-icon red">🚫</div>
        <div>
          <div class="qs-value">{{ admins.filter(a => !a.is_active).length }}</div>
          <div class="qs-label">Inactivos</div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando administradores…</p>
    </div>

    <!-- Empty -->
    <div v-else-if="admins.length === 0" class="empty-state-box">
      <div class="empty-icon">🛡️</div>
      <h3>No hay sub-administradores</h3>
      <p>Crea el primer sub-admin y asígnale accesos específicos al panel.</p>
      <button class="btn-primary" @click="openCreate">Crear sub-administrador</button>
    </div>

    <!-- Tabla -->
    <div v-else class="section-card table-card">
      <div class="card-toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por nombre o correo…"
            class="search-input"
          />
        </div>
        <div class="toolbar-right">
          <span class="results-count">{{ filtered.length }} resultado{{ filtered.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <div class="stats-table">
        <table>
          <thead>
            <tr>
              <th>Administrador</th>
              <th>Módulos</th>
              <th>Estado</th>
              <th>Creado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="admin in filtered" :key="admin.id" class="table-row">

              <!-- Admin info -->
              <td>
                <div class="table-user">
                  <img
                    :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${admin.name}`"
                    class="table-avatar"
                    alt=""
                  />
                  <div class="table-user-info">
                    <div class="table-user-name">{{ admin.name }}</div>
                    <div class="table-user-email">{{ admin.email }}</div>
                  </div>
                </div>
              </td>

              <!-- Módulos -->
              <td>
                <div class="module-chips">
                  <template v-for="(perms, mod) in admin.modules" :key="mod">
                    <span
                      v-if="perms?.enabled"
                      :class="['module-chip', 'granted']"
                      :title="`${moduleLabel(mod)}: ${activePerms(perms).join(', ')}`"
                    >
                      <span class="chip-dot"></span>
                      {{ moduleLabel(mod) }}
                      <span class="chip-perms">{{ activePermsShort(perms) }}</span>
                    </span>
                  </template>
                  <span v-if="!Object.values(admin.modules).some(p => p?.enabled)" class="no-access-text">
                    Sin accesos
                  </span>
                </div>
              </td>

              <!-- Estado -->
              <td>
                <span :class="['status-badge', admin.is_active ? 'active' : 'inactive']">
                  <span class="status-dot"></span>
                  {{ admin.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>

              <!-- Fecha -->
              <td>
                <span class="date-text">{{ admin.created_at }}</span>
              </td>

              <!-- Acciones -->
              <td>
                <div class="row-actions">
                  <button
                    class="action-btn edit"
                    @click="openEdit(admin)"
                    title="Editar permisos"
                  >
                    ✏️
                  </button>
                  <button
                    :class="['action-btn', admin.is_active ? 'deactivate' : 'activate']"
                    @click="toggleStatus(admin)"
                    :title="admin.is_active ? 'Inhabilitar' : 'Habilitar'"
                  >
                    {{ admin.is_active ? '🚫' : '✅' }}
                  </button>
                  <button
                    class="action-btn delete"
                    @click="confirmDelete(admin)"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>

            <!-- Sin resultados de búsqueda -->
            <tr v-if="filtered.length === 0">
              <td colspan="5" class="no-results">
                No se encontraron administradores con "{{ search }}"
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Modal Crear / Editar ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modal.open" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-box">

            <!-- Header modal -->
            <div class="modal-header">
              <div class="modal-title-group">
                <div class="modal-icon">{{ modal.mode === 'create' ? '➕' : '✏️' }}</div>
                <div>
                  <h3 class="modal-title">
                    {{ modal.mode === 'create' ? 'Nuevo Sub-Admin' : 'Editar Admin' }}
                  </h3>
                  <p class="modal-subtitle">
                    {{ modal.mode === 'create'
                      ? 'Crea una cuenta y define sus accesos'
                      : `Editando permisos de ${modal.adminName}` }}
                  </p>
                </div>
              </div>
              <button class="modal-close" @click="closeModal">✕</button>
            </div>

            <!-- Body modal -->
            <div class="modal-body">

              <!-- Sección: Datos de cuenta -->
              <div class="form-section">
                <div class="form-section-title">
                  <span>👤</span> Datos de cuenta
                </div>

                <div class="form-group">
                  <label>Nombre completo <span class="required">*</span></label>
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="Ej: Carlos López"
                    class="form-input"
                    :class="{ error: errors.name }"
                  />
                  <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
                </div>

                <template v-if="modal.mode === 'create'">
                  <div class="form-group">
                    <label>Correo electrónico <span class="required">*</span></label>
                    <input
                      v-model="form.email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      class="form-input"
                      :class="{ error: errors.email }"
                    />
                    <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
                  </div>

                  <div class="form-group">
                    <label>Contraseña <span class="required">*</span></label>
                    <div class="input-wrapper">
                      <input
                        v-model="form.password"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="Mínimo 8 caracteres"
                        class="form-input"
                        :class="{ error: errors.password }"
                      />
                      <button
                        type="button"
                        class="toggle-password"
                        @click="showPassword = !showPassword"
                      >
                        {{ showPassword ? '🙈' : '👁️' }}
                      </button>
                    </div>
                    <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
                  </div>
                </template>
              </div>

              <!-- Sección: Permisos -->
              <div class="form-section">
                <div class="form-section-title">
                  <span>🔐</span> Acceso a módulos
                </div>
                <p class="perms-hint">
                  Activa el módulo y selecciona los permisos específicos.
                </p>

                <div class="modules-list">
                  <div
                    v-for="mod in availableModules"
                    :key="mod"
                    :class="['module-card', form.modules[mod]?.enabled ? 'enabled' : 'disabled']"
                  >
                    <!-- Cabecera del módulo -->
                    <div class="module-card-header" @click="toggleModule(mod)">
                      <div class="module-toggle-icon">{{ moduleIcon(mod) }}</div>
                      <div class="module-toggle-info">
                        <div class="module-toggle-name">{{ moduleLabel(mod) }}</div>
                        <div class="module-toggle-desc">{{ moduleDesc(mod) }}</div>
                      </div>
                      <div class="toggle-switch" :class="{ on: form.modules[mod]?.enabled }">
                        <div class="toggle-knob"></div>
                      </div>
                    </div>

                    <!-- Permisos granulares (solo si habilitado) -->
                    <div v-if="form.modules[mod]?.enabled" class="perm-row">
                      <label
                        v-for="perm in modulePerms(mod)"
                        :key="perm"
                        class="perm-check"
                        @click.stop
                      >
                        <input
                          type="checkbox"
                          :checked="form.modules[mod][perm]"
                          @change="form.modules[mod][perm] = $event.target.checked"
                        />
                        <span class="perm-label">{{ permLabel(perm) }}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Resumen -->
                <div class="access-summary">
                  <span class="summary-label">Módulos activos:</span>
                  <span class="summary-count">
                    {{ Object.values(form.modules).filter(m => m?.enabled).length }}
                    de {{ availableModules.length }}
                  </span>
                </div>
              </div>

              <!-- Error general -->
              <div v-if="modal.error" class="modal-error-banner">
                <span>⚠️</span>
                <span>{{ modal.error }}</span>
              </div>
            </div>

            <!-- Footer modal -->
            <div class="modal-footer">
              <button class="btn-ghost" @click="closeModal" :disabled="modal.saving">
                Cancelar
              </button>
              <button class="btn-primary" @click="submitForm" :disabled="modal.saving">
                <span v-if="modal.saving" class="btn-spinner"></span>
                {{ modal.saving
                  ? 'Guardando…'
                  : modal.mode === 'create' ? 'Crear administrador' : 'Guardar cambios' }}
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Modal Confirmar Eliminación ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteModal.open" class="modal-backdrop" @click.self="deleteModal.open = false">
          <div class="modal-box modal-sm">
            <div class="modal-header">
              <div class="modal-title-group">
                <div class="modal-icon danger">🗑️</div>
                <div>
                  <h3 class="modal-title">Eliminar administrador</h3>
                  <p class="modal-subtitle">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </div>
            <div class="modal-body">
              <div class="delete-confirm-card">
                <img
                  :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${deleteModal.admin?.name}`"
                  class="delete-avatar"
                  alt=""
                />
                <div>
                  <div class="delete-name">{{ deleteModal.admin?.name }}</div>
                  <div class="delete-email">{{ deleteModal.admin?.email }}</div>
                </div>
              </div>
              <p class="delete-warning">
                Se eliminarán su cuenta y todos sus permisos. Sus sesiones activas serán revocadas.
              </p>
            </div>
            <div class="modal-footer">
              <button class="btn-ghost" @click="deleteModal.open = false">Cancelar</button>
              <button class="btn-danger" @click="executeDelete" :disabled="deleteModal.saving">
                <span v-if="deleteModal.saving" class="btn-spinner white"></span>
                {{ deleteModal.saving ? 'Eliminando…' : 'Sí, eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast de éxito -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast', toast.type]">
        <span>{{ toast.message }}</span>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '@/services/api';

// ── Estado principal ───────────────────────────────────────
const admins              = ref([]);
const availableModules    = ref([]);
const modulePermissions   = ref({});  // { users: ['read','write','edit','delete'], ... }
const loading             = ref(true);
const search              = ref('');
const showPassword        = ref(false);

// ── Filtro de búsqueda ─────────────────────────────────────
const filtered = computed(() => {
  if (!search.value.trim()) return admins.value;
  const q = search.value.toLowerCase();
  return admins.value.filter(a =>
    a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
  );
});

// ── Modal crear/editar ─────────────────────────────────────
const modal = reactive({
  open:      false,
  mode:      'create',
  saving:    false,
  error:     '',
  editId:    null,
  adminName: '',
});

const errors = reactive({ name: '', email: '', password: '' });

const defaultForm = () => ({ name: '', email: '', password: '', modules: {} });
const form        = reactive(defaultForm());

// ── Modal eliminar ─────────────────────────────────────────
const deleteModal = reactive({ open: false, saving: false, admin: null });

// ── Toast ──────────────────────────────────────────────────
const toast = reactive({ show: false, message: '', type: 'success' });
let toastTimer = null;

const showToast = (message, type = 'success') => {
  toast.message = message;
  toast.type    = type;
  toast.show    = true;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.show = false; }, 3500);
};

// ── Metadatos de módulos ───────────────────────────────────
const MODULE_META = {
  dashboard:     { label: 'Dashboard',         icon: '📊', desc: 'Ver estadísticas generales' },
  users:         { label: 'Usuarios',          icon: '👥', desc: 'Gestionar clientes y profesionales' },
  categories:    { label: 'Categorías',        icon: '🏷️', desc: 'Administrar categorías y servicios' },
  services:      { label: 'Servicios',         icon: '🔧', desc: 'Crear y editar servicios' },
  reports:       { label: 'Reportes',          icon: '📈', desc: 'Ver reportes operativos y financieros' },
  auditory:      { label: 'Auditoría',         icon: '🔍', desc: 'Historial de acciones del sistema' },
  live_services: { label: 'Servicios en Vivo', icon: '🔴', desc: 'Monitoreo en tiempo real de la operación' },
};

const moduleLabel = (mod) => MODULE_META[mod]?.label ?? mod;
const moduleIcon  = (mod) => MODULE_META[mod]?.icon  ?? '📁';
const moduleDesc  = (mod) => MODULE_META[mod]?.desc  ?? '';

const PERM_LABELS      = { read: 'Leer', write: 'Crear', edit: 'Editar', delete: 'Eliminar' };
const PERM_SHORT       = { read: 'R', write: 'C', edit: 'E', delete: 'D' };
const permLabel        = (p) => PERM_LABELS[p] ?? p;
const modulePerms      = (mod) => modulePermissions.value[mod] ?? ['read'];
const activePerms      = (permsObj) => Object.keys(PERM_LABELS).filter(p => permsObj[p]).map(p => PERM_LABELS[p]);
const activePermsShort = (permsObj) => Object.keys(PERM_SHORT).filter(p => permsObj[p]).map(p => PERM_SHORT[p]).join('');

// ── Fetch ──────────────────────────────────────────────────
const fetchAdmins = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/admin/sub-admins');
    admins.value            = data.admins;
    availableModules.value  = data.modules;
    modulePermissions.value = data.module_permissions ?? {};
  } catch (e) {
    showToast('Error al cargar los administradores.', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAdmins);

// ── Helpers de módulos ─────────────────────────────────────
const initModules = (existing = {}) => {
  const mods = {};
  availableModules.value.forEach(m => {
    const perms = modulePermissions.value[m] ?? ['read'];
    const ex    = existing[m];

    if (ex && typeof ex === 'object') {
      // Nuevo formato: { enabled, read, write, ... }
      mods[m] = { ...ex };
    } else {
      // Sin datos o formato antiguo booleano
      const enabled = !!ex;
      const entry   = { enabled };
      perms.forEach(p => { entry[p] = enabled && p === 'read'; });
      mods[m] = entry;
    }

    // Asegurar que todas las claves de permiso existen
    perms.forEach(p => { if (mods[m][p] === undefined) mods[m][p] = false; });
  });
  return mods;
};

const toggleModule = (mod) => {
  const current = form.modules[mod];
  if (!current) return;
  current.enabled = !current.enabled;
  // Al habilitar, activar "read" por defecto si todo está en false
  if (current.enabled) {
    const perms = modulePermissions.value[mod] ?? ['read'];
    const hasAny = perms.some(p => current[p]);
    if (!hasAny) current.read = true;
  }
};

// ── Validación ─────────────────────────────────────────────
const validate = () => {
  errors.name     = '';
  errors.email    = '';
  errors.password = '';
  let ok = true;

  if (!form.name.trim()) {
    errors.name = 'El nombre es obligatorio.'; ok = false;
  }
  if (modal.mode === 'create') {
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Ingresa un correo válido.'; ok = false;
    }
    if (form.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres.'; ok = false;
    }
  }
  return ok;
};

// ── Abrir modales ──────────────────────────────────────────
const openCreate = () => {
  Object.assign(form, defaultForm());
  form.modules    = initModules();
  modal.mode      = 'create';
  modal.error     = '';
  modal.editId    = null;
  modal.adminName = '';
  showPassword.value = false;
  errors.name = errors.email = errors.password = '';
  modal.open  = true;
};

const openEdit = (admin) => {
  form.name       = admin.name;
  form.email      = '';
  form.password   = '';
  form.modules    = initModules(admin.modules);
  modal.mode      = 'edit';
  modal.error     = '';
  modal.editId    = admin.id;
  modal.adminName = admin.name;
  errors.name = errors.email = errors.password = '';
  modal.open  = true;
};

const closeModal = () => {
  if (modal.saving) return;
  modal.open = false;
};

// ── Submit ─────────────────────────────────────────────────
const submitForm = async () => {
  if (!validate()) return;

  modal.error  = '';
  modal.saving = true;

  try {
    if (modal.mode === 'create') {
      const { data } = await api.post('/admin/sub-admins', {
        name:     form.name,
        email:    form.email,
        password: form.password,
        modules:  form.modules,
      });
      admins.value.unshift(data.admin);
      showToast(`✅ ${data.admin.name} creado correctamente.`);

    } else {
      const { data } = await api.put(`/admin/sub-admins/${modal.editId}`, {
        name:    form.name,
        modules: form.modules,
      });
      const idx = admins.value.findIndex(a => a.id === modal.editId);
      if (idx !== -1) admins.value[idx] = data.admin;
      showToast('✅ Permisos actualizados correctamente.');
    }

    modal.open = false;

  } catch (e) {
    modal.error = e.response?.data?.message ?? 'Error al guardar. Intenta de nuevo.';
  } finally {
    modal.saving = false;
  }
};

// ── Toggle estado ──────────────────────────────────────────
const toggleStatus = async (admin) => {
  try {
    const { data } = await api.put(`/admin/sub-admins/${admin.id}`, {
      is_active: !admin.is_active,
    });
    const idx = admins.value.findIndex(a => a.id === admin.id);
    if (idx !== -1) admins.value[idx] = data.admin;
    showToast(data.admin.is_active ? '✅ Administrador habilitado.' : '🚫 Administrador inhabilitado.');
  } catch (e) {
    showToast(e.response?.data?.message ?? 'Error al cambiar estado.', 'error');
  }
};

// ── Eliminar ───────────────────────────────────────────────
const confirmDelete = (admin) => {
  deleteModal.admin  = admin;
  deleteModal.saving = false;
  deleteModal.open   = true;
};

const executeDelete = async () => {
  deleteModal.saving = true;
  try {
    await api.delete(`/admin/sub-admins/${deleteModal.admin.id}`);
    admins.value      = admins.value.filter(a => a.id !== deleteModal.admin.id);
    deleteModal.open  = false;
    showToast(`🗑️ ${deleteModal.admin.name} eliminado.`);
  } catch (e) {
    showToast(e.response?.data?.message ?? 'Error al eliminar.', 'error');
    deleteModal.open = false;
  } finally {
    deleteModal.saving = false;
  }
};
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────── */
.sub-admins-page { display: flex; flex-direction: column; gap: 24px; }

/* ── Header ─────────────────────────────────────────────── */
.page-header {
  display: flex; justify-content: space-between; align-items: center;
  gap: 16px; flex-wrap: wrap;
}
.header-left    { display: flex; align-items: center; gap: 16px; }
.header-icon    { font-size: 36px; }
.section-title  { font-size: 26px; font-weight: 900; color: #0f172a; margin: 0; }
.section-subtitle { color: #64748b; font-size: 14px; margin-top: 2px; }

/* ── Quick stats ────────────────────────────────────────── */
.quick-stats {
  display: flex; gap: 16px; flex-wrap: wrap;
}
.quick-stat {
  display: flex; align-items: center; gap: 14px;
  background: white; padding: 16px 24px; border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06); flex: 1; min-width: 140px;
}
.qs-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
}
.qs-icon.blue  { background: #dbeafe; }
.qs-icon.green { background: #dcfce7; }
.qs-icon.red   { background: #fee2e2; }
.qs-value { font-size: 28px; font-weight: 900; color: #0f172a; line-height: 1; }
.qs-label { font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px; }

/* ── Loading ─────────────────────────────────────────────── */
.loading-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 0; gap: 16px; color: #64748b;
}
.loading-spinner {
  width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2563eb;
  border-radius: 50%; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Empty ───────────────────────────────────────────────── */
.empty-state-box {
  text-align: center; padding: 80px 40px;
  background: white; border-radius: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-state-box h3 { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
.empty-state-box p  { color: #64748b; margin-bottom: 24px; }

/* ── Tabla ───────────────────────────────────────────────── */
.table-card { padding: 0; overflow: hidden; }

.card-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; border-bottom: 1px solid #f1f5f9; gap: 16px; flex-wrap: wrap;
}
.search-box {
  display: flex; align-items: center; gap: 10px;
  background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px;
  padding: 10px 16px; flex: 1; max-width: 360px;
}
.search-icon  { font-size: 16px; flex-shrink: 0; }
.search-input { border: none; background: transparent; outline: none; font-size: 14px; color: #0f172a; width: 100%; }
.search-input::placeholder { color: #94a3b8; }

.toolbar-right   { display: flex; align-items: center; gap: 12px; }
.results-count   { font-size: 13px; color: #94a3b8; font-weight: 600; }

.table-row:hover { background: #fafbff; }

.table-user      { display: flex; align-items: center; gap: 12px; }
.table-avatar    { width: 40px; height: 40px; border-radius: 10px; border: 2px solid #e2e8f0; flex-shrink: 0; }
.table-user-name  { font-weight: 700; color: #0f172a; font-size: 14px; }
.table-user-email { font-size: 12px; color: #64748b; margin-top: 2px; }

.module-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.module-chip  {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;
}
.module-chip.granted { background: #dcfce7; color: #16a34a; }
.module-chip.denied  { background: #f1f5f9; color: #cbd5e1; text-decoration: line-through; }
.chip-dot   { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.chip-perms { font-size: 9px; font-weight: 900; background: rgba(0,0,0,.08); padding: 1px 4px; border-radius: 4px; letter-spacing: .5px; }
.no-access-text { font-size: 11px; color: #cbd5e1; }

.status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;
}
.status-badge.active   { background: #dcfce7; color: #16a34a; }
.status-badge.inactive { background: #fee2e2; color: #dc2626; }
.status-dot {
  width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0;
}
.status-badge.active .status-dot { animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }

.date-text { font-size: 13px; color: #64748b; }

.row-actions { display: flex; gap: 6px; }
.action-btn {
  width: 34px; height: 34px; border-radius: 8px; border: none;
  font-size: 15px; cursor: pointer; transition: all .2s;
  display: flex; align-items: center; justify-content: center;
}
.action-btn.edit       { background: #eff6ff; }
.action-btn.edit:hover { background: #dbeafe; }
.action-btn.deactivate { background: #fff7ed; }
.action-btn.activate   { background: #dcfce7; }
.action-btn.delete     { background: #fee2e2; }
.action-btn.delete:hover { background: #fca5a5; }

.no-results { text-align: center; color: #94a3b8; padding: 40px; font-size: 14px; }

/* ── Botones ─────────────────────────────────────────────── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 22px; background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; border: none; border-radius: 12px;
  font-weight: 700; font-size: 14px; cursor: pointer; transition: all .2s;
  white-space: nowrap; position: relative;
}
.btn-primary:hover    { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,.3); }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-icon { font-size: 16px; }

.btn-ghost {
  padding: 11px 22px; background: #f1f5f9; color: #475569;
  border: none; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all .2s;
}
.btn-ghost:hover    { background: #e2e8f0; }
.btn-ghost:disabled { opacity: .5; cursor: not-allowed; }

.btn-danger {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 22px; background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white; border: none; border-radius: 12px;
  font-weight: 700; font-size: 14px; cursor: pointer; transition: all .2s;
}
.btn-danger:hover    { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(220,38,38,.3); }
.btn-danger:disabled { opacity: .6; cursor: not-allowed; transform: none; }

.btn-spinner {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.4);
  border-top-color: white; border-radius: 50%; animation: spin .7s linear infinite;
  display: inline-block;
}

/* ── Modal ───────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,.55);
  backdrop-filter: blur(4px); z-index: 100;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-box {
  background: white; border-radius: 24px; width: 100%; max-width: 540px;
  box-shadow: 0 30px 80px rgba(0,0,0,.2); overflow: hidden;
  display: flex; flex-direction: column; max-height: 90vh;
}
.modal-sm { max-width: 420px; }

.modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 24px 28px 20px; border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
}
.modal-title-group { display: flex; align-items: flex-start; gap: 14px; }
.modal-icon        { font-size: 32px; flex-shrink: 0; }
.modal-icon.danger { filter: grayscale(0); }
.modal-title       { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0 0 2px; }
.modal-subtitle    { font-size: 13px; color: #64748b; margin: 0; }
.modal-close {
  width: 32px; height: 32px; border-radius: 8px; border: none;
  background: #f1f5f9; color: #64748b; font-size: 14px; cursor: pointer; flex-shrink: 0;
  transition: all .2s;
}
.modal-close:hover { background: #e2e8f0; }

.modal-body {
  padding: 24px 28px; overflow-y: auto; flex: 1;
  display: flex; flex-direction: column; gap: 24px;
}

.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 20px 28px; border-top: 1px solid #f1f5f9; flex-shrink: 0;
}

/* ── Formulario ──────────────────────────────────────────── */
.form-section { display: flex; flex-direction: column; gap: 16px; }
.form-section-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 800; color: #374151;
  text-transform: uppercase; letter-spacing: .5px;
  padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;
}

.form-group   { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 700; color: #374151; }
.required { color: #dc2626; }

.input-wrapper { position: relative; }
.form-input {
  width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 14px; color: #0f172a; outline: none; transition: border .2s;
  background: white;
}
.form-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
.form-input.error { border-color: #dc2626; }
.toggle-password {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  border: none; background: transparent; font-size: 16px; cursor: pointer; padding: 4px;
}
.field-error { font-size: 12px; color: #dc2626; font-weight: 600; }

/* ── Módulos ─────────────────────────────────────────────── */
.perms-hint { font-size: 13px; color: #94a3b8; margin: -8px 0 4px; }

/* Nuevo layout de módulos con permisos granulares */
.modules-list { display: flex; flex-direction: column; gap: 8px; }

.module-card {
  border-radius: 12px; border: 2px solid #f1f5f9;
  overflow: hidden; transition: border-color .2s;
}
.module-card.enabled  { border-color: #bfdbfe; }
.module-card.disabled { border-color: #f1f5f9; }

.module-card-header {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
  cursor: pointer; user-select: none; transition: background .15s;
}
.module-card.enabled  .module-card-header { background: #eff6ff; }
.module-card.disabled .module-card-header { background: #fafafa; }
.module-card-header:hover { opacity: .9; }

.module-toggle-icon { font-size: 20px; flex-shrink: 0; }
.module-toggle-info { flex: 1; min-width: 0; }
.module-toggle-name { font-weight: 700; font-size: 13px; color: #0f172a; }
.module-toggle-desc { font-size: 11px; color: #94a3b8; margin-top: 1px; }

/* Fila de permisos */
.perm-row {
  display: flex; gap: 6px; flex-wrap: wrap;
  padding: 10px 14px; background: #f8faff;
  border-top: 1px solid #e0eaff;
}
.perm-check {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 10px; border-radius: 7px; border: 1.5px solid #e2e8f0;
  background: white; cursor: pointer; user-select: none;
  font-size: 12px; font-weight: 600; color: #475569;
  transition: border-color .15s, background .15s;
}
.perm-check:has(input:checked) {
  border-color: #2563eb; background: #eff6ff; color: #2563eb;
}
.perm-check input { width: 13px; height: 13px; accent-color: #2563eb; cursor: pointer; }
.perm-label { pointer-events: none; }

.toggle-switch {
  width: 38px; height: 22px; border-radius: 11px; background: #e2e8f0;
  position: relative; flex-shrink: 0; transition: background .2s;
}
.toggle-switch.on { background: #2563eb; }
.toggle-knob {
  width: 16px; height: 16px; border-radius: 50%; background: white;
  position: absolute; top: 3px; left: 3px;
  transition: transform .2s; box-shadow: 0 1px 4px rgba(0,0,0,.2);
}
.toggle-switch.on .toggle-knob { transform: translateX(16px); }

.access-summary {
  display: flex; align-items: center; gap: 8px; justify-content: flex-end;
  font-size: 13px; padding-top: 4px;
}
.summary-label { color: #64748b; font-weight: 600; }
.summary-count { color: #2563eb; font-weight: 800; }

/* ── Modal Error ─────────────────────────────────────────── */
.modal-error-banner {
  display: flex; align-items: center; gap: 10px;
  background: #fef3c7; border: 1px solid #fcd34d; color: #92400e;
  padding: 12px 16px; border-radius: 10px; font-size: 14px; font-weight: 600;
}

/* ── Modal Eliminar ──────────────────────────────────────── */
.delete-confirm-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px; background: #f8fafc; border-radius: 12px; margin-bottom: 14px;
}
.delete-avatar { width: 48px; height: 48px; border-radius: 12px; border: 2px solid #e2e8f0; }
.delete-name   { font-weight: 700; color: #0f172a; font-size: 15px; }
.delete-email  { font-size: 13px; color: #64748b; margin-top: 2px; }
.delete-warning {
  font-size: 14px; color: #64748b; line-height: 1.6;
  padding: 12px 16px; background: #fff7ed; border-radius: 10px;
  border-left: 3px solid #f59e0b;
}

/* ── Toast ───────────────────────────────────────────────── */
.toast {
  position: fixed; bottom: 32px; right: 32px; z-index: 200;
  padding: 14px 24px; border-radius: 14px; font-size: 14px; font-weight: 700;
  box-shadow: 0 8px 30px rgba(0,0,0,.15); max-width: 360px;
}
.toast.success { background: #0f172a; color: white; }
.toast.error   { background: #dc2626; color: white; }

/* ── Transiciones ────────────────────────────────────────── */
.modal-enter-active, .modal-leave-active { transition: all .25s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; transform: scale(.96); }

.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(16px); }
.toast-leave-to   { opacity: 0; transform: translateY(16px); }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 640px) {
  .modules-list  { gap: 6px; }
  .quick-stats   { flex-direction: column; }
  .modal-body    { padding: 20px; }
  .modal-header  { padding: 20px; }
  .modal-footer  { padding: 16px 20px; }
  .card-toolbar  { flex-direction: column; align-items: stretch; }
  .search-box    { max-width: 100%; }
  .page-header   { flex-direction: column; align-items: flex-start; }
  .toast         { bottom: 16px; right: 16px; left: 16px; }
}
</style>
<template>
    <div class="categories-panel">

        <!-- ── PAGE HEADER ── -->
        <div class="page-header">
            <div class="header-left">
                <div class="header-icon">📦</div>
                <div>
                    <h1 class="page-title">Categorías y Servicios</h1>
                    <p class="page-subtitle">
                        <span class="total-badge">{{ categories.length }} categorías</span>
                        <span class="subtitle-sep">·</span>
                        <span class="total-badge services-badge">{{ totalServices }} servicios</span>
                        <span class="subtitle-sep">·</span>
                        Gestión del tarifario
                    </p>
                </div>
            </div>
            <div class="header-actions">
                <button class="btn-refresh" @click="fetchCategories" :disabled="loading">
                    <span :class="{ spinning: loading }">🔄</span>
                    <span class="btn-text">Actualizar</span>
                </button>
                <button class="btn-export" @click="openCreateCategory">
                    <span>➕</span>
                    <span class="btn-text">Nueva Categoría</span>
                </button>
            </div>
        </div>

        <!-- ── STAT ROW ── -->
        <div class="stat-row">
            <div class="mini-stat blue">
                <span class="mini-stat-icon">📦</span>
                <div>
                    <div class="mini-stat-value">{{ categories.length }}</div>
                    <div class="mini-stat-label">Categorías</div>
                </div>
            </div>
            <div class="mini-stat green">
                <span class="mini-stat-icon">⚙️</span>
                <div>
                    <div class="mini-stat-value">{{ totalServices }}</div>
                    <div class="mini-stat-label">Servicios</div>
                </div>
            </div>
            <div class="mini-stat amber">
                <span class="mini-stat-icon">💰</span>
                <div>
                    <div class="mini-stat-value">S/ {{ avgPrice }}</div>
                    <div class="mini-stat-label">Precio promedio</div>
                </div>
            </div>
            <div class="mini-stat teal">
                <span class="mini-stat-icon">📊</span>
                <div>
                    <div class="mini-stat-value">{{ maxServicesCategory }}</div>
                    <div class="mini-stat-label">Más servicios</div>
                </div>
            </div>
        </div>

        <!-- ── SEARCH BAR ── -->
        <div class="filters-bar">
            <div class="search-wrapper">
                <span class="search-icon">🔍</span>
                <input v-model="searchQuery" type="text" placeholder="Buscar categoría o servicio..."
                    class="search-input" />
                <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">✕</button>
            </div>
            <div class="view-toggle">
                <button :class="['toggle-btn', { active: viewMode === 'cards' }]" @click="viewMode = 'cards'">
                    ▦ Tarjetas
                </button>
                <button :class="['toggle-btn', { active: viewMode === 'compact' }]" @click="viewMode = 'compact'">
                    ☰ Compacto
                </button>
            </div>
        </div>

        <!-- ── LOADING ── -->
        <div v-if="loading" class="skeleton-list">
            <div v-for="n in 3" :key="n" class="skeleton-card">
                <div class="sk-header">
                    <div class="sk sk-title"></div>
                    <div class="sk sk-btn"></div>
                </div>
                <div class="sk-table">
                    <div v-for="i in 4" :key="i" class="sk sk-row"></div>
                </div>
            </div>
        </div>

        <!-- ── EMPTY ── -->
        <div v-else-if="filteredCategories.length === 0" class="empty-state">
            <span class="empty-icon">📭</span>
            <p class="empty-title">No se encontraron resultados</p>
            <p class="empty-sub">Intenta con otra búsqueda o crea una nueva categoría</p>
            <button class="btn-export" @click="openCreateCategory">➕ Nueva Categoría</button>
        </div>

        <!-- ── CATEGORY LIST ── -->
        <div v-else class="category-list" :class="viewMode">

            <div v-for="category in filteredCategories" :key="category.id" class="category-card"
                :class="{ expanded: expandedIds.includes(category.id) }">

                <!-- CATEGORY HEADER -->
                <div class="category-header" @click="toggleExpand(category.id)">

                    <div class="category-left">
                        <div class="category-avatar">
                            {{ category.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="category-info">
                            <h3 class="category-name">{{ category.name }}</h3>
                            <div class="category-meta">
                                <span class="meta-chip">
                                    <span class="meta-dot green"></span>
                                    {{ category.services.length }} servicios
                                </span>
                                <span v-if="category.services.length" class="meta-chip">
                                    💰 Desde S/ {{ minPrice(category.services) }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="category-right">
                        <div class="category-actions" @click.stop>
                            <button class="action-pill green" @click="openCreateService(category)">
                                ➕ Servicio
                            </button>
                            <button class="action-pill edit" @click="openEditCategory(category)">
                                ✏️
                            </button>
                            <button class="action-pill danger" @click="deleteCategory(category)">
                                🗑
                            </button>
                        </div>
                        <div class="expand-toggle" :class="{ rotated: expandedIds.includes(category.id) }">
                            ›
                        </div>
                    </div>

                </div>

                <!-- SERVICES TABLE -->
                <div class="services-wrapper" v-show="expandedIds.includes(category.id)">

                    <div v-if="category.services.length === 0" class="no-services">
                        <span>📋</span> Sin servicios registrados.
                        <button class="inline-add" @click="openCreateService(category)">Agregar uno</button>
                    </div>

                    <table v-else class="services-table">
                        <thead>
                            <tr>
                                <th>Servicio</th>
                                <th>Precio</th>
                                <th>Aliados %</th>
                                <th>Pasarela %</th>
                                <th>IMAVICX %</th>
                                <th>ASECALIDAD %</th>
                                <th>Mant %</th>
                                <th class="th-actions"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="service in category.services" :key="service.id" class="service-row">
                                <td class="td-name">
                                    <span class="service-name">{{ service.name }}</span>
                                </td>
                                <td>
                                    <span class="price-badge">S/ {{ service.price }}</span>
                                </td>
                                <td><span class="pct-chip">{{ service.allies_percentage }}%</span></td>
                                <td><span class="pct-chip">{{ service.payment_gateway_commission }}%</span></td>
                                <td><span class="pct-chip">{{ service.imavicx_commission }}%</span></td>
                                <td><span class="pct-chip">{{ service.asecalidad_commission }}%</span></td>
                                <td><span class="pct-chip">{{ service.maintenance_percentage }}%</span></td>
                                <td class="td-actions">
                                    <div class="row-actions">
                                        <button class="icon-btn edit" @click="editService(service)"
                                            title="Editar">✏️</button>
                                        <button class="icon-btn danger" @click="deleteService(service)"
                                            title="Eliminar">🗑</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>

            </div>

        </div>

        <!-- ── MODAL: CREAR CATEGORÍA ── -->
        <Teleport to="body">
            <div v-if="showCreateCategory" class="modal-overlay" @click.self="showCreateCategory = false">
                <div class="modal">
                    <div class="modal-header">
                        <h3>Nueva Categoría</h3>
                        <button class="modal-close" @click="showCreateCategory = false">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Nombre de la categoría</label>
                            <input v-model="categoryForm.name" type="text" class="form-input"
                                placeholder="Ej: Instalaciones Eléctricas" />
                        </div>
                        <div v-if="formError" class="form-error">⚠️ {{ formError }}</div>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn secondary" @click="showCreateCategory = false">Cancelar</button>
                        <button class="modal-btn primary" @click="saveCategory" :disabled="saving">
                            {{ saving ? 'Guardando...' : 'Crear categoría' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── MODAL: CREAR / EDITAR SERVICIO ── -->
        <Teleport to="body">
            <div v-if="showServiceModal" class="modal-overlay" @click.self="showServiceModal = false">
                <div class="modal modal-lg">
                    <div class="modal-header">
                        <h3>{{ editingService ? 'Editar Servicio' : 'Nuevo Servicio' }}</h3>
                        <button class="modal-close" @click="showServiceModal = false">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Nombre del servicio</label>
                            <input v-model="serviceForm.name" type="text" class="form-input"
                                placeholder="Ej: Instalación de tomacorrientes" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Precio (S/)</label>
                            <input v-model="serviceForm.price" type="number" step="0.01" class="form-input"
                                placeholder="0.00" />
                        </div>
                        <div class="pct-grid">
                            <div class="form-group">
                                <label class="form-label">Aliados %</label>
                                <input v-model="serviceForm.allies_percentage" type="number" step="0.01"
                                    class="form-input" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Pasarela %</label>
                                <input v-model="serviceForm.payment_gateway_commission" type="number" step="0.01"
                                    class="form-input" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">IMAVICX %</label>
                                <input v-model="serviceForm.imavicx_commission" type="number" step="0.01"
                                    class="form-input" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">ASECALIDAD %</label>
                                <input v-model="serviceForm.asecalidad_commission" type="number" step="0.01"
                                    class="form-input" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Mantenimiento %</label>
                                <input v-model="serviceForm.maintenance_percentage" type="number" step="0.01"
                                    class="form-input" />
                            </div>
                        </div>
                        <div v-if="formError" class="form-error">⚠️ {{ formError }}</div>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn secondary" @click="showServiceModal = false">Cancelar</button>
                        <button class="modal-btn primary" @click="saveService" :disabled="saving">
                            {{ saving ? 'Guardando...' : (editingService ? 'Guardar cambios' : 'Crear servicio') }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── MODAL: CONFIRM DELETE ── -->
        <Teleport to="body">
            <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
                <div class="modal confirm-modal">
                    <div class="confirm-icon">🗑️</div>
                    <h3 class="confirm-title">¿Eliminar {{ deleteTarget?.type === 'category' ? 'categoría' : 'servicio'
                        }}?</h3>
                    <p class="confirm-text">
                        Esta acción no se puede deshacer.<br />
                        <strong>{{ deleteTarget?.item?.name }}</strong> será eliminado permanentemente.
                    </p>
                    <div class="modal-footer">
                        <button class="modal-btn secondary" @click="showDeleteConfirm = false">Cancelar</button>
                        <button class="modal-btn danger" @click="confirmDelete" :disabled="saving">
                            {{ saving ? 'Eliminando...' : 'Sí, eliminar' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import categoryService from '../../services/categoryService'

// ─── Estado ────────────────────────────────────────────────
const categories = ref([])
const loading = ref(false)
const searchQuery = ref('')
const viewMode = ref('cards')
const expandedIds = ref([])

// ─── Stats ─────────────────────────────────────────────────
const totalServices = computed(() => categories.value.reduce((sum, c) => sum + c.services.length, 0))

const avgPrice = computed(() => {
    const all = categories.value.flatMap(c => c.services.map(s => parseFloat(s.price) || 0))
    if (!all.length) return '0.00'
    return (all.reduce((a, b) => a + b, 0) / all.length).toFixed(2)
})

const maxServicesCategory = computed(() => {
    if (!categories.value.length) return '—'
    const top = [...categories.value].sort((a, b) => b.services.length - a.services.length)[0]
    return top?.name?.split(' ')[0] ?? '—'
})

// ─── Filtros ───────────────────────────────────────────────
const filteredCategories = computed(() => {
    if (!searchQuery.value.trim()) return categories.value
    const q = searchQuery.value.toLowerCase()
    return categories.value
        .map(cat => ({
            ...cat,
            services: cat.services.filter(s => s.name.toLowerCase().includes(q))
        }))
        .filter(cat =>
            cat.name.toLowerCase().includes(q) || cat.services.length > 0
        )
})

// ─── Expand / Collapse ─────────────────────────────────────
const toggleExpand = (id) => {
    const idx = expandedIds.value.indexOf(id)
    if (idx === -1) expandedIds.value.push(id)
    else expandedIds.value.splice(idx, 1)
}

// ─── Helpers ───────────────────────────────────────────────
const minPrice = (services) => {
    const prices = services.map(s => parseFloat(s.price) || 0)
    return Math.min(...prices).toFixed(2)
}

// ─── API ───────────────────────────────────────────────────
const fetchCategories = async () => {
    loading.value = true
    try {
        const { data } = await categoryService.getAll()
        categories.value = data.categories
        // auto-expand primera categoría
        if (categories.value.length > 0 && expandedIds.value.length === 0) {
            expandedIds.value = [categories.value[0].id]
        }
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

// ─── Modales ───────────────────────────────────────────────
const showCreateCategory = ref(false)
const showServiceModal = ref(false)
const showDeleteConfirm = ref(false)
const saving = ref(false)
const formError = ref('')
const editingService = ref(null)
const activeCategory = ref(null)
const deleteTarget = ref(null)

const categoryForm = ref({ name: '' })
const serviceForm = ref({
    name: '', price: '',
    allies_percentage: '', payment_gateway_commission: '',
    imavicx_commission: '', asecalidad_commission: '',
    maintenance_percentage: ''
})

const openCreateCategory = () => {
    categoryForm.value = { name: '' }
    formError.value = ''
    showCreateCategory.value = true
}

const openEditCategory = (category) => {
    categoryForm.value = { name: category.name }
    formError.value = ''
    showCreateCategory.value = true
}

const openCreateService = (category) => {
    activeCategory.value = category
    editingService.value = null
    serviceForm.value = {
        name: '', price: '', allies_percentage: '',
        payment_gateway_commission: '', imavicx_commission: '',
        asecalidad_commission: '', maintenance_percentage: ''
    }
    formError.value = ''
    showServiceModal.value = true
}

const editService = (service) => {
    editingService.value = service
    serviceForm.value = { ...service }
    formError.value = ''
    showServiceModal.value = true
}

const deleteCategory = (category) => {
    deleteTarget.value = { type: 'category', item: category }
    showDeleteConfirm.value = true
}

const deleteService = (service) => {
    deleteTarget.value = { type: 'service', item: service }
    showDeleteConfirm.value = true
}

const confirmDelete = async () => {
    saving.value = true
    try {
        if (deleteTarget.value.type === 'category') {
            await categoryService.delete(deleteTarget.value.item.id)
        } else {
            await categoryService.deleteService(deleteTarget.value.item.id)
        }
        await fetchCategories()
        showDeleteConfirm.value = false
    } catch (e) {
        console.error(e)
    } finally {
        saving.value = false
    }
}

const saveCategory = async () => {
    if (!categoryForm.value.name.trim()) { formError.value = 'El nombre es requerido'; return }
    saving.value = true
    formError.value = ''
    try {
        // await categoryService.create(categoryForm.value)
        await fetchCategories()
        showCreateCategory.value = false
    } catch (e) {
        formError.value = 'Error al guardar'
    } finally {
        saving.value = false
    }
}

const saveService = async () => {
    if (!serviceForm.value.name.trim()) { formError.value = 'El nombre es requerido'; return }
    saving.value = true
    formError.value = ''
    try {
        // await categoryService.createService / updateService
        await fetchCategories()
        showServiceModal.value = false
    } catch (e) {
        formError.value = 'Error al guardar'
    } finally {
        saving.value = false
    }
}

onMounted(fetchCategories)
</script>

<style scoped>
*,
*::before,
*::after {
    box-sizing: border-box;
}

.categories-panel {
    font-family: 'Outfit', -apple-system, sans-serif;
    color: #0f172a;
}

/* ─── Page Header ─── */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;
    flex-wrap: wrap;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.header-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    flex-shrink: 0;
}

.page-title {
    font-size: 28px;
    font-weight: 900;
    margin: 0 0 4px;
    line-height: 1.2;
}

.page-subtitle {
    font-size: 13px;
    color: #64748b;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.total-badge {
    background: linear-gradient(135deg, #2563eb, #4f46e5);
    color: white;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
}

.services-badge {
    background: linear-gradient(135deg, #059669, #10b981);
}

.subtitle-sep {
    color: #cbd5e1;
}

.header-actions {
    display: flex;
    gap: 10px;
}

.btn-refresh,
.btn-export {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 18px;
    border-radius: 12px;
    border: none;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
}

.btn-refresh {
    background: #f1f5f9;
    color: #475569;
}

.btn-refresh:hover:not(:disabled) {
    background: #e2e8f0;
}

.btn-refresh:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-export {
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: white;
    box-shadow: 0 4px 14px rgba(37, 99, 235, .3);
}

.btn-export:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, .4);
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.spinning {
    display: inline-block;
    animation: spin 1s linear infinite;
}

/* ─── Stat Row ─── */
.stat-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
}

.mini-stat {
    background: white;
    border-radius: 14px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .06);
    border-left: 4px solid transparent;
    transition: all 0.2s;
}

.mini-stat:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, .08);
}

.mini-stat.blue {
    border-left-color: #3b82f6;
}

.mini-stat.green {
    border-left-color: #22c55e;
}

.mini-stat.amber {
    border-left-color: #f59e0b;
}

.mini-stat.teal {
    border-left-color: #14b8a6;
}

.mini-stat-icon {
    font-size: 24px;
}

.mini-stat-value {
    font-size: 22px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1;
}

.mini-stat-label {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .5px;
    margin-top: 2px;
}

/* ─── Filters Bar ─── */
.filters-bar {
    background: white;
    border-radius: 16px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .06);
    flex-wrap: wrap;
}

.search-wrapper {
    position: relative;
    flex: 1;
    min-width: 200px;
    max-width: 360px;
}

.search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 15px;
    pointer-events: none;
}

.search-clear {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    font-size: 14px;
    padding: 2px 6px;
    border-radius: 4px;
}

.search-clear:hover {
    color: #ef4444;
}

.search-input {
    width: 100%;
    padding: 10px 36px;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    color: #0f172a;
    outline: none;
    transition: all 0.2s;
    font-family: inherit;
}

.search-input:focus {
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, .1);
}

.search-input::placeholder {
    color: #94a3b8;
}

.view-toggle {
    display: flex;
    gap: 4px;
    margin-left: auto;
    background: #f1f5f9;
    border-radius: 10px;
    padding: 4px;
}

.toggle-btn {
    padding: 6px 14px;
    border-radius: 8px;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    background: transparent;
    color: #64748b;
    transition: all 0.2s;
    font-family: inherit;
    white-space: nowrap;
}

.toggle-btn.active {
    background: white;
    color: #2563eb;
    box-shadow: 0 1px 4px rgba(0, 0, 0, .08);
}

/* ─── Skeleton ─── */
.skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.skeleton-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .06);
}

.sk-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
}

.sk-table {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.sk {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 6px;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0
    }

    100% {
        background-position: -200% 0
    }
}

.sk-title {
    width: 40%;
    height: 20px;
}

.sk-btn {
    width: 100px;
    height: 34px;
    border-radius: 8px;
}

.sk-row {
    width: 100%;
    height: 14px;
}

/* ─── Empty ─── */
.empty-state {
    background: white;
    border-radius: 16px;
    padding: 60px 40px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .06);
}

.empty-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 12px;
}

.empty-title {
    font-size: 18px;
    font-weight: 800;
    margin: 0 0 8px;
}

.empty-sub {
    color: #94a3b8;
    font-size: 14px;
    margin: 0 0 20px;
}

/* ─── Category List ─── */
.category-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* ─── Category Card ─── */
.category-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .06);
    overflow: hidden;
    border: 1.5px solid #f1f5f9;
    transition: box-shadow 0.2s, border-color 0.2s;
}

.category-card:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, .08);
}

.category-card.expanded {
    border-color: #bfdbfe;
    box-shadow: 0 4px 20px rgba(37, 99, 235, .08);
}

/* ─── Category Header ─── */
.category-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    cursor: pointer;
    gap: 16px;
    user-select: none;
    transition: background 0.15s;
}

.category-header:hover {
    background: #f8fafc;
}

.category-card.expanded .category-header {
    background: #eff6ff;
}

.category-left {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
}

.category-avatar {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: white;
    font-size: 20px;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.category-info {
    min-width: 0;
}

.category-name {
    font-size: 16px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.category-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    background: #f1f5f9;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
}

.meta-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
}

.meta-dot.green {
    background: #22c55e;
}

.category-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
}

.category-actions {
    display: flex;
    align-items: center;
    gap: 6px;
}

.action-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 14px;
    border-radius: 10px;
    border: none;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    white-space: nowrap;
}

.action-pill.green {
    background: #dcfce7;
    color: #16a34a;
}

.action-pill.green:hover {
    background: #bbf7d0;
}

.action-pill.edit {
    background: #fef3c7;
    color: #d97706;
}

.action-pill.edit:hover {
    background: #fde68a;
}

.action-pill.danger {
    background: #fee2e2;
    color: #dc2626;
}

.action-pill.danger:hover {
    background: #fecaca;
}

.expand-toggle {
    font-size: 22px;
    color: #94a3b8;
    font-weight: 700;
    transition: transform 0.25s ease;
    line-height: 1;
    width: 24px;
    text-align: center;
}

.expand-toggle.rotated {
    transform: rotate(90deg);
    color: #2563eb;
}

/* ─── Services Wrapper ─── */
.services-wrapper {
    border-top: 1px solid #f1f5f9;
}

.no-services {
    padding: 20px 24px;
    font-size: 14px;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 8px;
}

.inline-add {
    background: none;
    border: none;
    color: #2563eb;
    font-weight: 700;
    cursor: pointer;
    font-size: 14px;
    font-family: inherit;
    text-decoration: underline;
    padding: 0;
}

/* ─── Services Table ─── */
.services-table {
    width: 100%;
    border-collapse: collapse;
}

.services-table thead tr {
    background: #f8fafc;
}

.services-table th {
    padding: 10px 14px;
    text-align: left;
    font-size: 11px;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: .5px;
    white-space: nowrap;
}

.th-actions {
    text-align: right;
}

.service-row {
    border-top: 1px solid #f1f5f9;
    transition: background 0.15s;
}

.service-row:hover {
    background: #f8fafc;
}

.services-table td {
    padding: 12px 14px;
    font-size: 14px;
    vertical-align: middle;
}

.td-name {
    min-width: 160px;
}

.service-name {
    font-weight: 600;
    color: #0f172a;
}

.price-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    color: #15803d;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 800;
    white-space: nowrap;
}

.pct-chip {
    display: inline-block;
    padding: 3px 8px;
    background: #f1f5f9;
    color: #475569;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
}

.td-actions {
    text-align: right;
}

.row-actions {
    display: flex;
    justify-content: flex-end;
    gap: 5px;
}

.icon-btn {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: none;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
}

.icon-btn.edit:hover {
    background: #fef3c7;
}

.icon-btn.danger:hover {
    background: #fee2e2;
}

/* ─── Modals ─── */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, .6);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    overflow-y: auto;
}

.modal {
    background: white;
    border-radius: 20px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, .25);
    width: 100%;
    max-width: 440px;
    animation: modalIn 0.25s cubic-bezier(.34, 1.56, .64, 1);
    overflow: hidden;
    max-height: calc(100vh - 40px);
    display: flex;
    flex-direction: column;
    margin: auto;
}

.modal-lg {
    max-width: 580px;
}

@keyframes modalIn {
    from {
        opacity: 0;
        transform: scale(.92) translateY(12px);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;
    flex-shrink: 0;
}

.modal-header h3 {
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #94a3b8;
    padding: 4px 8px;
    border-radius: 8px;
}

.modal-close:hover {
    background: #f1f5f9;
    color: #475569;
}

.modal-body {
    padding: 24px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid #f1f5f9;
    flex-shrink: 0;
    background: white;
}

.confirm-modal {
    max-width: 380px;
    text-align: center;
    padding-top: 8px;
    max-height: none;
}

.confirm-icon {
    font-size: 56px;
    margin: 24px 0 8px;
    display: block;
}

.confirm-title {
    font-size: 22px;
    font-weight: 900;
    color: #0f172a;
    margin: 0 0 12px;
}

.confirm-text {
    font-size: 14px;
    color: #64748b;
    line-height: 1.6;
    margin: 0 0 8px;
}

.confirm-modal .modal-footer {
    justify-content: center;
}

/* ─── Form ─── */
.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
}

.form-label {
    font-size: 13px;
    font-weight: 700;
    color: #475569;
}

.form-input {
    padding: 11px 14px;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    color: #0f172a;
    outline: none;
    transition: all 0.2s;
    font-family: inherit;
    width: 100%;
}

.form-input:focus {
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, .1);
}

.pct-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.form-error {
    background: #fee2e2;
    color: #dc2626;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
}

/* ─── Modal Buttons ─── */
.modal-btn {
    padding: 10px 22px;
    border-radius: 10px;
    border: none;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
}

.modal-btn.primary {
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: white;
    box-shadow: 0 4px 12px rgba(37, 99, 235, .3);
}

.modal-btn.primary:hover:not(:disabled) {
    transform: translateY(-1px);
}

.modal-btn.secondary {
    background: #f1f5f9;
    color: #475569;
}

.modal-btn.secondary:hover {
    background: #e2e8f0;
}

.modal-btn.danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
}

.modal-btn.danger:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(239, 68, 68, .4);
}

.modal-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* ─── Responsive ─── */
@media (max-width: 900px) {
    .stat-row {
        grid-template-columns: repeat(2, 1fr);
    }

    .pct-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .page-title {
        font-size: 22px;
    }

    .header-icon {
        width: 46px;
        height: 46px;
        font-size: 22px;
    }

    .stat-row {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }

    .btn-text {
        display: none;
    }

    .btn-refresh,
    .btn-export {
        padding: 10px 14px;
    }

    .category-header {
        padding: 14px 16px;
    }

    .services-table th,
    .services-table td {
        padding: 10px 10px;
    }
}

@media (max-width: 560px) {
    .stat-row {
        grid-template-columns: repeat(2, 1fr);
    }

    .action-pill span:first-child {
        display: none;
    }

    .action-pill {
        padding: 7px 10px;
    }

    .view-toggle {
        display: none;
    }

    .filters-bar {
        flex-direction: column;
        align-items: stretch;
    }

    .search-wrapper {
        max-width: 100%;
    }
}
</style>
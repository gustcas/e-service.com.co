<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="inv-overlay" @click.self="$emit('close')">
        <div class="inv-modal">

          <!-- Acciones (no se imprimen) -->
          <div class="inv-actions no-print">
            <button class="inv-close" @click="$emit('close')">✕</button>
            <button class="inv-print" @click="print">🖨️ Imprimir / Guardar PDF</button>
          </div>

          <!-- Factura imprimible -->
          <div class="inv-body" ref="invoiceRef">

            <!-- Cabecera -->
            <div class="inv-header">
              <div class="inv-brand">
                <img src="/images/logo-services-sin-fondo.png" class="inv-logo" alt="e-servide" />
                <div>
                  <div class="inv-brand-name">e-servide</div>
                  <div class="inv-brand-sub">Plataforma de servicios profesionales</div>
                </div>
              </div>
              <div class="inv-meta">
                <div class="inv-num">Comprobante #{{ String(request.id).padStart(6, '0') }}</div>
                <div class="inv-date">Fecha: {{ completionDate }}</div>
                <div class="inv-status">Estado: <span class="inv-status-badge">Completado ✓</span></div>
              </div>
            </div>

            <div class="inv-divider"></div>

            <!-- Partes -->
            <div class="inv-parties">
              <div class="inv-party">
                <div class="inv-party-title">Cliente</div>
                <div class="inv-party-name">{{ clientName }}</div>
              </div>
              <div class="inv-arrow">→</div>
              <div class="inv-party">
                <div class="inv-party-title">Profesional</div>
                <div class="inv-party-name">{{ professionalName }}</div>
                <div v-if="professionalPhone" class="inv-party-sub">{{ professionalPhone }}</div>
              </div>
            </div>

            <div class="inv-divider"></div>

            <!-- Detalle del servicio -->
            <div class="inv-section-title">Detalle del servicio</div>
            <table class="inv-table">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th v-if="request.people_count > 1">Personas</th>
                  <th class="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="inv-svc-name">{{ request.service_name }}</div>
                    <div v-if="request.description" class="inv-svc-desc">{{ request.description }}</div>
                  </td>
                  <td>{{ request.service_date }}</td>
                  <td>{{ request.service_time }}</td>
                  <td v-if="request.people_count > 1">{{ request.people_count }}</td>
                  <td class="text-right inv-amount">${{ Number(request.budget).toLocaleString('es-CO') }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Ubicación -->
            <div v-if="request.address" class="inv-address">
              📍 <strong>Ubicación:</strong> {{ request.address }}
            </div>

            <div class="inv-divider"></div>

            <!-- Total -->
            <div class="inv-total-row">
              <span class="inv-total-label">Total pagado</span>
              <span class="inv-total-value">${{ Number(request.budget).toLocaleString('es-CO') }} COP</span>
            </div>

            <!-- Pie -->
            <div class="inv-footer">
              <p>Este comprobante es generado automáticamente por la plataforma e-servide.</p>
              <p>Para soporte: soporte@e-servide.com.co</p>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  open:    { type: Boolean, default: false },
  request: { type: Object, required: true },
  type:    { type: String, default: 'client' },
  userName:{ type: String, default: '' },
})

defineEmits(['close'])

const invoiceRef = ref(null)

const clientName = computed(() => {
  if (props.type === 'client') return props.userName || 'Cliente'
  return props.request.client_name || 'Cliente'
})

const professionalName = computed(() => {
  if (props.type === 'professional') return props.userName || 'Profesional'
  return (props.request.professional && props.request.professional.name) || 'Profesional'
})

const professionalPhone = computed(() => {
  if (props.type === 'professional') return ''
  return (props.request.professional && props.request.professional.phone) || ''
})

const completionDate = computed(() => {
  const d = props.request.completed_at || props.request.service_date
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch {
    return d
  }
})

const print = () => {
  const el = invoiceRef.value
  if (!el) return

  const origin = window.location.origin

  // Clonar para no mutar el DOM en vivo y arreglar rutas relativas de imágenes
  const clone = el.cloneNode(true)
  clone.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') || ''
    if (src.startsWith('/')) img.setAttribute('src', origin + src)
  })

  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',system-ui,sans-serif;color:#0f172a;padding:28px 36px;background:#fff}
    .inv-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
    .inv-brand{display:flex;align-items:center;gap:12px}
    .inv-logo{width:52px;height:52px;object-fit:contain}
    .inv-brand-name{font-size:22px;font-weight:900;color:#1d4ed8}
    .inv-brand-sub{font-size:11px;color:#94a3b8;margin-top:2px}
    .inv-meta{text-align:right}
    .inv-num{font-size:18px;font-weight:800;color:#0f172a}
    .inv-date,.inv-status{font-size:12px;color:#64748b;margin-top:3px}
    .inv-status-badge{display:inline-block;background:#dcfce7;color:#166534;font-weight:700;padding:2px 8px;border-radius:6px;font-size:11px}
    .inv-divider{height:1.5px;background:#e2e8f0;margin:20px 0}
    .inv-parties{display:flex;align-items:center;gap:16px;background:#f8fafc;border-radius:12px;padding:16px 20px}
    .inv-party{flex:1}
    .inv-party-title{font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
    .inv-party-name{font-size:15px;font-weight:700;color:#0f172a}
    .inv-party-sub{font-size:12px;color:#64748b;margin-top:2px}
    .inv-arrow{font-size:20px;color:#cbd5e1;flex-shrink:0}
    .inv-section-title{font-size:11px;font-weight:800;color:#2563eb;text-transform:uppercase;letter-spacing:.5px;margin:16px 0 10px}
    .inv-table{width:100%;border-collapse:collapse;font-size:13px}
    .inv-table th{padding:8px 10px;background:#f8fafc;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.4px;border-bottom:1.5px solid #e2e8f0;text-align:left}
    .inv-table td{padding:12px 10px;border-bottom:1px solid #f1f5f9;vertical-align:top}
    .text-right{text-align:right!important}
    .inv-svc-name{font-weight:700;color:#0f172a}
    .inv-svc-desc{font-size:12px;color:#64748b;margin-top:3px}
    .inv-amount{font-size:16px;font-weight:900;color:#2563eb}
    .inv-address{font-size:12px;color:#64748b;margin-top:10px}
    .inv-total-row{display:flex;justify-content:space-between;align-items:center;background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:12px;padding:14px 20px;margin-top:16px}
    .inv-total-label{font-size:14px;font-weight:700;color:#1d4ed8}
    .inv-total-value{font-size:22px;font-weight:900;color:#1d4ed8}
    .inv-footer{margin-top:24px;text-align:center;font-size:11px;color:#94a3b8;line-height:1.8}
  `

  const num = String(props.request.id).padStart(6, '0')
  const w = window.open('', '_blank', 'width=860,height=720')
  if (!w) {
    alert('Permite ventanas emergentes en este sitio para imprimir el comprobante.')
    return
  }

  w.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Comprobante #${num} — e-servide</title>
  <style>${css}</style>
</head>
<body>${clone.outerHTML}</body>
</html>`)
  w.document.close()
  w.focus()
  // Espera a que el logo cargue antes de imprimir
  setTimeout(() => { w.print(); w.close() }, 700)
}
</script>

<style scoped>
/* Overlay */
.inv-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 9990; padding: 16px;
}

.inv-modal {
  background: white; border-radius: 18px;
  width: 100%; max-width: 680px;
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 30px 80px rgba(0,0,0,.25);
  display: flex; flex-direction: column;
}

/* Barra de acciones */
.inv-actions {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1.5px solid #f1f5f9;
  flex-shrink: 0;
}

.inv-close {
  width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #e2e8f0;
  background: #f8fafc; cursor: pointer; font-size: 14px; color: #64748b;
  display: flex; align-items: center; justify-content: center;
}
.inv-close:hover { background: #f1f5f9; }

.inv-print {
  padding: 9px 20px; border-radius: 10px;
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: white; border: none; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity .15s, transform .15s;
}
.inv-print:hover { transform: translateY(-1px); opacity: .92; }

/* Cuerpo imprimible */
.inv-body {
  padding: 32px 36px;
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: #0f172a;
}

/* Cabecera */
.inv-header {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
}
.inv-brand {
  display: flex; align-items: center; gap: 12px;
}
.inv-logo { width: 52px; height: 52px; object-fit: contain; }
.inv-brand-name { font-size: 22px; font-weight: 900; color: #1d4ed8; }
.inv-brand-sub  { font-size: 11px; color: #94a3b8; }

.inv-meta { text-align: right; }
.inv-num  { font-size: 18px; font-weight: 800; color: #0f172a; }
.inv-date { font-size: 12px; color: #64748b; margin-top: 3px; }
.inv-status { font-size: 12px; color: #64748b; margin-top: 3px; }
.inv-status-badge {
  display: inline-block; background: #dcfce7; color: #166534;
  font-weight: 700; padding: 2px 8px; border-radius: 6px; font-size: 11px;
}

.inv-divider { height: 1.5px; background: #e2e8f0; margin: 20px 0; }

/* Partes */
.inv-parties {
  display: flex; align-items: center; gap: 16px;
  background: #f8fafc; border-radius: 12px; padding: 16px 20px;
}
.inv-party { flex: 1; }
.inv-party-title { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
.inv-party-name  { font-size: 15px; font-weight: 700; color: #0f172a; }
.inv-party-sub   { font-size: 12px; color: #64748b; margin-top: 2px; }
.inv-arrow { font-size: 20px; color: #cbd5e1; flex-shrink: 0; }

/* Tabla */
.inv-section-title {
  font-size: 11px; font-weight: 800; color: #2563eb;
  text-transform: uppercase; letter-spacing: .5px; margin-bottom: 10px;
}
.inv-table {
  width: 100%; border-collapse: collapse; font-size: 13px;
}
.inv-table th {
  padding: 8px 10px; background: #f8fafc; font-size: 10px; font-weight: 800;
  color: #94a3b8; text-transform: uppercase; letter-spacing: .4px; border-bottom: 1.5px solid #e2e8f0;
  text-align: left;
}
.inv-table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
.text-right { text-align: right !important; }
.inv-svc-name { font-weight: 700; color: #0f172a; }
.inv-svc-desc { font-size: 12px; color: #64748b; margin-top: 3px; }
.inv-amount   { font-size: 16px; font-weight: 900; color: #2563eb; }

.inv-address { font-size: 12px; color: #64748b; margin-top: 10px; }

/* Total */
.inv-total-row {
  display: flex; justify-content: space-between; align-items: center;
  background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px;
  padding: 14px 20px;
}
.inv-total-label { font-size: 14px; font-weight: 700; color: #1d4ed8; }
.inv-total-value { font-size: 22px; font-weight: 900; color: #1d4ed8; }

/* Pie */
.inv-footer {
  margin-top: 24px; text-align: center;
  font-size: 11px; color: #94a3b8; line-height: 1.8;
}

/* Transición */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>


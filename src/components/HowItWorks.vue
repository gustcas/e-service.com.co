<template>
  <section class="hiw-section">
    <div class="hiw-inner">

      <!-- How it works -->
      <div class="hiw-left">
        <h2 class="sec-title">¿Cómo funciona?</h2>
        <p class="sec-sub">En 3 simples pasos</p>
        <div class="steps-row">
          <div class="step-line"></div>
          <div v-for="s in steps" :key="s.title" class="step">
            <div class="step-icon">{{ s.icon }}</div>
            <h3 class="step-title">{{ s.title }}</h3>
            <p class="step-desc">{{ s.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Categories grid -->
      <div class="hiw-right">
        <div class="cats-header">
          <h2 class="sec-title">Explora por categorías</h2>
          <a href="#" class="see-all">Ver todas →</a>
        </div>
        <div class="cats-grid">
          <div v-for="c in categories" :key="c.label" class="cat-card">
            <div class="cat-ico">{{ c.icon }}</div>
            <span>{{ c.label }}</span>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
const steps = [
  { icon: '🔍', title: '1. Explora servicios', desc: 'Encuentra el servicio que necesitas entre miles de opciones.' },
  { icon: '👤', title: '2. Conecta', desc: 'Conecta con profesionales verificados y acuerda los detalles.' },
  { icon: '🛡️', title: '3. Paga seguro', desc: 'Realiza tu pago de forma segura y disfruta del servicio.' },
]
const categories = [
  { icon: '🏠', label: 'Hogar'      },
  { icon: '✂️', label: 'Belleza'   },
  { icon: '💻', label: 'Tecnología'},
  { icon: '🏋️', label: 'Fitness'  },
  { icon: '🐕', label: 'Mascotas'  },
  { icon: '🎓', label: 'Educación' },
  { icon: '⊞',  label: 'Más'       },
]
</script>

<style scoped>
.hiw-section { padding: 80px 32px; font-family: 'Plus Jakarta Sans', sans-serif; background: #fafbfc; }
.hiw-inner { max-width: 1400px; margin: 0 auto; display: flex; gap: 80px; flex-wrap: wrap; align-items: flex-start; }
.hiw-left { flex: 0 0 380px; min-width: 280px; }
.hiw-right { flex: 1; min-width: 280px; }

.sec-title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.sec-sub   { font-size: 13px; font-weight: 500; color: #94a3b8; margin: 0 0 40px; }

.steps-row { position: relative; display: flex; justify-content: space-between; gap: 12px; }
.step-line { position: absolute; top: 35px; left: 10%; right: 10%; height: 2px; border-top: 2px dashed #e2e8f0; z-index: 0; }
.step { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; z-index: 1; }
.step-icon {
  width: 70px; height: 70px; border-radius: 50%;
  background: white; border: 1px solid #f1f5f9;
  box-shadow: 0 8px 30px rgba(0,0,0,.07);
  display: flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 16px;
}
.step-title { font-size: 12px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
.step-desc  { font-size: 11px; color: #94a3b8; font-weight: 500; line-height: 1.6; margin: 0; }

.cats-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
.see-all { font-size: 13px; font-weight: 700; color: #22d3ee; text-decoration: none; }
.see-all:hover { text-decoration: underline; }

.cats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.cat-card {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 24px 12px; border-radius: 20px;
  background: white; border: 1.5px solid #f1f5f9;
  cursor: pointer; transition: box-shadow .2s, border-color .2s, transform .2s;
}
.cat-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.06); border-color: #dbeafe; transform: translateY(-2px); }
.cat-ico { font-size: 30px; }
.cat-card span { font-size: 12px; font-weight: 700; color: #334155; }

@media (max-width: 900px) { .hiw-inner { flex-direction: column; gap: 48px; } .hiw-left { flex: none; width: 100%; } .cats-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 480px) { .hiw-section { padding: 48px 20px; } .cats-grid { grid-template-columns: repeat(2, 1fr); } }
</style>

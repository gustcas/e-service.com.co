<template>
  <section id="services" class="section categories-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Categorías Populares</h2>
      </div>

      <div class="categories-grid">
        <div
          v-for="(category, index) in categories"
          :key="category.id"
          class="category-card"
        >
          <div class="card-shine"></div>

          <div class="category-icon-wrapper">
            <span
              class="category-icon"
              :style="{ color: PALETTE[index % PALETTE.length].icon }"
              v-html="getCategoryIcon(category.title)"
            />
          </div>

          <h3 class="category-title">{{ category.title }}</h3>

          <p class="category-description">
            {{ category.description }}
          </p>

          <div class="category-meta">
            <span class="meta-item">
              <span class="meta-icon">👥</span>
              {{ category.professionals }}+ pros
            </span>
            <span class="meta-divider">•</span>
            <span class="meta-item">
              <span class="meta-icon">⭐</span>
              {{ category.rating }}
            </span>
          </div>

          <button class="category-cta">
            Ver Servicios
            <span class="arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue"
import api from "@/services/api"

// ─── Colores por índice ───────────────────────────────────────────────────────
const PALETTE = [
  { icon: "#4F46E5" },
  { icon: "#EA580C" },
  { icon: "#059669" },
  { icon: "#D97706" },
  { icon: "#16A34A" },
  { icon: "#0284C7" },
]

// ─── Íconos SVG ───────────────────────────────────────────────────────────────
const ICONS = {
  bolt:     `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  wrench:   `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  leaf:     `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8C8 10 5.9 16.17 3.82 19.09M9.5 19.5c.68-2.24 2-4 4-5.5M17 8l3-5c0 0-9 1-12 7s1 11 1 11l1-2"/></svg>`,
  paint:    `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 13.5A10 10 0 0 0 12 22a10 10 0 0 0 7.39-3.24M12 2C6.48 2 2 6.48 2 12"/><path d="M14 8l-2 2-2-2 2-2 2 2z"/><circle cx="15.5" cy="12.5" r="1.5"/></svg>`,
  shield:   `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  truck:    `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  scissors: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`,
  home:     `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  code:     `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  heart:    `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  camera:   `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  default:  `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
}

// ─── Mapeo palabras clave → ícono ─────────────────────────────────────────────
const KEYWORD_MAP = [
  { keys: ["eléctric", "electr", "luz", "panel", "enchufe"],             icon: "bolt" },
  { keys: ["plomer", "agua", "tubería", "fontaner", "reparaci", "llave"], icon: "wrench" },
  { keys: ["jardin", "poda", "plantas", "césped", "paisaj"],              icon: "leaf" },
  { keys: ["pintura", "acabado", "revestimiento", "estucat"],             icon: "paint" },
  { keys: ["seguridad", "cámara", "alarma", "cerraje", "vigilanc"],       icon: "shield" },
  { keys: ["mudanza", "transporte", "flete", "carga", "traslado"],        icon: "truck" },
  { keys: ["belleza", "cabello", "estética", "corte", "manicura", "peluquer"], icon: "scissors" },
  { keys: ["hogar", "casa", "reforma", "manten"],                         icon: "home" },
  { keys: ["tecnología", "software", "web", "programaci", "comput"],      icon: "code" },
  { keys: ["salud", "médico", "masaje", "bienestar", "cuidad"],           icon: "heart" },
  { keys: ["fotograf", "evento", "video", "boda"],                        icon: "camera" },
]

function getCategoryIcon(name = "") {
  const lower = name.toLowerCase()
  for (const { keys, icon } of KEYWORD_MAP) {
    if (keys.some((k) => lower.includes(k))) return ICONS[icon]
  }
  return ICONS.default
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const categories = ref([])

const fetchCategories = async () => {
  try {
    const response = await api.get("/categories")
    categories.value = response.data.map((cat) => ({
      id: cat.id,
      title: cat.name,
      description: cat.description ?? "Servicios disponibles",
      professionals: 0,
      rating: 5,
    }))
  } catch (error) {
    console.error("Error cargando categorías", error)
  }
}

onMounted(() => fetchCategories())
</script>

<style scoped>

.container {
  max-width: 1200px;
  margin: auto;
  padding: 0 20px;
}

.categories-section {
  padding: 100px 0;
  background: #f8fafc;
}

/* HEADER */

.section-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 60px;
}

.section-title {
  font-size: 42px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 16px;
}

.section-description {
  font-size: 18px;
  color: #64748b;
  line-height: 1.6;
}

/* GRID */

.categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

/* CARD */

.category-card {
  background: white;
  border-radius: 24px;
  padding: 32px 26px;
  position: relative;
  overflow: hidden;
  transition: all 0.35s ease;
  border: 2px solid transparent;
  cursor: pointer;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.05);
}

.card-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.7),
    rgba(255, 255, 255, 0)
  );
  transform: translateX(-100%) rotate(45deg);
  transition: transform 0.6s;
}

.category-card:hover .card-shine {
  transform: translateX(100%) rotate(45deg);
}

.category-card:hover {
  transform: translateY(-10px);
  border-color: #e0e7ff;
  box-shadow: 0 20px 50px rgba(37, 99, 235, 0.15);
}

/* ICON */

.category-icon-wrapper {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
  transition: all 0.3s;
}

.category-card:hover .category-icon-wrapper {
  transform: scale(1.08) rotate(4deg);
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.3s;
}

.category-card:hover .category-icon {
  filter: brightness(0) invert(1);
}

/* TEXT */

.category-title {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 10px;
}

.category-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 18px;
}

/* META */

.category-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 22px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-divider {
  color: #cbd5e1;
}

/* BUTTON */

.category-cta {
  width: 100%;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #475569;
  border: none;
  padding: 13px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s;
}

.category-card:hover .category-cta {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white;
}

.arrow {
  font-size: 18px;
}

/* RESPONSIVE */

@media (max-width: 1024px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .categories-section {
    padding: 70px 0;
  }
  .section-title {
    font-size: 32px;
  }
  .section-description {
    font-size: 16px;
  }
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .category-card {
    padding: 26px 22px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 26px;
  }
  .category-icon-wrapper {
    width: 60px;
    height: 60px;
  }
}

</style>
<template>
  <section class="hero">
    <div class="hero-background">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <div class="container">
      <div class="hero-grid">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-icon">✨</span>
            Conecta con los mejores profesionales
          </div>

          <h1 class="hero-title">
            Encuentra el servicio
            <span class="gradient-text">perfecto</span>
            para ti
          </h1>

          <p class="hero-description">
            Miles de profesionales verificados listos para ayudarte. Contrata
            con confianza y seguridad en minutos.
          </p>

          <div class="search-box">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                placeholder="¿Qué servicio necesitas?"
                v-model="searchQuery"
              />
            </div>
            <button class="search-button">Buscar</button>
          </div>

          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">50K+</div>
              <div class="stat-label">Profesionales</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-number">200K+</div>
              <div class="stat-label">Completados</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-number">4.9★</div>
              <div class="stat-label">Calificación</div>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="visual-card card-1">
            <div class="card-icon">👨‍🔧</div>
            <div class="card-content">
              <div class="card-title">Plomería Express</div>
              <div class="card-rating">⭐ 4.9 (234 reviews)</div>
            </div>
          </div>

          <div class="visual-card card-2">
            <div class="card-icon">💡</div>
            <div class="card-content">
              <div class="card-title">Electricista Pro</div>
              <div class="card-rating">⭐ 5.0 (189 reviews)</div>
            </div>
          </div>

          <div class="visual-card card-3">
            <div class="card-icon">🎨</div>
            <div class="card-content">
              <div class="card-title">Diseño Creativo</div>
              <div class="card-rating">⭐ 4.8 (312 reviews)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const searchQuery = ref('');
</script>

<style scoped>
/* ─── Base ─────────────────────────────────────────────────────────── */
.hero {
  margin-top: 80px;
  padding: 100px 0 80px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #6366f1 100%);
}

.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

/* ─── Background blobs ──────────────────────────────────────────────── */
.hero-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.3);
  top: -150px;
  left: -100px;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: rgba(147, 51, 234, 0.4);
  bottom: -150px;
  right: -100px;
  animation-delay: -5s;
}

.blob-3 {
  width: 350px;
  height: 350px;
  background: rgba(59, 130, 246, 0.3);
  top: 50%;
  right: 20%;
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(30px, -50px) scale(1.1); }
  66%       { transform: translate(-20px, 30px) scale(0.9); }
}

/* ─── Grid ──────────────────────────────────────────────────────────── */
.hero-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}

/* ─── Badge ─────────────────────────────────────────────────────────── */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 10px 20px;
  border-radius: 50px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 30px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.badge-icon { font-size: 18px; }

/* ─── Title ─────────────────────────────────────────────────────────── */
.hero-title {
  font-size: 64px;
  font-weight: 900;
  line-height: 1.1;
  color: white;
  margin-bottom: 24px;
  letter-spacing: -1px;
}

.gradient-text {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

/* ─── Description ───────────────────────────────────────────────────── */
.hero-description {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  line-height: 1.6;
  max-width: 540px;
}

/* ─── Search ────────────────────────────────────────────────────────── */
.search-box {
  display: flex;
  background: white;
  border-radius: 20px;
  padding: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 650px;
  margin-bottom: 50px;
  box-sizing: border-box;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 8px;
  min-width: 0; /* evita desbordamiento en flex */
}

.search-icon {
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 16px 8px;
  color: #1e293b;
  width: 100%;
}

.search-box input::placeholder { color: #94a3b8; }

.search-button {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  border: none;
  color: white;
  padding: 18px 32px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(37, 99, 235, 0.5);
}

/* ─── Stats ─────────────────────────────────────────────────────────── */
.hero-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px 32px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 650px;
  box-sizing: border-box;
}

.stat-item { text-align: center; flex: 1; }

.stat-number {
  font-size: 28px;
  font-weight: 800;
  color: white;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

/* ─── Visual cards ──────────────────────────────────────────────────── */
.hero-visual {
  position: relative;
  height: 500px;
}

.visual-card {
  position: absolute;
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
  animation: cardFloat 6s infinite ease-in-out;
  box-sizing: border-box;
}

.visual-card:hover {
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
}

.card-1 { top: 50px;   left: 0;     width: 280px; }
.card-2 { top: 180px;  right: 20px; width: 260px; animation-delay: -2s; }
.card-3 { bottom: 80px; left: 40px; width: 270px; animation-delay: -4s; }

@keyframes cardFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-20px); }
}

.card-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 14px;
  flex-shrink: 0;
}

.card-content { flex: 1; min-width: 0; }

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-rating {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* ════════════════════════════════════════════════════════════════════
   RESPONSIVE BREAKPOINTS
   ════════════════════════════════════════════════════════════════════ */

/* ─── Tablet landscape (≤ 1200px) ──────────────────────────────────── */
@media (max-width: 1200px) {
  .hero-title { font-size: 52px; }

  .card-1 { width: 240px; }
  .card-2 { width: 220px; right: 0; }
  .card-3 { width: 230px; }
}

/* ─── Tablet portrait (≤ 1024px) ───────────────────────────────────── */
@media (max-width: 1024px) {
  .hero {
    padding: 80px 0 60px;
  }

  .hero-grid {
    grid-template-columns: 1fr;
    gap: 48px;
    text-align: center;
  }

  .hero-badge {
    /* centra el badge inline */
    display: inline-flex;
  }

  .hero-title { font-size: 48px; }

  .hero-description {
    margin-left: auto;
    margin-right: auto;
  }

  .search-box,
  .hero-stats {
    margin-left: auto;
    margin-right: auto;
  }

  /* Mostrar cards en row centrado en tablet */
  .hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    height: auto;
    flex-wrap: wrap;
  }

  .visual-card {
    position: static;
    width: calc(50% - 10px);
    max-width: 260px;
    animation: none;
  }

  /* Reanimar solo hover en tablet */
  .visual-card:hover {
    transform: translateY(-6px) scale(1.03);
  }

  .card-3 { display: none; } /* Ocultar tercera card para que queden 2 en row */
}

/* ─── Mobile large (≤ 768px) ────────────────────────────────────────── */
@media (max-width: 768px) {
  .hero {
    margin-top: 64px;
    padding: 60px 0 48px;
  }

  .container { padding: 0 16px; }

  .hero-badge {
    font-size: 12px;
    padding: 8px 16px;
    margin-bottom: 20px;
  }

  .hero-title {
    font-size: 36px;
    letter-spacing: -0.5px;
    margin-bottom: 16px;
  }

  .hero-description {
    font-size: 16px;
    margin-bottom: 28px;
  }

  /* Search compacto */
  .search-box {
    border-radius: 14px;
    padding: 6px;
    margin-bottom: 28px;
  }

  .search-icon { font-size: 16px; margin-right: 8px; }

  .search-box input {
    font-size: 14px;
    padding: 12px 4px;
  }

  .search-button {
    padding: 14px 20px;
    font-size: 14px;
    border-radius: 10px;
  }

  /* Stats compacto */
  .hero-stats {
    padding: 16px 20px;
    gap: 12px;
    border-radius: 14px;
  }

  .stat-number { font-size: 22px; }
  .stat-label  { font-size: 11px; }
  .stat-divider { height: 32px; }

  /* Cards en mobile: una fila scrollable */
  .hero-visual {
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    justify-content: flex-start;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 8px;
    gap: 12px;
  }

  .hero-visual::-webkit-scrollbar { display: none; }

  .visual-card {
    min-width: 200px;
    width: 200px;
    padding: 14px;
    border-radius: 14px;
    gap: 12px;
  }

  .card-3 { display: flex; } /* Volver a mostrar la tercera card en mobile scroll */

  .card-icon {
    width: 44px;
    height: 44px;
    font-size: 24px;
    border-radius: 10px;
  }

  .card-title  { font-size: 13px; }
  .card-rating { font-size: 12px; }
}

/* ─── Mobile small (≤ 480px) ────────────────────────────────────────── */
@media (max-width: 480px) {
  .hero-title { font-size: 30px; }

  .hero-badge {
    font-size: 11px;
    padding: 7px 13px;
  }

  .search-button {
    padding: 12px 14px;
    font-size: 13px;
  }

  .hero-stats {
    gap: 8px;
    padding: 14px 16px;
  }

  .stat-number { font-size: 20px; }

  .visual-card { min-width: 180px; width: 180px; }
}
</style>
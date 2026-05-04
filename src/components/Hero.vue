<template>
  <section class="hero">
    <div class="hero-blob"></div>
    <div class="hero-inner">

      <!-- LEFT -->
      <div class="hero-left">
        <div class="hero-badge">
          <span class="badge-star">★</span> LA PLATAFORMA #1 DE SERVICIOS
        </div>

        <h1 class="hero-title">
          Encuentra y ofrece<br />
          servicios <span class="gradient-text">en segundos</span>
        </h1>

        <p class="hero-desc">
          Conecta con profesionales increíbles, encuentra lo que necesitas o
          ofrece tus servicios y haz crecer tu negocio.
        </p>

        <div class="hero-btns">
          <a href="/login?register=true" class="btn-primary">
            🔍 Buscar servicios
          </a>
          <a href="/login?register=true" class="btn-secondary">
            Ofrecer servicios →
          </a>
        </div>

        <div class="hero-social">
          <div class="avatar-stack">
            <img src="https://i.pravatar.cc/100?img=33" alt="" />
            <img src="https://i.pravatar.cc/100?img=47" alt="" />
            <img src="https://i.pravatar.cc/100?img=12" alt="" />
            <img src="https://i.pravatar.cc/100?img=44" alt="" />
          </div>
          <div class="social-text">
            <strong>10K+</strong>
            <span>Usuarios activos</span>
            <div class="stars">★★★★★</div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Phone mockup -->
      <div class="hero-right">

        <!-- Floating card: secure payment -->
        <div class="float-card float-left">
          <div class="fc-icon blue">🛡️</div>
          <div class="fc-text">
            <strong>Pago 100%</strong>
            <span>seguro</span>
          </div>
        </div>

        <!-- Floating card: support -->
        <div class="float-card float-right">
          <div class="fc-icon">🎧</div>
          <div class="fc-text">
            <strong>Soporte 24/7</strong>
            <span>Siempre estamos<br/>contigo</span>
          </div>
        </div>

        <!-- Phone frame -->
        <div class="phone-frame">
          <div class="phone-notch"></div>

          <div class="phone-screen">
            <!-- App header -->
            <div class="app-header">
              <div class="app-logo">🏠 <b>e-service</b></div>
              <div class="app-avatar">👤<span class="notif-dot"></span></div>
            </div>

            <div class="app-greeting">
              <h2>Hola, Daniela 👋</h2>
              <p>¿Qué servicio necesitas hoy?</p>
            </div>

            <!-- Search -->
            <div class="app-search">
              <span class="s-icon">🔍</span>
              <input type="text" placeholder="Buscar servicios..." readonly />
              <div class="s-btn">🔍</div>
            </div>

            <!-- Categories -->
            <div class="app-cats">
              <div class="cats-title">
                <span>Categorías populares</span>
                <span class="see-all">Ver todas →</span>
              </div>
              <div class="cat-grid">
                <div v-for="c in cats" :key="c.label" class="cat-item">
                  <div :class="['cat-icon', c.color]">{{ c.icon }}</div>
                  <span>{{ c.label }}</span>
                </div>
              </div>
            </div>

            <!-- Services -->
            <div class="app-services">
              <div class="cats-title"><span>Servicios destacados</span></div>
              <div v-for="s in services" :key="s.name" class="svc-card">
                <img :src="s.img" :alt="s.name" />
                <div class="svc-info">
                  <strong>{{ s.name }}</strong>
                  <span>Desde {{ s.price }}</span>
                  <div class="svc-stars">★★★★★ <em>{{ s.rating }}</em></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
const cats = [
  { icon: '🏠', label: 'Hogar',      color: 'c-blue'    },
  { icon: '✂️', label: 'Belleza',    color: 'c-pink'    },
  { icon: '💻', label: 'Tecnología', color: 'c-cyan'    },
  { icon: '🏋️', label: 'Fitness',   color: 'c-purple'  },
  { icon: '🐕', label: 'Mascotas',   color: 'c-green'   },
  { icon: '⊞',  label: 'Más',        color: 'c-gray'    },
]
const services = [
  { name: 'Limpieza a domicilio', price: '$50.000', rating: '4.9 (120)', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100&h=100&fit=crop' },
  { name: 'Entrenador personal',  price: '$80.000', rating: '4.8 (85)',  img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100&h=100&fit=crop' },
]
</script>

<style scoped>
.hero {
  position: relative; overflow: hidden;
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #fafbfc;
  padding: 60px 32px 100px;
}
.hero-blob {
  position: absolute; top: -200px; right: -200px;
  width: 800px; height: 800px; border-radius: 50%;
  background: radial-gradient(ellipse, rgba(167,139,250,.25) 0%, rgba(103,232,249,.2) 50%, transparent 70%);
  filter: blur(60px); pointer-events: none; z-index: 0;
}
.hero-inner {
  position: relative; z-index: 1;
  max-width: 1400px; margin: 0 auto;
  display: flex; align-items: center; gap: 60px; flex-wrap: wrap;
}

/* LEFT */
.hero-left { flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 28px; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 18px; border-radius: 100px;
  background: #eff6ff; border: 1px solid #dbeafe;
  font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: .08em;
  width: fit-content;
}
.badge-star { color: #3b82f6; font-size: 14px; }
.hero-title {
  font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 800;
  line-height: 1.08; color: #0f172a; margin: 0;
}
.gradient-text {
  background: linear-gradient(135deg, #22d3ee, #a855f7);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-desc { font-size: 17px; font-weight: 500; color: #64748b; line-height: 1.7; margin: 0; max-width: 500px; }

.hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 15px 32px; border-radius: 100px;
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  color: #fff; font-weight: 700; font-size: 14px;
  text-decoration: none; box-shadow: 0 8px 24px rgba(59,130,246,.3);
  transition: transform .2s, box-shadow .2s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(59,130,246,.4); }
.btn-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 15px 32px; border-radius: 100px;
  background: white; border: 1.5px solid #e2e8f0;
  color: #334155; font-weight: 700; font-size: 14px;
  text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,.06);
  transition: border-color .2s, box-shadow .2s;
}
.btn-secondary:hover { border-color: #cbd5e1; box-shadow: 0 4px 14px rgba(0,0,0,.1); }

.hero-social { display: flex; align-items: center; gap: 16px; }
.avatar-stack { display: flex; }
.avatar-stack img {
  width: 42px; height: 42px; border-radius: 50%;
  border: 2.5px solid white; margin-left: -10px; object-fit: cover;
}
.avatar-stack img:first-child { margin-left: 0; }
.social-text { display: flex; flex-direction: column; gap: 1px; }
.social-text strong { font-size: 15px; font-weight: 800; color: #0f172a; }
.social-text span { font-size: 11px; font-weight: 600; color: #94a3b8; }
.stars { color: #facc15; font-size: 12px; }

/* RIGHT */
.hero-right {
  flex: 1; min-width: 280px;
  display: flex; justify-content: center; align-items: center;
  position: relative; padding: 40px 20px;
}

.float-card {
  position: absolute; z-index: 20;
  background: white; border-radius: 18px;
  padding: 14px 18px; display: flex; align-items: center; gap: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,.1);
  border: 1px solid rgba(255,255,255,.6);
}
.float-left { top: 18%; left: -10px; flex-direction: column; align-items: center; text-align: center; width: 110px; }
.float-right { bottom: 22%; right: -10px; }
.fc-icon { font-size: 24px; }
.fc-icon.blue { background: #eff6ff; border-radius: 10px; padding: 8px; font-size: 22px; }
.fc-text { display: flex; flex-direction: column; gap: 1px; }
.fc-text strong { font-size: 12px; font-weight: 700; color: #0f172a; }
.fc-text span { font-size: 10px; color: #94a3b8; font-weight: 500; }

/* Phone */
.phone-frame {
  width: 280px; height: 580px;
  background: white; border-radius: 40px;
  border: 9px solid #f1f5f9;
  box-shadow: 0 30px 80px rgba(0,0,0,.18);
  overflow: hidden; position: relative; z-index: 10;
  transform: rotate(-2deg); display: flex; flex-direction: column;
}
.phone-notch {
  width: 80px; height: 18px; background: #0f172a;
  border-radius: 0 0 16px 16px; margin: 0 auto 4px;
}
.phone-screen {
  flex: 1; overflow: hidden;
  padding: 8px 14px 14px; display: flex; flex-direction: column; gap: 12px;
}
.app-header { display: flex; justify-content: space-between; align-items: center; }
.app-logo { font-size: 13px; font-weight: 800; color: #2563eb; display: flex; align-items: center; gap: 4px; }
.app-avatar { position: relative; font-size: 18px; }
.notif-dot {
  position: absolute; top: 0; right: 0;
  width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 1.5px solid white;
}
.app-greeting h2 { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 2px; }
.app-greeting p { font-size: 11px; color: #94a3b8; margin: 0; font-weight: 500; }

.app-search {
  display: flex; align-items: center; gap: 6px;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px;
  padding: 8px 10px;
}
.s-icon { font-size: 13px; flex-shrink: 0; }
.app-search input {
  flex: 1; border: none; background: transparent; font-size: 11px;
  font-weight: 500; color: #64748b; outline: none; font-family: inherit;
}
.s-btn {
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  border-radius: 9px; padding: 5px 7px; font-size: 11px; cursor: pointer;
}

.cats-title { display: flex; justify-content: space-between; margin-bottom: 6px; }
.cats-title span { font-size: 11px; font-weight: 700; color: #0f172a; }
.see-all { color: #3b82f6; font-weight: 700; font-size: 10px; cursor: pointer; }
.cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.cat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; }
.cat-icon {
  width: 34px; height: 34px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; font-size: 15px;
}
.c-blue   { background: #eff6ff; }
.c-pink   { background: #fdf2f8; }
.c-cyan   { background: #ecfeff; }
.c-purple { background: #f5f3ff; }
.c-green  { background: #f0fdf4; }
.c-gray   { background: #f8fafc; }
.cat-item span { font-size: 9px; font-weight: 700; color: #475569; }

.svc-card {
  display: flex; align-items: center; gap: 10px;
  padding: 8px; border: 1px solid #f1f5f9; border-radius: 14px;
  background: white; box-shadow: 0 1px 6px rgba(0,0,0,.05); margin-bottom: 6px;
}
.svc-card img { width: 44px; height: 44px; border-radius: 10px; object-fit: cover; }
.svc-info { display: flex; flex-direction: column; gap: 2px; }
.svc-info strong { font-size: 11px; font-weight: 700; color: #0f172a; }
.svc-info span { font-size: 10px; color: #94a3b8; font-weight: 500; }
.svc-stars { font-size: 9px; color: #facc15; }
.svc-stars em { color: #94a3b8; font-style: normal; }

@media (max-width: 768px) {
  .hero { padding: 40px 20px 60px; }
  .hero-inner { flex-direction: column; }
  .hero-right { width: 100%; }
  .float-left { display: none; }
  .float-right { display: none; }
}
</style>

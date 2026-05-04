<template>
  <nav class="navbar">
    <div class="nav-inner">
      <!-- Logo -->
      <a href="/" class="logo">
        <img src="/images/logo-services-sin-fondo.png" alt="e-service" class="logo-img" />
      </a>

      <!-- Links desktop -->
      <div class="nav-links">
        <a href="#" class="nav-link active">Inicio</a>
        <a href="#services" class="nav-link">Explorar servicios</a>
        <a href="#how" class="nav-link">Cómo funciona</a>
        <a href="#pricing" class="nav-link">Precios</a>
        <a href="#contact" class="nav-link">Contacto</a>
      </div>

      <!-- Actions -->
      <div class="nav-actions">
        <a href="/login" class="btn-login">Iniciar sesión</a>
        <a href="/login?register=true" class="btn-register">Regístrate</a>
      </div>

      <!-- Hamburger -->
      <button class="hamburger" @click="open = !open" :aria-expanded="open">
        <span :class="['bar', { open }]"></span>
        <span :class="['bar', { open }]"></span>
        <span :class="['bar', { open }]"></span>
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide">
      <div v-if="open" class="mobile-menu">
        <a href="#" class="mob-link" @click="open=false">Inicio</a>
        <a href="#services" class="mob-link" @click="open=false">Explorar servicios</a>
        <a href="#how" class="mob-link" @click="open=false">Cómo funciona</a>
        <a href="#pricing" class="mob-link" @click="open=false">Precios</a>
        <a href="#contact" class="mob-link" @click="open=false">Contacto</a>
        <div class="mob-actions">
          <a href="/login" class="btn-login">Iniciar sesión</a>
          <a href="/login?register=true" class="btn-register">Regístrate</a>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
const open = ref(false)
</script>

<style scoped>
.navbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #f1f5f9;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.nav-inner {
  max-width: 1400px; margin: 0 auto;
  padding: 0 32px;
  height: 72px;
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
}
.logo { display: flex; align-items: center; text-decoration: none; flex-shrink: 0; }
.logo-img { height: 52px; width: auto; }

.nav-links { display: flex; align-items: center; gap: 32px; }
.nav-link {
  text-decoration: none; font-size: 14px; font-weight: 600; color: #64748b;
  transition: color .2s; white-space: nowrap;
}
.nav-link:hover, .nav-link.active { color: #2563eb; }
.nav-link.active { border-bottom: 2px solid #2563eb; padding-bottom: 2px; }

.nav-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.btn-login {
  font-size: 14px; font-weight: 600; color: #475569;
  text-decoration: none; padding: 8px 16px; border-radius: 10px;
  transition: color .2s;
}
.btn-login:hover { color: #2563eb; }
.btn-register {
  font-size: 14px; font-weight: 700; color: #fff;
  text-decoration: none; padding: 10px 22px; border-radius: 100px;
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  box-shadow: 0 4px 14px rgba(59,130,246,.35);
  transition: box-shadow .2s, transform .2s;
  white-space: nowrap;
}
.btn-register:hover { box-shadow: 0 6px 20px rgba(59,130,246,.45); transform: translateY(-1px); }

.hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
.bar { display: block; width: 24px; height: 2px; background: #334155; border-radius: 2px; transition: all .3s; }
.bar.open:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.bar.open:nth-child(2) { opacity: 0; }
.bar.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.mobile-menu {
  border-top: 1px solid #f1f5f9;
  padding: 16px 32px 24px;
  display: flex; flex-direction: column; gap: 4px;
  background: rgba(255,255,255,.98);
}
.mob-link {
  font-size: 15px; font-weight: 600; color: #475569;
  text-decoration: none; padding: 12px 8px;
  border-bottom: 1px solid #f8fafc; transition: color .2s;
}
.mob-link:hover { color: #2563eb; }
.mob-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
.mob-actions .btn-login, .mob-actions .btn-register { text-align: center; display: block; }

.slide-enter-active, .slide-leave-active { transition: opacity .25s, transform .25s; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 900px) { .nav-links { display: none; } }
@media (max-width: 640px) { .nav-actions { display: none; } .hamburger { display: flex; } }
</style>

<template>
  <nav class="navbar">
    <div class="navbar-background"></div>
    <div class="container">
      <div class="navbar-content">
        <a href="/" class="logo">
          <img src="/images/logo-services-sin-fondo.png" alt="logo" class="logo-img" />
        </a>
        <div class="nav-links">
          <a href="#services">Servicios</a>
          <a href="#professionals">Profesionales</a>
          <a href="#about">Nosotros</a>
          <a href="#contact">Contacto</a>
        </div>
        <div class="nav-actions">
          <a href="/login" class="nav-login">Iniciar Sesión</a>
          <a href="/login?register=true" class="nav-cta">Registrarse</a>
        </div>

        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <span class="menu-icon">{{ mobileMenuOpen ? '✕' : '☰' }}</span>
        </button>
      </div>

      <!-- Mobile Menu -->
      <transition name="slide-down">
        <div v-if="mobileMenuOpen" class="mobile-menu">
          <a href="#services" @click="closeMobileMenu">Servicios</a>
          <a href="#professionals" @click="closeMobileMenu">Profesionales</a>
          <a href="#about" @click="closeMobileMenu">Nosotros</a>
          <a href="#contact" @click="closeMobileMenu">Contacto</a>
          <div class="mobile-menu-actions">
            <a href="/login" class="mobile-login">Iniciar Sesión</a>
            <a href="/login?register=true" class="mobile-register">Registrarse</a>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';

const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};
</script>

<style scoped>
.navbar {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0;
}

.navbar-background {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(20px) saturate(180%);
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: -1;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  max-width: 100%;
}


.logo-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 8px rgba(37, 99, 235, 0.3));
}

@media (max-width: 768px) {
  .logo-img {
    height: 30px;
  }
}

.nav-links {
  display: flex;
  gap: 36px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #475569;
  font-weight: 600;
  font-size: 15px;
  position: relative;
  transition: color 0.3s;
  white-space: nowrap;
}

.nav-links a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  transition: width 0.3s;
  border-radius: 2px;
}

.nav-links a:hover {
  color: #2563eb;
}

.nav-links a:hover::after {
  width: 100%;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-login {
  padding: 10px 22px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  color: #475569;
  text-decoration: none;
  transition: all 0.3s;
  background: transparent;
  border: 2px solid transparent;
}

.nav-login:hover {
  color: #2563eb;
  background: #eff6ff;
  border-color: #dbeafe;
}

.nav-cta {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white;
  border: none;
  padding: 11px 26px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  white-space: nowrap;
  flex-shrink: 0;
  display: inline-block;
}

.nav-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  width: 44px;
  height: 44px;
  border: none;
  background: #f8fafc;
  border-radius: 10px;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
  align-items: center;
  justify-content: center;
}

.mobile-menu-btn:hover {
  background: #f1f5f9;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  flex-direction: column;
  padding: 20px 0;
  gap: 12px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-top: 1px solid #e2e8f0;
  margin-top: 18px;
}

.mobile-menu a {
  padding: 12px 0;
  color: #475569;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.3s;
  border-left: 3px solid transparent;
  padding-left: 16px;
}

.mobile-menu a:hover {
  color: #2563eb;
  border-left-color: #2563eb;
  background: #f8fafc;
}

.mobile-menu-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.mobile-login {
  padding: 12px 24px !important;
  border: 2px solid #2563eb !important;
  border-radius: 10px;
  text-align: center;
  color: #2563eb !important;
  font-weight: 700 !important;
}

.mobile-register {
  padding: 12px 24px !important;
  background: linear-gradient(135deg, #2563eb, #4f46e5) !important;
  border-radius: 10px;
  text-align: center;
  color: white !important;
  font-weight: 700 !important;
}

/* Slide Down Animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.logo-img {
  height: 100px;
  width: auto;
  object-fit: contain;
  display: block;
  /* Si la imagen tiene fondo claro y el navbar es blanco, esto la resalta */
  filter: drop-shadow(0 2px 8px rgba(37, 99, 235, 0.15));
}

@media (max-width: 768px) {
  .logo-img {
    height: 100px;
  }
}

@media (max-width: 1024px) {
  .nav-links {
    gap: 24px;
  }

  .nav-links a {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .navbar-content {
    padding: 16px 0;
  }

  .logo-icon {
    font-size: 24px;
  }

  .nav-links,
  .nav-actions {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .mobile-menu {
    display: flex;
  }
}
</style>

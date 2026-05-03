<template>
  <div class="login-page">
    <div class="login-background">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
      <div class="bg-grid"></div>
    </div>

    <div class="login-container">
      <!-- Logo Header -->
      <div class="login-header">
        <div class="logo-wrap">
          <img src="/images/logo-services-sin-fondo.png" alt="e-service" class="logo-img" />
        </div>
        <p class="tagline">Profesionales a tu alcance</p>
      </div>

      <!-- Login Card -->
      <div class="login-card">
        <div class="card-top-bar"></div>

        <!-- Tabs Login / Registro -->
        <div class="auth-tabs">
          <button
            type="button"
            :class="['auth-tab', { active: isLogin }]"
            @click="isLogin = true"
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            :class="['auth-tab', { active: !isLogin }]"
            @click="isLogin = false"
          >
            Crear cuenta
          </button>
        </div>

        <p class="login-subtitle">
          {{
            isLogin
              ? 'Ingresa tus credenciales para continuar'
              : 'Únete a nuestra comunidad de profesionales'
          }}
        </p>

        <!-- Role Selection (only for register) -->
        <div v-if="!isLogin" class="role-selector">
          <div
            v-for="role in roles"
            :key="role.value"
            @click="selectedRole = role.value"
            :class="['role-option', { active: selectedRole === role.value }]"
          >
            <div class="role-icon-circle">{{ role.icon }}</div>
            <div class="role-info">
              <div class="role-name">{{ role.name }}</div>
              <div class="role-desc">{{ role.desc }}</div>
            </div>
            <div class="role-check">
              <span v-if="selectedRole === role.value">✓</span>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="login-form">
          <div v-if="!isLogin" class="form-group">
            <label class="form-label">Nombre completo</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input
                type="text"
                v-model="formData.name"
                placeholder="Juan Pérez"
                class="form-input"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Correo electrónico</label>
            <div class="input-wrapper">
              <span class="input-icon">✉️</span>
              <input
                type="email"
                v-model="formData.email"
                placeholder="tu@email.com"
                class="form-input"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="formData.password"
                placeholder="••••••••"
                class="form-input"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="toggle-password"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>

          <div v-if="isLogin" class="form-extras">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" />
              <span>Recordarme</span>
            </label>
            <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
          </div>

          <div v-if="errorMessage" class="error-message">
            ⚠️ {{ errorMessage }}
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span>{{ isLoading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta') }}</span>
            <span class="btn-arrow">{{ isLoading ? '⏳' : '→' }}</span>
          </button>
        </form>

        <!-- Social Login -->
        <div class="social-divider">
          <span>O continúa con</span>
        </div>

        <div class="social-buttons">
          <button class="social-btn">
            <svg viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>
        </div>

        <!-- Toggle Login/Register -->
        <div class="toggle-mode">
          <span v-if="isLogin">
            ¿No tienes cuenta?
            <a @click="isLogin = false" class="toggle-link">Regístrate</a>
          </span>
          <span v-else>
            ¿Ya tienes cuenta?
            <a @click="isLogin = true" class="toggle-link">Inicia sesión</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const isLogin = ref(true);
const showPassword = ref(false);
const rememberMe = ref(false);
const selectedRole = ref('client');
const isLoading = ref(false);
const errorMessage = ref('');

const formData = ref({
  name: '',
  email: '',
  password: '',
});

const roles = [
  {
    value: 'client',
    name: 'Cliente',
    icon: '👤',
    desc: 'Busco contratar servicios',
  },
  {
    value: 'professional',
    name: 'Profesional',
    icon: '💼',
    desc: 'Ofrezco mis servicios',
  },
];

const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    let result;

    if (isLogin.value) {
      result = await authStore.login(
        formData.value.email,
        formData.value.password,
        selectedRole.value
      );
    } else {
      result = await authStore.register(
        formData.value.name,
        formData.value.email,
        formData.value.password,
        selectedRole.value
      );
    }

    if (!result.success) {
      errorMessage.value = result.error;
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* ===================================================
   PALETA EXTRAÍDA DEL LOGO e-service
   Cian:    #7ec8f5
   Violeta: #c084f5
   Rosa:    #f472b6
   Fondo:   #0d1b2e → #0f2645 → #1a1040
=================================================== */

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
  font-family: 'Outfit', -apple-system, sans-serif;
}

/* === FONDO === */
.login-background {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #0d1b2e 0%, #0f2645 50%, #1a1040 100%);
  z-index: 0;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(140px);
  opacity: 0.35;
  animation: orbFloat 22s infinite ease-in-out;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: #7ec8f5;
  top: -200px;
  right: -100px;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: #c084f5;
  bottom: -150px;
  left: -100px;
  animation-delay: -9s;
}

.orb-3 {
  width: 420px;
  height: 420px;
  background: #f472b6;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -4s;
}

@keyframes orbFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(70px, -90px) scale(1.08);
  }
  66% {
    transform: translate(-55px, 75px) scale(0.93);
  }
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(126, 200, 245, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(126, 200, 245, 0.04) 1px, transparent 1px);
  background-size: 55px 55px;
}

/* === CONTAINER === */
.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 470px;
}

/* === HEADER / LOGO === */
.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-wrap {
  display: inline-block;
  margin-bottom: 14px;
}

.logo-img {
  width: 200px;
  height: auto;
  filter: drop-shadow(0 6px 28px rgba(126, 200, 245, 0.55));
}

.tagline {
  color: rgba(126, 200, 245, 0.75);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

/* === CARD === */
.login-card {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(40px) saturate(170%);
  border: 1px solid rgba(126, 200, 245, 0.18);
  border-radius: 28px;
  padding: 44px 40px;
  position: relative;
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: border-color 0.3s;
}

.login-card:hover {
  border-color: rgba(126, 200, 245, 0.32);
}

/* Barra decorativa superior con gradiente del logo */
.card-top-bar {
  position: absolute;
  top: 0;
  left: 24px;
  right: 24px;
  height: 3px;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(90deg, #f472b6, #c084f5, #7ec8f5);
  opacity: 0.9;
}

/* === TABS === */
.auth-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 4px;
  gap: 4px;
  margin-bottom: 24px;
}

.auth-tab {
  flex: 1;
  padding: 11px;
  border: none;
  border-radius: 11px;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
}

.auth-tab.active {
  background: linear-gradient(135deg, #7ec8f5, #c084f5);
  color: #fff;
  box-shadow: 0 4px 18px rgba(126, 200, 245, 0.35);
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin-bottom: 28px;
  line-height: 1.5;
}

/* === ROLE SELECTOR === */
.role-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 26px;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s;
}

.role-option:hover {
  background: rgba(255, 255, 255, 0.09);
}

.role-option.active {
  background: rgba(126, 200, 245, 0.12);
  border-color: #7ec8f5;
  box-shadow: 0 0 18px rgba(126, 200, 245, 0.2);
}

.role-icon-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7ec8f5, #c084f5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.role-info {
  flex: 1;
}

.role-name {
  color: white;
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 2px;
}

.role-desc {
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
}

.role-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7ec8f5, #c084f5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: 800;
  opacity: 0;
  transition: opacity 0.25s;
}

.role-option.active .role-check {
  opacity: 1;
}

/* === FORM === */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form-label {
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  font-weight: 600;
  padding-left: 3px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  font-size: 17px;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 15px 18px 15px 50px;
  background: rgba(255, 255, 255, 0.07);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  color: white;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.25s;
  outline: none;
  font-family: inherit;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.28);
}

.form-input:focus {
  background: rgba(126, 200, 245, 0.1);
  border-color: #7ec8f5;
  box-shadow: 0 0 0 3px rgba(126, 200, 245, 0.15);
}

.toggle-password {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 17px;
  padding: 4px;
  opacity: 0.55;
  transition: opacity 0.2s;
}

.toggle-password:hover {
  opacity: 1;
}

.form-extras {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -6px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  cursor: pointer;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #7ec8f5;
}

.forgot-link {
  color: #7ec8f5;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.25s;
}

.forgot-link:hover {
  color: #c084f5;
}

/* === ERROR === */
.error-message {
  background: rgba(244, 114, 182, 0.12);
  border: 1px solid rgba(244, 114, 182, 0.35);
  color: #fca5c0;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

/* === SUBMIT BTN === */
.submit-btn {
  width: 100%;
  padding: 17px 32px;
  background: linear-gradient(135deg, #7ec8f5 0%, #c084f5 55%, #f472b6 100%);
  border: none;
  border-radius: 13px;
  color: white;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.25s;
  box-shadow: 0 8px 28px rgba(126, 200, 245, 0.35);
  margin-top: 6px;
  font-family: inherit;
  letter-spacing: 0.2px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 38px rgba(126, 200, 245, 0.45);
  filter: brightness(1.08);
}

.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  filter: none;
}

.btn-arrow {
  font-size: 18px;
  transition: transform 0.25s;
}

.submit-btn:hover .btn-arrow {
  transform: translateX(4px);
}

/* === DIVIDER === */
.social-divider {
  position: relative;
  text-align: center;
  margin: 30px 0 22px;
}

.social-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.social-divider span {
  position: relative;
  background: rgba(126, 200, 245, 0.08);
  padding: 7px 20px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border-radius: 20px;
}

/* === SOCIAL BUTTONS === */
.social-buttons {
  display: grid;
  gap: 12px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.07);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 13px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 0.11);
  border-color: rgba(126, 200, 245, 0.3);
  transform: translateY(-2px);
}

.social-btn svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* === TOGGLE MODE === */
.toggle-mode {
  text-align: center;
  margin-top: 26px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 13px;
}

.toggle-link {
  background: linear-gradient(90deg, #7ec8f5, #c084f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
}

.toggle-link:hover {
  text-decoration: underline;
}

/* === RESPONSIVE === */
@media (max-width: 520px) {
  .login-card {
    padding: 36px 24px;
  }

  .logo-img {
    width: 165px;
  }

  .auth-tab {
    font-size: 13px;
    padding: 10px 8px;
  }
}

@media (max-width: 380px) {
  .login-card {
    padding: 30px 18px;
  }

  .logo-img {
    width: 140px;
  }
}
</style>
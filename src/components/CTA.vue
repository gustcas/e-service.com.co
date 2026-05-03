<template>
  <section class="cta-section">
    <div class="cta-background">
      <div class="cta-blob cta-blob-1"></div>
      <div class="cta-blob cta-blob-2"></div>
      <div class="cta-grid-pattern"></div>
    </div>

    <div class="container">
      <div class="cta-content">
        <div class="cta-icon">
          <span>🚀</span>
        </div>

        <h2 class="cta-title">
          ¿Listo para encontrar tu
          <span class="highlight">profesional ideal?</span>
        </h2>

        <p class="cta-description">
          Únete a miles de clientes satisfechos que ya encontraron los mejores
          servicios profesionales. Es gratis, rápido y seguro.
        </p>

        <div class="cta-features">
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>Profesionales verificados</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>Pago 100% seguro</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>Soporte 24/7</span>
          </div>
        </div>

        <div class="cta-buttons">
          <button class="cta-btn cta-btn-primary">
            <span>Comenzar Ahora</span>
            <span class="btn-arrow">→</span>
          </button>
          <button class="cta-btn cta-btn-secondary">
            <span class="btn-icon">▶</span>
            <span>Ver Cómo Funciona</span>
          </button>
        </div>

        <div class="cta-social-proof">
          <div class="social-avatars">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=User1"
              alt="User"
            />
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=User2"
              alt="User"
            />
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=User3"
              alt="User"
            />
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=User4"
              alt="User"
            />
            <div class="avatar-plus">+5K</div>
          </div>
          <p class="social-text">
            <strong>Más de 5,000 clientes</strong> han contratado esta semana
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup></script>

<style scoped>
.cta-section {
  padding: 120px 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  position: relative;
  overflow: hidden;
}

.cta-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.cta-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  animation: ctaFloat 25s infinite ease-in-out;
}

.cta-blob-1 {
  width: 600px;
  height: 600px;
  background: #3b82f6;
  top: -200px;
  left: -150px;
}

.cta-blob-2 {
  width: 500px;
  height: 500px;
  background: #8b5cf6;
  bottom: -150px;
  right: -100px;
  animation-delay: -10s;
}

@keyframes ctaFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(50px, -80px) scale(1.1);
  }
  66% {
    transform: translate(-30px, 50px) scale(0.9);
  }
}

.cta-grid-pattern {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.5;
}

.cta-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.cta-icon {
  width: 90px;
  height: 90px;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.2),
    rgba(139, 92, 246, 0.2)
  );
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin-bottom: 30px;
  animation: iconBounce 3s infinite ease-in-out;
}

@keyframes iconBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.cta-title {
  font-size: 52px;
  font-weight: 900;
  color: white;
  line-height: 1.2;
  margin-bottom: 24px;
  letter-spacing: -1px;
}

.highlight {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.cta-description {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 650px;
  margin-left: auto;
  margin-right: auto;
}

.cta-features {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.feature-icon {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.cta-btn {
  border: none;
  padding: 18px 36px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 17px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.cta-btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 10px 40px rgba(59, 130, 246, 0.4);
}

.cta-btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 50px rgba(59, 130, 246, 0.5);
}

.btn-arrow {
  font-size: 20px;
  transition: transform 0.3s;
}

.cta-btn-primary:hover .btn-arrow {
  transform: translateX(5px);
}

.cta-btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.cta-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
}

.btn-icon {
  font-size: 14px;
}

.cta-social-proof {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.social-avatars {
  display: flex;
  align-items: center;
}

.social-avatars img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid #1e293b;
  margin-left: -12px;
  transition: transform 0.3s;
}

.social-avatars img:first-child {
  margin-left: 0;
}

.social-avatars img:hover {
  transform: scale(1.1);
  z-index: 10;
}

.avatar-plus {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: 3px solid #1e293b;
  margin-left: -12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: white;
}

.social-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
}

.social-text strong {
  color: white;
  font-weight: 700;
}

@media (max-width: 768px) {
  .cta-title {
    font-size: 36px;
  }

  .cta-description {
    font-size: 17px;
  }

  .cta-features {
    flex-direction: column;
    gap: 16px;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .cta-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

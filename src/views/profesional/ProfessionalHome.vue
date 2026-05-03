<template>

<div class="dashboard-container">

  <!-- MODAL BIENVENIDA NUEVO PROFESIONAL -->
  <Transition name="modal-fade">
    <div v-if="showWelcomeModal" class="welcome-overlay" @click.self="closeWelcome">
      <div class="welcome-modal">

        <div class="welcome-header">
          <div class="welcome-emoji">🎉</div>
          <h2>¡Bienvenido a e-service!</h2>
          <p class="welcome-sub">Tu cuenta fue creada exitosamente. Antes de comenzar a recibir solicitudes, completa estos dos pasos:</p>
        </div>

        <div class="welcome-steps">

          <div class="ws-step">
            <div class="ws-num">1</div>
            <div class="ws-info">
              <strong>Completa tu perfil profesional</strong>
              <span>Sube tus documentos, especialidad, ciudad y foto. Tu perfil quedará pendiente de verificación.</span>
            </div>
            <button class="ws-btn" @click="goToProfile">Ir al perfil →</button>
          </div>

          <div class="ws-step">
            <div class="ws-num">2</div>
            <div class="ws-info">
              <strong>Datos de cuenta bancaria</strong>
              <span>Registra la cuenta donde recibirás los pagos por tus servicios.</span>
            </div>
            <button class="ws-btn ws-btn-gray" @click="goToBankData">Agregar cuenta →</button>
          </div>

        </div>

        <button class="ws-close" @click="closeWelcome">Entendido, lo haré después</button>

      </div>
    </div>
  </Transition>

  <!-- ALERTA PERFIL -->
  <div v-if="needsProfileCompletion" class="profile-warning">
    <div class="warning-content">
      <div class="warning-icon">⚠️</div>

      <div class="warning-text">
        <h3>Completa tu perfil profesional</h3>
        <p>
          Para comenzar a recibir solicitudes de trabajo debes completar tu
          información profesional.
        </p>
      </div>

      <button
        @click="$router.push({ name: 'ProfileProfesional' })"
        class="complete-btn"
      >
        Completar perfil
      </button>
    </div>
  </div>

  <ProfessionalRequests />

</div>

</template>

<script setup>

import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import professionalService from "@/services/professionalService";
import ProfessionalRequests from "./ProfessionalRequests.vue"

const router = useRouter();
const professional = ref(null);
const needsProfileCompletion = ref(false);
const loading = ref(true);
const showWelcomeModal = ref(false);

const closeWelcome = () => {
  showWelcomeModal.value = false;
  localStorage.removeItem('newProfessionalRegistered');
};

const goToProfile = () => {
  closeWelcome();
  router.push({ name: 'ProfileProfesional' });
};

const goToBankData = () => {
  closeWelcome();
  router.push({ name: 'ProfileProfesional' });
};

const jobRequests = ref([
  {
    id: 1,
    title: "Instalación de ducha eléctrica",
    description: "Necesito instalar una ducha en departamento.",
    price: 120,
    client: "María López"
  },
  {
    id: 2,
    title: "Reparación de tubería",
    description: "Hay fuga en cocina, revisar y reparar.",
    price: 90,
    client: "Carlos Ruiz"
  }
])

const activeJobs = ref([
  {
    id: 3,
    title: "Cambio de llave general",
    description: "Reemplazo de llave principal de agua.",
    client: "Ana Torres"
  }
])

const loadDashboard = async () => {
  try {

    const { data } = await professionalService.getDashboard()

    professional.value = data.professional
    needsProfileCompletion.value = data.needs_profile_completion

  } catch (error) {

    console.error(error)

  } finally {

    loading.value = false

  }
}

onMounted(() => {
  loadDashboard();
  if (localStorage.getItem('newProfessionalRegistered') === 'true') {
    showWelcomeModal.value = true;
  }
})

</script>

<style scoped>

.dashboard-container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}

/* ── MODAL BIENVENIDA ── */
.welcome-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.welcome-modal {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: popIn 0.3s cubic-bezier(.34,1.56,.64,1);
}

@keyframes popIn {
  from { transform: scale(0.85); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}

.welcome-header { text-align: center; margin-bottom: 24px; }
.welcome-emoji  { font-size: 48px; margin-bottom: 8px; }
.welcome-header h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
.welcome-sub { font-size: 14px; color: #64748b; margin: 0; line-height: 1.5; }

.welcome-steps { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }

.ws-step {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 16px;
}

.ws-num {
  min-width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ws-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ws-info strong { font-size: 14px; color: #0f172a; }
.ws-info span   { font-size: 12px; color: #64748b; line-height: 1.4; }

.ws-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
}

.ws-btn-gray {
  background: #475569;
}

.ws-close {
  width: 100%;
  background: none;
  border: 1.5px solid #e2e8f0;
  color: #94a3b8;
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
}

.ws-close:hover { border-color: #94a3b8; color: #64748b; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to       { opacity: 0; }

/* ── ALERTA PERFIL ── */
.profile-warning {
  background: #fff3cd;
  border: 1px solid #ffe69c;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.warning-content{
display:flex;
align-items:center;
gap:20px;
flex-wrap:wrap;
}

.warning-icon{
font-size:28px;
}

.warning-text h3{
margin:0;
font-size:18px;
}

.warning-text p{
margin:4px 0 0;
font-size:14px;
color:#555;
}

.complete-btn{
background:#2563eb;
color:white;
border:none;
padding:10px 18px;
border-radius:8px;
cursor:pointer;
font-weight:600;
}

/* GANANCIAS */

.earnings-grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
gap:20px;
margin-bottom:30px;
}

.earnings-card{
background:white;
border-radius:14px;
padding:25px;
box-shadow:0 4px 14px rgba(0,0,0,0.05);
}

.earnings-label{
font-size:14px;
color:#666;
}

.earnings-amount{
font-size:32px;
font-weight:700;
margin:8px 0;
}

.earnings-change{
font-size:13px;
}

.earnings-change.positive{
color:#16a34a;
}

/* SECCIONES */

.section{
margin-top:30px;
}

.section-header{
margin-bottom:15px;
}

.section-header h2{
font-size:20px;
}

/* JOB GRID */

.jobs-grid{
display:grid;
grid-template-columns:repeat(2,1fr);
gap:20px;
}

/* JOB CARD */

.job-card{
background:white;
padding:20px;
border-radius:12px;
box-shadow:0 4px 10px rgba(0,0,0,0.05);
transition:.3s;
}

.job-card:hover{
transform:translateY(-3px);
}

.job-card.active{
border-left:5px solid #22c55e;
}

/* HEADER */

.job-header{
display:flex;
justify-content:space-between;
margin-bottom:10px;
align-items:center;
}

.job-price{
font-weight:700;
color:#2563eb;
}

/* DESCRIPTION */

.job-description{
font-size:14px;
color:#555;
}

/* FOOTER */

.job-footer{
display:flex;
justify-content:space-between;
align-items:center;
margin-top:15px;
flex-wrap:wrap;
gap:10px;
}

.job-client{
font-size:14px;
color:#444;
}

/* BOTONES */

.btn{
padding:6px 12px;
border:none;
border-radius:6px;
cursor:pointer;
font-size:13px;
}

.btn.accept{
background:#22c55e;
color:white;
}

.btn.reject{
background:#ef4444;
color:white;
}

.btn.complete{
background:#2563eb;
color:white;
}

/* STATUS */

.job-status{
font-size:12px;
background:#e8f5e9;
padding:5px 10px;
border-radius:20px;
}

/* EMPTY */

.empty-state{
padding:20px;
background:#f5f5f5;
border-radius:8px;
text-align:center;
color:#777;
}

/* RESPONSIVE */

@media (max-width:900px){

.jobs-grid{
grid-template-columns:1fr;
}

.warning-content{
flex-direction:column;
align-items:flex-start;
}

}

@media (max-width:600px){

.dashboard-container{
padding:15px;
}

.earnings-amount{
font-size:26px;
}

.section-header h2{
font-size:18px;
}

}
</style>
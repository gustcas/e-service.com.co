<template>
  <section id="professionals" class="section professionals-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Conoce a Nuestros Expertos</h2>
      </div>

      <div class="professionals-grid">
        <div v-for="pro in professionals" :key="pro.id" class="pro-card">
          <div class="pro-badge" v-if="pro.featured">
            <span class="badge-star">⭐</span>
            Top Rated
          </div>

          <div class="pro-avatar-wrapper">
            <div class="pro-status"></div>
            <img :src="pro.avatar" :alt="pro.name" class="pro-avatar" />
          </div>

          <h3 class="pro-name">{{ pro.name }}</h3>
          <p class="pro-role">{{ pro.role }}</p>

          <div class="pro-rating">
            <span class="stars">★★★★★</span>
            <span class="rating-text">
              {{ pro.rating }} ({{ pro.reviews }} reviews)
            </span>
          </div>

          <div class="pro-stats">
            <div class="stat">
              <div class="stat-value">{{ pro.completedJobs }}</div>
              <div class="stat-label">Trabajos</div>
            </div>

            <div class="stat-divider"></div>

            <div class="stat">
              <div class="stat-value">{{ pro.responseTime }}</div>
              <div class="stat-label">Respuesta</div>
            </div>
          </div>

          <div class="pro-skills">
            <span
              v-for="skill in pro.skills.slice(0,3)"
              :key="skill"
              class="skill-tag"
            >
              {{ skill }}
            </span>
          </div>

          <button class="pro-cta">
            <span>Ver Perfil</span>
            <span class="cta-arrow">→</span>
          </button>
        </div>
      </div>

      <div class="view-all-wrapper">
        <button class="view-all-btn">
          Ver Todos los Profesionales
          <span class="btn-icon">→</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import professionalService from "@/services/professionalService";

const professionals = ref([]);

const loadProfessionals = async () => {
  try {

    const response = await professionalService.getListProfessionals();

    professionals.value = response.data.map(pro => ({
      id: pro.id,
      name: pro.name,
      role: pro.profession || pro.category?.name || "Profesional",
      avatar: pro.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pro.name}`,
      rating: pro.rating || 5,
      reviews: pro.reviews || 0,
      completedJobs: pro.jobs_completed || "0",
      responseTime: "< 1h",
      skills: pro.skills || [],
      featured: pro.featured || false
    }));

  } catch (error) {
    console.error("Error cargando profesionales", error);
  }
};

onMounted(() => {
  loadProfessionals();
});
</script>

<style scoped>

.container{
max-width:1200px;
margin:auto;
padding:0 20px;
}

.professionals-section{
padding:100px 0;
background:white;
}

.section-header{
text-align:center;
max-width:700px;
margin:0 auto 60px;
}

.section-badge{
display:inline-block;
background:linear-gradient(135deg,#fef3c7,#fde68a);
color:#d97706;
padding:8px 20px;
border-radius:50px;
font-size:14px;
font-weight:700;
margin-bottom:20px;
}

.section-title{
font-size:42px;
font-weight:900;
color:#0f172a;
margin-bottom:16px;
}

.section-description{
font-size:18px;
color:#64748b;
line-height:1.6;
}

/* GRID */

.professionals-grid{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:30px;
margin-bottom:60px;
}

/* CARD */

.pro-card{
background:white;
border:2px solid #f1f5f9;
border-radius:22px;
padding:28px 22px;
text-align:center;
position:relative;
transition:all .35s ease;
cursor:pointer;
}

.pro-card:hover{
transform:translateY(-10px);
border-color:#dbeafe;
box-shadow:0 20px 50px rgba(37,99,235,0.15);
}

.pro-badge{
position:absolute;
top:14px;
right:14px;
background:linear-gradient(135deg,#fbbf24,#f59e0b);
color:white;
padding:6px 12px;
border-radius:30px;
font-size:12px;
font-weight:700;
display:flex;
align-items:center;
gap:4px;
}

/* AVATAR */

.pro-avatar-wrapper{
position:relative;
width:100px;
height:100px;
margin:0 auto 18px;
}

.pro-status{
position:absolute;
bottom:4px;
right:4px;
width:18px;
height:18px;
background:#22c55e;
border:3px solid white;
border-radius:50%;
}

.pro-avatar{
width:100%;
height:100%;
border-radius:50%;
border:4px solid #f1f5f9;
object-fit:cover;
transition:.3s;
}

.pro-card:hover .pro-avatar{
border-color:#3b82f6;
transform:scale(1.05);
}

/* TEXT */

.pro-name{
font-size:19px;
font-weight:800;
color:#1e293b;
margin-bottom:4px;
}

.pro-role{
font-size:14px;
color:#64748b;
margin-bottom:16px;
}

/* RATING */

.pro-rating{
display:flex;
align-items:center;
justify-content:center;
gap:8px;
margin-bottom:18px;
}

.stars{
color:#fbbf24;
font-size:15px;
}

.rating-text{
font-size:13px;
color:#475569;
font-weight:600;
}

/* STATS */

.pro-stats{
display:flex;
align-items:center;
justify-content:center;
gap:20px;
padding:16px;
background:#f8fafc;
border-radius:14px;
margin-bottom:18px;
}

.stat-value{
font-size:18px;
font-weight:800;
color:#2563eb;
}

.stat-label{
font-size:11px;
color:#64748b;
font-weight:600;
}

.stat-divider{
width:1px;
height:35px;
background:#e2e8f0;
}

/* SKILLS */

.pro-skills{
display:flex;
flex-wrap:wrap;
gap:6px;
justify-content:center;
margin-bottom:18px;
}

.skill-tag{
background:linear-gradient(135deg,#eff6ff,#dbeafe);
color:#2563eb;
padding:5px 12px;
border-radius:8px;
font-size:11px;
font-weight:700;
}

/* BUTTON */

.pro-cta{
width:100%;
background:linear-gradient(135deg,#2563eb,#4f46e5);
color:white;
border:none;
padding:12px;
border-radius:10px;
font-weight:700;
font-size:14px;
cursor:pointer;
display:flex;
align-items:center;
justify-content:center;
gap:6px;
}

.view-all-wrapper{
text-align:center;
margin-top:40px;
}

.view-all-btn{
background:white;
color:#2563eb;
border:2px solid #2563eb;
padding:14px 36px;
border-radius:12px;
font-weight:700;
cursor:pointer;
display:inline-flex;
align-items:center;
gap:8px;
}

/* RESPONSIVE */

@media (max-width:1200px){
.professionals-grid{
grid-template-columns:repeat(3,1fr);
}
}

@media (max-width:900px){
.professionals-grid{
grid-template-columns:repeat(2,1fr);
}
}

@media (max-width:600px){

.professionals-section{
padding:70px 0;
}

.section-title{
font-size:28px;
}

.section-description{
font-size:16px;
}

.professionals-grid{
grid-template-columns:1fr;
gap:20px;
}

.pro-avatar-wrapper{
width:80px;
height:80px;
}

}

</style>
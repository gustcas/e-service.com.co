<template>
  <div class="landing-page">
    <Navbar />
    <Hero />
    <Categories />
    <Professionals />
    <CTA />
    <Footer />
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue';
import Hero from '../components/Hero.vue';
import Categories from '../components/Categories.vue';
import Professionals from '../components/Professionals.vue';
import CTA from '../components/CTA.vue';
import Footer from '../components/Footer.vue';
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
}
</style>

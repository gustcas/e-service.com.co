<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  // Initialize authentication state from localStorage
  authStore.initAuth();
});
</script>

<style>
/* Import global styles */
@import './assets/landing.css';
</style>

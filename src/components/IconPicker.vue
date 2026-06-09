<template>
  <!-- Círculo que muestra el icono seleccionado -->
  <div class="flex flex-col items-center gap-2">
    <button type="button" @click="showGallery = true"
      class="relative w-16 h-16 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform border-2 border-white"
      :style="{ background: selectedIcon ? selectedIcon.bg : '#f1f5f9' }"
      :title="selectedIcon ? selectedIcon.label : 'Seleccionar icono'">
      <svg v-if="selectedIcon" viewBox="0 0 24 24" class="w-7 h-7" fill="none"
        stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
        :stroke="selectedIcon.color" v-html="selectedIcon.svg" />
      <svg v-else viewBox="0 0 24 24" class="w-7 h-7" fill="none" stroke="#94a3b8" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
      </svg>
      <!-- Badge editar -->
      <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#0d4f5c] flex items-center justify-center shadow">
        <svg viewBox="0 0 24 24" class="w-3 h-3" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        </svg>
      </span>
    </button>
    <span class="text-[11px] text-slate-400 font-semibold">{{ selectedIcon ? selectedIcon.label : 'Sin icono' }}</span>
  </div>

  <!-- Galería modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showGallery" class="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style="background:rgba(15,23,42,0.6)" @click.self="showGallery = false">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <p class="font-black text-[#0f172a]">Seleccionar icono</p>
            <button @click="showGallery = false"
              class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition text-lg">×</button>
          </div>
          <!-- Búsqueda -->
          <div class="px-6 pt-4">
            <input v-model="search" type="text" placeholder="Buscar icono..."
              class="w-full border border-slate-200 rounded-xl px-4 py-2 text-[13px] outline-none focus:border-blue-400 transition bg-slate-50" />
          </div>
          <!-- Grid -->
          <div class="p-6 grid grid-cols-5 gap-3 max-h-80 overflow-y-auto">
            <button v-for="icon in filteredIcons" :key="icon.key" type="button"
              @click="selectIcon(icon)"
              :class="['flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition',
                modelValue === icon.key
                  ? 'border-[#0d4f5c] bg-teal-50 scale-105'
                  : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50']">
              <div class="w-10 h-10 rounded-full flex items-center justify-center" :style="{background: icon.bg}">
                <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none"
                  stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
                  :stroke="icon.color" v-html="icon.svg" />
              </div>
              <span class="text-[9px] text-slate-500 font-semibold text-center leading-tight">{{ icon.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { iconOptions } from '@/composables/useIcons'

const props = defineProps({ modelValue: { type: String, default: null } })
const emit  = defineEmits(['update:modelValue'])

const showGallery  = ref(false)
const search       = ref('')

const selectedIcon = computed(() => iconOptions.find(i => i.key === props.modelValue) ?? null)

const filteredIcons = computed(() => {
  if (!search.value.trim()) return iconOptions
  return iconOptions.filter(i => i.label.toLowerCase().includes(search.value.toLowerCase()))
})

const selectIcon = (icon) => {
  emit('update:modelValue', icon.key)
  showGallery.value = false
  search.value = ''
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease }
.fade-enter-from, .fade-leave-to       { opacity: 0 }
</style>

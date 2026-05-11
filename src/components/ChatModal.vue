<template>
  <Transition name="modal">
    <div v-if="modelValue" class="chat-overlay" @click.self="close">
      <div class="chat-modal">

        <!-- ── HEADER ── -->
        <div class="chat-header">
          <div class="chat-header-left">
            <div class="chat-avatar-lg">{{ initials(otherName) }}</div>
            <div class="chat-header-info">
              <div class="chat-other-name">
                {{ otherName }}
                <span class="req-id">#{{ requestId }}</span>
              </div>
              <div class="chat-status">
                <span :class="['status-dot', otherOnline ? 'online' : 'offline']"></span>
                <span class="status-text">{{ otherOnline ? 'En línea' : 'Desconectado' }}</span>
              </div>
            </div>
          </div>
          <div class="chat-header-right">
            <button class="chat-close" @click="close">✕</button>
          </div>
        </div>

        <!-- ── MESSAGES ── -->
        <div class="chat-body" ref="bodyRef">
          <div v-if="apiError" class="chat-api-error">⚠ {{ apiError }}</div>
          <div v-if="loading" class="chat-loading">Cargando mensajes…</div>
          <div v-else-if="messages.length === 0" class="chat-empty">
            <div class="chat-empty-icon">💬</div>
            <p>No hay mensajes aún.<br>¡Empieza la conversación!</p>
          </div>
          <template v-else>
            <div v-for="msg in messages" :key="msg.id"
              :class="['msg-row', msg.is_mine ? 'mine' : 'theirs']">
              <div :class="['bubble', msg.is_mine ? 'mine' : 'theirs']">
                <span class="bubble-text">{{ msg.message }}</span>
                <span class="bubble-meta">
                  <span class="bubble-time">{{ msg.created_at }}</span>
                  <span v-if="msg.is_mine" class="bubble-checks">✓✓</span>
                </span>
              </div>
            </div>
          </template>
        </div>

        <!-- ── INPUT ── -->
        <div class="chat-footer">
          <button class="footer-icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
          <input
            v-model="newMessage"
            class="chat-input"
            placeholder="Escribe un mensaje…"
            @keydown.enter.prevent="send"
            :disabled="sending"
          />
          <button class="send-btn" :disabled="!newMessage.trim() || sending" @click="send">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import chatService from '@/services/chatService'

const props = defineProps({
  modelValue: Boolean,
  requestId: { type: [Number, String], required: true },
  otherName: { type: String, default: 'Usuario' },
  serviceName: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'read'])

const messages    = ref([])
const newMessage  = ref('')
const loading     = ref(false)
const sending     = ref(false)
const otherOnline = ref(false)
const apiError    = ref('')
const bodyRef     = ref(null)
let pollTimer     = null

const initials = (name) =>
  (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

const scrollBottom = () => {
  nextTick(() => {
    if (bodyRef.value) bodyRef.value.scrollTop = bodyRef.value.scrollHeight
  })
}

const loadMessages = async () => {
  try {
    const { data } = await chatService.getMessages(props.requestId)
    messages.value    = data.messages
    otherOnline.value = data.other_online || false
    apiError.value    = ''
    scrollBottom()
  } catch (e) {
    const msg = e?.response?.data?.message || e?.response?.status || e?.message || 'Error desconocido'
    apiError.value = 'Error al cargar: ' + msg
    console.error('[Chat] error requestId=' + props.requestId, e?.response?.data || e)
  }
}

const send = async () => {
  const text = newMessage.value.trim()
  if (!text || sending.value) return
  sending.value    = true
  newMessage.value = ''
  try {
    const { data } = await chatService.sendMessage(props.requestId, text)
    messages.value.push(data)
    apiError.value = ''
    scrollBottom()
  } catch (e) {
    newMessage.value = text
    const msg = e?.response?.data?.message || e?.response?.status || e?.message || 'Error desconocido'
    apiError.value = 'Error al enviar: ' + msg
    console.error('[Chat] send error requestId=' + props.requestId, e?.response?.data || e)
  } finally {
    sending.value = false
  }
}

const close = () => {
  emit('update:modelValue', false)
  emit('read')
}

watch(() => props.modelValue, (open) => {
  if (open) {
    loading.value = true
    loadMessages().finally(() => { loading.value = false })
    pollTimer = setInterval(loadMessages, 3000)
  } else {
    clearInterval(pollTimer)
    pollTimer = null
    otherOnline.value = false
  }
})

onUnmounted(() => clearInterval(pollTimer))
</script>

<style scoped>
/* ── Overlay ── */
.chat-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}

/* ── Modal shell ── */
.chat-modal {
  background: #fff;
  border-radius: 18px;
  width: 100%; max-width: 400px;
  height: 580px;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,.25);
  overflow: hidden;
}

/* ── Header ── */
.chat-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  flex-shrink: 0;
}
.chat-header-left { display: flex; align-items: center; gap: 12px; }
.chat-avatar-lg {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(255,255,255,.22);
  border: 2px solid rgba(255,255,255,.4);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 16px; color: #fff;
  flex-shrink: 0; letter-spacing: .5px;
}
.chat-other-name {
  font-weight: 700; font-size: 15px; color: #fff;
  display: flex; align-items: center; gap: 6px;
}
.req-id { font-size: 10px; opacity: .45; font-weight: 400; }
.chat-status { display: flex; align-items: center; gap: 5px; margin-top: 2px; }
.status-dot {
  width: 8px; height: 8px; border-radius: 50%;
  transition: background .4s;
}
.status-dot.online  { background: #4ade80; box-shadow: 0 0 0 2px rgba(74,222,128,.35); }
.status-dot.offline { background: rgba(255,255,255,.35); }
.status-text { font-size: 12px; color: rgba(255,255,255,.85); }
.chat-header-right { display: flex; align-items: center; gap: 4px; }
.chat-close {
  background: rgba(255,255,255,.15); border: none; color: #fff;
  width: 32px; height: 32px; border-radius: 50%;
  font-size: 14px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.chat-close:hover { background: rgba(255,255,255,.28); }

/* ── Body ── */
.chat-body {
  flex: 1; overflow-y: auto; padding: 16px 14px;
  background: #f0f2f5;
  display: flex; flex-direction: column; gap: 4px;
  scroll-behavior: smooth;
}
.chat-api-error {
  background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
  border-radius: 8px; padding: 8px 12px; font-size: 12px;
  margin-bottom: 8px; word-break: break-all;
}
.chat-loading {
  text-align: center; color: #94a3b8; font-size: 13px; margin: auto;
}
.chat-empty {
  margin: auto; text-align: center; color: #94a3b8; font-size: 13px;
}
.chat-empty-icon { font-size: 36px; margin-bottom: 8px; }
.chat-empty p { line-height: 1.5; }

/* ── Message rows ── */
.msg-row {
  display: flex;
  margin-bottom: 2px;
}
.msg-row.mine   { justify-content: flex-end; }
.msg-row.theirs { justify-content: flex-start; }

/* ── Bubbles ── */
.bubble {
  max-width: 75%; padding: 8px 12px 6px;
  border-radius: 16px;
  display: flex; flex-direction: column;
  word-break: break-word;
}
.bubble.theirs {
  background: #fff;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,.1);
  color: #1e293b;
}
.bubble.mine {
  background: #2563eb;
  border-bottom-right-radius: 4px;
  color: #fff;
}
.bubble-text { font-size: 14px; line-height: 1.45; }
.bubble-meta {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 3px; margin-top: 3px;
}
.bubble-time {
  font-size: 10px;
  color: rgba(0,0,0,.38);
}
.bubble.mine .bubble-time { color: rgba(255,255,255,.65); }
.bubble-checks {
  font-size: 11px; color: rgba(255,255,255,.7);
  letter-spacing: -1px;
}

/* ── Footer ── */
.chat-footer {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px 12px;
  background: #fff;
  border-top: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.footer-icon-btn {
  background: none; border: none;
  color: #94a3b8; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 50%;
  transition: background .15s;
  flex-shrink: 0;
}
.footer-icon-btn:hover { background: #f1f5f9; color: #64748b; }
.chat-input {
  flex: 1;
  background: #f1f5f9; border: none; border-radius: 24px;
  padding: 10px 16px; font-size: 14px; outline: none;
  color: #1e293b;
  transition: background .2s;
}
.chat-input::placeholder { color: #94a3b8; }
.chat-input:focus { background: #e8edf3; }
.send-btn {
  width: 38px; height: 38px; border-radius: 50%;
  background: #2563eb; border: none; color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  transition: background .2s, transform .15s;
}
.send-btn:hover:not(:disabled) { background: #1d4ed8; transform: scale(1.05); }
.send-btn:disabled { background: #bfdbfe; cursor: not-allowed; }

/* ── Scrollbar ── */
.chat-body::-webkit-scrollbar { width: 4px; }
.chat-body::-webkit-scrollbar-track { background: transparent; }
.chat-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

/* ── Transitions ── */
.modal-enter-active, .modal-leave-active { transition: opacity .2s, transform .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.96); }
</style>

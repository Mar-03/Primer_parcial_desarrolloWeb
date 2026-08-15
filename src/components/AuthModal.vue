<template>
  <div class="auth-modal-backdrop" @click.self="$emit('close')">
    <section class="auth-modal" role="dialog" aria-modal="true" aria-label="Autenticación">
      <div class="auth-modal-header">
        <h2>Acceso de estudiantes</h2>
        <button type="button" class="modal-close" @click="$emit('close')">Cerrar</button>
      </div>

      <div class="tabs" role="tablist" aria-label="Navegación de autenticación">
        <button type="button" class="tab" :class="{ active: tab === 'login' }" @click="$emit('switch-tab', 'login')">
          Iniciar sesión
        </button>
        <button type="button" class="tab" :class="{ active: tab === 'register' }" @click="$emit('switch-tab', 'register')">
          Registrarse
        </button>
      </div>

      <LoginForm
        v-if="tab === 'login'"
        :key="`login-${resetToken}`"
        :loading="loading"
        :message="message"
        :message-type="messageType"
        :reset-token="resetToken"
        @submit="$emit('submit-login', $event)"
      />

      <RegisterForm
        v-else
        :key="`register-${resetToken}`"
        :loading="loading"
        :message="message"
        :message-type="messageType"
        :reset-token="resetToken"
        @submit="$emit('submit-register', $event)"
      />
    </section>
  </div>
</template>

<script setup>
import LoginForm from './LoginForm.vue';
import RegisterForm from './RegisterForm.vue';

defineProps({
  tab: { type: String, default: 'login' },
  loading: { type: Boolean, default: false },
  message: { type: String, default: '' },
  messageType: { type: String, default: '' },
  resetToken: { type: Number, default: 0 },
});

defineEmits(['close', 'switch-tab', 'submit-login', 'submit-register']);
</script>

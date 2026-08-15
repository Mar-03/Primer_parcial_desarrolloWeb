<template>
  <form class="auth-form" @submit.prevent="submitForm">
    <h2>Iniciar sesión</h2>
    <p class="subtle">Usa tu carné o correo y tu PIN numérico.</p>

    <FormField
      v-model="form.usuario"
      label="Usuario"
      name="usuario"
      placeholder="1890-20-11489 o correo"
      :error="errors.usuario"
    />

    <FormField
      v-model="form.password"
      label="Contraseña / PIN"
      name="password"
      type="password"
      placeholder="1234"
      :error="errors.password"
    />

    <button class="button" type="submit" :disabled="loading">
      {{ loading ? 'Ingresando...' : 'Entrar' }}
    </button>

    <p v-if="message" class="feedback" :class="messageType">{{ message }}</p>
  </form>
</template>

<script setup>
import { reactive } from 'vue';
import FormField from './FormField.vue';
import { validateLogin } from '../services/validation';

const props = defineProps({
  loading: Boolean,
  message: String,
  messageType: String,
});

const emit = defineEmits(['submit']);

const form = reactive({
  usuario: '',
  password: '',
});

const errors = reactive({
  usuario: '',
  password: '',
});

function submitForm() {
  const nextErrors = validateLogin(form);
  errors.usuario = nextErrors.usuario || '';
  errors.password = nextErrors.password || '';

  if (Object.keys(nextErrors).length > 0) return;

  emit('submit', { ...form });
}
</script>

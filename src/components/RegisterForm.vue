<template>
  <form class="auth-form" @submit.prevent="submitForm">
    <h2>Registro de estudiante</h2>
    <p class="subtle">Completa los datos antes de enviar la solicitud.</p>

    <FormField v-model="form.carne" label="Carné" name="carne" placeholder="1890-20-11489" :error="errors.carne" />
    <FormField v-model="form.estudiante" label="Nombre del estudiante" name="estudiante" placeholder="JUAN PEREZ" :error="errors.estudiante" />
    <FormField v-model="form.correo" label="Correo" name="correo" type="email" placeholder="juan.perez@correo.com" :error="errors.correo" />
    <FormField v-model="form.password" label="Contraseña / PIN" name="password" type="password" placeholder="1234" :error="errors.password" />

    <button class="button" type="submit" :disabled="loading">
      {{ loading ? 'Registrando...' : 'Registrar' }}
    </button>

    <p v-if="message" class="feedback" :class="messageType">{{ message }}</p>
  </form>
</template>

<script setup>
import { reactive } from 'vue';
import FormField from './FormField.vue';
import { validateRegistration } from '../services/validation';

defineProps({
  loading: Boolean,
  message: String,
  messageType: String,
});

const emit = defineEmits(['submit']);

const form = reactive({
  carne: '',
  estudiante: '',
  correo: '',
  password: '',
});

const errors = reactive({
  carne: '',
  estudiante: '',
  correo: '',
  password: '',
});

function submitForm() {
  const nextErrors = validateRegistration(form);
  errors.carne = nextErrors.carne || '';
  errors.estudiante = nextErrors.estudiante || '';
  errors.correo = nextErrors.correo || '';
  errors.password = nextErrors.password || '';

  if (Object.keys(nextErrors).length > 0) return;

  emit('submit', { ...form });
}
</script>

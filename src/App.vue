<template>
  <div class="app-shell">
    <header class="site-header">
      <div>
        <p class="eyebrow">Primer Parcial</p>
        <h1>Plataforma educativa de videos</h1>
      </div>

      <div v-if="auth.user" class="header-session">
        <div>
          <strong>{{ auth.user.estudiante }}</strong>
          <span>{{ auth.user.carne }}</span>
        </div>
        <button class="button button-secondary" type="button" @click="logout">Cerrar sesión</button>
      </div>
    </header>

    <main v-if="!auth.user" class="public-layout">
      <section class="panel intro-panel">
        <h2>Acceso de estudiantes</h2>
        <p>
          Puedes navegar y reproducir los videos sin iniciar sesión. Regístrate o inicia sesión para dar Me gusta,
          comentar y responder.
        </p>

        <div class="session-box muted">
          <p class="session-label">Sesión pública</p>
          <span>Sin autenticación activa.</span>
        </div>
      </section>

      <section class="panel auth-panel">
        <div class="tabs" role="tablist" aria-label="Navegación de autenticación">
          <button type="button" class="tab" :class="{ active: view === 'login' }" @click="view = 'login'">
            Login
          </button>
          <button type="button" class="tab" :class="{ active: view === 'register' }" @click="view = 'register'">
            Registro
          </button>
        </div>

        <LoginForm
          v-if="view === 'login'"
          :loading="auth.loading"
          :message="auth.message"
          :message-type="auth.messageType"
          @submit="handleLogin"
        />

        <RegisterForm
          v-else
          :loading="auth.loading"
          :message="auth.message"
          :message-type="auth.messageType"
          @submit="handleRegister"
        />
      </section>

      <CatalogView guest-mode compact />
    </main>

    <main v-else class="authenticated-layout">
      <CatalogView :guest-mode="false" :notice="auth.message" :notice-type="auth.messageType" />
    </main>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import CatalogView from './components/CatalogView.vue';
import LoginForm from './components/LoginForm.vue';
import RegisterForm from './components/RegisterForm.vue';
import { loginStudent, registerStudent } from './services/authService';

const STORAGE_KEY = 'primer-parcial-auth';
const view = ref('login');
const auth = reactive({
  user: null,
  loading: false,
  message: '',
  messageType: '',
});

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    auth.user = JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveSession(user) {
  auth.user = user;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearFeedback() {
  auth.message = '';
  auth.messageType = '';
}

async function handleRegister(payload) {
  auth.loading = true;
  clearFeedback();

  try {
    const result = await registerStudent(payload);
    auth.messageType = 'success';
    auth.message = result.message || 'Registro exitoso.';
    view.value = 'login';
  } catch (error) {
    auth.messageType = 'error';
    auth.message = error.message;
  } finally {
    auth.loading = false;
  }
}

async function handleLogin(payload) {
  auth.loading = true;
  clearFeedback();

  try {
    const result = await loginStudent(payload);
    saveSession(result.user);
    auth.messageType = 'success';
    auth.message = result.message || 'Inicio de sesión exitoso.';
  } catch (error) {
    auth.messageType = 'error';
    auth.message = error.message;
  } finally {
    auth.loading = false;
  }
}

function logout() {
  auth.user = null;
  localStorage.removeItem(STORAGE_KEY);
  auth.messageType = 'success';
  auth.message = 'Sesión cerrada correctamente.';
  view.value = 'login';
}

loadSession();
</script>

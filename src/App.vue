<template>
  <div class="app-shell">
    <header class="site-header">
      <h1>Plataforma educativa de videos</h1>

      <nav class="top-nav" aria-label="Navegación principal">
        <button type="button" class="nav-link" @click="scrollToCatalog">Catálogo</button>

        <template v-if="auth.user">
          <span class="nav-separator">|</span>
          <span class="nav-user">{{ auth.user.estudiante }}</span>
          <span class="nav-user muted">{{ auth.user.carne }}</span>
          <button type="button" class="nav-link" @click="logout">Cerrar sesión</button>
        </template>

        <template v-else>
          <span class="nav-separator">|</span>
          <button type="button" class="nav-link" @click="openAuth('login')">Iniciar sesión</button>
          <span class="nav-separator">|</span>
          <button type="button" class="nav-link" @click="openAuth('register')">Registrarse</button>
        </template>
      </nav>
    </header>

    <section class="hero-copy-block">
      <p>Busca, filtra y reproduce videos educativos. Solo necesitas iniciar sesión para interactuar.</p>
    </section>

    <main>
      <CatalogView
        ref="catalogRef"
        :guest-mode="!auth.user"
        :current-user="auth.user"
        @request-auth="openAuth"
      />
    </main>

    <AuthModal
      v-if="authModalOpen"
      :tab="authTab"
      :loading="auth.loading"
      :message="auth.message"
      :message-type="auth.messageType"
      :reset-token="auth.resetToken"
      @close="closeAuth"
      @switch-tab="openAuth"
      @submit-login="handleLogin"
      @submit-register="handleRegister"
    />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import AuthModal from './components/AuthModal.vue';
import CatalogView from './components/CatalogView.vue';
import { loginStudent, registerStudent } from './services/authService.js';

const STORAGE_KEY = 'primer-parcial-auth';
const auth = reactive({
  user: null,
  loading: false,
  message: '',
  messageType: '',
  resetToken: 0,
});
const authModalOpen = ref(false);
const authTab = ref('login');
const catalogRef = ref(null);

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

function bumpResetToken() {
  auth.resetToken += 1;
}

function closeAuth() {
  authModalOpen.value = false;
  clearFeedback();
}

async function openAuth(target = 'login') {
  if (auth.user) return;

  clearFeedback();
  authTab.value = target;
  authModalOpen.value = true;
}

async function handleRegister(payload) {
  auth.loading = true;
  clearFeedback();

  try {
    const result = await registerStudent(payload);
    bumpResetToken();
    auth.messageType = 'success';
    auth.message = result.message || 'Registro exitoso.';
    authTab.value = 'login';
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
    bumpResetToken();
    auth.messageType = 'success';
    auth.message = result.message || 'Inicio de sesión exitoso.';
    authModalOpen.value = false;
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
  clearFeedback();
  authTab.value = 'login';
  authModalOpen.value = false;
}

function scrollToCatalog() {
  catalogRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

onMounted(loadSession);
</script>

<template>
  <section class="catalog-shell">
    <div class="catalog-hero">
      <div>
        <h2>Busca y aprende con nuestros videos educativos</h2>
        <p>
          Puedes navegar, buscar, filtrar y reproducir videos sin iniciar sesión.
          Inicia sesión solo para interactuar.
        </p>
      </div>

      <div class="catalog-summary">
        <strong>{{ guestMode ? 'Vista pública' : 'Sesión activa' }}</strong>
        <span>{{ filteredVideos.length }} videos visibles</span>
      </div>
    </div>

    <p v-if="notice" class="feedback" :class="noticeType">{{ notice }}</p>

    <div class="catalog-toolbar">
      <label class="toolbar-field">
        <span>Buscar por título</span>
        <input v-model="searchTerm" type="text" placeholder="Escribe un título..." />
      </label>

      <label class="toolbar-field">
        <span>Categoría</span>
        <select v-model="selectedCategory">
          <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>

    <div v-if="loading" class="state-box">Cargando catálogo real...</div>
    <div v-else-if="error" class="state-box error">
      <p>{{ error }}</p>
      <button class="button button-secondary" type="button" @click="loadCatalog">Reintentar</button>
    </div>
    <template v-else>
      <div v-if="categoryLoading" class="state-inline">Actualizando categoría...</div>

      <div v-if="filteredVideos.length === 0" class="state-box empty">
        <p>No hay videos para mostrar con los filtros actuales.</p>
      </div>

      <div v-else class="video-grid">
        <VideoCard v-for="video in filteredVideos" :key="video.id" :video="video" @select="openVideo(video.id)" />
      </div>

      <VideoDetail
        :video="selectedVideo"
        :loading="detailLoading"
        :error="detailError"
        :guest-mode="guestMode"
        :notice="interactionNotice"
        :show-login-action="showLoginAction"
        @close="closeVideo"
        @interact="handleInteractionAttempt"
        @request-auth="$emit('request-auth', $event)"
      />
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import VideoCard from './VideoCard.vue';
import VideoDetail from './VideoDetail.vue';
import { getCategories, getVideoById, getVideos, getVideosByCategory } from '../services/videoService.js';

const props = defineProps({
  guestMode: { type: Boolean, default: false },
  notice: { type: String, default: '' },
  noticeType: { type: String, default: '' },
});

defineEmits(['request-auth']);

const loading = ref(true);
const error = ref('');
const categoryLoading = ref(false);
const detailLoading = ref(false);
const detailError = ref('');
const searchTerm = ref('');
const selectedCategory = ref('all');
const categories = ref([]);
const allVideos = ref([]);
const currentVideos = ref([]);
const selectedVideo = ref(null);
const interactionNotice = ref('');
const showLoginAction = ref(false);

const categoryOptions = computed(() => [
  { value: 'all', label: 'Todas las categorías' },
  ...categories.value.map((category) => ({ value: category, label: category })),
]);

const filteredVideos = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();

  return currentVideos.value.filter((video) => {
    const matchesTitle = !term || String(video.titulo || '').toLowerCase().includes(term);
    return matchesTitle;
  });
});

async function loadCatalog() {
  loading.value = true;
  error.value = '';
  detailError.value = '';
  selectedVideo.value = null;

  try {
    const [videos, cats] = await Promise.all([getVideos(), getCategories()]);
    allVideos.value = Array.isArray(videos) ? videos : [];
    currentVideos.value = [...allVideos.value];
    categories.value = Array.isArray(cats) ? cats : [];
  } catch (err) {
    error.value = err.message || 'No se pudo cargar el catálogo.';
  } finally {
    loading.value = false;
  }
}

async function openVideo(id) {
  detailLoading.value = true;
  detailError.value = '';
  interactionNotice.value = '';
  showLoginAction.value = false;
  selectedVideo.value = { id };

  try {
    selectedVideo.value = await getVideoById(id);
  } catch (err) {
    detailError.value = err.message || 'No se pudo cargar el video.';
  } finally {
    detailLoading.value = false;
  }
}

function closeVideo() {
  selectedVideo.value = null;
  detailError.value = '';
  interactionNotice.value = '';
  showLoginAction.value = false;
}

async function loadCategory(category) {
  selectedVideo.value = null;

  if (category === 'all') {
    currentVideos.value = [...allVideos.value];
    return;
  }

  categoryLoading.value = true;
  error.value = '';

  try {
    const videos = await getVideosByCategory(category);
    currentVideos.value = Array.isArray(videos) ? videos : [];
  } catch (err) {
    error.value = err.message || 'No se pudo filtrar por categoría.';
  } finally {
    categoryLoading.value = false;
  }
}

function handleInteractionAttempt(type) {
  if (props.guestMode) {
    interactionNotice.value = 'Debes iniciar sesión para interactuar con este video.';
    showLoginAction.value = true;
    return;
  }

  interactionNotice.value = type === 'likes' ? 'Funcionalidad de Me gusta disponible en la Serie III.' : 'Funcionalidad de comentarios disponible en la Serie III.';
  showLoginAction.value = false;
}

watch(selectedCategory, (value) => {
  loadCategory(value);
});

onMounted(loadCatalog);
</script>

<template>
  <section class="catalog-shell" :class="{ compact }">
    <div class="catalog-hero">
      <div>
        <p class="eyebrow">Catálogo de videos</p>
        <h2>Aprende con videos educativos reales</h2>
        <p class="hero-copy dark">
          Busca, filtra por categoría y reproduce el contenido directamente desde la API oficial.
        </p>
      </div>
      <div class="catalog-badge">
        <span class="badge-label">Estado</span>
        <strong>{{ guestMode ? 'Vista pública' : 'Sesión autenticada' }}</strong>
      </div>
    </div>

    <p v-if="notice" class="feedback" :class="noticeType">{{ notice }}</p>

    <div v-if="loading" class="state-box">Cargando catálogo real...</div>
    <div v-else-if="error" class="state-box error">
      <p>{{ error }}</p>
      <button class="button button-secondary" type="button" @click="loadCatalog">Reintentar</button>
    </div>
    <template v-else>
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

      <div v-if="categoryLoading" class="state-inline">Actualizando categoría...</div>
      <div v-if="filteredVideos.length === 0" class="state-box empty">
        <p>No hay videos para mostrar con los filtros actuales.</p>
      </div>

      <div class="catalog-layout">
        <div class="video-grid">
          <VideoCard
            v-for="video in filteredVideos"
            :key="video.id"
            :video="video"
            :active="selectedVideo?.id === video.id"
            @select="openVideo(video.id)"
          />
        </div>

        <VideoDetail
          :video="selectedVideo"
          :loading="detailLoading"
          :error="detailError"
          :guest-mode="guestMode"
          @interact="handleInteractionAttempt"
        />
      </div>

      <p v-if="interactionNote" class="interaction-note">{{ interactionNote }}</p>
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
  compact: { type: Boolean, default: false },
  notice: { type: String, default: '' },
  noticeType: { type: String, default: '' },
});

const loading = ref(true);
const error = ref('');
const categoryLoading = ref(false);
const detailLoading = ref(false);
const detailError = ref('');
const interactionNote = ref('');
const searchTerm = ref('');
const selectedCategory = ref('all');
const categories = ref([]);
const allVideos = ref([]);
const currentVideos = ref([]);
const selectedVideo = ref(null);

const categoryOptions = computed(() => [
  { value: 'all', label: 'Todas' },
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

  try {
    const [videos, cats] = await Promise.all([getVideos(), getCategories()]);
    allVideos.value = Array.isArray(videos) ? videos : [];
    currentVideos.value = [...allVideos.value];
    categories.value = Array.isArray(cats) ? cats : [];
    selectedVideo.value = currentVideos.value[0] || null;

    if (selectedVideo.value) {
      await openVideo(selectedVideo.value.id, true);
    }
  } catch (err) {
    error.value = err.message || 'No se pudo cargar el catálogo.';
  } finally {
    loading.value = false;
  }
}

async function openVideo(id, silent = false) {
  detailLoading.value = true;
  detailError.value = '';

  try {
    const video = await getVideoById(id);
    selectedVideo.value = video;
    if (!silent) {
      interactionNote.value = '';
    }
  } catch (err) {
    detailError.value = err.message || 'No se pudo cargar el video.';
  } finally {
    detailLoading.value = false;
  }
}

async function loadCategory(category) {
  if (category === 'all') {
    currentVideos.value = [...allVideos.value];
    selectedVideo.value = currentVideos.value[0] || null;
    if (selectedVideo.value) {
      await openVideo(selectedVideo.value.id, true);
    }
    return;
  }

  categoryLoading.value = true;
  error.value = '';

  try {
    const videos = await getVideosByCategory(category);
    currentVideos.value = Array.isArray(videos) ? videos : [];
    selectedVideo.value = currentVideos.value[0] || null;

    if (selectedVideo.value) {
      await openVideo(selectedVideo.value.id, true);
    }
  } catch (err) {
    error.value = err.message || 'No se pudo filtrar por categoría.';
  } finally {
    categoryLoading.value = false;
  }
}

function handleInteractionAttempt() {
  interactionNote.value = props.guestMode
    ? 'Inicia sesión para interactuar con este video.'
    : 'Las funciones de Me gusta y comentarios se implementarán en la Serie III.';
}

watch(selectedCategory, (value) => {
  loadCategory(value);
});

onMounted(loadCatalog);
</script>

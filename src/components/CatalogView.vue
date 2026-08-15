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
        :current-user="currentUser"
        :notice="detailNotice"
        :show-login-action="showLoginAction"
        :busy-like="busy.like"
        :busy-comment="busy.comment"
        :busy-reply-id="busy.replyId"
        :busy-delete-id="busy.deleteId"
        :refresh-token="detailRefreshToken"
        @close="closeVideo"
        @guest-action="handleGuestAction"
        @like="handleToggleLike"
        @comment="handleCreateComment"
        @reply="handleCreateReply"
        @delete-comment="handleDeleteComment"
        @focus-comments="focusComments"
        @request-auth="$emit('request-auth', $event)"
      />
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import VideoCard from './VideoCard.vue';
import VideoDetail from './VideoDetail.vue';
import { getCategories, getVideoById, getVideos, getVideosByCategory } from '../services/videoService.js';
import { createVideoComment, deleteComment, replyToComment, toggleVideoLike } from '../services/interactionService.js';

const props = defineProps({
  guestMode: { type: Boolean, default: false },
  currentUser: { type: Object, default: null },
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
const detailNotice = ref('');
const showLoginAction = ref(false);
const detailRefreshToken = ref(0);
const busy = reactive({
  like: false,
  comment: false,
  replyId: null,
  deleteId: null,
});

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
  detailNotice.value = '';
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
  detailNotice.value = '';
  showLoginAction.value = false;
}

async function loadCategory(category) {
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

function focusComments() {
  detailNotice.value = '';
  showLoginAction.value = false;
}

function handleGuestAction(action) {
  detailNotice.value = action === 'comment'
    ? 'Debes iniciar sesión para comentar.'
    : 'Debes iniciar sesión para dar Me gusta.';
  showLoginAction.value = true;
}

async function refreshCurrentVideo() {
  if (!selectedVideo.value?.id) return;

  const refreshed = await getVideoById(selectedVideo.value.id);
  selectedVideo.value = refreshed;
}

async function handleToggleLike() {
  if (!selectedVideo.value || !props.currentUser) return;

  busy.like = true;
  detailNotice.value = '';
  showLoginAction.value = false;

  try {
    const response = await toggleVideoLike(selectedVideo.value.id, props.currentUser.carne);
    detailNotice.value = response?.mensaje || '';
    await refreshCurrentVideo();
    detailRefreshToken.value += 1;
  } catch (error) {
    detailNotice.value = error.message || 'No se pudo actualizar el Me gusta.';
  } finally {
    busy.like = false;
  }
}

async function handleCreateComment(texto) {
  if (!selectedVideo.value || !props.currentUser) return;

  busy.comment = true;
  detailNotice.value = '';

  try {
    const response = await createVideoComment(selectedVideo.value.id, props.currentUser.carne, texto);
    detailNotice.value = response?.mensaje || 'Comentario publicado.';
    await refreshCurrentVideo();
    detailRefreshToken.value += 1;
  } catch (error) {
    detailNotice.value = error.message || 'No se pudo publicar el comentario.';
  } finally {
    busy.comment = false;
  }
}

async function handleCreateReply(payload) {
  if (!selectedVideo.value || !props.currentUser) return;

  busy.replyId = payload.commentId;
  detailNotice.value = '';

  try {
    const response = await replyToComment(payload.commentId, props.currentUser.carne, payload.texto);
    detailNotice.value = response?.mensaje || 'Respuesta publicada.';
    await refreshCurrentVideo();
    detailRefreshToken.value += 1;
  } catch (error) {
    detailNotice.value = error.message || 'No se pudo publicar la respuesta.';
  } finally {
    busy.replyId = null;
  }
}

async function handleDeleteComment(commentId) {
  if (!selectedVideo.value || !props.currentUser) return;

  busy.deleteId = commentId;
  detailNotice.value = '';

  try {
    const response = await deleteComment(commentId, props.currentUser.carne);
    detailNotice.value = response?.mensaje || 'Comentario eliminado.';
    await refreshCurrentVideo();
    detailRefreshToken.value += 1;
  } catch (error) {
    detailNotice.value = error.status === 403
      ? 'No tienes permiso para eliminar este comentario.'
      : error.message || 'No se pudo eliminar el comentario.';
  } finally {
    busy.deleteId = null;
  }
}

watch(selectedCategory, (value) => {
  loadCategory(value);
});

watch(
  () => props.currentUser?.carne,
  () => {
    detailNotice.value = '';
    showLoginAction.value = false;
  },
);

onMounted(loadCatalog);
</script>

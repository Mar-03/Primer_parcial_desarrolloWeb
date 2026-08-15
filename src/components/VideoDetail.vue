<template>
  <aside class="video-detail">
    <div v-if="loading" class="state-box">Cargando video...</div>
    <div v-else-if="error" class="state-box error">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="video" class="detail-card">
      <video class="detail-player" :src="video.urlVideo" :poster="video.poster" controls playsinline />

      <div class="detail-content">
        <div class="video-card-topline">
          <span class="tag">{{ video.categoria }}</span>
          <span class="duration">{{ video.duracion }}</span>
        </div>
        <h3>{{ video.titulo }}</h3>
        <p>{{ video.descripcion }}</p>

        <div class="stats-grid">
          <div class="stat-box">
            <span>Likes</span>
            <strong>{{ video.likes }}</strong>
          </div>
          <div class="stat-box">
            <span>Comentarios</span>
            <strong>{{ Array.isArray(video.comentarios) ? video.comentarios.length : 0 }}</strong>
          </div>
        </div>

        <div class="interaction-panel">
          <p class="interaction-title">Interacciones</p>
          <div class="interaction-buttons">
            <button type="button" class="button button-secondary" @click="$emit('interact')">Me gusta</button>
            <button type="button" class="button button-secondary" @click="$emit('interact')">Comentarios</button>
          </div>
          <p class="interaction-hint">
            {{ guestMode ? 'Inicia sesión para interactuar con este video.' : 'Las interacciones se activarán en la Serie III.' }}
          </p>
        </div>
      </div>
    </div>
    <div v-else class="state-box empty">Selecciona un video para ver su detalle.</div>
  </aside>
</template>

<script setup>
defineProps({
  video: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  guestMode: { type: Boolean, default: false },
});

defineEmits(['interact']);
</script>

<template>
  <div v-if="video" class="video-modal-backdrop" @click.self="$emit('close')">
    <section class="video-modal">
      <button class="modal-close" type="button" @click="$emit('close')">Cerrar</button>

      <div v-if="loading" class="state-box">Cargando video...</div>
      <div v-else-if="error" class="state-box error">
        <p>{{ error }}</p>
      </div>
      <div v-else class="modal-content">
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
              <strong>{{ video.likes ?? 0 }}</strong>
            </div>
            <div class="stat-box">
              <span>Comentarios</span>
              <strong>{{ Array.isArray(video.comentarios) ? video.comentarios.length : 0 }}</strong>
            </div>
          </div>

          <div class="interaction-panel">
            <p class="interaction-title">Interacciones</p>
            <div class="interaction-buttons">
              <button type="button" class="button button-secondary" @click="$emit('interact', 'likes')">
                Me gusta
              </button>
              <button type="button" class="button button-secondary" @click="$emit('interact', 'comments')">
                Comentarios
              </button>
            </div>
            <p v-if="notice" class="interaction-note">{{ notice }}</p>
            <button v-if="showLoginAction" type="button" class="button" @click="$emit('request-auth', 'login')">
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  video: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  guestMode: { type: Boolean, default: false },
  notice: { type: String, default: '' },
  showLoginAction: { type: Boolean, default: false },
});

defineEmits(['close', 'interact', 'request-auth']);
</script>

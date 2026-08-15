<template>
  <article class="video-card">
    <button type="button" class="video-card-button" @click="$emit('select')">
      <img :src="video.poster" :alt="video.titulo" class="video-poster" />
      <div class="video-card-body">
        <div class="video-card-topline">
          <span class="tag">{{ video.categoria }}</span>
          <span class="duration">{{ video.duracion }}</span>
        </div>
        <h3>{{ video.titulo }}</h3>
        <p>{{ video.descripcion }}</p>
        <span class="card-link">Ver video</span>
      </div>
    </button>
  </article>
</template>

<script setup>
defineProps({
  video: { type: Object, required: true },
});

defineEmits(['select']);
</script>

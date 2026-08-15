<template>
  <article class="video-card" :class="{ active }">
    <button type="button" class="video-card-button" @click="$emit('select')">
      <img :src="video.poster" :alt="video.titulo" class="video-poster" />
      <div class="video-card-body">
        <div class="video-card-topline">
          <span class="tag">{{ video.categoria }}</span>
          <span class="duration">{{ video.duracion }}</span>
        </div>
        <h3>{{ video.titulo }}</h3>
        <p>{{ video.descripcion }}</p>
      </div>
    </button>
  </article>
</template>

<script setup>
defineProps({
  video: { type: Object, required: true },
  active: { type: Boolean, default: false },
});

defineEmits(['select']);
</script>

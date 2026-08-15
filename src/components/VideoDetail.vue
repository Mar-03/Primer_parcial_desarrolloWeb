<template>
  <div v-if="video" class="video-modal-backdrop" @click.self="$emit('close')">
    <section class="video-modal">
      <button class="modal-close" type="button" @click="$emit('close')">Cerrar</button>

      <div v-if="loading" class="state-box">Cargando video...</div>
      <div v-else-if="error" class="state-box error">
        <p>{{ error }}</p>
      </div>
      <div v-else class="modal-content">
        <div class="detail-header">
          <h3>{{ video.titulo }}</h3>
          <p class="detail-meta">
            <span>{{ video.categoria }}</span>
            <span>{{ video.duracion }}</span>
          </p>
        </div>

        <video class="detail-player" :src="video.urlVideo" :poster="video.poster" controls playsinline />

        <div class="detail-content">
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
              <button
                type="button"
                class="button button-secondary"
                :disabled="busyLike"
                @click="onLikeClick"
              >
                {{ isLikedByMe ? 'Quitar Me gusta' : 'Me gusta' }}
              </button>
              <button type="button" class="button button-secondary" @click="focusCommentBox">
                Comentarios
              </button>
            </div>
            <p v-if="notice" class="interaction-note">{{ notice }}</p>
            <button v-if="showLoginAction" type="button" class="button" @click="$emit('request-auth', 'login')">
              Iniciar sesión
            </button>
          </div>

          <section class="comments-section">
            <h4>Comentarios</h4>

            <div v-if="currentUser" ref="commentBoxRef" class="comment-form">
              <label class="toolbar-field">
                <span>Escribe un comentario</span>
                <textarea v-model="mainComment" rows="3" placeholder="Escribe tu comentario..." />
              </label>
              <button class="button" type="button" :disabled="busyComment || !mainComment.trim()" @click="publishComment">
                {{ busyComment ? 'Publicando...' : 'Publicar' }}
              </button>
            </div>

            <div v-else class="guest-comment-box">
              <p>Debes iniciar sesión para comentar.</p>
              <button type="button" class="button button-secondary" @click="showGuestLogin('comment')">
                Iniciar sesión
              </button>
            </div>

            <div v-if="!video.comentarios || video.comentarios.length === 0" class="state-box empty">
              <p>No hay comentarios todavía.</p>
            </div>

            <div v-else class="comments-list">
              <article v-for="comment in video.comentarios" :key="comment.id" class="comment-item">
                <div class="comment-main">
                  <div class="comment-header">
                    <strong>{{ comment.estudiante }}</strong>
                    <span>{{ comment.carne }}</span>
                  </div>
                  <p>{{ comment.texto }}</p>
                </div>

                <div class="comment-actions">
                  <button v-if="currentUser" type="button" class="text-button" @click="toggleReply(comment.id)">
                    {{ activeReplyId === comment.id ? 'Cancelar' : 'Responder' }}
                  </button>
                  <button
                    v-if="currentUser && currentUser.carne === comment.carne"
                    type="button"
                    class="text-button danger"
                    :disabled="busyDeleteId === comment.id"
                    @click="$emit('delete-comment', comment.id)"
                  >
                    {{ busyDeleteId === comment.id ? 'Eliminando...' : 'Eliminar' }}
                  </button>
                </div>

                <div v-if="currentUser && activeReplyId === comment.id" class="reply-form">
                  <label class="toolbar-field">
                    <span>Responder</span>
                    <textarea v-model="replyDrafts[comment.id]" rows="2" placeholder="Escribe tu respuesta..." />
                  </label>
                  <div class="reply-actions">
                    <button
                      class="button"
                      type="button"
                      :disabled="busyReplyId === comment.id || !replyDrafts[comment.id]?.trim()"
                      @click="publishReply(comment.id)"
                    >
                      {{ busyReplyId === comment.id ? 'Publicando...' : 'Publicar respuesta' }}
                    </button>
                    <button type="button" class="button button-secondary" @click="toggleReply(comment.id)">Cancelar</button>
                  </div>
                </div>

                <div v-if="Array.isArray(comment.respuestas) && comment.respuestas.length" class="replies-list">
                  <article v-for="reply in comment.respuestas" :key="reply.id" class="reply-item">
                    <div class="comment-header">
                      <strong>{{ reply.estudiante }}</strong>
                      <span>{{ reply.carne }}</span>
                    </div>
                    <p>{{ reply.texto }}</p>

                    <div class="comment-actions">
                      <button
                        v-if="currentUser && currentUser.carne === reply.carne"
                        type="button"
                        class="text-button danger"
                        :disabled="busyDeleteId === reply.id"
                        @click="$emit('delete-comment', reply.id)"
                      >
                        {{ busyDeleteId === reply.id ? 'Eliminando...' : 'Eliminar' }}
                      </button>
                    </div>
                  </article>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';

const props = defineProps({
  video: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  guestMode: { type: Boolean, default: false },
  currentUser: { type: Object, default: null },
  notice: { type: String, default: '' },
  showLoginAction: { type: Boolean, default: false },
  busyLike: { type: Boolean, default: false },
  busyComment: { type: Boolean, default: false },
  busyReplyId: { type: [Number, String, null], default: null },
  busyDeleteId: { type: [Number, String, null], default: null },
  refreshToken: { type: Number, default: 0 },
});

const emit = defineEmits([
  'close',
  'guest-action',
  'like',
  'comment',
  'reply',
  'delete-comment',
  'focus-comments',
  'request-auth',
]);

const mainComment = ref('');
const activeReplyId = ref(null);
const replyDrafts = reactive({});
const commentBoxRef = ref(null);

const isLikedByMe = computed(() => {
  if (!props.currentUser?.carne || !Array.isArray(props.video?.usuariosLikes)) return false;
  return props.video.usuariosLikes.includes(props.currentUser.carne);
});

function onLikeClick() {
  if (props.guestMode) {
    emit('guest-action', 'like');
    return;
  }

  emit('like');
}

function showGuestLogin(action) {
  emit('guest-action', action);
}

function focusCommentBox() {
  if (props.guestMode) {
    showGuestLogin('comment');
    return;
  }

  emit('focus-comments');
  commentBoxRef.value?.querySelector('textarea')?.focus();
}

function publishComment() {
  const text = mainComment.value.trim();
  if (!text) return;
  emit('comment', text);
}

function toggleReply(commentId) {
  if (activeReplyId.value === commentId) {
    activeReplyId.value = null;
    replyDrafts[commentId] = '';
    return;
  }

  activeReplyId.value = commentId;
  replyDrafts[commentId] = replyDrafts[commentId] || '';
}

function publishReply(commentId) {
  const text = (replyDrafts[commentId] || '').trim();
  if (!text) return;
  emit('reply', { commentId, texto: text });
}

function resetComposerState() {
  mainComment.value = '';
  activeReplyId.value = null;

  Object.keys(replyDrafts).forEach((key) => {
    replyDrafts[key] = '';
  });
}

watch(
  () => props.refreshToken,
  () => {
    resetComposerState();
  },
);

watch(
  () => props.currentUser?.carne,
  () => {
    resetComposerState();
  },
);
</script>

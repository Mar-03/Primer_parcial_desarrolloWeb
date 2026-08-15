import { request } from './api.js';

export function toggleVideoLike(videoId, carne) {
  return request(`/api/interaccionvideo/${encodeURIComponent(videoId)}/like`, {
    method: 'POST',
    body: JSON.stringify({ carne }),
  });
}

export function createVideoComment(videoId, carne, texto) {
  return request(`/api/interaccionvideo/${encodeURIComponent(videoId)}/comentario`, {
    method: 'POST',
    body: JSON.stringify({ carne, texto }),
  });
}

export function replyToComment(commentId, carne, texto) {
  return request(`/api/interaccionvideo/comentario/${encodeURIComponent(commentId)}/responder`, {
    method: 'POST',
    body: JSON.stringify({ carne, texto }),
  });
}

export function deleteComment(commentId, carne) {
  return request(`/api/interaccionvideo/comentario/${encodeURIComponent(commentId)}?carne=${encodeURIComponent(carne)}`, {
    method: 'DELETE',
  });
}

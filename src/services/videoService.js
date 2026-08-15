import { request } from './api.js';

export function getVideos() {
  return request('/api/videos');
}

export function getVideoById(id) {
  return request(`/api/videos/${encodeURIComponent(id)}`);
}

export function getCategories() {
  return request('/api/videos/categorias');
}

export function getVideosByCategory(categoryName) {
  return request(`/api/videos/categoria/${encodeURIComponent(categoryName)}`);
}

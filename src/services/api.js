const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined;

export const API_BASE_URL = viteEnv?.VITE_API_BASE_URL || 'https://backvideo-hpevgdenh7hygvfm.canadacentral-01.azurewebsites.net';

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = getApiErrorMessage(response.status, data);
    throw new Error(message);
  }

  return data;
}

function getApiErrorMessage(status, data) {
  const rawMessage = typeof data === 'string' ? data : data?.mensaje || data?.message || data?.error || '';
  const lower = String(rawMessage).toLowerCase();

  if (status === 409 || lower.includes('registrado') || lower.includes('duplicado')) {
    return 'El carné o correo ya se encuentra registrado.';
  }

  if (status === 400) {
    return rawMessage || 'Los datos enviados no son válidos.';
  }

  if (status === 401) {
    return 'Credenciales incorrectas.';
  }

  if (status === 403) {
    return 'No tienes permiso para realizar esta acción.';
  }

  if (status >= 500) {
    return 'Ocurrió un error en el servidor. Intenta nuevamente.';
  }

  return rawMessage || 'No se pudo completar la solicitud.';
}

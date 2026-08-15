const CARNE_REGEX = /^\d{4}-\d{2}-\d{5}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN_REGEX = /^\d+$/;

export function validateRegistration(form) {
  const errors = {};

  if (!CARNE_REGEX.test(form.carne.trim())) {
    errors.carne = 'El carné debe tener el formato 0000-00-00000.';
  }

  if (!form.estudiante.trim()) {
    errors.estudiante = 'El nombre del estudiante es obligatorio.';
  }

  if (!EMAIL_REGEX.test(form.correo.trim())) {
    errors.correo = 'Ingresa un correo válido.';
  }

  if (!PIN_REGEX.test(form.password.trim())) {
    errors.password = 'El PIN debe contener solo números.';
  }

  if (!form.password.trim()) {
    errors.password = 'El PIN es obligatorio.';
  }

  return errors;
}

export function validateLogin(form) {
  const errors = {};

  if (!form.usuario.trim()) {
    errors.usuario = 'El usuario es obligatorio.';
  } else if (!CARNE_REGEX.test(form.usuario.trim()) && !EMAIL_REGEX.test(form.usuario.trim())) {
    errors.usuario = 'Ingresa un carné o correo válidos.';
  }

  if (!form.password.trim()) {
    errors.password = 'La contraseña / PIN es obligatoria.';
  } else if (!PIN_REGEX.test(form.password.trim())) {
    errors.password = 'El PIN debe contener solo números.';
  }

  return errors;
}

import { request } from './api.js';

function normalizeUser(student) {
  return {
    carne: student.carne,
    estudiante: student.nombre || student.estudiante || '',
    correo: student.correo,
  };
}

export async function registerStudent(payload) {
  const data = await request('/api/estudiantes/registrar', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return {
    message: data?.mensaje || 'Registro exitoso.',
  };
}

export async function loginStudent(payload) {
  const data = await request('/api/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const student = data?.estudiante;

  if (!student) {
    throw new Error('La API no devolvió la información del estudiante.');
  }

  return {
    message: data?.mensaje || 'Inicio de sesión exitoso.',
    user: normalizeUser(student),
  };
}

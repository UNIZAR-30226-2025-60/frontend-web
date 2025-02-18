export const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://backend-dcy8.onrender.com'  // URL de Render en producción
  : 'http://localhost:3000';           // URL local en desarrollo

export const API_URL = `${BASE_URL}/api`;
export const AUTH_URL = `${BASE_URL}/auth`;

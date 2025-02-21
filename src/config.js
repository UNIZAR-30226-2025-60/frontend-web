import axios from "axios";

const API_URL =
  window.location.hostname === "localhost"
    ? process.env.VUE_APP_API_URL || "http://localhost:3000/api"
    : process.env.VUE_APP_RENDER_API_URL || "https://backend-dcy8.onrender.com/api";

const AUTH_URL =
  window.location.hostname === "localhost"
    ? process.env.VUE_APP_AUTH_URL || "http://localhost:3000/auth"
    : process.env.VUE_APP_RENDER_AUTH_URL || "https://backend-dcy8.onrender.com/auth";

const GOOGLE_REDIRECT_URI =
  window.location.hostname === "localhost"
    ? process.env.VUE_APP_GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/google/callback"
    : process.env.VUE_APP_RENDER_GOOGLE_REDIRECT_URI || "https://backend-dcy8.onrender.com/auth/google/callback";

// Configuración de Axios para reutilizar en todas las peticiones, esto es lo que comparto a los componentes vue
const apiClient = axios.create({
  baseURL: API_URL, // Se usa en las peticiones a la API
  withCredentials: true, // Para mantener las sesiones activas
});

export { API_URL, AUTH_URL, GOOGLE_REDIRECT_URI, apiClient };


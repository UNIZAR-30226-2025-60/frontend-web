<template>
  <!-- Escena principal que contiene el libro -->
  <div class="book-scene">  
    <!-- Contenedor principal con clases dinámicas para estado
      open: clase para saber si el libro está abierto
      page-turn: clase para animación al cambiar de página
      login-page: clase para cuando estamos en el inicio de sesión
      register-page: clase para cuando estamos en el registro
    -->
    <div class="book-container" :class="{  
      'open': isOpen,  
      'page-turn': isPageTurning, 
      'login-page': page === 'login', 
      'register-page': page === 'register' 
    }">
      <!-- Estructura general del libro -->
      <div class="book">
        <!-- PORTADA DEL LIBRO -->
        <div class="cover" @click="openBook">  <!-- Portada clickeable -->
          <img src="@/assets/portada-libro.png" alt="Portada" class="cover-image" />
          <div class="book-spine"></div>  <!-- Simulación del lomo del libro -->
        </div>

        <!-- Contenido de las páginas internas -->
        <div class="content-wrapper">
          <!-- Página del índice -->
          <div class="content index" :class="{ 'active': page === 'index' }">
            <div class="page-content">
              <h2>Índice</h2>
              <ul class="menu-list">
                <li @click="goToPage('login')">Iniciar sesión</li>
                <li @click="goToPage('register')">Registrarse</li>
              </ul>
            </div>
          </div>

          <!-- Página de inicio de sesión -->
          <div class="content login" :class="{ 'active': page === 'login' }">
            <div class="page-content">
              <h2>Iniciar Sesión</h2>
              <form @submit.prevent="login">
                <div class="form-group">
                  <label>Correo electrónico:</label>
                  <input type="email" v-model="email" placeholder="ejemplo@ejemplo.com" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Contraseña:</label>
                  <input type="password" v-model="password" placeholder="1234abc@" class="form-control" />
                </div>
                <button type="submit" class="btn-primary">Confirmar</button>
              </form>

              <!-- Separador visual -->
              <div class="divider">
                <span>o</span>
              </div>

              <!-- Botón de inicio de sesión con Google -->
              <button class="google-btn" @click="loginWithGoogle">
                <img src="@/assets/logo-google.png" alt="Google logo" />
                Continuar con Google
              </button>

              <!-- Enlace para volver al índice -->
              <p class="back-link" @click="goToPage('index')">← Volver al índice</p>
            </div>
          </div>
          
          <!-- Página de registro -->
          <div class="content register" :class="{ 'active': page === 'register' }">
            <div class="page-content">
              <h2>Registrarse</h2>
              <form @submit.prevent="registerUsuario">
                <div class="form-group">
                  <label>Nombre:</label>
                  <input type="text" v-model="name" placeholder="miNombre" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Correo electrónico</label>
                  <input type="email" v-model="email" placeholder="ejemplo@ejemplo.com" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Contraseña:</label>
                  <input type="password" v-model="password" placeholder="1234abc@" class="form-control" />
                </div>
                <button type="submit" class="btn-primary">Confirmar</button>
              </form>

              <!-- Enlace para volver al índice -->
              <p class="back-link" @click="goToPage('index')">← Volver al índice</p>
            </div>
          </div>
        </div> 
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useRouter } from "vue-router";
import { apiClient, GOOGLE_REDIRECT_URI } from '../config';

export default {
  setup() {
    const router = useRouter();  // Hook para navegación
    return { router };
  },

  data() {
    return {
      isOpen: false,  // Indica el estado del libro (cerrado o abierto)
      isPageTurning: false, // Controla el estado de la animación de cambio de página
      page: 'index', // Página actual 
      email: '',  // Email del usuario
      password: '',  // Contraseña
      name: ''  // Nombre (solo registro)
    };
  },

  methods: {
    // Abre el libro al hacer clic en la portada
    openBook() {
      if (!this.isOpen) {
        this.isOpen = true;
        this.page = 'index'; // Muestra el índice
      }
    },

    // Cambia de página con animación
    async goToPage(newPage) {
      if (this.page === newPage || !this.isOpen) return;
      
      this.isPageTurning = true;  // Inicia animación
      await new Promise(resolve => setTimeout(resolve, 300));
      this.page = newPage; // Cambia de página después de una espera breve
      
      setTimeout(() => {
        this.isPageTurning = false;  // Fin de animación
      }, 600);
    },
    
    // Intenta iniciar sesión con el correo y contraseña introducidos por el usuario
    async login() {
      try {
        const response = await apiClient.post("/usuarios/login", {
          correo: this.email,
          contrasena: this.password,
        });
        alert("Inicio de sesión exitoso");
        this.$router.push("/");  // Redirecciona a home
      } catch (error) {
        alert("Error al iniciar sesión");
      }
    },

    // Intenta registrar al usuario con el correo, nombre y contraseña introducidos
    async registerUsuario() {
      try {
        const response = await apiClient.post("/registro", {
          correo: this.email,
          nombre: this.name,
          contrasena: this.password,
        });
        alert("Usuario registrado exitosamente");
        this.$router.push("/");  // Redirecciona a home
      } catch (error) {
        alert("Error al registrar usuario");
      }
    },

    // Redirige al usuario a Google OAuth para iniciar sesión con la cuenta de Google
    loginWithGoogle() {
      window.location.href = GOOGLE_REDIRECT_URI;
    },
  }
};
</script>

<style scoped>
.book-scene {
  /* Ocupa toda la pantalla, centra el contenido y establece fondo claro (papel) */
  height: 100vh; 
  display: flex;  
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #f7f4ef;
  overflow: hidden; 
}

.book-container {
  /* Contenedor principal del libro con perspectiva 3D y animaciones suaves */
  position: relative;
  width: 300px;  
  height: 480px; 
  perspective: 1500px;
  transform-style: preserve-3d;
  margin: 0 auto;
}

.book {
  /* Define el tamaño y posicionamiento 3D del libro cerrado */
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  border-radius: 2px 15px 15px 2px;
}

.cover {
  /* Estilo de la portada del libro: con sombra, imagen y clickeable */
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 2px 15px 15px 2px;
  transform-origin: left;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  z-index: 10;
  overflow: hidden;
}

.cover-image {
  /* Imagen de la portada: tamaño completo y bordes redondeados */
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.book-spine {
  /* Lomo del libro: una franja vertical que simula profundidad */
  position: absolute;
  left: 0;
  width: 15px;
  height: 100%;
  background: linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.1));
  transform: rotateY(-20deg) translateX(-8px);
  z-index: 9;
}

.content-wrapper {
  /* Contenedor de todas las páginas del libro (índice, login, registro) */
  position: absolute;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  z-index: 7;
  border-radius: 0 15px 15px 0; 
  overflow: hidden;
}

.content {
  /* Página por defecto: escondida */
  position: absolute;
  width: 100%;
  height: 100%;
  background: #f8f1e4;
  padding: 20px; 
  border-radius: 0 15px 15px 0;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  transform-origin: left;
  transition: transform 0.5s ease-out, opacity 0.3s ease-out;
  opacity: 0;
  visibility: hidden;
  top: 0;
  left: 0;
  overflow: auto;
}

.content.active {
  /* Página activa: visible con transición suave */
  opacity: 1;
  visibility: visible;
  transform: rotateY(0);
}

.page-content {
  /* Espacio donde van los formularios y textos dentro de cada página */
  height: 100%;
  padding-right: 10px;
  scrollbar-width: thin;
}

.page-content::-webkit-scrollbar {
  width: 3px;
}

.page-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.page-content::-webkit-scrollbar-thumb {
  background: rgba(107, 68, 35, 0.3);
  border-radius: 10px;
}

h2 {
  color: #432818;
  margin-bottom: 1rem; 
  text-align: center;
  font-size: 1.5rem; 
  font-weight: 700;
  font-family: 'Georgia', serif;
  border-bottom: 2px solid rgba(107, 68, 35, 0.2);
  padding-bottom: 8px;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin-top: 1.5rem; 
}

.menu-list li {
  /* Opciones del menú de índice: estilo similar a enlace con hover */
  padding: 0.8rem; 
  margin-bottom: 0.8rem; 
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
  text-align: center;
  font-size: 1.1rem; 
  background-color: rgba(107, 68, 35, 0.05);
  border: 1px solid rgba(107, 68, 35, 0.1);
}

.menu-list li:hover {
  background-color: rgba(107, 68, 35, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.form-group {
  /* Agrupa etiqueta y campo de entrada, con espacio entre ellos */
  margin-bottom: 1rem; 
}

label {
  display: block;
  margin-bottom: 0.4rem; 
  color: #432818;
  font-weight: 600;
  font-size: 0.85rem;
}

.form-control {
  /* Estilo base para los campos de texto: padding, borde redondeado */
  width: 100%;
  padding: 0.65rem;
  border: 1px solid #d4c5b9;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #2a1810;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.form-control:focus {
  outline: none;
  border-color: #6b4423;
  box-shadow: 0 0 0 2px rgba(107, 68, 35, 0.2);
}

.btn-primary {
  /* Botón principal (confirmar): color marrón, borde, sombra, transición */
  width: 100%;
  padding: 0.75rem; 
  background: linear-gradient(to right, #6b4423, #8c5a30);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  font-size: 0.95rem; 
  letter-spacing: 0.5px;
}

.btn-primary:hover {
  background: linear-gradient(to right, #5a381d, #7c4e29);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary:active {
  transform: translateY(0);
}

.divider {
  /* Línea divisora con texto 'o' en el centro */
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.2rem 0; 
  color: #6b4423;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(107, 68, 35, 0.2);
}

.divider span {
  padding: 0 10px;
  font-size: 0.85rem; 
}

.google-btn {
  /* Botón con logo de Google: colores claros, ícono a la izquierda */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.65rem; 
  background: white;
  border: 1px solid #d4c5b9;
  border-radius: 6px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.google-btn img {
  /* Logo de Google dentro del botón: pequeño y espaciado */
  width: 18px; 
  height: 18px; 
  margin-right: 0.6rem; 
}

.google-btn:hover {
  background: #f8f8f8;
  border-color: #c4b5a9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.back-link {
   /* Estilo tipo enlace textual, marrón, con cambio de color al pasar el cursor por encima */
  text-align: center;
  margin-top: 1.2rem; 
  color: #6b4423;
  cursor: pointer;
  font-size: 0.85rem; 
  transition: color 0.3s;
}

.back-link:hover {
  color: #432818;
  text-decoration: underline;
}

.open .cover {
  transform: rotateY(-100deg); 
  box-shadow: -8px 8px 20px rgba(0, 0, 0, 0.1); 
}

.page-turn .content {
  transition: transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1), opacity 0.3s ease-in-out;
}

.page-turn .content:not(.active) {
  transform: rotateY(-180deg);
}

/* Ajustamos el responsive para pantallas más pequeñas */
@media (max-width: 768px) {
  .book-container {
    width: 250px; 
    height: 400px;
  }
  
  .content {
    padding: 15px;
  }
  
  h2 {
    font-size: 1.3rem;
  }
}
</style>
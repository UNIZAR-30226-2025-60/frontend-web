<template>
  <div class="book-scene">
    <div class="book-container" :class="{ 
      'open': isOpen, 
      'page-turn': isPageTurning, 
      'login-page': page === 'login', 
      'register-page': page === 'register' 
    }">
      <div class="book">
        <!-- PORTADA DEL LIBRO -->
        <div class="cover" @click="openBook">
          <img src="@/assets/portada-libro.png" alt="Portada" class="cover-image" />
          <div class="book-spine"></div>
        </div>

        <!-- Contenido -->
        <div class="content-wrapper">
          <!-- Índice -->
          <div class="content index" :class="{ 'active': page === 'index' }">
            <div class="page-content">
              <h2>Índice</h2>
              <ul class="menu-list">
                <li @click="goToPage('login')">Iniciar sesión</li>
                <li @click="goToPage('register')">Registrarse</li>
              </ul>
            </div>
          </div>

          <!-- Login -->
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
              <div class="divider">
                <span>o</span>
              </div>
              <button class="google-btn" @click="loginWithGoogle">
                <img src="@/assets/logo-google.png" alt="Google logo" />
                Continuar con Google
              </button>
              <p class="back-link" @click="goToPage('index')">← Volver al índice</p>
            </div>
          </div>
          
          <!-- Register -->
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
    const router = useRouter();
    return { router };
  },

  data() {
    return {
      isOpen: false,
      isPageTurning: false,
      page: 'index',
      email: '',
      password: '',
      name: ''
    };
  },

  methods: {
    openBook() {
      if (!this.isOpen) {
        this.isOpen = true;
        this.page = 'index'; // Abrir el libro en el índice
      }
    },

    async goToPage(newPage) {
      if (this.page === newPage || !this.isOpen) return;
      
      this.isPageTurning = true;
      await new Promise(resolve => setTimeout(resolve, 300));
      this.page = newPage;
      
      setTimeout(() => {
        this.isPageTurning = false;
      }, 600);
    },
    
    async login() {
      try {
        const response = await apiClient.post("/usuarios/login", {
          correo: this.email,
          contrasena: this.password,
        });
        console.log("Correo: ", response.data.correo);
        console.log("Contraseña:", response.data.contrasena);
        console.log("Usuario que ha iniciado sesión:", response.data);
        alert("Inicio de sesión exitoso");
        this.$router.push("/");
      } catch (error) {
        console.error("Error al iniciar sesión con usuario:", error);
        alert("Error al iniciar sesión");
      }
    },
    async registerUsuario() {
      try {
        const response = await apiClient.post("/registro", {
          correo: this.email,
          nombre: this.name,
          contrasena: this.password,
        });
        console.log("Usuario registrado:", response.data);
        alert("Usuario registrado exitosamente");
        this.$router.push("/");
      } catch (error) {
        console.error("Error al registrar usuario:", error);
        alert("Error al registrar usuario");
      }
    },
    loginWithGoogle() {
      window.location.href = GOOGLE_REDIRECT_URI;
    },
  }
};
</script>

<style scoped>
.book-scene {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f7f4ef;
}

.book-container {
  position: relative;
  width: 400px;
  height: 600px;
  perspective: 2000px;
  transform-style: preserve-3d;
  margin: 0 auto;
}

.book {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.cover {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 2px 20px 20px 2px;
  transform-origin: left;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  z-index: 10;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.book-spine {
  position: absolute;
  left: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.1));
  transform: rotateY(-20deg) translateX(-10px);
  z-index: 9;
}

.content-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  z-index: 7;
}

.content {
  position: absolute;
  width: 95%;
  height: 95%;
  background: linear-gradient(135deg, #f8f1e4 0%, #f0e6d2 100%);
  padding: 30px;
  border-radius: 0 15px 15px 0;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  transform-origin: left;
  transition: transform 0.5s ease-out, opacity 0.3s ease-out;
  opacity: 0;
  visibility: hidden;
  top: 2.5%;
  left: 2.5%;
}

.content.active {
  opacity: 1;
  visibility: visible;
  transform: rotateY(0);
}

.page-content {
  height: 100%;
  overflow-y: auto;
  padding-right: 10px;
  scrollbar-width: thin;
}

.page-content::-webkit-scrollbar {
  width: 4px;
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
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  font-family: 'Georgia', serif;
  border-bottom: 2px solid rgba(107, 68, 35, 0.2);
  padding-bottom: 10px;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin-top: 2rem;
}

.menu-list li {
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
  text-align: center;
  font-size: 1.2rem;
  background-color: rgba(107, 68, 35, 0.05);
  border: 1px solid rgba(107, 68, 35, 0.1);
}

.menu-list li:hover {
  background-color: rgba(107, 68, 35, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #432818;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d4c5b9;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #2a1810;
  transition: all 0.3s;
  font-size: 0.95rem;
}

.form-control:focus {
  outline: none;
  border-color: #6b4423;
  box-shadow: 0 0 0 2px rgba(107, 68, 35, 0.2);
}

.btn-primary {
  width: 100%;
  padding: 0.85rem;
  background: linear-gradient(to right, #6b4423, #8c5a30);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  font-size: 1rem;
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
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
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
  font-size: 0.9rem;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  background: white;
  border: 1px solid #d4c5b9;
  border-radius: 6px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.google-btn img {
  width: 20px;
  height: 20px;
  margin-right: 0.75rem;
}

.google-btn:hover {
  background: #f8f8f8;
  border-color: #c4b5a9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.back-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #6b4423;
  cursor: pointer;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.back-link:hover {
  color: #432818;
  text-decoration: underline;
}

.open .cover {
  transform: rotateY(-110deg);
  box-shadow: -10px 10px 30px rgba(0, 0, 0, 0.1);
}

.page-turn .content {
  transition: transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1), opacity 0.3s ease-in-out;
}

.page-turn .content:not(.active) {
  transform: rotateY(-180deg);
}

@media (max-width: 768px) {
  .book-container {
    width: 300px;
    height: 500px;
  }
  
  .content {
    padding: 20px;
  }
  
  h2 {
    font-size: 1.5rem;
  }
}
</style>
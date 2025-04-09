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
              <h3>Índice</h3>
              <ul>
                <li @click="goToPage('login')">Iniciar Sesión</li>
                <li @click="goToPage('register')">Registrarse</li>
              </ul>
            </div>
          </div>

          <!-- Login -->
          <div class="content login" :class="{ 'active': page === 'login' }">
            <div class="page-content">
              <h3>Iniciar Sesión</h3>
              <form @submit.prevent="login">
                <div class="form-group">
                  <label>Correo electrónico:</label>
                  <input type="email" v-model="email" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Contraseña:</label>
                  <input type="password" v-model="password" class="form-control" />
                </div>
                <button type="submit" class="btn-primary">Confirmar</button>
              </form>
              <button class="google-btn" @click="loginWithGoogle">
                <img src="@/assets/logo-google.png" alt="Google logo" />
                Continuar con Google
              </button>
            </div>
          </div>
          <div class="content register" :class="{ 'active': page === 'register' }">
            <div class="page-content">
              <h3>Registrarse</h3>
              <form @submit.prevent="registerUsuario">
                <div class="form-group">
                  <label>Nombre:</label>
                  <input type="text" v-model="name" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Correo electrónico</label>
                  <input type="email" v-model="email" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Contraseña:</label>
                  <input type="password" v-model="password" class="form-control" />
                </div>
                <button type="submit" class="btn-primary">Confirmar</button>
              </form>
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
import { apiClient, GOOGLE_REDIRECT_URI } from '../config'; // Importamos

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
  height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.book-container {
  position: relative;
  width: 400px;
  height: 600px;
  perspective: 2000px;
  transform-style: preserve-3d;
}

.book {
  position: relative;
  width: 128%;
  height: 128%;
  transform-style: preserve-3d;
  transition: transform 0.5s;
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

.index {
  position: absolute;
  width: 65%; 
  height: 62.5%; 
  background: #f8f1e4;
  padding: 40px;
  border-radius: 1px 15px 15px 1px;
  transform-origin: left;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  z-index: 5;
  top: 19%; 
  left: 17%;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover; 
}

.book-spine {
  position: absolute;
  left: 0;
  width: 40px;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  transform: rotateY(-20deg) translateX(-20px);
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
  width: 65%;
  height: 62.5%;
  background: #f8f1e4;
  padding: 40px;
  border-radius: 1px 15px 15px 1px;
  box-shadow: -5px 0 10px rgba(0, 0, 0, 0.1);
  transform-origin: left;
  transition: transform 0.5s ease-out;
  opacity: 0;
  visibility: hidden;
  top: 19%;
  left: 17%;
}

.content.active {
  opacity: 1;
  visibility: visible;
  transform: rotateY(0);
}

.open .cover {
  transform: rotateY(-125deg);
}

.page-turn .content {
  transition: transform 0.6s ease-in-out, opacity 0.3s ease-in-out;
}

.page-turn .content.active {
  transform: rotateY(0);
}

.page-turn .content:not(.active) {
  transform: rotateY(-180deg);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #432818;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d4c5b9;
  border-radius: 4px;
  background: #fff;
  color: #2a1810;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: #6b4423;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #432818;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background: white;
  border: 1px solid #d4c5b9;
  border-radius: 4px;
  color: #2a1810;
  cursor: pointer;
  transition: background 0.3s;
}

.google-btn img {
  width: 24px;
  height: 24px;
  margin-right: 0.75rem;
}

.google-btn:hover {
  background: #f8f8f8;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s;
}

li:hover {
  background: rgba(107, 68, 35, 0.1);
}

h3 {
  color: #432818;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.5rem;
}

.open .cover {
  transform: rotateY(-125deg);
}
</style>
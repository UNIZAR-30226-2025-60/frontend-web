<template>
    <div class="book-container" :class="{ 'open': isOpen }">
      <div class="book">
        <div class="cover" @click="openBook"></div>
        <div class="content">
          <h3>Iniciar Sesión</h3>
          <form @submit.prevent="registerUsuario">
            <div class="mb-3">
              <label class="form-label mt-3">Nombre</label>
              <input type="text" class="form-control" v-model="name" />
              <label class="form-label">Email</label>
              <input type="email" class="form-control" v-model="email" />
            </div>
            <div class="mb-3">
              <label class="form-label">Contraseña</label>
              <input type="password" class="form-control" v-model="password" />
            </div>
            <button type="submit" class="btn btn-primary">Ingresar</button>
          </form>
          <button class="google-btn mt-3" @click="loginWithGoogle">
            <img src="@/assets/logo-google.png" alt="Google logo" />
            Continuar con Google
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";

  export default {
    data() {
      return {
        isOpen: false,
        name: "",
        email: "",
        password: "",
      };
    },
    methods: {
      openBook() {
        this.isOpen = true; // Cuando el usuario abrá el libro, isOpen = true y el contenido se mostrará
      },
      login() {
        console.log(`Iniciando sesión con: ${this.email} / ${this.password}`);
      },
      async registerUsuario() {
        try{
          const response = await axios.post('http://localhost:3000/api/usuarios/registro', {
            correo: this.email,
            nombre: this.name,
            contrasena: this.password
          });
          console.log('Usuario registrado:', response.data);
          alert('Usuario registrado exitosamente');
        } catch (error) {
          console.error('Error al registrar usuario:', error);
          alert(`Error al registrar usuario, desde LoginComponent: ${error.response ? error.response.data : error.message}`);
        }
      },
      loginWithGoogle() {
        console.log("Iniciar sesión con Google");
        window.location.href = "http://localhost:3000/auth/google"; // Redirige al backend
      },
    },
  };
  </script>
  
  <style scoped>
  .book-container {
    position: relative;
    width: 300px;
    height: 400px;
    perspective: 1000px;
    margin: auto;
    margin-top: 200px;
  }
  .book {
    width: 100%;
    height: 100%;
    position: absolute;
    transform-style: preserve-3d;
    transition: transform 1s;
  }
  .cover {
    position: absolute;
    width: 100%;
    height: 100%;
    background: url("@/assets/libro.jpg") no-repeat center;
    background-size: cover;
    border-radius: 5px;
    transform-origin: left;
    transition: transform 1s;
  }
  .content {
    position: absolute;
    width: 100%;
    height: 100%;
    background: white;
    padding: 20px;
    box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.3);
    display: none;
  }
  .open .cover {
    transform: rotateY(-160deg);
  }
  .open .content {
    display: block;
  }
  .google-btn img {
    width: 40px;
    height: 40px;
    margin-right: 10px;
    border-radius: 20px;
  }
  </style>
  
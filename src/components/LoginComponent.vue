<template>
  <div class="book-container" :class="{ 'open': isOpen, 'login-page': page === 'login', 'register-page': page === 'register' }">
    <div class="book">
      <div class="cover" @click="openBook(nPagina)"></div>
      
      <div class="content index" v-if="page === 'index'">
        <h3>Índice</h3>
        <ul>
          <li @click="goToPage('login')">Iniciar Sesión</li>
          <li @click="goToPage('register')">Registrarse</li>
          <li @click="goToApp">Ir a la app</li>
        </ul>
      </div>

      <div class="content login" v-if="page === 'login'">
        <h3>Iniciar Sesión</h3>
        <form @submit.prevent="login">
          <label class="form-label">Email</label>
          <input type="email" placeholder="Email" v-model="email" />
          <label class="form-label mt-2">Contraseña</label>
          <input type="password" placeholder="Contraseña" v-model="password" />
          <button type="submit">Ingresar</button>
        </form>
        <button class="google-btn mt-3" @click="loginWithGoogle">
          <img src="@/assets/logo-google.png" alt="Google logo" />
          Continuar con Google
        </button>
      </div>

      <div class="content register" v-if="page === 'register'">
        <h3>Registrarse</h3>
        <form @submit.prevent="registerUsuario">
          <input type="text" placeholder="Nombre" v-model="name" />
          <input type="email" placeholder="Email" v-model="email" />
          <input type="password" placeholder="Contraseña" v-model="password" />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useRouter } from "vue-router"; 

export default {
  setup() {
    const router = useRouter();
    return { router };
  },

  data() {
    return {
      isOpen: false,
      page: 'index',
      email: '',
      password: '',
      name: ''
    };
  },
  methods: {
    openBook() {
      this.isOpen = true;
    },
    goToPage(page) {
      this.page = page;
    },
    goToApp() {
      this.$router.push('/inicio');
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

        window.location.href = 'http://localhost:8081/inicio'; // Redirigo al inicio (de momento, cuando tengamos la pantalla correspondiente a esa irá)
      } catch (error) {
        console.error(`Error al registrar usuario:${error.response ? error.response.data : error.message}`, error);
        alert('Error al registrar usuario');
      }
    },
    loginWithGoogle() {
      console.log("Iniciar sesión con Google");
      window.location.href = "http://localhost:3000/auth/google"; // Redirige al backend
    }
  }
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
.open .cover { 
transform: rotateY(-160deg); 
}
.index, .login, .register { 
display: none; 
}
.open .index, .login-page .login, .register-page .register { 
display: block; 
}
.google-btn img {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 20px;
}
</style>
  
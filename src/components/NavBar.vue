<template>
  <nav class="navbar navbar-expand-lg" :class="navbarTheme">
    <div class="container-fluid">
      <a class="navbar-brand" href="#" @click="goToInicio">
        <div class="logo-wrapper">
          <img :src="cambiarLogo" alt="Bookly" />
        </div>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mb-2 mb-lg-0 ms-auto">

          <!-- Chatbot (coincide con name: "Chatbot" en index.js) -->
          <li  v-if="user != null" class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'Chatbot' }"
               @click="goToChatBot">
               ChatBot
            </a>
          </li>

          <!-- Foro (name: "Foro") -->
          <li class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'Foro' }"
               @click="goToForo">
               Foro
            </a>
          </li>

          <!-- Estadísticas (name: "Estadisticas") -->
          <li  v-if="user != null" class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'Estadisticas' }"
               @click="goToEstadisticas">
               Estadísticas
            </a>
          </li>

          <!-- Listas Públicas (name: "Listas" con param privacidad="ListasPublicas") -->
          <li class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'Listas' && activeParams.privacidad === 'ListasPublicas' }"
               @click="goToListas">
               Listas Públicas
            </a>
          </li>

          <!-- Mis Listas (name: "Listas" con param privacidad="MisListas") -->
          <li  v-if="user != null" class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'Listas' && activeParams.privacidad === 'MisListas' }"
               @click="goToMisListas">
               Mis Listas
            </a>
          </li>

          <!-- Mis Favoritos (name: "VerLista" con param id="Mis Favoritos") -->
          <li  v-if="user != null" class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'VerLista' && activeParams.id === 'Mis Favoritos' }"
               @click="goToFavoritos">
               Mis Favoritos
            </a>
          </li>

          <!-- Leídos (name: "VerLista" con param id="Leídos") -->
          <li  v-if="user != null" class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'VerLista' && activeParams.id === 'Leídos' }"
               @click="goToLeidos">
               Leídos
            </a>
          </li>

          <!-- En proceso (name: "VerLista" con param id="En proceso") -->
          <li v-if="user != null" class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'VerLista' && activeParams.id === 'En proceso' }"
               @click="goToEnProceso">
               En proceso
            </a>
          </li>

          <!-- Perfil (name: "Perfil") -->
          <li v-if="user != null" class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'Perfil' }"
               @click="goToPerfil">
               <font-awesome-icon :icon="['fas', 'user']" /> Perfil
            </a>
          </li>

          <!-- Acceder (name: "Login") -->
          <li v-if="user == null" class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'Login' }"
               @click="goToLogin">
               <font-awesome-icon :icon="['fas', 'user']" /> Acceder
            </a>
          </li>

        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { Dropdown } from 'bootstrap';

export default {
  name: "NavBar",
  props: {
    darkMode: Boolean,
    user: Object
  },
  computed: {
    navbarTheme() {
      return this.darkMode ? "navbar-dark" : "navbar-light";
    },
    cambiarLogo() {
      return this.darkMode 
        ? require("../assets/bookly-oscuro.png")
        : require("../assets/bookly-claro.png");
    },
    activeRouteName() {
      return this.$route.name; 
    },
    activeParams() {
      return this.$route.params;
    }
  },
  mounted() {
    console.log('NavBar montado');
    const dropdownElements = this.$el.querySelectorAll('.dropdown-toggle');
    dropdownElements.forEach(el => {
      new Dropdown(el);
    });
  },
  methods: {
    // Métodos de navegación que NO recargan
    goToChatBot() {
      this.$router.push('/chatbot');
    },
    goToForo() {
      this.$router.push('/foro');
    },
    goToInicio() {
      this.$router.push('/').then(() => {
        this.$router.go(0); // Recarga la página
      });
    },
    goToEstadisticas() {
      this.$router.push('/estadisticas');
    },
    goToMisListas() {
      this.$router.push({ name: 'Listas', params: { privacidad: 'MisListas' } });
    },
    goToListas() {
      this.$router.push({ name: 'Listas', params: { privacidad: 'ListasPublicas' } });
    },

    // Métodos que SÍ recargan para forzar la lógica anterior:
    goToFavoritos() {
      this.$router.push({ 
        name: 'VerLista', 
        params: { donde: 'MisListas', id: 'Mis Favoritos' } 
      }).then(() => {
        this.$router.go(0); // recarga la página
      });
    },
    goToLeidos() {
      this.$router.push({ 
        name: 'VerLista', 
        params: { donde: 'MisListas', id: 'Leídos' } 
      }).then(() => {
        this.$router.go(0); // recarga la página
      });
    },
    goToEnProceso() {
      this.$router.push({ 
        name: 'VerLista', 
        params: { donde: 'MisListas', id: 'En proceso' } 
      }).then(() => {
        this.$router.go(0); // recarga la página
      });
    },
    goToPerfil() {
      this.$router.push({ name: 'Perfil' }).then(() => {
        this.$router.go(0); // Recarga la página
      });
    },
    goToLogin() {
      this.$router.push('/login').then(() => {
        this.$router.go(0); // Recarga la página
      });
    },
  }
};
</script>

<style scoped>
.active-link {
  position: relative;
  font-weight: bold;
}

.active-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100% !important;
  height: 4px;
  background-color: #4C4637;
}

.logo-wrapper {
  width: 65px;
  height: 65px;
  background-color: #e5c578 !important;
  border: 3px solid #4C4637;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  box-sizing: border-box;
}

.logo-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  display: block;
}

.navbar-light {
  background-color: #EECA06; 
}

.navbar-dark {
  background-color: #EECA06; 
}

.nav-bold {
  font-weight: bold;
}

.navbar-dark .nav-bold {
  color: #343434;
}

.navbar-light .nav-bold {
  color: #343434; 
}

.nav-item:hover,
.nav-link:hover {
  background-color: transparent !important;
}

.dropdown-menu {
  min-width: 10rem;
  z-index: 9999;
}

.dropdown-menu-end {
  right: 0;
  left: auto;
}

.clickable {
  cursor: pointer;
  pointer-events: auto; 
}

.nav-link {
  position: relative;
  padding-bottom: 4px;
  transition: all 0.2s ease;
  font-size: 1.2rem;
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0%;
  height: 4px;
  background-color: #4C4637; 
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}
</style>

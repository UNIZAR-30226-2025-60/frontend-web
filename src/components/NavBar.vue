<template>
  <nav class="navbar navbar-expand-lg" :class="navbarTheme">  <!-- Barra de navegación principal, cambia de tema con `navbarTheme` -->
    <div class="container-fluid">
      <!-- Logo que al pulsarlo te lleva al inicio -->
      <a class="navbar-brand" href="#" @click="goToInicio">
        <div class="logo-wrapper">
          <img :src="cambiarLogo" alt="Bookly" />
        </div>
      </a>

      <!-- Botón para colapsar menú en pantallas pequeñas -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Contenedor de las opciones del menú -->
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mb-2 mb-lg-0 ms-auto">

          <!-- Solo visible para usuarios logueados -->
          <!-- Chatbot (coincide con name: "Chatbot" en index.js) -->
          <li  v-if="user != null" class="nav-item">
            <!-- Botón para el ChatBot -->
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'Chatbot' }"
               @click="goToChatBot">
               ChatBot
            </a>
          </li>

          <!-- Foro (name: "Foro") accesible para todos -->
          <li class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'Foro' }"
               @click="goToForo">
               Foro
            </a>
          </li>

          <!-- Estadísticas (name: "Estadisticas") solo para usuarios logueados -->
          <li  v-if="user != null" class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'Estadisticas' }"
               @click="goToEstadisticas">
               Estadísticas
            </a>
          </li>

          <!-- Listas Públicas (name: "Listas" con param privacidad="ListasPublicas") siempre visibles -->
          <li class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'Listas' && activeParams.privacidad === 'ListasPublicas' }"
               @click="goToListas">
               Listas Públicas
            </a>
          </li>

          <!-- Mis Listas (name: "Listas" con param privacidad="MisListas") solo para usuarios logueados -->
          <li  v-if="user != null" class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'Listas' && activeParams.privacidad === 'MisListas' }"
               @click="goToMisListas">
               Mis Listas
            </a>
          </li>

          <!-- Mis Favoritos (name: "VerLista" con param id="Mis Favoritos") solo para usuarios logueados -->
          <li  v-if="user != null" class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'VerLista' && activeParams.id === 'Mis Favoritos' }"
               @click="goToFavoritos">
               Mis Favoritos
            </a>
          </li>

          <!-- Leídos (name: "VerLista" con param id="Leídos") solo para usuarios logueados -->
          <li  v-if="user != null" class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'VerLista' && activeParams.id === 'Leídos' }"
               @click="goToLeidos">
               Leídos
            </a>
          </li>

          <!-- En proceso (name: "VerLista" con param id="En proceso") solo para usuarios logueados -->
          <li v-if="user != null" class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'VerLista' && activeParams.id === 'En proceso' }"
               @click="goToEnProceso">
               En proceso
            </a>
          </li>

          <!-- Perfil (name: "Perfil") solo para usuarios logueados -->
          <li v-if="user != null" class="nav-item">
            <a class="nav-link nav-bold clickable"
               :class="{ 'active-link': activeRouteName === 'Perfil' }"
               @click="goToPerfil">
               <font-awesome-icon :icon="['fas', 'user']" /> Perfil
            </a>
          </li>

          <!-- Acceder (name: "Login") solo si aún no te has logueado -->
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
  // Recibe una prop booleana que indica si está en modo oscuro
  props: {
    darkMode: Boolean,  
    user: Object  // Usuario actual 
  },
  computed: {
    // Cambia el tema de la navbar según el modo
    navbarTheme() {
      return this.darkMode ? "navbar-dark" : "navbar-light";
    },

    // Cambia el logo según el tema
    cambiarLogo() {
      return this.darkMode 
        ? require("../assets/bookly-oscuro.png")
        : require("../assets/bookly-claro.png");
    },

    // Ruta activa actual
    activeRouteName() {
      return this.$route.name; 
    },

    // Parámetros de la ruta actual
    activeParams() {
      return this.$route.params;
    }
  },
  mounted() {
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
/* Link activo con subrayado */
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

/* Estilo del logo */
.logo-wrapper {
  width: 50px;
  height: 50px;
  border: 2px solid #4C4637;
  border-radius: 50%; 
}

.logo-wrapper img {
  width: 100%;
  height: 100%;
}

/* Tema claro y oscuro para la navbar */
.navbar-light {
  background-color: #EECA06; 
}

.navbar-dark {
  background-color: #EECA06; 
}

/* Negrita para los ítems */
.nav-bold {
  font-weight: bold;
}

/* Color del texto */
.navbar-dark .nav-bold {
  color: #343434;
}

.navbar-light .nav-bold {
  color: #343434; 
}

/* Sin fondo al pasar el mouse */
.nav-item:hover,
.nav-link:hover {
  background-color: transparent !important;
}

/* Cursor y accesibilidad */
.clickable {
  cursor: pointer;
  pointer-events: auto; 
}

/* Subrayado animado al pasar el mouse */
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
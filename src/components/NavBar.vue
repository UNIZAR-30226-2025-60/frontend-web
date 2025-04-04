<template>
<nav class="navbar navbar-expand-lg" :class="navbarTheme">
  <div class="container-fluid">
    <a class="navbar-brand" href="#" @click="goToInicio">
        <img :src="cambiarLogo" alt="Bookly" width="60" height="60" class="d-inline-block align-text-top">
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mb-2 mb-lg-0 ms-auto">
        <li class="nav-item">
          <a class="nav-link nav-bold clickable" @click="goToChatBot">ChatBot</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold clickable" @click="goToForo">Foro</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold clickable" @click="goToEstadisticas">Estadísticas</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold clickable" @click="goToListas">Listas Públicas</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold clickable" @click="goToMisListas">Mis Listas</a>
        </li>
        <li class="nav-item" >
          <a class="nav-link nav-bold clickable" @click="goToFavoritos">Mis Favoritos</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold clickable" @click="goToLeidos">Leídos</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold clickable" @click="goToEnProceso">En proceso</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold clickable" @click="goToPerfil">
            <font-awesome-icon :icon="['fas', 'user']" /> Perfil
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
    darkMode: Boolean
  },
  computed: {
    navbarTheme() {
      return this.darkMode ? "navbar-dark" : "navbar-light";
    },
    cambiarLogo() {
      return this.darkMode 
        ? require("../assets/bookly-oscuro.png") // Imagen para modo oscuro
        : require("../assets/bookly-claro.png"); // Imagen para modo claro
    }
  },
  mounted() {
    const dropdownElements = this.$el.querySelectorAll('.dropdown-toggle');
    console.log('Dropdown elements found:', dropdownElements.length);
    dropdownElements.forEach(el => {
      new Dropdown(el);
    });
  },
  methods: {
    goToChatBot() {
      this.$router.push('/chatbot').then(() => {
        this.$router.go(0); // Recarga la página
      });
    },
    goToForo() {
      this.$router.push('/foro').then(() => {
        this.$router.go(0); // Recarga la página
      });
    },
    goToInicio() {
      this.$router.push('/inicio').then(() => {
        this.$router.go(0); // Recarga la página
      });
    },
    goToEstadisticas() {
      this.$router.push('/estadisticas').then(() => {
        this.$router.go(0); // Recarga la página
      });
    },
    goToMisListas() {
      this.$router.push({name: 'Listas', params: { privacidad: 'MisListas'}}).then(() => {
        this.$router.go(0); // Recarga la página
      });
    },
    goToListas() {
      this.$router.push({name: 'Listas', params: { privacidad: 'ListasPublicas'}}).then(() => {
        this.$router.go(0); // Recarga la página
      });
    },
    goToFavoritos() {
      this.$router.push({ name: 'VerLista', params: { donde: 'MisListas', id: 'Mis Favoritos'}}).then(() => {
        this.$router.go(0); // Recarga la página
      });
    },
    goToLeidos(){
      this.$router.push({ name: 'VerLista', params: { donde: 'MisListas',id: 'Leídos'}}).then(() => {
        this.$router.go(0); // Recarga la página
      }); 
    },
    goToEnProceso(){
      this.$router.push({ name: 'VerLista', params: { donde: 'MisListas', id: 'En proceso'}}).then(() => {
        this.$router.go(0); // Recarga la página
      });
    },
    goToPerfil() {
      this.$router.push({ name: 'Perfil' }).then(() => {
        this.$router.go(0); // Recarga la página
      });
    }
  }
};
</script>
<style scoped>
.navbar-light {
  background-color: #343434; /* Modo claro */
}

.navbar-dark {
  background-color: #e5c578; /* Modo oscuro */
}

.nav-bold {
  font-weight: bold;
}

.navbar-dark .nav-bold {
  color: #343434; /* Texto claro en modo oscuro */
}

.navbar-light .nav-bold {
  color: #f6e5bb; /* Texto oscuro en modo claro */
}

.nav-item:hover {
  background-color: #9b885b;
}

.navbar-dark .nav-item:hover {
  background-color: #e0a927;
  z-index: 9999;
}

/* Dropdown alineado */
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
  pointer-events: auto; /* Asegura que el clic sea detectado */
}
</style>
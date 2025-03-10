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
          <a class="nav-link nav-bold" href="#" @click="goToForo">Foro</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#" @click="goToEstadisticas">Estadísticas</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#" @click="goToListas">Listas</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#" @click="goToMisListas">Mis Listas</a>
        </li>
        <li class="nav-item" >
          <a class="nav-link nav-bold" href="#" @click="goToFavoritos">Mis Favoritos</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#" @click="goToLeidos">Leídos</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#" @click="goToEnProceso">En proceso</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#" @click="goToPerfil">
            <font-awesome-icon :icon="['fas', 'user']" /> Perfil
          </a>
        </li>
      </ul>
      <!-- <ul class="navbar-nav">
        <li class="nav-item dropdown">
          <a
            class="nav-link nav-bold dropdown-toggle"
            href="#"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Perfil
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a class="nav-link nav-bold" href="#" @click="goToPerfil">Ver perfil</a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="nav-link nav-bold" href="#" @click="cerrarSesion">Cerrar Sesión</a>
            </li>
          </ul>
        </li>
      </ul> -->
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
    goToForo() {
        this.$router.push('/foro');
    },
    goToInicio() {
        this.$router.push('/inicio');
    },
    goToEstadisticas() {
        this.$router.push('/estadisticas');
    },
    goToMisListas() {
        this.$router.push({name: 'Listas', params: { privacidad: 'Mis Listas'}});
    },
    goToListas() {
        this.$router.push({name: 'Listas', params: { privacidad: 'Listas Publicas'}});
    },
    goToFavoritos() {
        this.$router.push({ name: 'VerLista', params: { id: 'Mis Favoritos'}});
    },
    goToLeidos(){
      this.$router.push({ name: 'VerLista', params: { id: 'Leídos'}});
    },
    goToEnProceso(){
      this.$router.push({ name: 'VerLista', params: { id: 'En proceso'}});
    },
    goToPerfil() {
        this.$router.push({ name: 'Perfil' });
    },
    cerrarSesion() {
      localStorage.removeItem("userToken");
      this.$router.push({ name: 'Login' });
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
</style>
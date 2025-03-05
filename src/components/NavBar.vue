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
          <a class="nav-link nav-bold" href="#" >Listas</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#" @click="goToMisListas">Mis Listas</a>
        </li>
        <li class="nav-item" >
          <a class="nav-link nav-bold" href="#" @click="goToFavoritos">Mis Favoritos</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#">Leídos</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#">En proceso</a>
        </li>
      </ul>
      <ul class="navbar-nav">
        <li class="nav-item dropdown">
          <a class="nav-link nav-bold dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Perfil
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="#">Ver perfil</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#">Cerrar Sesión</a></li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</nav>
</template>

<script>

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
        this.$router.push('/mislistas');
    },
    goToFavoritos() {
        this.$router.push('/favoritos');
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
}

/* Dropdown alineado */
.dropdown-menu {
  min-width: 10rem;
}

.dropdown-menu-end {
  right: 0;
  left: auto;
}
</style>
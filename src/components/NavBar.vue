<template>
<nav class="navbar navbar-expand-lg">
  <div class="container-fluid">
    <a class="navbar-brand" href="#" @click="goToInicio">
        <img src="../assets/bookly-oscuro.png" alt="Bookly" width="60" height="60" class="d-inline-block align-text-top">
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <!-- Agregamos mx-auto para centrar los elementos -->
      <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#" @click="goToForo">Foro</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#">Estadísticas</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#">Listas</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#">Mis Listas</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#">Mis Favoritos</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#">Leídos</a>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-bold" href="#">En proceso</a>
        </li>
      </ul>
      <!-- Botón de Perfil alineado a la derecha con ms-auto -->
      <ul class="navbar-nav ms-auto">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Perfil
          </a>
          <ul class="dropdown-menu">
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
  methods: {
    goToForo() {
        this.$router.push('/foro');
    },
    goToInicio() {
        this.$router.push('/inicio');
    }
  }
};
</script>
<style scoped>
    .navbar {
        background-color: #e5c578;
    }
    .nav-bold {
        color: #343434;
        font-weight: bold;
    }
    .nav-item:hover {
        background-color: #e0a927;
    }
</style>
<template>
<nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">BOOKLY</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class=" navbar-nav ms-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link" @click="goToForo" >Foro</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Estadísticas</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Listas</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Mis Listas</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Mis Favoritos</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Leídos</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">En proceso</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Perfil
          </a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Ver perfil</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#">Cerrar Sesion</a></li>
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
    }
  }
};
</script>
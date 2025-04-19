<template>
  <!-- Contenedor principal del loader, cambia de clase según el modo oscuro o claro -->
  <div class="loader-container" :class="LoaderTheme">
    <!-- Logo animado que se muestra mientras carga (cambia según el modo claro/oscuro) -->
    <img :src="gifSrc" alt="Bookly Logo" class="logo" />
    <!-- Texto de "Cargando..." -->
    <div class="loading-text">Cargando...<span class="dots"></span></div>
  </div>
</template>

<script>
export default {
  name: "LoaderComponent",
   // Recibe una prop booleana que indica si está en modo oscuro
  props: {
    darkMode: Boolean
  },
  computed: {
    // Devuelve la clase CSS correspondiente al tema (oscuro o claro)
    LoaderTheme() {
      return this.darkMode ? "loader-dark" : "loader-light";
    },

    // Devuelve la ruta del GIF animado de carga según el tema
    gifSrc() {
      return this.darkMode
        ? require("../assets/animacion_cargando_oscuro.gif")
        : require("../assets/animacion_cargando_claro.gif");
    }
  }
}
</script>


<style scoped>
/* Estilos generales del contenedor del loader */
.loader-container {
  /* Centra el logo tanto vertical como horizontalmente en la pantalla */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  transition: background-color 0.3s ease-in-out;  /* Transición suave entre temas */
}

/* Fondo claro para modo claro */
.loader-light {
  background-color: #e5c578;
}

/* Fondo oscuro para modo oscuro */
.loader-dark {
  background-color: #343434;
}

/* Estilo del logo animado */
.logo {
  width: 150px;
  height: auto;
  margin-bottom: 20px;
  animation: fadeIn 1.5s ease-in-out;  /* Aparece suavemente */
}

/* Estilo del texto "Cargando..." */
.loading-text {
  font-weight: bold;
  font-size: 20px;
}
</style>

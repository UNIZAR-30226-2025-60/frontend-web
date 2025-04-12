<template>
  <div class="loader-container" :class="LoaderTheme">
    <img :src="gifSrc" alt="Bookly Logo" class="logo" />
    <div class="loading-text">Cargando...<span class="dots"></span></div>
  </div>
</template>

<script>
export default {
  name: "LoaderComponent",
  props: {
    darkMode: Boolean
  },
  computed: {
    LoaderTheme() {
      return this.darkMode ? "loader-dark" : "loader-light";
    },
    gifSrc() {
      return this.darkMode
        ? require("../assets/animacion_cargando_oscuro.gif")
        : require("../assets/animacion_cargando_claro.gif");
    }
  }
}
</script>


<style scoped>
.loader-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  transition: background-color 0.3s ease-in-out;
}

.loader-light {
  background-color: #e5c578;
}

.loader-dark {
  background-color: #343434;
}

.logo {
  width: 150px;
  height: auto;
  margin-bottom: 20px;
  animation: fadeIn 1.5s ease-in-out;
}

.loading-text {
  font-weight: bold;
  font-size: 20px;
}
</style>

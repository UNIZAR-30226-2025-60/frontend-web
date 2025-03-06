<template>
    <div class="loader-container" :class="LoaderTheme">
      <img :src="cambiarLogo" alt="Bookly Logo" class="logo" />
      <div class="loading-text">Cargando<span class="dots"></span></div>
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
      cambiarLogo() {
        return this.darkMode 
          ? require("../assets/bookly-oscuro.png") // Logo modo oscuro
          : require("../assets/bookly-claro.png"); // Logo modo claro
      }
    },
  };
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
    background-color: #e5c578; /* Fondo claro */
  }
  
  .loader-dark {
    background-color: #343434; /* Fondo oscuro */
  }
  
  .logo {
    width: 150px; /* Ajusta el tamaño del logo */
    height: auto;
    margin-bottom: 20px;
    animation: fadeIn 1.5s ease-in-out;
  }
  
  /* Animación de puntos suspensivos */
  .loading-text {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
    text-align: center;
  }
  
  .loader-dark .loading-text {
    color: #f6e5bb;
  }
  
  .dots::after {
    content: "";
    display: inline-block;
    animation: dots-animation 1.5s infinite steps(4);
  }
  
  @keyframes dots-animation {
    0% { content: ""; }
    25% { content: "."; }
    50% { content: ".."; }
    75% { content: "..."; }
  }
  
  /* Animación de aparición */
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
</style>
  
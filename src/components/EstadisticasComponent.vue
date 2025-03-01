<template>
    <div :class="estadisticasTheme">
      <NavBar :darkMode="darkMode" @toggle-dark-mode="toggleDarkMode"></NavBar>
  
      <div class="container-fluid pt-5 p-5 min-vh-100 text-black">
        <button @click="toggleDarkMode" class="theme-toggle-btn">
          {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
        </button>
  
        <h2 class="section-title text-center mb-5">Mis Estadísticas</h2>
  
        <div class="my-stats">
          <h5>Mis estadísticas:</h5>
          <div>
            <span><strong>Libros leídos este mes:</strong> {{ totalLibrosLeidos }}</span>
            <span><strong>Temáticas más leídas:</strong> {{ tematicasMasLeidas }}</span>
          </div>
        </div>
  
        <div class="tematicas">
          <h5>Temáticas más leídas:</h5>
          <div v-for="(tematica, index) in tematicasMasLeidas" :key="index" class="tematica">
            <span>{{ tematica }}</span>
          </div>
        </div>
  
        <div class="recommended-books">
          <h5>Libros recomendados:</h5>
          <div v-for="(libro, index) in librosRecomendados" :key="index" class="book">
            <img :src="libro.imagen" alt="Portada del libro">
            <h6>{{ libro.nombre }}</h6>
            <p>{{ libro.descripcion }}</p>
          </div>
        </div>
      </div>
  
      <Footer></Footer>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import NavBar from '@/components/NavBar.vue';
  import Footer from '@/components/Footer.vue';
  import { apiClient } from '../config';
  
  export default {
    name: 'EstadisticasComponent',
    components: {
      NavBar,
      Footer
    },
    data() {
      return {
        darkMode: false,
        totalLibrosLeidos: 0,
        tematicasMasLeidas: [],
        librosRecomendados: []
      };
    },
    created() {
      this.cargarEstadisticas();
      this.cargarLibrosRecomendados();
    },
    methods: {
      async cargarEstadisticas() {
      },
      async cargarLibrosRecomendados() {
      },
      toggleDarkMode() {
        this.darkMode = !this.darkMode;
      }
    }
  };
  </script>
  
  <style scoped>
  .theme-toggle-btn {
    background-color: #444;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
  }
  
  .theme-toggle-btn:hover {
    background-color: #666;
  }
  
  .my-stats, .tematicas, .recommended-books {
    margin-bottom: 20px;
  }
  
  .tematica, .book {
    margin: 5px;
  }
  
  .foro-light {
    background-color: #f8f9fa; /* Fondo claro */
    color: #343434;
  }
  
  .foro-dark {
    background-color: #343434; /* Fondo oscuro */
    color: #e5c578;
  }
  </style>
  
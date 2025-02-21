<template>
  <div :class="foroTheme">
    <!-- NavBar con la prop darkMode y evento de cambio de tema -->
    <NavBar :darkMode="darkMode" @toggle-dark-mode="toggleDarkMode"></NavBar>

    <div class="container-fluid pt-5 p-5 min-vh-100 text-black">
      <!-- Botón para cambiar el tema -->
      <button @click="toggleDarkMode" class="theme-toggle-btn">
        {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
      </button>

      <h2 class="section-title text-center mb-5">Foro</h2>
      <h5>¿Quieres preguntar algo?</h5>

      <form class="d-flex mb-3 mt-4" @submit.prevent="publicarPregunta">
        <div class="input-group">
          <input class="form-control rounded-pill" type="search" placeholder="Escribe aquí tu pregunta..." aria-label="Buscar" v-model="pregunta">
          <button v-if="busqueda" class="btn btn-outline-secondary rounded-pill ms-2" type="button">Limpiar</button>
        </div>
      </form>

      <div v-for="pregunta in foro" :key="pregunta.id" class="pregunta">
        <h5>{{ pregunta.cuestion }}</h5>
        <p><strong>Por:</strong> {{ pregunta.usuario }} <strong>Fecha:</strong> {{ pregunta.fecha }}</p>

        <div v-if="pregunta.respuestas.length > 0" class="respuestas">
          <h5>Respuestas:</h5>
          <div v-for="respuesta in pregunta.respuestas" :key="respuesta.id" class="respuesta">
            <p>{{ respuesta.mensaje }}</p>
            <p><strong>Por:</strong> {{ respuesta.usuario }} <strong>Fecha:</strong> {{ respuesta.fecha }}</p>
          </div>
        </div>
        <p v-else>Sin respuestas.</p>
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

export default { // Añadir partes que faltan del claro/oscuro no hay manera de que funcione bien y
  name: 'ForoComponent',
  components: {
    NavBar,
    Footer
  },
  data() {
    return {
      foro: [],
      pregunt: ''
    };
  },
  created() {
    this.cargarForoCompleto();
  },
  methods: {
    async cargarForoCompleto() {
      try {
        const response = await apiClient.get('/obtenerForoCompleto');
        this.foro = response.data;
      } catch (error) {
        console.error('Error al cargar el foro:', error);
      }
    },
    async publicarPregunta() {
      if(!this.pregunta.trim()) {
        alert('Por favor, escribe una pregunta.');
        return;
      }
      try {
        const response = await apiClient.post('preguntas');
      } catch (error) {
        console.error('Error al publicar:', error);
      }
    },
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

.pregunta {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}

.respuestas {
  margin-left: 20px;
}

.respuesta {
  border-top: 1px solid #ccc;
  padding-top: 10px;
  margin-top: 10px;
}

/* Estilos para el Modo Claro */
.foro-light {
  background-color: #f8f9fa; /* Fondo claro */
  color: #343434;
}

/* Estilos para el Modo Oscuro */
.foro-dark {
  background-color: #343434; /* Fondo oscuro */
  color: #e5c578;
}
</style>

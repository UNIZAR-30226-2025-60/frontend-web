<template>
  <div>
    <NavBar></NavBar>
    <div class= "container-fluid pt-5 p-5 text-white min-vh-100" style="background-color: #343434;">
      <h2 class="section-title text-center mb-5">Foro</h2>
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
  import { API_URL, AUTH_URL } from '../config';
  import NavBar from '@/components/NavBar.vue'
  import Footer from '@/components/Footer.vue'

  export default {
    name: 'ForoComponent',
    components: {
    NavBar,
    Footer
  },
    data() {
      return {
        foro: [],
      };
    },
    created() {
      this.cargarForoCompleto();
    },
    methods: {
      async cargarForoCompleto() {
        try {
          //const response = await axios.get('http://localhost:3000/api/obtenerForoCompleto');
          const response = await axios.get(`${API_URL}/obtenerForoCompleto`);
          this.foro = response.data;
        } catch (error) {
          console.error('Error al cargar el foro:', error);
        }
      },
    },
  };
</script>
  
<style scoped>
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
</style>
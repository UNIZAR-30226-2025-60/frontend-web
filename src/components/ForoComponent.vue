<!-- He hecho esta pantalla fea de prueba para ver que funcione la obtención de datos del foro completo. 
No es definitiva, editarla como querais.(javier)
 Os lo digo por si teneis algún problema o dudas, pq supuestamene he hecho la función de obtener el foro completo.
 de tal forma que os lo va a devolver con esta estructura ya organizado. -->
<template>
    <div>
      <h1>Foro Completo</h1>
      <div v-for="pregunta in foro" :key="pregunta.id" class="pregunta">
        <h2>{{ pregunta.cuestion }}</h2>
        <p><strong>Por:</strong> {{ pregunta.usuario }} <strong>Fecha:</strong> {{ pregunta.fecha }}</p>
        <div v-if="pregunta.respuestas.length > 0" class="respuestas">
          <h3>Respuestas:</h3>
          <div v-for="respuesta in pregunta.respuestas" :key="respuesta.id" class="respuesta">
            <p>{{ respuesta.mensaje }}</p>
            <p><strong>Por:</strong> {{ respuesta.usuario }} <strong>Fecha:</strong> {{ respuesta.fecha }}</p>
          </div>
        </div>
        <p v-else>Sin respuestas.</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
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
          const response = await axios.get('http://localhost:3000/api/obtenerForoCompleto');
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
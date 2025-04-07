<template>
  <div v-if="user" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <NavBar :dark-mode="darkMode"></NavBar>

    <div class="container-fluid pt-5 p-5 min-vh-100">
      
      <!-- Botón de cambio de tema -->
      <button @click="toggleDarkMode" class="theme-toggle-btn mb-3">
        {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
      </button>

      <h4 class="titulo">FORO</h4>

      <h5 class="text-center" >¿Quieres preguntar algo?</h5>

      <form class="d-flex mb-3 mt-4" @submit.prevent="publicarPregunta">
        <div class="input-group">
          <input class="form-control rounded-pill" type="text" placeholder="Escribe aquí tu pregunta..." v-model="pregunta">
        </div>
      </form>

      <!-- Switch para filtrar preguntas -->
      <div class="form-check form-switch my-3">
        <input class="form-check-input" type="checkbox" id="filterUserQuestions" v-model="filtrarPorUsuario" @change="obtenerPreguntas">
        <label class="form-check-label" for="filterUserQuestions">
          Ver mis preguntas
        </label>
      </div>

      <div v-for="pregunta in preguntasFiltradas" :key="pregunta.id" class="pregunta mb-3 p-3">
        <h5>{{ pregunta.cuestion }}</h5>
        <p class="mb-1"><strong>Por:</strong> {{ pregunta.usuario }} <strong>Fecha:</strong> {{ pregunta.fecha }}</p>
        <p v-if="!pregunta.mostrarRespuestas" class="mb-2 text-muted">
          <font-awesome-icon :icon="['fas', 'comment']" />
          {{ pregunta.respuestas.length }} respuestas
        </p> 

        <div class="d-flex gap-3 align-items-center">
          <!-- Botón para añadir respuesta -->
          <button class="btn btn-sm btn-outline-secondary" @click="aniadirRespuesta(pregunta.id)"> 
            <font-awesome-icon :icon="['fas', 'reply']" />
            Responder
          </button>

          <!-- Botón para ver respuestas (solo si hay respuestas) -->
          <button v-if="pregunta.respuestas.length > 0" @click="toggleVerRespuestas(pregunta.id)" class="btn btn-sm btn-outline-secondary">
            <font-awesome-icon :icon="['fas', 'comment']" />
            {{ pregunta.mostrarRespuestas ? 'Ocultar respuestas' : 'Ver respuestas' }}
            <font-awesome-icon
              v-if="!pregunta.mostrarRespuestas"
              :icon="['fas', 'caret-down']"
            />
            <font-awesome-icon
              v-else
              :icon="['fas', 'caret-down']"
              style="transform: rotate(180deg);"
            />
          </button>
        </div>

        <!-- Sección de respuestas, solo se muestra si el usuario ha presionado "Ver respuestas" -->
        <div v-if="pregunta.mostrarRespuestas" class="respuestas mt-3">
          <h6 class="mb-2">Respuestas:</h6>
          <div v-for="respuesta in pregunta.respuestas" :key="respuesta.id" class="respuesta border-top pt-2 mt-2">
            <p>{{ respuesta.mensaje }}</p>
            <p class="text-muted"><strong>Por:</strong> {{ respuesta.usuario }} &nbsp; <strong>Fecha:</strong> {{ respuesta.fecha }}</p>
          </div>
        </div>
      </div>
    </div>
    <Footer></Footer>
    <button class="back-to-top" @click="scrollTop">
      <font-awesome-icon :icon="['fas', 'chevron-up']" />
    </button>
    
    <!-- MODAL personalizado -->
    <div v-if="mostrarModal" class="modal-background">
      <div class="modal-dialog modal-dialog-centered"> 
        <div class="modal-content rounded-3 shadow-lg">
          <div class="modal-header">
            <h4 class="modal-title fw-bold mb-4">Nueva respuesta</h4>
          </div>
          <div class="modal-body">
            <form>
              <div>
                <label class="controls mb-3 p-2" for="mensaje">Mensaje:</label>
                <textarea v-model="nuevaRespuesta.mensaje" placeholder="Introduce tu respuesta*" required></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-enviar p-2 px-4 me-3 mb-2" @click="enviarRespuesta">Enviar</button>
            <button type="button" class="btn-cancelar p-2 px-4 mb-2" @click="cerrarModal">Cancelar</button>
          </div>
        </div>
      </div> 
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import { apiClient } from '../config';

export default {
  name: 'ForoComponent',
  components: {
    NavBar,
    Footer
  },
  data() {
    return {
      foro: [],
      nuevaPregunta: {
        usuarioCorreo: "",
        pregunta: ""
      },
      pregunta: "",
      preguntas: "",
      filtrarPorUsuario: false, // Estado para el switch de filtrado
      mostrarModal: false,
      user: null, 
      nuevaRespuesta: {
        pregunta_id: "",
        usuario_respuesta: "",
        mensaje_respuesta: ""
      },
      darkMode: localStorage.getItem("darkMode") === "true" // Obtener el tema guardado
    };
  },
  computed: {
    preguntasFiltradas() {
      return this.filtrarPorUsuario
        ? this.foro.filter(p => p.usuario.trim().toLowerCase() === this.user.correo.trim().toLowerCase())
        : this.foro;
    }
  },
  async mounted() {
    try {
      const response1 = await apiClient.get("/user"); // Llamada a usuario
      this.user = response1.data;
      this.cargarForoCompleto();

      // Aplicar el tema guardado al cargar la página
      this.applyTheme();
    } 
    catch (error) {
      console.error('Error al cargar el foro:', error);
    }
  },
  methods: {
    async cargarForoCompleto() {
      try {
        const response = await apiClient.get('/obtenerForoCompleto');
        this.foro = response.data.map(p => ({ ...p, mostrarRespuestas: false })); // Añadir propiedad para mostrar respuestas
      } catch (error) {
        console.error('Error al cargar el foro:', error);
      }
    },
    async publicarPregunta() {
      if (!this.pregunta) {
        alert('Por favor, escribe una pregunta.');
        return;
      }
      try {
        // Guardamos todos los datos necesarios para realizar la consulta
        const nuevaPregunta = {
          usuarioCorreo: this.user.correo,
          pregunta: this.pregunta
        };

        console.log("ID usuario que pregunta:", nuevaPregunta.usuarioCorreo);
        console.log("Pregunta:", nuevaPregunta.pregunta);

        const response = await apiClient.post('/preguntas', nuevaPregunta);
        console.log('Pregunta añadida con éxito:', response.data);

        // Recargar el foro para actualizar las preguntas
        await this.cargarForoCompleto();

        // Limpiar el formulario después de enviar la pregunta
        this.nuevaPregunta = {
          usuarioCorreo: "",
          pregunta: ""
        };

        // Limpiar el formulario donde se ha escrito el texto nada más terminar
        this.pregunta = "";

        // Mostrar mensaje de éxito
        alert("Tu pregunta ha sido publicada.");
      } catch (error) {
        console.error('Error al enviar la pregunta:', error);
        alert("Hubo un error al enviar tu pregunta. Inténtalo de nuevo.");
      }
    },
    // Métodos para el tema oscuro/claro
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("darkMode", this.darkMode);
      this.applyTheme();
    },
    applyTheme() {
      document.body.classList.toggle("dark-mode", this.darkMode);
      document.body.classList.toggle("light-mode", !this.darkMode);
    },
    toggleVerRespuestas(preguntaId) {
      const pregunta = this.foro.find(p => p.id === preguntaId);
      if (pregunta) {
        pregunta.mostrarRespuestas = !pregunta.mostrarRespuestas;
      }
    },
    aniadirRespuesta(preguntaId) {
      this.nuevaRespuesta = {
        pregunta_id: preguntaId,
        usuario_respuesta: this.user.correo,
        mensaje_respuesta: ""
      };
      this.mostrarModal = true; // Abre el modal
    },
    cerrarModal() {
      this.mostrarModal = false; // Cierra el modal
    },
    async enviarRespuesta() {
      if (!this.nuevaRespuesta.mensaje) {
        alert("El mensaje de la respuesta es obligatorio");
        return;
      }
      try {
        // Guardamos todos los datos necesarios para realizar la consulta
        const nuevaRespuesta = {
          pregunta_id: this.nuevaRespuesta.pregunta_id,
          usuario_respuesta: this.nuevaRespuesta.usuario_respuesta,
          mensaje_respuesta: this.nuevaRespuesta.mensaje
        };

        console.log("Pregunta ID:", nuevaRespuesta.pregunta_id);
        console.log("ID usuario que responde:", nuevaRespuesta.usuario_respuesta);
        console.log("Mensaje:", nuevaRespuesta.mensaje_respuesta);
        
        const response = await apiClient.post('/agregarRespuesta', nuevaRespuesta);
        console.log('Respuesta añadida con éxito:', response.data);

        // Cerrar el modal después de enviar la respuesta
        this.cerrarModal();

        // Recargar el foro para actualizar las respuestas de las preguntas
        await this.cargarForoCompleto();

        // Limpiar el formulario después de enviar la reseña
        this.nuevaRespuesta = {
          pregunta_id: "",
          usuario_respuesta: "",
          mensaje_respuesta: "",
        };

        // Mostrar mensaje de éxito
        alert("Tu respuesta ha sido publicada.");
      } catch (error) {
        console.error('Error al enviar la respuesta:', error);
        alert("Hubo un error al enviar tu respuesta. Inténtalo de nuevo.");
      }
    },
    async obtenerPreguntas() {
      try {
        const usuarioCorreo = this.filtrarPorUsuario ? this.user.correo : null;
        console.log("Vamos a ver las preguntas de usuario: ", usuarioCorreo)

        const response = await apiClient.get('/preguntas', {
          params: { usuarioCorreo }
        });

        this.foro = response.data.map(p => ({
          ...p,
          respuestas: p.respuestas || [],
          mostrarRespuestas: false
        }));

        // Recargar el foro para actualizar las respuestas de las preguntas
        await this.cargarForoCompleto();

        console.log('Preguntas obtenidas correctamente:', response.data);
      } catch (error) {
        console.error("Error al obtener preguntas:", error);
      }
    },
    scrollTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
}

.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--color-boton);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9999;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  color: var(--color-texto-boton);
  transition: filter 0.2s ease;
}
.back-to-top:hover {
  filter: brightness(0.9);
}

.theme-toggle-btn {
  background-color: var(--color-boton);
  color: var(--color-texto-boton);
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.2s ease;
}
.theme-toggle-btn:hover {
  opacity: 0.9;
}

.pregunta {
  background-color: var(--color-fondo);
  color: var(--color-texto);
  border: 1px solid #bbb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.pregunta h5,
.pregunta p,
.pregunta strong {
  color: var(--color-texto);
}

.respuestas {
  margin-left: 20px;
}
.respuesta {
  border-top: 1px solid #ccc;
  padding-top: 10px;
  margin-top: 10px;
}
.respuesta p,
.respuesta strong {
  color: var(--color-texto);
}

.text-muted {
  color: var(--color-texto) !important;
  opacity: 0.8;
}

.modal-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: #F8E79B !important;
  color: #4C4637 !important;  
  border-radius: 12px;
  padding: 32px;
  width: 500px;
  max-width: 95%;
  text-align: left;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}


.modal-title,
.modal-content label,
.modal-content p,
.modal-content textarea {
  color: #4C4637 !important;
  font-weight: 500;
}

.modal-content textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  resize: vertical;
  border-radius: 8px;
  border: 1px solid #bbb;
  background-color: #fff;
  color: #4C4637;
  font-size: 0.95rem;
}

/* Modal botones */
.btn-enviar {
  background-color: var(--color-btn-enviar);
  color: var(--color-texto-btn-especial);
  border: none;
  border-radius: 20px;
  padding: 8px 20px;
  margin-right: 10px;
  cursor: pointer;
}
.btn-cancelar {
  background-color: var(--color-btn-cancelar);
  color: var(--color-texto-btn-especial);
  border: none;
  border-radius: 20px;
  padding: 8px 20px;
  cursor: pointer;
}
.btn-enviar:hover,
.btn-cancelar:hover {
  filter: brightness(0.95);
}

.titulo {
  text-align: center;
  font-weight: bold;
  font-size: 2rem;
  color: var(--color-texto);
  margin: 30px 0;
}
</style>

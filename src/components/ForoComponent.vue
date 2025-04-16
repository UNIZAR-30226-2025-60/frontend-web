<template>
  <div v-if="!loading" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <NavBar :dark-mode="darkMode"  :user="user"></NavBar>

    <div class="header">
      <h4 class="titulo">FORO</h4>

      <!-- Switch con iconos sol/luna -->
      <div class="theme-switch-wrapper">
        <div class="theme-switch" @click="toggleDarkMode">
          <div class="switch-track" :class="{ 'dark': darkMode }">
            <div class="switch-thumb" :class="{ 'dark': darkMode }">
              <!-- Sol icono -->
              <font-awesome-icon v-if="!darkMode" :icon="['fas', 'sun']" class="icon sun-icon"/>
              <!-- Luna icono -->
              <font-awesome-icon v-else :icon="['fas', 'moon']" class="icon moon-icon"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container-fluid px-5 min-vh-100">
      <div v-if="user != null">
        <h5 class="text-center" >¿Quieres preguntar algo?</h5>

        <form class="d-flex mb-3 mt-4" @submit.prevent="publicarPregunta">
          <div class="input-group d-flex flex-nowrap">
            <div class="input-container flex-grow-1">
              <input class="form-control rounded-start-pill" type="text" placeholder="Escribe tu pregunta..." v-model="pregunta">
              <span class="char-counter">{{ pregunta.length }}/{{ maxCaracteresPregunta }} caracteres</span>
            </div>
            <button type="submit" class="btn btn-preguntar rounded-end-pill">
              Preguntar
            </button>
          </div>
        </form>

        <!-- Switch para filtrar preguntas -->
        <div class="form-check form-switch my-3">
          <input class="form-check-input" type="checkbox" id="filterUserQuestions" v-model="filtrarPorUsuario" @change="obtenerPreguntas">
          <label class="form-check-label" for="filterUserQuestions">
            Ver mis preguntas
          </label>
        </div>
      </div>
      <!-- Dropdown de ordenación (movido aquí, debajo del switch) -->
      <div class="mb-3">
        <div ref="dropdown" class="dropdown">
          <button class="btn btn-outline-secondary dropdown-toggle" type="button" @click="toggleDropdown">
            Ordenar por: {{ getSelectedFilterLabel() }}
          </button>
          <ul class="dropdown-menu">
            <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('reciente')">Ninguno</a></li>
            <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('reciente')">Pregunta más reciente</a></li>
            <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('antigua')">Pregunta más antiguas</a></li>
            <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('masRespuestas')">Pregunta con más respuestas</a></li>
            <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('menosRespuestas')">Pregunta con menos respuestas</a></li>
          </ul>
        </div>
      </div>
      <div v-for="pregunta in preguntasFiltradas" :key="pregunta.id" class="pregunta mb-3 p-3">
        <h5>{{ pregunta.cuestion }}</h5>
        <p class="mb-1"><strong>Por:</strong> {{ pregunta.nombreUsuario }} <strong>Fecha:</strong> {{ pregunta.fecha }}</p>
        <p v-if="!pregunta.mostrarRespuestas" class="mb-2 text-muted">
          <font-awesome-icon :icon="['fas', 'comment']" />
          {{ pregunta.respuestas.length }} respuestas
        </p> 

        <div class="d-flex gap-3 align-items-center">
          <!-- Botón para añadir respuesta -->
          <button v-if="user != null" class="btn btn-sm btn-outline-secondary" @click="aniadirRespuesta(pregunta.id)"> 
            <font-awesome-icon :icon="['fas', 'reply']" />
            Responder
          </button>

          <!-- Botón para ver respuestas (solo si hay respuestas) -->
          <button v-if="pregunta.respuestas.length > 0" @click="toggleVerRespuestas(pregunta.id)" class="btn btn-sm btn-outline-secondary">
            <font-awesome-icon :icon="['fas', 'comment']" />
            {{ pregunta.mostrarRespuestas ? 'Ocultar respuestas' : 'Ver respuestas' }}
            <font-awesome-icon v-if="!pregunta.mostrarRespuestas" :icon="['fas', 'caret-down']"/>
            <font-awesome-icon v-else :icon="['fas', 'caret-down']" style="transform: rotate(180deg);"/>
          </button>
          <!-- Botón para eliminar pregunta -->
          <button v-if="user && pregunta.usuario.trim().toLowerCase() === user.correo.trim().toLowerCase()" class="btn btn-sm btn-outline-danger" @click="eliminarPregunta(pregunta.id)">
            <font-awesome-icon :icon="['fas', 'trash']" />
            Eliminar
          </button>
        </div>

        <!-- Sección de respuestas, solo se muestra si el usuario ha presionado "Ver respuestas" -->
        <div v-if="pregunta.mostrarRespuestas" class="respuestas mt-3">
          <h6 class="mb-2">Respuestas:</h6>
          <div v-for="respuesta in pregunta.respuestas" :key="respuesta.id" class="respuesta border-top pt-2 mt-2">
            <p>{{ respuesta.mensaje }}</p>
            <p class="text-muted"><strong>Por:</strong> {{ respuesta.nombreUsuario }} &nbsp; <strong>Fecha:</strong> {{ respuesta.fecha }}
              <!-- Botón para eliminar respuesta -->
              <button v-if="user && respuesta.usuario.trim().toLowerCase() === user.correo.trim().toLowerCase()" class="btn btn-sm btn-outline-danger ms-2" @click="eliminarRespuesta(respuesta.id)">
                <font-awesome-icon :icon="['fas', 'trash']" />
                Eliminar
              </button>
            </p>
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
            <h4 class="modal-title fw-bold mb-2">Nueva respuesta</h4>
          </div>
          <div class="modal-body">
            <form>
              <div>
                <label class="controls mb-1 p-2" for="mensaje">Mensaje:</label>
                <div class="textarea-container">
                  <textarea v-model="nuevaRespuesta.mensaje" placeholder="Introduce tu respuesta*" required></textarea>
                  <span class="char-counter textarea-counter">{{ nuevaRespuesta.mensaje.length }}/{{ maxCaracteresRespuesta }} caracteres</span>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn modal-btn p-2 px-4 me-3 mt-3" @click="cerrarModal">Cancelar</button>
            <button type="button" class="btn modal-btn p-2 px-4 mt-3" @click="enviarRespuesta">Enviar</button>
          </div>
        </div>
      </div> 
    </div>
  </div>
  <div v-else>
    <Cargando :dark-mode="darkMode"></Cargando>
  </div>
</template>

<script>
import axios from 'axios';
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import { apiClient } from '../config';
import { Dropdown } from 'bootstrap';
import { parse } from '@fortawesome/fontawesome-svg-core';

export default {
  name: 'ForoComponent',
  components: {
    NavBar,
    Footer
  },
  data() {
    return {
      foro: [],
      dropdownInstance: null,
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
        mensaje: ""
      },
      darkMode: localStorage.getItem("darkMode") === "true", // Obtener el tema guardado
      filtroSeleccionado: "reciente", // Ordenación por defecto
      userCache: {},
      maxCaracteresPregunta: 350, // Definimos el límite de caracteres para preguntas
      maxCaracteresRespuesta: 350, // Definimos el límite de caracteres para respuestas
      loading: true
    };
  },
  computed: {
    preguntasFiltradas() {
      // Primero filtramos por usuario si es necesario
      let preguntas = this.filtrarPorUsuario
        ? this.foro.filter(p => p.usuario.trim().toLowerCase() === this.user.correo.trim().toLowerCase())
        : this.foro;
      // Función auxiliar para convertir fechas en formato DD-MM-YYYY a objeto Date
      const parseCustomDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return new Date(0);
        const [day, month, year] = dateStr.split('-');
        return new Date(`${year}-${month}-${day}`);
      };
      // Luego ordenamos según el filtro seleccionado
      switch (this.filtroSeleccionado) {
        case "antigua":
          return [...preguntas].sort((a, b) => parseCustomDate(a.fecha) - parseCustomDate(b.fecha));
        case "reciente":
          return [...preguntas].sort((a, b) => parseCustomDate(b.fecha) - parseCustomDate(a.fecha));
        case "masRespuestas":
          return [...preguntas].sort((a, b) => b.respuestas.length - a.respuestas.length);
        case "menosRespuestas":
          return [...preguntas].sort((a, b) => a.respuestas.length - b.respuestas.length);
        default:
          return preguntas;
      }
    }
  },
  watch: {
    // Observador para limitar la longitud de la pregunta
    pregunta(newValue) {
      if (newValue.length > this.maxCaracteresPregunta) {
        this.pregunta = newValue.slice(0, this.maxCaracteresPregunta);
      }
    },
    // Observador para limitar la longitud de la respuesta
    'nuevaRespuesta.mensaje'(newValue) {
      if (newValue && newValue.length > this.maxCaracteresRespuesta) {
        this.nuevaRespuesta.mensaje = newValue.slice(0, this.maxCaracteresRespuesta);
      }
    }
  },
  async mounted() {
    try {
      // Intenta obtener los datos del usuario autenticado
      const response = await apiClient.get("/user");
      this.user = response.data; // Guarda los datos del usuario si existe
      console.log("Usuario autenticado:", this.user);
      if(this.user == ""){
        this.user = null;
        console.log("Usuario no autenticado");
      }
    } catch (error) {
      // Si no hay usuario autenticado, simplemente continúa con los datos públicos
      console.error("Error al cargar los datos del usuario: ", error);
    }
    try {
      this.cargarForoCompleto();

      // Aplicar el tema guardado al cargar la página
      this.applyTheme();
      this.dropdownInstance = new Dropdown(this.$refs.dropdown);
    } 
    catch (error) {
      console.error('Error al cargar el foro:', error);
    } finally {
      this.loading = false
    }
    document.addEventListener('click', this.closeDropdownOnClickOutside);
  },
  methods: {
    async cargarForoCompleto() {
      try {
        const response = await apiClient.get('/obtenerForoCompleto');
        const preguntas = response.data.map(p => ({ ...p, mostrarRespuestas: false }));

        for (const pregunta of preguntas) {
          pregunta.nombreUsuario = await this.getUserDisplayName(pregunta.usuario);
          for (const respuesta of pregunta.respuestas) {
            respuesta.nombreUsuario = await this.getUserDisplayName(respuesta.usuario);
          }
        }

        this.foro = preguntas;
      } catch (error) {
        console.error('Error al cargar el foro:', error);
      }
    },
    async publicarPregunta() {
      if (!this.pregunta) {
        alert('Por favor, escribe una pregunta.');
        return;
      }
      
      if (this.pregunta.length > this.maxCaracteresPregunta) {
        alert(`La pregunta no puede exceder los ${this.maxCaracteresPregunta} caracteres.`);
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
    async eliminarPregunta(preguntaId) {
      if (confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) {
        try {
          await apiClient.delete(`/BorroPreguntas/${preguntaId}`);
          this.foro = this.foro.filter(p => p.id !== preguntaId);
          alert("Pregunta eliminada con éxito.");
        } catch (error) {
          console.error("Error al eliminar la pregunta:", error);
          alert("No se pudo eliminar la pregunta.");
        }
      }
    },

    async eliminarRespuesta(respuestaId) {
      if (confirm("¿Estás seguro de que quieres eliminar esta respuesta?")) {
        try {
          await apiClient.delete(`/BorroRespuestas/${respuestaId}`);
          await this.cargarForoCompleto(); // Refresca respuestas
          alert("Respuesta eliminada con éxito.");
        } catch (error) {
          console.error("Error al eliminar la respuesta:", error);
          alert("No se pudo eliminar la respuesta.");
        }
      }
    },
    async getUserDisplayName(correo) {
      // Revisar primero el caché para evitar llamadas API innecesarias
      if (!this.userCache) {
        this.userCache = {};
      }
      
      // Si ya tenemos el nombre de este usuario en caché, usarlo
      if (this.userCache[correo]) {
        return this.userCache[correo];
      }
      
      try {
        // Solo hacer llamada API si no tenemos el usuario en caché
        const response = await apiClient.get(`/usuario/${correo}`);
        if (response.data && response.data.nombre) {
          // Guardar en caché para uso futuro
          this.userCache[correo] = response.data.nombre;
          return response.data.nombre;
        } else {
          // Usar correo como alternativa si el nombre no está disponible
          this.userCache[correo] = correo;
          return correo;
        }
      } catch (error) {
        console.error(`Error al obtener datos del usuario ${correo}:`, error);
        // Si la llamada API falla, usar correo como alternativa y guardar en caché para evitar fallos repetidos
        this.userCache[correo] = correo;
        return correo;
      }
    },
    toggleDropdown() {
      this.dropdownInstance.toggle();
    },

    seleccionarFiltro(filtro) {
      this.cambiarFiltro(filtro);
      this.dropdownInstance.hide();
    },
    cambiarFiltro(filtro) {
      console.log("Cambiando filtro a:", filtro);
      this.filtroSeleccionado = filtro;
      
      const dropdownToggle = this.$el.querySelector('.dropdown-toggle');
      if (dropdownToggle) {
        dropdownToggle.setAttribute('aria-expanded', 'false');
        const dropdownMenu = dropdownToggle.nextElementSibling;
        if (dropdownMenu) {
          dropdownMenu.classList.remove('show');
          dropdownToggle.closest('.dropdown').classList.remove('show');
        }
      }
    },
    getSelectedFilterLabel() {
      const filterLabels = {
        'reciente': 'Pregunta más reciente',
        'antigua': 'Pregunta más antigua',
        'masRespuestas': 'Pregunta con más respuestas',
        'menosRespuestas': 'Pregunta con menos respuestas'
      };
      return filterLabels[this.filtroSeleccionado] || 'Ordenar';
    },
    closeDropdownOnClickOutside(event) {
      if (this.$refs.dropdown && !this.$refs.dropdown.contains(event.target)) {
        this.mostrarDropdown = false;
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
        mensaje: ""
      };
      this.mostrarModal = true; // Abre el modal
    },
    cerrarModal() {
      this.mostrarModal = false; // Cierra el modal
    },
    async enviarRespuesta() {
      if (!this.nuevaRespuesta.mensaje) {
        alert("El mensaje de la respuesta es obligatorio");
        return;
      }
      
      if (this.nuevaRespuesta.mensaje.length > this.maxCaracteresRespuesta) {
        alert(`La respuesta no puede exceder los ${this.maxCaracteresRespuesta} caracteres.`);
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
          mensaje: "",
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

.pregunta {
  background-color: var(--color-fondo);
  color: var(--color-texto);
  border: 1px solid #bbb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
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
  background-color: #ffff !important;
  color: #4C4637 !important;  
  border-radius: 12px;
  padding: 32px;
  width: 500px;
  max-width: 95%;
  text-align: left;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  padding-right: 65px; /* Espacio para el contador */
}

.btn-preguntar {
  background-color: var(--color-boton);
  color: var(--color-texto-boton);
  border: none;
  transition: filter 0.2s ease;
}

.btn-preguntar:hover {
  filter: brightness(0.9);
}

.titulo {
  text-align: center;
  font-weight: bold;
  font-size: 2rem;
  color: var(--color-texto);
  margin: 30px 0;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Estilos para los contenedores de input con contador */
.input-container {
  position: relative;
}

.input-container input {
  padding-right: 65px; /* Espacio para el contador */
}

.char-counter {
  position: absolute;
  right: 10px;
  bottom: 8px;
  color: #000000;
  opacity: 0.7;
  font-size: 0.8rem;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 2px 5px;
  border-radius: 3px;
  pointer-events: none; /* Para que no interfiera con la escritura */
}

/* Para que el form de la pregunta tenga el mismo ancho que el botón de preguntar*/
.form-control {
  height: 100%; 
}
</style>
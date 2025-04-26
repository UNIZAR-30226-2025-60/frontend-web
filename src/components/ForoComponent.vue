<template>
  <div v-if="!loading" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <NavBar :dark-mode="darkMode"  :user="user"></NavBar>

    <!-- Cabecera con título del foro y switch de tema -->
    <div class="header">
      <h4 class="titulo">FORO</h4>

      <div class="theme-switch-wrapper">
        <div class="theme-switch" @click="toggleDarkMode">
          <div class="switch-track" :class="{ 'dark': darkMode }">
            <div class="switch-thumb" :class="{ 'dark': darkMode }">
              <!-- Icono de sol si está en modo claro -->
              <font-awesome-icon v-if="!darkMode" :icon="['fas', 'sun']" class="icon sun-icon"/>
              <!-- Icono de luna si está en modo oscuro -->
              <font-awesome-icon v-else :icon="['fas', 'moon']" class="icon moon-icon"/>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenedor principal del foro -->
    <div class="container-fluid px-5 min-vh-100">
      <!-- Si el usuario está logueado, puede hacer preguntas -->
      <div v-if="user != null">
        <h5 class="text-center" >¿Quieres preguntar algo?</h5>

        <!-- Formulario para hacer una pregunta -->
        <form class="d-flex mb-3 mt-4" @submit.prevent="publicarPregunta">
          <div class="input-group d-flex flex-nowrap">
            <div class="input-container flex-grow-1">
              <!-- Campo para escribir la pregunta -->
              <input class="form-control rounded-start-pill" type="text" placeholder="Escribe tu pregunta..." v-model="pregunta">
              
              <!-- Contador de caracteres -->
              <span class="char-counter">{{ pregunta.length }}/{{ maxCaracteresPregunta }} caracteres</span>
            </div>

            <!-- Botón de enviar pregunta -->
            <button type="submit" class="btn btn-preguntar rounded-end-pill">
              Preguntar
            </button>
          </div>
        </form>

        <!-- Switch para filtrar preguntas del usuario -->
        <div class="form-check form-switch my-3">
          <input class="form-check-input" type="checkbox" id="filterUserQuestions" v-model="filtrarPorUsuario" @change="obtenerPreguntas">
          <label class="form-check-label" for="filterUserQuestions">
            Ver mis preguntas
          </label>
        </div>
      </div>

      <!-- Dropdown para ordenar las preguntas -->
      <div class="mb-3">
        <div ref="dropdown" class="dropdown">
          <!-- Botón principal del dropdown -->
          <button class="btn dropdown-toggle" type="button" @click="toggleDropdown">
            Ordenar por: {{ getSelectedFilterLabel() }}
          </button>

          <!-- Menú desplegable con filtros de ordenación -->
          <ul class="dropdown-menu">
            <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('reciente')">Ninguno</a></li>
            <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('reciente')"> Pregunta más reciente</a></li>
            <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('antigua')"> Pregunta más antigua</a></li>
            <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('masRespuestas')"> Pregunta con más respuestas</a></li>
            <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('menosRespuestas')"> Pregunta con menos respuestas</a></li>
          </ul>
        </div>
      </div>

      <!-- Listado de preguntas filtradas y ordenadas -->
      <div v-for="pregunta in preguntasFiltradas" :key="pregunta.id" class="pregunta mb-3 p-3">
        <!-- Título de la pregunta -->
        <h5>{{ pregunta.cuestion }}</h5>

        <!-- Información del autor y la fecha -->
        <p class="mb-1"><strong>Por:</strong> {{ pregunta.nombreUsuario }} <strong>Fecha:</strong> {{ pregunta.fecha }}</p>
        
        <!-- Contador de respuestas (solo visible si aún no se muestran) -->
        <p v-if="!pregunta.mostrarRespuestas" class="mb-2 text-muted">
          <font-awesome-icon :icon="['fas', 'comment']" />
          {{ pregunta.respuestas.length }} respuestas
        </p> 

        <!-- Acciones disponibles para cada pregunta -->
        <div class="d-flex gap-3 align-items-center">
          <!-- Botón para responder (solo si está loggeado) -->
          <button v-if="user != null" class="btn btn-sm btn-outline-secondary" @click="aniadirRespuesta(pregunta.id)"> 
            <font-awesome-icon :icon="['fas', 'reply']" />
            Responder
          </button>

          <!-- Botón para mostrar u ocultar respuestas (si hay respuestas) -->
          <button v-if="pregunta.respuestas.length > 0" @click="toggleVerRespuestas(pregunta.id)" class="btn btn-sm btn-outline-secondary">
            <font-awesome-icon :icon="['fas', 'comment']" />
            {{ pregunta.mostrarRespuestas ? 'Ocultar respuestas' : 'Ver respuestas' }}
            <font-awesome-icon v-if="!pregunta.mostrarRespuestas" :icon="['fas', 'caret-down']"/>
            <font-awesome-icon v-else :icon="['fas', 'caret-down']" style="transform: rotate(180deg);"/>
          </button>

          <!-- Botón para eliminar la pregunta (solo si es del usuario actual) -->
          <button v-if="user && pregunta.usuario.trim().toLowerCase() === user.correo.trim().toLowerCase()" class="btn btn-sm btn-outline-danger" @click="eliminarPregunta(pregunta.id)">
            <font-awesome-icon :icon="['fas', 'trash']" />
            Eliminar
          </button>
        </div>

        <!-- Contenedor de respuestas (si se ha pulsado 'ver respuestas') -->
        <div v-if="pregunta.mostrarRespuestas" class="respuestas mt-3">
          <h6 class="mb-2">Respuestas:</h6>

          <!-- Iteración sobre cada respuesta asociada a la pregunta -->
          <div v-for="respuesta in pregunta.respuestas" :key="respuesta.id" class="respuesta border-top pt-2 mt-2">
            <!-- Mensaje de la respuesta -->
            <p>{{ respuesta.mensaje }}</p>

            <!-- Información del autor de la respuesta y fecha -->
            <p class="text-muted"><strong>Por:</strong> {{ respuesta.nombreUsuario }} &nbsp; <strong>Fecha:</strong> {{ respuesta.fecha }}
              <!-- Botón para eliminar respuesta propia -->
              <button v-if="user && respuesta.usuario.trim().toLowerCase() === user.correo.trim().toLowerCase()" class="btn btn-sm btn-outline-danger ms-2" @click="eliminarRespuesta(respuesta.id)">
                <font-awesome-icon :icon="['fas', 'trash']" />
                  Eliminar
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pie de página -->
    <Footer></Footer>

    <!-- Botón para volver arriba -->
    <button class="back-to-top" @click="scrollTop">
      <!-- Icono de flecha hacia arriba -->
      <font-awesome-icon :icon="['fas', 'chevron-up']" />
    </button>
    
    <!-- Modal para responder a una pregunta -->
    <div v-if="mostrarModal" class="modal-background">
      <div class="modal-dialog modal-dialog-centered"> 
        <div class="modal-content rounded-3 shadow-lg">
          <!-- Cabecera del modal -->
          <div class="modal-header">
            <h4 class="modal-title fw-bold mb-2">Nueva respuesta</h4>
          </div>

          <!-- Cuerpo del modal con formulario de respuesta -->
          <div class="modal-body">
            <form>
              <div>
                <label class="controls mb-1 p-2" for="mensaje">Mensaje:</label>

                <!-- Contenedor del campo de texto -->
                <div class="textarea-container">
                  <textarea v-model="nuevaRespuesta.mensaje" placeholder="Introduce tu respuesta*" required></textarea>
                  
                  <!-- Contador de caracteres para la respuesta -->
                  <span class="char-counter textarea-counter">{{ nuevaRespuesta.mensaje.length }}/{{ maxCaracteresRespuesta }} caracteres</span>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <!-- Botón para cancelar respuesta y cerrar modal -->
            <button type="button" class="btn modal-btn p-2 px-4 me-3 mt-3" @click="cerrarModal">Cancelar</button>
            
            <!-- Botón para enviar respuesta --> 
            <button type="button" class="btn modal-btn p-2 px-4 mt-3" @click="enviarRespuesta">Enviar</button>
          </div>
        </div>
      </div> 
    </div>
  </div>

  <!-- Si el foro está cargando, mostrar componente Cargando -->
  <div v-else>
    <Cargando :dark-mode="darkMode"></Cargando>
  </div>
</template>

<script>
import axios from 'axios';
import NavBar from '@/components/NavBar.vue';
import Cargando from '@/components/Cargando.vue'
import Footer from '@/components/Footer.vue';
import { apiClient } from '../config';
import { Dropdown } from 'bootstrap';

export default {
  name: 'ForoComponent',
  // Declaración de los componentes utilizados en el template
  components: {
    NavBar,
    Footer,
    Cargando
  },
  // Datos del componente
  data() {
    return {
      foro: [],                 // Lista completa de preguntas y respuestas
      dropdownInstance: null,   // Instancia del dropdown de Bootstrap
      nuevaPregunta: {          // Estructura para enviar una nueva pregunta
        usuarioCorreo: "",
        pregunta: ""
      },
      pregunta: "",             // Texto de la pregunta actual que el usuario escribe
      preguntas: "",
      filtrarPorUsuario: false, // Si está activo el filtro "ver solo mis preguntas"
      mostrarModal: false,      // Estado del modal de respuesta
      user: null,               // Usuario autenticado
      nuevaRespuesta: {         // Estructura para enviar una nueva respuesta desde el modal
        pregunta_id: "",
        usuario_respuesta: "",
        mensaje: ""
      },
      darkMode: localStorage.getItem("darkMode") === "true", // Modo oscuro activado/desactivado
      filtroSeleccionado: "reciente", // Filtro actual de ordenación por defecto
      userCache: {},            // Caché de nombres de usuario para evitar llamadas repetidas
      maxCaracteresPregunta: 350,  // Límite de caracteres para preguntas
      maxCaracteresRespuesta: 350, // Límite de caracteres para respuestas
      loading: true             // Indica si el contenido del foro aún está cargando
    };
  },
  computed: {
    // Devuelve el array de preguntas filtradas y ordenadas
    preguntasFiltradas() {
      // Si está activado el filtro y el usuario está autenticado, se devuelven solo las preguntas hechas por el usuario
      let preguntas = this.filtrarPorUsuario && this.user
        ? this.foro.filter(p => p.usuario && this.user.correo && p.usuario.trim().toLowerCase() === this.user.correo.trim().toLowerCase())
        : this.foro;
      
      // si el resultado no es un array, devuelve uno vacío
      if (!Array.isArray(preguntas)) {
        console.error('preguntas no es un array:', preguntas);
        return [];
      }
      
      // Función para convertir fechas tipo DD-MM-YYYY en objetos Date
      const parseCustomDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return new Date(0);
        const [day, month, year] = dateStr.split('-');
        return new Date(`${year}-${month}-${day}`);
      };
      
      // Ordena según el filtro seleccionado
      try {
        switch (this.filtroSeleccionado) {
          case "antigua":
            return [...preguntas].sort((a, b) => parseCustomDate(a.fecha) - parseCustomDate(b.fecha));
          case "reciente":
            return [...preguntas].sort((a, b) => parseCustomDate(b.fecha) - parseCustomDate(a.fecha));
          case "masRespuestas":
            return [...preguntas].sort((a, b) => {
              const aLength = a.respuestas && Array.isArray(a.respuestas) ? a.respuestas.length : 0;
              const bLength = b.respuestas && Array.isArray(b.respuestas) ? b.respuestas.length : 0;
              return bLength - aLength;
            });
          case "menosRespuestas":
            return [...preguntas].sort((a, b) => {
              const aLength = a.respuestas && Array.isArray(a.respuestas) ? a.respuestas.length : 0;
              const bLength = b.respuestas && Array.isArray(b.respuestas) ? b.respuestas.length : 0;
              return aLength - bLength;
            });
          default:
            return preguntas;
        }
      } catch (error) {
        console.error('Error en preguntasFiltradas:', error);
        return preguntas; // Devuelve las preguntas sin ordenar en caso de error
      }
    }
  },
  watch: {
    // Observador para el campo `pregunta`
    // Limita su longitud automáticamente al máximo permitido
    pregunta(newValue) {
      if (newValue.length > this.maxCaracteresPregunta) {
        this.pregunta = newValue.slice(0, this.maxCaracteresPregunta);
      }
    },

    // Observador para el campo `mensaje` dentro de `nuevaRespuesta`
    // Limita automáticamente su longitud máxima
    'nuevaRespuesta.mensaje'(newValue) {
      if (newValue && newValue.length > this.maxCaracteresRespuesta) {
        // Recorta si excede el máximo
        this.nuevaRespuesta.mensaje = newValue.slice(0, this.maxCaracteresRespuesta);
      }
    }
  },
  async mounted() {
    try {
      // Carga datos del usuario
      const response = await apiClient.get("/user");
      this.user = response.data; // Guarda los datos del usuario si existe
      if(this.user == ""){
        this.user = null;
      }
    } catch (error) {
      // Si no hay usuario autenticado, simplemente continúa con los datos públicos
      console.error("Error al cargar los datos del usuario: ", error);
      this.user = null;
    }
    
    try {
      // Carga todas las preguntas y respuestas
      await this.cargarForoCompleto();

      // Aplicar el tema guardado al cargar la página
      this.applyTheme();
      
      // Inicializar dropdown de filtros una vez que el DOM esté listo
      this.$nextTick(() => {
        if (this.$refs.dropdown) {
          this.dropdownInstance = new Dropdown(this.$refs.dropdown);
        } else {
          console.warn("No se encontró el elemento dropdown en el DOM");
        }
      });
    } 
    catch (error) {
      console.error('Error al cargar el foro:', error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    // Cargar preguntas y respuestas del foro
    async cargarForoCompleto() {
      try {
        // Realiza una petición GET a la ruta de la API para obtener el foro completo
        const response = await apiClient.get('/obtenerForoCompleto');
        
        // Verifica que la respuesta contenga un array válido
        if (!response.data || !Array.isArray(response.data)) {
          console.error('La respuesta no contiene un array:', response.data);
          this.foro = [];
          return;
        }
        
        // Formatear preguntas y respuestas recibidas
        const preguntas = response.data.map(p => ({ 
          ...p, 
          mostrarRespuestas: false,
          respuestas: p.respuestas || [] 
        }));

        // Cargar nombres de usuarios para preguntas y respuestas
        for (const pregunta of preguntas) {
          if (pregunta.usuario) {
            pregunta.nombreUsuario = await this.getUserDisplayName(pregunta.usuario);
          } else {
            pregunta.nombreUsuario = 'Usuario desconocido';
          }
          
          // Recorre sus respuestas para obtener el nombre del autor
          for (const respuesta of pregunta.respuestas) {
            if (respuesta.usuario) {
              respuesta.nombreUsuario = await this.getUserDisplayName(respuesta.usuario);
            } else {
              respuesta.nombreUsuario = 'Usuario desconocido';
            }
          }
        }

        this.foro = preguntas;
      } catch (error) {
        console.error('Error al cargar el foro:', error);
        this.foro = []; 
      }
    },

    // Publica una nueva pregunta hecha por el usuario actual
    async publicarPregunta() {
    // Si el campo está vacío, muestra alerta
    if (!this.pregunta) {
        alert('Por favor, escribe una pregunta.');
        return;
      }
      
    // Si excede el máximo de caracteres, muestra alerta
      if (this.pregunta.length > this.maxCaracteresPregunta) {
        alert(`La pregunta no puede exceder los ${this.maxCaracteresPregunta} caracteres.`);
        return;
      }
      
      try {
        // Si el usuario no está logueado, impide continuar
        if (!this.user || !this.user.correo) {
          alert('Debes iniciar sesión para hacer una pregunta.');
          return;
        }
        
        // Guardamos todos los datos necesarios para realizar la consulta
        const nuevaPregunta = {
          usuarioCorreo: this.user.correo,
          pregunta: this.pregunta
        };

        // Petición POST a la API para guardar la pregunta
        const response = await apiClient.post('/preguntas', nuevaPregunta);

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

    // Eliminar una pregunta propia tras la confirmación del usuario
    async eliminarPregunta(preguntaId) {
      // Pregunta al usuario si realmente quiere eliminar
      if (confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) {
        try {
          // Llama a la API para eliminar la pregunta por su ID
          await apiClient.delete(`/BorroPreguntas/${preguntaId}`);

          // Elimina la pregunta del foro sin recargar todo
          this.foro = this.foro.filter(p => p.id !== preguntaId);

          // Notifica al usuario que fue eliminada correctamente
          alert("Pregunta eliminada con éxito.");
        } catch (error) {
          console.error("Error al eliminar la pregunta:", error);
          alert("No se pudo eliminar la pregunta.");
        }
      }
    },

    // Eliminar una respuesta propia tras la confirmación del usuario
    async eliminarRespuesta(respuestaId) {
      // Confirmación previa antes de eliminar
      if (confirm("¿Estás seguro de que quieres eliminar esta respuesta?")) {
        try {
          // Petición DELETE a la API para borrar la respuesta
          await apiClient.delete(`/BorroRespuestas/${respuestaId}`);

          // Recarga todas las preguntas y respuestas 
          await this.cargarForoCompleto(); 

          // Mensaje de éxito tras eliminar la respuesta
          alert("Respuesta eliminada con éxito.");
        } catch (error) {
          console.error("Error al eliminar la respuesta:", error);
          alert("No se pudo eliminar la respuesta.");
        }
      }
    },

    // Devuelve el nombre visible del usuario a partir de su correo
    // Usa caché local para evitar peticiones repetidas a la API
    async getUserDisplayName(correo) {
      // Inicializa el caché si no existe
      if (!this.userCache) {
        this.userCache = {};
      }
      
      // Si no hay correo válido, devuelve texto por defecto
      if (!correo) return 'Usuario desconocido';
      
      // Si ya tenemos el nombre de este usuario se devuelve directamente ese nombre
      if (this.userCache[correo]) {
        return this.userCache[correo];
      }
      
      try {
        // Llama a la API para obtener datos del usuario por correo si no tenemos el usuario
        const response = await apiClient.get(`/usuario/${correo}`);

        // Si existe nombre, lo guarda en el caché y lo devuelve
        if (response.data && response.data.nombre) {
          this.userCache[correo] = response.data.nombre;
          return response.data.nombre;
        } else {
          // Si no hay nombre, guarda y devuelve el correo
          this.userCache[correo] = correo;
          return correo;
        }
      } catch (error) {
        console.error(`Error al obtener datos del usuario ${correo}:`, error);
        this.userCache[correo] = correo;
        return correo;
      }
    },

    // Aplterna entre modo claro y oscuro
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("darkMode", this.darkMode);
      this.applyTheme();
    },

    // Aplica el tema
    applyTheme() {
      document.body.classList.toggle("dark-mode", this.darkMode);
      document.body.classList.toggle("light-mode", !this.darkMode);
    },

    // Muestra/oculta las respuestas de una pregunta concreta
    toggleVerRespuestas(preguntaId) {
      // Busca la pregunta en el array foro según su ID
      const pregunta = this.foro.find(p => p.id === preguntaId);

      // Si se encuentra, cambia el valor de mostrarRespuestas
      if (pregunta) {
        pregunta.mostrarRespuestas = !pregunta.mostrarRespuestas;
      }
    },

    // Prepara el modal para responder a una pregunta específica
    aniadirRespuesta(preguntaId) {
      // Si el usuario no está autenticado, se muestra una alerta
      if (!this.user || !this.user.correo) {
        alert('Debes iniciar sesión para responder.');
        return;
      }
      
      // Estructura de nuevaRespuesta con los datos necesarios
      this.nuevaRespuesta = {
        pregunta_id: preguntaId,
        usuario_respuesta: this.user.correo,
        mensaje: ""
      };

      // Abre el modal
      this.mostrarModal = true; 
    },

    // Cierra modal sin enviar
    cerrarModal() {
      this.mostrarModal = false; 
    },

    // Enviar la respuesta escrita desde el modal por el usuario
    async enviarRespuesta() {
      // Valida que el campo no esté vacío
      if (!this.nuevaRespuesta.mensaje) {
        alert("El mensaje de la respuesta es obligatorio");
        return;
      }
      
      // Valida que no supere el límite de caracteres
      if (this.nuevaRespuesta.mensaje.length > this.maxCaracteresRespuesta) {
        alert(`La respuesta no puede exceder los ${this.maxCaracteresRespuesta} caracteres.`);
        return;
      }
      
      // Valida que no falten datos
      try {
        if (!this.nuevaRespuesta.pregunta_id || !this.nuevaRespuesta.usuario_respuesta) {
          alert('Información incompleta. Por favor, inténtalo de nuevo.');
          return;
        }
        
        // Guardamos todos los datos necesarios para realizar la consulta
        const nuevaRespuesta = {
          pregunta_id: this.nuevaRespuesta.pregunta_id,
          usuario_respuesta: this.nuevaRespuesta.usuario_respuesta,
          mensaje_respuesta: this.nuevaRespuesta.mensaje
        };

        // Envío de la respuesta a la API mediante POST
        const response = await apiClient.post('/agregarRespuesta', nuevaRespuesta);

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

    // Obtiene todas las preguntas (filtradas si el usuario está logueado)
    async obtenerPreguntas() {
      try {
        const usuarioCorreo = this.filtrarPorUsuario && this.user ? this.user.correo : null;

        // Si se quiere filtrar pero no hay sesión iniciada, se desactiva el filtro
        if (this.filtrarPorUsuario && !this.user) {
          this.filtrarPorUsuario = false;
          alert('Debes iniciar sesión para filtrar por tus preguntas');
          return;
        }

        // Cargar todo el foro para obtener la lista actualizada
        await this.cargarForoCompleto();
        
      } catch (error) {
        console.error("Error al obtener preguntas:", error);
      }
    },

        // Mostrar/ocultar menú de filtros
        toggleDropdown() {
      if (this.dropdownInstance) {
        // Si ya está inicializado, alterna visibilidad
        this.dropdownInstance.toggle();
      } else {
        // Si no está inicializado pero existe el elemento, lo crea
        if (this.$refs.dropdown) {
          this.dropdownInstance = new Dropdown(this.$refs.dropdown);
          this.dropdownInstance.toggle();
        } else {
          console.error('No se pudo encontrar el elemento dropdown');
        }
      }
    },

    // Cambiar el filtro de ordenación seleccionado
    seleccionarFiltro(filtro) {
      // Asigna el nuevo filtro seleccionado
      this.filtroSeleccionado = filtro;  
      
      // Cierra el menú desplegable
      if (this.dropdownInstance) {
        this.dropdownInstance.hide();
      } else {
        // Si no existe la instancia, intentar inicializarla
        if (this.$refs.dropdown) {
          this.dropdownInstance = new Dropdown(this.$refs.dropdown);
          this.dropdownInstance.hide();
        }
      }
    },

    // Cambia el filtro de ordenación (igual que seleccionarFiltro, pero solo cambia el valor y oculta)
    cambiarFiltro(filtro) {
      this.filtroSeleccionado = filtro;
      
      // En lugar de manipular el DOM directamente, usamos la instancia del dropdown
      if (this.dropdownInstance) {
        this.dropdownInstance.hide();
      }
    },

    // Devuelve la etiqueta legible del filtro actual
    getSelectedFilterLabel() {
      const filterLabels = {
        'reciente': 'Pregunta más reciente',
        'antigua': 'Pregunta más antigua',
        'masRespuestas': 'Pregunta con más respuestas',
        'menosRespuestas': 'Pregunta con menos respuestas'
      };
      return filterLabels[this.filtroSeleccionado] || 'Ordenar';
    },

    // Cierra el dropdown si se hace clic fuera
    closeDropdownOnClickOutside(event) {
      if (this.$refs.dropdown && !this.$refs.dropdown.contains(event.target)) {
        this.mostrarDropdown = false;
      }
    },

    // Hace scroll hasta arriba de la página
    scrollTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};
</script>

<style scoped>

/* Estilo general para la página del foro */
.page-wrapper {
  min-height: 100vh;
}

/* Botón flotante para volver arriba */
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

/* Estilos para cada bloque de pregunta */
.pregunta {
  background-color: var(--color-fondo);
  color: var(--color-texto);
  border: 1px solid #bbb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

/* Estilo para textos secundarios */
.text-muted {
  color: var(--color-texto) !important;
  opacity: 0.8;
}

/* Fondo semitransparente para modales */
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

/* Estilo del contenido del modal */
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

/* Estilos para el campo de texto del modal */
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
  padding-right: 65px;
}

/* Botón personalizado para enviar preguntas */
.btn-preguntar {
  background-color: var(--color-boton);
  color: var(--color-texto-boton);
  border: none;
  transition: filter 0.2s ease;
}
.btn-preguntar:hover {
  filter: brightness(0.9);
}

/* Título principal del foro */
.titulo {
  text-align: center;
  font-weight: bold;
  font-size: 2rem;
  color: var(--color-texto);
  margin: 30px 0;
}

/* Cabecera con el título y el switch de tema */
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Contenedor para inputs con contador de caracteres */
.input-container {
  position: relative;
}

/* Campo de texto que deja espacio a la derecha para el contador */
.input-container input {
  padding-right: 65px;
}

/* Estilo del contador de caracteres */
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
  pointer-events: none;
}

/* Input ocupa toda la altura del contenedor */
.form-control {
  height: 100%; 
}
</style>
<template>
  <!-- Solo muestra el contenido si ya está cargado -->
  <div v-if="!loading" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <!-- Barra de navegación superior -->    
    <NavBar :dark-mode="darkMode"  :user="user"></NavBar>
    
    <!-- Contenido principal -->
    <div v-if="libro" class="container-fluid pt-4 p-5 min-vh-100">
      <!-- Switch con iconos sol/luna para cambiar entre modo claro y oscuro -->
      <div class="theme-switch-wrapper mb-1">
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
      
      <!-- Información del libro: sección principal dividida en dos columnas -->
      <div class="row mt-2">
        <!-- Columna izquierda: imagen de portada y botón para leer -->
        <div class="col-md-4 d-flex flex-column align-items-center">
          <!-- Muestra la portada del libro seleccionado y su información -->
          <img :src="libro.imagen_portada" class="img-fluid" alt="Portada del libro">
          <p class="mb-3 text-center cursiva">{{ libro.nombre }}</p>
          <!-- Botón para leer el libro que abre el visor PDF -->
          <button class="btn btn-primary" @click="leerLibro">
            <font-awesome-icon :icon="['fas', 'book-open']" /> Leer
          </button>
        </div>
        
        <!-- Columna derecha: detalles del libro, valoraciones y reseñas -->
        <div class="col-md-8">
          <!-- Encabezado con título, autor y opciones de interacción -->
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4 class="titulo">{{ libro.nombre }}</h4>
              <h4>de: {{ libro.autor }}</h4>
              <!-- Opciones disponibles solo para usuarios autenticados -->
              <div v-if="user != null">
                <!-- Botón para añadir/quitar de favoritos -->
                <font-awesome-icon :icon="[ isFavorito ? 'fas' : 'far', 'heart' ]" class="heart-icon" @click="toggleFavorito"/>
                <!-- Botón para añadir el libro a una lista personalizada -->
                <button class="btn" @click="abrirModalListas(libro)">Añadir a lista</button>
              </div>
            </div>
          </div>

          <!-- Sección de libros relacionados del mismo autor -->
          <div v-if="librosRelacionados.length > 0">
            <hr class="my-3">
            <h5>Más de {{ libro.autor }}</h5>
            <div class="row">
              <!-- Lista horizontal de portadas de otros libros del mismo autor -->
              <div v-for="(libroRelacionado, index) in librosRelacionados" :key="index" class="col-md-3">
                <img :src="libroRelacionado.imagen_portada" class="libro-relacionado-img" alt="Portada" @click="goToDetalles(libroRelacionado)">
              </div>
            </div>
          </div>
          
          <!-- Sección de sinopsis del libro -->
          <hr class="my-3">
          <h4>Sinopsis</h4>
          <p class="text-justify">{{ libro.resumen }}</p>

          <!-- Información técnica del libro: páginas, tiempo de lectura, palabras -->
          <hr class="my-3">
          <h5>Acerca de este libro</h5>
          <div class="d-flex align-items-center">
            <!-- Páginas -->
            <div class="d-flex align-items-center me-3">
              <font-awesome-icon :icon="['fas', 'book-open']" class="me-2" />
              <p class="mb-0">{{ libro.num_paginas }} Páginas</p>
            </div>
            <!-- Tiempo de lectura -->
            <div class="d-flex align-items-center mx-3 border-start border-end px-3">
              <font-awesome-icon :icon="['fas', 'clock']" class="me-2" />
              <p class="mb-0">{{ libro.horas_lectura }} Horas de lectura</p>
            </div>
            <!-- Total de palabras -->
            <div class="d-flex align-items-center">
              <font-awesome-icon :icon="['fas', 'file-word']" class="me-2" />
              <p class="mb-0">{{ libro.num_palabras }} Total de palabras</p>
            </div>
          </div>

          <!-- Sección de valoraciones: resumen y estadísticas -->
          <hr class="my-3">
          <div class="col-md-8">
            <h5>Valoraciones del libro:</h5>
            <div class="d-flex justify-content-between align-items-center">
              <!-- Valoración media y botón para añadir nueva valoración -->
              <div>
                <p class="mb-1"> Valoración general</p>
                <p> {{ libro.puntuacion_media.toFixed(2) }} de 5</p>
                <div class="d-flex">
                  <!-- Estrellas de valoración media -->
                  <span v-for="(icon, idx) in getStarIcons(libro.puntuacion_media)" :key="idx">
                      <font-awesome-icon :icon="['fas', icon]"/> 
                  </span>
                  <p>({{conteoValoraciones.total}})</p>
                </div>
                <!-- Botón para añadir valoración solo para usuarios autenticados -->
                <div v-if="user != null" class="pt-2">
                  <button class="btn" @click="aniadirValoracion(libro)">+ Añadir Valoración</button>
                </div>
              </div>
              <!-- Desglose de valoraciones por número de estrellas -->
              <div>
                <!-- Muestra el conteo para cada nivel de valoración (5 estrellas, 4 estrellas, etc.) -->
                <p class="mb-1"> 
                  <span v-for="(icon, idx) in getStarIcons(5)" :key="idx">
                    <font-awesome-icon :icon="['fas', icon]" />
                  </span>
                  {{ conteoValoraciones[5] }}</p>
                <p class="mb-1"> 
                  <span v-for="(icon, idx) in getStarIcons(4)" :key="idx">
                    <font-awesome-icon :icon="['fas', icon]" />
                  </span>
                  {{ conteoValoraciones[4] }}</p>
                <p class="mb-1"> 
                  <span v-for="(icon, idx) in getStarIcons(3)" :key="idx">
                    <font-awesome-icon :icon="['fas', icon]" />
                  </span>
                  {{ conteoValoraciones[3] }}</p>
                <p class="mb-1"> 
                  <span v-for="(icon, idx) in getStarIcons(2)" :key="idx">
                    <font-awesome-icon :icon="['fas', icon]" />
                  </span>
                  {{ conteoValoraciones[2] }}</p>
                <p class="mb-1"> 
                  <span v-for="(icon, idx) in getStarIcons(1)" :key="idx">
                    <font-awesome-icon :icon="['fas', icon]" />
                  </span>
                  {{ conteoValoraciones[1] }}</p>
              </div>
            </div>
          </div>

          <!-- Sección de reseñas completas con opciones de filtrado -->
          <hr class="my-3">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Todas las reseñas del libro</h5>
            <!-- Dropdown para ordenar las reseñas -->
            <div ref="dropdown" class="dropdown">
              <button class="btn dropdown-toggle" type="button" @click="toggleDropdown">
                Ordenar por: {{ getSelectedFilterLabel() }}
              </button>
              <!-- Opciones de ordenación -->
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('reciente')">Ninguno</a></li>
                <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('alta')"> Valoración más alta</a></li>
                <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('baja')"> Valoración más baja</a></li>
                <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('antigua')"> Valoración más antigua</a></li>
                <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('reciente')"> Valoración más reciente</a></li>
              </ul>
            </div>
          </div>

          <!-- Lista de reseñas ordenadas según el filtro aplicado -->
          <hr class="my-3">
          <div v-if="valoracionesOrdenadas.length > 0">
            <!-- Recorre y muestra cada valoración/reseña -->
            <div v-for="valoracion in valoracionesOrdenadas" :key="valoracion.id" class="valoracion">
              <p class="mb-1">
                <strong>{{ valoracion.titulo_resena }}</strong>
                <!-- Estrellas de la valoración individual -->
                <span v-for="(icon, i) in getStarIcons(valoracion.valor)" :key="i">
                  <font-awesome-icon :icon="['fas', icon]" />
                </span>
              </p>
              <p class="mb-1">{{ valoracion.mensaje }}</p>
              <p>Por {{valoracion.nombreUsuario }} el {{ new Date(valoracion.fecha).toLocaleDateString() }}</p>
              <hr>
            </div>
          </div>
          <!-- Mensaje cuando no hay valoraciones -->
          <div v-else>
            <p>No hay valoraciones todavía.</p>
          </div>
        </div>        
      </div>
    </div>
    <!-- Spinner de carga mientras se obtienen los datos del libro -->
    <div v-else class="container mt-4 text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    
    <!-- Componentes fijos: footer y botón para volver arriba -->
    <Footer></Footer>
    <button class="back-to-top" @click="scrollTop">
      <font-awesome-icon :icon="['fas', 'chevron-up']" />
    </button>

    <!-- MODALES -->
    <!-- Modal para añadir nueva valoración -->
    <div v-if="mostrarModal" class="modal-background">
      <div class="modal-dialog modal-dialog-centered"> 
        <div class="modal-content bg-dark text-white rounded-3 shadow-lg">
          <div class="modal-header">
            <h4 class="modal-title fw-bold mb-4">Nueva valoración</h4>
          </div>
          <div class="modal-body">
            <!-- Formulario para la nueva valoración -->
            <form>
              <!-- Campo de título de la reseña -->
              <div>
                <label class="controls mb-3 p-2" for="titulo">Título:</label>
                <input type="text" v-model="nuevaValoracion.titulo_resena" placeholder="Introduce tu título" required>
              </div>
              <!-- Campo para el texto de la reseña -->
              <div>
                <label class="controls mb-3 p-2" for="mensaje">Mensaje:</label>
                <textarea v-model="nuevaValoracion.mensaje" placeholder="Introduce tu valoración" required></textarea>
              </div>
              <!-- Selector de estrellas para la puntuación -->
              <div>
                <label class="controls mb-3 p-2">Puntuación:</label>
                <div class="d-flex align-items-center mb-3">
                  <font-awesome-icon
                    v-for="i in 5"
                    :key="i"
                    :icon="[i <= nuevaValoracion.valor ? 'fas':'far', 'star']"
                    class="star"
                    :class="{ filled: i <= nuevaValoracion.valor }"
                    @click="nuevaValoracion.valor = i"
                  />
                </div>
              </div>
            </form>
          </div>
          <!-- Botones de acción del modal de valoración -->
          <div class="modal-footer">
            <button type="button" class="btn-enviar p-2 px-4 me-3 mb-2" @click="enviarValoracion">Enviar</button>
            <button type="button" class="btn-cancelar p-2 px-4 mb-2" @click="cerrarModal">Cancelar</button>
          </div>
        </div>
      </div> 
    </div>

    <!-- Modal para seleccionar listas donde guardar el libro -->
    <div v-if="modalListasAbierto" class="modal-background">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white rounded-3 shadow-lg">
          <div class="modal-header">
            <h4 class="modal-title fw-bold mb-4 mx-4">Guardar en...</h4>
          </div>
          <!-- Lista de las listas disponibles del usuario -->
          <div v-if="listasUsuario.length > 0">
            <div class="modal-body">
              <ul class="list-group">
                <!-- Por cada lista del usuario, mostrar una opción con checkbox -->
                <li v-for="lista in listasUsuario" :key="lista.id" class="list-group-li bg-dark">
                  <div class="d-flex align-items-center w-100 px-3 py-2">
                    <!-- Checkbox personalizado para indicar si el libro ya está en la lista -->
                    <div class="custom-checkbox me-3" @click="toggleLibroEnLista(lista)">
                      {{ seleccionadas.includes(lista.nombre) ? '✓' : '' }}
                    </div>
                    <span class="list-name me-2">{{ lista.nombre }}</span>
                    <!-- Icono que indica si la lista es pública o privada -->
                    <span :title="lista.publica ? 'Lista pública' : 'Lista privada'">
                      {{ lista.publica ? '🔓' : '🔒' }}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <!-- Mensaje cuando no hay listas creadas -->
          <div v-else class="mt-3 px-4">
            <p>No tienes ninguna lista creada.</p>
          </div>
          <hr class="my-3">
          <!-- Botón para crear una nueva lista -->
          <div class="text-start px-4">
            <button class="btn w-100 text-start" @click="irACrearListas">+ Nueva lista</button>
          </div>
          <!-- Botón para cerrar el modal de listas -->
          <div class="mt-3 text-end px-4 mb-3">
            <button class="btn btn-cancelar" @click="cerrarModalListas">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Componente de carga mientras se inicializa toda la página -->
  <div v-else>
    <Cargando :dark-mode="darkMode"></Cargando>
  </div>
</template>
<script>
import axios from 'axios';
import NavBar from '@/components/NavBar.vue'
import Cargando from '@/components/Cargando.vue'
import Footer from '@/components/Footer.vue'
import { apiClient } from '../config';
import { Dropdown } from 'bootstrap';

export default {
  name: 'Detalles',
  components: {
    NavBar,
    Footer,
    Cargando
  },
  data() {
    return {
      user: null,                // Almacena información del usuario autenticado
      libro: null,               // Almacena información del libro actual
      librosRelacionados: [],    // Lista de libros del mismo autor
      mostrarModal: false,       // Controla visibilidad del modal de valoración
      modalListasAbierto: false, // Controla visibilidad del modal de listas
      dropdownInstance: null,    // Instancia del dropdown de Bootstrap
      seleccionadas: [],         // Almacena las listas que contienen el libro actual
      listasUsuario: [],         // Almacena todas las listas de un usuario
      listas: {                  // Objeto para gestionar la relación libro-lista
        usuario_id: "",
        libro_id: "",
        nombreLista: ""
      },
      libroSeleccionado: null,   // Libro seleccionado para añadir a listas
      valoraciones: [],          // Almacena todas las valoraciones del libro
      filtroSeleccionado: "reciente", // Filtro aplicado a valoraciones
      nuevaValoracion: {         // Estructura para nueva valoración
        usuario_id: "", 
        libro_id: "", 
        titulo_resena: "", 
        mensaje: "", 
        valor: 1
      },
      conteoValoraciones: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 }, // Contador de valoraciones por estrellas
      darkMode: localStorage.getItem("darkMode") === "true", // Estado del tema oscuro
      isFavorito: false,         // Indica si el libro está en favoritos
      userCache: {},             // Caché para evitar peticiones repetidas de usuarios
      loading: true              // Estado de carga inicial
    };
  },
  computed: {
    // Calcula las valoraciones ordenadas según el filtro seleccionado
    valoracionesOrdenadas() {
      let ordenadas = [...this.valoraciones];

      switch (this.filtroSeleccionado) {
        case "alta":
          ordenadas.sort((a, b) => b.valor - a.valor);          // Ordena de mayor a menor valoración
          break;
        case "baja":
          ordenadas.sort((a, b) => a.valor - b.valor);          // Ordena de menor a mayor valoración
          break;
        case "antigua":
          ordenadas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // Ordena por fecha más antigua
          break;
        case "reciente":
        default:
          ordenadas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Ordena por fecha más reciente
          break;
      }
      return ordenadas;
    }
  },

  async mounted() {
    try {
      console.log("Componente montado.");
      // Obtener información del usuario
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

      // Obtener detalles del libro desde la API usando el ID de la ruta
      const libroId = encodeURIComponent(this.$route.params.id);
      const response = await apiClient.get(`/libros/titulo/${libroId}`);
      this.libro = response.data;

      // Si se obtiene el libro correctamente, carga datos adicionales
      if (this.libro) {
        await this.comprobarFavorito();             // Verifica si está en favoritos
        await this.obtenerLibrosDelMismoAutor();    // Busca libros relacionados
        await this.obtenerConteoValoraciones();     // Obtiene estadísticas de valoraciones
        await this.obtenerValoraciones();           // Carga las valoraciones completas
      }

      // Aplica el tema guardado (claro/oscuro) al cargar la página
      this.applyTheme();
      // Usa nextTick para asegurarte de que el DOM está actualizado
      this.$nextTick(() => {
        if (this.$refs.dropdown) {
          this.dropdownInstance = new Dropdown(this.$refs.dropdown);
          console.log("Dropdown inicializado:", this.dropdownInstance);
        } else {
          console.warn("No se encontró el elemento dropdown en el DOM");
        }
      });
    } catch (error) {
      console.error('Error al cargar los detalles del libro:', error);
    } finally {
      this.loading = false;  // Finaliza el estado de carga
    }
  },
  watch: {
    // Observa cambios en la ruta y vuelve a cargar los detalles del libro
    '$route.params.id': async function() {
      await this.cargarDetallesLibro();
    }
  },
  methods: {
    // Añade un libro a una lista específica del usuario
    async aniadirALista(lista) {
      try {
        const listas = {
          usuario_id: this.user.correo,
          libro_id: this.libro.enlace,
          nombreLista: lista,
        };

        console.log(`Añadiendo libro ${this.libro.enlace} a la lista ${lista}`);

        const response = await apiClient.post(`/listas/${lista}`, listas);
        console.log("Respuesta:", response.data);

        alert(`Libro añadido a la lista ${lista} correctamente`);
        await this.comprobarFavorito();  // Actualiza estado de favoritos
      } catch (error) {
          if (error.response && error.response.status === 409) {
            alert(`El libro ya está en la lista "${lista}".`);
          } else {
            console.error("Error al añadir libro a la lista:", error);
            alert("Hubo un error al añadir el libro a la lista.");
          }
      }
    },
    
    // Elimina un libro de una lista específica del usuario
    async eliminarDeLista(lista) {
      try {
        const listas = {
          usuario_id: this.user.correo,
          libro_id: this.libro.enlace,
          nombreLista: lista,
        };

        console.log(`Eliminando libro ${this.libro.enlace} de la lista ${lista}`);

        // Envía petición DELETE con cuerpo (debe enviarse como data)
        const response = await apiClient.delete(`/listas/${lista}`, { 
          data: listas 
        });

        console.log("Respuesta de eliminación:", response.data);
        alert(`Libro eliminado de la lista ${lista} correctamente`);
        await this.comprobarFavorito();  // Actualiza estado de favoritos
      } catch (error) {
        console.error("Error completo al eliminar de lista:", error);
        if (error.response && error.response.status === 409) {
          alert(`El libro no está en la lista "${lista}".`);
        } else {
          console.error("Error al eliminar libro de la lista:", error);
          if (!this.modalListasAbierto) {
            alert("Hubo un error al eliminar el libro de la lista.");
          }
        }
      }
    },
    
    // Obtiene el nombre de usuario para mostrar, con caché para optimizar
    async getUserDisplayName(correo) {
      // Revisar primero el caché para evitar llamadas API innecesarias
      if (this.userCache[correo]) {
        return this.userCache[correo];
      }
      
      try {
        // Solo hace la llamada API si no tiene el usuario en caché
        const response = await apiClient.get(`/usuario/${correo}`);
        if (response.data && response.data.nombre) {
          // Guarda en caché para uso futuro
          this.userCache[correo] = response.data.nombre;
          return response.data.nombre;
        } else {
          // Usa correo como alternativa si el nombre no está disponible
          this.userCache[correo] = correo;
          return correo;
        }
      } catch (error) {
        console.error(`Error al obtener datos del usuario ${correo}:`, error);
        // Si la llamada API falla, usa correo como alternativa
        this.userCache[correo] = correo;
        return correo;
      }
    },
    
    // Genera un array de iconos para representar la puntuación con estrellas
    getStarIcons(rating) {
      const icons = [];
      const fullStars = Math.floor(rating);           // Entero de la puntuación
      const fraction = rating - fullStars;            // Parte decimal

      for (let i = 0; i < fullStars; i++) {
        icons.push('star');                          // Añade estrellas completas
      }
      if (fraction >= 0.25 && fraction <= 0.75) {
        icons.push('star-half');                     // Añade media estrella si procede
      } else if (fraction > 0.75) {
        icons.push('star');                          // Añade estrella completa si la fracción es alta
      }

      return icons;
    },
    
    // Verifica si el libro actual está en favoritos del usuario
    async comprobarFavorito() {
      if (!this.user) {
        this.isFavorito = false; // Si no hay usuario, no puede ser favorito
        return;
      }
        try {
          const response = await apiClient.get(`/listas/favoritos/${encodeURIComponent(this.user.correo)}`);
          if (response.status === 200 && response.data) {
            const librosFavoritos = response.data;
            // Busca si el libro actual está en la lista de favoritos
            this.isFavorito = librosFavoritos.some(item => item.enlace_libro === this.libro.enlace);
          } else {
            console.warn("La consulta no devolvió datos válidos.");
            this.isFavorito = false;
          }
        } catch (error) {
          console.error("Error al comprobar favoritos:", error);
          this.isFavorito = false;
        }
    },
    
    // Alterna el estado de favorito para el libro actual
    async toggleFavorito() {
      if (!this.isFavorito) {
        try {
          const favoritos = {
            usuario_id: this.user.correo,
            enlace_libro: this.libro.enlace
          };

          console.log("Usuario ID:", favoritos.usuario_id);
          console.log("Libro ID:", favoritos.enlace_libro);

          // Añade el libro a favoritos
          const response = await apiClient.post('/listas/favoritos', favoritos);
          alert(response.data.mensaje);
          this.isFavorito = true; // Cambia el ícono a sólido

          this.nuevaValoracion = {
            usuario_id: "", 
            libro_id: "" 
          };
        } catch (error) {
          if (error.response) {
            console.error("Error al añadir a favoritos:", error);
            alert("Hubo un error al guardar tu libro en favoritos.");
          }
        }
      } else {
        try {
          const data = {
            usuario_id: this.user.correo,
            enlace_libro: this.libro.enlace
          };

          // Elimina el libro de favoritos
          const response = await apiClient.delete("/listas/favoritos", { data });
          alert(response.data.mensaje);
          this.isFavorito = false; // Cambia el ícono a regular
        } catch (error) {
          console.error("Error al eliminar de favoritos:", error);
          alert("Hubo un error al eliminar tu libro de favoritos.");
        }
      }
    },
    
    // Prepara el formulario para añadir una valoración a un libro
    aniadirValoracion(libro) {
      this.nuevaValoracion = {
        usuario_id: this.user.correo,
        libro_id: libro.id,
        titulo_resena: "",
        mensaje: "",
        valor: null
      };
      this.mostrarModal = true; // Abre el modal de valoración
    },
    
    // Cierra el modal de valoración
    cerrarModal() {
      this.mostrarModal = false;
    },
    
    // Envía una nueva valoración/reseña a la API
    async enviarValoracion() {
      if (!this.nuevaValoracion.mensaje) {
        alert("El mensaje de la valoración es obligatorio");
        return;
      }
      try {
        // Prepara todos los datos necesarios para la valoración
        const nuevaValoracion = {
          usuario_id: this.user.correo,
          libro_id: this.libro.enlace,
          titulo_resena: this.nuevaValoracion.titulo_resena,
          mensaje: this.nuevaValoracion.mensaje,
          valor: this.nuevaValoracion.valor
        };

        console.log("Enviando los siguientes datos de valoración:");
        console.log("Usuario ID:", nuevaValoracion.usuario_id);
        console.log("Libro ID:", nuevaValoracion.libro_id);
        console.log("Título de la Reseña:", nuevaValoracion.titulo_resena);
        console.log("Mensaje:", nuevaValoracion.mensaje);
        console.log("Puntuación:", nuevaValoracion.valor);
        
        // Envía la valoración a la API
        const response = await apiClient.post('/opiniones', nuevaValoracion);
        console.log('Valoración añadida con éxito:', response.data);

        // Cerrar el modal después de enviar la valoración
        this.cerrarModal();

        // Actualiza los datos de la página
        await this.cargarDetallesLibro();
        await this.obtenerConteoValoraciones();
        await this.obtenerValoraciones();

        // Limpia el formulario para futuras valoraciones
        this.nuevaValoracion = {
          usuario_id: "", 
          libro_id: "", 
          titulo_resena: "", 
          mensaje: "", 
          valor: null
        };

        // Notifica al usuario
        alert("Tu valoración ha sido publicada.");
      } catch (error) {
        console.error('Error al enviar la valoración:', error);
        alert("Hubo un error al enviar tu valoración. Inténtalo de nuevo.");
      }
    },
    
    // Obtiene estadísticas de valoraciones por cada nivel (1-5 estrellas)
    async obtenerConteoValoraciones() {
      try {
        // Reinicia el contador para cada nueva consulta
        this.conteoValoraciones = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 };
        
        // Consulta las valoraciones para cada nivel (de 5 a 1)
        for (let valor = 5; valor >= 1; valor--) {
          const response = await apiClient.get(`/opiniones/valoracion/${encodeURIComponent(this.libro.enlace)}/${valor}`);
          const valoraciones = response.data;

          // Cuenta las valoraciones por cada valor
          valoraciones.forEach((valoracion) => {
            // Asegura que el valor es un número entero
            const valorNumerico = parseInt(valoracion.valor);
            if (this.conteoValoraciones[valorNumerico] !== undefined) {
              this.conteoValoraciones[valorNumerico]++;
              this.conteoValoraciones.total++;
            }
          });
        }

        console.log("Conteo de valoraciones:", this.conteoValoraciones);
        
      } catch (error) {
        console.error("Error al obtener el conteo de las valoraciones:", error);
      }
    },
    
    // Obtiene todas las valoraciones completas del libro actual
    async obtenerValoraciones() {
      try {
        const response = await apiClient.get(`/opiniones/${encodeURIComponent(this.libro.enlace)}`);
        this.valoraciones = response.data;
        
        // Obtiene los nombres de usuario para cada valoración
        for (const valoracion of this.valoraciones) {
          valoracion.nombreUsuario = await this.getUserDisplayName(valoracion.usuario_id);
        }
      } catch (error) {
        console.error("Error al obtener las valoraciones:", error);
      }
    },
    
    // Carga los detalles del libro actual desde la API
    async cargarDetallesLibro() {
      try {
        const libroId = encodeURIComponent(this.$route.params.id);
        const response = await apiClient.get(`/libros/titulo/${libroId}`);
        this.libro = response.data;
        if (this.libro) {
          await this.obtenerLibrosDelMismoAutor();
        }
      } catch (error) {
        console.error('Error al cargar los detalles del libro:', error);
      }
    },
    
    // Obtiene otros libros del mismo autor para recomendaciones
    async obtenerLibrosDelMismoAutor() {
      try {
        const response = await apiClient.get(`/libros/autor/${encodeURIComponent(this.libro.autor)}`);
        // Filtra para excluir el libro actual de las recomendaciones
        this.librosRelacionados = response.data.filter(libro => libro.enlace !== this.libro.enlace);
      } catch (error) {
        console.error('Error al obtener libros del mismo autor:', error);
      }
    },
    
    // Navega a la página de detalles de otro libro
    goToDetalles(libro) {
      this.$router.push({ name: 'Detalles', params: { id: libro.nombre } });
    },
    
    // Alterna entre modo oscuro y claro
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("darkMode", this.darkMode); // Guarda la preferencia
      this.applyTheme();
    },
    
    // Aplica el tema seleccionado (claro/oscuro) a la página
    applyTheme() {
      document.body.classList.toggle("dark-mode", this.darkMode);
      document.body.classList.toggle("light-mode", !this.darkMode);
    },
    
    // Abre el visor de PDF para leer el libro
    leerLibro() {
      console.log("Botón 'Leer' presionado");
      
      if (this.libro && this.libro.enlace) {
        console.log("📖 Datos del libro:", this.libro);
        
        // Extrae el ID del archivo desde la URL de Google Drive
        const driveIdMatch = this.libro.enlace.match(/\/d\/(.*?)\//);
        
        if (!driveIdMatch || !driveIdMatch[1]) {
          alert("❌ Error: No se pudo extraer la ID del archivo PDF.");
          return;
        }

        // Construye la URL del proxy para acceder al PDF
        const fileId = driveIdMatch[1];
        const pdfUrl = `${apiClient.defaults.baseURL}/proxy-pdf?url=https://drive.google.com/uc?id=${fileId}&export=download`;

        console.log("✅ Redirigiendo al visor con URL:", pdfUrl);

        // Redirecciona al visor de PDF con la URL como parámetro
        this.$router.push({
          path: "/visor-pdf",
          query: { url: pdfUrl }
        });
      } else {
        alert("❌ Este libro no tiene un PDF disponible.");
      }
    },
    
    // Abre el modal para seleccionar listas donde guardar el libro
    async abrirModalListas(libro) {
      this.libroSeleccionado = libro;
      // Primero obtiene las listas actualizadas
      await this.obtenerListasUsuario();
      // Luego verifica en cuáles está el libro
      await this.obtenerListasDelLibro(libro);
      // Muestra el modal
      this.modalListasAbierto = true;
    },
    
    // Cierra el modal de selección de listas
    cerrarModalListas() {
      this.modalListasAbierto = false;
    },
    
    // Función para volver al inicio de la página con animación suave
    scrollTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    // Cambia el filtro de ordenación de valoraciones
    cambiarFiltro(filtro) {
      console.log("Cambiando filtro a:", filtro);
      this.filtroSeleccionado = filtro;
      
      // En lugar de manipular el DOM directamente, usamos la instancia del dropdown
      if (this.dropdownInstance) {
        this.dropdownInstance.hide();
      }
    },
    
    // Obtiene la etiqueta del filtro seleccionado para mostrar en botón
    getSelectedFilterLabel() {
      const filterLabels = {
        'alta': 'Valoración más alta',
        'baja': 'Valoración más baja',
        'antigua': 'Valoración más antigua',
        'reciente': 'Valoración más reciente'
      };
      return filterLabels[this.filtroSeleccionado] || 'Ordenar';
    },
    
    // Selecciona un filtro y cierra el dropdown
    seleccionarFiltro(filtro) {
      this.filtroSeleccionado = filtro;  // Establecer directamente el filtro
      
      // Cerrar el dropdown usando la instancia
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
    
    // Alterna la visibilidad del dropdown
    toggleDropdown() {
      if (this.dropdownInstance) {
        this.dropdownInstance.toggle();
      } else {
        // Reintentar inicializar el dropdown
        if (this.$refs.dropdown) {
          this.dropdownInstance = new Dropdown(this.$refs.dropdown);
          this.dropdownInstance.toggle();
        } else {
          console.error('No se pudo encontrar el elemento dropdown');
        }
      }
    },
    
    // Navega a la página de creación de listas
    irACrearListas() {
      this.$router.push({ name: 'CrearEditarLista', params: { hacer: 'Crear' } });
    },
    
    // Obtiene todas las listas creadas por el usuario actual
    async obtenerListasUsuario() {
      try {
        const response = await apiClient.get(`/listas/${encodeURIComponent(this.user.correo)}`);
        // Filtra las listas especiales del sistema
        this.listasUsuario = response.data
          .filter(lista => lista.nombre !== "Mis Favoritos" && lista.nombre !== "Leídos" && lista.nombre !== "En proceso");
        console.log("Listas actualizadas:", this.listasUsuario);
      } catch (error) {
        console.error("Error al obtener las listas del usuario:", error);
      }
    },
    
    // Verifica en qué listas está guardado un libro específico
    async obtenerListasDelLibro(libro) {
      try {
        this.seleccionadas = [];
        
        if (this.listasUsuario && Array.isArray(this.listasUsuario)) {
          const libroEnlace = libro.enlace;
          
          // Para cada lista creada por el usuario
          for (const lista of this.listasUsuario) {
            // Omite las listas especiales del sistema
            if (lista.nombre === "Mis Favoritos" || lista.nombre === "Leídos" || lista.nombre === "En proceso") {
              continue;
            }
            
            try {
              // Obtiene los libros que forman parte de cada lista
              const listContentsResponse = await apiClient.get(`/listas/${encodeURIComponent(this.user.correo)}/${encodeURIComponent(lista.nombre)}/libros`);
              
              console.log(`La lista "${lista.nombre}" contiene los libros:`, listContentsResponse.data);
              
              if (listContentsResponse.data && Array.isArray(listContentsResponse.data)) {
                
                // Comprueba si el libro actual está en esta lista
                const containsBook = listContentsResponse.data.some(bookItem => {
                  // Compara los enlaces para identificar el libro
                  if (bookItem['enlace_libro'] && bookItem['enlace_libro'] === libroEnlace) {
                    return true;
                  }
                });
                
                if (containsBook) {
                  // Marca la lista como seleccionada si contiene el libro
                  this.seleccionadas.push(lista.nombre);
                }
              }
            } catch (listError) {
              console.warn(`Error comprobando los libros de la lista "${lista.nombre}":`, listError);
            }
          }
          console.log("Listas seleccionadas: ", this.seleccionadas);
        }
      } catch (error) {
        console.error("Error obteniendo las listas del usuario:", error);
      }
    },
    
    // Alterna la presencia de un libro en una lista específica
    async toggleLibroEnLista(lista) {
      const listaNombre = lista.nombre;
      const yaSeleccionada = this.seleccionadas.includes(listaNombre);
      
      try {
        if (yaSeleccionada) {
          // Si ya está en la lista, lo elimina
          console.log("Eliminando libro de la lista:", listaNombre);
          await this.eliminarDeLista(listaNombre);
          this.seleccionadas = this.seleccionadas.filter(nombre => nombre !== listaNombre);
        } else {
          // Si no está en la lista, lo añade
          console.log("Añadiendo libro a la lista:", listaNombre);
          await this.aniadirALista(listaNombre);
          this.seleccionadas.push(listaNombre);
        }
      } catch (error) {
        console.error(`Error marcando o desmarcando libro en la lista "${listaNombre}":`, error);
        // Recarga el estado actual en caso de error
        await this.obtenerListasDelLibro(this.libro);
      }
    }
  }
};
</script>

<style scoped>
/* Texto justificado para la descripción del libro */
.text-justify {
  text-align: justify;
}

/* Controla el tamaño máximo de la portada del libro */
.img-fluid {
  max-height: 500px;
  object-fit: contain;
}

/* Estilo para las imágenes de libros relacionados */
.libro-relacionado-img {
  width: 40%; 
  height: 100px; 
  object-fit: cover; 
  cursor: pointer;
  transition: transform 0.3s;  /* Efecto de transición al pasar el ratón */
}

/* Efecto de zoom al pasar el ratón sobre portadas relacionadas */
.libro-relacionado-img:hover {
  transform: scale(1.05);
}

/* Estilo base para las estrellas de valoración */
.star {
  font-size: 1.8rem;
  color: #4C4637;
  cursor: pointer;
  transition: color 0.3s ease;
  margin-right: 5px;
}

/* Estilo para estrellas seleccionadas/rellenas */
.star.filled {
  color: gold;
}

/* Fondo semitransparente para los modales */
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

/* Estilo para el contenido de los modales */
.modal-content {
  background-color: #ffff !important;
  color: #4C4637 !important;
  padding: 30px 25px;
  border-radius: 10px;
  width: 450px; 
  max-width: 90%;
  text-align: left;
}

/* Estilo para el título de los modales */
.modal-title {
  text-align: center;
  width: 100%;
}

/* Estilos consistentes para las partes del modal */
.modal-header,
.modal-body,
.modal-footer {
  background-color: #ffff !important;
  color: #4C4637 !important;
  padding: 0;
}

/* Estilo para etiquetas de formularios en modales */
.modal-body label {
  display: block;
  font-weight: bold;
  margin-bottom: 4px; 
  margin-top: 12px; 
}

/* Estilo para campos de entrada de texto */
input,
textarea {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px 10px;
  width: 100%;
  box-sizing: border-box;
}

/* Espacio inferior para campos numéricos */
input[type="number"] {
  margin-bottom: 16px;
}

/* Asegura que la página tenga al menos la altura completa de la ventana */
.page-wrapper {
  min-height: 100vh;
}

/* Estilo para el icono de corazón (favoritos) */
.heart-icon {
  cursor: pointer;
  font-size: 1.4rem;
  margin-right: 10px;
}

/* Estilo para texto en cursiva */
.cursiva {
  font-style: italic;
}

/* Estilo para elementos de lista en el modal de listas */
.list-group-li {
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background-color 0.2s;
}

/* Efecto hover para elementos de lista */
.list-group-li:hover {
  filter: brightness(1.1);
}

/* Botón para volver al inicio de la página */
.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}

/* Estilo para opciones de menú desplegable */
.dropdown-item {
  cursor: pointer;
}

/* Efecto hover para opciones de menú */
.dropdown-item:hover {
  background-color: rgba(0,0,0,0.1);
}
/* Estilo para los elementos de la lista en el modal de selección */
.list-group-li {
  background: #444;
  border-radius: 8px;
  margin-bottom: 8px;
  color: white;
  transition: background-color 0.2s;
}
/* Efecto al pasar el cursor sobre un elemento de la lista */
.list-group-li:hover {
  background: #555;
}
/* Estilo para el nombre de cada lista en el elemento */
.list-name {
  font-size: 1rem;
}
/* Estilo para el checkbox personalizado que indica si el libro está en la lista */
.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  user-select: none;
  border-radius: 3px;
}

</style>
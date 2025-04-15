<template>
  <div v-if="libro && librosRelacionados" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <NavBar :dark-mode="darkMode"  :user="user"></NavBar>
    <div v-if="libro" class="container-fluid pt-4 p-5 min-vh-100">
      <!-- Switch con iconos sol/luna -->
      <div class="theme-switch-wrapper mb-1">
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
      <div class="row mt-2">
        <div class="col-md-4 d-flex flex-column align-items-center">
          <img :src="libro.imagen_portada" class="img-fluid" alt="Portada del libro">
          <p class="mb-3 text-center cursiva">{{ libro.nombre }}</p>
          <button class="btn btn-primary" @click="leerLibro">
            <font-awesome-icon :icon="['fas', 'book-open']" /> Leer
          </button>
        </div>
        <div class="col-md-8">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4 class="titulo">{{ libro.nombre }}</h4>
              <h4>de: {{ libro.autor }}</h4>
              <div v-if="user != null">
                <font-awesome-icon :icon="[ isFavorito ? 'fas' : 'far', 'heart' ]" class="heart-icon" @click="toggleFavorito"/>
                <button class="btn" @click="abrirModalListas(libro)">Añadir a lista</button>
              </div>
            </div>
          </div>

          <div v-if="librosRelacionados.length > 0">
            <!-- Línea horizontal antes de más libros del mismo autor -->            
            <hr class="my-3">
            <!-- Sección para otros libros del mismo autor -->
            <h5>Más de {{ libro.autor }}</h5>
            <div class="row">
              <div v-for="(libroRelacionado, index) in librosRelacionados" :key="index" class="col-md-3">
                <img :src="libroRelacionado.imagen_portada" class="libro-relacionado-img" alt="Portada" @click="goToDetalles(libroRelacionado)">
              </div>
            </div>
          </div>
          <!-- Línea horizontal antes de la sinopsis -->
          <hr class="my-3">
          
          <h4>Sinopsis</h4>
          <p class="text-justify">{{ libro.resumen }}</p>

          <!-- Línea horizontal antes de la información de las páginas del libro, horas de lectura, ... -->
          <hr class="my-3">

          <h5>Acerca de este libro</h5>

          <div class="d-flex align-items-center">
            <div class="d-flex align-items-center me-3">
              <font-awesome-icon :icon="['fas', 'book-open']" class="me-2" />
              <p class="mb-0">{{ libro.num_paginas }} Páginas</p>
            </div>
            <div class="d-flex align-items-center mx-3 border-start border-end px-3">
              <font-awesome-icon :icon="['fas', 'clock']" class="me-2" />
              <p class="mb-0">{{ libro.horas_lectura }} Horas de lectura</p>
            </div>
            <div class="d-flex align-items-center">
              <font-awesome-icon :icon="['fas', 'file-word']" class="me-2" />
              <p class="mb-0">{{ libro.num_palabras }} Total de palabras</p>
            </div>
          </div>


          <!-- Línea horizontal antes de valoraciones del libro -->
          <hr class="my-3">

          <div class="col-md-8">
            <h5>Valoraciones del libro:</h5>
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="mb-1"> Valoración general</p>
                <p> {{ libro.puntuacion_media.toFixed(2) }} de 5</p>
                <div class="d-flex">
                  <span v-for="(icon, idx) in getStarIcons(libro.puntuacion_media)" :key="idx">
                      <font-awesome-icon :icon="['fas', icon]"/> 
                  </span>
                  <p>({{conteoValoraciones.total}})</p>
                </div>
                <div v-if="user != null" class="pt-2">
                  <button class="btn" @click="aniadirValoracion(libro)">+ Añadir Valoración</button>
                </div>
              </div>
              <div>
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

          <!-- Línea horizontal antes del título todas las reseñas del libro -->
          <hr class="my-3">

          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Todas las reseñas del libro</h5>
            <div ref="dropdown" class="dropdown">
              <button class="btn dropdown-toggle" type="button" @click="toggleDropdown">
                Ordenar por: {{ getSelectedFilterLabel() }}
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('reciente')">Ninguno</a></li>
                <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('alta')"> Valoración más alta</a></li>
                <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('baja')"> Valoración más baja</a></li>
                <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('antigua')"> Valoración más antigua</a></li>
                <li><a href="#" class="dropdown-item" @click.prevent="seleccionarFiltro('reciente')"> Valoración más reciente</a></li>
              </ul>
            </div>
          </div>

          <!-- Línea horizontal antes de todas las reseñas del libro -->
          <hr class="my-3">

          <div v-if="valoracionesOrdenadas.length > 0">
            <div v-for="valoracion in valoracionesOrdenadas" :key="valoracion.id" class="valoracion">
              <p class="mb-1">
                <strong>{{ valoracion.titulo_resena }}</strong>
                <span v-for="(icon, i) in getStarIcons(valoracion.valor)" :key="i">
                  <font-awesome-icon :icon="['fas', icon]" />
                </span>
              </p>
              <p class="mb-1">{{ valoracion.mensaje }}</p>
              <p>Por {{valoracion.nombreUsuario }} el {{ new Date(valoracion.fecha).toLocaleDateString() }}</p>
              <hr>
            </div>
          </div>
          <div v-else>
            <p>No hay valoraciones todavía.</p>
          </div>
        </div>        
      </div>
    </div>
    <div v-else class="container mt-4 text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <Footer></Footer>
    <button class="back-to-top" @click="scrollTop">
      <font-awesome-icon :icon="['fas', 'chevron-up']" />
    </button>

    <!-- MODAL personalizado -->
     <!-- Modal de valoración -->
    <div v-if="mostrarModal" class="modal-background">
      <div class="modal-dialog modal-dialog-centered"> 
        <div class="modal-content bg-dark text-white rounded-3 shadow-lg">
          <div class="modal-header">
            <h4 class="modal-title fw-bold mb-4">Nueva valoración</h4>
          </div>
          <div class="modal-body">
            <form>
              <div>
                <label class="controls mb-3 p-2" for="titulo">Título:</label>
                <input type="text" v-model="nuevaValoracion.titulo_resena" placeholder="Introduce tu título" required>
              </div>
              <div>
                <label class="controls mb-3 p-2" for="mensaje">Mensaje:</label>
                <textarea v-model="nuevaValoracion.mensaje" placeholder="Introduce tu valoración" required></textarea>
              </div>
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
          <div class="modal-footer">
            <button type="button" class="btn-enviar p-2 px-4 me-3 mb-2" @click="enviarValoracion">Enviar</button>
            <button type="button" class="btn-cancelar p-2 px-4 mb-2" @click="cerrarModal">Cancelar</button>
          </div>
        </div>
      </div> 
    </div>

    <!-- MODAL personalizado -->
    <!-- Modal de selección de lista -->
    <div v-if="modalListasAbierto" class="modal-background">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white rounded-3 shadow-lg">
          <div class="modal-header">
            <h4 class="modal-title fw-bold mb-4 mx-4">Guardar en...</h4>
          </div>
          <div v-if="listasUsuario.length > 0">
            <div class="modal-body">
              <ul class="list-group">
                <li v-for="lista in listasUsuario" :key="lista.id" class="list-group-li bg-dark">
                  <div class="d-flex align-items-center w-100 px-3 py-2">
                    <div class="custom-checkbox me-3" @click="toggleLibroEnLista(lista)">
                      {{ seleccionadas.includes(lista.nombre) ? '✓' : '' }}
                    </div>
                    <span class="list-name me-2">{{ lista.nombre }}</span>
                    <span :title="lista.publica ? 'Lista pública' : 'Lista privada'">
                      {{ lista.publica ? '🔓' : '🔒' }}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div v-else class="mt-3 px-4">
            <p>No tienes ninguna lista creada.</p>
          </div>
          <hr class="my-3">
          <div class="text-start px-4">
            <button class="btn w-100 text-start" @click="irACrearListas">+ Nueva lista</button>
          </div>
          <div class="mt-3 text-end px-4 mb-3">
            <button class="btn btn-cancelar" @click="cerrarModalListas">Cerrar</button>
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
      user: null,
      libro: null,
      librosRelacionados: [],
      mostrarModal: false,
      modalListasAbierto: false,
      dropdownInstance: null,
      seleccionadas: [], // Almacena las listas que contienen el libro
      listasUsuario: [], // Almacena todas las listas de un usuario
      listas: {
        usuario_id: "",
        libro_id: "",
        nombreLista: ""
      },
      libroSeleccionado: null,
      valoraciones: [], 
      filtroSeleccionado: "reciente",
      nuevaValoracion: {
        usuario_id: "", 
        libro_id: "", 
        titulo_resena: "", 
        mensaje: "", 
        valor: 1
      },
      conteoValoraciones: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 },
      darkMode: localStorage.getItem("darkMode") === "true", // Obtener el tema guardado
      isFavorito: false,
      userCache: {},
    };
  },
  computed: {
    valoracionesOrdenadas() {
      let ordenadas = [...this.valoraciones];

      switch (this.filtroSeleccionado) {
        case "alta":
          ordenadas.sort((a, b) => b.valor - a.valor);
          break;
        case "baja":
          ordenadas.sort((a, b) => a.valor - b.valor);
          break;
        case "antigua":
          ordenadas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
          break;
        case "reciente":
        default:
          ordenadas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
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

    // Obtener detalles del libro
    const libroId = encodeURIComponent(this.$route.params.id);
    const response = await apiClient.get(`/libros/titulo/${libroId}`);
    this.libro = response.data;

    // Si se obtiene el libro, obtener libros relacionados y valoraciones
    if (this.libro) {
      await this.comprobarFavorito();
      await this.obtenerLibrosDelMismoAutor();
      await this.obtenerConteoValoraciones();
      await this.obtenerValoraciones();
    }

    // Aplicar el tema guardado al cargar la página
    this.applyTheme();
    this.dropdownInstance = new Dropdown(this.$refs.dropdown);
  } catch (error) {
    console.error('Error al cargar los detalles del libro:', error);
  }
},
  watch: {
    // Observa cambios en la ruta y vuelve a cargar los detalles del libro
    '$route.params.id': async function() {
      await this.cargarDetallesLibro();
    }
  },
  methods: {
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
        await this.comprobarFavorito();
      } catch (error) {
          if (error.response && error.response.status === 409) {
            alert(`El libro ya está en la lista "${lista}".`);
          } else {
            console.error("Error al añadir libro a la lista:", error);
            alert("Hubo un error al añadir el libro a la lista.");
          }
      }
    },
    async eliminarDeLista(lista) {
      try {
        const listas = {
          usuario_id: this.user.correo,
          libro_id: this.libro.enlace,
          nombreLista: lista,
        };

        console.log(`Eliminando libro ${this.libro.enlace} de la lista ${lista}`);

        // This is the correct way to send a DELETE request with a body
        const response = await apiClient.delete(`/listas/${lista}`, { 
          data: listas 
        });

        console.log("Respuesta de eliminación:", response.data);
        alert(`Libro eliminado de la lista ${lista} correctamente`);
        await this.comprobarFavorito();
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
    async getUserDisplayName(correo) {
      // Revisar primero el caché para evitar llamadas API innecesarias
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
        // Si la llamada API falla, usar correo como alternativa
        this.userCache[correo] = correo;
        return correo;
      }
    },
    getStarIcons(rating) {
      const icons = [];
      const fullStars = Math.floor(rating);           // Entero de la puntuación
      const fraction = rating - fullStars;            // Parte decimal

      for (let i = 0; i < fullStars; i++) {
        icons.push('star'); 
      }
      if (fraction >= 0.25 && fraction <= 0.75) {
        icons.push('star-half');
      } else if (fraction > 0.75) {
        icons.push('star');
      }

      return icons;
    },
    async comprobarFavorito() {
      if (!this.user) {
        this.isFavorito = false; // Si no hay usuario, no puede ser favorito
        return;
      }
        try {
          const response = await apiClient.get(`/listas/favoritos/${encodeURIComponent(this.user.correo)}`);
          if (response.status === 200 && response.data) {
            const librosFavoritos = response.data;
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
    async toggleFavorito() {
      if (!this.isFavorito) {
        try {
          const favoritos = {
            usuario_id: this.user.correo,
            enlace_libro: this.libro.enlace
          };

          console.log("Usuario ID:", favoritos.usuario_id);
          console.log("Libro ID:", favoritos.enlace_libro);

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

          const response = await apiClient.delete("/listas/favoritos", { data });
          alert(response.data.mensaje);
          this.isFavorito = false; // Cambia el ícono a regular
        } catch (error) {
          console.error("Error al eliminar de favoritos:", error);
          alert("Hubo un error al eliminar tu libro de favoritos.");
        }
      }
    },
    aniadirValoracion(libro) {
      this.nuevaValoracion = {
        usuario_id: this.user.correo,
        libro_id: libro.id,
        titulo_resena: "",
        mensaje: "",
        valor: null
      };
      this.mostrarModal = true; // Abre el modal
    },
    cerrarModal() {
      this.mostrarModal = false; // Cierra el modal
    },
    async enviarValoracion() {
      if (!this.nuevaValoracion.mensaje) {
        alert("El mensaje de la valoración es obligatorio");
        return;
      }
      try {
        // Guardamos todos los datos necesarios para realizar la consulta
        const nuevaValoracion = {
          usuario_id: this.user.correo,
          libro_id: this.libro.enlace,
          titulo_resena: this.nuevaValoracion.titulo_resena,
          mensaje: this.nuevaValoracion.mensaje,
          valor: this.nuevaValoracion.valor
        };

        console.log("Enviando los siguientes datos de valoración:");

        console.log("Enviando los siguientes datos de valoración:");
        console.log("Usuario ID:", nuevaValoracion.usuario_id);
        console.log("Libro ID:", nuevaValoracion.libro_id);
        console.log("Título de la Reseña:", nuevaValoracion.titulo_resena);
        console.log("Mensaje:", nuevaValoracion.mensaje);
        console.log("Puntuación:", nuevaValoracion.valor);
        
        const response = await apiClient.post('/opiniones', nuevaValoracion);
        console.log('Valoración añadida con éxito:', response.data);

        // Cerrar el modal después de enviar la valoración
        this.cerrarModal();

        // Recargar los detalles del libro para actualizar la lista de valoraciones
        await this.cargarDetallesLibro();

        // Recargar el conteo de valoraciones
        await this.obtenerConteoValoraciones();

        // Recargar las reseñas publicadas
        await this.obtenerValoraciones();

        // Limpiar el formulario después de enviar la reseña
        this.nuevaValoracion = {
          usuario_id: "", 
          libro_id: "", 
          titulo_resena: "", 
          mensaje: "", 
          valor: null
        };

        // Mostrar mensaje de éxito
        alert("Tu valoración ha sido publicada.");
      } catch (error) {
        console.error('Error al enviar la valoración:', error);
        alert("Hubo un error al enviar tu valoración. Inténtalo de nuevo.");
      }
    },
    async obtenerConteoValoraciones() {
      try {
        // Reiniciamos el contador para cada nueva consulta
        this.conteoValoraciones = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 };
        for (let valor = 5; valor >= 1; valor--) {
          const response = await apiClient.get(`/opiniones/valoracion/${encodeURIComponent(this.libro.enlace)}/${valor}`);
          const valoraciones = response.data;

          // Contamos las valoraciones por cada valor
          valoraciones.forEach((valoracion) => {
            // Aseguramos que el valor es un número
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
    async obtenerValoraciones() {
      try {
        const response = await apiClient.get(`/opiniones/${encodeURIComponent(this.libro.enlace)}`);
        this.valoraciones = response.data;
        
        // Obtener los nombres de los usuarios
        for (const valoracion of this.valoraciones) {
          valoracion.nombreUsuario = await this.getUserDisplayName(valoracion.usuario_id);
        }
      } catch (error) {
        console.error("Error al obtener las valoraciones:", error);
      }
    },
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
    async obtenerLibrosDelMismoAutor() {
      try {
        const response = await apiClient.get(`/libros/autor/${encodeURIComponent(this.libro.autor)}`);
        // Filtramos para excluir el libro actual
        this.librosRelacionados = response.data.filter(libro => libro.enlace !== this.libro.enlace);
      } catch (error) {
        console.error('Error al obtener libros del mismo autor:', error);
      }
    },
    goToDetalles(libro) {
      this.$router.push({ name: 'Detalles', params: { id: libro.nombre } });
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
    leerLibro() {
      console.log("Botón 'Leer' presionado"); // Verifica si esta línea aparece en la consola
      

      if (this.libro && this.libro.enlace) {
        console.log("📖 Datos del libro:", this.libro);
        // Extraer la ID del archivo desde la URL de Google Drive
        const driveIdMatch = this.libro.enlace.match(/\/d\/(.*?)\//);
        
        if (!driveIdMatch || !driveIdMatch[1]) {
          alert("❌ Error: No se pudo extraer la ID del archivo PDF.");
          return;
        }

        const fileId = driveIdMatch[1];
        const pdfUrl = `${apiClient.defaults.baseURL}/proxy-pdf?url=https://drive.google.com/uc?id=${fileId}&export=download`;

        console.log("✅ Redirigiendo al visor con URL:", pdfUrl);

        // Redirigir al visor
        this.$router.push({
          path: "/visor-pdf",
          query: { url: pdfUrl }
        });
      } else {
        alert("❌ Este libro no tiene un PDF disponible.");
      }
    },
    async abrirModalListas(libro) {
      this.libroSeleccionado = libro;
      // Primero, obtener las listas actualizadas
      await this.obtenerListasUsuario();
      // Luego, verificar en cuáles está el libro
      await this.obtenerListasDelLibro(libro);
      // Mostrar el modal
      this.modalListasAbierto = true;
    },
    cerrarModalListas() {
      this.modalListasAbierto = false;
    },
    scrollTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        'alta': 'Valoración más alta',
        'baja': 'Valoración más baja',
        'antigua': 'Valoración más antigua',
        'reciente': 'Valoración más reciente'
      };
      return filterLabels[this.filtroSeleccionado] || 'Ordenar';
    },
    seleccionarFiltro(filtro) {
      this.cambiarFiltro(filtro);
      this.dropdownInstance.hide(); // Cierra el dropdown después de seleccionar
    },
    toggleDropdown() {
      this.dropdownInstance.toggle();
    },
    irACrearListas() {
      this.$router.push({ name: 'CrearEditarLista', params: { hacer: 'Crear' } });
    },
    // Método para obtener las listas del usuario actualizado
    async obtenerListasUsuario() {
      try {
        const response = await apiClient.get(`/listas/${encodeURIComponent(this.user.correo)}`);
        this.listasUsuario = response.data
          .filter(lista => lista.nombre !== "Mis Favoritos" && lista.nombre !== "Leídos" && lista.nombre !== "En proceso");
        console.log("Listas actualizadas:", this.listasUsuario);
      } catch (error) {
        console.error("Error al obtener las listas del usuario:", error);
      }
    },
    async obtenerListasDelLibro(libro) {
      try {
        this.seleccionadas = [];
        
        if (this.listasUsuario && Array.isArray(this.listasUsuario)) {
          const libroEnlace = libro.enlace;
          
          for (const lista of this.listasUsuario) { // Para cada una de las listas creadas por el usuario
            if (lista.nombre === "Mis Favoritos" || lista.nombre === "Leídos" || lista.nombre === "En proceso") {
              continue;
            }
            
            try {
              // Obtenemos los libros que forman parte de cada una de las listas
              const listContentsResponse = await apiClient.get(`/listas/${encodeURIComponent(this.user.correo)}/${encodeURIComponent(lista.nombre)}/libros`);
              
              console.log(`La lista "${lista.nombre}" contiene los libros:`, listContentsResponse.data);
              
              if (listContentsResponse.data && Array.isArray(listContentsResponse.data)) {
                
                const containsBook = listContentsResponse.data.some(bookItem => {

                  // Comprobamos si coincide alguno de los enlaces de la lista con el del libro que queremos añadir
                  if (bookItem['enlace_libro'] && bookItem['enlace_libro'] === libroEnlace) {
                    return true;
                  }
                });
                
                if (containsBook) {
                  // Añadimos la lista que contiene dicho libro a las listas qeu deben estar marcadas con el check
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
    async toggleLibroEnLista(lista) {
      const listaNombre = lista.nombre;
      const yaSeleccionada = this.seleccionadas.includes(listaNombre);
      
      try {
        if (yaSeleccionada) {
          // Eliminar de lista y desmarcar
          console.log("Eliminando libro de la lista:", listaNombre);
          await this.eliminarDeLista(listaNombre);
          this.seleccionadas = this.seleccionadas.filter(nombre => nombre !== listaNombre);
        } else {
          // Añadir a lista y marcar
          console.log("Añadiendo libro a la lista:", listaNombre);
          await this.aniadirALista(listaNombre);
          this.seleccionadas.push(listaNombre);
        }
      } catch (error) {
        console.error(`Error marcando o desmarcando libro en la lista "${listaNombre}":`, error);
        await this.obtenerListasDelLibro(this.libro);
      }
    }
  }
};
</script>

<style scoped>

.text-justify {
  text-align: justify;
}

.img-fluid {
  max-height: 500px;
  object-fit: contain;
}

.libro-relacionado-img {
  width: 40%; 
  height: 100px; 
  object-fit: cover; 
  cursor: pointer;
  transition: transform 0.3s;
}

.libro-relacionado-img:hover {
  transform: scale(1.05);
}

.star {
  font-size: 1.8rem;
  color: #4C4637;
  cursor: pointer;
  transition: color 0.3s ease;
  margin-right: 5px;
}

.star.filled {
  color: gold;
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
  padding: 30px 25px;
  border-radius: 10px;
  width: 450px; 
  max-width: 90%;
  text-align: left;
}

.modal-title {
  text-align: center;
  width: 100%;
}

.modal-header,
.modal-body,
.modal-footer {
  background-color: #ffff !important;
  color: #4C4637 !important;
  padding: 0;
}

.modal-body label {
  display: block;
  font-weight: bold;
  margin-bottom: 4px; 
  margin-top: 12px; 
}

input,
textarea {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px 10px;
  width: 100%;
  box-sizing: border-box;
}

input[type="number"] {
  margin-bottom: 16px;
}

.page-wrapper {
  min-height: 100vh;
}

.heart-icon {
  cursor: pointer;
  font-size: 1.4rem;
  margin-right: 10px;
}

.cursiva {
  font-style: italic;
}

.list-group-li {
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background-color 0.2s;
}
.list-group-li:hover {
  filter: brightness(1.1);
}

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

.dropdown-item {
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: rgba(0,0,0,0.1);
}

.list-group-li {
  background: #444;
  border-radius: 8px;
  margin-bottom: 8px;
  color: white;
  transition: background-color 0.2s;
}

.list-group-li:hover {
  background: #555;
}

.list-name {
  font-size: 1rem;
}

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
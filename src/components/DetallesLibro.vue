<template>
  <div v-if="user" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <NavBar :dark-mode="darkMode"></NavBar>
    <div v-if="libro" class="container mt-4">

      <!-- Botón de cambio de tema -->
      <button @click="toggleDarkMode" class="theme-toggle-btn mb-3">
        {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
      </button>

      <div class="row">
        <div class="col-md-4 d-flex flex-column align-items-center">
          <img :src="libro.imagen_portada" class="img-fluid" alt="Portada del libro">
          <p class="mb-3 text-center">{{ libro.nombre }}</p>
          <button class="btn px-5" @click="mostrarPDF">Leer</button>
        </div>
        <div class="col-md-8">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4>{{ libro.nombre }}</h4>
              <h4>de: {{ libro.autor }}</h4>
            </div>
            <div>
              <button class="btn me-3" @click="aniadirAFavoritos">Añadir a favoritos</button>
              <button class="btn" @click="aniadirALista">Añadir a lista</button>
            </div>
          </div>

          <!-- Línea horizontal antes de más libros del mismo autor -->
          <hr class="my-3">

          <!-- Sección para otros libros del mismo autor -->
          <h5>Más de {{ libro.autor }}</h5>
          <div v-if="librosRelacionados.length > 0">
            <div class="row">
              <div v-for="(libroRelacionado, index) in librosRelacionados" :key="index" class="col-md-3">
                <img :src="libroRelacionado.imagen_portada" class="libro-relacionado-img" alt="Portada" @click="goToDetalles(libroRelacionado)">
              </div>
            </div>
          </div>
          <div v-else class="mt-3">
            <p>No hay más libros de este autor.</p>
          </div>

          <!-- Línea horizontal antes de la sinopsis -->
          <hr class="my-3">

          <h5>Sinopsis</h5>
          <p class="text-justify">{{ libro.resumen }}</p>

          <!-- Línea horizontal antes de la información de las páginas del libro, horas de lectura, ... -->
          <hr class="my-3">

          <h5>Acerca de este libro</h5>
          <!-- Faltará poner los iconos que correspondan cuando sepa hacerlo -->
          <div  class="d-flex  align-items-center">
              <p class="mb-3 pe-3">{{ libro.num_paginas }} Páginas</p>
              <p class="mb-3 px-3 border-start border-end">{{ libro.horas_lectura }} Horas de lectura</p>
              <p class="mb-3 px-3">{{ libro.num_palabras }} Total de palabras</p>
          </div>

          <!-- Línea horizontal antes de valoraciones del libro -->
          <hr class="my-3">

          <div class="col-md-8">
            <h5>Valoraciones del libro:</h5>
            <div class="d-flex justify-content-between align-items-center">
              <div class=" pe-3 border-end">
                <p class="mb-1"> Valoración general</p>
                <p> {{ libro.puntuacion_media.toFixed(2) }} de 5</p>
                <button class="btn" @click="aniadirValoracion(libro)">Añadir Valoración</button>
              </div>
              <div>
                <p class="mb-1"> 5 ESTRELLAS   {{ conteoValoraciones[5] }}</p>
                <p class="mb-1"> 4 ESTRELLAS   {{ conteoValoraciones[4] }}</p>
                <p class="mb-1"> 3 ESTRELLAS   {{ conteoValoraciones[3] }}</p>
                <p class="mb-1"> 2 ESTRELLAS   {{ conteoValoraciones[2] }}</p>
                <p class="mb-1"> 1 ESTRELLAS   {{ conteoValoraciones[1] }}</p>
              </div>
            </div>
          </div>

          <!-- Línea horizontal antes del título todas las reseñas del libro -->
          <hr class="my-3">

          <div class="d-flex justify-content-between align-items-center"> 
            <h5>Todas las reseñas del libro:</h5>
            <div class="dropdown">
              <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Ordena por: 
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" @click="filtroSeleccionado = 'alta'">Valoración más alta</a></li>
                <li><a class="dropdown-item" @click="filtroSeleccionado = 'baja'">Valoración más baja</a></li>
                <li><a class="dropdown-item" @click="filtroSeleccionado = 'antigua'">Valoración más antigua</a></li>
                <li><a class="dropdown-item" @click="filtroSeleccionado = 'reciente'">Valoración más reciente</a></li>
              </ul>
            </div>
          </div>

          <!-- Línea horizontal antes de todas las reseñas del libro -->
          <hr class="my-3">

          <div v-if="valoracionesOrdenadas.length > 0">
            <div v-for="valoracion in valoracionesOrdenadas" :key="valoracion.id" class="valoracion">
              <p class="mb-1">{{ valoracion.valor }} estrellas <strong>{{ valoracion.titulo_resena }}</strong></p>
              <p class="mb-1">{{ valoracion.mensaje }}</p>
              <p>Por {{valoracion.usuario_id}} en {{ new Date(valoracion.fecha).toLocaleDateString() }}</p>
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

    <!-- MODAL personalizado -->
    <div v-if="mostrarModal" class="modal-background">
      <div class="modal-dialog modal-dialog-centered"> 
        <div class="modal-content bg-dark text-white rounded-3 shadow-lg">
          <div class="modal-header">
            <h4 class="modal-title fw-bold mb-4">Nueva Valoración</h4>
          </div>
          <div class="modal-body">
            <form>
              <div>
                <label class="controls mb-3 p-2" for="titulo">Título:</label>
                <input type="text" v-model="nuevaValoracion.titulo_resena" placeholder="Introduce tu título">
              </div>
              <div>
                <label class="controls mb-3 p-2" for="mensaje">Mensaje:</label>
                <textarea v-model="nuevaValoracion.mensaje" placeholder="Introduce tu valoración*" required></textarea>
              </div>
              <div>
                <label class="controls mb-3 p-2" for="valor">Puntuación:</label>
                <input type="number" v-model="nuevaValoracion.valor" min="1" max="5">
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
  </div>
</template>

<script>
import axios from 'axios';
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
//import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
//import { faClock, faBook, faFileWord } from '@fortawesome/free-solid-svg-icons';
import { apiClient } from '../config';


export default {
  name: 'Detalles',
  components: {
    NavBar,
    Footer
  },
  data() {
    return {
      user: null,
      libro: null,
      librosRelacionados: [],
      mostrarModal: false,
      valoraciones: [], 
      filtroSeleccionado: "reciente",
      nuevaValoracion: {
        usuario_id: "", 
        fecha: "",
        libro_id: "", 
        titulo_resena: "", 
        mensaje: "", 
        valor: null
      },
      conteoValoraciones: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      darkMode: localStorage.getItem("darkMode") === "true" // Obtener el tema guardado
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
      const response1 = await apiClient.get("/user"); // Llamada a usuario
      this.user = response1.data;
      const libroId = encodeURIComponent(this.$route.params.id);
      const response = await apiClient.get(`/libros/titulo/${libroId}`);
      this.libro = response.data;
      if (this.libro) {
        await this.obtenerLibrosDelMismoAutor();
      }
      await this.obtenerConteoValoraciones();
      await this.obtenerValoraciones();

      // Aplicar el tema guardado al cargar la página
      this.applyTheme();
    } 
    catch (error) {
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
    aniadirALista() {
    },
    aniadirAFavoritos() {
    },
    aniadirValoracion(libro) {
    const fechaActual = new Date().toISOString();
    this.nuevaValoracion = {
      usuario_id: this.user.correo,
      libro_id: libro.id,
      fecha: fechaActual, 
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
          fecha: this.nuevaValoracion.fecha, 
          mensaje: this.nuevaValoracion.mensaje,
          valor: this.nuevaValoracion.valor
        };

        console.log("Enviando los siguientes datos de valoración:");
        console.log("Fecha:", nuevaValoracion.fecha);

        console.log("Enviando los siguientes datos de valoración:");
        console.log("Usuario ID:", nuevaValoracion.usuario_id);
        console.log("Fecha: ", nuevaValoracion.fecha);
        console.log("Libro ID:", nuevaValoracion.libro_id);
        console.log("Título de la Reseña:", nuevaValoracion.titulo_resena);
        console.log("Mensaje:", nuevaValoracion.mensaje);
        console.log("Puntuación: ", nuevaValoracion.valor);
        
        const response = await apiClient.post('/opiniones', nuevaValoracion);
        console.log('Valoración añadida con éxito:', response.data);

        // Cerrar el modal después de enviar la valoración
        this.cerrarModal();

        // Recargar los detalles del libro para actualizar la lista de valoraciones
        await this.cargarDetallesLibro();

        // Recargar el conteo de valoraciones
        await this.obtenerConteoValoraciones();

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
        this.conteoValoraciones = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (let valor = 5; valor >= 1; valor--) {
          const response = await apiClient.get(`/opiniones/valoracion/${encodeURIComponent(this.libro.enlace)}/${valor}`);
          const valoraciones = response.data;

          // Contamos las valoraciones por cada valor
          valoraciones.forEach((valoracion) => {
            // Aseguramos que el valor es un número
            const valor = parseInt(valoracion.valor);
            if (this.conteoValoraciones[valor] !== undefined) {
              this.conteoValoraciones[valor]++;
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
    }
  }
};
</script>

<style scoped>
/* Estilos del botón */
.theme-toggle-btn {
  background-color: #444;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
}

.btn {
  background-color: #444;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
}

.btn:hover {
  background-color: #666;
  color: #fff;
}

.btn-enviar {
  background-color: #046f2a;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
}

.btn-enviar:hover {
  background-color: #046f2a;
  color: #fff;
}

.btn-cancelar {
  background-color: #a30c0c;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
}

.btn-cancelar:hover {
  background-color: #a30c0c;
  color: #fff;
}

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
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

/* Estilos para modo oscuro */
:deep(.dark-mode) {
  background-color: #343434;
  color: #ffffff;
}

:deep(.dark-mode) .container {
  background-color: #343434;
  color: #ffffff;
}

:deep(.dark-mode) hr {
  border-color: #555;
}

:deep(.dark-mode) .dropdown-menu {
  background-color: #444;
}

:deep(.dark-mode) .dropdown-item {
  color: #fff;
}

:deep(.dark-mode) .dropdown-item:hover {
  background-color: #555;
  color: #fff;
}

/* Estilos para modo claro */
:deep(.light-mode) {
  color: #000000;
}

:deep(.light-mode) .container {
  background-color: #ead5a1;
  color: #000000;
}
</style>
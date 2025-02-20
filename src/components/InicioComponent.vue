<template>
  <div v-if="user">
    <NavBar></NavBar>
    <div class="cabecera" style="background-color: #9b885b;">
      <div class="container mt-2" style="background-color: #9b885b;">
        <!-- Barra de búsqueda -->
        <form class="d-flex mb-3 mt-4" @submit.prevent="buscarLibros">
          <div class="input-group">
            <input class="form-control rounded-pill" type="search" placeholder="Buscar título" aria-label="Buscar" v-model="busqueda">
            <button v-if="busqueda" class="btn btn-outline-secondary rounded-pill ms-2" type="button" @click="limpiarBusqueda">Limpiar</button>
          </div>
        </form>

        <!-- Categorías -->
        <div class="d-flex mb-3">
          <h4 class="mb-3">Categorías:</h4>
          <div class="categorias-container">
            <div class="categorias-scroll">
              <button v-for="tema in temas" :key="tema.tematica" @click="filtrarPorCategoria(tema.tematica)" class="btn rounded-pill btn-sm" style="color: darkgoldenrod;" :style="categoriaSeleccionada === tema.tematica ? 'background-color: #e5c578; color: #343434;' : 'background-color: #f6e5bb; color: #9b665b;'">
                {{ tema.tematica }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Información del usuario -->
        <div class="text-center">
          <h3>Bienvenido, {{ user.nombre }}</h3>
          <p>Correo: {{ user.correo }}</p>
        </div>
      </div>
    </div>
    <div class="listado" style="background-color: #343434;">
      <div class="container">
        <!-- Lista de libros -->
        <h4 class="text-white p-2">
          {{ busqueda ? 'Resultados de la búsqueda' : 'Libros disponibles' }}
        </h4>
        <div class="row libros-container">
          <div v-for="libro in libros" :key="libro.enlace" class="col-lg-3 col-md-4 col-sm-6 col-12 mb-4 d-flex justify-content-center" @click="goToDetalles(libro)">
            <div class="book-card card shadow-sm">
              <img :src="libro.imagen_portada" class="book-image card-img-top" alt="Portada del libro">
              <div class="card-body text-center p-2">
                <h6 class="book-title">{{ libro.nombre }}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer></Footer>
  </div>
  <div v-else>
    <p>Cargando...</p>
  </div>
</template>

<script>
import axios from "axios";
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import { apiClient } from '../config';


export default {
  name: 'InicioComponent',
  components: {
    NavBar,
    Footer
  },
  data() {
    return {
      user: null,
      categoriaSeleccionada: '',
      temas: [],
      libros: [],
      busqueda: ""
    };
  },
  async mounted() {
  try {
    const response = await apiClient.get("/user", { withCredentials: true });
    this.user = response.data;
  } catch (error) {
    console.warn("No hay usuario autenticado, pero permitimos el acceso.");
  }
  this.cargarLibros();


  },
  methods: {
    async cargarLibros() {
      try {
        const response = await apiClient.get("/libros"); // Llamada a libros
        this.libros = response.data;
      } catch (error) {
        console.error("Error al cargar los libros:", error);
      }
    },
    async cargarTematicas() {
      try {
        const response = await apiClient.get("/libros/tematicas");
        this.temas = response.data;
      } catch (error) {
        console.error("Error al cargar temáticas:", error);
      }
    },
    async buscarLibros() {
      try {
        const response = await apiClient.get(`/libros/obtenerTitulo/${this.busqueda.trim()}`);
        this.libros = Array.isArray(response.data) ? response.data : [response.data];
      } catch (error) {
        console.error("Error al buscar el libro:", error);
        this.libros = [];
      }
    },
    async filtrarPorCategoria(categoria) {
      if (this.categoriaSeleccionada === categoria) {
        this.categoriaSeleccionada = "";
        return this.cargarLibros();
      }

      this.categoriaSeleccionada = categoria;
      try {
        const response = await apiClient.get(`/libros/tematica/${categoria}`);
        this.libros = response.data;
      } catch (error) {
        console.error(`Error al cargar libros de la categoría ${categoria}:`, error);
        this.libros = [];
      }
    },
    async limpiarBusqueda() {
      this.busqueda = "";
      await this.cargarLibros();
    },
    goToDetalles(libro) {
      this.$router.push({ name: 'Detalles', params: { id: libro.nombre } });
    }
  }
};
</script>

<style scoped>
.categorias-container {
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 10px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.categorias-scroll {
  display: flex;
  gap: 12px;
  padding: 5px;
}

.libros-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.book-card {
  width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
}

.book-card:hover {
  transform: scale(1.05);
}

.book-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 5px;
}

.book-title {
  width: 160px; 
  white-space: normal; 
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  -webkit-box-orient: vertical;
  text-align: center;
}

.cabecera {
  padding: 20px;
}

.cabecera .container {
  margin-top: 0 !important; 
}
</style>
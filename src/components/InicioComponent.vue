<template>
  <div v-if="user">
    <NavBar :dark-mode="darkMode"></NavBar>
    <div class="cabecera" style="background-color: #9b885b;">
      <div class="container mt-2">
        <!-- Boton modos -->
        <button @click="toggleDarkMode" class="theme-toggle-btn">
          {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
        </button>
        <!-- Barra de búsqueda -->
        <form class="d-flex mb-3 mt-4" @submit.prevent="buscarLibros">
          <div class="input-group">
            <input class="form-control rounded-pill" type="search" placeholder="Buscar título" aria-label="Buscar" v-model="busqueda">
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
    <div class="listado">
      <div class="l-container p-2 mx-5">
        <!-- Lista de libros -->
        <h4 class="text p-2">
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
    <Cargando :dark-mode="darkMode"></Cargando>
  </div>
</template>

<script>
import axios from "axios";
import NavBar from '@/components/NavBar.vue'
import Cargando from '@/components/Cargando.vue'
import Footer from '@/components/Footer.vue'
import { apiClient } from '../config';


export default {
  name: 'InicioComponent',
  components: {
    NavBar,
    Footer,
    Cargando
  },
  data() {
    return {
      user: null,
      categoriaSeleccionada: '',
      temas: [],
      libros: [],
      busqueda: "",
      darkMode: localStorage.getItem("darkMode") === "true", // Obtener el tema guardado
    };
  },
  async mounted() {
    try {
      const response = await apiClient.get("/user"); // Llamada a usuario
      this.user = response.data;
      this.cargarLibros();
      this.cargarTematicas();
      this.applyTheme();

    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      this.$router.push("/");
    }
  },
  watch: {
    // Observador para buscar mientras se escribe
    busqueda(newValue) {
      if (!newValue) {
        // Si está vacío, se muestran todos los libros
        this.libros = this.librosOriginales;
        return;
      }
      
      // Filtrar libros basado en la búsqueda
      const busquedaMinuscula = newValue.toLowerCase().trim();
      this.libros = this.librosOriginales.filter(libro => 
        libro.nombre.toLowerCase().includes(busquedaMinuscula)
      );
    }
  },
  methods: {
    async cargarLibros() {
      try {
        const response = await apiClient.get("/libros"); // Llamada a libros
        this.libros = response.data;
        // Guardar una copia de todos los libros para búsquedas
        this.librosOriginales = [...response.data];
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
    toggleDarkMode() {
      this.darkMode = !this.darkMode; // Cambiar el estado
      localStorage.setItem("darkMode", this.darkMode); // Guardar la elección
      this.applyTheme(); // Aplicar el nuevo tema
    },
    applyTheme() {
      document.body.classList.toggle("dark-mode", this.darkMode);
      document.body.classList.toggle("light-mode", !this.darkMode);
    },
    limpiarBusqueda() {
      this.busqueda = "";
      this.libros = this.librosOriginales;
    },
    
    goToDetalles(libro) {
      this.$router.push({ name: 'Detalles', params: { id: libro.nombre } });
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

.theme-toggle-btn:hover {
  background-color: #666;
}

/* Modo oscuro */
.dark-mode .listado {
  background-color: #343434;
  color: #ffffff;
}

/* Modo claro */
.light-mode {
  background-color: #ffffff;
  color: #000000;
}

.light-mode .listado {
  background-color: #ead5a1;
  color: #000000;
}

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
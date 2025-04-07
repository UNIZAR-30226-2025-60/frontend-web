<template>
  <div v-if="user">
    <NavBar :dark-mode="darkMode"></NavBar>
    <div class="cabecera">
      <div class="container mt-2">
        <!-- Barra de búsqueda -->
        <form class="d-flex mb-3 mt-4" @submit.prevent="buscarLibros">
          <div class="input-group">
            <input class="form-control rounded-pill" type="search" placeholder="Buscar libros..." aria-label="Buscar" v-model="busqueda">
          </div>
        </form>

        <!-- Categorías-->
        <div class="categorias-header">
          <h5 class="categorias-titulo">Categorías:</h5>
          
          <div class="categorias-wrapper">
            <!-- Flecha Izquierda -->
            <button
              class="arrow-btn arrow-left"
              :class="{ disabled: isAtStart }"
              @click="scrollLeft"
            >
              <span class="arrow-left-icon"></span>
            </button>

            <!-- Contenedor con scroll horizontal -->
            <div
              class="categorias-container"
              ref="categoriasScroll"
              @scroll="checkScroll"
            >
              <div class="categorias-scroll">
                <!-- Mostrar todas las categorías -->
                <button
                  v-for="tema in temas"
                  :key="tema.tematica"
                  @click="filtrarPorCategoria(tema.tematica)"
                  class="categoria-btn"
                  :class="{ 'categoria-seleccionada': categoriaSeleccionada === tema.tematica }"
                >
                  {{ tema.tematica }}
                </button>
              </div>
            </div>

            <!-- Flecha Derecha -->
            <button
              class="arrow-btn arrow-right"
              :class="{ disabled: isAtEnd }"
              @click="scrollRight"
            >
              <span class="arrow-right-icon"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="listado">
      <div class="l-container p-2 mx-5">
        <!-- Lista de libros -->
        <button @click="toggleDarkMode" class="theme-toggle-btn">
          {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
        </button>
        <h4 class="libros-disponibles">
          {{ busqueda ? 'Resultados de la búsqueda' : 'LIBROS DISPONIBLES' }}
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
    <button class="back-to-top" @click="scrollTop">
      <font-awesome-icon :icon="['fas', 'chevron-up']" />
    </button>

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
      isAtStart: true,
      isAtEnd: false,
    };
  },
  computed: {
    visibleTemas() {
      return this.temas.slice(0, this.visibleCategories);
    }
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
      this.darkMode = !this.darkMode; 
      localStorage.setItem("darkMode", this.darkMode); 
      this.applyTheme(); 
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
    },
    scrollLeft() {
      const container = this.$refs.categoriasScroll;
      container.scrollBy({ left: -150, behavior: 'smooth' });
      this.checkScroll();
    },
    scrollRight() {
      const container = this.$refs.categoriasScroll;
      container.scrollBy({ left: 150, behavior: 'smooth' });
      this.checkScroll();
    },
    checkScroll() {
      const container = this.$refs.categoriasScroll;
      this.isAtStart = container.scrollLeft <= 0;
      this.isAtEnd =
        container.scrollWidth - container.clientWidth - container.scrollLeft <= 0;
    },
    scrollTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};
</script>

<style scoped>

.cabecera {
  padding: 20px;
  background-color: #F8E79B;
}

.categorias-titulo{
  color:#4C4637 !important;
  font-weight: bold;
}

.categorias-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem; 
}

.categoria-btn {
  background-color: #F8F7F3;
  color: #4C4637;
  border: 1px solid #4C4637;
  border-radius: 50px;
  padding: 6px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.categoria-btn:hover {
  background-color: #C6C1B3;
}

.categoria-seleccionada {
  background-color: #C6C1B3 !important;
  color: #4C4637 !important;
}

.categorias-wrapper {
  position: relative;
  width: 85%; 
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.categorias-container {
  width: 100%; 
  overflow-x: auto;
  white-space: nowrap;
  -ms-overflow-style: none; 
  scrollbar-width: none;
}

.categorias-container::-webkit-scrollbar {
  display: none;
}

.categorias-scroll {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  padding: 5px;
}

.arrow-btn {
  background: none;
  border: none;
  cursor: pointer;
  z-index: 2;
}

.arrow-btn.disabled {
  cursor: not-allowed;
  color: darkgray;
}

.arrow-left-icon,
.arrow-right-icon {
  display: inline-block;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
}

.arrow-left-icon {
  border-right: 10px solid black;
}
.arrow-right-icon {
  border-left: 10px solid black;
}
.arrow-btn.disabled .arrow-left-icon {
  border-right-color: darkgray;
}
.arrow-btn.disabled .arrow-right-icon {
  border-left-color: darkgray;
}

.libros-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.card-body {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.book-card {
  width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
  border: none !important;
  box-shadow: none !important;
  background-color: transparent !important;
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
  text-align: center;
  margin-top: 10px;
  color: var(--color-texto);
}

.cabecera {
  padding: 20px;
}

.cabecera .container {
  margin-top: 0 !important; 
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
  cursor: pointer;
  z-index: 9999;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.libros-disponibles {
  text-align: center;         
  font-weight: bold;        
  font-size: 2rem;          
  margin: 30px 0;           
}

</style>
<template>
    <div v-if="user" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
      <NavBar :dark-mode="darkMode"></NavBar>
  
      <div class="container-fluid pt-5 p-5 min-vh-100">
  
        <!-- Botón de cambio de tema -->
        <button @click="toggleDarkMode" class="theme-toggle-btn mb-3">
          {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
        </button>
        <!-- Barra de búsqueda -->
        <form class="d-flex mb-3 mt-4" @submit.prevent="buscarLibros">
          <div class="input-group">
            <input class="form-control rounded-pill" type="search" placeholder="Buscar título" aria-label="Buscar" v-model="busqueda">
          </div>
        </form>
        <h4 class="text p-2">
            {{ busqueda ? 'Resultados de la búsqueda' : 'Mis Favoritos' }}
          </h4>
        <h4 class="text p-2">{{ libros.length > 0 ? '' : 'No tienes ningun libro en favoritos' }}</h4>
        <div class="listado">
          <div class="l-container p-2 mx-5">
            <!-- Lista de libros -->
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
    name: 'Favoritos',
    components: {
      NavBar,
      Footer
    },
    data() {
      return {
        user: null,
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
          if (!this.user) return;
        
          // En primer lugar obtenemos todos los libros de la base de datos
          const response = await apiClient.get("/libros");
          const todosLosLibros = response.data;
          
          // En segundo lugar obtenemos los libros favoritos del usuario
          const response1 = await apiClient.get(`/listas/favoritos/${this.user.correo}`);
          const librosFavoritos = response1.data;
          
          console.log("Vamos a cargar los libros favoritos de:", this.user.correo);
          console.log("los libros favoritos de usuario son:", librosFavoritos);
          
          // Después filtramos los libros
          this.libros = librosFavoritos.map(favorito => {
            // Nos quedamos únicamente con los que coinciden los enlaces, es decir, los favoritos del usuario
            const libroEncontrado = todosLosLibros.find(libro => 
              libro.enlace === favorito.enlace_libro
            );
            
            // Nos guardamos todos los atributos que no sabíamos de los libros favoritos y que ahora conocemos
            return libroEncontrado ? {
              ...libroEncontrado,
              imagen_portada: libroEncontrado.imagen_portada || 'https://via.placeholder.com/150x225?text=Sin+Portada'
            } : null;
          }).filter(libro => libro !== null); // Remove any null entries
          
          // Guardar una copia de todos los libros favoritos
          this.librosOriginales = [...this.libros];
          
          console.log("Se han podido mostrar los libros guardados en favoritos con éxito:", this.libros);
        } catch (error) {
          console.error("Error al cargar los libros favoritos:", error);
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
      toggleDarkMode() {
        this.darkMode = !this.darkMode; // Cambiar el estado
        localStorage.setItem("darkMode", this.darkMode); // Guardar la elección
        this.applyTheme(); // Aplicar el nuevo tema
      },
      applyTheme() {
        document.body.classList.toggle("dark-mode", this.darkMode);
        document.body.classList.toggle("light-mode", !this.darkMode);
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
  
  /* Colores modo oscuro */
  .dark-mode {
    background-color: #343434;
    color: #ffffff;
  }
  
  .dark-mode .container-fluid {
    background-color: #343434;
    color: #ffffff;
  }
  
  /* Colores modo claro */
  .light-mode {
    background-color: #ffffff;
    color: #000000;
  }
  
  .light-mode .container-fluid {
    background-color: #ead5a1;
    color: #000000;
  }
  
  .page-wrapper {
    min-height: 100vh;
  }
  
  .page-wrapper.dark-mode {
    background-color: #343434;
    color: #ffffff;
  }
  
  .page-wrapper.light-mode {
    background-color: #ead5a1;
    color: #000000;
  }
  </style>
<template>
  <div v-if="lista && libros" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <NavBar :dark-mode="darkMode"></NavBar>

    <div class="container-fluid pt-5 p-5 min-vh-100">
      <!-- Botón de cambio de tema -->
      <button @click="toggleDarkMode" class="theme-toggle-btn mb-3">
        {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
      </button>

      <!-- Barra de búsqueda -->
      <form class="d-flex mb-3 mt-4" @submit.prevent="buscarLibros">
        <div class="input-group">
          <input class="form-control rounded-pill" type="search" placeholder="Buscar título" aria-label="Buscar" v-model="busqueda">
        </div>
      </form>

      <!-- Banner con imagen a la izquierda y texto a la derecha -->
      <div class="lista-banner">
        <div class="banner-image">
          <img :src="transformarURLGoogleDrive(lista.portada) || 'https://via.placeholder.com/150x150.png?text=Imagen+de+Lista'" alt="Imagen de la lista">
        </div>
        <div class="lista-info">
          <h2 class="lista-titulo">{{ lista.nombre }}</h2>
          <p class="lista-descripcion">{{ lista.descripcion }}</p>
          <!-- Tipo de lista: Pública o Privada -->
          <p class="lista-tipo">
            <span :class="darkMode ? 'text-light' : 'text-dark'">
              <i v-if="!lista.publica" class="fas fa-lock"></i>
              {{ lista.publica ? 'Pública' : 'Privada' }}
            </span>
          </p>
        </div>
      </div>

      <h5 class="text-center p-2">{{ libros.length > 0 ? '' : 'No tienes ningun libro en la lista' }}</h5>

      <!-- Lista de libros -->
      <div class="listado">
        <div class="l-container p-2 mx-5">
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
  name: 'VerLista',
  components: {
    NavBar,
    Footer,
    Cargando
  },
  data() {
    return {
      user: null,
      libros: [],
      lista: null,
      busqueda: "",
      donde: "",
      darkMode: localStorage.getItem("darkMode") === "true", // Obtener el tema guardado
    };
  },
  async mounted() {
    try {
      const response1 = await apiClient.get("/user"); // Llamada a usuario
      this.user = response1.data;
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      this.$router.push("/");
    }
    try{
      this.donde = this.$route.params.donde;
      const listaID = this.$route.params.id;
      if(this.donde == "MisListas"){
        const response = await apiClient.get(`/listas/${this.user.correo}/${listaID}`);
        this.lista = response.data;
        console.log("Lista obtenida (usuario dueño):", this.lista);
      } else {
        const response = await apiClient.get(`/listas/publicas/${listaID}`);
        this.lista = response.data;
        console.log("Lista obtenida (pública):", this.lista);
      }
      this.cargarLibros();
      this.applyTheme();        
    }catch(error){
      console.error("Error al cargar la lista:", error);
      this.$router.push("/inicio");
    }
  },
  watch: {
    // Observador para buscar mientras se escribe
    busqueda(newValue) {
      if (!newValue) {
        // Si está vacío, se muestran todos los libros
        this.libros = this.librosOriginales;
        return;
      }
      
      // Filtrar libros basado en la búsqueda
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
        // Si está vacío, se muestran todos los libros
        this.libros = this.librosOriginales;
        return;
      }
      
      // Filtrar libros basado en la búsqueda
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
        const response1 = await apiClient.get(`/listas/${this.user.correo}/${this.lista.nombre}/libros`);
        const librosLista = response1.data;
      
        console.log("Vamos a cargar los libros favoritos de:", this.user.correo);
        console.log("los libros favoritos de usuario son:", librosLista);
        
        // Después filtramos los libros
        this.libros = librosLista.map(libroL => {
          // Nos quedamos únicamente con los que coinciden los enlaces, es decir, los favoritos del usuario
          const libroEncontrado = todosLosLibros.find(libro => 
            libro.enlace === libroL.enlace_libro
          );
          
          // Nos guardamos todos los atributos que no sabíamos de los libros favoritos y que ahora conocemos
          return libroEncontrado ? {
            ...libroEncontrado,
            imagen_portada: libroEncontrado.imagen_portada || 'https://via.placeholder.com/150x225?text=Sin+Portada'
          } : null;
        }).filter(libro => libro !== null); // Remove any null entries
        
        // Guardar una copia de todos los libros favoritos
        this.librosOriginales = [...this.libros];
        
        console.log("Se han podido mostrar los libros guardados en favoritos con éxito:", this.libros);
      } catch (error) {
        console.error("Error al cargar los libros favoritos:", error);
      }
    },
    // Función para transformar URLs de Google Drive
    transformarURLGoogleDrive(url) {
      if (!url) return null;

      try {
        // Extraer el ID del archivo de Google Drive
        const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
        
        if (match) {
          const id = match[1];
          // Nueva URL usando lh3.googleusercontent.com
          return `https://lh3.googleusercontent.com/d/${id}=w500`;
        }
        
        return url; // Si no es de Drive, devolver tal cual
      } catch (error) {
        console.error("Error al transformar URL:", error);
        return null;
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
      localStorage.setItem("darkMode", this.darkMode); // Guardar la elección
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
/* Estilos del boton de cambio de tema */
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

.dark-mode .lista-banner {
  background-color: #444;
}

.dark-mode .lista-info {
  color: #ffffff;
}

.dark-mode .lista-tipo i {
  color: #f1c40f; /* color del candado en modo oscuro */
}

.dark-mode .text-light {
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

.light-mode .lista-banner {
  background-color: #f8f9fa;
}

.light-mode .lista-info {
  color: #000000;
}

.light-mode .lista-tipo i {
  color: #888; /* color del candado en modo claro */
}

.light-mode .text-dark {
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

/* Banner con imagen a la izquierda y texto a la derecha */
.lista-banner {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 30px;
  margin-bottom: 40px;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.banner-image {
  width: 150px;  /* Tamaño normal para la imagen */
  height: 150px;
  overflow: hidden;
  border-radius: 10px;
  margin-right: 20px;  /* Separación entre imagen y texto */
}

.banner-image img {
  width: 100%;  /* Imagen se ajusta al contenedor */
  height: 100%;
  object-fit: cover;  /* Mantener la proporción de la imagen */
}

.lista-info {
  flex-grow: 1;  /* Asegura que el texto ocupe el espacio restante */
  text-align: left;
}

.lista-titulo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.lista-descripcion {
  font-size: 1.1rem;
  color: #555;
  opacity: 0.9;
}

.lista-tipo {
  font-size: 1rem;
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.lista-tipo i {
  margin-right: 5px;
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
</style>
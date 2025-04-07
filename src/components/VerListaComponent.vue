<template>
  <div v-if="lista && libros" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <NavBar :dark-mode="darkMode"  :user="user"></NavBar>

    <div class="container-fluid pt-4 p-5 min-vh-100">
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

      <div>

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

        <!-- Barra de búsqueda -->
        <form class="d-flex mb-3 mt-4" @submit.prevent="buscarLibros">
          <div class="position-relative w-100">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="position-absolute" style="left: 15px; top: 50%; transform: translateY(-50%); color: #aaa;"/>
            <input class="form-control rounded-pill ps-5" type="search" placeholder="Buscar libros..." aria-label="Buscar" v-model="busqueda">
          </div>
        </form>

        <h5 class="text-center p-2">{{ libros.length > 0 ? '' : 'No se encontraron libros' }}</h5>

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
      this.$router.push("/");
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


        let librosLista;
        
        if(this.donde == "MisListas"){
          // Si es una lista propia
          const response1 = await apiClient.get(`/listas/${this.user.correo}/${this.lista.nombre}/libros`);
          librosLista = response1.data;
        } else {
          // Si es una lista pública
          const responsePublica = await apiClient.get(`/listas/publicas/${this.lista.nombre}/librosP`);
          librosLista = responsePublica.data;
        }
      
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

.page-wrapper {
  min-height: 100vh;
}

.lista-banner {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 60px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--color-texto);
  border-radius: 12px;
}

.banner-image {
  width: 150px;  
  height: 150px;
  overflow: hidden;
  border-radius: 10px;
  margin-right: 20px; 
}

.banner-image img {
  width: 100%; 
  height: 100%;
  object-fit: cover;  
}

.lista-info {
  flex-grow: 1; 
  text-align: left;
  color: var(--color-texto);
}

.lista-titulo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--color-texto);
}

.lista-descripcion {
  font-size: 1.1rem;
  opacity: 0.9;
  color: var(--color-texto);
}

.lista-tipo {
  font-size: 1rem;
  margin-top: 10px;
  display: flex;
  align-items: center;
  color: var(--color-texto);
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

.book-card.card {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.book-card .card-body {
  background-color: transparent !important;
  border: none !important;
  padding: 0 !important;
  box-shadow: none !important;
}

.book-title {
  color: var(--color-texto);
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
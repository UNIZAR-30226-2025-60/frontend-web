<template>
  <div v-if="user">
    <NavBar></NavBar>
    <div class="container mt-4">
      
      <!-- Barra de búsqueda -->
      <form class="d-flex mb-3">
        <div class="input-group">
          <input class="form-control rounded-pill" type="search" placeholder="Buscar..." aria-label="Buscar">
          <button class="btn btn-success rounded-pill" type="submit">Buscar</button>
        </div>
      </form>
    
      <!-- Categorías -->
      <div class="d-flex mb-3">
        <h4 class="mb-3">Categorías:</h4>
        <div class="categorias-container">
          <div class="categorias-scroll">
            <button v-for="tema in temas" :key="tema.tematica" class="btn btn-outline-success rounded-pill btn-sm">
              {{ tema.tematica }}
            </button>
          </div>
        </div>
      </div>

      <!-- Información del usuario -->
      <div class="text-center mt-4">
        <h3>Bienvenido, {{ user.nombre }}</h3>
        <p>Correo: {{ user.correo }}</p>
      </div>

      <!-- Lista de libros -->
      <h4 class="mt-4">Libros disponibles</h4>
      <div class="row libros-container">
        <div v-for="libro in libros" :key="libro.enlace" class="col-lg-3 col-md-4 col-sm-6 col-12 mb-4 d-flex justify-content-center">
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
  <div v-else>
    <p>Cargando...</p>
  </div>
</template>

<script>
import axios from "axios";
import NavBar from '@/components/NavBar.vue'
export default {
  components: {
    NavBar
  },
  data() {
    return {
      user: null, // Inicializamos con null
      //Para probar botones de categorias
      temas : [
        {tematica: 'Amor'},
        {tematica: 'Aventura'},
        {tematica: 'Terror'},
        {tematica: 'Comedia'},
        {tematica: 'Fantasía'},
        {tematica: 'Drama'},
        {tematica: 'Acción'},
        {tematica: 'Ciencia Ficción'},
        {tematica: 'Romántico'},
        {tematica: 'Misterio'},
        {tematica: 'Thriller'},
        {tematica: 'Historia'},
        {tematica: 'Ficción'},
        {tematica: 'Infantil'},
        {tematica: 'Suspenso'},
        {tematica: 'Psicológico'},
        {tematica: 'Terror Psicológico'},
        {tematica: 'Romántico'},
        {tematica: 'Superhéroes'}
      ],
      libros: []
    };
  },
  async mounted() {
    try {
      // Petición para obtener los datos del usuario autenticado
      const response = await axios.get("http://localhost:3000/api/user", {
        withCredentials: true, // Permite enviar cookies al backend
      });
      this.user = response.data; // Guardamos los datos del usuario
      this.cargarLibros();
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      // Si hay error, redirigimos al login
      this.$router.push("/");
    }
  }, 
  methods: {
    async cargarLibros() {
      try {
            const response = await axios.get('http://localhost:3000/api/libros');
            this.libros = response.data;
          } catch (error) {
            console.error('Error al cargar el foro:', error);
          }
      }
    }
};
</script>
<style scoped>
  
  .container {
    max-width: 1100px;
  }

  .categorias-container {
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 10px;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .categorias-container::-webkit-scrollbar {
    display: none;
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
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
</style>
<!-- <template>
  <div>
    <h3>Bienvenido, {{ user.displayName }}</h3>
    <p>Correo: {{ user.email }}</p>
    
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      user: null,
    };
  },
  async mounted() {
    try {
      const response = await axios.get("http://localhost:3000/api/user", {
        withCredentials: true,
      });
      this.user = response.data;
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      this.$router.push("/");
    }
  },
};
</script> -->

<template>
  <div v-if="user">
    <NavBar></NavBar>
    <div>
      <form class="align-items-center" role="search" style="margin: 0 10px;">
        <div class="input-group">
          <input class="form-control rounded-pill" type="search" placeholder="Search" aria-label="Search">
          <button class="btn btn-outline-success rounded-pill" type="submit">Search</button>
        </div>
      </form>
      <h4>Categorías:</h4>
      <div class="row g-2">
        <div v-for="tema in temas" :key="tema.tematica" class="col-1">
          <button class="btn btn-outline-success rounded-pill btn-sm w-100">{{ tema.tematica }}</button>
        </div>
      </div>
    </div>
    <div v-for="libro in libros" :key="libro.enlace" class="col-md-3 col-sm-4 col-6">
      <a href="#">
        <img class="img fluid" v-bind:src="libro.imagen_portada">
      </a>
      <p>{{ libro.nombre }}</p>
    </div>

    <h3>Bienvenido, {{ user.nombre }}</h3>
    <p>Correo: {{ user.correo }}</p>
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
  h4 {
    margin-bottom: 10px;
  }

  button {
    font-size: 0.8rem;  /* Ajustamos el tamaño del texto en los botones */
    padding: 8px 16px;  /* Ajustamos el padding de los botones */
  }
</style>
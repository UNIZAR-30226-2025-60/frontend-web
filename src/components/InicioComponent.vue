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
    <div v-for="libro in libros" :key="libro.enlace" class="col-md-3 col-sm-4 col-6">
      <a href="#">
        <img class="img fluid" v-bind:src="libro.imagen_portada"
      </a>
      <p>{{ libro.nombre }}</p>
    </div>

    <h3>Bienvenido, {{ user.displayName }}</h3>
    <p>Correo: {{ user.email }}</p>
  </div>
  <div v-else>
    <p>Cargando...</p>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      user: null, // Inicializamos con null
    };
  },
  async mounted() {
    try {
      // Petición para obtener los datos del usuario autenticado
      const response = await axios.get("http://localhost:3000/api/user", {
        withCredentials: true, // Permite enviar cookies al backend
      });
      this.user = response.data; // Guardamos los datos del usuario
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
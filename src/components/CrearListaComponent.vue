<template>
    <NavBar></NavBar>
    <div class="container mt-5">
      <h2>Crear Nueva Lista</h2>
      <form @submit.prevent="crearLista">
        <div class="mb-3">
          <label for="nombre" class="form-label">Nombre de la Lista</label>
          <input v-model="nombre" type="text" class="form-control" id="nombre" required>
        </div>
        
        <div class="mb-3">
          <label for="descripcion" class="form-label">Descripción</label>
          <textarea v-model="descripcion" class="form-control" id="descripcion"></textarea>
        </div>
        
        <div class="mb-3 form-check">
          <input v-model="publica" type="checkbox" class="form-check-input" id="publica">
          <label class="form-check-label" for="publica">¿Lista pública?</label>
        </div>
        
        <button type="submit" class="btn btn-primary">Crear Lista</button>
      </form>
    </div>
    <Footer></Footer>
  </template>
  
  <script>
  import NavBar from '@/components/NavBar.vue'
    import Footer from '@/components/Footer.vue'
  import { apiClient } from '../config';
  
    export default {
        components: {
        NavBar,
        Footer
    },
    data() {
      return {
        user: null,
        nombre: '',
        descripcion: '',
        publica: false
      };
    },
    async mounted() {
        try {
            const response = await apiClient.get("/user"); // Llamada a usuario
            this.user = response.data;

        } catch (error) {
            console.error("Error al obtener los datos del usuario:", error);
            this.$router.push("/");
        }
    },
    methods: {
      async crearLista() {
        try {
          await apiClient.post('/listas', {
            nombre: this.nombre,
            usuario_id: this.user.correo,
            descripcion: this.descripcion,
            publica: this.publica,
            portada: 'https://drive.google.com/file/d/1w1-4PqTPplZGqUunJa8B6C1cJw9vsStJ/view?usp=sharing'
          });
          alert('Lista creada con éxito');
          this.$router.push('/mislistas');
        } catch (error) {
          console.error('Error al crear la lista:', error);
          alert('No se pudo crear la lista');
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 600px;
  }
  </style>
  
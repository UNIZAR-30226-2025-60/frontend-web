<template>
  <div>
    <NavBar></NavBar>
    <div v-if="libro" class="container mt-4">
      <div class="row">
        <div class="col-md-4">
          <img :src="libro.imagen_portada" class="img-fluid" alt="Portada del libro">
          <p class="mb-3">{{ libro.nombre }}</p>
        </div>
        <div class="col-md-8">
          <h2 class="mb-3">{{ libro.nombre }} de {{ libro.autor }}</h2>
          <!--<FontAwesomeIcon :icon="faHeart" class="me-2 text-black rounded" @click="aniadirAFavoritos" />-->
          <button class="me-2 text-black rounded" @click="aniadirALista">Añadir a lista:</button>
          <button class="btn btn-primary" @click="leerLibro">📖 Leer</button>
          <h4>Sinopsis</h4>
          <p class="text-justify">{{ libro.resumen }}</p>
        </div>
      </div>
    </div>
    <div v-else class="container mt-4 text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
import axios from 'axios';
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
//import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
//import { faClock, faBook, faFileWord } from '@fortawesome/free-solid-svg-icons';
import { apiClient } from '../config';


export default {
  name: 'Detalles',
  components: {
    NavBar,
    Footer
  },
  data() {
    return {
      libro: null
    };
  },
  async mounted() {
    try {
      const libroId = encodeURIComponent(this.$route.params.id);
      const response = await apiClient.get(`/libros/titulo/${libroId}`);
      this.libro = response.data;
    } catch (error) {
      console.error('Error al cargar los detalles del libro:', error);
    }
  },
  methods: {
    aniadirALista() {
    },
    aniadirAFavoritos() {
    },
    leerLibro() {
    console.log("📖 Datos del libro:", this.libro);

    if (this.libro && this.libro.enlace) {
      // Extraer la ID del archivo desde la URL de Google Drive
      const driveIdMatch = this.libro.enlace.match(/\/d\/(.*?)\//);
      
      if (!driveIdMatch || !driveIdMatch[1]) {
        alert("❌ Error: No se pudo extraer la ID del archivo PDF.");
        return;
      }

      const fileId = driveIdMatch[1];
      const pdfUrl = `${apiClient.defaults.baseURL}/proxy-pdf?url=https://drive.google.com/uc?id=${fileId}&export=download`;

      console.log("✅ Redirigiendo al visor con URL:", pdfUrl);

      // Redirigir al visor
      this.$router.push({
        path: "/visor-pdf",
        query: { url: pdfUrl } // 🔥 Aquí NO usamos encodeURIComponent()
      });
    } else {
      alert("❌ Este libro no tiene un PDF disponible.");
    }
  }
}
};
</script>

<style scoped>
.button {
  background: #afb7be;
}
.text-justify {
  text-align: justify;
}

.img-fluid {
  max-height: 500px;
  object-fit: contain;
}
</style>
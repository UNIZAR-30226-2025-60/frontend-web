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
import { API_URL, AUTH_URL } from '../config';

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
      const libroId = this.$route.params.id;
      //const response = await axios.get(`http://localhost:3000/api/libros/titulo/${libroId}`);
      const response = await axios.get(`${API_URL}/libros/titulo/${libroId}`);
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
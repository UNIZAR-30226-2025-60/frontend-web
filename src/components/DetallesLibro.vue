<template>
  <div>
    <NavBar></NavBar>
    <div v-if="libro" class="container mt-4">
      <div class="row">
        <div class="col-md-4 d-flex flex-column align-items-center">
          <img :src="libro.imagen_portada" class="img-fluid" alt="Portada del libro">
          <p class="mb-3 text-center">{{ libro.nombre }}</p>
          <button class="btn px-5" @click="mostrarPDF">Leer</button>
        </div>
        <div class="col-md-8">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4>{{ libro.nombre }}</h4>
              <h4>de: {{ libro.autor }}</h4>
            </div>
            <div>
              <button class="btn me-3" @click="aniadirAFavoritos">Añadir a favoritos</button>
              <button class="btn" @click="aniadirALista">Añadir a lista</button>
            </div>
          </div>

          <!-- Línea horizontal antes de más libros del mismo autor -->
          <hr class="my-3">

          <!-- Sección para otros libros del mismo autor -->
          <div v-if="librosRelacionados.length > 0">
            <h5>Más de {{ libro.autor }}</h5>
            <div class="row">
              <div v-for="(libroRelacionado, index) in librosRelacionados" :key="index" class="col-md-3">
                <img :src="libroRelacionado.imagen_portada" class="libro-relacionado-img" alt="Portada" @click="goToDetalles(libroRelacionado)">
              </div>
            </div>
          </div>

          <!-- Línea horizontal antes de la sinopsis -->
          <hr class="my-3">

          <h5>Sinopsis</h5>
          <p class="text-justify">{{ libro.resumen }}</p>

          <!-- Línea horizontal antes de la información de las páginas del libro, horas de lectura, ... -->
          <hr class="my-3">

          <h5>Acerca de este libro</h5>
          <!-- Faltará poner los iconos que correspondan cuando sepa hacerlo -->
          <div  class="d-flex  align-items-center">
              <p class="mb-3 pe-3">{{ libro.num_paginas }} Páginas</p>
              <p class="mb-3 px-3 border-start border-end">{{ libro.horas_lectura }} Horas de lectura</p>
              <p class="mb-3 px-3">{{ libro.num_palabras }} Total de palabras</p>
          </div>

          <!-- Línea horizontal antes de valoraciones del libro -->
          <hr class="my-3">

          <h5>Valoraciones del libro:</h5>
          <p class="mb-1"> Valoración general</p>
          <p> {{ libro.puntuacion_media }} de 5</p>
          <button class="btn mb-1" @click="aniadirValoracion">Añadir Valoración</button>

          <!-- Línea horizontal antes del título todas las reseñas del libro -->
          <hr class="my-3">

          <div class="d-flex justify-content-between align-items-center">
            <h5>Todas las reseñas del libro:</h5>
            <div class="dropdown">
              <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Ordena por: </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">Valoración más alta</a></li>
                <li><a class="dropdown-item" href="#">Valoración más baja</a></li>
                <li><a class="dropdown-item" href="#">Valoración más antigua</a></li>
                <li><a class="dropdown-item" href="#">Valoración más reciente</a></li>
              </ul>
            </div>
          </div>

          <!-- Línea horizontal antes de todas las reseñas del libro -->
          <hr class="my-3">

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
      libro: null,
      librosRelacionados: []
    };
  },
  async mounted() {
    try {
      const libroId = encodeURIComponent(this.$route.params.id);
      const response = await apiClient.get(`/libros/titulo/${libroId}`);
      this.libro = response.data;
      if (this.libro) {
        await this.obtenerLibrosDelMismoAutor();
      }
    } 
    catch (error) {
      console.error('Error al cargar los detalles del libro:', error);
    }
  },
  watch: {
    // Observa cambios en la ruta y vuelve a cargar los detalles del libro
    '$route.params.id': async function() {
      await this.cargarDetallesLibro();
    }
  },
  methods: {
    aniadirALista() {
    },
    aniadirAFavoritos() {
    },
    aniadirValoracion() {

    },
    mostrarPDF() {

    },
    async cargarDetallesLibro() {
      try {
        const libroId = encodeURIComponent(this.$route.params.id);
        const response = await apiClient.get(`/libros/titulo/${libroId}`);
        this.libro = response.data;
        if (this.libro) {
          await this.obtenerLibrosDelMismoAutor();
        }
      } catch (error) {
        console.error('Error al cargar los detalles del libro:', error);
      }
    },
    async obtenerLibrosDelMismoAutor() {
      try {
        const response = await apiClient.get(`/libros/autor/${encodeURIComponent(this.libro.autor)}`);
        // Filtramos para excluir el libro actual
        this.librosRelacionados = response.data.filter(libro => libro.enlace !== this.libro.enlace);
      } catch (error) {
        console.error('Error al obtener libros del mismo autor:', error);
      }
    },
    goToDetalles(libro) {
      this.$router.push({ name: 'Detalles', params: { id: libro.nombre } });
    }
  }
};
</script>

<style scoped>
/* Estilos del botón */
.btn {
  background-color: #444;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
}

.btn:hover {
  background-color: #666;
  color: #fff;
}

.text-justify {
  text-align: justify;
}

.img-fluid {
  max-height: 500px;
  object-fit: contain;
}

.libro-relacionado-img {
  width: 40%; 
  height: 100px; 
  object-fit: cover; 
  cursor: pointer;
  transition: transform 0.3s;
}

.libro-relacionado-img:hover {
  transform: scale(1.05);
}
</style>
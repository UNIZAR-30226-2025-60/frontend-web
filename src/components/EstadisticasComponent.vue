<template>
  <div :class="themeClass">
    <NavBar :darkMode="darkMode" @toggle-dark-mode="toggleDarkMode" />

    <div class="container-fluid py-4"> 

      <!-- Botón modo oscuro/claro -->
      <button @click="toggleDarkMode" class="theme-toggle-btn mb-3">
        {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
      </button>

      <!-- Título "Estadísticas" -->
      <h2 class="mb-4 text-center stats-main-title">Estadísticas</h2>

      <div class="row gap-4">
        <!-- COLUMNA "MIS ESTADÍSTICAS" -->
        <div class="col-md-6 mb-4 border-end pe-4">
          <h4 class="mb-4 text-center">Mis Estadísticas</h4>

          <!-- Bloque con 3 círculos -> libros en progreso, leídos mes, leídos total -->
          <div class="stats-circles d-flex justify-content-around align-items-center mb-4">
            <div class="stat-circle shadow" :class="darkMode ? 'circle-dark' : 'circle-light'">
              <div class="circle-text">{{ librosEnProgreso }}</div>
              <div class="circle-label">En progreso</div>
            </div>
            <div class="stat-circle shadow" :class="darkMode ? 'circle-dark' : 'circle-light'">
              <div class="circle-text">{{ totalLibrosLeidosMes }}</div>
              <div class="circle-label">Leídos mes</div>
            </div>
            <div class="stat-circle shadow" :class="darkMode ? 'circle-dark' : 'circle-light'">
              <div class="circle-text">{{ librosTotales }}</div>
              <div class="circle-label">Leídos total</div>
            </div>
          </div>

          <!-- Si hay libros leídos en total, muestra temáticas y libros recomendados -->
          <div v-if="librosTotales > 0">
            <!-- Bloque de temáticas más leídas -->
            <div class="p-3 tematicas-block mx-auto" :class="darkMode ? 'tematicas-block-dark' : 'tematicas-block-light'">
              <h6 class="tematicas-title mb-2">Temáticas más leídas:</h6>
              <ul class="list-unstyled mt-2">
                <li v-for="(tema, idx) in tematicasMasLeidas" :key="idx" class="tema-item">
                  {{ tema.tematica }}
                </li>
              </ul>
            </div>

            <!-- Bloque de Libros Recomendados -->
            <div class="mt-4">
              <h5 class="text-center">Libros recomendados:</h5>
              <div class="d-flex justify-content-center">
                <div class="carousel-container d-flex align-items-center">
                  <!-- Flecha izquierda -->
                  <button class="arrow-btn me-1" @click="prevSlide">
                    <span class="arrow-icon">‹</span>
                  </button>
                  
                  <div class="book-list d-flex flex-nowrap align-items-center">
                    <div
                      v-for="(libro, index) in visibleBooks"
                      :key="index"
                      class="book-item me-1"
                      @click="goToDetalles(libro)"
                    >
                      <img
                        :src="libro.portada || libro.imagen_portada || placeholder"
                        class="recommended-book-image"
                        alt="Portada"
                      />
                    </div>
                  </div>

                  <!-- Flecha derecha -->
                  <button class="arrow-btn ms-1" @click="nextSlide">
                    <span class="arrow-icon">›</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mensaje cuando no hay libros leídos en total -->
          <div v-else class="mt-4 text-center no-data-message">
            <div class="no-data-content">
              <i class="fas fa-info-circle icono"></i>
              <p class="mb-0">
                <strong>¡Ups!</strong> 
                No hay suficiente información para mostrar las temáticas más leídas o recomendar otros libros.
              </p>
            </div>
          </div>

          <!-- Bloque de libros que más te han gustado (mejor puntuados) -->
          <div class="mt-4" v-if="librosMasValorados && librosMasValorados.length">
            <h5 class="text-center">Libros que más te han gustado:</h5>
            <div class="d-flex flex-wrap liked-books-container justify-content-center">
              <div
                v-for="(libro, index) in librosMasValorados"
                :key="index"
                class="liked-book-item"
                @click="goToDetalles(libro)"
              >
                <img
                  :src="libro.imagen_portada || libro.portada || placeholder"
                  class="small-book-image"
                  alt="Portada"
                />
              </div>
            </div>
          </div>

          <!-- Mensaje cuando no hay reseñas -->
          <div class="mt-4 text-center no-data-message" v-else>
            <div class="no-data-content">
              <i class="fas fa-heart icono"></i>
              <p class="mb-0">
                <strong>¡Hey!</strong> 
                Todavía no has valorado ningún libro.
              </p>
            </div>
          </div>
        </div>

        <!-- COLUMNA "ESTADÍSTICAS GENERALES" -->
        <div class="col-md-5 text-center">
          <h4 class="mb-4">Estadísticas Generales</h4>

          <div class="mb-4">
            <h6>Top 3 Usuarios (Mes)</h6>
            <ul>
              <li v-for="(usuario, i) in top3UsuariosMes" :key="i">
                {{ usuario.correo }} - {{ usuario.totalLeidosMes }} libros leídos
              </li>
            </ul>
          </div>

          <div class="mb-4">
            <h6>Top 3 Usuarios (Año)</h6>
            <ul>
              <li v-for="(usuario, i) in top3UsuariosAnio" :key="i">
                {{ usuario.correo }} - {{ usuario.totalLeidosAnio }} libros leídos
              </li>
            </ul>
          </div>

          <div class="mb-4">
            <h6>Top 5 Libros (Mes Actual)</h6>
            <ul>
              <li v-for="(libro, idx) in top5LibrosMesActual" :key="idx">
                {{ libro.nombre }} - {{ libro.contador_lecturas }} lecturas
              </li>
            </ul>
          </div>

          <div class="mb-4">
            <h6>Top 5 Libros (Año Actual)</h6>
            <ul>
              <li v-for="(libro, idx) in top5LibrosAnioActual" :key="idx">
                {{ libro.nombre }} - {{ libro.contador_lecturas }} lecturas
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import axios from 'axios';
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import { apiClient } from '../config';

export default {
  name: 'EstadisticasComponent',
  components: { NavBar, Footer },
  data() {
    return {
      darkMode: false,
      user: null,

      // Datos del mes => /api/estadisticas/:correo
      totalLibrosLeidosMes: 0,

      // Datos generales => /api/estadisticas/generales/:correo
      librosEnProgreso: 0,
      librosTotales: 0,
      tematicasMasLeidas: [],
      librosMasValorados: [],

      // Libros recomendados
      librosRecomendados: [],
      placeholder: 'https://via.placeholder.com/300x400?text=Sin+Portada',

      // Estadísticas globales
      top3UsuariosMes: [],
      top3UsuariosAnio: [],
      top5LibrosMesActual: [],
      top5LibrosAnioActual: [],

      // Carrusel
      currentIndex: 0,
      visibleCount: 3 
    };
  },
  computed: {
    themeClass() {
      return this.darkMode ? 'foro-dark' : 'foro-light';
    },
    visibleBooks() {
      const start = this.currentIndex;
      const end = this.currentIndex + this.visibleCount;
      if (end <= this.librosRecomendados.length) {
        return this.librosRecomendados.slice(start, end);
      } else {
        // Cuando el carroussel termina, vuelve al inicio: 
        const remainder = end - this.librosRecomendados.length;
        return [
          ...this.librosRecomendados.slice(start),
          ...this.librosRecomendados.slice(0, remainder)
        ];
      }
    }
  },
  async mounted() {
    try {
      const response = await apiClient.get("/user");
      this.user = response.data;

      await this.cargarEstadisticasMes();
      await this.cargarEstadisticasGenerales();
      await this.cargarLibrosRecomendados();
      await this.cargarTop3UsuariosMes();
      await this.cargarTop3UsuariosAnio();
      await this.cargarTop5LibrosMesActual();
      await this.cargarTop5LibrosAnioActual();

      this.applyTheme();
    } catch (error) {
      console.error("Error al obtener el usuario o estadísticas:", error);
      this.$router.push("/");
    }

    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("darkMode", this.darkMode);
      this.applyTheme();
    },
    applyTheme() {
      document.body.classList.toggle("dark-mode", this.darkMode);
      document.body.classList.toggle("light-mode", !this.darkMode);
    },
    truncarTexto(texto, maxLength) {
      if (!texto) return '';
      if (texto.length <= maxLength) return texto;
      return texto.substring(0, maxLength) + '...';
    },
    nextSlide() {
      const total = this.librosRecomendados.length;
      this.currentIndex = (this.currentIndex + this.visibleCount) % total;
    },
    prevSlide() {
      const total = this.librosRecomendados.length;
      this.currentIndex = (this.currentIndex - this.visibleCount + total) % total;
    },
    handleResize() {
      const width = window.innerWidth;
      if (width <= 600) {
        this.visibleCount = 1;
      } else if (width <= 1200) {
        this.visibleCount = 2;
      } else {
        this.visibleCount = 3;
      }
    },

    // /api/estadisticas/:correo
    async cargarEstadisticasMes() {
      if (!this.user) return;
      try {
        const resp = await axios.get(`http://localhost:3000/api/estadisticas/${this.user.correo}`);
        this.rawEstadisticasMes = resp.data;
        this.totalLibrosLeidosMes = parseInt(resp.data.totalLibrosLeidos || 0, 10);
      } catch (error) {
        console.error('Error al cargar estadísticas del mes:', error);
      }
    },

    // /api/estadisticas/generales/:correo
    async cargarEstadisticasGenerales() {
      if (!this.user) return;
      try {
        const resp = await axios.get(`http://localhost:3000/api/estadisticas/generales/${this.user.correo}`);
        this.rawEstadisticasGenerales = resp.data;

        this.librosEnProgreso = parseInt(resp.data.librosEnProgreso || 0, 10);
        this.librosTotales = parseInt(resp.data.totalLibrosLeidos || 0, 10);
        this.tematicasMasLeidas = resp.data.tematicasMasLeidas || [];

        this.librosMasValorados = resp.data.librosMasValorados || [];
      } catch (error) {
        console.error('Error al cargar estadísticas generales:', error);
      }
    },

    // /api/estadisticas/librosrecomendados/:correo
    async cargarLibrosRecomendados() {
      if (!this.user) return;
      try {
        const resp = await axios.get(`http://localhost:3000/api/estadisticas/librosrecomendados/${this.user.correo}`);
        this.librosRecomendados = resp.data || [];
      } catch (error) {
        console.error('Error al cargar libros recomendados:', error);
      }
    },

    // Estadísticas globales
    async cargarTop3UsuariosMes() {
      try {
        const resp = await axios.get('http://localhost:3000/api/estadisticas/top3');
        this.top3UsuariosMes = resp.data;
      } catch (error) {
        console.error('Error al cargar top3 usuarios del mes:', error);
      }
    },
    async cargarTop3UsuariosAnio() {
      try {
        const resp = await axios.get('http://localhost:3000/api/estadisticas/top3anuales');
        this.top3UsuariosAnio = resp.data;
      } catch (error) {
        console.error('Error al cargar top3 usuarios del año:', error);
      }
    },
    async cargarTop5LibrosMesActual() {
      try {
        const fecha = new Date();
        const year = fecha.getFullYear();
        const month = fecha.getMonth() + 1;
        const resp = await axios.get(`http://localhost:3000/api/estadisticas/top5libros/${month}/${year}`);
        this.top5LibrosMesActual = resp.data;
      } catch (error) {
        console.error('Error al cargar top5 libros mes actual:', error);
      }
    },
    async cargarTop5LibrosAnioActual() {
      try {
        const year = new Date().getFullYear();
        const resp = await axios.get(`http://localhost:3000/api/estadisticas/top5libros/${year}`);
        this.top5LibrosAnioActual = resp.data;
      } catch (error) {
        console.error('Error al cargar top5 libros año actual:', error);
      }
    },

    goToDetalles(libro) {
      this.$router.push({ name: 'Detalles', params: { id: libro.nombre } });
    }
  }
};
</script>

<style scoped>

.container-fluid {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* Botón modo oscuro/claro */
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


.foro-light {
  background-color: #ead5a1; 
  color: #343434;
}
.foro-dark {
  background-color: #343434;
  color: #e5c578;
}

/* TÍTULO PRINCIPAL "ESTADÍSTICAS" */
.stats-main-title {
  font-size: 2rem;       
  font-weight: 800;      
  color: #b35900;        
  text-transform: uppercase; 
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
}

/* Círculos de estadísticas */
.stats-circles {
  margin-bottom: 1rem;
}
.stat-circle {
  width: 100px;   
  height: 100px;
  border-radius: 50%;
  margin: 0 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 4px solid #ccc;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}
.circle-light {
  border-color: #c7c7c7;
  background-color: #fff;
}
.circle-dark {
  border-color: #999;
  background-color: #2f2f2f;
}
.circle-text {
  font-size: 1.4rem;
  font-weight: bold;
}
.circle-label {
  font-size: 0.85rem;
  margin-top: 2px;
  color: inherit;
}



/* Bloque de temáticas */
.tematicas-block {
  border-radius: 8px;
  max-width: 220px;
  margin-bottom: 1.5rem;
  text-align: center; 
}
.tematicas-block-light {
  background-color: #f6e5bb; 
  color: #343434;
}
.tematicas-block-dark {
  background-color: #444; 
  color: #e5c578;
}
.tematicas-title {
  font-weight: bold;
  font-size: 1rem;
}



/* Carroussel */
.carousel-container {
  gap: 0;
}

.book-list {
  gap: 0;
  flex-nowrap: nowrap;
}

.book-item {
  cursor: pointer;
  margin-right: 0.3rem; 
}

.recommended-book-image {
  object-fit: contain;
  border-radius: 5px;
  background: none;
  margin: 0;
  width: 110px; 
  height: auto;
}

@media (max-width: 600px) {
  .recommended-book-image {
    width: 120px; 
  }
}

/* flechas del carroussel */
.arrow-btn {
  background-color: #e5c578; 
  border: none;
  border-radius: 50%;
  width: 45px; 
  height: 45px; 
  color: #343434;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px; 
  transition: transform 0.2s ease;
  padding: 0;
  margin: 0;
}
.arrow-btn:hover {
  transform: scale(1.1);
}
.arrow-icon {
  font-weight: bold;
}

/* Bloque Libros que más te han gustado */
.liked-books-container {
  gap: 1rem; 
  margin: 0;
  padding: 0;
  justify-content: center;
}
.liked-book-item {
  margin: 0 !important;
  padding: 0 !important;
  cursor: pointer;
}

.small-book-image {
  display: block;
  margin: 0;
  width: 120px; 
  height: auto;
  object-fit: contain;
  border-radius: 5px;
  background: none !important;
}

.border-end {
  border-right: 3px solid #555 !important;
}

/* Mensajes "error" */
.no-data-message {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
.no-data-content {
  background-color: rgba(229, 197, 120, 0.1); 
  border: 1px solid #e5c578; 
  border-radius: 8px;
  padding: 1rem 1.5rem;
  max-width: 350px;
  text-align: center;
  color: inherit;
}
.no-data-content .icono {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: block;
  color: #e5c578; 
}
.no-data-content p {
  margin: 0;
  font-size: 0.95rem;
}
</style>

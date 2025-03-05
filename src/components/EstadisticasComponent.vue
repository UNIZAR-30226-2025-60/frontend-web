<template>
  <div v-if="user" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <NavBar :dark-mode="darkMode"></NavBar>

    <div class="container py-4">
      <!-- Botón de cambio de tema -->
      <button @click="toggleDarkMode" class="theme-toggle-btn mb-3">
        {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
      </button>

      <h4 class="mb-4 text-center">Estadísticas</h4>

      <div class="row">
        <!-- COLUMNA "MIS ESTADÍSTICAS" -->
        <div class="col-md-6 mb-4 border-end pe-4">
          <h5 class="mb-4 text-center">Mis Estadísticas</h5>

          <!-- Bloque con 3 círculos -> libros en progreso, leídos mes, leídos total -->
          <div class="stats-circles d-flex justify-content-around align-items-center mb-4">
            <!-- Círculo en progreso -->
            <div class="stat-circle shadow" :class="darkMode ? 'circle-dark' : 'circle-light'">
              <div class="circle-text">{{ librosEnProgreso }}</div>
              <div class="circle-label">En progreso</div>
            </div>

            <!-- Círculo leídos este mes -->
            <div class="stat-circle shadow" :class="darkMode ? 'circle-dark' : 'circle-light'">
              <div class="circle-text">{{ totalLibrosLeidosMes }}</div>
              <div class="circle-label">Leídos mes</div>
            </div>

            <!-- Círculo leídos en total -->
            <div class="stat-circle shadow" :class="darkMode ? 'circle-dark' : 'circle-light'">
              <div class="circle-text">{{ librosTotales }}</div>
              <div class="circle-label">Leídos total</div>
            </div>
          </div>

          <!-- Bloque de temáticas más leídas -->
          <div
            class="p-3 tematicas-block mx-auto"
            :class="darkMode ? 'tematicas-block-dark' : 'tematicas-block-light'"
          >
            <h6 class="tematicas-title mb-2">Temáticas más leídas:</h6>
            <ul class="list-unstyled mt-2">
              <li v-for="(tema, idx) in tematicasMasLeidas" :key="idx" class="tema-item">
                {{ tema.tematica }} 
              </li>
            </ul>
          </div>

          <!-- Bloque de Libros Recomendados -->
          <div class="mt-4">
            <h5>Libros recomendados:</h5>
            <div class="carousel-container d-flex align-items-center">
              <!-- Flecha izquierda -->
              <button class="btn btn-outline-secondary me-3" @click="prevSlide">‹</button>
              
              <!-- Contenedor para mostrar 3 libros -->
              <div class="row" style="flex: 1;">
                <div class="col-4 d-flex justify-content-center mb-4" v-for="(libro, index) in visibleBooks" :key="index">
                  <div class="card recommended-card shadow-sm" @click="goToDetalles(libro)">
                    <img :src="libro.portada || libro.imagen_portada || placeholder" class="book-image" alt="Portada"/>
                  </div>
                </div>
              </div>
              
              <!-- Flecha derecha -->
              <button class="btn btn-outline-secondary ms-3" @click="nextSlide">›</button>
            </div>
          </div>
        </div>

        <!-- COLUMNA "ESTADÍSTICAS GENERALES" -->
        <div class="col-md-6">
          <h5 class="mb-4">Estadísticas Generales</h5>
          <div class="mb-4">
            <h6>Top 3 Usuarios (Mes)</h6>
            <ul>
              <!-- Si hay menos de 3 usuarios que hayan leído algo solo aparecerán los que hayan leído algo -->
              <li v-for="(usuario, i) in top3UsuariosMes" :key="i">
                {{ usuario.usuario_id }} - {{ usuario.libros_leidos}} libros leídos
              </li>
            </ul>
          </div>

          <div class="mb-4">
            <h6>Top 3 Usuarios (Año)</h6>
            <ul>
              <li v-for="(usuario, i) in top3UsuariosAnio" :key="i">
                {{ usuario.usuario_id }} - {{ usuario.libros_leidos }} libros leídos
              </li>
            </ul>
          </div>

          <div class="mb-4">
            <h6>Top 5 Libros (Mes Actual)</h6>
            <ul>
              <li v-for="(libro, idx) in top5LibrosMesActual" :key="idx">
                {{ libro.nombre }} - {{ libro.veces_leido }} lecturas
              </li>
            </ul>
          </div>

          <div class="mb-4">
            <h6>Top 5 Libros (Año Actual)</h6>
            <ul>
              <li v-for="(libro, idx) in top5LibrosAnioActual" :key="idx">
                {{ libro.nombre }} - {{ libro.veces_leido }} lecturas
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <Footer></Footer>
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
      user: null,

      // Datos del mes => /api/estadisticas/:correo
      totalLibrosLeidosMes: 0,

      // Datos generales => /api/estadisticas/generales/:correo
      librosEnProgreso: 0,
      librosTotales: 0,
      tematicasMasLeidas: [],

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
      visibleCount: 3,

      darkMode: localStorage.getItem("darkMode") === "true" // Obtener el tema guardado
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
  },
  methods: {
    // Métodos para el tema oscuro/claro
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
      this.currentIndex = (this.currentIndex + 3) % total;
    },
    prevSlide() {
      const total = this.librosRecomendados.length;
      this.currentIndex = (this.currentIndex - 3 + total) % total;
    },

    // /api/estadisticas/:correo
    async cargarEstadisticasMes() {
      if (!this.user) return;
      try {
        const resp = await apiClient.get(`/estadisticas/${this.user.correo}`);
        console.log("Estadísticas mes:", resp.data);
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
        const response = await apiClient.get(`/estadisticas/generales/${this.user.correo}`);
        console.log("Estadísticas generales:", response.data);
        this.rawEstadisticasGenerales = response.data;

        this.librosEnProgreso = parseInt(response.data.librosEnProgreso || 0, 10);
        this.librosTotales = parseInt(response.data.totalLibrosLeidos || 0, 10);
        this.tematicasMasLeidas = response.data.tematicasMasLeidas || [];
      } catch (error) {
        console.error('Error al cargar estadísticas generales:', error);
      }
    },

    // /api/estadisticas/librosrecomendados/:correo
    async cargarLibrosRecomendados() {
      if (!this.user) return;
      try {
        const response = await apiClient.get(`/estadisticas/librosrecomendados/${this.user.correo}`);
        this.librosRecomendados = response.data || [];
      } catch (error) {
        console.error('Error al cargar libros recomendados:', error);
      }
    },

    // Estadísticas globales
    async cargarTop3UsuariosMes() {
      try {
        const response = await apiClient.get('/estadisticas/top3');
        this.top3UsuariosMes = response.data;

        console.log("Estos son los 3 usuarios que más han leído en el mes", this.top3UsuariosMes);
      } catch (error) {
        console.error('Error al cargar top3 usuarios del mes:', error);
      }
    },
    async cargarTop3UsuariosAnio() {
      try {
        const response = await apiClient.get('/estadisticas/top3anuales');
        this.top3UsuariosAnio = response.data;

        console.log("Estos son los 3 usuarios que más han leído en el año", this.top3UsuariosAnio);
      } catch (error) {
        console.error('Error al cargar top3 usuarios del año:', error);
      }
    },
    async cargarTop5LibrosMesActual() {
      try {
        const fecha = new Date();
        const year = fecha.getFullYear();
        const month = fecha.getMonth() + 1;

        const response = await apiClient.get(`/estadisticas/top5libros/${month}/${year}`);
        this.top5LibrosMesActual = response.data;

        console.log("Libros que más se han leído en el mes actual", this.top5LibrosMesActual);
      } catch (error) {
        console.error('Error al cargar top5 libros mes actual:', error);
      }
    },
    async cargarTop5LibrosAnioActual() {
      try {
        const year = new Date().getFullYear();

        const response = await apiClient.get(`/estadisticas/top5libros/${year}`);
        this.top5LibrosAnioActual = response.data;

        console.log("Libros que más se han leído en el año actual", this.top5LibrosAnioActual);
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

.dark-mode .container {
  background-color: #343434;
  color: #ffffff;
}

/* Colores modo claro */
.light-mode {
  background-color: #ffffff;
  color: #000000;
}

.light-mode .container {
  background-color: #ead5a1;
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

.small-cover {
  height: 150px;
  object-fit: cover;
}

.carousel-container {
  overflow: hidden;
}

.border-end {
  border-right: 1px solid #ccc !important;
}

.tematicas-block {
  border-radius: 8px;
  max-width: 220px;
  margin-bottom: 1.5rem;
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

.book-image {
  width: 100%; 
  height: 100px; 
  object-fit: cover; 
  cursor: pointer;
  transition: transform 0.3s;
}

.book-image:hover {
  transform: scale(1.05);
}
</style>
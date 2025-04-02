<template>
  <div v-if="top3UsuariosAnio && top3UsuariosMes && top5LibrosAnioActual && top5LibrosMesActual" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <NavBar :dark-mode="darkMode"></NavBar>

    <div class="container pt-5 min-vh-100">
      <!-- Botón de cambio de tema -->
      <button @click="toggleDarkMode" class="theme-toggle-btn mb-3">
        {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
      </button>

      <!-- Título "Estadísticas" -->
      <h2 class="titulo">ESTADÍSTICAS</h2>

      <div class="row gap-4">
        <!-- COLUMNA "MIS ESTADÍSTICAS" -->
        <div class="col-md-6 mb-4 pe-4" style="border-right: 2px solid #000;">
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
              <h6 class="text-center">Libros recomendados:</h6>
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
            <h6 class="text-center">Libros que más te han gustado:</h6>
            <div class="d-flex flex-wrap liked-books-container justify-content-center">
              <div
                v-for="(libro, index) in librosMasValorados" :key="index" class="liked-book-item" @click="goToDetalles(libro)">
                <img :src="libro.imagen_portada || libro.portada || placeholder" class="small-book-image" alt="Portada"/>
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
            <h6>Top 3 Usuarios del Mes</h6>

            <!-- Recuadro para cada usuario con su puesto -->
            <div v-for="(usuario, i) in top3UsuariosMes" :key="i" 
                :class="{
                  'card mb-2': true,
                  'bg-gold': i === 0,  /* Primer puesto (dorado) */
                  'bg-silver': i === 1, /* Segundo puesto (plateado) */
                  'bg-bronce': i === 2, /* Tercer puesto (bronce) */
                }">
              <div class="card-body">
                <font-awesome-icon :icon="['fas', 'trophy']" 
                      :class="{
                        'text-warning': i === 0, /* Dorado */
                        'text-secondary': i === 1, /* Plateado */
                        'text-muted': i === 2, /* Bronce */
                        'trophy-border': true 
                      }" />

                <span class="position-relative ms-2">
                  <span v-if="i === 0">1º Lugar: </span>
                  <span v-if="i === 1">2º Lugar: </span>
                  <span v-if="i === 2">3º Lugar: </span>
                </span>
                {{ usuario.usuario_id }} - Libros leídos: {{ usuario.libros_leidos }}
              </div>
            </div>
          </div>

          <div class="mb-4">
            <h6>Top 3 Usuarios del Año</h6>

            <!-- Cada recuadro individual para los usuarios -->
            <div v-for="(usuario, i) in top3UsuariosAnio" :key="i" class="card mb-1">
              <div class="card-body">
                {{ usuario.usuario_id }} - Libros leídos: {{ usuario.libros_leidos }}
              </div>
            </div>
          </div>

          <div class="d-flex align-items-center justify-content-center"> 
            <h6 class="mb-0">Libros más populares de</h6> 

            <!-- Selector para el mes -->
            <select v-model="selectedMonth" @change="actualizarDatos" class="form-select mx-2" style="width: auto"> 
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>

            <h6 class="mb-0 mx-2">de</h6> 
            
            <!-- Selector para el año -->
            <select v-model="selectedYear" @change="actualizarDatos" class="form-select mx-2" style="width: auto"> <!-- Ancho automático -->
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>

          <!-- Mostrar los libros más populares según la selección -->
          <div v-if="top5Libros && top5Libros.length" class="mt-3"> 
            <ul class="list-unstyled"> 
              <div class="d-flex flex-wrap liked-books-container justify-content-center">
                <div
                  v-for="(libro, index) in top5Libros" :key="libro.id" class="liked-book-item" @click="goToDetalles(libro)">
                  <img :src="libro.imagen_portada || libro.portada || placeholder" class="small-book-image" alt="Portada"/>
                </div>
              </div>
            </ul>
          </div>
          <div v-else class="mt-3 text-center no-data-message">
            <div class="no-data-content">
              <i class="fas fa-book icono"></i>
              <p class="mb-0">
                <strong>¡Info!</strong> 
                No hay libros registrados para este período.
              </p>
            </div>
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
      librosMasValorados: [],

      // Libros recomendados
      librosRecomendados: [],
      placeholder: 'https://via.placeholder.com/300x400?text=Sin+Portada',

      // Estadísticas globales
      top3UsuariosMes: [],
      top3UsuariosAnio: [],
      top5LibrosMesActual: [],
      top5LibrosAnioActual: [],
      selectedMonth: new Date().getMonth() + 1,  // Mes actual por defecto
      selectedYear: new Date().getFullYear(),    // Año actual por defecto
      years: [],  // Se generará en created()
      top5Libros: [],
      selectedMonthName: '',  // Nombre del mes seleccionado para mostrarlo en el título

      // Carrusel
      currentIndex: 0,
      visibleCount: 3,
    
      darkMode: localStorage.getItem("darkMode") === "true" // Obtener el tema guardado
    };
  },
  created() {
    // Generar el rango de años desde 2020 hasta el año actual
    const currentYear = new Date().getFullYear();
    this.years = this.generateYearRange(2020, currentYear);
    // Inicializar el nombre del mes seleccionado
    this.selectedMonthName = this.getMonthName(this.selectedMonth);
  },
  computed: {
    themeClass() {
      return this.darkMode ? 'foro-dark' : 'foro-light';
    },
    visibleBooks() {
      if (!this.librosRecomendados || this.librosRecomendados.length === 0) {
        return [];
      }
      
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
      // Cargar datos del usuario actual
      const response = await apiClient.get("/user");
      this.user = response.data;

      // Cargar datos estadísticos
      await this.cargarEstadisticasMes();
      await this.cargarEstadisticasGenerales();
      await this.cargarLibrosRecomendados();

      // Cargar rankings
      await this.cargarTop3UsuariosMes();
      await this.cargarTop3UsuariosAnio();
      await this.cargarTop5LibrosMesActual();
      await this.cargarTop5LibrosAnioActual();

      // Aplicar tema
      this.applyTheme();
      
      // Cargar los datos de libros más populares inicialmente
      await this.cargarTop5Libros(this.selectedMonth, this.selectedYear);
    } catch (error) {
      console.error("Error al obtener el usuario o estadísticas:", error);
      // Solo redirigir si hay un error de autenticación
      if (error.response && error.response.status === 401) {
        this.$router.push("/");
      }
    }

    // Evento de redimensionamiento para el carrusel
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
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
      if (!this.librosRecomendados || this.librosRecomendados.length === 0) return;
      const total = this.librosRecomendados.length;
      this.currentIndex = (this.currentIndex + 1) % total;
    },
    prevSlide() {
      if (!this.librosRecomendados || this.librosRecomendados.length === 0) return;
      const total = this.librosRecomendados.length;
      this.currentIndex = (this.currentIndex - 1 + total) % total;
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
        const resp = await apiClient.get(`/estadisticas/generales/${this.user.correo}`);
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
      } catch (error) {
        console.error('Error al cargar top3 usuarios del mes:', error);
        this.top3UsuariosMes = [];
      }
    },
    
    async cargarTop3UsuariosAnio() {
      try {
        const response = await apiClient.get('/estadisticas/top3anuales');
        this.top3UsuariosAnio = response.data;
      } catch (error) {
        console.error('Error al cargar top3 usuarios del año:', error);
        this.top3UsuariosAnio = [];
      }
    },
    
    async cargarTop5LibrosMesActual() {
      try {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const response = await apiClient.get(`/estadisticas/top5libros/${month}/${year}`);
        this.top5LibrosMesActual = response.data;
      } catch (error) {
        console.error('Error al cargar top5 libros del mes actual:', error);
        this.top5LibrosMesActual = [];
      }
    },
    
    async cargarTop5LibrosAnioActual() {
      try {
        const year = new Date().getFullYear();
        const response = await apiClient.get(`/estadisticas/top5librosanuales/${year}`);
        this.top5LibrosAnioActual = response.data;
      } catch (error) {
        console.error('Error al cargar top5 libros del año actual:', error);
        this.top5LibrosAnioActual = [];
      }
    },
    
    async cargarTop5Libros(month, year) {
      try {
        this.top5Libros = []; // Limpiar datos anteriores
        const response = await apiClient.get(`/estadisticas/top5libros/${month}/${year}`);
        this.top5Libros = response.data || [];
      } catch (error) {
        console.error(`Error al cargar libros más populares de ${month}/${year}:`, error);
        this.top5Libros = [];
      }
    },
    
    goToDetalles(libro) {
      if (libro && libro.nombre) {
        this.$router.push({ name: 'Detalles', params: { id: libro.nombre } });
      }
    },
    
    // Función para generar un rango de años
    generateYearRange(start, end) {
      const years = [];
      for (let year = start; year <= end; year++) {
        years.push(year);
      }
      return years;
    },
    
    // Esta función se llama cuando el usuario cambia el mes o el año
    async actualizarDatos() {
      this.selectedMonthName = this.getMonthName(this.selectedMonth);
      try {
        await this.cargarTop5Libros(this.selectedMonth, this.selectedYear);
      } catch (error) {
        console.error('Error al actualizar datos:', error);
      }
    },
    
    // Función para obtener el nombre del mes basado en el valor numérico
    getMonthName(month) {
      const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      return months[month - 1] || "";
    }
  }
};
</script>

<style scoped>
.container-fluid {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

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

/* TÍTULO PRINCIPAL "ESTADÍSTICAS" */
.stats-main-title {
  font-size: 2rem;       
  font-weight: 800;      
  color: #b35900;        
  text-transform: uppercase; 
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
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

.light-mode .titulo {
  text-align: center;        
  font-weight: bold;         
  font-size: 2rem;         
  color: #343434;            
  margin: 30px 0;     
}

.dark-mode .titulo {
  text-align: center;      
  font-weight: bold;        
  font-size: 2rem;        
  color: #e3c377;        
  margin: 30px 0;         
}

/* Estilo para los selectores */
.form-select {
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.375rem 2.25rem 0.375rem 0.75rem;
  font-size: 0.9rem;
}

.dark-mode .form-select {
  background-color: #444;
  color: #e5c578;
  border-color: #666;
}

.border-end {
  border-right: none !important;
  border-bottom: 2px solid #555 !important;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
}
  
.stats-circles {
  flex-wrap: wrap;
}
  
.stat-circle {
  margin-bottom: 1rem;
}

.bg-gold {
  background-color: #dbc70d; 
}

.bg-silver {
  background-color: #bab8b8; 
}

.bg-bronce {
  background-color: #e1974e;
}

.trophy-border {
  stroke: black;  /* Define el borde del ícono */
  stroke-width: 3px;  /* Grosor del borde */
  fill: none;  /* Solo rellena el contorno*/
}
</style>
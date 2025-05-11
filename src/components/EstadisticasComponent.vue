<template>
  <!-- Contenedor principal con cambio de modo claro/oscuro -->
  <div v-if="!loading" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <!-- Componente de barra de navegación -->
    <NavBar :dark-mode="darkMode"  :user="user"></NavBar>

    <div class="container-fluid">
      <div class="libros-header">
        <!-- Título "Estadísticas" -->
        <h2 class="titulo">ESTADÍSTICAS</h2>

        <!-- Switch para cambiar entre modo claro y oscuro -->
        <div class="theme-switch-wrapper">
          <div class="theme-switch" @click="toggleDarkMode">
            <div class="switch-track" :class="{ 'dark': darkMode }">
              <div class="switch-thumb" :class="{ 'dark': darkMode }">
                <!-- Icono de sol para modo claro -->
                <font-awesome-icon v-if="!darkMode" :icon="['fas', 'sun']" class="icon sun-icon"/>
                <!-- Icono de luna para modo oscuro -->
                <font-awesome-icon v-else :icon="['fas', 'moon']" class="icon moon-icon"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row gap-4">
        <!-- COLUMNA "MIS ESTADÍSTICAS" - Muestra estadísticas personales del usuario -->
        <div class="col-md-6 mb-4 pe-4" style="border-right: 2px solid #4C4637;">
          <h4 class="mb-4 text-center">Mis Estadísticas</h4>

          <!-- Tres círculos con métricas clave: libros en progreso, leídos en el mes y total -->
          <div class="stats-circles d-flex justify-content-around align-items-center mb-4">
            <div class="stat-circle shadow" :class="darkMode ? 'circle-dark' : 'circle-light'">
              <div class="circle-text">{{ librosEnProgreso }}</div>
              <div class="circle-label">En proceso</div>
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

          <!-- Sección condicional que se muestra solo si el usuario ha leído libros -->
          <div v-if="librosTotales > 0">
            <!-- Temáticas más leídas por el usuario -->
            <div class="p-3 tematicas-block mx-auto" :class="darkMode ? 'tematicas-block-dark' : 'tematicas-block-light'">
              <h6 class="tematicas-title mb-2">Temáticas más leídas:</h6>
              <ul class="list-unstyled mt-2">
                <li v-for="(tema, idx) in tematicasMasLeidas" :key="idx" class="tema-item">
                  {{ tema.tematica }}
                </li>
              </ul>
            </div>

            <!-- Carrusel de libros recomendados basados en las preferencias del usuario -->
            <div class="mt-4">
              <h6 class="text-center">Libros recomendados:</h6>
              <div class="d-flex justify-content-center">
                <div class="carousel-container d-flex align-items-center">
                  <!-- Flecha navegación izquierda -->
                  <button class="arrow-btn me-1" @click="prevSlide">
                    <span class="arrow-icon">‹</span>
                  </button>
                  
                  <!-- Lista de libros visible en el carrusel -->
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

                  <!-- Flecha navegación derecha -->
                  <button class="arrow-btn ms-1" @click="nextSlide">
                    <span class="arrow-icon">›</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mensaje que se muestra cuando el usuario no ha leído libros -->
          <div v-else class="mt-4 text-center no-data-message">
            <div class="no-data-content">
              <i class="fas fa-info-circle icono"></i>
              <p class="mb-0">
                <strong>¡Ups!</strong> 
                No hay suficiente información para mostrar las temáticas más leídas o recomendar otros libros.
              </p>
            </div>
          </div>

          <!-- Sección condicional que muestra los libros mejor valorados por el usuario -->
          <div class="mt-4" v-if="librosMasValorados && librosMasValorados.length">
            <h6 class="text-center">Libros que más te han gustado:</h6>
            <div class="d-flex flex-wrap liked-books-container justify-content-center">
              <div
                v-for="(libro, index) in librosMasValorados" :key="index" class="liked-book-item" @click="goToDetalles(libro)">
                <img :src="libro.imagen_portada || libro.portada || placeholder" class="small-book-image" alt="Portada"/>
              </div>
            </div>
          </div>

          <!-- Mensaje que se muestra cuando el usuario no ha valorado ningún libro -->
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

        <!-- COLUMNA "ESTADÍSTICAS GENERALES" - Muestra datos globales de la plataforma -->
        <div class="col-md-5 text-center">
          <h4 class="mb-4">Estadísticas Generales</h4>
          
          <!-- Podio con los 3 usuarios que más han leído en el mes actual -->
          <div class="mb-4">
            <h6>Top 3 Usuarios del Mes</h6>
            <div class="podium-container">
              <div class="podium">
                <!-- Usuario en segundo lugar -->
                <div class="podium-item second">
                  <div class="podium-nombre">{{ nombrePodioSegundo }} </div>
                  <img
                    v-if="top3UsuariosMes[1]?.foto_perfil"
                    :src="fotoPodioSegundo"
                    class="podium-img"
                  />
                  <!-- Placeholder cuando no hay foto de perfil -->
                  <img
                    v-else
                    :src="placeholder"
                    class="podium-img"
                  />
                  <div class="podium-bar" :style="{ backgroundColor: getPodiumColor(2) }">2</div>
                  <div class="podium-libros">{{ top3UsuariosMes[1]?.libros_leidos }} libros</div>
                </div>
                
                <!-- Usuario en primer lugar (posición central y más alta) -->
                <div class="podium-item first">
                  <div class="podium-nombre">{{ nombrePodioPrimero }}</div>
                  <img
                    v-if="top3UsuariosMes[0]?.foto_perfil"
                    :src="fotoPodioPrimero"
                    class="podium-img"
                  />
                  <!-- Placeholder cuando no hay foto de perfil -->
                  <img
                    v-else
                    :src="placeholder"
                    class="podium-img"
                  />
                  <div class="podium-bar" :style="{ backgroundColor: getPodiumColor(1) }">1</div>
                  <div class="podium-libros">{{ top3UsuariosMes[0]?.libros_leidos }} libros</div>
                </div>
                
                <!-- Usuario en tercer lugar -->
                <div class="podium-item third">
                  <div class="podium-nombre">{{ nombrePodioTercero }}</div>
                  <img
                    v-if="top3UsuariosMes[2]?.foto_perfil"
                    :src="fotoPodioTercero"
                    class="podium-img"
                  />
                  <!-- Placeholder cuando no hay foto de perfil -->
                  <img
                    v-else
                    :src="placeholder"
                    class="podium-img"
                  />
                  <div class="podium-bar" :style="{ backgroundColor: getPodiumColor(3) }">3</div>
                  <div class="podium-libros">{{ top3UsuariosMes[2]?.libros_leidos }} libros</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Podio con los 3 usuarios que más han leído en el año actual -->
          <div class="mb-4">
            <h6>Top 3 Usuarios del Año</h6>
            <div class="podium-container">
              <div class="podium">
                <!-- Misma estructura que el podio anterior pero con datos anuales -->
                <div class="podium-item second">
                  <div class="podium-nombre">{{ nombrePodioSegundoAnio }} </div>
                  <img
                    v-if="top3UsuariosAnio[1]?.foto_perfil"
                    :src="fotoPodioSegundoAnio"
                    class="podium-img"
                  />
                  <!-- Placeholder cuando no hay foto de perfil -->
                  <img
                    v-else
                    :src="placeholder"
                    class="podium-img"
                  />
                  <div class="podium-bar" :style="{ backgroundColor: getPodiumColor(2) }">2</div>
                  <div class="podium-libros">{{ top3UsuariosAnio[1]?.libros_leidos }} libros</div>
                </div>
                <div class="podium-item first">
                  <div class="podium-nombre">{{ nombrePodioPrimeroAnio }}</div>
                  <img
                    v-if="top3UsuariosAnio[0]?.foto_perfil"
                    :src="fotoPodioPrimeroAnio"
                    class="podium-img"
                  />
                  <!-- Placeholder cuando no hay foto de perfil -->
                  <img
                    v-else
                    :src="placeholder"
                    class="podium-img"
                  />
                  <div class="podium-bar" :style="{ backgroundColor: getPodiumColor(1) }">1</div>
                  <div class="podium-libros">{{ top3UsuariosAnio[0]?.libros_leidos }} libros</div>
                </div>
                <div class="podium-item third">
                  <div class="podium-nombre">{{ nombrePodioTerceroAnio }}</div>
                  <img
                    v-if="top3UsuariosAnio[2]?.foto_perfil"
                    :src="fotoPodioTerceroAnio"
                    class="podium-img"
                  />
                  <!-- Placeholder cuando no hay foto de perfil -->
                  <img
                    v-else
                    :src="placeholder"
                    class="podium-img"
                  />
                  <div class="podium-bar" :style="{ backgroundColor: getPodiumColor(3) }">3</div>
                  <div class="podium-libros">{{ top3UsuariosAnio[2]?.libros_leidos }} libros</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Selector de mes y año para filtrar los libros más populares -->
          <div class="d-flex align-items-center justify-content-center"> 
            <h6 class="mb-0">Libros más populares de</h6> 

            <!-- Selector de mes -->
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
            
            <!-- Selector de año -->
            <select v-model="selectedYear" @change="actualizarDatos" class="form-select mx-2" style="width: auto">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>

          <!-- Muestra los libros más populares del período seleccionado -->
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
          
          <!-- Mensaje que se muestra cuando no hay libros para el período seleccionado -->
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

    <!-- Componente de pie de página -->
    <Footer></Footer>
  </div>
  
  <!-- Muestra el componente de carga mientras se obtienen los datos -->
  <div v-else>
    <Cargando :dark-mode="darkMode"></Cargando>
  </div>
</template>

<script>
import axios from 'axios';
import NavBar from '@/components/NavBar.vue';
import Cargando from '@/components/Cargando.vue';
import Footer from '@/components/Footer.vue';
import { apiClient } from '../config';

export default {
  name: 'EstadisticasComponent',
  components: { NavBar, Footer, Cargando },
  data() {
    return {
      user: null, // Información del usuario autenticado

      // Estadísticas del mes actual
      totalLibrosLeidosMes: 0,

      // Estadísticas generales del usuario
      librosEnProgreso: 0,
      librosTotales: 0,
      tematicasMasLeidas: [],
      librosMasValorados: [],

      // Libros recomendados personalizados
      librosRecomendados: [],
      placeholder: 'https://via.placeholder.com/300x400?text=Sin+Portada', // Imagen de placeholder

      // Rankings globales
      top3UsuariosMes: [],
      top3UsuariosAnio: [],
      top5LibrosMesActual: [],
      top5LibrosAnioActual: [],
      selectedMonth: new Date().getMonth() + 1,  // Mes actual seleccionado
      selectedYear: new Date().getFullYear(),    // Año actual seleccionado
      years: [],  // Rango de años disponible para selección
      top5Libros: [],
      selectedMonthName: '',  // Nombre del mes seleccionado para mostrar

      // Carrusel de libros recomendados
      currentIndex: 0, // Índice actual del carrusel
      visibleCount: 3, // Cantidad de libros visibles en el carrusel
      loading: true, // Estado de carga de la página

      // Tema oscuro o claro
      darkMode: localStorage.getItem("darkMode") === "true"
    };
  },
  created() {
    // Inicializa el rango de años y el nombre del mes al cargar el componente
    const currentYear = new Date().getFullYear();
    this.years = this.generateYearRange(2020, currentYear);
    this.selectedMonthName = this.getMonthName(this.selectedMonth);
  },
  computed: {
    // Devuelve la clase de tema actual (oscuro o claro)
    themeClass() {
      return this.darkMode ? 'foro-dark' : 'foro-light';
    },
    // Devuelve los libros visibles en el carrusel de recomendados
    visibleBooks() {
      if (!this.librosRecomendados || this.librosRecomendados.length === 0) {
        return [];
      }
      const start = this.currentIndex;
      const end = this.currentIndex + this.visibleCount;
      if (end <= this.librosRecomendados.length) {
        return this.librosRecomendados.slice(start, end);
      } else {
        // Si llegamos al final, mostramos libros desde el inicio también
        const remainder = end - this.librosRecomendados.length;
        return [
          ...this.librosRecomendados.slice(start),
          ...this.librosRecomendados.slice(0, remainder)
        ];
      }
    },
    // Computadas para el podio mensual
    fotoPodioPrimero() { return this.getFotoUsuarioTransformada(0); },
    fotoPodioSegundo() { return this.getFotoUsuarioTransformada(1); },
    fotoPodioTercero() { return this.getFotoUsuarioTransformada(2); },
    nombrePodioPrimero() { return this.getNombre(0); },
    nombrePodioSegundo() { return this.getNombre(1); },
    nombrePodioTercero() { return this.getNombre(2); },

    // Computadas para el podio anual
    fotoPodioPrimeroAnio() { return this.getFotoUsuarioTransformadaAnio(0); },
    fotoPodioSegundoAnio() { return this.getFotoUsuarioTransformadaAnio(1); },
    fotoPodioTerceroAnio() { return this.getFotoUsuarioTransformadaAnio(2); },
    nombrePodioPrimeroAnio() { return this.getNombreAnio(0); },
    nombrePodioSegundoAnio() { return this.getNombreAnio(1); },
    nombrePodioTerceroAnio() { return this.getNombreAnio(2); }
  },
  async mounted() {
    // 1) Obtenemos al usuario, pero SIN redirigir si no está logueado
    try {
      const resp = await apiClient.get("/user");
      this.user = resp.data || null;
    } catch (err) {
      console.error("Error al cargar datos del usuario:", err);
      this.user = null;
    }

    // 2) Cargamos siempre las estadísticas generales de la plataforma
    try {
      await Promise.all([
        this.cargarTop3UsuariosMes(),
        this.cargarTop3UsuariosAnio(),
        this.cargarTop5Libros(this.selectedMonth, this.selectedYear),
      ]);
    } catch (err) {
      console.error("Error al cargar estadísticas generales:", err);
    }

    // 3) Si hay sesión, cargamos las estadísticas privadas
    if (this.user) {
      try {
        await Promise.all([
          this.cargarEstadisticasMes(),
          this.cargarEstadisticasGenerales(),
          this.cargarLibrosRecomendados(),
        ]);
      } catch (err) {
        console.error("Error al cargar estadísticas de usuario:", err);
        // aquí podrías decidir mostrar un mensaje, pero NO redirigir
      }
    }

    // 4) Aplicamos tema y desactivamos el loader
    this.applyTheme();
    this.loading = false;

    // 5) Ajuste de carrusel
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },

  beforeDestroy() {
    // Eliminar evento al destruir el componente
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    // Devuelve el color del podio según el lugar (1°, 2°, 3°)
    getPodiumColor(place) {
      switch (place) {
        case 1: return '#FFD700';
        case 2: return '#C0C0C0';
        case 3: return '#CD7F32';
        default: return '#999';
      }
    },
    // Transforma una URL de Google Drive a una URL de imagen
    transformarURLGoogleDrive(url) {
      if (!url || typeof url !== 'string') return this.placeholder;
      const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
      if (match) {
        const id = match[1];
        return `https://lh3.googleusercontent.com/d/${id}=w500`;
      }
      return this.placeholder;
    },
    // Devuelve la foto de un usuario del podio del mes
    getFotoUsuarioTransformada(index) {
      const user = this.top3UsuariosMes[index];
      return user?.foto_perfil ? this.transformarURLGoogleDrive(user.foto_perfil) : this.placeholder;
    },
    // Devuelve el nombre de un usuario del podio del mes
    getNombre(index){
      const user = this.top3UsuariosMes[index];
      return user?.nombre;
    },
    // Devuelve la foto de un usuario del podio anual
    getFotoUsuarioTransformadaAnio(index) {
      const user2 = this.top3UsuariosAnio[index];
      return user2?.foto_perfil ? this.transformarURLGoogleDrive(user2.foto_perfil) : this.placeholder;
    },
    // Devuelve el nombre de un usuario del podio anual
    getNombreAnio(index){
      const user2 = this.top3UsuariosAnio[index];
      return user2?.nombre;
    },
    // Cambia entre tema oscuro y claro
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("darkMode", this.darkMode);
      this.applyTheme();
    },
    // Aplica el tema visual actual
    applyTheme() {
      document.body.classList.toggle("dark-mode", this.darkMode);
      document.body.classList.toggle("light-mode", !this.darkMode);
    },
    // Corta un texto si es más largo que el máximo permitido
    truncarTexto(texto, maxLength) {
      if (!texto) return '';
      if (texto.length <= maxLength) return texto;
      return texto.substring(0, maxLength) + '...';
    },
    // Avanza el carrusel una posición
    nextSlide() {
      if (!this.librosRecomendados || this.librosRecomendados.length === 0) return;
      const total = this.librosRecomendados.length;
      this.currentIndex = (this.currentIndex + 1) % total;
    },
    // Retrocede el carrusel una posición
    prevSlide() {
      if (!this.librosRecomendados || this.librosRecomendados.length === 0) return;
      const total = this.librosRecomendados.length;
      this.currentIndex = (this.currentIndex - 1 + total) % total;
    },
    // Ajusta el número de libros visibles según el ancho de la ventana
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

    // Carga estadísticas del mes actual
    async cargarEstadisticasMes() {
      if (!this.user) return;
      try {
        const resp = await apiClient.get(`/estadisticas/${this.user.correo}`);
        this.totalLibrosLeidosMes = parseInt(resp.data.totalLibrosLeidos || 0, 10);
      } catch (error) {
        console.error('Error al cargar estadísticas del mes:', error);
      }
    },
    
    // Carga estadísticas generales del usuario
    async cargarEstadisticasGenerales() {
      if (!this.user) return;
      try {
        const resp = await apiClient.get(`/estadisticas/generales/${this.user.correo}`);

        const [enProcesoResponse, leidosResponse] = await Promise.all([
          apiClient.get(`/libros/enproceso/${this.user.correo}`),
          apiClient.get(`/libros/leidos/${this.user.correo}`)
        ]);

        const enProceso = enProcesoResponse.data;
        const leidos = leidosResponse.data;
        const idsLeidos = new Set(leidos.map(libro => libro.enlace));

        // Filtra los libros en proceso que ya han sido leídos
        this.librosEnProgreso = enProceso.filter(libro => !idsLeidos.has(libro.enlace)).length;
        this.librosTotales = parseInt(resp.data.totalLibrosLeidos || 0, 10);
        this.tematicasMasLeidas = resp.data.tematicasMasLeidas || [];
        this.librosMasValorados = resp.data.librosMasValorados || [];
      } catch (error) {
        console.error('Error al cargar estadísticas generales:', error);
      }
    },

    // Carga libros recomendados para el usuario
    async cargarLibrosRecomendados() {
      if (!this.user) return;
      try {
        const response = await apiClient.get(`/estadisticas/librosrecomendados/${this.user.correo}`);
        this.librosRecomendados = response.data || [];
      } catch (error) {
        console.error('Error al cargar libros recomendados:', error);
      }
    },

    // Ayuda a enriquecer la información de los usuarios del top 3
    async enriquecerUsuariosTop3(usuariosTop3) {
      return await Promise.all(
          usuariosTop3.map(async (usuario) => {
            try {
                const resp = await apiClient.get(`/usuario/${encodeURIComponent(usuario.usuario_id)}`);
                return { ...usuario, ...resp.data };
            } catch (error) {
                console.warn("Error al enriquecer usuario:", usuario.usuario_id, error);
                return usuario;
            }
          })
      );
    },

    // Carga top 3 usuarios del mes
    async cargarTop3UsuariosMes() {
      try {
          const response = await apiClient.get('/estadisticas/top3');
          this.top3UsuariosMes = await this.enriquecerUsuariosTop3(response.data);
      } catch (error) {
          console.error('Error al cargar top3 usuarios del mes:', error);
          this.top3UsuariosMes = [];
      }
    },
    
    // Carga top 3 usuarios del año
    async cargarTop3UsuariosAnio() {
      try {
        const response = await apiClient.get('/estadisticas/top3anuales');
        this.top3UsuariosAnio = await this.enriquecerUsuariosTop3(response.data);
      } catch (error) {
        console.error('Error al cargar top3 usuarios del año:', error);
        this.top3UsuariosAnio = [];
      }
    },  
    
    // Carga top 5 libros por mes/año
    async cargarTop5Libros(month, year) {
      try {
        this.top5Libros = [];
        const response = await apiClient.get(`/estadisticas/top5libros/${month}/${year}`);
        this.top5Libros = response.data || [];
      } catch (error) {
        console.error(`Error al cargar libros más populares de ${month}/${year}:`, error);
        this.top5Libros = [];
      }
    },
    
    // Navegar a los detalles de un libro
    goToDetalles(libro) {
      if (libro && libro.nombre) {
        this.$router.push({ name: 'Detalles', params: { id: libro.nombre } });
      }
    },
    
    // Genera un rango de años
    generateYearRange(start, end) {
      const years = [];
      for (let year = start; year <= end; year++) {
        years.push(year);
      }
      return years;
    },
    
    // Actualiza los datos del top5 al cambiar mes/año
    async actualizarDatos() {
      this.selectedMonthName = this.getMonthName(this.selectedMonth);
      try {
        await this.cargarTop5Libros(this.selectedMonth, this.selectedYear);
      } catch (error) {
        console.error('Error al actualizar datos:', error);
      }
    },
    
    // Devuelve el nombre del mes según el número
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

  /* Contenedor principal sin padding */
  .container-fluid {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  /* Contenedor de página ocupando toda la altura */
  .page-wrapper {
    min-height: 100vh;
  }

  /* Contenedor de carrusel sin espacio entre elementos */
  .carousel-container {
    gap: 0;
  }

  /* Lista de libros sin separación y en una sola línea */
  .book-list {
    gap: 0;
    flex-nowrap: nowrap;
  }

  /* Estilo individual de cada libro en el carrusel */
  .book-item {
    cursor: pointer;
    margin-right: 0.3rem;
  }

  /* Imagen de libro recomendado */
  .recommended-book-image {
    object-fit: contain;
    border-radius: 5px;
    background: none;
    margin: 0;
    width: 110px;
    height: auto;
  }

  /* Ajuste de imagen recomendado en móviles */
  @media (max-width: 600px) {
    .recommended-book-image {
      width: 120px;
    }
  }

  /* Botones de navegación tipo flecha */
  .arrow-btn {
    background-color: var(--color-boton);
    border: none;
    border-radius: 50%;
    width: 45px;
    height: 45px;
    color: var(--color-texto-boton);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    transition: transform 0.2s ease;
    padding: 0;
    margin: 0;
  }

  /* Efecto hover en los botones */
  .arrow-btn:hover {
    transform: scale(1.1);
  }

  /* Ícono dentro de los botones */
  .arrow-icon {
    font-weight: bold;
  }

  /* Contenedor de libros marcados como favoritos */
  .liked-books-container {
    gap: 1rem;
    margin: 0;
    padding: 0;
    justify-content: center;
  }

  /* Ítems individuales en la lista de favoritos */
  .liked-book-item {
    margin: 0 !important;
    padding: 0 !important;
    cursor: pointer;
  }

  /* Imagen de libro pequeño */
  .small-book-image {
    display: block;
    margin: 0;
    width: 120px;
    height: auto;
    object-fit: contain;
    border-radius: 5px;
    background: none !important;
  }

  /* Bloque de temáticas */
  .tematicas-block {
    border-radius: 8px;
    max-width: 220px;
    margin-bottom: 1.5rem;
    text-align: center;
    background-color: var(--color-boton);
    color: var(--color-texto-boton);
  }

  /* Contenedor de estadísticas en círculos */
  .stats-circles {
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  /* Círculo individual de estadísticas */
  .stat-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin: 0 0.5rem 1rem 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    background-color: var(--color-boton);
    color: var(--color-texto-boton);
    border: 4px solid #999;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  }

  /* Texto principal en los círculos */
  .circle-text {
    font-size: 1.4rem;
    font-weight: bold;
  }

  /* Etiqueta pequeña debajo del número */
  .circle-label {
    font-size: 0.85rem;
    margin-top: 2px;
    color: inherit;
  }

  /* Mensaje mostrado cuando no hay datos */
  .no-data-message {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  /* Contenido del mensaje de no datos */
  .no-data-content {
    background-color: rgba(229, 197, 120, 0.1);
    border: 1px solid #e5c578;
    border-radius: 8px;
    padding: 1rem 1.5rem;
    max-width: 350px;
    text-align: center;
    color: inherit;
  }

  /* Icono dentro del mensaje de no datos */
  .no-data-content .icono {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    display: block;
    color: #e5c578;
  }

  /* Texto dentro del mensaje de no datos */
  .no-data-content p {
    margin: 0;
    font-size: 0.95rem;
  }

  /* Título de sección */
  .titulo {
    text-align: center;
    font-weight: bold;
    font-size: 2rem;
    color: var(--color-texto);
    margin: 30px 0;
  }

  /* Estilo de select personalizado */
  .form-select {
    background-color: var(--color-fondo);
    border: 1px solid #bbb;
    border-radius: 4px;
    padding: 0.375rem 2.25rem 0.375rem 0.75rem;
    font-size: 0.9rem;
    color: var(--color-texto);
  }

  /* Contenedor principal del podio */
  .podium-container {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    margin: 0 auto 1rem auto;
    width: 100%;
    max-width: 100%;
  }

  /* Estructura interna del podio */
  .podium {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    width: 100%;
    gap: 0;
  }

  /* Ítems individuales del podio */
  .podium-item {
    text-align: center;
    flex: 1;
    max-width: 90px;
  }

  /* Barra de podio donde aparece el número */
  .podium-bar {
    width: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 30px;
    color: rgb(0, 0, 0);
    padding: 0.2rem 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  /* Imagen de usuario en el podio */
  .podium-img {
    width: 45px;
    height: 45px;
    object-fit: cover;
    border-radius: 50%;
    border: 2px solid #4C4637;
    margin: 0 auto 0.3rem auto;
  }

  /* Nombre de usuario debajo de la imagen */
  .podium-nombre {
    font-weight: bold;
    font-size: 0.8rem;
    margin-bottom: 0.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Cantidad de libros leídos o datos adicionales */
  .podium-libros {
    font-size: 0.75rem;
    margin-top: 0.2rem;
  }

  /* Alturas relativas de las barras del podio */
  .first .podium-bar { height: 120px; }
  .second .podium-bar { height: 85px; }
  .third .podium-bar { height: 55px; }

  /* Colores de fondo definidos en clases bg-gold, bg-silver, bg-bronce */
</style>
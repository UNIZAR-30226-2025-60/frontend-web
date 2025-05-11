<template>
  <!-- Si ya se cargó todo, se muestra el contenido principal -->
  <div v-if="!loading" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    
    <!-- Barra de navegación con datos del usuario y tema -->
    <NavBar :dark-mode="darkMode" :user="user" />

    <!-- Contenedor principal con paddings y altura mínima -->
    <div class="container-fluid pt-4 p-5 min-vh-100">

      <!-- Switch para cambiar entre modo claro/oscuro -->
      <div class="theme-switch-wrapper mb-1">
        <div class="theme-switch" @click="toggleDarkMode">
          <div class="switch-track" :class="{ 'dark': darkMode }">
            <div class="switch-thumb" :class="{ 'dark': darkMode }">
              <!-- Ícono dinámico: sol para claro, luna para oscuro -->
              <font-awesome-icon v-if="!darkMode" :icon="['fas', 'sun']" class="icon sun-icon"/>
              <font-awesome-icon v-else :icon="['fas', 'moon']" class="icon moon-icon"/>
            </div>
          </div>
        </div>
      </div>

      <!-- Si hay un banner, muestra información e imagen -->
      <div v-if="banner" class="lista-banner">
        <div class="banner-image">
          <img :src="transformarURLGoogleDrive(lista.portada) || 'https://via.placeholder.com/150x150.png?text=Imagen+de+Lista'" alt="Imagen de la lista">
        </div>
        <div class="lista-info">
          <h2 class="lista-titulo">{{ lista.nombre }}</h2>
          <p class="lista-descripcion">{{ lista.descripcion }}</p>
          <p class="lista-tipo">
            <span :class="darkMode ? 'text-light' : 'text-dark'" class="d-flex align-items-center gap-2">
              <font-awesome-icon
                :icon="lista.publica ? ['fas', 'lock-open'] : ['fas', 'lock']"
                class="me-2"
              />
              {{ lista.publica ? 'Pública' : 'Privada' }}
            </span>
          </p>
        </div>
      </div>

      <!-- Si no hay banner, solo muestra el nombre de la lista -->
      <div v-else>
        <div class="lista-info">
          <h2 class="lista-titulo">{{ lista.nombre }}</h2>
        </div>
      </div>

      <!-- Barra de búsqueda -->
      <form class="d-flex mb-3 mt-4" @submit.prevent="buscarLibros">
        <div class="position-relative w-100">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="position-absolute" style="left: 15px; top: 50%; transform: translateY(-50%); color: #aaa;"/>
          <input class="form-control rounded-pill ps-5" type="search" placeholder="Buscar libros..." v-model="busqueda" />
        </div>
      </form>

      <!-- Mensaje si no hay resultados -->
      <h5 class="text-center p-2">{{ libros.length > 0 ? '' : 'No se encontraron libros' }}</h5>

      <!-- Lista de libros -->
      <div class="listado">
        <div class="l-container p-2 mx-5">
          <div class="row libros-container">
            <div v-for="libro in libros" :key="libro.enlace" class="col-lg-3 col-md-4 col-sm-6 col-12 mb-4 d-flex justify-content-center" @click="goToDetalles(libro)">
              <div class="book-card card shadow-sm">
                <img :src="libro.imagen_portada" class="book-image card-img-top" alt="Portada del libro">
                <div class="card-body text-center p-2">
                  <h6 class="book-title">{{ libro.nombre }}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Pie de página -->
    <Footer />
  </div>

  <!-- Si loading aún está activo, se muestra el spinner -->
  <div v-else>
    <Cargando :dark-mode="darkMode" />
  </div>

</template>


<script>
// Importaciones necesarias
import axios from "axios";
import NavBar from '@/components/NavBar.vue';
import Cargando from '@/components/Cargando.vue';
import Footer from '@/components/Footer.vue';
import { apiClient } from '../config';

export default {
  name: 'VerLista',
  components: { NavBar, Footer, Cargando },

  data() {
    return {
      user: null,
      libros: [],
      librosOriginales: [],
      lista: null,
      busqueda: "",
      donde: "",
      darkMode: localStorage.getItem("darkMode") === "true",
      loading: true,
      banner: true
    };
  },

  async mounted() {
    await this.montarDeNuevo();
  },

  watch: {
    // Buscar libros automáticamente al escribir
    busqueda(newValue) {
      if (!newValue) {
        this.libros = this.librosOriginales;
        return;
      }

      const texto = newValue.toLowerCase().trim();
      this.libros = this.librosOriginales.filter(libro =>
        libro.nombre.toLowerCase().includes(texto)
      );
    },

    // Reaccionar a cambios en la URL (parámetros)
    '$route.params': {
      deep: true,
      handler() {
        this.loading = true;
        this.montarDeNuevo();
      }
    }
  },

  methods: {
    async montarDeNuevo() {
      try {
        // Obtener usuario
        const response = await apiClient.get("/user");
        this.user = response.data || null;

        this.donde = this.$route.params.donde;
        const listaID = this.$route.params.id;

        // Si la lista es privada
        if (this.donde === "MisListas") {
          const res = await apiClient.get(`/listas/${this.user.correo}/${listaID}`);
          this.lista = res.data;

          if (listaID === "Leídos") {
            this.banner = false;
            const leidos = await apiClient.get(`/libros/leidos/${this.user.correo}`);
            this.libros = leidos.data;
            this.librosOriginales = [...this.libros];
          } else if (listaID === "En proceso") {
            this.banner = false;
            const [enProceso, leidos] = await Promise.all([
              apiClient.get(`/libros/enproceso/${this.user.correo}`),
              apiClient.get(`/libros/leidos/${this.user.correo}`)
            ]);
            const idsLeidos = new Set(leidos.data.map(l => l.enlace));
            this.libros = enProceso.data.filter(libro => !idsLeidos.has(libro.enlace));
            this.librosOriginales = [...this.libros];
          } else {
            this.banner = listaID !== "Mis Favoritos";
            await this.cargarLibros();
          }
        } else {
          // Si es una lista pública
          const response = await apiClient.get(`/listas/publicas/${listaID}`);
          this.lista = response.data;
          await this.cargarLibros();
        }

        this.applyTheme();
      } catch (error) {
        console.error("Error al montar:", error);
        this.$router.push("/");
      } finally {
        this.loading = false;
      }
    },

    async cargarLibros() {
      try {
        const response = await apiClient.get("/libros");
        const todosLosLibros = response.data;

        let librosLista;
        if (this.donde === "MisListas") {
          const res = await apiClient.get(`/listas/${this.user.correo}/${this.lista.nombre}/libros`);
          librosLista = res.data;
        } else {
          const res = await apiClient.get(`/listas/publicas/${this.lista.nombre}/librosP`);
          librosLista = res.data;
        }

        // Filtrar los libros que realmente están disponibles
        this.libros = librosLista.map(libroL => {
          const libro = todosLosLibros.find(l => l.enlace === libroL.enlace_libro);
          return libro ? { ...libro, imagen_portada: libro.imagen_portada || 'https://via.placeholder.com/150x225?text=Sin+Portada' } : null;
        }).filter(l => l !== null);

        this.librosOriginales = [...this.libros];
      } catch (error) {
        console.error("Error al cargar los libros:", error);
      }
    },

    transformarURLGoogleDrive(url) {
      if (!url) return null;

      try {
        const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
        return match ? `https://lh3.googleusercontent.com/d/${match[1]}=w500` : url;
      } catch (error) {
        console.error("Error al transformar URL:", error);
        return null;
      }
    },

    async buscarLibros() {
      const texto = this.busqueda.trim().toLowerCase();

      if (!texto) {
        this.libros = this.librosOriginales;
        return;
      }

      if (["Leídos", "En proceso"].includes(this.$route.params.id)) {
        this.libros = this.librosOriginales.filter(libro =>
          libro.nombre.toLowerCase().includes(texto)
        );
      } else {
        try {
          const response = await apiClient.get(`/libros/obtenerTitulo/${texto}`);
          this.libros = Array.isArray(response.data) ? response.data : [response.data];
        } catch (error) {
          console.error("Error al buscar el libro:", error);
          this.libros = [];
        }
      }
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("darkMode", this.darkMode);
      this.applyTheme();
    },

    applyTheme() {
      document.body.classList.toggle("dark-mode", this.darkMode);
      document.body.classList.toggle("light-mode", !this.darkMode);
    },

    goToDetalles(libro) {
      this.$router.push({ name: 'Detalles', params: { id: libro.nombre } });
    }
  }
};

</script>

<style scoped>

.page-wrapper {
  min-height: 100vh;
}

.lista-banner {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 60px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--color-texto);
  border-radius: 12px;
}

.banner-image {
  width: 150px;  
  height: 150px;
  overflow: hidden;
  border-radius: 10px;
  margin-right: 20px; 
  flex-shrink: 0;
}

.banner-image img {
  width: 100%; 
  height: 100%;
  object-fit: cover;  
}

.lista-info {
  flex: 1;
  min-width: 0;
  text-align: left;
  color: var(--color-texto);
}

.lista-titulo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--color-texto);
  word-break: break-word;     
  overflow-wrap: break-word;  
  white-space: normal;        
}

.lista-descripcion {
  font-size: 1.1rem;
  opacity: 0.9;
  color: var(--color-texto);
}

.lista-tipo {
  font-size: 1rem;
  margin-top: 10px;
  display: flex;
  align-items: center;
  color: var(--color-texto);
}

.lista-tipo i {
  margin-right: 5px;
}

.book-card {
  width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
}

.book-card:hover {
  transform: scale(1.05);
}

.book-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 5px;
}

.book-card.card {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.book-card .card-body {
  background-color: transparent !important;
  border: none !important;
  padding: 0 !important;
  box-shadow: none !important;
}

.book-title {
  color: var(--color-texto);
  width: 160px; 
  white-space: normal; 
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  -webkit-box-orient: vertical;
  text-align: center;
}
</style>
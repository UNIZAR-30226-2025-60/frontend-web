<template>
  <div v-if="!loading" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <NavBar :dark-mode="darkMode"  :user="user"></NavBar>

    <div class="listado min-vh-100">

      <div class="libros-header">
        <span class="titulo" v-if="privacidad === 'MisListas'">MIS LISTAS</span>
        <span class="titulo" v-else-if="privacidad === 'ListasPublicas'">LISTAS PÚBLICAS</span>

        <!-- Switch con iconos sol/luna -->
        <div class="theme-switch-wrapper">
            <div class="theme-switch" @click="toggleDarkMode">
              <div class="switch-track" :class="{ 'dark': darkMode }">
                <div class="switch-thumb" :class="{ 'dark': darkMode }">
                  <!-- Sol icono -->
                  <font-awesome-icon v-if="!darkMode" :icon="['fas', 'sun']" class="icon sun-icon"/>
                  <!-- Luna icono -->
                  <font-awesome-icon v-else :icon="['fas', 'moon']" class="icon moon-icon"/>
                </div>
              </div>
            </div>
          </div>
      </div>

      <div class="l-container p-2 mx-5">
        <h5 class="text p-2">{{ listas.length > 0 ? '' : 'No tienes listas aún' }}</h5>
        <div class="row listas-container">
          <!-- Listado de listas -->
          <div v-for="lista in listas" :key="lista.id" class="col-lg-3 col-md-4 col-sm-6 col-12 mb-4 d-flex justify-content-center" @click="goToVerLista(lista)">
            <div class="lista-card card shadow-sm">
              <img :src=transformarURLGoogleDrive(lista.portada) class="lista-image card-img-top" alt="Portada de la lista">
              <div class="lista-header p-2">
                <div class="lista-title-container ms-2 text-center">
                  <h6 class="lista-title">{{ lista.nombre.length > 30 ? lista.nombre.slice(0, 30) + '...' : lista.nombre }}</h6>
                </div>
                <div class="options-menu" v-if="listaDelUsuario(lista)">
                  <button class="menu-dots ms-3" @click.stop="lista.mostrarMenu = !lista.mostrarMenu">⋮</button>
                  <div v-if="lista.mostrarMenu" class="menu-dropdown">
                    <ul>
                      <li @click.stop="editarLista(lista)">Editar</li>
                      <li @click.stop="eliminarLista(lista)">Eliminar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Botón para crear lista -->
          <div class="col-lg-3 col-md-4 col-sm-6 col-12 mb-4 d-flex justify-content-center" v-if="this.privacidad == 'MisListas'">
            <div class="create-list-btn" @click="crearLista">
              <span class="create-list-icon">+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer></Footer>
  </div>
  <div v-else>
    <Cargando :dark-mode="darkMode"></Cargando>
  </div>
</template>


<script>
import NavBar from '@/components/NavBar.vue';
import Cargando from '@/components/Cargando.vue'
import Footer from '@/components/Footer.vue';
import { apiClient } from '../config';

export default {
  name: 'ListasComponent',
  components: { NavBar, Footer, Cargando },
  data() {
    return {
      user: null,
      listas: [],
      privacidad: "",
      donde: "",
      darkMode: localStorage.getItem("darkMode") === "true", // Obtener el tema guardado
      loading: true
    };
  },
  watch: {
    '$route'(to, from) {
      this.privacidad = to.params.privacidad;
      if(this.privacidad === "MisListas"){
        this.cargarListasPrivadas();
      } else {
        this.cargarListasPublicas();
      }
    }
  },
  async mounted() {
    try {
      // Intenta obtener los datos del usuario autenticado
      const response = await apiClient.get("/user");
      this.user = response.data; // Guarda los datos del usuario si existe
      if(this.user == ""){ 
        this.user = null;
        if(this.privacidad === "MisListas"){
          this.$router.push("/");
        }
        console.log("Usuario no autenticado");
      }
      else {
        console.log("Usuario autenticado");
      }
    } catch (error) {
      console.error("Error al cargar los datos del usuario: ", error);
    }
    try {
      this.privacidad = this.$route.params.privacidad;
      this.donde = this.privacidad;
      if(this.privacidad === "MisListas"){
        await this.cargarListasPrivadas();
      }
      else{
        await this.cargarListasPublicas();
      }
      this.applyTheme();
      document.addEventListener("click", this.closeAllMenus);
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
      this.$router.push("/");
    } finally {
      this.loading = false;
    }
  },
  beforeUnmount() {
    document.removeEventListener("click", this.closeAllMenus);
  },
  methods: {
    async cargarListasPrivadas() {
      try {
        const response = await apiClient.get(`/listas/${this.user.correo}`);
        this.listas = response.data
          .filter(lista => lista.nombre !== "Mis Favoritos" && lista.nombre !== "Leídos" && lista.nombre !== "En proceso") // Excluir "Mis Favoritos"
          .map(lista => ({ ...lista, mostrarMenu: false }));
      } catch (error) {
        console.error("Error al cargar las listas:", error);
      }
    },
    // Método para verificar si la lista pertenece al usuario actual
    listaDelUsuario(lista) {
      if (!this.user) return false;
      // Si la privacidad es "Mis Listas", siempre es del usuario actual
      if (this.privacidad === "MisListas") {
        return true;
      }

      // En el caso de las listas públicas, solo debe mostrar las opciones si es el usuario creador
      return lista.usuario_id === this.user.correo;
    },
    // Función para transformar URLs de Google Drive
    transformarURLGoogleDrive(url) {
      if (!url) return null;

      try {
        // Extraer el ID del archivo de Google Drive
        const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
        
        if (match) {
          const id = match[1];
          // Nueva URL usando lh3.googleusercontent.com
          return `https://lh3.googleusercontent.com/d/${id}=w500`;
        }
        
        return url; // Si no es de Drive, devolver tal cual
      } catch (error) {
        console.error("Error al transformar URL:", error);
        return null;
      }
    },
    async cargarListasPublicas() {
      try {
        const response = await apiClient.get(`/listas/publicas`);
        this.listas = response.data
          .filter(lista => lista.nombre !== "Mis Favoritos") // Excluir "Mis Favoritos"
          .map(lista => ({ ...lista, mostrarMenu: false }));
      } catch (error) {
        console.error("Error al cargar las listas:", error);
      }
    },
    crearLista() {
      this.$router.push({ name: 'CrearEditarLista', params: { hacer: 'Crear' } });
    },
    goToVerLista(lista) {
      this.$router.push({ name: 'VerLista', params: {donde: this.donde, id: lista.nombre} });
    },
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
    editarLista(lista) {
      console.log("Editando lista:", lista.nombre);
      // Navegar a la ruta de edición pasando 'Editar' y el nombre de la lista
      this.$router.push({ name: 'CrearEditarLista', params: { hacer: 'Editar', nombre: lista.nombre } });
    },
    async eliminarLista(lista) {
      try {
        // Eliminar la lista en el backend
        await apiClient.delete(`/listas/${this.user.correo}/${encodeURIComponent(lista.nombre)}`);

        // Eliminar la lista del array local
        this.listas = this.listas.filter(l => l.nombre !== lista.nombre);

        console.log("Lista borrada correctamente");        
      } catch (error) {
        console.error("Error al eliminar la lista:", error)
      }
    },
    closeAllMenus(event) {
      this.listas.forEach(lista => {
        if (event && event.target.closest('.options-menu')) return;
        lista.mostrarMenu = false;
      });
    }
  },
};
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
}

.titulo {
  text-align: center;         
  font-weight: bold;        
  font-size: 2rem;          
  margin: 30px 0;           
}

.lista-card {
  width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
  position: relative;
}

.lista-card:hover {
  transform: scale(1.05);
}

.lista-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 5px;
}

.lista-title {
  font-size: 0.9rem;
  font-weight: bold;
  width: 100%;
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  padding-right: 25px;
}

.options-menu {
  position: absolute;
  right: 2px; 
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
}

/* Botón de tres puntos sin círculo */
.menu-dots {
  background: transparent;
  border: none;
  font-weight: bold;
  cursor: pointer;
  color: inherit;
  
  /* Mejora el área de clic sin afectar visualmente el botón */
  min-width: 32px;
  min-height: 32px;
  padding: 8px;
}

.menu-dots:hover {
  opacity: 0.7;
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 25px;
  background: white;
  border-radius: 5px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 120px;
}

.dark-mode .menu-dropdown {
  background: #333;
  color: white;
}

.menu-dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-dropdown li {
  padding: 10px;
  cursor: pointer;
  white-space: nowrap;
}

.menu-dropdown li:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.dark-mode .menu-dropdown li:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.lista-header {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 5px;
}

.lista-title-container {
  display: flex;
  justify-content: center;
  flex-grow: 1; 
  overflow: hidden;
}

.create-list-btn {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background-color: #ffbf47; 
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.create-list-btn:hover {
  transform: scale(1.1); 
}

.create-list-icon {
  font-size: 3rem; 
  font-weight: bold;
  line-height: 1; 
  text-align: center; 
  position: relative; 
  top: -1px; 
}

.listas-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center; 
}

.create-list-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: auto;
}

.dark-mode .create-list-btn {
  background-color: #ead5a1; 
}

.dark-mode .create-list-icon {
  color: #343434; /* Icono oscuro para el modo oscuro */
}

.light-mode .create-list-btn {
  background-color: #343434; 
}

.light-mode .create-list-icon {
  color: #ead5a1; 
}
</style>
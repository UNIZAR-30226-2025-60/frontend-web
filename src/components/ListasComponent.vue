<template>
  <div v-if="user" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <NavBar :dark-mode="darkMode"></NavBar>

    <div class="listado pt-5 min-vh-100">
      <!-- Botón de cambio de tema -->
      <button @click="toggleDarkMode" class="theme-toggle-btn mx-5 mb-3">
        {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
      </button>

      <h4 class="mb-4 text-center">{{ privacidad }}</h4>

      <div class="l-container p-2 mx-5">
        <h4 class="text p-2">{{ listas.length > 0 ? '' : 'No tienes listas aún' }}</h4>
        <div class="row listas-container">
          <!-- Listado de listas -->
          <div v-for="lista in listas" :key="lista.id" class="col-lg-3 col-md-4 col-sm-6 col-12 mb-4 d-flex justify-content-center" @click="goToVerLista(lista)">
            <div class="lista-card card shadow-sm">
              <img src="https://via.placeholder.com/180" class="lista-image card-img-top" alt="Portada de la lista">
              <div class="lista-header d-flex justify-content-between align-items-center p-2">
                <div class="card-body text-center p-2">
                  <h6 class="lista-title">{{ lista.nombre }}</h6>
                  <div class="options-menu">
                    <button class="btn btn-light btn-sm" @click.stop="lista.mostrarMenu = !lista.mostrarMenu">⋮</button>
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
          </div>
          <!-- Botón para crear lista -->
          <div class="col-lg-3 col-md-4 col-sm-6 col-12 mb-4 d-flex justify-content-center">
            <div class="lista-card card shadow-sm create-list" @click="crearLista">
              <div class="card-body text-center p-2">
                <h6 class="lista-title">+ Crear Lista</h6>
              </div>
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
      darkMode: localStorage.getItem("darkMode") === "true" // Obtener el tema guardado
    };
  },
  watch: {
    '$route'(to, from) {
      this.privacidad = to.params.privacidad;
      
      if(this.privacidad === "Mis Listas"){
        this.cargarListasPrivadas();
      } else {
        this.cargarListasPublicas();
      }
    }
  },
  async mounted() {
    try {
      const response = await apiClient.get("/user");
      this.user = response.data;
      this.privacidad = this.$route.params.privacidad;
      if(this.privacidad === "Mis Listas"){
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
      this.$router.push({ name: 'VerLista', params: { id: lista.nombre } });
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
        await apiClient.delete(`/listas/${this.user.correo}/${encodeURIComponent(lista.nombre)}`);
        if(this.privacidad === "Mis Listas"){
          this.$router.push({name: 'Listas', params: { privacidad: 'Mis Listas'}});
        } else {
          this.$router.push({name: 'Listas', params: { privacidad: 'Listas Publicas'}});
        } // Recargar listas después de eliminar
        this.cargarListasPrivadas();
      } catch (error) {
        alert("Error al eliminar la lista:", error);
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

.dark-mode .listado {
  background-color: #343434;
  color: #ffffff;
}

/* Colores modo claro */
.light-mode {
  background-color: #ffffff;
  color: #000000;
}

.light-mode .listado {
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

.listas-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.lista-card {
  width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
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

.lista-card {
  width: 180px;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
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
}

.create-list {
  background-color: #f6e5bb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.options-menu {
  position: relative;
  display: inline-block;
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 30px;
  background: white;
  border-radius: 5px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 120px;
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
  background-color: #f0f0f0;
}
</style>

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
        <h5 class="text p-2">{{ listas.length > 0 ? '' : 'No tienes listas aún' }}</h5>
        <div class="row listas-container">
          <!-- Listado de listas -->
          <div v-for="lista in listas" :key="lista.id" class="col-lg-3 col-md-4 col-sm-6 col-12 mb-4 d-flex justify-content-center" @click="goToVerLista(lista)">
            <div class="lista-card card shadow-sm">
              <img :src=transformarURLGoogleDrive(lista.portada) class="lista-image card-img-top" alt="Portada de la lista">
              <div class="lista-header p-2">
                <div class="lista-title-container">
                  <h6 class="lista-title">{{ lista.nombre }}</h6>
                </div>
                <div class="options-menu" v-if="listaDelUsuario(lista)">
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
      darkMode: localStorage.getItem("darkMode") === "true" // Obtener el tema guardado
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
      const response = await apiClient.get("/user");
      this.user = response.data;
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

        alert('Lista eliminada exitosamente');
        
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
  position: absolute;
  right: 10px; /* Pegado al borde derecho */
  top: 50%;
  transform: translateY(-50%);
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

/* Cambios para la disposición de los elementos en la lista */
.lista-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center; /* Centra el contenido */
  width: 100%;
}

.lista-title-container {
  flex-grow: 1; /* Hace que el título ocupe el espacio necesario */
  text-align: center; /* Centra el texto */
}

/* Estilo del botón circular de crear lista */
.create-list-btn {
  width: 90px; /* Ancho del botón */
  height: 90px; /* Alto del botón */
  border-radius: 50%; /* Hace que el botón sea circular */
  background-color: #ffbf47; /* Color de fondo más vivo (amarillo vibrante) */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 20px; /* Añadido para darle espacio vertical */
}

/* Efecto de hover para el botón */
.create-list-btn:hover {
  transform: scale(1.1); /* Efecto de hover */
}

/* Estilo del icono "+" */
.create-list-icon {
  font-size: 3rem; /* Tamaño grande del icono */
  color: #444; /* Color del icono */
  font-weight: bold;
  line-height: 1; /* Asegura que el + esté centrado verticalmente */
  text-align: center; /* Asegura que el texto esté centrado */
  position: relative; /* Asegura un mejor control de la posición */
  top: -1px; /* Ajuste fino para alinear verticalmente */
}

/* Ajustes para centrar el botón con las tarjetas de las listas */
.listas-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center; /* Esto asegura que los elementos se alineen verticalmente */
}

/* Para asegurar que el espacio alrededor del botón es consistente */
.create-list-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: auto; /* Ajusta la posición para que esté alineado con las tarjetas */
}

/* Colores modo oscuro */
.dark-mode .create-list-btn {
  background-color: #ead5a1; /* Fondo oscuro para el botón */
}

.dark-mode .create-list-icon {
  color: #343434; /* Icono blanco para el modo oscuro */
}

/* Colores modo claro */
.light-mode .create-list-btn {
  background-color: #343434; /* Fondo amarillo brillante para el modo claro */
}

.light-mode .create-list-icon {
  color: #ead5a1; /* Icono oscuro para el modo claro */
}

</style>

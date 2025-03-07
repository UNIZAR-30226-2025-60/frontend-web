<template>
  <div v-if="user" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <NavBar :dark-mode="darkMode"></NavBar>
    <div class="container-fluid pt-5 p-5 min-vh-100">
      <!-- Theme toggle button -->
      <button @click="toggleDarkMode" class="theme-toggle-btn mx-5 mb-3">
        {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
      </button>
      <div class="container d-flex justify-content-center">
        <div class="row w-100">
          <div class="col-md-4">
            <div class="card text-center p-3">
              <img :src="imagenSeleccionada ? imagenSeleccionada.foto : defaultProfileImage" 
                   alt="Foto lista" 
                   class="rounded-2 mx-auto d-block" 
                   width="100">
              <h4 class="mt-2">Crear Lista</h4>
              <p class="text-secondary text-justify">Crea una lista para tus temáticas especiales. ¿Quieres compartir tus recomendaciones o prefieres mantener tu lista solo para ti? ¡Tú decides! Pública para inspirar a otros, privada para disfrutar en solitario.</p>
              <button type="button" class="btn btn-warning" @click="showModal">
                Editar foto de perfil
              </button>
            </div>
          </div>
          <div class="col-md-8">
            <div class="card p-4" style="min-height: 300px;">
              <div class="mb-3">
                <label for="nombreLista" class="form-label">Nombre de la lista</label>
                <input type="text" id="nombreLista" class="form-control" v-model="nombre" style="height: 50px;">
              </div>
              <div class="mb-3">
                <label for="descripcionLista" class="form-label">Descripción</label>
                <textarea id="descripcionLista" class="form-control" v-model="descripcion" style="height: 100px;"></textarea>
              </div>
              <div class="form-group mb-3">
                <label for="privacidad">Privacidad</label>
                <select id="privacidad" class="form-control" v-model="publica">
                  <option :value="true">Pública</option>
                  <option :value="false">Privada</option>
                </select>
              </div>
              <button class="btn btn-warning w-100" @click="crearLista">Crear Lista</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal -->
    <div class="modal fade" id="profileModal" tabindex="-1" aria-labelledby="profileModalLabel" aria-hidden="true" ref="modalElement">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="profileModalLabel">Seleccione una foto de perfil</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div v-for="(imagen, index) in imagenes" :key="index" class="col-md-4 mb-3">
                <div class="card" 
                    :style="imagenSeleccionada && imagenSeleccionada.foto === imagen.foto ? 'border: 3px solid #ffc107' : ''"
                    @click="seleccionarImagen(imagen)">
                  <img :src="imagen.foto" class="card-img-top" alt="Imagen" style="height: 100px; object-fit: cover;">
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="hideModal">Cerrar</button>
            <button type="button" class="btn btn-primary" @click="guardarSeleccion">Guardar cambios</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <p>Cargando...</p>
  </div>
  
  <Footer></Footer>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import { apiClient } from '../config';
import * as bootstrap from 'bootstrap';

export default {
  components: {
    NavBar,
    Footer
  },
  data() {
    return {
      user: null,
      nombre: '',
      descripcion: '',
      publica: true,
      modal: null,
      imagenes: [],
      imagenSeleccionada: null,
      busqueda: "",
      darkMode: localStorage.getItem("darkMode") === "true",
      defaultProfileImage: 'https://via.placeholder.com/100' // Placeholder image
    };
  },
  async mounted() {
    try {
      const response = await apiClient.get("/user");
      this.user = response.data;
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      this.$router.push("/");
    }
    
    try {
      await this.cargarImagenes();
    } catch (error) {
      console.error("Error al cargar fotos", error);
      this.$router.push("/");
    }
    
    try {
      this.applyTheme();
    } catch (error) {
      console.error("Error al aplicar tema", error);
      this.$router.push("/");
    }
  
    const modalElement = document.getElementById('profileModal');
    if (modalElement) {
      this.modal = new bootstrap.Modal(modalElement);
    }
  },
  methods: {
    async cargarImagenes() {
      try {
        const response = await apiClient.get("/listas/portadas-temas");
        this.imagenes = response.data;
      } catch(error) {
        console.error('Error al cargar las imagenes:', error);
      }
    },
    seleccionarImagen(imagen) {
      this.imagenSeleccionada = imagen;
    },
    guardarSeleccion() {
      this.hideModal();
    },
    async crearLista() {
      if (!this.nombre.trim()) {
        alert("El nombre de la lista no puede estar vacío.");
        return;
      }
      try {
        await apiClient.post('/listas', {
          nombre: this.nombre,
          usuario_id: this.user.correo,
          descripcion: this.descripcion,
          publica: this.publica,
          portada: this.imagenSeleccionada ? this.imagenSeleccionada.foto : this.defaultProfileImage
        });
        alert('Lista creada con éxito');
        this.$router.push({name: 'Listas', params: { privacidad: 'Mis Listas'}});
      } catch (error) {
        console.error('Error al crear la lista:', error);
        alert('No se pudo crear la lista');
      }
    },
    showModal() {
      if (this.modal) {
        this.modal.show();
      }
    },
    hideModal() {
      if (this.modal) {
        this.modal.hide();
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
    }
  }
};
</script>

<style scoped>
/* Estilos del botón */
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

.dark-mode .container-fluid {
  background-color: #343434;
  color: #ffffff;
}
.container.dark-mode {
  background-color: #343434;
  color: #ffffff;
}
/* Colores modo claro */
.light-mode {
  background-color: #ffffff;
  color: #000000;
}

.light-mode .container-fluid {
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
.container {
  max-width: 900px;
  margin-top: 20px;
}
.container.light-mode {
  background-color: #ead5a1;
  color: #000000;
}

body {
  height: 100%;
  padding: 0;
  background-color: #e5c578;
}
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
</style>
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
              <h4 class="mt-2">{{ hacer === 'Editar' ? 'Editar Lista' : 'Crear Lista' }}</h4>
              <p class="text-secondary text-justify">Crea o edita tu lista de temáticas especiales. ¿Quieres compartir tus recomendaciones o prefieres mantener tu lista solo para ti? ¡Tú decides! Pública para inspirar a otros, privada para disfrutar en solitario.</p>
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
              <button class="btn btn-warning w-100" @click="guardarLista">{{ hacer === 'Editar' ? 'Guardar Cambios' : 'Crear Lista' }}</button>
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
          <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
            <div class="row">
              <div v-for="(imagen, index) in imagenes" :key="index" class="col-md-4 mb-3">
                <div class="card" 
                    :style="imagenSeleccionada && imagenSeleccionada.foto === imagen.foto ? 'border: 3px solid #ffc107' : ''"
                    @click="seleccionarImagen(imagen)">
                  <img :src=imagen.foto class="card-img-top" alt="Imagen" style="height: 100px; object-fit: cover;">
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
  name: "CrearEditarLista",
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
      defaultProfileImage: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
      hacer: this.$route.params.hacer, // 'Crear' o 'Editar'
      nombre: this.$route.params.nombre || "", // Nombre de la lista si es edición
    };
  },
  async mounted() {
    try {
      const response = await apiClient.get("/user");
      this.user = response.data;
      if (this.hacer === "Editar" && this.nombre) {
        await this.cargarLista();
      }
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      this.$router.push("/");
    }
    
    try {
      await this.cargarImagenes();
    } catch (error) {
      console.error("Error al cargar fotos", error);
    }
      
    try {
      this.applyTheme();
    } catch (error) {
      console.error("Error al aplicar tema", error);
    }
  
    const modalElement = document.getElementById('profileModal');
    if (modalElement) {
      this.modal = new bootstrap.Modal(modalElement);
    }
  },
  methods: {
    async cargarLista() {
      try {
        const response = await apiClient.get(`/listas/${this.user.correo}/${this.listaNombre}`);;
        const lista = response.data;
        this.nombre = lista.nombre;
        this.descripcion = lista.descripcion;
        this.publica = lista.publica;
        this.imagenSeleccionada = { foto: lista.portada };
      } catch (error) {
        console.error("Error al cargar la lista para editar:", error);
      }
    },
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
    async guardarLista() {
      if (!this.nombre.trim()) {
        alert("El nombre de la lista no puede estar vacío.");
        return;
      }
      try {
        if (this.hacer === "Crear") {
          await apiClient.post('/listas', {
            nombre: this.nombre,
            usuario_id: this.user.correo,
            descripcion: this.descripcion,
            publica: this.publica,
            portada: this.imagenSeleccionada ? this.imagenSeleccionada.foto : this.defaultProfileImage
          });
          alert('Lista creada con éxito');
        } else if (this.hacer === "Editar" && this.listaNombre) {
          await apiClient.patch(`/listas/${this.user.correo}/${this.nombre}`, {
            descripcion: this.descripcion,
            publica: this.publica,
            portada: this.imagenSeleccionada ? this.imagenSeleccionada.foto : this.defaultProfileImage,
            nuevoNombre: this.nombre // En caso de que quiera cambiar el nombre
          });
          alert('Lista actualizada con éxito');
        }
        this.$router.push({ name: 'Listas', params: { privacidad: 'Mis Listas' }});
      } catch (error) {
        console.error('Error al guardar la lista:', error);
        alert('No se pudo guardar la lista');
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
<template>
  <div v-if="!loading" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <NavBar :dark-mode="darkMode"  :user="user"></NavBar>
    <div class="container-fluid pt-5 p-5 min-vh-100">
      <!-- Switch con iconos sol/luna -->
      <div class="theme-switch-wrapper mb-1">
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
      <div class="container d-flex justify-content-center">
        <div class="row w-100">
          <div class="col-md-4">
            <div class="card text-center p-3">
              <img :src="imagenSeleccionada ? transformarURLGoogleDrive(imagenSeleccionada.foto) : defaultProfileImage" 
                   alt="Foto lista" 
                   class="rounded-2 mx-auto d-block" 
                   width="100">
              <h4 class="mt-2">{{ hacer === 'Editar' ? 'Editar Lista' : 'Confirmar' }}</h4>
              <p class="text-secondary text-justify">Crea o edita tu lista de temáticas especiales. ¿Quieres compartir tus recomendaciones o prefieres mantener tu lista solo para ti? ¡Tú decides! Pública para inspirar a otros, privada para disfrutar en solitario.</p>
              <button type="button" class="btn modal-btn" @click="showModal">
                Editar foto de perfil
              </button>
            </div>
          </div>
          <div class="col-md-8">
            <div class="card p-4" style="min-height: 300px;">
              <div class="mb-3">
                <label for="nombreLista" class="form-label">Nombre de la lista</label>
                <input type="text" id="nombreLista" class="form-control" v-model="nombre" placeholder="Ejemplo: Novelas Policiacas" style="height: 50px;">
              </div>
              <div class="mb-3">
                <label for="descripcionLista" class="form-label">Descripción</label>
                <textarea id="descripcionLista" class="form-control" v-model="descripcion" placeholder="Añade una descripción (opcional)" style="height: 100px;"></textarea>
              </div>
              <div class="form-group mb-3">
                <label for="privacidad">Privacidad</label>
                <select id="privacidad" class="form-control" v-model="publica">
                  <option :value="true">Pública</option>
                  <option :value="false">Privada</option>
                </select>
              </div>
              <button class="btn modal-btn" @click="guardarLista">{{ hacer === 'Editar' ? 'Guardar Cambios' : 'Confirmar' }}</button>
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
          </div>
          <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
            <div class="row">
              <div v-for="(imagen, index) in imagenes" :key="index" class="col-md-4 mb-3">
                <div class="card" 
                    :style="imagenSeleccionada && imagenSeleccionada.foto === imagen.foto ? 'border: 3px solid #ffc107' : ''"
                    @click="seleccionarImagen(imagen)">
                  <img :src=transformarURLGoogleDrive(imagen.foto) class="card-img-top" alt="Imagen" style="height: 100px; object-fit: cover;">
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn modal-btn" @click="hideModal">Cerrar</button>
            <button type="button" class="btn modal-btn" @click="guardarSeleccion">Guardar cambios</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <Cargando></Cargando>
  </div>
  
  <Footer></Footer>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import Cargando from '@/components/Cargando.vue'
import Footer from '@/components/Footer.vue'
import { apiClient } from '../config';
import * as bootstrap from 'bootstrap';

export default {
  name: "CrearEditarLista",
  components: {
    NavBar,
    Cargando,
    Footer
  },
  data() {
    return {
      user: null,
      nombreOriginal: this.$route.params.nombre || "",
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
      loading: true
    };
  },
  async mounted() {
    try {
      // Intenta obtener los datos del usuario autenticado
      const response = await apiClient.get("/user");
      this.user = response.data; // Guarda los datos del usuario si existe
      console.log("Usuario autenticado:", this.user);
      if(this.user == ""){
        console.log("Usuario no autenticado");
        this.$router.push("/");
      }
    } catch (error) {
      // Si no hay usuario autenticado, simplemente continúa con los datos públicos
      console.error("Error al cargar los datos del usuario: ", error);
    }
    try {
      if (this.hacer === "Editar") {
        await this.cargarLista();
      }
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      this.$router.push("/");
    } finally {
      this.loading = false;
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
        const response = await apiClient.get(`/listas/${this.user.correo}/${encodeURIComponent(this.nombre)}`);
        const lista = response.data;
        this.descripcion = lista.descripcion;
        this.publica = lista.publica;
        this.imagenSeleccionada = { foto: lista.portada };
        // Verificar que los datos se están cargando
        console.log("Datos de la lista cargados:", lista);
      } catch (error) {
        console.error("Error al cargar la lista para editar:", error);
        // Añadir más información de depuración
        console.error("Detalles del error:", error.response ? error.response.data : error.message);
      }
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
    async cargarImagenes() {
      try {
        const response = await apiClient.get("/listas/portadas-temas");
        // Filtrar imágenes duplicadas basado en la URL normalizada
        const imagenesUnicas = [];
        const urlsVistas = new Set();
        
        response.data.forEach(imagen => {
          // Normalizar la URL para comparación más precisa
          const urlNormalizada = this.normalizarURL(imagen.foto);
          
          if (!urlsVistas.has(urlNormalizada)) {
            urlsVistas.add(urlNormalizada);
            imagenesUnicas.push(imagen);
          }
        });
        
        this.imagenes = imagenesUnicas;
        console.log(`Cargadas ${this.imagenes.length} imágenes únicas de ${response.data.length} totales`);
      } catch(error) {
        console.error('Error al cargar las imagenes:', error);
      }
    },
    // Función para comparar URLs en busca de imágenes duplicadas
    normalizarURL(url) {
      if (!url) return "";
      
      // Extraer el ID del archivo de Google Drive
      const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
      
      if (match) {
        return match[1]; // Devolver solo el ID como identificador único
      }
      
      // Si no es una URL de Google Drive, normalizar quitando parámetros
      return url.split('?')[0];
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
        } else if (this.hacer === "Editar") {
          // Asegurarnos de que imagenSeleccionada existe
          const portada = this.imagenSeleccionada ? this.imagenSeleccionada.foto : this.defaultProfileImage;
          
          await apiClient.patch(`/listas/${this.user.correo}/${encodeURIComponent(this.nombreOriginal)}`, {
            descripcion: this.descripcion,
            publica: this.publica,
            portada: portada,
            nuevoNombre: this.nombre // En caso de que quiera cambiar el nombre
          });
          alert('Lista actualizada con éxito');
        }
        // Redirigir a "Mis Listas" si la lista es privada
        if (this.publica === false) {
          this.$router.push({ name: 'Listas', params: { privacidad: 'MisListas' } });
        } else {
          // Si la lista es pública, redirigir a las listas públicas
          this.$router.push({ name: 'Listas', params: { privacidad: 'ListasPublicas' } });
        }
      } catch (error) {
        console.error('Error al guardar la lista:', error);
        console.error("Detalles del error:", error.response ? error.response.data : error.message);
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
.container {
  max-width: 900px;
  margin-top: 20px;
}

.card {
  background-color: #F8E79B ;
  color: #4C4637;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.row.w-100 {
  display: flex;
  align-items: stretch; /* hace que ambas columnas tengan la misma altura */
}

.row.w-100 > .col-md-4,
.row.w-100 > .col-md-8 {
  display: flex;
  flex-direction: column;
}

.row.w-100 .card {
  flex: 1; /* fuerza a la tarjeta a ocupar toda la altura disponible */
}

</style>
<template>
  <NavBar></NavBar>
  <div class="cabecera" style="background-color: #e5c578; padding: 20px;">
    <div class="container d-flex justify-content-center">
      <div class="row w-100">
        <div class="col-md-4">
          <div class="card text-center p-3">
            <img :src="imagenSeleccionada ? imagenSeleccionada.foto : 'https://bootdey.com/img/Content/avatar/avatar6.png'" alt="Admin" class="rounded-2 mx-auto d-block" width="100">
            <h4 class="mt-2">Crear Lista</h4>
            <p class="text-secondary">Crea una lista para tus temáticas especiales. ¿Quieres compartir tus recomendaciones o prefieres mantener tu lista solo para ti? ¡Tú decides! Pública para inspirar a otros, privada para disfrutar en solitario.</p>
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
              <input type="text" id="descripcionLista" class="form-control" v-model="descripcion" style="height: 100px;">
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
                   @click="seleccionarImagen(imagen)" alt="pene">
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
  
  <Footer></Footer>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import { apiClient } from '../config';
import { Modal } from 'bootstrap';

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
      imagenSeleccionada: null
    };
  },
  async mounted() {
    try {
      const response = await apiClient.get("/user");
      this.user = response.data;
      this.cargarImagenes();
      this.modal = new Modal(document.getElementById('profileModal'));

    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      this.$router.push("/");
    }
  },
  methods: {
    async cargarImagenes() {
      try {
        const response = await apiClient.get("/listas/portadas-temas");
        this.imagenes = response.data;
      }catch(error){
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
          portada: this.imagen.foto
        });
        alert('Lista creada con éxito');
        this.$router.push('/mislistas');
      } catch (error) {
        console.error('Error al crear la lista:', error);
        alert('No se pudo crear la lista');
      }
    },
    showModal() {
      if (this.modal) {
        this.modal.show();
      } else {
        this.modal = new Modal(document.getElementById('profileModal'));
        this.modal.show();
      }
      if(this.imagenes.length < 0){
        alert('Me cago en todo')
      }
    },
    hideModal() {
      if (this.modal) {
        this.modal.hide();
      }
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 900px;
  margin-top: 20px;
  background-color: #e5c578;
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
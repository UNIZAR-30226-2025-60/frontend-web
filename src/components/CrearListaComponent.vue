<template>
  <NavBar></NavBar>
  <div class="container d-flex justify-content-center">
    <div class="row w-100">
      <div class="col-md-4">
        <div class="card text-center p-3">
          <img src="https://bootdey.com/img/Content/avatar/avatar6.png" alt="Admin" class="rounded-2 mx-auto d-block" width="100">
          <h4 class="mt-2">Crear Lista</h4>
          <p class="text-secondary">Crea una lista para tus temáticas especiales. ¿Quieres compartir tus recomendaciones o prefieres mantener tu lista solo para ti? ¡Tú decides! Pública para inspirar a otros, privada para disfrutar en solitario.</p>
          <hr>
          <div class="form-group">
            <label for="privacidad">Privacidad</label>
            <select id="privacidad" class="form-control" v-model="publica">
              <option :value="true">Pública</option>
              <option :value="false">Privada</option>
            </select>
          </div>
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
          <button class="btn btn-primary w-100" @click="crearLista">Crear Lista</button>
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
      publica: true
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
  },
  methods: {
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
          portada: 'https://drive.google.com/file/d/1w1-4PqTPplZGqUunJa8B6C1cJw9vsStJ/view?usp=sharing'
        });
        alert('Lista creada con éxito');
        this.$router.push('/mislistas');
      } catch (error) {
        console.error('Error al crear la lista:', error);
        alert('No se pudo crear la lista');
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
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #e5c578 !important;
}
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
</style>
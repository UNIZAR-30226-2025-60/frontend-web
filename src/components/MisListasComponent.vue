<template>
  <div v-if="user">
    <NavBar :dark-mode="darkMode"></NavBar>
    <div class="cabecera" style="background-color: #9b885b;">
      <div class="container mt-2">
        <h3>Mis Listas</h3>
      </div>
    </div>
    <div class="listado">
      <div class="l-container p-2 mx-5">
        <h4 class="text p-2">{{ listas.length > 0 ? 'Tus listas' : 'No tienes listas aún' }}</h4>
        <div class="row listas-container">
          <!-- Listado de listas -->
          <div v-for="lista in listas" :key="lista.nombre" class="col-lg-3 col-md-4 col-sm-6 col-12 mb-4 d-flex justify-content-center">
            <div class="lista-card card shadow-sm">
              <img :src="lista.portada || '../assets/libro.jpg'" class="lista-image card-img-top" alt="Portada de la lista">
              <div class="card-body text-center p-2">
                <h6 class="lista-title">{{ lista.nombre }}</h6>
                <p class="lista-desc">{{ lista.descripcion || 'Sin descripción' }}</p>
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
    <p>Cargando...</p>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import { apiClient } from '../config';

export default {
  name: 'ListasComponent',
  components: { NavBar, Footer },
  data() {
    return {
      user: null,
      listas: [],
      darkMode: localStorage.getItem("darkMode") === "true",
    };
  },
  async mounted() {
    try {
      const response = await apiClient.get("/user");
      this.user = response.data;
      this.cargarListas();
      this.applyTheme();
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
      this.$router.push("/");
    }
  },
  methods: {
    async cargarListas() {
      try {
        const response = await apiClient.get(`/listas/${this.user.correo}`);
        this.listas = response.data;
      } catch (error) {
        console.error("Error al cargar las listas:", error);
      }
    },
    crearLista() {
      this.$router.push({ name: 'CrearLista' });
    },
    applyTheme() {
      document.body.classList.toggle("dark-mode", this.darkMode);
      document.body.classList.toggle("light-mode", !this.darkMode);
    }
  }
};
</script>

<style scoped>
.listas-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
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

.lista-desc {
  font-size: 0.8rem;
  color: gray;
}

.create-list {
  background-color: #f6e5bb;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

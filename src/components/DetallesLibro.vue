<template>
  <div v-if="libro && librosRelacionados" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <NavBar :dark-mode="darkMode"></NavBar>
    <div v-if="libro" class="container mt-4">

      <!-- Botón de cambio de tema -->
      <button @click="toggleDarkMode" class="theme-toggle-btn mb-3">
        {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
      </button>

      <div class="row">
        <div class="col-md-4 d-flex flex-column align-items-center">
          <img :src="libro.imagen_portada" class="img-fluid" alt="Portada del libro">
          <p class="mb-3 text-center cursiva">{{ libro.nombre }}</p>
          <button class="btn btn-primary" @click="leerLibro">
            <font-awesome-icon :icon="['fas', 'book-open']" /> Leer
          </button>
        </div>
        <div class="col-md-8">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4 class="titulo">{{ libro.nombre }}</h4>
              <h4>de: {{ libro.autor }}</h4>
            </div>
            <div>
              <font-awesome-icon :icon="[ isFavorito ? 'fas' : 'far', 'heart' ]" class="heart-icon" @click="toggleFavorito"/>
              <button class="btn" @click="abrirModalListas(libro)">Añadir a lista</button>
            </div>
          </div>

          <!-- Línea horizontal antes de más libros del mismo autor -->
          <hr class="my-3">

          <!-- Sección para otros libros del mismo autor -->
          <h5>Más de {{ libro.autor }}</h5>
          <div v-if="librosRelacionados.length > 0">
            <div class="row">
              <div v-for="(libroRelacionado, index) in librosRelacionados" :key="index" class="col-md-3">
                <img :src="libroRelacionado.imagen_portada" class="libro-relacionado-img" alt="Portada" @click="goToDetalles(libroRelacionado)">
              </div>
            </div>
          </div>
          <div v-else class="mt-3">
            <p>No hay más libros de este autor.</p>
          </div>

          <!-- Línea horizontal antes de la sinopsis -->
          <hr class="my-3">
          
          <h4>Sinopsis</h4>
          <p class="text-justify">{{ libro.resumen }}</p>

          <!-- Línea horizontal antes de la información de las páginas del libro, horas de lectura, ... -->
          <hr class="my-3">

          <h5>Acerca de este libro</h5>

          <!-- Línea horizontal antes de valoraciones del libro -->
          <hr class="my-3">

          <div class="col-md-8">
            <h5>Valoraciones del libro:</h5>
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="mb-1"> Valoración general</p>
                <p> {{ libro.puntuacion_media.toFixed(2) }} de 5</p>
                <div class="d-flex">
                  <span v-for="(icon, idx) in getStarIcons(libro.puntuacion_media)" :key="idx">
                      <font-awesome-icon :icon="['fas', icon]"/> 
                  </span>
                  <p>({{conteoValoraciones.total}})</p>
                </div>
                <div class="pt-2">
                  <button class="btn" @click="aniadirValoracion(libro)">Añadir Valoración</button>
                </div>
              </div>
              <div>
                <p class="mb-1"> 
                  <span v-for="(icon, idx) in getStarIcons(5)" :key="idx">
                    <font-awesome-icon :icon="['fas', icon]" />
                  </span>
                  {{ conteoValoraciones[5] }}</p>
                <p class="mb-1"> 
                  <span v-for="(icon, idx) in getStarIcons(4)" :key="idx">
                    <font-awesome-icon :icon="['fas', icon]" />
                  </span>
                  {{ conteoValoraciones[4] }}</p>
                <p class="mb-1"> 
                  <span v-for="(icon, idx) in getStarIcons(3)" :key="idx">
                    <font-awesome-icon :icon="['fas', icon]" />
                  </span>
                  {{ conteoValoraciones[3] }}</p>
                <p class="mb-1"> 
                  <span v-for="(icon, idx) in getStarIcons(2)" :key="idx">
                    <font-awesome-icon :icon="['fas', icon]" />
                  </span>
                  {{ conteoValoraciones[2] }}</p>
                <p class="mb-1"> 
                  <span v-for="(icon, idx) in getStarIcons(1)" :key="idx">
                    <font-awesome-icon :icon="['fas', icon]" />
                  </span>
                  {{ conteoValoraciones[1] }}</p>
              </div>
            </div>
          </div>

          <!-- Línea horizontal antes del título todas las reseñas del libro -->
          <hr class="my-3">

          <div class="dropdown d-flex justify-content-end">
            <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Ordena por:
            </button>
            <ul class="dropdown-menu" style="position: absolute; top: 100%; left: 0; margin-top: 0.125rem;">
              <li><a href="#" class="dropdown-item" @click.prevent="cambiarFiltro('alta')"> Valoración más alta</a></li>
              <li><a href="#" class="dropdown-item" @click.prevent="cambiarFiltro('baja')"> Valoración más baja</a></li>
              <li><a href="#" class="dropdown-item" @click.prevent="cambiarFiltro('antigua')"> Valoración más antigua</a></li>
              <li><a href="#" class="dropdown-item" @click.prevent="cambiarFiltro('reciente')"> Valoración más reciente</a></li>
            </ul>
          </div>

          <!-- Línea horizontal antes de todas las reseñas del libro -->
          <hr class="my-3">

          <div v-if="valoracionesOrdenadas.length > 0">
            <div v-for="valoracion in valoracionesOrdenadas" :key="valoracion.id" class="valoracion">
              <p class="mb-1">
                <strong>{{ valoracion.titulo_resena }}</strong>
                <span v-for="(icon, i) in getStarIcons(valoracion.valor)" :key="i">
                  <font-awesome-icon :icon="['fas', icon]" />
                </span>
              </p>
              <p class="mb-1">{{ valoracion.mensaje }}</p>
              <p>Por {{valoracion.usuario_id}} en {{ new Date(valoracion.fecha).toLocaleDateString() }}</p>
              <hr>
            </div>
          </div>
          <div v-else>
            <p>No hay valoraciones todavía.</p>
          </div>
        </div>        
      </div>
    </div>
    <div v-else class="container mt-4 text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <Footer></Footer>
    <button class="back-to-top" @click="scrollTop">
      <font-awesome-icon :icon="['fas', 'chevron-up']" />
    </button>

    <!-- MODAL personalizado -->
     <!-- Modal de valoración -->
    <div v-if="mostrarModal" class="modal-background">
      <div class="modal-dialog modal-dialog-centered"> 
        <div class="modal-content bg-dark text-white rounded-3 shadow-lg">
          <div class="modal-header">
            <h4 class="modal-title fw-bold mb-4">Nueva Valoración</h4>
          </div>
          <div class="modal-body">
            <form>
              <div>
                <label class="controls mb-3 p-2" for="titulo">Título:</label>
                <input type="text" v-model="nuevaValoracion.titulo_resena" placeholder="Introduce tu título">
              </div>
              <div>
                <label class="controls mb-3 p-2" for="mensaje">Mensaje:</label>
                <textarea v-model="nuevaValoracion.mensaje" placeholder="Introduce tu valoración*" required></textarea>
              </div>
              <div>
                <label class="controls mb-3 p-2" for="valor">Puntuación:</label>
                <input type="number" v-model="nuevaValoracion.valor" min="1" max="5">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-enviar p-2 px-4 me-3 mb-2" @click="enviarValoracion">Enviar</button>
            <button type="button" class="btn-cancelar p-2 px-4 mb-2" @click="cerrarModal">Cancelar</button>
          </div>
        </div>
      </div> 
    </div>

    <!-- MODAL personalizado -->
    <!-- Modal de selección de lista -->
    <div v-if="modalListasAbierto" class="modal-background">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white rounded-3 shadow-lg">
          <div class="modal-header">
            <h4 class="modal-title fw-bold mb-4">Selecciona una lista</h4>
          </div>
          <div class="modal-body">
            <ul class="list-group">
              <li v-for="lista in listasUsuario" :key="lista.id" class="list-group-li bg-dark mb-2">
                <button class="btn w-100 text-start" @click="aniadirALista(lista.nombre)">{{ lista.nombre }}</button>
              </li>
            </ul>

            <div class="mt-3 text-end">
              <button class="btn btn-cancelar" @click="cerrarModalListas">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <Cargando :dark-mode="darkMode"></Cargando>
  </div>
</template>

<script>
import axios from 'axios';
import NavBar from '@/components/NavBar.vue'
import Cargando from '@/components/Cargando.vue'
import Footer from '@/components/Footer.vue'
import { apiClient } from '../config';


export default {
  name: 'Detalles',
  components: {
    NavBar,
    Footer,
    Cargando
  },
  data() {
    return {
      user: null,
      libro: null,
      librosRelacionados: [],
      mostrarModal: false,
      modalListasAbierto: false,
      dropdownAbierto: false,
      listas: {
        usuario_id: "",
        libro_id: "",
        nombreLista: ""
      },
      libroSeleccionado: null,
      valoraciones: [], 
      filtroSeleccionado: "reciente",
      nuevaValoracion: {
        usuario_id: "", 
        libro_id: "", 
        titulo_resena: "", 
        mensaje: "", 
        valor: null
      },
      conteoValoraciones: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 },
      darkMode: localStorage.getItem("darkMode") === "true", // Obtener el tema guardado
      isFavorito: false
    };
  },
  computed: {
    valoracionesOrdenadas() {
      let ordenadas = [...this.valoraciones];

      switch (this.filtroSeleccionado) {
        case "alta":
          ordenadas.sort((a, b) => b.valor - a.valor);
          break;
        case "baja":
          ordenadas.sort((a, b) => a.valor - b.valor);
          break;
        case "antigua":
          ordenadas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
          break;
        case "reciente":
        default:
          ordenadas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          break;
      }
      return ordenadas;
    }
  },

  async mounted() {
  try {
    console.log("Componente montado.");
    // Obtener información del usuario
    const response1 = await apiClient.get("/user");
    this.user = response1.data;

    // Obtener detalles del libro
    const libroId = encodeURIComponent(this.$route.params.id);
    const response = await apiClient.get(`/libros/titulo/${libroId}`);
    this.libro = response.data;

    // Si se obtiene el libro, obtener libros relacionados y valoraciones
    if (this.libro) {
      await this.comprobarFavorito();
      await this.obtenerLibrosDelMismoAutor();
      await this.obtenerConteoValoraciones();
      await this.obtenerValoraciones();
    }

    // Aplicar el tema guardado al cargar la página
    this.applyTheme();
  } catch (error) {
    console.error('Error al cargar los detalles del libro:', error);
  }
},
  watch: {
    // Observa cambios en la ruta y vuelve a cargar los detalles del libro
    '$route.params.id': async function() {
      await this.cargarDetallesLibro();
    }
  },
  methods: {
    async aniadirALista(lista) {
      try {
        const listas = {
          usuario_id: this.user.correo,
          libro_id: this.libro.enlace,
          nombreLista: lista,
        };

        console.log(`Añadiendo libro ${this.libro.enlace} a la lista ${lista}`);

        const response = await apiClient.post(`/listas/${lista}`, listas);
        console.log("Respuesta:", response.data);

        alert(`Libro añadido a la lista ${lista} correctamente`);
        await this.comprobarFavorito();
        this.cerrarModalListas();
      } catch (error) {
        console.error("Error al añadir libro a la lista:", error);
        alert("Hubo un error al añadir el libro a la lista.");
      }
    },
    getStarIcons(rating) {
      const icons = [];
      const fullStars = Math.floor(rating);           // Entero de la puntuación
      const fraction = rating - fullStars;            // Parte decimal

      for (let i = 0; i < fullStars; i++) {
        icons.push('star'); 
      }
      if (fraction >= 0.25 && fraction <= 0.75) {
        icons.push('star-half');
      } else if (fraction > 0.75) {
        icons.push('star');
      }

      return icons;
    },
    async comprobarFavorito() {
      try {
        const response = await apiClient.get(`/listas/favoritos/${encodeURIComponent(this.user.correo)}`);
        const librosFavoritos = response.data;
        this.isFavorito = librosFavoritos.some(item => item.enlace_libro === this.libro.enlace);
      } catch (error) {
        console.error("Error al comprobar favoritos:", error);
        this.isFavorito = false;
      }
    },
    async toggleFavorito() {
      if (!this.isFavorito) {
        try {
          const favoritos = {
            usuario_id: this.user.correo,
            enlace_libro: this.libro.enlace
          };

          console.log("Usuario ID:", favoritos.usuario_id);
          console.log("Libro ID:", favoritos.enlace_libro);

          const response = await apiClient.post('/listas/favoritos', favoritos);
          alert(response.data.mensaje);
          this.isFavorito = true; // Cambia el ícono a sólido

          this.nuevaValoracion = {
            usuario_id: "", 
            libro_id: "" 
          };
        } catch (error) {
          if (error.response) {
            console.error("Error al añadir a favoritos:", error);
            alert("Hubo un error al guardar tu libro en favoritos.");
          }
        }
      } else {
        try {
          const data = {
            usuario_id: this.user.correo,
            enlace_libro: this.libro.enlace
          };

          const response = await apiClient.delete("/listas/favoritos", { data });
          alert(response.data.mensaje);
          this.isFavorito = false; // Cambia el ícono a regular
        } catch (error) {
          console.error("Error al eliminar de favoritos:", error);
          alert("Hubo un error al eliminar tu libro de favoritos.");
        }
      }
    },
    aniadirValoracion(libro) {
      this.nuevaValoracion = {
        usuario_id: this.user.correo,
        libro_id: libro.id,
        titulo_resena: "",
        mensaje: "",
        valor: null
      };
      this.mostrarModal = true; // Abre el modal
    },
    cerrarModal() {
      this.mostrarModal = false; // Cierra el modal
    },
    async enviarValoracion() {
      if (!this.nuevaValoracion.mensaje) {
        alert("El mensaje de la valoración es obligatorio");
        return;
      }
      try {
        // Guardamos todos los datos necesarios para realizar la consulta
        const nuevaValoracion = {
          usuario_id: this.user.correo,
          libro_id: this.libro.enlace,
          titulo_resena: this.nuevaValoracion.titulo_resena,
          mensaje: this.nuevaValoracion.mensaje,
          valor: this.nuevaValoracion.valor
        };

        console.log("Enviando los siguientes datos de valoración:");

        console.log("Enviando los siguientes datos de valoración:");
        console.log("Usuario ID:", nuevaValoracion.usuario_id);
        console.log("Libro ID:", nuevaValoracion.libro_id);
        console.log("Título de la Reseña:", nuevaValoracion.titulo_resena);
        console.log("Mensaje:", nuevaValoracion.mensaje);
        console.log("Puntuación:", nuevaValoracion.valor);
        
        const response = await apiClient.post('/opiniones', nuevaValoracion);
        console.log('Valoración añadida con éxito:', response.data);

        // Cerrar el modal después de enviar la valoración
        this.cerrarModal();

        // Recargar los detalles del libro para actualizar la lista de valoraciones
        await this.cargarDetallesLibro();

        // Recargar el conteo de valoraciones
        await this.obtenerConteoValoraciones();

        // Recargar las reseñas publicadas
        await this.obtenerValoraciones();

        // Limpiar el formulario después de enviar la reseña
        this.nuevaValoracion = {
          usuario_id: "", 
          libro_id: "", 
          titulo_resena: "", 
          mensaje: "", 
          valor: null
        };

        // Mostrar mensaje de éxito
        alert("Tu valoración ha sido publicada.");
      } catch (error) {
        console.error('Error al enviar la valoración:', error);
        alert("Hubo un error al enviar tu valoración. Inténtalo de nuevo.");
      }
    },
    async obtenerConteoValoraciones() {
      try {
        // Reiniciamos el contador para cada nueva consulta
        this.conteoValoraciones = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 };
        for (let valor = 5; valor >= 1; valor--) {
          const response = await apiClient.get(`/opiniones/valoracion/${encodeURIComponent(this.libro.enlace)}/${valor}`);
          const valoraciones = response.data;

          // Contamos las valoraciones por cada valor
          valoraciones.forEach((valoracion) => {
            // Aseguramos que el valor es un número
            const valorNumerico = parseInt(valoracion.valor);
            if (this.conteoValoraciones[valorNumerico] !== undefined) {
              this.conteoValoraciones[valorNumerico]++;
              this.conteoValoraciones.total++;
            }
          });
        }

        console.log("Conteo de valoraciones:", this.conteoValoraciones);
        
      } catch (error) {
        console.error("Error al obtener el conteo de las valoraciones:", error);
      }
    },
    async obtenerValoraciones() {
      try {
        const response = await apiClient.get(`/opiniones/${encodeURIComponent(this.libro.enlace)}`);
        this.valoraciones = response.data;
      } catch (error) {
        console.error("Error al obtener las valoraciones:", error);
      }
    },
    async cargarDetallesLibro() {
      try {
        const libroId = encodeURIComponent(this.$route.params.id);
        const response = await apiClient.get(`/libros/titulo/${libroId}`);
        this.libro = response.data;
        if (this.libro) {
          await this.obtenerLibrosDelMismoAutor();
        }
      } catch (error) {
        console.error('Error al cargar los detalles del libro:', error);
      }
    },
    async obtenerLibrosDelMismoAutor() {
      try {
        const response = await apiClient.get(`/libros/autor/${encodeURIComponent(this.libro.autor)}`);
        // Filtramos para excluir el libro actual
        this.librosRelacionados = response.data.filter(libro => libro.enlace !== this.libro.enlace);
      } catch (error) {
        console.error('Error al obtener libros del mismo autor:', error);
      }
    },
    goToDetalles(libro) {
      this.$router.push({ name: 'Detalles', params: { id: libro.nombre } });
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
    leerLibro() {
      console.log("Botón 'Leer' presionado"); // Verifica si esta línea aparece en la consola
      

      if (this.libro && this.libro.enlace) {
        console.log("📖 Datos del libro:", this.libro);
        // Extraer la ID del archivo desde la URL de Google Drive
        const driveIdMatch = this.libro.enlace.match(/\/d\/(.*?)\//);
        
        if (!driveIdMatch || !driveIdMatch[1]) {
          alert("❌ Error: No se pudo extraer la ID del archivo PDF.");
          return;
        }

        const fileId = driveIdMatch[1];
        const pdfUrl = `${apiClient.defaults.baseURL}/proxy-pdf?url=https://drive.google.com/uc?id=${fileId}&export=download`;

        console.log("✅ Redirigiendo al visor con URL:", pdfUrl);

        // Redirigir al visor
        this.$router.push({
          path: "/visor-pdf",
          query: { url: pdfUrl }
        });
      } else {
        alert("❌ Este libro no tiene un PDF disponible.");
      }
    },
    async abrirModalListas(libro) {
      this.libroSeleccionado = libro;
      const response = await apiClient.get(`/listas/${(this.user.correo)}`);
      console.log("Listas del usuario", response.data);
      this.listasUsuario = response.data
        .filter(lista => lista.nombre !== "Mis Favoritos" && lista.nombre !== "Leídos" && lista.nombre !== "En proceso") // Excluir "Mis Favoritos", "Leídos" y "En proceso"
        .map(lista => ({ ...lista, mostrarMenu: false }));
      this.modalListasAbierto = true;
    },
    cerrarModalListas() {
      this.modalListasAbierto = false;
    },
    scrollTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    toggleDropdown() {
      this.dropdownAbierto = !this.dropdownAbierto;
    },
    cambiarFiltro(filtro) {
      console.log("Cambiando filtro a:", filtro);
      this.filtroSeleccionado = filtro;
      
      const dropdownToggle = this.$el.querySelector('.dropdown-toggle');
      if (dropdownToggle) {
        dropdownToggle.setAttribute('aria-expanded', 'false');
        const dropdownMenu = dropdownToggle.nextElementSibling;
        if (dropdownMenu) {
          dropdownMenu.classList.remove('show');
          dropdownToggle.closest('.dropdown').classList.remove('show');
        }
      }
    },
    getSelectedFilterLabel() {
      const filterLabels = {
        'alta': 'Valoración más alta',
        'baja': 'Valoración más baja',
        'antigua': 'Valoración más antigua',
        'reciente': 'Valoración más reciente'
      };
      return filterLabels[this.filtroSeleccionado] || 'Ordenar';
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

.btn {
  background-color: #444;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
}

.btn:hover {
  background-color: #666;
  color: #fff;
}

.btn-enviar {
  background-color: #046f2a;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
}

.btn-enviar:hover {
  background-color: #046f2a;
  color: #fff;
}

.btn-cancelar {
  background-color: #a30c0c;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
}

.btn-cancelar:hover {
  background-color: #a30c0c;
  color: #fff;
}

.text-justify {
  text-align: justify;
}

.img-fluid {
  max-height: 500px;
  object-fit: contain;
}

.libro-relacionado-img {
  width: 40%; 
  height: 100px; 
  object-fit: cover; 
  cursor: pointer;
  transition: transform 0.3s;
}

.libro-relacionado-img:hover {
  transform: scale(1.05);
}

.modal-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

/* Colores modo oscuro */
.dark-mode {
  background-color: #343434;
  color: #ffffff;
}

.dark-mode .container {
  background-color: #343434;
  color: #ffffff;
}

/* Colores modo claro */
.light-mode {
  background-color: #ffffff;
  color: #000000;
}

.light-mode .container {
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

.heart-icon {
  cursor: pointer;
  font-size: 1.4rem;
  margin-right: 10px;
}

.light-mode .titulo {
  text-align: left;        
  font-weight: bold;         
  font-size: 2rem;         
  color: #343434;            
  margin: 30px 0;     
}

.dark-mode .titulo {
  text-align: left;      
  font-weight: bold;        
  font-size: 2rem;        
  color: #e3c377;        
  margin: 30px 0;         
}

.cursiva {
  font-style: italic;
}

.list-group {
  list-style: none; 
  padding: 0; /* Elimina el padding por defecto */
}

.list-group-li {
  background: #444; /* Color de fondo similar al de tu diseño */
  border-radius: 15px;
  text-align: center;
  color: white;
}

.light-mode .back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #48402e; 
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9999;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  color: #ffffff; 
}

.light-mode .back-to-top:hover {
  background-color: #343026; 
}

.dark-mode .back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #e3c377; 
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9999;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  color: #ffffff; 
}

.dark-mode .back-to-top:hover {
  background-color: #bca369;
}

.dropdown {
  position: relative;
}

.dropdown-item {
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: rgba(0,0,0,0.1);
}

.dropdown:focus-within .dropdown-menu {
  display: block;
}
</style>
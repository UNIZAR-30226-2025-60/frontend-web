<template>
  <NavBar/>

  <Cargando v-if="isLoading" />

  
  <div id="pdf-container">
    <div id="nav-controls">
      <template v-if="!isLoading && isFullScreen">
        <!-- <button id="prev-button" @click="prevPage">⬅</button> -->
        <!-- <span id="contPagina">Página {{ pageNum }} de {{ pageCount }}</span> -->
        <!-- <button id="next-button" @click="nextPage">➡</button> -->
        <div id="zoom-controls">
          <button @click="zoomOut">
            <font-awesome-icon :icon="['fas', 'minus']" />
          </button>
          <span>{{ zoomLevel.toFixed(1) }}x</span>
          <button @click="zoomIn">
            <font-awesome-icon :icon="['fas', 'plus']" />
          </button>
        </div>
      </template>


      <div class="canvas-wrapper">
        <button v-if="!isLoading && !isFullScreen" id="pantCompleta" @click="toggleFullScreen">⛶ Pantalla Completa</button>
        <canvas ref="canvas" @click="handlerCanvasClick"></canvas>
        <div v-if="!isLoading && isFullScreen" id="contPagina">Página {{ pageNum }} de {{ pageCount }}</div>
        <button id="marcador" @click="toggleFavorita" :style="estiloMarcador"> 
          <font-awesome-icon :icon="[esFavorita ? 'fas' : 'far', 'bookmark']" />
        </button>
        <!-- Flecha izquierda -->
        <button v-if="!isLoading && isFullScreen" class="flecha-button flecha-izquierda" @click="prevPage">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
          </svg>
          <div class="text">Anterior</div>
        </button>
        
        <!-- Flecha derecha -->
        <button v-if="!isLoading && isFullScreen" class="flecha-button flecha-derecha" @click="nextPage">
          <div class="text">Siguiente</div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        </button>

      </div>

    </div>

    <!-- Menú de páginas favoritas -->
    <div id="favoritas-menu">
      <h3>Páginas Favoritas</h3>
      <ul>
        <li v-for="pagina in paginasFavoritas" :key="pagina" @click="irAPagina(pagina)">
          Página {{ pagina }}
        </li>
      </ul>
    </div>
  </div>

  <Footer></Footer>
</template>



   <script>
import { ref, onMounted, watch } from "vue";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as regularBookmark } from '@fortawesome/free-regular-svg-icons'; // Icono vacío
import { faBookmark as solidBookmark } from '@fortawesome/free-solid-svg-icons'; // Icono relleno
import { computed } from 'vue';
library.add(regularBookmark, solidBookmark, faPlus, faMinus);
import { useRoute } from "vue-router";
import { apiClient } from "../config";
import NavBar from "./NavBar.vue";
import Footer from "./Footer.vue";
import Cargando from "./Cargando.vue";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.worker.min.js";

export default {
  name: "WebViewer",
  components: {
    NavBar,
    Footer,
    Cargando,
    FontAwesomeIcon,
  },
  data() {
    return {
      paginasFavoritas: [], // Inicializar el array de páginas favoritas
      correo: "",
      libroUrl: "",
    };
  },

  setup() {
    const canvas = ref(null);
    const pageNum = ref(1);
    const pageCount = ref(0);
    const zoomLevel = ref(0.7);
    const isRendering = ref(false);
    const isLoading = ref(true);
    const isFullScreen = ref(false);
    const esFavorita = ref(false);

    let pdfDoc = null;
    const route = useRoute();
    const correo = ref(""); // Guardar correo del usuario

    console.log("📄 URL recibida en el visor:", route.query.url);

    // ✅ Obtener el usuario autenticado desde el backend
    const loadUser = async () => {
      try {
        const response = await apiClient.get("/user", { withCredentials: true });
        correo.value = response.data.correo;
        console.log("📩 Correo obtenido del backend:", correo.value);
      } catch (error) {
        console.error("❌ Error al obtener el usuario:", error);
        correo.value = null;
      }
    };

    const libroUrl = route.query.url;

    const verificarFavorita = async () => {
      if (!correo.value) return;
      try {
        const { data } = await apiClient.get("/verificar-favorita", {
          params: { correo: correo.value, enlace: libroUrl, pagina: pageNum.value },
        });
        esFavorita.value = data.esFavorita;
        console.log(`⭐ Estado de favorita: ${esFavorita.value}`);
      } catch (error) {
        console.error("⚠️ No se pudo verificar si la página es favorita:", error);
      }
    };

    const estiloMarcador = computed(() => {
      const escala = zoomLevel.value;
      return{
        transform: `scale(${escala})`,
        transformOrigin: "top right",
      }
    })

    // Función para manejar el paso de páginas
    const handlerCanvasClick = (event) => {
      const rect = canvas.value.getBoundingClientRect();
      const clickX = event.clientX - rect.left;

      // Si el clic es en el tercio izquierdo => página anterior
      if (clickX < rect.width / 3) {
        prevPage();
      } 
      // Si el clic es en el tercio derecho => página siguiente
      else if (clickX > (2 * rect.width) / 3) {
        nextPage();
      }
    } 

     // ✅ Renderizar página
     const renderPage = async (num) => {
      if (!pdfDoc) {
        console.error("❌ pdfDoc es `null`");
        return;
      }
      if (isRendering.value) {
        console.warn("⚠️ Render en proceso, esperando...");
        return;
      }

      isRendering.value = true;

      try {
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: zoomLevel.value });
        const context = canvas.value.getContext("2d");

        canvas.value.height = viewport.height;
        canvas.value.width = viewport.width;
        context.clearRect(0, 0, canvas.value.width, canvas.value.height);
        await page.render({ canvasContext: context, viewport }).promise;

        console.log(`✅ Página ${num} renderizada`);
        // 🛠 Guardar la página solo si el usuario está autenticado
        if (!correo.value) {
          console.error("⚠️ No se puede guardar la página: usuario no autenticado.");
          return;
        }

        await apiClient.post(
          "/guardar-pagina",
          {
            correo: correo.value,
            libro_id: libroUrl,
            pagina: num,
          },
          { withCredentials: true }
        );

          await verificarFavorita();
        } catch (error) {
          console.error("❌ Error renderizando:", error);
        } finally {
          isRendering.value = false;
        }
    };

    // ✅ Cargar el PDF
    const loadPdf = async () => {
      try {
        console.log("📄 URL recibida en el visor:", route.query.url);

        const pdfUrl = decodeURIComponent(route.query.url);
        console.log("✅ URL decodificada en WebViewer:", pdfUrl);

        pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
        pageCount.value = pdfDoc.numPages;

        try {
          const { data } = await apiClient.get("/ultima-pagina", {
            params: { correo: correo.value, libro_id: libroUrl },
          });

          pageNum.value = data.pagina || 1;
        } catch (error) {
          console.error("❌ Error al obtener la última página:", error);
          pageNum.value = 1;
        }

        console.log("🔄 Renderizando página inicial:", pageNum.value);
        await renderPage(pageNum.value);

        isLoading.value = false;
      } catch (error) {
        console.error("❌ Error al cargar el PDF:", error);
        alert("Error al cargar el PDF. Verifica que el archivo está disponible.");
        isLoading.value = false;
      }
    };

    onMounted(async () => {
      await loadUser(); // Primero obtener el usuario autenticado
      await loadPdf();  // Luego cargar el PDF
    });

    // 🔄 Escuchar cambios de página y verificar si es favorita
    watch(pageNum, async () => {
      
      await verificarFavorita();
    });

    const prevPage = () => {
      if (pageNum.value <= 1) return;
      pageNum.value--;
      renderPage(pageNum.value);
    };

    const nextPage = () => {
      if (pageNum.value >= pageCount.value) return;
      pageNum.value++;
      renderPage(pageNum.value);
      if (pageNum.value === pageCount.value) {
        guardarEnLeidos();
      }
    };

    const zoomIn = () => {
      zoomLevel.value += 0.2;
      renderPage(pageNum.value);
    };

    const zoomOut = () => {
      if (zoomLevel.value <= 1.1) return;
      zoomLevel.value -= 0.2;
      renderPage(pageNum.value);
    };

    const toggleFullScreen = () => {
      const elem = document.getElementById("pdf-container");

      if (!document.fullscreenElement) {
        elem.requestFullscreen()
          .then(() => {
            isFullScreen.value = true;
            zoomLevel.value = 1.1; // Ajustamos el zoom a 1.1 en pantalla completa
            renderPage(pageNum.value);
          })
          .catch((err) => {
            console.error("❌ Error al intentar pantalla completa:", err);
          });
      } else {
        document.exitFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        isFullScreen.value = false;
        zoomLevel.value = 0.8; // Restablecemos el zoom a 0.8 cuando se salga de pantalla completa
        renderPage(pageNum.value);
      }
    });


    const guardarEnLeidos = async () => {
      if (!correo.value || !libroUrl) {
        console.error("⚠️ No se puede guardar la página: datos faltantes.");
        return;
      }

      try {
        const processedUrl = processBookUrl(libroUrl);
        console.log("📩 Correo:", correo.value);
        console.log("📄 Enlace del libro procesado:", processedUrl);
        await apiClient.post(
          "/libros/leidos",
          {
            correo: correo.value,
            enlace: processedUrl,
            fecha_fin_lectura: new Date().toISOString(), // La fecha actual
          },
          { withCredentials: true }
        );
        console.log("✅ Página guardada en 'leidos'");
      } catch (error) {
        console.error("❌ Error al guardar la página en 'leidos':", error.response ? error.response.data : error);
      }
    };
    const processBookUrl = (url) => {
      if (!url) return null;

      // Si el enlace contiene "proxy-pdf", extrae la URL original
      if (url.includes("proxy-pdf")) {
        const parsedUrl = new URL(url);
        url = parsedUrl.searchParams.get("url") || url;
      }

      // Si es un enlace de Google Drive, conviértelo al formato correcto
      const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
      if (match) {
        const id = match[1];
        return `https://drive.google.com/file/d/${id}/view?usp=sharing`;
      }

      // Devuelve el enlace tal cual si no coincide con ninguno de los casos anteriores
      return url;
    };
    const toggleFavorita = async () => {
      if (!correo.value) {
        alert("Debes iniciar sesión para guardar favoritas.");
        return;
      }
      if (!libroUrl) {
        console.error("❌ No se puede gestionar favorito: libro no definido.");
        return;
      }
      
      try {
        await verificarFavorita();
        
        if (esFavorita.value) {
          // 🗑 Eliminar de favoritos
          await apiClient.delete("/eliminar-favorita", {
            data: { correo: correo.value, enlace: libroUrl, pagina: pageNum.value },
            withCredentials: true,
          });
          console.log("🚮 Página eliminada de favoritos");
        } else {
          // ⭐ Guardar en favoritos
          await apiClient.post("/guardar-favorita", {
            correo: correo.value,
            enlace: libroUrl,
            pagina: pageNum.value,
          }, { withCredentials: true });
          console.log("✅ Página añadida a favoritos");
        }
        
        esFavorita.value = !esFavorita.value; // Alternar el estado del icono
        console.log("🌟 Estado de favorita:", esFavorita.value);
      } catch (error) {
        console.error("❌ Error al gestionar favorita:", error.response ? error.response.data : error);
        alert("Error al gestionar la página como favorita.");
      }
    };
   
    // Objeto compartido con funciones accesibles desde methods
    const sharedFunctions = {
      renderPage, processBookUrl,
    };

    return { correo, libroUrl, processBookUrl, renderPage, canvas, isLoading, handlerCanvasClick, estiloMarcador, isFullScreen, esFavorita, pageNum, pageCount, prevPage, nextPage, zoomIn, zoomOut, zoomLevel, toggleFullScreen, toggleFavorita};
  },

  methods: {
    async cargarPaginasFavoritas() {
      try {
        const correo = this.correo;
        const enlaceoriginal = this.libroUrl; //Enlace sin procesar
        const enlaceProcesado = this.processBookUrl(enlaceoriginal); // Enlace procesado

        if (!correo || !enlaceProcesado) {
          console.error("⚠️ Datos insuficientes para cargar páginas favoritas.");
          return;
        }

        console.log("🚀 Llamando a /fragmentos/obtenerFragmentos con:", { correo, enlace: enlaceProcesado });

        const response = await apiClient.get("/fragmentos/obtenerFragmentos", {
          params: { correo, enlace: enlaceProcesado },
          withCredentials: true,
        });

        console.log("✅ Respuesta del backend:", response.data);

        this.paginasFavoritas = response.data.map(fragmento => fragmento.pagina);
        console.log("✅ Páginas favoritas cargadas:", this.paginasFavoritas);
      } catch (error) {
        console.error("❌ Error al cargar páginas favoritas:", error);
      }
    },

    irAPagina(pagina) {
      this.pageNum = pagina;
      this.renderPage(this.pageNum);
    },
  },
  watch: {
    correo: {
      immediate: true,
      handler(newCorreo) {
        if (newCorreo && this.libroUrl) {
          this.cargarPaginasFavoritas();
        }
      },
    },
    libroUrl: {
      immediate: true,
      handler(newLibroUrl) {
        if (newLibroUrl && this.correo) {
          this.cargarPaginasFavoritas();
        }
      },
    },
  },
};
</script>


  <style scoped>
  #pdf-container {
    margin-top: 10px;
    text-align: center;
    overflow: auto;
    background-color:#eebf48cc;
    position: relative;
  }
  
  #nav-controls {
    margin-top: 10px;
  }
  
  canvas {
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  button {
    margin: 0 5px;
  }


  #contPagina {
  position: absolute;
  bottom: 30px; /* 📌 Se sitúa en la parte inferior del PDF */
  left: 50%;
  transform: translateX(-50%); /* 📌 Centrar horizontalmente */
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 10px 15px;
  font-size: 18px;
  font-family: Arial, sans-serif;
  border-radius: 5px;
  z-index: 10; /* 📌 Asegurar que esté sobre el PDF */
}

.canvas-wrapper {
  position: relative;
  display: inline-block; /* para que se ajuste al tamaño del canvas */
}

#pantCompleta {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  border-radius: 5px;
  padding: 6px 12px;
  z-index: 10;
}


#marcador {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  padding: 10px 12px;
  cursor: pointer;
  font-size: 24px;
  color: #333;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 5px;
  z-index: 15;
  transition: transform 0.2s ease, background 0.3s;
}

#marcador:hover {
  background: rgba(255, 255, 255, 0.8);
}

  #zoom-controls {
  position: absolute;
  margin-top: 15px; /* 📌 Se sitúa en la parte superior */
  left: 50%;
  transform: translateX(-50%); /* 📌 Centrar horizontalmente */
  padding: 10px 15px;
  border-radius: 5px;
  display: flex;
  font-size: 30px;
  align-items: center;
  gap: 10px;
  z-index: 10; /* 📌 Asegurar que esté sobre el PDF */
}
#zoom-controls button {
  width: 40px; /* Aumenta el tamaño del botón */
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%; /* Hace los botones redondos */
  background: rgba(0, 0, 0, 0.1); /* Un fondo más visible */
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.flecha-button {
  position: absolute;
  bottom: 10px;
  background-color: #ffffff00;
  color: #000;
  border: #b27d01e6 0.2em solid;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8.5em;
  height: 2.9em;
  padding: 0.5em;
  z-index: 15;
  transition: all 0.3s ease;
}

.flecha-button:hover {
  background-color: #d09409e6;
  color: #fff;
  cursor: pointer;
}

.flecha-button svg {
  width: 2em;
  margin-right: 0.5em;
  transition: all 0.3s ease;
}

.flecha-button:hover svg {
  transform: translateX(5px);
}

.flecha-button .text {
  font-size: 1em;
  font-weight: bold;
}

.flecha-izquierda {
  left: 10px;
}

.flecha-derecha {
  right: 10px;
}


  /* ✅ Quitar fondo y borde de los botones */
#zoom-controls button,
#marcador,
#prev-button,
#next-button {
  background: none; /* Quitar fondo */
  border: none; /* Quitar borde */
  box-shadow: none; /* Quitar sombra */
  color: black; /* Mantener color del texto o ícono */
  font-size: 18px;
  cursor: pointer;
  padding: 10px;
}


/* Estilo para el menú de páginas favoritas */

#favoritas-menu {
  position: fixed;
  top: 80px; /* Ajusta según la altura del NavBar */
  right: 20px;
  width: 200px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 20;
}

#favoritas-menu h3 {
  margin: 0 0 10px;
  font-size: 16px;
  text-align: center;
}

#favoritas-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

#favoritas-menu li {
  padding: 8px;
  cursor: pointer;
  border-radius: 3px;
  transition: background-color 0.3s;
}

#favoritas-menu li:hover {
  background-color: #f0f0f0;
}

  </style>
  


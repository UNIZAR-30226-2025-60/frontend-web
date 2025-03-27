<template>
  <NavBar />

  <Cargando v-if="isLoading" />


   <!-- Botón para ir al chat -->
   <div class="text-center mt-4">
    <button @click="$router.push('/chatbot')" class="btn btn-primary">
      Ir al Chat
    </button>
   </div>




  <div id="pdf-container">
    <div id="nav-controls">
      <template v-if="!isLoading && isFullScreen">
        <button id="prev-button" @click="prevPage">⬅</button>
        <span id="contPagina">Página {{ pageNum }} de {{ pageCount }}</span>
        <button id="next-button" @click="nextPage">➡</button>
        <button id="marcador" @click="toggleFavorita"> 
          <font-awesome-icon :icon="[esFavorita ? 'fas' : 'far', 'bookmark']" />
        </button>
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

      <button v-if="!isLoading && !isFullScreen" id="pantCompleta" @click="toggleFullScreen">⛶ Pantalla Completa</button>

      <canvas ref="canvas"></canvas>

    </div>
  </div>
</template>



   <script>
import { ref, onMounted, watch } from "vue";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as regularBookmark } from '@fortawesome/free-regular-svg-icons'; // Icono vacío
import { faBookmark as solidBookmark } from '@fortawesome/free-solid-svg-icons'; // Icono relleno
library.add(regularBookmark, solidBookmark, faPlus, faMinus);
import { useRoute } from "vue-router";
import { apiClient } from "../config";
import NavBar from "./NavBar.vue";
import Cargando from "./Cargando.vue";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.worker.min.js";

export default {
  name: "WebViewer",
  components: {
    NavBar,
    Cargando,
    FontAwesomeIcon,
  },
  setup() {
    const canvas = ref(null);
    const pageNum = ref(1);
    const pageCount = ref(0);
    const zoomLevel = ref(0.8);
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
    };

    const zoomIn = () => {
      zoomLevel.value += 0.2;
      renderPage(pageNum.value);
    };

    const zoomOut = () => {
      if (zoomLevel.value <= 0.6) return;
      zoomLevel.value -= 0.2;
      renderPage(pageNum.value);
    };

    const toggleFullScreen = () => {
      const elem = document.getElementById("pdf-container");

      if (!document.fullscreenElement) {
        elem.requestFullscreen()
          .then(() => {
            isFullScreen.value = true;
            zoomLevel.value = 1.1; // ✅ Ajustar zoom a 1.1 en pantalla completa
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
        zoomLevel.value = 0.8; // ✅ Restablecer zoom a 0.7 cuando se salga de pantalla completa
        renderPage(pageNum.value);
      }
    });

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
   

    return { canvas, isLoading, isFullScreen, esFavorita, pageNum, pageCount, prevPage, nextPage, zoomIn, zoomOut, zoomLevel, toggleFullScreen, toggleFavorita};
  },
};
</script>


  <style scoped>
  #pdf-container {
    margin-top: 10px;
    text-align: center;
    overflow: auto;
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

  #pantCompleta {
  position: absolute;
  top: 110px; /* 📌 Ajustar distancia desde la parte superior */
  right: 550px; /* 📌 Ajustar distancia desde el lado derecho */
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 18px;
  border-radius: 5px;
  /* 📌 Asegurar que el botón esté sobre el PDF */
  z-index: 10;
}


  #marcador {
    position: absolute;
    top: 5%; /* 📌 Coloca los botones a media altura */
    transform: translateY(-50%); /* 📌 Centra verticalmente */
    border: none;
    padding: 15px 20px;
    cursor: pointer;
    font-size: 30px;
    right: 30%;
    font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
    z-index: 10; /* 📌 Asegurar que estén sobre el PDF */
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

  #prev-button, #next-button {
    position: absolute;
    top: 50%; /* 📌 Coloca los botones a media altura */
    transform: translateY(-50%); /* 📌 Centra verticalmente */
    border: none;
    padding: 15px 20px;
    cursor: pointer;
    border-radius: 50%;
    z-index: 10; /* 📌 Asegurar que estén sobre el PDF */
  }

  /* 📌 Botón de Anterior (Izquierda) */
  #prev-button {
    left: 28%;
  }

  /* 📌 Botón de Siguiente (Derecha) */
  #next-button {
    right: 30%;
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

  </style>
  


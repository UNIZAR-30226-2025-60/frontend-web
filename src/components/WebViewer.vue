
   <template>
    <div id="pdf-container">
      <canvas ref="canvas"></canvas>
      <div id="nav-controls">
        <button @click="prevPage">Anterior</button>
        <span>Página {{ pageNum }} de {{ pageCount }}</span>
        <button @click="nextPage">Siguiente</button>
        <button @click="toggleFavorita">🌟 Favorita</button>
        <button @click="zoomOut">-</button>
        <span>{{ zoomLevel.toFixed(1) }}x</span>
        <button @click="zoomIn">+</button>
      </div>
    </div>
  </template>


   <script>
import { ref, onMounted } from "vue";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { useRoute } from "vue-router";
import { apiClient } from "../config";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.worker.min.js";

export default {
  setup() {
    const canvas = ref(null);
    const pageNum = ref(1);
    const pageCount = ref(0);
    const zoomLevel = ref(1);
    const isRendering = ref(false);
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

    const renderPage = async (num) => {
      if (!pdfDoc) {
        console.error("❌ Error: `pdfDoc` es `null`, no se puede renderizar la página.");
        return;
      }

      if (isRendering.value) {
        console.warn("⚠️ Renderización en proceso, esperando...");
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

        console.log(`✅ Página ${num} renderizada con éxito`);

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

      } catch (error) {
        console.error("❌ Error al renderizar la página:", error);
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
      } catch (error) {
        console.error("❌ Error al cargar el PDF:", error);
        alert("Error al cargar el PDF. Verifica que el archivo está disponible.");
      }
    };

    onMounted(async () => {
      await loadUser(); // Primero obtener el usuario autenticado
      await loadPdf();  // Luego cargar el PDF
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

    const toggleFavorita = async () => {
  if (!correo.value) {
    console.error("❌ No se puede guardar como favorita: usuario no autenticado.");
    alert("Debes iniciar sesión para guardar favoritas.");
    return;
  }

  if (!libroUrl) {
    console.error("❌ No se puede guardar como favorita: libro no definido.");
    return;
  }

  try {
    const response = await apiClient.post(
      "/guardar-favorita",
      {
        correo: correo.value,
        enlace: libroUrl,
        pagina: pageNum.value,
      },
      { withCredentials: true } // Asegurar que las cookies se envían
    );

    console.log("✅ Página añadida a favoritas:", response.data);
    alert("Página añadida a favoritas");
  } catch (error) {
    console.error("❌ Error al guardar favorita:", error.response ? error.response.data : error);
    alert("Error al guardar la página como favorita.");
  }
};

   

    return { canvas, pageNum, pageCount, prevPage, nextPage, zoomIn, zoomOut, zoomLevel, toggleFavorita};
  },
};
</script>


  <style scoped>
  #pdf-container {
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
  </style>
  
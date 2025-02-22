<!-- <template>

    <div>
      <div class="lector-toolbar">
        <button @click="paginaAnterior">‹</button>
        <span>Página {{ paginaActual }} de {{ numPaginas }}</span>
        <button @click="paginaSiguiente">›</button>
        <button @click="zoomIn">+</button>
        <button @click="zoomOut">-</button>
      </div>
      <canvas ref="pdfCanvas"></canvas>
    </div>
  </template>
  
  <script>
  import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;


  import { apiClient } from '../config';

  export default {
    props: ['paginaInicial'],
    data() {
      return {
        pdf: null,
        paginaActual: this.paginaInicial || 1,
        enlaceLibro: "http://localhost:3000/api/obtener-pdf/1pswnS2lR0dZzz7GkehnI5WmZZwRoRjc0",
        numPaginas: 0,
        escala: 1.0,
      };
    },
    watch: {
      enlaceLibro() {
        this.cargarPDF();
      }
    },
    mounted() {
      this.cargarPDF();
    },
    methods: {
      async cargarPDF() {
  try {
    console.log("🔹 Descargando PDF...");
    const response = await fetch(this.enlaceLibro);
    if (!response.ok) throw new Error(`Error al obtener el PDF: ${response.statusText}`);

    const pdfBlob = await response.blob();
    const pdfUrl = URL.createObjectURL(pdfBlob); // 🔥 Convertir a URL

    console.log("✅ PDF descargado y convertido a URL:", pdfUrl);

    // 🔹 Pasar la URL a pdf.js en lugar de un arrayBuffer
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    this.pdf = await loadingTask.promise;

    if (!this.pdf || typeof this.pdf.getPage !== "function") {
      console.error("🚨 Error: this.pdf NO es una instancia válida.");
      return;
    }

    console.log("✅ PDF cargado en pdf.js:", this.pdf);
    console.log("📄 Total de páginas:", this.pdf.numPages);

    this.numPaginas = this.pdf.numPages;
    this.renderizarPagina(this.paginaActual);
  } catch (error) {
    console.error("❌ Error al cargar el PDF:", error);
  }
}
,
async renderizarPagina(numPagina) {
  if (!this.pdf || typeof this.pdf.getPage !== "function") {
    console.error("🚨 Error: this.pdf no es válido o aún no está cargado.");
    return;
  }

  try {
    console.log(`📄 Cargando página ${numPagina}...`);
    const page = await this.pdf.getPage(numPagina);
    const viewport = page.getViewport({ scale: this.escala });
    const canvas = this.$refs.pdfCanvas;
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const renderContext = { canvasContext: context, viewport };
    await page.render(renderContext).promise;
    console.log("✅ Página renderizada correctamente.");
  } catch (error) {
    console.error("❌ Error al renderizar la página:", error);
  }
}

,
      async guardarProgreso() {
      try {
        await apiClient.post("/usuarios/guardar-progreso", {
          correo: 'locowin@gmail.com',  // Cambiar por usuario logueado
          enlace: this.enlaceLibro,
          pagina: this.paginaActual
        });
        console.log("Progreso guardado");
      } catch (error) {
        console.error("Error al guardar progreso:", error);
      }
      },
      paginaAnterior() {
        if (this.paginaActual <= 1) return;
        this.paginaActual--;
        this.renderizarPagina(this.paginaActual);
        this.guardarProgreso();
      },
      paginaSiguiente() {
        if (this.paginaActual >= this.numPaginas) return;
        this.paginaActual++;
        this.renderizarPagina(this.paginaActual);
        this.guardarProgreso();
      },
      zoomIn() {
        this.escala += 0.1;
        this.renderizarPagina(this.paginaActual);
      },
      zoomOut() {
        if (this.escala <= 0.5) return;
        this.escala -= 0.1;
        this.renderizarPagina(this.paginaActual);
      }
    }
  };
  </script>
  
  <style>
  .lector-toolbar {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  canvas {
    border: 1px solid #ccc;
  }
  </style>
   -->




   <template>
    <div>
      <div class="lector-toolbar">
        <button @click="paginaAnterior">‹</button>
        <span>Página {{ paginaActual }} de {{ numPaginas }}</span>
        <button @click="paginaSiguiente">›</button>
        <button @click="zoomIn">+</button>
        <button @click="zoomOut">-</button>
      </div>
      <pdf :src="pdfSrc" :page="paginaActual" :scale="escala"></pdf>
    </div>
  </template>
  
  <script>
  import pdf from 'vue-pdf';
  
  export default {
    components: { pdf },
    props: ['paginaInicial'],
    data() {
      return {
        pdfSrc: "http://localhost:3000/api/obtener-pdf/1pswnS2lR0dZzz7GkehnI5WmZZwRoRjc0",
        paginaActual: this.paginaInicial || 1,
        numPaginas: 0,
        escala: 1.0
      };
    },
    methods: {
      paginaAnterior() {
        if (this.paginaActual > 1) this.paginaActual--;
      },
      paginaSiguiente() {
        this.paginaActual++;
      },
      zoomIn() {
        this.escala += 0.1;
      },
      zoomOut() {
        if (this.escala > 0.5) this.escala -= 0.1;
      }
    }
  };
  </script>
  
  <style>
  .lector-toolbar {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  </style>
  
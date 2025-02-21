<template>
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
  import * as pdfjsLib from 'pdfjs-dist';
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
        const loadingTask = pdfjsLib.getDocument(this.enlaceLibro);
        this.pdf = await loadingTask.promise;
        this.numPaginas = this.pdf.numPages;
        this.renderizarPagina(this.paginaActual);
      },
      async renderizarPagina(numPagina) {
        const page = await this.pdf.getPage(numPagina);
        const viewport = page.getViewport({ scale: this.escala });
        const canvas = this.$refs.pdfCanvas;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = { canvasContext: context, viewport };
        page.render(renderContext);
      },
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
  
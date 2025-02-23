<template>
    <div id="webViewerContainer">
        <div id="pageIndicator">Página: {{ currentPage }}</div>
        <div id="webViewer" ref="viewerDiv"></div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import WebViewer from '@pdftron/webviewer';

export default {
    name: 'WebViewer',
    setup() {
        const viewerDiv = ref(null);
        const currentPage = ref(1); // Página inicial
        const route = useRoute();

        // Obtener el PDF desde los parámetros de la URL
        const pdfSrc = '/lib/librosPrueba/Moby_Dick.pdf';

        onMounted(() => {
            const path = `${process.env.BASE_URL}lib`;
            WebViewer({
                path,
                initialDoc: pdfSrc, // Aqui usare la URL del pdf obtenida mediante la query params (ahora para probar lo pongo yo (Simon) estatico)
            }, viewerDiv.value).then(instance => {
                const { UI, Core } = instance;

                // Esto es para deshabilitar algunas pestañas y botones que no necesitamos
                UI.disableElements([
                    'toolbarGroup-Annotate',  // Pestaña "Annotate"
                    'toolbarGroup-Shapes',    // Pestaña "Shapes"
                    'toolbarGroup-Insert',    // Pestaña "Insert"
                    'toolbarGroup-Edit',      // Pestaña "Edit"
                    'toolbarGroup-FillAndSign', // Pestaña "Fill and Sign"
                    'toolbarGroup-Forms',     // Pestaña "Forms"
                    'annotationEditToolButton',
                    'panToolButton',
                    'view-controls-toggle-button',
                    'fileAttachmentPanel-tabPanel',
                    'layersPanel-tabPanel',
                    'thumbnailsPanel-tabPanel',
                    'page-nav-floating-header',

                ]);
                // Escuchar cambios en la página actual
                Core.documentViewer.addEventListener('pageNumberUpdated', (pageNumber) => {
                    currentPage.value = pageNumber;
                });             
                
            });
        });

        return { viewerDiv, currentPage };
    }
}
</script>

<style>
#webViewerContainer {
    position: relative;
    height: 100vh;
}

#pageIndicator {
    position: absolute;
    top: 10px;
    right: 45%;
    background-color: rgba(194, 144, 36, 0.7);
    color: rgb(255, 255, 255);
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 16px;
    z-index: 100;
}

#webViewer {
    height: 100vh;
}
</style>
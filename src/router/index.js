import { createRouter, createWebHistory } from "vue-router";
import { API_URL } from "@/config"; // Importamos la URL dinámica desde config.js

import LoginComponent from "@/components/LoginComponent.vue";
import InicioComponent from "@/components/InicioComponent.vue";
import ForoComponent from "@/components/ForoComponent.vue";
import DetallesComponent from "@/components/DetallesLibro.vue";
import AvisoLegalComponent from "@/components/AvisoLegalComponent.vue";
import PoliticaComponent from "@/components/PoliticaComponent.vue";
import ContactoComponent from "@/components/ContactoComponent.vue";
import WebViewer from "@/components/WebViewer.vue";
import EstadisticasComponent from "../components/EstadisticasComponent.vue";
import ListasComponent from "../components/ListasComponent.vue";
import CrearEditarListaComponent from "../components/CrearEditarListaComponent.vue";
import VerListaComponent from "../components/VerListaComponent.vue";
import PerfilComponent from "../components/PerfilComponent.vue";
import ChatbotComponent from "@/components/Chatbot.vue";  // Importa tu componente Chatbot

//import WebViewer from "@/components/WebViewer.vue";

const routes = [
  { path: "/", name: "Login", component: LoginComponent },
  { path: "/inicio", name: "Inicio", component: InicioComponent },
  { path: "/foro", name: "Foro", component: ForoComponent },
  { path: "/detalles/:id", name: "Detalles", component: DetallesComponent },
  { path: "/avisoLegal", name: "AvisoLegal", component: AvisoLegalComponent },
  { path: "/politica", name: "Politica", component: PoliticaComponent },
  { path: "/contacto", name: "Contacto", component: ContactoComponent },
  { path: "/verlista/:id/:usuario?", name: "VerLista", component: VerListaComponent }, 
  { path: "/lector", name: "WebViewer", component: WebViewer }, 
  {
    path: "/visor-pdf",
    name: "VisorPdf",
    component: WebViewer,
    props: (route) => ({
      pdfUrl: `${API_URL}/proxy-pdf?url=${route.query.url}`
    }),
    meta: { cleanLayout: true }
  },
  { path: "/estadisticas", name: "Estadisticas", component: EstadisticasComponent },
  { path: "/listas/:privacidad", name: "Listas", component: ListasComponent },
  { path: "/crearlista/:hacer/:nombre?", name: "CrearEditarLista", component: CrearEditarListaComponent },
  { path: "/perfil", name: "Perfil", component: PerfilComponent },
  //{ path: "/webviewer", name: "WebViewer", component: WebViewer }, 
  { path: "/chatbot", name: "Chatbot", component: ChatbotComponent },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// const routes = [
//   // otras rutas
//   {
//     path: '/visor-pdf',
//     name: 'VisorPdf',
//     component: () => import('@/components/WebViewer.vue'),
//     props: (route) => ({
//       pdfUrl: `http://localhost:3000/api/proxy-pdf?url=${route.query.url}` // ← línea exacta aquí
//     }),
//     meta: { cleanLayout: true }
//   },  
// ];

// const router = createRouter({
//   history: createWebHistory(),
//   routes,
// });

export default router;



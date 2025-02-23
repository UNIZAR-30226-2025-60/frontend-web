import { createRouter, createWebHistory } from "vue-router";
import LoginComponent from "@/components/LoginComponent.vue";
import InicioComponent from "@/components/InicioComponent.vue";
import ForoComponent from "@/components/ForoComponent.vue";
import DetallesComponent from "@/components/DetallesLibro.vue";
import AvisoLegalComponent from "@/components/AvisoLegalComponent.vue";
import PoliticaComponent from "@/components/PoliticaComponent.vue";
import ContactoComponent from "@/components/ContactoComponent.vue";
//import WebViewer from "@/components/WebViewer.vue";

const routes = [
  { path: "/", name: "Login", component: LoginComponent },
  { path: "/inicio", name: "Inicio", component: InicioComponent },
  { path: "/foro", name: "Foro", component: ForoComponent },
  { path: "/detalles/:id", name: "Detalles", component: DetallesComponent },
  { path: "/avisoLegal", name: "AvisoLegal", component: AvisoLegalComponent },
  { path: "/politica", name: "Politica", component: PoliticaComponent },
  { path: "/contacto", name: "Contacto", component: ContactoComponent },
  //{ path: "/webviewer", name: "WebViewer", component: WebViewer }, 
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

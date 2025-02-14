import { createRouter, createWebHistory } from "vue-router";
import LoginComponent from "@/components/LoginComponent.vue";
import InicioComponent from "@/components/InicioComponent.vue";
import ForoComponent from "@/components/ForoComponent.vue";

const routes = [
  { path: "/", name: "Login", component: LoginComponent },
  { path: "/inicio", name: "Inicio", component: InicioComponent },
  { path: "/foro", name: "Foro", component: ForoComponent },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

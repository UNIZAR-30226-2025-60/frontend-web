import { createRouter, createWebHistory } from "vue-router";
import LoginComponent from "@/components/LoginComponent.vue";
import InicioComponent from "@/components/InicioComponent.vue";

const routes = [
  { path: "/", name: "Login", component: LoginComponent },
  { path: "/inicio", name: "Inicio", component: InicioComponent },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

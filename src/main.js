import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import '@fortawesome/fontawesome-free/css/all.css';


import { API_URL, AUTH_URL, GOOGLE_REDIRECT_URI } from "./config"; // Asegurar que está importado

createApp(App).use(router).mount("#app");

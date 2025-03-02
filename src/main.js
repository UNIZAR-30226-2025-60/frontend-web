import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { faHeart } from '@fortawesome/free-regular-svg-icons';

library.add(faHeart);

import { API_URL, AUTH_URL, GOOGLE_REDIRECT_URI } from "./config"; // Asegurar que está importado

createApp(App).use(router).mount("#app");

App.component('font-awesome-icon', FontAwesomeIcon);
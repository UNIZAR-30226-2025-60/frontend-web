import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid, faUser, faChevronUp, faReply, faComment, faCaretDown, faBookOpen, faStar, faStarHalf, faPencil, faRightFromBracket, faArrowLeft, faFileWord, faClock } from '@fortawesome/free-solid-svg-icons';


library.add(
    faHeart,
    faHeartSolid,
    faUser,
    faChevronUp,
    faReply,
    faComment,
    faCaretDown,
    faBookOpen,
    faStar,
    faStarHalf,
    faPencil,
    faRightFromBracket,
    faArrowLeft,
    faFileWord,
    faClock
);

import { API_URL, AUTH_URL, GOOGLE_REDIRECT_URI } from "./config"; // Asegurar que está importado

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(router).mount('#app');
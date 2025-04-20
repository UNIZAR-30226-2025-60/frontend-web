<template>
  <!-- Aplicamos la clase según el modo claro/oscuro -->
  <div :class="darkMode ? 'dark-mode' : 'light-mode'" class="chatbot-wrapper">
    <!-- Barra de navegación con control del modo -->
    <NavBar :darkMode="darkMode" @toggle-dark-mode="toggleDarkMode"  :user="user"/>
    <!-- Solo muestra el contenido si ya está cargado -->
    <div v-if="!loading">
      <div class="container-fluid pt-4">
        <!-- Switch con iconos sol/luna -->
        <div class="theme-switch-wrapper mb-1">
          <div class="theme-switch" @click="toggleDarkMode">
            <div class="switch-track" :class="{ 'dark': darkMode }">
              <div class="switch-thumb" :class="{ 'dark': darkMode }">
                <!-- Icono de sol si está en modo claro -->
                <font-awesome-icon v-if="!darkMode" :icon="['fas', 'sun']" class="icon sun-icon"/>
                <!-- Icono de luna si está en modo oscuro -->
                <font-awesome-icon v-else :icon="['fas', 'moon']" class="icon moon-icon"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Contenedor del Chatbot -->
      <div class="chat-container">
        <div class="card-container">

          <!-- Cabecera con avatar e identificación -->
          <div class="card-header">
            <div class="img-avatar">
              <img src="../assets/chatBuot.png" alt="Chatbot Avatar" class="avatar" />
            </div>
            <div class="text-chat">Chatbot</div>
          </div>

          <!-- Cuerpo del chat -->
          <div class="card-body">
            <div class="input-group-wrapper">
              <div class="messages-container">

                <!-- Mostrar mensajes del historial -->
                <div v-for="(message, index) in messages" :key="index" :class="['message-box', message.sender]">
                  <p>{{ message.text }}</p>
                </div>
              </div>

              <!-- Mensaje inicial si no hay mensajes -->
              <div v-if="messages.length === 0" class="message-box bot">
                <p>Hola, soy tu asistente virtual. ¿En qué puedo ayudarte?</p>
              </div>

              <!-- Botones de ejemplo para interactuar rápido -->
              <div v-if="messages.length === 0" class="example-buttons">
                <button @click="addExampleMessage('¡Hola, Chatbot! ¿Puedes recomendarme libros de ciencia ficción?')">¡Hola, Chatbot! ¿Puedes recomendarme libros de ciencia ficción?</button>
                <button @click="addExampleMessage('¿Tienes algún dato interesante sobre mi última lectura?')">¿Tienes alguna recomendación de libros de historia?</button>
                <button @click="addExampleMessage('¿Me podrías contar más sobre Moby Dick?')">¿Me podrías contar más sobre Moby Dick?</button>
                <button @click="addExampleMessage('Cuentame un chiste de lectura')">Cuentame un chiste de lectura</button>
              </div>

              <!-- Formulario de envío de mensajes -->
              <div class="message-input">
                <form @submit.prevent="sendMessage">
                  <textarea 
                    v-model="userInput" 
                    placeholder="Escribe tu mensaje..." 
                    class="message-send"
                  ></textarea>
                  <button type="submit" class="button-send">Enviar</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pie de página -->
      <Footer :darkMode="darkMode" />
    </div>
    <div v-else>
      <!-- Componente de carga mientras se obtiene el usuario -->
      <Cargando :dark-mode="darkMode"></Cargando>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import NavBar from '@/components/NavBar.vue';
import Cargando from '@/components/Cargando.vue'
import Footer from '@/components/Footer.vue';
import { apiClient } from '../config';

export default {
  components: {
    NavBar,
    Footer,
    Cargando
  },
  data() {
    return {
      userInput: '',  // Entrada del usuario
      messages: [],  // Historial de mensajes
      userEmail: '',  // Aquí el correo del usuario que se obtendrá dinámicamente
      user: null,  // Aquí almacenamos los datos del usuario
      darkMode: localStorage.getItem("darkMode") === "true", // Obtener el tema guardado
      loading: true  // Estado de carga
    };
  },
  async mounted() {
    try {
      // Intenta obtener los datos del usuario autenticado
      const response = await apiClient.get("/user");
      this.user = response.data; // Guarda los datos del usuario si existe
      this.userEmail = this.user.correo;  // Guardar el correo en la variable userEmail
      console.log("Usuario autenticado:", this.user);
      if(this.user == ""){
        console.log("Usuario no autenticado");
        this.$router.push("/")
      }
    } catch (error) {
      // Si no hay usuario autenticado, simplemente continúa con los datos públicos
      console.error("Error al cargar los datos del usuario: ", error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    addExampleMessage(message) {
      this.userInput = message;  // Asigna el texto del botón al campo de entrada
    },

    async sendMessage() {
      if (this.userInput.trim() === '') return;

      // Agregar el mensaje del usuario al historial
      this.messages.push({ sender: 'user', text: this.userInput });

      try {
        // Llamar al backend para obtener los libros del usuario y enviar la consulta a Mistral
        const response = await apiClient.post('/recomendar', {
          userEmail: this.userEmail,
          userMessage: this.userInput,
        });

        // Agregar la respuesta del chatbot al historial
        this.messages.push({ sender: 'bot', text: response.data.response });
      } catch (error) {
        console.error('Error al comunicarse con la API:', error);
        this.messages.push({ sender: 'bot', text: 'Lo siento, ocurrió un error al procesar tu solicitud.' });
      }

      // Limpiar el campo de entrada
      this.userInput = '';
    },

    // Alterna entre modo oscuro y claro
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("darkMode", this.darkMode);
      this.applyTheme();
    },

    // Aplica las clases del tema al body
    applyTheme() {
      document.body.classList.toggle("dark-mode", this.darkMode);
      document.body.classList.toggle("light-mode", !this.darkMode);
    }
  }
};
</script>

<style scoped>
/* Estilo general del contenedor del chatbot */
.chatbot-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: space-between;
}

/* Contenedor principal del chat */
.chat-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 20px;
}

/* Estilos de la tarjeta en la que se encuentra el chatbot */
.card-container {
  background-color: var(--color-boton);
  border-radius: 12px;
  padding: 20px;
  margin: 20px;
  display: flex;
  flex-direction: column;
  width: 700px;
}

/* Cabecera con avatar e identificación del chatbot */
.card-header {
  display: flex;
  align-items: center;
  padding-bottom: 15px;
}

/* Avatar del chatbot */
.card-header .img-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 20px;
  background-color: var(--color-fondo);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Texto del nombre del chatbot */
.card-header .text-chat {
  color: var(--color-fondo);
  margin: 0;
  font-size: 22px;
}

/* Cuerpo del chat (mensajes + input) */
.card-body {
  flex: 1;
  overflow-y: auto;
  max-height: 450px;
  padding-bottom: 20px;
  max-width: 100%;
}

.input-group-wrapper {
  width: 100%;
  max-width: 100%;
}

/* Contenedor del historial de mensajes */
.messages-container {
  padding: 15px;
  margin-bottom: 10px;
  max-height: 100%;
  overflow-y: auto;
}

/* Estilo de los mensajes */
.message-box {
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 12px;
  font-size: 14px;
  max-width: 85%;
  word-wrap: break-word;
}

/* Mensajes del usuario alineados a la derecha */
.message-box.user {
  background-color: #f7d547 !important;
  color: #4b4737 !important;
  align-self: flex-end;
  border-radius: 12px 12px 0 12px;
  margin-left: auto;
}

/* Mensajes del bot alineados a la izquierda */
.message-box.bot {
  background-color: #d6d2bd;
  color: #4b4737;
  font-weight: bold;
  align-self: flex-start;
  border-radius: 12px 12px 12px 0;
}

/* Contenedor de los botones de ejemplo */
.example-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 10px;
  width: 100%;
}

/* Botones para mensajes rápidos */
.example-buttons button {
  background-color: #f7d547;
  color: #4b4737;
  font-family: inherit;
  padding: 0.4em 1em;
  font-weight: 900;
  font-size: 14px;
  border: 2px solid #4b4737;
  border-radius: 12px;
  box-shadow: 0.1em 0.1em;
  cursor: pointer;
  width: 100%;
}

.example-buttons button:hover {
  box-shadow: 0.15em 0.15em;
}

.example-buttons button:active {
  transform: translate(0.05em, 0.05em);
  box-shadow: 0.05em 0.05em;
}

.example-buttons,
.message-input form {
  width: 100%;
}

/* Área de entrada de mensaje y botón de envío */
.message-input {
  padding: 10px;
  border-top: 1px solid #a9a392;
}

/* Campo de texto del mensaje */
.message-input .message-send {
  align-content: center;
  width: 100%;
  padding: 12px;
  resize: none;
  background-color: #f1f1f1;
  color: #4b4737;
  border-radius: 10px;
  border-color: var(--color-fondo);
}

.message-input form {
  display: flex;
  flex-direction: column;
  align-items: center; 
  gap: 10px;
}

/* Botón de envío del mensaje */
.message-input .button-send {
  align-self: center;
  margin-top: 20px; 
  width: 150px; 
}

.message-input .button-send {
  background-color: #f7d547;
  color: #4b4737;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  margin-left: 10px;
  border-radius: 10px;
  font-size: 14px;
}

.message-input .button-send:hover {
  background-color: #f7d547;
  color: #4b4737;
}

/* Ancho sincronizado para elementos del input y botones */
.input-group-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.example-buttons {
  grid-column: 1 / -1;
}

.message-input {
  grid-column: 1 / -1;
}
</style>
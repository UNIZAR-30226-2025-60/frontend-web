<template>
  <div :class="darkMode ? 'dark-mode' : 'light-mode'" class="chatbot-wrapper">
    <!-- NavBar -->
    <NavBar :darkMode="darkMode" @toggle-dark-mode="toggleDarkMode"  :user="user"/>

    <!-- Contenedor del Chatbot -->
    <div class="chat-container">
      <div class="card-container">
        <div class="card-header">
          <div class="img-avatar"></div>
          <div class="text-chat">Chatbot</div>
        </div>
        <div class="card-body">
          <div class="messages-container">
            <!-- Mostrar mensajes del historial -->
            <div v-for="(message, index) in messages" :key="index" :class="['message-box', message.sender]">
              <p>{{ message.text }}</p>
            </div>
          </div>
          <div v-if="messages.length === 0" class="message-box bot">
            <p>Hola, soy tu asistente virtual. ¿En qué puedo ayudarte?</p>
          </div>
          <!-- Botones de ejemplo -->
          <div v-if="messages.length === 0" class="example-buttons">
            <button @click="addExampleMessage('¡Hola, Chatbot! ¿Puedes recomendarme libros de ciencia ficción?')">¡Hola, Chatbot! ¿Puedes recomendarme libros de ciencia ficción?</button>
            <button @click="addExampleMessage('¿Tienes algún dato interesante sobre mi última lectura?')">¿Tienes alguna recomendación de libros de historia?</button>
            <button @click="addExampleMessage('¿Me podrías contar más sobre Moby Dick?')">¿Me podrías contar más sobre Moby Dick?</button>
            <button @click="addExampleMessage('Cuentame un chiste de lectura')">Cuentame un chiste de lectura</button>
          </div>
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

    <!-- Footer -->
    <Footer :darkMode="darkMode" />
  </div>
</template>

<script>
import axios from 'axios';
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import { apiClient } from '../config';

export default {
  components: {
    NavBar,
    Footer
  },
  data() {
    return {
      userInput: '',
      messages: [],
      userEmail: '',  // Aquí el correo del usuario que se obtendrá dinámicamente
      user: null,  // Aquí almacenamos los datos del usuario
      darkMode: localStorage.getItem("darkMode") === "true", // Obtener el tema guardado
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
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("darkMode", this.darkMode);
      this.applyTheme();
    },
    applyTheme() {
      document.body.classList.toggle("dark-mode", this.darkMode);
      document.body.classList.toggle("light-mode", !this.darkMode);
    }
  }
};
</script>

<style scoped>
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

/* Estilos del chatbot */
.card-container {
  background-color: #f8f1cc;
  border-radius: 12px;
  padding: 20px;
  margin: 20px;
  display: flex;
  flex-direction: column;
  width: 450px;
  border: 1px solid #a9a392;
}

.card-header {
  display: flex;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #a9a392;
}

.card-header .img-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 20px;
  background-color: #6a6553;
}

.card-header .text-chat {
  color: #4b4737;
  margin: 0;
  font-size: 22px;
}

.card-body {
  flex: 1;
  overflow-y: auto;
  max-height: 450px;
  padding-bottom: 20px;
}

.messages-container {
  padding: 15px;
  margin-bottom: 10px;
  max-height: 100%;
  overflow-y: auto;
}

.message-box {
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 12px;
  font-size: 14px;
  max-width: 85%;
  word-wrap: break-word;
}

.message-box.user {
  background-color: #f7d547;
  color: #4b4737;
  align-self: flex-end;
  border-radius: 12px 12px 0 12px;
  margin-left: auto;
}

.message-box.bot {
  background-color: #d6d2bd;
  color: #4b4737;
  align-self: flex-start;
  border-radius: 12px 12px 12px 0;
}

.example-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.example-buttons button {
  background-color: #f9dd61;
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
  transform: translate(-0.05em, -0.05em);
  box-shadow: 0.15em 0.15em;
}

.example-buttons button:active {
  transform: translate(0.05em, 0.05em);
  box-shadow: 0.05em 0.05em;
}

.message-input {
  padding: 10px;
  border-top: 1px solid #a9a392;
}

.message-input .message-send {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  resize: none;
  background-color: #f1f1f1;
  color: #4b4737;
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

/* Modo oscuro */
.dark-mode .card-container {
  background-color: #343434;
}

.dark-mode .card-header .text-chat {
  color: #f8f1cc;
}

.dark-mode .message-box.user {
  background-color: #f7d547;
}

.dark-mode .message-box.bot {
  background-color: #bdbaba;
}

.dark-mode .message-input .message-send {
  background-color: #bdbaba;
  color: white;
}

.light-mode .card-container {
  background-color: #ead5a1;
}

.light-mode .message-box.user {
  background-color: #f7d547;
}

.light-mode .message-box.bot {
  background-color: #d6d2bd;
}

.light-mode .message-input .message-send {
  background-color: #f1f1f1;
  color: #4b4737;
}

.light-mode .chat-container {
  background-color: #f8f1cc;
}

.dark-mode .chat-container {
  background-color: #333;
}
</style>

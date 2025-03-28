<template>
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
</template>

<script>
import axios from 'axios';
import { apiClient } from '../config';

export default {
  data() {
    return {
      userInput: '',
      messages: [],
      userEmail: '',  // Aquí el correo del usuario que se obtendrá dinámicamente
      user: null,  // Aquí almacenamos los datos del usuario
    };
  },
  async mounted() {
    try {
      // Obtener los datos del usuario (incluido el correo)
      const response = await apiClient.get('/user');
      this.user = response.data;
      this.userEmail = this.user.correo;  // Guardar el correo en la variable userEmail
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
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
  },
};
</script>

<style scoped>
.card-container {
  background-color: var(--background-card); /* Colores dinámicos según el modo */
  border-radius: 10px;
  padding: 15px;
  margin: 20px;
  display: flex;
  flex-direction: column;
  width: 400px;
  border: 1px solid #ccc;
}

.card-header {
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
}

.card-header .img-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 20px;
  background-color: #333;
  /* Si quieres agregar una imagen, descomenta estas líneas y coloca tu imagen */
  /* background-image: url('/ruta/a/tu/imagen.jpg');
  background-size: cover;
  background-position: center; */
}

.card-header .text-chat {
  color: var(--text-color); /* Color dinámico según el modo */
  margin: 0;
  font-size: 20px;
}

.card-body {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
  padding-bottom: 15px;
}

.messages-container {
  padding: 15px;
  margin-bottom: 10px;
  max-height: 100%;
  overflow-y: auto;
}

.message-box {
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 10px;
  font-size: 13px;
  max-width: 80%;
  word-wrap: break-word;
}

.message-box.user {
  background-color: #046f2a; /* Verde del usuario */
  color: white;
  align-self: flex-end;
  border-radius: 10px 10px 0 10px; /* Esquinas redondeadas para el mensaje del usuario */
  margin-left: auto;
}

.message-box.bot {
  background-color: #444; /* Color oscuro para el bot */
  color: white;
  align-self: flex-start;
  border-radius: 10px 10px 10px 0; /* Esquinas redondeadas para el mensaje del bot */
}
.example-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Dos columnas */
  gap: 10px; /* Espacio entre botones */
  margin-top: 10px;
}

.example-buttons button {
  background: #fbca1f;
  font-family: inherit;
  padding: 0.4em 0.9em; /* Haciendo los botones más pequeños */
  font-weight: 900;
  font-size: 12px; /* Reducir el tamaño de la fuente */
  border: 3px solid black;
  border-radius: 0.4em;
  box-shadow: 0.1em 0.1em;
  cursor: pointer;
  width: 100%; /* Asegura que los botones ocupen todo el ancho de su celda */
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
  padding: 5px;
  border-top: 1px solid #ccc;
}

.message-input .message-send {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 10px;
  resize: none;
  background-color: var(--background-input); /* Fondo dinámico según el modo */
  color: var(--text-input); /* Color dinámico del texto */
}

.message-input .button-send {
  background-color: #046f2a;
  color: #fff;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  margin-left: 10px;
  border-radius: 10px;
  font-size: 13px;
}

.message-input .button-send:hover {
  background-color: #046f2a;
  color: #fff;
}

.dark-mode .card-container {
  background-color: #444;
}

.dark-mode .card-header .text-chat {
  color: #e3c377; /* Color del texto del header en modo oscuro */
}

.dark-mode .message-box.user {
  background-color: #046f2a; /* Verde del usuario */
}

.dark-mode .message-box.bot {
  background-color: #333;
}

.dark-mode .message-input .message-send {
  background-color: #333;
  color: white;
}

.light-mode .card-container {
  background-color: #fff;
}

.light-mode .message-box.user {
  background-color: #046f2a; /* Verde del usuario */
}

.light-mode .message-box.bot {
  background-color: #444;
}

.light-mode .message-input .message-send {
  background-color: #f1f1f1;
  color: #333;
}

:root {
  --background-card: #fff;
  --text-color: #333;
  --background-input: #f1f1f1;
  --text-input: #333;
}

.dark-mode {
  --background-card: #333;
  --text-color: #e3c377;
  --background-input: #444;
  --text-input: white;
}
</style>

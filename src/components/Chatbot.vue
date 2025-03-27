<template>
  <div class="chatbot">
    <div class="chat-window">
      <div v-for="(message, index) in messages" :key="index" :class="message.sender">
        <p>{{ message.text }}</p>
      </div>
    </div>
    <input v-model="userInput" @keyup.enter="sendMessage" placeholder="Escribe tu pregunta..." />
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
.chatbot {
  width: 400px;
  margin: 0 auto;
  border: 1px solid #ccc;
  padding: 10px;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
  border-radius: 10px;
}

.chat-window {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 10px;
  height: 300px;
  padding: 10px;
}

.user {
  text-align: right;
  color: #4caf50; /* Verde para el usuario */
}

.bot {
  text-align: left;
  color: #2196f3; /* Azul para el bot */
}

input {
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-top: 10px;
}

input:focus {
  outline: none;
  border-color: #2196f3;
}
</style>

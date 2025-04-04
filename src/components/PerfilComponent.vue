<template>
  <div v-if="user" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <!-- Franja de perfil -->
    <div class="profile-header">
      <div class="d-flex align-items-center py-3 ms-3">
        <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-3 clickable" @click="$router.back()"/>
        <h5 class="titulo m-0">Perfil</h5>
      </div>
    </div>
  
    <div class="py-3 ms-4">
      <!-- Botón de cambio de tema -->
      <button @click="toggleDarkMode" class="theme-toggle-btn">
        {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
      </button>
    </div>
    
    <div class="profile-container text-center">
      <!-- Foto de perfil - Modificado para manejar el caso cuando no hay foto -->
      <img v-if="user.foto_perfil" :src="user.foto_perfil" :key="user.foto_perfil" alt="Foto de perfil" class="profile-image mb-2">

    
      <!-- Mensaje de bienvenida -->
      <h4><strong>¡Bienvenid@ {{ user.nombre }}!</strong></h4>
      <p class="mb-4">{{ user.correo }}</p>
    
      <!-- Botones -->
      <div>
        <button class="btn mb-2" @click="editPassword"> 
          <font-awesome-icon :icon="['fas', 'pencil']" />
          Editar Contraseña
        </button>
      </div>
      <div>
        <button class="btn mb-2" @click="changeName">
          <font-awesome-icon :icon="['fas', 'pencil']" />
          Editar Nombre
        </button>
      </div>
      <div>
        <button class="btn mb-2" @click="showImageModal">
          <font-awesome-icon :icon="['fas', 'image']" />
          Cambiar Foto de Perfil
        </button>
      </div>
      <div>
        <button class="btn" @click="cerrarSesion">
          <font-awesome-icon :icon="['fas', 'right-from-bracket']" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  
    <!-- Modal para cambiar contraseña -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
      <div class="modal-content" :class="darkMode ? 'modal-dark' : 'modal-light'">
        <h5 class="mb-3">Editar contraseña</h5>
            
        <form @submit.prevent="cambiarContraseña">
          <div class="form-group">
            <label for="oldPassword">Contraseña actual:</label>
            <input type="password" id="oldPassword" v-model="passwordForm.oldPassword" class="form-input" required/>
          </div>
              
          <div class="form-group">
            <label for="newPassword">Nueva contraseña:</label>
            <input type="password" id="newPassword" v-model="passwordForm.newPassword" class="form-input" required/>
          </div>
              
          <div class="form-group">
            <label for="confirmPassword">Confirmar nueva contraseña:</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword" class="form-input" required/>
          </div>
              
          <div v-if="passwordMessage" :class="['message', passwordStatus ? 'success-message' : 'error-message']">
            {{ passwordMessage }}
          </div>
              
          <div class="button-group">
            <button type="submit" class="btn btn-save" :disabled="passwordLoading">
              {{ passwordLoading ? 'Guardando...' : 'Guardar' }}
            </button>
            <button type="button" class="btn btn-cancel" @click="closePasswordModal">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para cambiar nombre -->
    <div v-if="showNameModal" class="modal-overlay" @click.self="closeNameModal">
      <div class="modal-content" :class="darkMode ? 'modal-dark' : 'modal-light'">
        <h5 class="mb-3">Editar nombre</h5>
        
        <form @submit.prevent="guardarNuevoNombre">
          <div class="form-group">
            <label for="currentName">Nombre actual:</label>
            <input type="text" id="currentName" :value="user.nombre" class="form-input" disabled />
          </div>
          
          <div class="form-group">
            <label for="newName">Nuevo nombre:</label>
            <input type="text" id="newName" v-model="nameForm.newName" class="form-input" required />
          </div>
          
          <div v-if="nameMessage" :class="['message', nameStatus ? 'success-message' : 'error-message']">
            {{ nameMessage }}
          </div>
          
          <div class="button-group">
            <button type="submit" class="btn btn-save" :disabled="nameLoading">
              {{ nameLoading ? 'Guardando...' : 'Confirmar' }}
            </button>
            <button type="button" class="btn btn-cancel" @click="closeNameModal">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- Modal para cambiar foto de perfil -->
    <div v-if="CshowImageModal" class="modal-overlay" @click.self="hideImageModal">
      <div class="modal-content" :class="darkMode ? 'modal-dark' : 'modal-light'">
        <h5 class="mb-3">Selecciona una nueva foto de perfil</h5>
        <div class="image-grid">
          <div
            v-for="(imagen, index) in imagenes"
            :key="index"
            class="image-item"
            :class="{ selected: imagenSeleccionada === imagen.url }"
            @click="seleccionarImagen(imagen.url)"
          >
            <img :src="transformarURLGoogleDrive(imagen.url)" alt="Foto de perfil" class="image-preview" />
          </div>
        </div>
        <div class="button-group mt-3">
          <button class="btn btn-save" @click="guardarImagen">Guardar</button>
          <button class="btn btn-cancel" @click="hideImageModal">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <Cargando :dark-mode="darkMode"></Cargando>
  </div>
</template>
    
<script>
import axios from 'axios';
import Cargando from '@/components/Cargando.vue';
import { apiClient } from '../config';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Agregar íconos al sistema
library.add(fas);

export default {
  name: 'Perfil',
  components: {
    Cargando
  },
  data() {
    return {
      user: null,
      darkMode: localStorage.getItem("darkMode") === "true", // Obtener el tema guardado
          
      // Para modal de cambio de contraseña
      showPasswordModal: false,
      passwordForm: {
        correo: "",
        oldPassword: "",
        newPassword: ""
      },
      confirmPassword: "",
      passwordLoading: false,
      passwordMessage: "",
      passwordStatus: false,

      // Para modal de cambio de nombre
      showNameModal: false,
      nameForm: {
        newName: ""
      },
      nameLoading: false,
      nameMessage: "",
      nameStatus: false,
      CshowImageModal: false,
      imagenes: [],
      imagenSeleccionada: null,
    };
  },
  async mounted() {
    try {
      // Obtener información del usuario
      const response = await apiClient.get("/user");
      this.user = response.data;

      const response1 = await apiClient.get(`/usuario/${this.user.correo}`)
      this.user = response1.data;
      
      // Si el usuario tiene foto de perfil, procesarla
      if (this.user.foto_perfil) {
        console.log("Esta es su foto de perfil", this.user.foto_perfil);
        this.user.foto_perfil = this.transformarURLGoogleDrive(this.user.foto_perfil);
      } else {
        console.log("El usuario no tiene foto de perfil");
        this.user.foto_perfil = null;
      }
          
      // Asignar el correo del usuario al formulario
      if (this.user.correo) {
        this.passwordForm.correo = this.user.correo;
      }
    
      // Aplicar el tema guardado al cargar la página
      this.applyTheme();
    } catch (error) {
      console.error('Error al cargar el perfil del usuario:', error);
    }
  },
  methods: {
    // Función para transformar URLs de Google Drive
    transformarURLGoogleDrive(url) {
      if (!url) return null;

      try {
        // Extraer el ID del archivo de Google Drive
        const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
        
        if (match) {
          const id = match[1];
          // Nueva URL usando lh3.googleusercontent.com
          return `https://lh3.googleusercontent.com/d/${id}=w500`;
        }
        
        return url; // Si no es de Drive, devolver tal cual
      } catch (error) {
        console.error("Error al transformar URL:", error);
        return null;
      }
    },
    editPassword() {
      this.showPasswordModal = true;
    },
    closePasswordModal() {
      this.showPasswordModal = false;
      this.passwordForm.oldPassword = '';
      this.passwordForm.newPassword = '';
      this.confirmPassword = '';
      this.passwordMessage = '';
    },        
    async cambiarContraseña() {
      // Resetear mensaje
      this.passwordMessage = '';
          
      // Validar que las contraseñas coincidan
      if (this.passwordForm.newPassword !== this.confirmPassword) {
        this.passwordMessage = 'Las contraseñas no coinciden';
        this.passwordStatus = false;
        return;
      }
      
      try {
        this.passwordLoading = true;
 
        const response = await apiClient.post("/usuarios/usuario/cambiar-contrasena", {
          correo: this.user.correo,
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        });
            
        // Mostrar mensaje de éxito
        this.passwordMessage = response.data.mensaje || 'Contraseña actualizada correctamente';
        this.passwordStatus = true;
              
        // Limpiar formulario después de 2 segundos y cerrar modal
        setTimeout(() => {
          this.closePasswordModal();
        }, 2000);
        
      } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        this.passwordMessage = error.response?.data?.mensaje || 'Error al conectar con el servidor';
        this.passwordStatus = false;
      } finally {
        this.passwordLoading = false;
      }
    },
    changeName() {
      // Inicializar con el nombre actual
      this.nameForm.newName = this.user.nombre;
      this.showNameModal = true;
    },
    closeNameModal() {
      this.showNameModal = false;
      this.nameForm.newName = "";
      this.nameMessage = "";
    },
    async guardarNuevoNombre() {
      // Resetear mensaje
      this.nameMessage = '';
      
      // Validar que el nombre no esté vacío
      if (!this.nameForm.newName.trim()) {
        this.nameMessage = 'El nombre no puede estar vacío';
        this.nameStatus = false;
        return;
      }
      
      try {
        this.nameLoading = true;
        
        // Enviar petición al servidor para actualizar el nombre
        const response = await apiClient.post("/usuarios/usuario/cambiar-nombre", {
          correo: this.user.correo,
          nombre: this.nameForm.newName
        });
        
        // Actualizar el nombre en el objeto de usuario
        this.user.nombre = this.nameForm.newName;
        
        // Mostrar mensaje de éxito
        this.nameMessage = response.data.mensaje || 'Nombre actualizado correctamente';
        this.nameStatus = true;
        
        // Cerrar modal después de 1 segundo y medio
        setTimeout(() => {
          this.closeNameModal();
        }, 1500);
        
      } catch (error) {
        console.error('Error al cambiar nombre:', error);
        this.nameMessage = error.response?.data?.mensaje || 'Error al conectar con el servidor';
        this.nameStatus = false;
      } finally {
        this.nameLoading = false;
      }
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("darkMode", this.darkMode);
      this.applyTheme();
    },
    applyTheme() {
      document.body.classList.toggle("dark-mode", this.darkMode);
      document.body.classList.toggle("light-mode", !this.darkMode);
    },
    cerrarSesion() {
    // Eliminar cookies
    document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Limpiar localStorage
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");

    // Reiniciar el estado de la aplicación
    this.user = null;

    // Redirigir al login
    this.$router.push({ name: 'Login' });
  },
  async cargarImagenes() {
      try {
        const response = await apiClient.get("/usuarios/fotos-perfil");
        console.log("Imágenes cargadas: ", response.data);
        this.imagenes = response.data;
      } catch (error) {
        console.error("Error al cargar fotos de perfil:", error);
      }
    },
    showImageModal() {
      this.cargarImagenes();
      this.CshowImageModal = true;
      console.log("Modal abierto: ", this.CshowImageModal);
    },
    hideImageModal() {
      this.CshowImageModal = false;
      this.imagenSeleccionada = null;
    },
    seleccionarImagen(url) {
      this.imagenSeleccionada = url;
    },
    async guardarImagen() {
      if (!this.imagenSeleccionada) {
        alert("Debes seleccionar una imagen.");
        return;
      }
      try {
        const response = await apiClient.post("/usuario/cambiar-foto", {
          correo: this.user.correo,
          foto_perfil: this.imagenSeleccionada,
        });
        this.user.foto_perfil = this.transformarURLGoogleDrive(response.data.foto_perfil);
        alert("Foto de perfil actualizada correctamente.");
        this.hideImageModal();
      } catch (error) {
        console.error("Error al actualizar la foto de perfil:", error);
        alert("No se pudo actualizar la foto de perfil.");
      }
    },


  }
};
</script>
    
<style scoped>
.light-mode .profile-header {
  background-color: #343434; /* Modo claro */
  color: #ead5a1;
}
  
.dark-mode .profile-header {
  background-color: #e5c578; /* Modo oscuro */
  color: #000000;
}
  
/* Estilos del botón */
.theme-toggle-btn {
  background-color: #444;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
}
  
.btn {
  background-color: #444;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
}
  
.btn:hover {
  background-color: #666;
  color: #fff;
}
  
.profile-container {
  text-align: center;
  padding: 20px;
}
    
.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}
    
.profile-buttons {
  margin-top: 20px;
}
    
.profile-buttons button {
  margin: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
  
/* Colores modo oscuro */
.dark-mode {
  background-color: #343434;
  color: #ffffff;
}
  
.dark-mode .container {
  background-color: #343434;
  color: #ffffff;
}
  
/* Colores modo claro */
.light-mode {
  background-color: #ffffff;
  color: #000000;
}
  
.light-mode .container {
  background-color: #ead5a1;
  color: #000000;
}
  
.page-wrapper {
  min-height: 100vh;
}
  
.page-wrapper.dark-mode {
  background-color: #343434;
  color: #ffffff;
}
  
.page-wrapper.light-mode {
  background-color: #ead5a1;
  color: #000000;
}
  
.dark-mode .titulo {                   
  color: #343434;            
}
  
.light-mode .titulo {       
  color: #e3c377;             
}
  
/* Estilos para el modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  }
  
.modal-content {
  width: 90%;
  max-width: 500px;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
  
.modal-light {
  background-color: #ead5a1;
  color: #000000;
}
  
.modal-dark {
  background-color: #444;
  color: #ffffff;
}
  
.form-group {
  margin-bottom: 15px;
}
  
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
  
.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  background-color: #fff;
  color: #333;
}
  
.dark-mode .form-input {
  background-color: #333;
  color: #fff;
  border-color: #555;
}
  
.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
  
.btn-save {
  background-color: #4CAF50;
}
  
.btn-save:hover {
  background-color: #45a049;
}
  
.btn-save:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
  
.btn-cancel {
  background-color: #f44336;
}
  
.btn-cancel:hover {
  background-color: #d32f2f;
}
  
.message {
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
}
  
.success-message {
  background-color: #dff0d8;
  color: #3c763d;
}
  
.error-message {
  background-color: #f2dede;
  color: #a94442;
}

.clickable {
  cursor: pointer;
  pointer-events: auto; /* Asegura que el clic sea detectado */
}




.dark-mode .lista-banner {
  background-color: #444;
}
.dark-mode .lista-info {
  color: #ffffff;
}
.dark-mode .lista-tipo i {
  color: #f1c40f; /* Color del candado en modo oscuro */
}
.dark-mode .text-light {
  color: #ffffff;
}

.light-mode .lista-banner {
  background-color: #f8f9fa;
}
.light-mode .lista-info {
  color: #000000;
}
.light-mode .lista-tipo i {
  color: #888; /* Color del candado en modo claro */
}
.light-mode .text-dark {
  color: #000000;
}
.dark-mode .lista-banner {
  background-color: #444;
}
.dark-mode .lista-info {
  color: #ffffff;
}
.dark-mode .lista-tipo i {
  color: #f1c40f; /* Color del candado en modo oscuro */
}
.dark-mode .text-light {
  color: #ffffff;
}/* Estilos del modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;  /* Asegúrate de que esté por encima de otros elementos */
}

.modal-content {
  width: 90%;
  max-width: 500px;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  background-color: #fff;
  color: #000;
}

.modal-light {
  background-color: #ead5a1;
  color: #000;
}

.modal-dark {
  background-color: #444;
  color: #fff;
}

/* Agrega estos estilos */
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.image-item {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.image-item.selected {
  border-color: #4CAF50;
}

.image-preview {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.btn-save {
  background-color: #4CAF50 !important;
  margin-right: 10px;
}

.btn-cancel {
  background-color: #f44336 !important;
}
</style>
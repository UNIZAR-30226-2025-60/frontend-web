<template>
  <div v-if="user" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <!-- Franja de perfil -->
    <div class="profile-header">
      <h5 class="titulo py-3 ms-4">Perfil</h5>
    </div>
  
    <div class="py-3 ms-4">
      <!-- Botón de cambio de tema -->
      <button @click="toggleDarkMode" class="theme-toggle-btn mb-3">
        {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
      </button>
    </div>
    
    <div class="profile-container text-center">
      <!-- Foto de perfil -->
      <img :src="user.profilePicture" alt="Foto de perfil" class="profile-picture" />
    
      <!-- Mensaje de bienvenida -->
      <h4><strong>Bienvenido</strong></h4>
      <p>{{ user.nombre }}</p>
      <p class="mb-4">{{ user.correo }}</p>
    
      <!-- Botones -->
      <div>
        <button class="btn mb-2" @click="editPassword">Editar Contraseña</button>
      </div>
      <div>
        <button class="btn mb-2" @click="changeName">Cambiar Nombre</button>
      </div>
      <div>
        <button class="btn" @click="cerrarSesion">Cerrar Sesión</button>
      </div>
    </div>
  
    <!-- Modal para cambiar contraseña -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
      <div class="modal-content" :class="darkMode ? 'modal-dark' : 'modal-light'">
        <h3 class="mb-3">Cambiar Contraseña</h3>
            
        <form @submit.prevent="cambiarContraseña">
          <div class="form-group">
            <label for="oldPassword">Contraseña Actual</label>
            <input type="password" id="oldPassword" v-model="passwordForm.oldPassword" class="form-input" required/>
          </div>
              
          <div class="form-group">
            <label for="newPassword">Nueva Contraseña</label>
            <input type="password" id="newPassword" v-model="passwordForm.newPassword" class="form-input" required/>
          </div>
              
          <div class="form-group">
            <label for="confirmPassword">Confirmar Nueva Contraseña</label>
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
    <Footer></Footer>
  </div>
  <div v-else>
    <Cargando :dark-mode="darkMode"></Cargando>
  </div>
</template>
    
<script>
  import axios from 'axios';
  import Cargando from '@/components/Cargando.vue';
  import Footer from '@/components/Footer.vue';
  import { apiClient } from '../config';
    
  export default {
    name: 'Perfil',
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
          passwordStatus: false
        };
    },
    async mounted() {
      try {
        console.log("Componente montado.");
        // Obtener información del usuario
        const response1 = await apiClient.get("/user");
        this.user = response1.data;
          
        // Asignar el correo del usuario al formulario
        if (this.user && this.user.correo) {
          this.passwordForm.correo = this.user.correo;
        }
    
        // Aplicar el tema guardado al cargar la página
        this.applyTheme();
      } catch (error) {
        console.error('Error al cargar el perfil del usuario:', error);
      }
    },
    methods: {
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

        console.log("Correo:", this.passwordForm.correo);
        console.log("Contraseña actual:", this.passwordForm.oldPassword);
        console.log("Nueva contraseña:", this.passwordForm.newPassword);
        console.log("Confirmación:", this.confirmPassword)
          
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
            
          // Manejar la respuesta del servidor
          if (response.data.success) {
            this.passwordMessage = 'Contraseña actualizada correctamente';
            this.passwordStatus = true;
              
            // Limpiar formulario después de 2 segundos y cerrar modal
            setTimeout(() => {
              this.closePasswordModal();
              }, 2000);
          } else {
            this.passwordMessage = response.data.mensaje || 'Error al actualizar la contraseña';
            this.passwordStatus = false;
          }
        } catch (error) {
          console.error('Error al cambiar contraseña:', error);
          this.passwordMessage = error.response?.data?.mensaje || 'Error al conectar con el servidor';
          this.passwordStatus = false;
        } finally {
          this.passwordLoading = false;
        }
      },
      changeName() {
        console.log("Cambiar Nombre");
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
        localStorage.removeItem("userToken");
        this.$router.push({ name: 'Login' });
      }
    },
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
    
.profile-picture {
  border-radius: 50%;
  width: 150px;
  height: 150px;
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
</style>
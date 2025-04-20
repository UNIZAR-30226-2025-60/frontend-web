<template>
  <div v-if="!loading" :class="darkMode ? 'dark-mode' : 'light-mode'" class="page-wrapper">
    <NavBar :dark-mode="darkMode"  :user="user"></NavBar>
  
    <div class="header pt-4">
      <h4 class="titulo">PERFIL</h4>

      <!-- Switch con iconos sol/luna -->
      <div class="theme-switch-wrapper">
        <div class="theme-switch" @click="toggleDarkMode">
          <div class="switch-track" :class="{ 'dark': darkMode }">
            <div class="switch-thumb" :class="{ 'dark': darkMode }">
              <!-- Sol icono -->
              <font-awesome-icon v-if="!darkMode" :icon="['fas', 'sun']" class="icon sun-icon"/>
              <!-- Luna icono -->
              <font-awesome-icon v-else :icon="['fas', 'moon']" class="icon moon-icon"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container-fluid px-5 min-vh-100">
    <div class="profile-container text-center">
      <!-- Foto de perfil con ícono de lápiz en esquina inferior derecha -->
      <div class="profile-image-container">
        <img v-if="user.foto_perfil" :src="user.foto_perfil" :key="user.foto_perfil" alt="Foto de perfil" class="profile-image">
        
        <!-- Botón de lápiz en esquina inferior derecha -->
        <div class="btn-editar-perfil" @click="showImageModal">
          <font-awesome-icon :icon="['fas', 'pencil']" />
        </div>
      </div>
    
      <!-- Mensaje de bienvenida -->
      <h4><strong>¡Bienvenid@ {{ user.nombre }}!</strong></h4>
      <p class="mb-4">{{ user.correo }}</p>
    
      <!-- Botones -->
      <div v-if="!isGoogleUser">
        <button class="btn mb-2 w-25" @click="editPassword"> 
          <font-awesome-icon :icon="['fas', 'pencil']" />
          Editar contraseña
        </button>
      </div>
      <div>
        <button class="btn mb-2 w-25" @click="changeName">
          <font-awesome-icon :icon="['fas', 'pencil']" />
          Editar nombre
        </button>
      </div>
      <div>
        <button class="btn mt-3" @click="cerrarSesion">
          <font-awesome-icon :icon="['fas', 'right-from-bracket']" />
          Cerrar sesión
        </button>
      </div>
    </div>
  
    <!-- Modal para cambiar contraseña -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
      <div class="modal-content" :class="darkMode ? 'modal-dark' : 'modal-light'">
        <h5 class="mb-3">Editar contraseña</h5>
            
        <form @submit.prevent="cambiarContraseña">
          <div class="form-group mb-3">
            <label for="oldPassword">Contraseña actual:</label>
            <input type="password" id="oldPassword" v-model="passwordForm.oldPassword" class="form-input" required/>
          </div>
              
          <div class="form-group mb-3">
            <label for="newPassword">Nueva contraseña:</label>
            <input type="password" id="newPassword" v-model="passwordForm.newPassword" class="form-input" required/>
          </div>
              
          <div class="form-group mb-3">
            <label for="confirmPassword">Confirmar nueva contraseña:</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword" class="form-input" required/>
          </div>
              
          <div v-if="passwordMessage" :class="['message', passwordStatus ? 'success-message' : 'error-message']">
            {{ passwordMessage }}
          </div>
              
          <div class="button-group">
            <button type="button" class="btn modal-btn me-2" @click="closePasswordModal"> Cerrar </button>
            <button type="submit" class="btn modal-btn" :disabled="passwordLoading"> {{ passwordLoading ? 'Guardando...' : 'Guardar' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para cambiar nombre -->
    <div v-if="showNameModal" class="modal-overlay" @click.self="closeNameModal">
      <div class="modal-content" :class="darkMode ? 'modal-dark' : 'modal-light'">
        <h5 class="mb-3">Editar nombre</h5>
        
        <form @submit.prevent="guardarNuevoNombre">
          <div class="form-group mb-3">
            <label for="currentName">Nombre actual:</label>
            <input type="text" id="currentName" :value="user.nombre" class="form-input" disabled />
          </div>
          
          <div class="form-group mb-3">
            <label for="newName">Nuevo nombre:</label>
            <input type="text" id="newName" v-model="nameForm.newName" class="form-input" required />
          </div>
          
          <div v-if="nameMessage" :class="['message', nameStatus ? 'success-message' : 'error-message']">
            {{ nameMessage }}
          </div>
          
          <div class="button-group">
            <button type="button" class="btn modal-btn me-2" @click="closeNameModal"> Cerrar </button>
            <button type="submit" class="btn modal-btn" :disabled="nameLoading"> {{ nameLoading ? 'Guardando...' : 'Confirmar' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para cambiar foto de perfil -->
    <div v-if="CshowImageModal" class="modal-overlay" @click.self="hideImageModal">
    <div class="modal-dialog modal-wide">
      <div class="modal-content" :class="darkMode ? 'modal-dark' : 'modal-light'">
        <div class="modal-header">
          <h5 class="modal-title">Selecciona una nueva foto de perfil</h5>
        </div>

        <!-- El contenedor para las imágenes -->
        <div class="modal-body scrollable-body">
          <div class="image-grid">
            <div v-for="(imagen, index) in imagenes" :key="index" class="image-item" :class="{ selected: imagenSeleccionada === imagen.url }" @click="seleccionarImagen(imagen.url)">
              <img :src="transformarURLGoogleDrive(imagen.url)" alt="Foto de perfil" class="image-circle"/>
              <!-- Icono de lápiz sobre la imagen -->
              <i class="fas fa-pencil-alt edit-icon" @click.stop="editarImagen(imagen.url)"></i>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn modal-btn" @click="hideImageModal">Cerrar</button>
          <button class="btn modal-btn" @click="guardarImagen">Guardar</button>
        </div>
      </div>
    </div>
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
import NavBar from '@/components/NavBar.vue'
import Cargando from '@/components/Cargando.vue';
import Footer from '@/components/Footer.vue'
import { apiClient } from '../config';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Agregar íconos al sistema
library.add(fas);

export default {
  name: 'Perfil',
  components: {
    NavBar,
    Footer,
    Cargando,
    FontAwesomeIcon
  },
  data() {
    return {
      user: null,
      darkMode: localStorage.getItem("darkMode") === "true", // Obtener el tema guardado
      isGoogleUser: false,    
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
      loading: true
    };
  },
  async mounted() {
    try {
      // Obtener información del usuario
      const response = await apiClient.get("/user");
      this.user = response.data;

      const response1 = await apiClient.get(`/usuario/${this.user.correo}`)
      this.user = response1.data;
      const cookieEmail = this.getCookie("userEmail");
      if (cookieEmail && cookieEmail === this.user.correo) {
        // Si el correo coincide con la cookie, asumimos login con Google
        this.isGoogleUser = true;
      }
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
    } finally {
      this.loading = false;
    }
  },
  methods: {
    getCookie(name) {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    },
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
      // // Eliminar cookies
      // document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      // document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      apiClient.get('/logout').then(() => {
        // Limpiar localStorage
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");

        // Redirigir al inicio primero, antes de modificar this.user
        this.$router.push({ name: 'Inicio' }).then(() => {
          // Reiniciar el estado de la aplicación después de la navegación
          this.user = null;
        });
      }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
        // En caso de error, intentar navegar de todos modos
        this.$router.push({ name: 'Inicio' });
      });
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
    editarImagen(url) {
      // Esta función puede usarse si quieres añadir funcionalidad
      // específica al hacer clic en el ícono de lápiz de cada imagen
      this.seleccionarImagen(url);
    }
  }
};
</script>
    
<style scoped>
.button-group {
  display: flex;
  justify-content: flex-end;
}

/* Foto de perfil de usuario */    
.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}

/* Contenedor para la foto de perfil y el botón de edición */
.profile-image-container {
  position: relative;
  display: inline-block;
  border-radius: 50%;
}

/* Colores del borde modo claro*/
.light-mode .profile-image-container {
  border: 2px solid #4C4637;
}

/* Colores del borde modo oscuro*/
.dark-mode .profile-image-container {
  border: 2px solid #fbf1cd;
}

.btn-editar-perfil {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  z-index: 10;
}

/* Colores del botón modo claro */
.light-mode .btn-editar-perfil {
  background-color: #4c4637;
  color: #f8e79b;
}

.light-mode .btn-editar-perfil:hover {
  background-color: #4c4637;
  transform: scale(1.1);
}

/* Colores del botón modo oscuro */
.dark-mode .btn-editar-perfil {
  background-color: #fbf1cd;
  color: #4c4637;
}

.dark_mode .btn-editar-perfil:hover {
  background-color: #fbf1cd;
  transform: scale(1.1);
}
  
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
  
.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  background-color: #fff;
  color: #333;
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

.titulo {
  text-align: center;       
  font-weight: bold;    
  font-size: 2rem;        
  margin: 0;        
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 20px;
}

.modal-wide {
  max-width: 450px;
  width: 100%;
  margin: auto;
}

/* El body del modal ocupa el espacio restante y tiene scroll */
.scrollable-body {
  overflow-y: auto;
  padding: 10px;
  max-height: 400px;
}

.modal-footer {
  padding: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #ddd;
  background-color: inherit;
}

/* Grid de imágenes */
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  justify-items: center;
}

/* Imágenes redondas */
.image-circle {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: border 0.3s;
}

.image-item.selected .image-circle {
  border: 3px solid #ffc107;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
  margin-bottom: 15px;
}
</style>
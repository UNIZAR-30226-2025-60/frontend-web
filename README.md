# 🌐 Bookly - Frontend Web

Frontend web de la plataforma **Bookly**, desarrollado en **Vue**. Consume la API del backend y permite funcionalidades como navegación por libros, reseñas, gestión de listas, login con Google y lectura de PDF integrada.  

Cuenta con detección automática del entorno (local o producción) para ajustar rutas de API y autenticación, centralizado en un archivo `config.js`.

- **Framework:** Vue
- **Lenguajes:** Vue, JavaScript, HTML, CSS
- **Gestión de paquetes:** npm
- **CI/CD:** COMPLETAR 

---

## 📁 Estructura del Proyecto

- **📁 public/** → Archivos estáticos públicos
- **📁 src/**
  - **📁 assets/** → Imágenes y estilos globales
  - **📁 components/** → Componentes reutilizables y vistas
  - **📁 services/** → Lógica de peticiones HTTP
  - **📄 App.vue** → Componente raíz que renderiza las vistas
  - **📄 main.js** → Punto de entrada, configura router, estilos y fuentes
  - **📄 config.js** → Rutas dinámicas de API, autenticación y Google Redirect
  - **📁 router/**
    - **📄 index.js** → Configuración de rutas de la SPA
- **📄 .env** → Variables de entorno
- **📄 jsconfig.js** → Alias para importar desde `/src`
- **📄 package.json** → Dependencias y scripts del proyecto
- **📄 vue.config.js** → Configuración general

---

## 🔧 Instalación y entorno local

### 1. Crear archivo `.env` en la raíz con el siguiente contenido:

```bash
VUE_APP_API_URL=http://localhost:3000/api
VUE_APP_RENDER_API_URL=https://backend-dcy8.onrender.com/api
VUE_APP_AUTH_URL=http://localhost:3000/auth
VUE_APP_RENDER_AUTH_URL=https://backend-dcy8.onrender.com/auth
VUE_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
VUE_APP_RENDER_GOOGLE_REDIRECT_URI=https://backend-dcy8.onrender.com/auth/google/callback
```

### 2. Instalar dependencias

- Tener Node.js y npm instalados
```bash
npm install
npm install -g @vue/cli
npm install axios
npm install vue-router@4
npm install bootstrap @popperjs/core
npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/free-regular-svg-icons @fortawesome/vue-fontawesome
```

### 3. Iniciar la web en local

```
npm run serve
```

Obtendremos lo siguiente:
```
App running at:
- Local:   http://localhost:8081/
- Network: http://192.168.1.13:8081/
```

Seleccionamos local para acceder desde local como su nombre indica o Network para acceder desde Render.

## 🌐 Acceder a la web desplegada

No se si se puede, si es así descibir cómo, sino BORRAR

<template>
  <footer class="footer text-center">  <!-- Pie de página del sitio -->
    <div class="container">
      <!-- Sección de enlaces legales y de contacto -->
      <section>
        <div class="row text-center d-flex justify-content-center pt-4">

          <!-- Enlace a Aviso Legal -->
          <div class="col-md-2">
            <h6 class="text-uppercase">
              <a href="#" class="footer-link" @click="goToAvisoLegal">Aviso Legal</a>
            </h6>
          </div>

          <!-- Enlace a Política de Privacidad -->
          <div class="col-md-2">
            <h6 class="text-uppercase">
              <a href="#" class="footer-link" @click="goToPolitica">Política de Privacidad</a>
            </h6>
          </div>

          <!-- Enlace a la página de Contacto -->
          <div class="col-md-2">
            <h6 class="text-uppercase">
              <a href="#" class="footer-link" @click="goToContacto">Contacto</a>
            </h6>
          </div>
        </div>
      </section>
    </div>

    <!-- Sección final de copyright -->
    <div class="footer-bottom mt-2">
      <p>© 2025 Bookly - Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",
  methods: {
    // Navega a la ruta de Aviso Legal
    goToAvisoLegal() {
        this.$router.push('/avisoLegal');
    },

    // Navega a la ruta de Política de Privacidad
    goToPolitica() {
        this.$router.push('/politica');
    },

    // Navega a la ruta de Contacto
    goToContacto() {
        this.$router.push('/contacto');
    }
  }
};
</script>

<style scoped>
/* Estilos generales del footer */
.footer {
  background-color: #2c2c2c;
  color: #f1f1f1;
  font-size: 14px;
}

/* Estilo de los enlaces dentro del footer */
.footer-link {
  color: #e5c578;
  text-decoration: none;
  transition: color 0.3s ease-in-out;
  cursor: pointer;
}

.footer-link:hover {
  color: #ffcc00;
}

/* Parte inferior del footer con derechos de autor */
.footer-bottom {
  background-color: #1f1f1f;
  padding: 10px 0;
  font-size: 12px;
  text-align: center;
  color: #ccc;
}
</style>
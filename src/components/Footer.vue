<template>
  <footer class="footer text-center">
    <div class="container">
      <!-- Sección de enlaces -->
      <section>
        <div class="row text-center d-flex justify-content-center pt-4">
          <div class="col-md-2">
            <h6 class="text-uppercase">
              <a href="#" class="footer-link" @click="mostrarAvisoLegal">Aviso Legal</a>
            </h6>
          </div>
          <div class="col-md-2">
            <h6 class="text-uppercase">
              <a href="#" class="footer-link" @click="mostrarPolitica">Política de Privacidad</a>
            </h6>
          </div>
          <div class="col-md-2">
            <h6 class="text-uppercase">
              <a href="#" class="footer-link" @click="mostrarContacto">Contacto</a>
            </h6>
          </div>
        </div>
      </section>

      <hr class="divider" />

      <!-- Sección de redes sociales -->
      <section class="social-icons">
        <a href="#" class="social-link"><i class="fab fa-facebook-f"></i></a>
        <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
        <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
        <a href="#" class="social-link"><i class="fab fa-linkedin-in"></i></a>
      </section>
    </div>

    <!-- Copyright -->
    <div class="footer-bottom">
      <p>© 2024 Bookly - Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",
  methods: {
    mostrarAvisoLegal() {
      alert("📜 Aviso Legal: Aquí iría la información legal de la plataforma.");
    },
    mostrarPolitica() {
      alert("🔐 Política de Privacidad: Información sobre cómo protegemos tus datos.");
    },
    mostrarContacto() {
      alert("📩 Contacto: Puedes escribirnos a contacto@bookly.com");
    }
  }
};
</script>

<style scoped>
.footer {
  background-color: #2c2c2c;
  color: #f1f1f1;
  padding: 20px 0;
  font-size: 14px;
}

.footer-link {
  color: #e5c578;
  text-decoration: none;
  transition: color 0.3s ease-in-out;
  cursor: pointer;
}

.footer-link:hover {
  color: #ffcc00;
}

.divider {
  width: 60%;
  margin: 20px auto;
  border-top: 1px solid #444;
}

.social-icons {
  margin: 15px 0;
}

.social-link {
  color: #f1f1f1;
  font-size: 18px;
  margin: 0 10px;
  transition: color 0.3s ease-in-out;
}

.social-link:hover {
  color: #ffcc00;
}

.footer-bottom {
  background-color: #1f1f1f;
  padding: 10px 0;
  font-size: 12px;
  text-align: center;
  color: #ccc;
}
</style>
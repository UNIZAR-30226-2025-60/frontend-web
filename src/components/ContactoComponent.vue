<template>
    <NavBar></NavBar>
    <section class="container-fluid pt-5 p-5 text-white min-vh-100" style="background-color: #343434;">  
      <h2 class="section-title text-center mb-5">Contáctanos</h2>
        <div class="row">
          <div class="col-md-6">
            <h3 class="mb-4">Información de contacto</h3>
            <p class="mb-4">Si tienes alguna duda o sugerencia, no dudes en contactarnos.</p>
            <p class="mb-4">Correo electrónico: <a href="mailto:contacto@bookly.com">contacto@bookly.com</a></p>
            <p class="mb-4">Teléfono: <a href="tel:+123456789">+123 456 789</a></p>
            <p class="mb-4">Dirección: Calle Viena 123, España</p>
            <p class="mb-4">Horario de atención: Lunes a Viernes de 9:00 a 18:00</p>
          </div>
        </div>
    </section>
</template>
  
<script setup>
    import NavBar from '@/components/NavBar.vue'
</script>
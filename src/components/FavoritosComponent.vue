<template>
<NavBar></NavBar>

<Footer></Footer>
</template>
  
<script>
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import { apiClient } from '../config';


export default {
  name: 'Detalles',
  components: {
    NavBar,
    Footer
  },
  data() {
    return {
      user: null,
      }
    },
  async mounted() {
    try {
      const response1 = await apiClient.get("/user"); // Llamada a usuario
      this.user = response1.data;
    } 
    catch (error) {
      console.error('Error al cargar la pagina de favoritos', error);
    }
  }
}
</script>
  
<style scoped>

</style>
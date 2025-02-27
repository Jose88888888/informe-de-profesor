<script setup>
/*import { computed } from 'vue';  
const user=computed(() => {
  if(localStorage.getItem('userid')){
    return true;
  }else{
    return false;
  }
})
*/


</script>

<template>
  <div>
 

    <nav class="navbar"> //nav class="navbar" v-if="user" es para ocultar el navbar en el login
      <ul>
        <li><router-link to="/Home">Inicio</router-link></li>
        <li><router-link to="/inicioinforme">Parcial</router-link></li>
        <li><router-link to="/horasxtrabajo">Inicio de cuatrimestre</router-link></li>
        <li><router-link to="/horasxactividad">Semanales</router-link></li>
        <li><router-link to="/actividadesespe">Especializadas</router-link></li>
        <li><router-link to="/otrasacti">Otras</router-link></li>
        <li><router-link to="/reportefinal">Reporte final</router-link></li>
      </ul>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style>

#app {
  background-image: url('/img/utz.png'); /* Ruta de la imagen */
  background-size: cover; /* Ajusta la imagen para que cubra toda la pantalla */
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed; /* Hace que el fondo permanezca fijo al hacer scroll */
  min-height: 150vh; /* Asegura que siempre cubra toda la pantalla */
  display: flex;
  flex-direction: column;
}

.navbar ul {

  display: flex;
  list-style: none;
  background: #333;
  padding: 10px;
}
.navbar ul li {
  margin: 0 10px;
}
.navbar ul li a {
  color: white;
  text-decoration: none;
}
</style>


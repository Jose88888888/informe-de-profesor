<script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div>
    <nav class="navbar">
      <ul>
        <li><router-link to="/">Inicio</router-link></li>
        <li><router-link to="/horasxtrabajo">Inicio de Cuatrimestre</router-link></li>
        <li><router-link to="/horasxactividad">Semanales</router-link></li>
        <li><router-link to="/actividadesespe">Actividades especializadas</router-link></li>
        <li><router-link to="/otrasacti">Otras actividades</router-link></li>
        <li><router-link to="/reportefinal">Reporte final</router-link></li>
      </ul>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style>
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


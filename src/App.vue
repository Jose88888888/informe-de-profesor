<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';


const router = useRouter();
const route = useRoute();

// Estado reactivo para auth
const authState = ref({
  isLoggedIn: false,
  userRole: ''
});

// Función para actualizar el estado de autenticación
const updateAuthState = () => {
  console.log("Actualizando estado de auth");
  const token = localStorage.getItem('access-token');
  const userId = localStorage.getItem('userid');
  const rol = localStorage.getItem('userrol');
  
  console.log("Token:", token);
  console.log("UserId:", userId);
  console.log("Rol:", rol);
  
  authState.value.isLoggedIn = !!token && !!userId;
  authState.value.userRole = rol || '';
};

// Actualizar cuando cambia la ruta
watch(route, () => {
  updateAuthState();
});

// Actualizar al montar el componente
onMounted(() => {
  updateAuthState();
});

// Computed properties basadas en el estado reactivo
const isAuthenticated = computed(() => authState.value.isLoggedIn);
const isProfesor = computed(() => authState.value.userRole === 'profesor');
const isAdmin = computed(() => authState.value.userRole === 'admin');

// Función para cerrar sesión
const logout = () => {
  localStorage.removeItem('userid');
  localStorage.removeItem('access-token');
  localStorage.removeItem('userrol');
  localStorage.removeItem('usercorreo');
  localStorage.removeItem('usernombre');
  localStorage.removeItem('userempleado');
  localStorage.removeItem('id_informe');
  
  // Actualizar estado
  updateAuthState();
  
  // Redireccionar al login
  router.push('/');
};
</script>

<template>
  <div>
    <!-- Banner con logo y texto -->
    <div class="header-container" v-if="isAuthenticated">
      <div class="banner">
        <img src="/img/Logotipo.png" alt="Logo" class="logo-img">
      </div>
      <div class="text">
        <h1>Informe del profesor de tiempo completo</h1>
      </div>
    </div>

    <!-- Navbar para Profesores -->
    <nav class="navbar" v-if="isAuthenticated && isProfesor"> 
      <ul>
        <li><router-link to="/Home">Inicio</router-link></li>
        <li><router-link to="/inicioinforme">Inicio de cuatrimestre</router-link></li>
        <li><router-link to="/horasxtrabajo">Datos cuatrimestrales</router-link></li>
        <li><router-link to="/horasxactividad">Semanales</router-link></li>
        <li><router-link to="/actividadesespe">Extraordinarios</router-link></li>
        <li><router-link to="/otrasacti">Otras</router-link></li>
        <li><router-link to="/reportefinal">Reporte final</router-link></li>
        <li><a href="#" @click.prevent="logout">Cerrar Sesión</a></li>
      </ul>
    </nav>

    <!-- Navbar para Administradores -->
    <nav class="navbar" v-if="isAuthenticated && isAdmin"> 
      <ul>
        <li><router-link to="/homeadmin">Dashboard</router-link></li>
        <li><router-link to="/adminuser">Gestión de usuarios</router-link></li>
        <li><router-link to="/adminacti">Gestión de actividades</router-link></li>
        <li><router-link to="/admininforme">Historial de informes</router-link></li>
        <li><a href="#" @click.prevent="logout">Cerrar Sesión</a></li>
      </ul>
    </nav>

    <!-- Contenido principal -->
    <router-view></router-view>
  </div>
</template>

<style>
#app {
  background: #c2c2c2;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  min-height: 150vh;
  display: flex;
  flex-direction: column;
}

/* Estilos para el contenedor del header */
.header-container {
  display: flex;
  align-items: center;
  background-color: #c2c2c2;
  padding: 10px 20px;
}

/* Estilos para el banner */
.banner {
  display: flex;
  justify-content: left;
}

.logo-img {
  max-height: 100px;
  width: auto;
}

/* Estilos para el texto */
.text {
  flex-grow: 1;
  text-align: center;
}

.text h1 {
  margin: 0;
  font-size: 24px;
  text-transform: uppercase;
  color: #000;
}

/* Estilos para el navbar */
.navbar ul {
  display: flex;
  list-style: none;
  background: #000000;
  padding: 10px;
  margin: 0;
}

.navbar ul li {
  margin: 0 10px;
}

.navbar ul li a {
  color: white;
  text-decoration: none;
}
</style>
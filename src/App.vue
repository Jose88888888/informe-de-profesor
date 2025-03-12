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
        <!-- Aquí agrega las demás rutas para administradores -->
        <li><a href="#" @click.prevent="logout">Cerrar Sesión</a></li>
      </ul>
    </nav>

    <!-- Contenido principal -->
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


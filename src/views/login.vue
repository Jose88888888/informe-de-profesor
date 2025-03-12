<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

// Estado
const empleado = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();

// Función de inicio de sesión
const login = async () => {
  try {
    const response = await axios.post("http://localhost:3000/api/login", {
      empleado: empleado.value,
      password: password.value,
    });
   
    const user = response.data.usuario;

    // Guardar datos en localStorage
    localStorage.setItem("userid", response.data.id_usuario);
    localStorage.setItem("usercorreo", response.data.correo);
    localStorage.setItem("usernombre", response.data.nombre);
    localStorage.setItem("userempleado", response.data.empleado);
    localStorage.setItem("userrol", response.data.rol.trim());
    localStorage.setItem('id_informe', response.data.id_informe);
    localStorage.setItem('usercarrera', response.data.carrera);
    localStorage.setItem("access-token", response.data.token);

    // Añade esto después de recibir la respuesta
console.log("Respuesta del servidor:", response.data);
console.log("Rol recibido:", response.data.rol);

// Y después de guardar en localStorage
console.log("Rol guardado:", localStorage.getItem("userrol"));

    if (response.data.token) {
      localStorage.setItem("access-token", response.data.token); // Corregido: "acces-token" -> "access-token"
    }

    // Redirección según el rol
    if (response.data.rol === "admin") {
      router.push("/homeadmin"); // Asegúrate de que esta ruta existe en tu router
    } else if (response.data.rol === "profesor") {
      router.push("/Home");
    }
  } catch (err) {
    error.value = err.response?.data?.error || "Error en el inicio de sesión";

    // Limpiar localStorage en caso de error
    localStorage.removeItem("userid");
    localStorage.removeItem("access-token");
  }
};

// Verificar sesión activa al cargar
onMounted(() => {
  const userId = localStorage.getItem("userid");
  const userRol = localStorage.getItem("userrol");

  if (userId) {
    if (userRol === "admin") {
      router.push("/homeadmin");
    } else if (userRol === "profesor") {
      router.push("/Home");
    }
  }
});
</script>

<template>
  <div class="login-container">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="empleado">Número de Empleado:</label>
        <input type="text" id="empleado" v-model="empleado" required class="input" />
      </div>

      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" id="password" v-model="password" required class="input" />
      </div>

      <button type="submit" class="btn-login">Ingresar</button>
    </form>

    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.btn-login {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
}

.btn-login:hover {
  background-color: #0056b3;
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>

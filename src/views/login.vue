<script>
import axios from "axios";

export default {
  data() {
    return {
      empleado: "",
      password: "",
      error: "",
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post("http://localhost:3000/api/login", {
          empleado: this.empleado,
          password: this.password,
        });
        
        // Guardar la información del usuario en localStorage
        const userInfo = {
          id: response.data.id_usuario || response.data.id, // Depende de cómo se llame el campo en tu API
          empleado: response.data.empleado || this.empleado,
          nombre: response.data.nombre || response.data.nombreCompleto || "Usuario", // Adapta según tu respuesta de API
          rol: response.data.rol
        };
        
        // Guardar en localStorage como string JSON
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        // También puedes guardar el token si tu API lo devuelve
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }

        // Redireccionar según el rol
        if (response.data.rol === "admin") {
          this.$router.push("/admin");
        } else if (response.data.rol === "profesor") {
          this.$router.push("/profesor");
        }
      } catch (error) {
        this.error =
          error.response?.data?.error || "Error en el inicio de sesión";
          
        // Limpiar localStorage en caso de error
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
      }
    },
  },
  // Verificar si ya hay una sesión activa al cargar el componente
  created() {
    // Si ya existe información de usuario en localStorage, redireccionar
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (user.rol === "admin") {
        this.$router.push("/admin");
      } else if (user.rol === "profesor") {
        this.$router.push("/profesor");
      }
    }
  }
};
</script>

<template>
  <div class="login-container">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="empleado">Número de Empleado:</label>
        <input
          type="text"
          id="empleado"
          v-model="empleado"
          required
          class="input"
        />
      </div>

      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          class="input"
        />
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
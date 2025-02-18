<template>
    <div class="contenedor__todo">
      <!-- Sección trasera -->
      <div class="caja__trasera">
        <div class="caja__trasera-login" v-show="!loginActivo">
        
        </div>
        <div class="caja__trasera-register" v-show="loginActivo">
          <h3>¿Aún no tienes una cuenta?</h3>
          <p>Regístrate para que puedas iniciar sesión</p>
          <button @click="register">Registrarse</button>
        </div>
      </div>
  
      <!-- Contenedor de formularios -->
      <div class="contenedor__login-register" :class="{ 'deslizar': loginActivo }">
        <!-- Formulario de Login -->
        <form class="formulario__login" v-if="!loginActivo">
          <h2>Iniciar Sesión</h2>
          <input type="text" v-model="username" placeholder="Usuario">
          <input type="password" v-model="password" placeholder="Contraseña">
          <button type="button" @click="validarLogin">Entrar</button>
        </form>
  
        <!-- Formulario de Registro -->
        <form class="formulario__register" v-if="loginActivo">
          <h2>Registrarse</h2>
          <input type="text" placeholder="Correo Electrónico">
          <input type="text" placeholder="Nombre">
          <input type="text" placeholder="Número de empleado">
          <input type="password" placeholder="Contraseña">
          <button>Registrarse</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        loginActivo: false, // Controla qué formulario se muestra
        username: "",
        password: "",
      };
    },
    methods: {
      iniciarSesionAnimacion() {
        this.loginActivo = false;
      },
      register() {
        this.loginActivo = true;
      },
      validarLogin() {
        if (this.username === "admin" && this.password === "1234") {
          alert("Inicio de sesión exitoso");
          this.$router.push("/index"); // Redirige a otra vista en Vue Router
        } else {
          alert("Credenciales incorrectas");
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .contenedor__todo {
    position: relative;
    width: 100%;
    max-width: 800px;
    margin: auto;
  }
  
  .caja__trasera {
    display: flex;
    justify-content: space-between;
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
  }
  
  .caja__trasera-login,
  .caja__trasera-register {
    width: 50%;
    text-align: center;
    padding: 20px;
  }
  
  .contenedor__login-register {
    position: relative;
    width: 100%;
    max-width: 400px;
    margin: auto;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.5s ease-in-out;
  }
  
  .deslizar {
    transform: translateX(100%);
  }
  
  .formulario__login,
  .formulario__register {
    display: flex;
    flex-direction: column;
  }
  
  input {
    margin-bottom: 15px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  button {
    padding: 10px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    background: #28a745;
    color: white;
    margin-top: 10px;
  }
  
  button:hover {
    background: #218838;
  }
  </style>
  
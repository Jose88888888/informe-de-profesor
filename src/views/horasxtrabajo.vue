<template>
    <div class="container">
      <h2 class="title">Registrar Actividad</h2>
      <form @submit.prevent="submitForm" class="form">
        <label for="grupos">Número de grupos asignados:</label>
        <input type="number" id="grupos" v-model.number="formData.grupos" class="input" />
  
        <label for="horasClase">Horas de clase:</label>
        <input type="number" id="horasClase" v-model.number="formData.horasClase" class="input" />
  
        <label for="horasCoordinacion">Horas de coordinación académica:</label>
        <input type="number" id="horasCoordinacion" v-model.number="formData.horasCoordinacion" class="input" />
  
        <label for="proyectos">Número de proyectos de estadía asignados:</label>
        <input type="number" id="proyectos" v-model.number="formData.proyectos" class="input" />
  
        <label for="horasProyecto">Horas de proyecto de estadías:</label>
        <input type="number" id="horasProyecto" v-model.number="formData.horasProyecto" class="input" />
  
        <div class="buttons">
          <button type="submit" class="btn-submit">Enviar</button>
          <button type="button" @click="resetForm" class="btn-reset">Limpiar</button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        formData: {
          grupos: null,
          horasClase: null,
          horasCoordinacion: null,
          proyectos: null,
          horasProyecto: null,
        },
      };
    },
    methods: {
      submitForm() {
        console.log("Datos enviados:", this.formData);
        alert("Formulario enviado correctamente");
      },
      resetForm() {
        this.formData = {
          grupos: null,
          horasClase: null,
          horasCoordinacion: null,
          proyectos: null,
          horasProyecto: null,
        };
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 400px;
    margin: auto;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  .title {
    text-align: center;
    margin-bottom: 20px;
  }
  .form {
    display: flex;
    flex-direction: column;
  }
  .input {
    margin-bottom: 15px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  .buttons {
    display: flex;
    justify-content: space-between;
  }
  .btn-submit, .btn-reset {
    padding: 10px 15px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
  }
  .btn-submit {
    background: #28a745;
    color: white;
  }
  .btn-reset {
    background: #dc3545;
    color: white;
  }
  </style>
  
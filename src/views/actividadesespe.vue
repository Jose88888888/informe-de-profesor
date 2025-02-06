<template>
    <div class="container">
      <h2 class="title">Registro de actividades</h2>
      <form @submit.prevent="submitForm" class="form">
        <label for="promocion">Hora de actividades de promocion:</label>
        <input type="text" id="promocion" v-model="formData.promocion" class="input" />
  
        <label for="estadias"> Horas de horas Coordinacion de estadias:</label>
        <input type="number" id="estadias" v-model.number="formData.estadias" class="input" />
  
        <label for="diaspromo">Dias de promocion:</label>
        <input type="number" id="diaspromo" v-model.number="formData.diaspromo" class="input" />
  
        <label for="proyectos_inte">Horas de horas Coordinacion de proyectos integradores:</label>
        <input type="number" id="proyectos_inte" v-model.number="formData.proyectos_inte" class="input" />
  
        <label for="hracademia">Horas de horas Coordinacion de estadias:</label>
        <input type="number" id="hracademia" v-model.number="formData.hracademia" class="input" />
  
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
          planeacion: '',
          reuniones: null,
          horasReunion: null,
          diasPromocion: null,
          horasPromocion: null,
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
          planeacion: '',
          reuniones: null,
          horasReunion: null,
          diasPromocion: null,
          horasPromocion: null,
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
  
<template>
    <div class="container">
      <h2 class="title">Registro semanal</h2>
      <form @submit.prevent="submitForm" class="form">
        <label for="planeacion">Planeación de actividades:</label>
        <input type="text" id="planeacion" v-model="formData.planeacion" class="input" />
  
        <label for="grupales"> Horas de tutorias grupales:</label>
        <input type="number" id="grupales" v-model.number="formData.grupales" class="input" />
  
        <label for="individual">Horas de tutorias individuales:</label>
        <input type="number" id="individual" v-model.number="formData.individual" class="input" />
  
        <label for="reuniones">Número de reuniones asistidas:</label>
        <input type="number" id="reuniones" v-model.number="formData.reuniones" class="input" />
  
        <label for="estadias">Horas de proyectos de estadias:</label>
        <input type="number" id="estadias" v-model.number="formData.estadias" class="input" />

        <label for="actualizacion_programa">Planeación, revisión, programación y evaluación de actividades y clases:</label>
        <input type="number" id="actualizacion_programa" v-model.number="formData.actualizacion_programa" class="input" />

        <label for="reuniones_academicas">Reuniones academicas:</label>
        <input type="number" id="reuniones_academicas" v-model.number="formData.reuniones_academicas" class="input" />
  
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
  
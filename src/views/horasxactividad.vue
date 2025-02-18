<template>
  <div class="container">
    <h2 class="title">Registro semanal</h2>
    <form @submit.prevent="submitForm" class="form">
      <table class="table">
        <thead>
          <tr>
            <th>Actividad</th>
            <th>Horas/días</th>
            <th>Observaciones</th>
            <th>Archivo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, key) in formData.valores" :key="key">
            <td>{{ actividades[key] }}</td>
            <td><input type="number" v-model.number="formData.valores[key]" class="input" /></td>
            <td><textarea v-model="formData.observaciones[key]" class="textarea"></textarea></td>
            <td><input type="file" class="file-input" /></td>
          </tr>
        </tbody>
      </table>
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
      actividades: {
        clase: "Horas de clase impartidas",
        grupales: "Horas de tutorías grupales",
        individual: "Horas de tutorías individuales",
        asesorias: "Asesorías",
        reuniones: "Número de reuniones asistidas",
        estadias: "Horas de proyectos de estadías",
        actualizacion_programa: "Planeación, revisión, programación y evaluación de actividades",
        reuniones_academicas: "Reuniones académicas"
      },
      formData: {
        valores: {
          clase: null,
          grupales: null,
          individual: null,
          asesorias: null,
          reuniones: null,
          estadias: null,
          actualizacion_programa: null,
          reuniones_academicas: null
        },
        observaciones: {
          clase: "",
          grupales: "",
          individual: "",
          asesorias: "",
          reuniones: "",
          estadias: "",
          actualizacion_programa: "",
          reuniones_academicas: ""
        }
      }
    };
  },
  methods: {
    submitForm() {
      console.log("Datos enviados:", this.formData);
      alert("Formulario enviado correctamente");
    },
    resetForm() {
      this.formData.valores = {
        clase: null,
        grupales: null,
        individual: null,
        asesorias: null,
        reuniones: null,
        estadias: null,
        actualizacion_programa: null,
        reuniones_academicas: null
      };
      this.formData.observaciones = {
        clase: "",
        grupales: "",
        individual: "",
        asesorias: "",
        reuniones: "",
        estadias: "",
        actualizacion_programa: "",
        reuniones_academicas: ""
      };
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
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

.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.table th, .table td {
  border: 1px solid #ccc;
  padding: 25px;
  text-align: left;
}

.input {
  width: 100%;
  padding: 5px;
  border: 0px solid #ccc;
  border-radius: 5px;
}

.textarea {
  width: 100%;
  height: 100px;
  border: 0px solid #ccc;
  border-radius: 5px;
}

.file-input {
  width: 100%;
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

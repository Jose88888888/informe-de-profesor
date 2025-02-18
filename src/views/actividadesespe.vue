<template>
  <div class="container">
    <h2 class="title">Actividades especiales</h2>
    <form @submit.prevent="submitForm" class="form">
      <table class="table">
        <thead>
          <tr>
            <th>Actividad</th>
            <th>Horas/Días</th>
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
        promocion: "Hora de actividades de promoción",
        planeacion: "Horas de actualización de diseño y rediseño de programas educativos",
        estadias: "Horas de coordinación de estadías",
        diaspromo: "Días de promoción",
        proyectos_inte: "Horas de coordinación de proyectos integradores",
        hracademia: "Horas de coordinación de academias"
      },
      formData: {
        valores: {
          promocion: null,
          planeacion: null,
          estadias: null,
          diaspromo: null,
          proyectos_inte: null,
          hracademia: null
        },
        observaciones: {
          promocion: "",
          planeacion: "",
          estadias: "",
          diaspromo: "",
          proyectos_inte: "",
          hracademia: ""
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
        promocion: null,
        planeacion: null,
        estadias: null,
        diaspromo: null,
        proyectos_inte: null,
        hracademia: null
      };
      this.formData.observaciones = {
        promocion: "",
        planeacion: "",
        estadias: "",
        diaspromo: "",
        proyectos_inte: "",
        hracademia: ""
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
  border-radius: 30px;
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
.input, .textarea, .file-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.textarea {
  height: 40px;
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

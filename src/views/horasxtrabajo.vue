<template>
  <div class="container">
    <h2 class="title">Primer informe</h2>
    <form @submit.prevent="submitForm" class="form">
      <table class="form-table">
        <thead>
          <tr>
            <th>Campo</th>
            <th>Horas/Días</th>
            <th>Observaciones</th>
            <th>Archivo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><label for="grupos">Número de grupos asignados:</label></td>
            <td><input type="number" id="grupos" v-model.number="formData.grupos" class="input" /></td>
            <td><textarea v-model="formData.observaciones.grupos" class="textarea"></textarea></td>
            <td><input type="file" class="file-input" /></td>
          </tr>

          <tr>
            <td><label for="horasClase">Horas de clase:</label></td>
            <td><input type="number" id="horasClase" v-model.number="formData.horasClase" class="input" /></td>
            <td><textarea v-model="formData.observaciones.horasClase" class="textarea"></textarea></td>
            <td><input type="file" class="file-input" /></td>
          </tr>

          <tr>
            <td><label for="proyectos">Número de proyectos de estadía asignados:</label></td>
            <td><input type="number" id="proyectos" v-model.number="formData.proyectos" class="input" /></td>
            <td><textarea v-model="formData.observaciones.proyectos" class="textarea"></textarea></td>
            <td><input type="file" class="file-input" /></td>
          </tr>

          <tr>
            <td><label for="tutorias">Número de grupos de tutorías asignados:</label></td>
            <td><input type="number" id="tutorias" v-model.number="formData.tutorias" class="input" /></td>
            <td><textarea v-model="formData.observaciones.tutorias" class="textarea"></textarea></td>
            <td><input type="file" class="file-input" /></td>
          </tr>

          <tr>
            <td><label for="integradores">Número de proyectos integradores asignados:</label></td>
            <td><input type="number" id="integradores" v-model.number="formData.integradores" class="input" /></td>
            <td><textarea v-model="formData.observaciones.integradores" class="textarea"></textarea></td>
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
      formData: {
        grupos: null,
        horasClase: null,
        proyectos: null,
        tutorias: null,
        integradores: null,
        observaciones: {
          grupos: "",
          horasClase: "",
          proyectos: "",
          tutorias: "",
          integradores: "",
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
      this.formData = {
        grupos: null,
        horasClase: null,
        proyectos: null,
        tutorias: null,
        integradores: null,
        observaciones: {
          grupos: "",
          horasClase: "",
          proyectos: "",
          tutorias: "",
          integradores: "",
        }
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

.form-table {
  width: 100%;
  border-collapse: collapse;
}

.form-table th, .form-table td {
  border: 1px solid #ccc;
  padding: 25px;
  text-align: center;
}

.input, .textarea, .file-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.textarea {
  height: 40px;
  resize: vertical;
}

.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
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

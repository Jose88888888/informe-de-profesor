<template>
  <div class="container">
    <h2 class="title">Otras actividades</h2>
    <form @submit.prevent="submitForm" class="form">
      <table class="form-table">
        <thead>
          <tr>
            <th>Campo</th>
            <th>Valor</th>
            <th>Observaciones</th>
            <th>Archivo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><label for="Capacitacion">Capacitación:</label></td>
            <td><input type="text" id="Capacitacion" v-model="formData.horasDias.capacitacion" class="input" /></td>
            <td><textarea v-model="formData.observaciones.capacitacion" class="textarea"></textarea></td>
            <td><input type="file" class="file-input" /></td>
          </tr>

          <tr>
            <td><label for="especificar">Especificar:</label></td>
            <td><input type="text" id="especificar" v-model="formData.horasDias.especificar" class="input" /></td>
            <td><textarea v-model="formData.observaciones.especificar" class="textarea"></textarea></td>
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
        horasDias: {
          capacitacion: "",
          especificar: ""
        },
        observaciones: {
          capacitacion: "",
          especificar: ""
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
        horasDias: {
          capacitacion: "",
          especificar: ""
        },
        observaciones: {
          capacitacion: "",
          especificar: ""
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

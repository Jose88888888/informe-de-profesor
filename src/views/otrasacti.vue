<script setup>
import { ref } from "vue";
import axios from "axios";

const variable = ref([]);
const formData = ref([]); // Nuevo array para almacenar los datos del formulario

async function conect() {
  const options = {
    method: "GET",
    url: "http://localhost:3000/api/actividades/actividades/otros",
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const response = await axios.request(options);
    variable.value = response.data;

    // Inicializar formData con un objeto por cada actividad
    formData.value = response.data.map((item) => ({
      id_informe:local.storage,
      id_actividad:item.id_actividad,
      valor: "",
      observaciones: "",
      archivo: null,
    }));
  } catch (error) {
    console.error(error);
  }
}

conect();

async function submitForm() {
  // Validar que todos los campos estén llenos
  for (const item of formData.value) {
    if (!item.valor || !item.observaciones) {
      alert("Todos los campos son obligatorios.");
      return;
    }
  }

  try {
    await axios.post("http://localhost:3000/api/informeactividad", formData.value, {
      headers: { "Content-Type": "application/json" },
    });
    alert("Datos enviados correctamente");
  } catch (error) {
    console.error("Error al enviar datos", error);
  }
}
</script>

<template>
  <div class="container">
    <h2 class="title">Otras</h2>
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
          <tr v-for="(item, index) in variable" :key="index">
            <td>{{ item.descripcion }}</td>
            <td><input type="number" v-model="formData[index].horas" required /></td>
            <td><input type="text" v-model="formData[index].observaciones" required /></td>
            <td><input type="file" @change="formData[index].archivo = $event.target.files[0]" /></td>
          </tr>
        </tbody>
      </table>

      <div class="buttons">
        <button type="submit" class="btn-submit">Enviar</button>
      </div>
    </form>
  </div>
</template>


<style scoped>
.container {
  max-width: 1200px;
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

.form-table th,
.form-table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
}

.input,
.textarea,
.file-input {
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

.btn-submit,
.btn-reset {
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

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const actividades = ref([]);

// Función para obtener las actividades semanales desde la API
async function obtenerActividades() {
    try {
        const response = await axios.get("http://localhost:3000/api/actividades/actividades/especial");
        actividades.value = response.data;
    } catch (error) {
        console.error("Error al obtener actividades:", error);
    }
}

// Función para manejar el envío del formulario
// Función para manejar el envío del formulario
async function submitForm() {
    const id_informe = localStorage.getItem("id_informe");
    // Obtener el número de empleado del localStorage
    const empleadoNum = localStorage.getItem("usernombre");
    
    // Validación: verificar que existan tanto el id_informe como el empleadoNum
    if (!id_informe || !empleadoNum) {
        alert("Error: Falta información necesaria. Inicia sesión nuevamente.");
        return;
    }

    try {
        // Iterar sobre cada actividad
        for (const actividad of actividades.value) {
            const valor = document.getElementById(`valor-${actividad.id_actividad}`).value || null;
            const observacion = document.getElementById(`observacion-${actividad.id_actividad}`).value || null;
            const evidenciaFile = document.getElementById(`evidencia-${actividad.id_actividad}`).files[0];

            // Crear FormData para enviar datos y archivo
            const formData = new FormData();
            formData.append('id_informe', id_informe);
            formData.append('id_actividad', actividad.id_actividad);
            formData.append('valor', valor ? parseInt(valor) : null);
            formData.append('observacion', observacion);
            
            // Agregar el número de empleado al FormData
            formData.append('empleadoNum', empleadoNum);
            
            // Añadir archivo si existe
            if (evidenciaFile) {
                formData.append('evidencia', evidenciaFile);
            }

            // Enviar datos con FormData
            await axios.post("http://localhost:3000/api/informeactividad/", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }

        alert("Datos y evidencias enviados correctamente");
        resetForm();
    } catch (error) {
        console.error("Error al insertar datos:", error);
        alert("Ocurrió un error al enviar los datos.");
    }
}

// Función para limpiar el formulario
function resetForm() {
    actividades.value.forEach((actividad) => {
        const valorInput = document.getElementById(`valor-${actividad.id_actividad}`);
        const observacionInput = document.getElementById(`observacion-${actividad.id_actividad}`);
        const evidenciaInput = document.getElementById(`evidencia-${actividad.id_actividad}`);

        if (valorInput) valorInput.value = "";
        if (observacionInput) observacionInput.value = "";
        if (evidenciaInput) evidenciaInput.value = "";
    });
}

// Cargar actividades al montar el componente
onMounted(obtenerActividades);
</script>

<template>
  <div class="container">
    <h2 class="title">Actividades extraordinarias</h2>
    <form @submit.prevent="submitForm" class="form">
      <table class="form-table">
        <thead>
          <tr>
            <th>Actividad</th>
            <th>Horas</th>
            <th>Observaciones</th>
            <th>Evidencia</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in actividades" :key="item.id_actividad">
            <td>{{ item.descripcion }}</td>
            <td><input type="number" :id="'valor-' + item.id_actividad"></td>
            <td><input type="text" :id="'observacion-' + item.id_actividad"></td>
            <td><input type="file" :id="'evidencia-' + item.id_actividad"></td>
          </tr>
        </tbody>
      </table>
      <div class="buttons">
        <button type="button" @click="resetForm" class="btn-reset">Limpiar</button>
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

.form-table th, .form-table td {
  border: 1px solid #ccc;
  padding: 25px;
  text-align: center;
}

.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn-submit {
  background: #28a745;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.btn-reset {
  background: #dc3545;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}
</style>

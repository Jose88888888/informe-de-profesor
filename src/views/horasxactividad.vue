<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// Variable para almacenar las actividades semanales
const actividadesSemanales = ref([]);

// Función para obtener las actividades semanales desde la API
async function obtenerActividadesSemanales() {
  try {
    const response = await axios.get("http://localhost:3000/api/actividades/actividades/semanal");
    actividadesSemanales.value = response.data;
  } catch (error) {
    console.error("Error al obtener actividades semanales:", error);
  }
}

// Llamar a la función al cargar el componente
onMounted(obtenerActividadesSemanales);

// Función para manejar el envío del formulario con archivos
// Función para manejar el envío del formulario con archivos
async function submitForm() {
  const id_informe = localStorage.getItem("id_informe");
  // Obtener el número de empleado del localStorage
  const empleadoNum = localStorage.getItem("usernombre");
  
  if (!id_informe) {
    alert("Error: No se encontró el ID del informe. Inicia sesión nuevamente.");
    return;
  }
  
  try {
    // Procesar cada actividad
    for (const actividad of actividadesSemanales.value) {
      // Crear un FormData para cada actividad
      const formData = new FormData();
      
      // Obtener los elementos del DOM
      const valorInput = document.getElementById(`valor-${actividad.id_actividad}`);
      const observacionInput = document.getElementById(`observacion-${actividad.id_actividad}`);
      const evidenciaInput = document.getElementById(`evidencia-${actividad.id_actividad}`);
      
      // Agregar datos al FormData
      formData.append('id_informe', id_informe);
      formData.append('id_actividad', actividad.id_actividad);
      
      // Agregar el número de empleado al FormData
      if (empleadoNum) {
        formData.append('empleadoNum', empleadoNum);
      }
      
      // Valor (opcional)
      const valor = valorInput?.value;
      if (valor) {
        formData.append('valor', parseInt(valor));
      }
      
      // Observación (opcional)
      const observacion = observacionInput?.value;
      if (observacion) {
        formData.append('observacion', observacion);
      }
      
      // Archivo de evidencia (opcional)
      const evidenciaFile = evidenciaInput?.files[0];
      if (evidenciaFile) {
        formData.append('evidencia', evidenciaFile);
      }
      
      // Enviar los datos al backend
      await axios.post("http://localhost:3000/api/informeactividad/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    
    alert("Datos enviados correctamente");
    resetForm();
  } catch (error) {
    console.error("Error al insertar datos:", error);
    alert("Ocurrió un error al enviar los datos.");
  }
}

// Función para limpiar el formulario
function resetForm() {
  actividadesSemanales.value.forEach((actividad) => {
    const valorInput = document.getElementById(`valor-${actividad.id_actividad}`);
    const observacionInput = document.getElementById(`observacion-${actividad.id_actividad}`);
    const evidenciaInput = document.getElementById(`evidencia-${actividad.id_actividad}`);

    if (valorInput) valorInput.value = '';
    if (observacionInput) observacionInput.value = '';
    if (evidenciaInput) evidenciaInput.value = '';
  });
}
</script>

<template>
  <div class="container">
    <h2 class="title">Actividades</h2>
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
          <tr v-for="item in actividadesSemanales" :key="item.id_actividad">
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

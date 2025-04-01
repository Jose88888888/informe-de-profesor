<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Variable para almacenar las actividades obtenidas desde la API
const actividades = ref([]);
// Array para almacenar los IDs de las actividades ya insertadas
const actividadesInsertadas = ref([]);

// Función para obtener las actividades desde la API
async function obtenerActividades() {
    try {
        const response = await axios.get("http://localhost:3000/api/actividades/actividades/inicial");
        actividades.value = response.data;
        console.log("Actividades obtenidas:", actividades.value);
        
        // Verificar si ya existen registros para este informe
        await verificarRegistrosExistentes();
    } catch (error) {
        console.error("Error al obtener actividades:", error);
        alert(`Error al obtener actividades: ${error.message}`);
    }
}

// Función para verificar si ya existen registros para este informe
async function verificarRegistrosExistentes() {
    const id_informe = localStorage.getItem("id_informe");
    if (!id_informe) {
        console.warn("No se encontró el ID del informe en localStorage");
        return;
    }
    
    try {
        const timestamp = new Date().getTime();
        const response = await axios.get(`http://localhost:3000/api/informeactividad/informe/${id_informe}?_t=${timestamp}`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        console.log("Registros existentes:", response.data);
        
        if (response.data && response.data.length > 0) {
            actividadesInsertadas.value = response.data.map(item => item.id_actividad);
            console.log("Actividades ya insertadas:", actividadesInsertadas.value);
            
            // Pre-llenar el formulario con los datos existentes
            response.data.forEach(item => {
                const valorElement = document.getElementById(`valor-${item.id_actividad}`);
                const observacionElement = document.getElementById(`observacion-${item.id_actividad}`);
                const evidenciaLabelElement = document.getElementById(`evidencia-label-${item.id_actividad}`);
                
                if (valorElement) valorElement.value = item.valor || '';
                if (observacionElement) observacionElement.value = item.observacion || '';
                
                if (evidenciaLabelElement && item.evidencia) {
                    evidenciaLabelElement.textContent = `Archivo actual: ${item.evidencia}`;
                }
            });
        } else {
            console.log("No existen registros previos para este informe");
        }
    } catch (error) {
        console.error("Error al verificar registros existentes:", error);
        alert(`Error al verificar registros existentes: ${error.message}`);
    }
}

// Función para manejar el envío del formulario
async function submitForm() {
    const id_informe = localStorage.getItem("id_informe");
    if (!id_informe) {
        alert("Error: No se encontró el ID del informe. Inicia sesión nuevamente.");
        return;
    }

    const submitButton = document.querySelector('.btn-submit');
    try {
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';
        }

        for (const actividad of actividades.value) {
            const id_actividad = actividad.id_actividad;
            const valorElement = document.getElementById(`valor-${id_actividad}`);
            const observacionElement = document.getElementById(`observacion-${id_actividad}`);
            const evidenciaElement = document.getElementById(`evidencia-${id_actividad}`);
            
            const valor = valorElement ? valorElement.value : null;
            const observacion = observacionElement ? observacionElement.value : null;
            const evidenciaFile = evidenciaElement && evidenciaElement.files.length > 0 ? evidenciaElement.files[0] : null;
            
            const esActualizacion = actividadesInsertadas.value.includes(id_actividad);
            
            const formData = new FormData();
            formData.append('id_informe', id_informe);
            formData.append('id_actividad', id_actividad);
            formData.append('valor', valor !== null && valor !== '' ? parseInt(valor) : null);
            formData.append('observacion', observacion !== null && observacion !== '' ? observacion : null);
            
            if (evidenciaFile) {
                formData.append('evidencia', evidenciaFile);
            }
            
            try {
                if (esActualizacion) {
                    // Actualización
                    const timestamp = new Date().getTime();
                    const url = `http://localhost:3000/api/update/informeactividad/${id_informe}/${id_actividad}?_t=${timestamp}`;
                    await axios.put(url, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                } else {
                    // Inserción
                    await axios.post("http://localhost:3000/api/informeactividad/", formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    actividadesInsertadas.value.push(id_actividad);
                }
            } catch (errorProcesamiento) {
                console.error(`Error al procesar la actividad ${id_actividad}:`, errorProcesamiento);
                alert(`Error al procesar la actividad ${actividad.descripcion}: ${errorProcesamiento.message}`);
            }
        }
        
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar';
        }
        
        alert("Datos enviados correctamente");
        
        await verificarRegistrosExistentes();
        
    } catch (error) {
        console.error("Error general al procesar datos:", error);
        
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar';
        }
        
        alert(`Ocurrió un error al enviar los datos: ${error.message}`);
    }
}

// Función para limpiar el formulario
function resetForm() {
    actividades.value.forEach((actividad) => {
        const valorElement = document.getElementById(`valor-${actividad.id_actividad}`);
        const observacionElement = document.getElementById(`observacion-${actividad.id_actividad}`);
        const evidenciaElement = document.getElementById(`evidencia-${actividad.id_actividad}`);
        const evidenciaLabelElement = document.getElementById(`evidencia-label-${actividad.id_actividad}`);
        
        if (valorElement) valorElement.value = "";
        if (observacionElement) observacionElement.value = "";
        if (evidenciaElement) evidenciaElement.value = "";
        if (evidenciaLabelElement) evidenciaLabelElement.textContent = "";
    });
}

// Llamar a la función al cargar el componente
onMounted(obtenerActividades);
</script>

<template>
  <div class="container">
    <h2 class="title">Datos Generales</h2>
    <form @submit.prevent="submitForm" class="form">
      <table class="form-table">
        <thead>
          <tr>
            <th>Actividad</th>
            <th>Cantidad</th>
            <th>Observaciones</th>
            <th>Evidencia</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in actividades" :key="item.id_actividad">
            <td>{{ item.descripcion }}</td>
            <td><input type="number" :id="'valor-' + item.id_actividad"></td>
            <td><input type="text" :id="'observacion-' + item.id_actividad"></td>
            <td>
              <div>
                <input type="file" :id="'evidencia-' + item.id_actividad">
                <small :id="'evidencia-label-' + item.id_actividad" class="file-label"></small>
              </div>
            </td>
            <td>
              <span v-if="actividadesInsertadas.includes(item.id_actividad)" class="status update">
                Actualizar
              </span>
              <span v-else class="status insert">
                Insertar
              </span>
            </td>
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

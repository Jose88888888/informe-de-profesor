<script setup>
import { ref } from 'vue';
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
        // Usamos el endpoint correcto y evitamos la caché
        const timestamp = new Date().getTime();
        const response = await axios.get(`http://localhost:3000/api/informeactividad/informe/${id_informe}?_t=${timestamp}`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        console.log("Registros existentes:", response.data);
        
        // Almacenar las IDs de las actividades que ya tienen registros
        if (response.data && response.data.length > 0) {
            actividadesInsertadas.value = response.data.map(item => item.id_actividad);
            console.log("Actividades ya insertadas:", actividadesInsertadas.value);
            
            // Pre-llenar el formulario con los datos existentes
            response.data.forEach(item => {
                const valorElement = document.getElementById(`valor-${item.id_actividad}`);
                const observacionElement = document.getElementById(`observacion-${item.id_actividad}`);
                const evidenciaLabelElement = document.getElementById(`evidencia-label-${item.id_actividad}`);
                
                if (valorElement) {
                    valorElement.value = item.valor || '';
                }
                
                if (observacionElement) {
                    observacionElement.value = item.observacion || '';
                }
                
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

// Llamar a la función al cargar el componente
obtenerActividades();

// Función para manejar el envío del formulario
async function submitForm() {
    const id_informe = localStorage.getItem("id_informe");

    if (!id_informe) {
        alert("Error: No se encontró el ID del informe. Inicia sesión nuevamente.");
        return;
    }

    try {
        // Deshabilitar el botón de envío para evitar múltiples envíos
        const submitButton = document.querySelector('.btn-submit');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';
        }

        // Procesar cada actividad individualmente
        for (const actividad of actividades.value) {
            const id_actividad = actividad.id_actividad;
            const valorElement = document.getElementById(`valor-${id_actividad}`);
            const observacionElement = document.getElementById(`observacion-${id_actividad}`);
            const evidenciaElement = document.getElementById(`evidencia-${id_actividad}`);
            
            const valor = valorElement ? valorElement.value : null;
            const observacion = observacionElement ? observacionElement.value : null;
            const evidenciaFile = evidenciaElement && evidenciaElement.files.length > 0 ? evidenciaElement.files[0] : null;
            
            // Determinar si es actualización o inserción
            const esActualizacion = actividadesInsertadas.value.includes(id_actividad);
            console.log(`Actividad ${id_actividad} - Es actualización: ${esActualizacion}`);
            
            // Preparar los datos comunes para ambos casos
            const formData = new FormData();
            formData.append('id_informe', id_informe);
            formData.append('id_actividad', id_actividad);
            
            if (valor !== null && valor !== '') {
                formData.append('valor', parseInt(valor));
            }
            
            if (observacion !== null && observacion !== '') {
                formData.append('observacion', observacion);
            }
            
            if (evidenciaFile) {
                formData.append('evidencia', evidenciaFile);
            }
            
            // Crear un objeto de datos para depuración
            const datosEnviados = {
                id_informe,
                id_actividad,
                valor: valor !== null && valor !== '' ? parseInt(valor) : null,
                observacion: observacion !== null && observacion !== '' ? observacion : null,
                evidencia: evidenciaFile ? evidenciaFile.name : null
            };
            
            try {
                if (esActualizacion) {
                    // ACTUALIZACIÓN: Usar el endpoint correcto
                    console.log(`Actualizando actividad ${id_actividad}`, datosEnviados);
                    
                    // Evitar la caché añadiendo un timestamp
                    const timestamp = new Date().getTime();
                    const url = `http://localhost:3000/api/informeactividad/${id_informe}/${id_actividad}?_t=${timestamp}`;
                    
                    // Si hay archivo, usamos FormData, de lo contrario, probamos con JSON
                    if (evidenciaFile) {
                        const respuesta = await axios.put(url, formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        });
                        console.log(`Respuesta de actualización con archivo:`, respuesta.data);
                    } else {
                        const respuesta = await axios.put(url, datosEnviados);
                        console.log(`Respuesta de actualización sin archivo:`, respuesta.data);
                    }
                    
                } else {
                    // INSERCIÓN: Usar el endpoint correcto
                    console.log(`Insertando nueva actividad ${id_actividad}`, datosEnviados);
                    
                    // Si hay archivo, usamos FormData, de lo contrario, JSON
                    let respuesta;
                    if (evidenciaFile) {
                        respuesta = await axios.post("http://localhost:3000/api/informeactividad/", formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        });
                    } else {
                        respuesta = await axios.post("http://localhost:3000/api/informeactividad/", datosEnviados);
                    }
                    
                    console.log(`Respuesta de inserción:`, respuesta.data);
                    
                    // Agregar a la lista de actividades insertadas
                    actividadesInsertadas.value.push(id_actividad);
                }
            } catch (errorProcesamiento) {
                console.error(`Error al procesar la actividad ${id_actividad}:`, errorProcesamiento);
                console.error(`Detalle del error:`, errorProcesamiento.response ? errorProcesamiento.response.data : 'Sin detalles');
                alert(`Error al procesar la actividad ${actividad.descripcion}: ${errorProcesamiento.message}`);
            }
        }
        
        // Re-habilitar el botón de envío
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar';
        }
        
        alert("Datos enviados correctamente");
        
        // Forzar una recarga completa de los datos después de todas las actualizaciones
        console.log("Recargando datos actualizados...");
        await verificarRegistrosExistentes();
    } catch (error) {
        console.error("Error general al procesar datos:", error);
        
        // Re-habilitar el botón de envío en caso de error
        const submitButton = document.querySelector('.btn-submit');
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
                <!-- Etiqueta para mostrar el nombre del archivo existente -->
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

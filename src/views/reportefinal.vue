<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const variable = ref([]);
const nombreUsuario = ref(localStorage.getItem("usernombre") || "Usuario Desconocido");

async function conect() {
    try {
        const response = await axios.get("http://localhost:3000/api/select/actividades/vista_informe_completo");
        variable.value = response.data.map(item => ({
            ...item,
            nombre_usuario: nombreUsuario.value
        }));
        console.log("Datos obtenidos:", variable.value);
    } catch (error) {
        console.error("Error al obtener datos:", error);
        alert("No se pudieron cargar los datos del informe");
    }
}

function generarPDF() {
    if (variable.value.length === 0) {
        alert('No hay datos para generar el PDF');
        return;
    }

    try {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Reporte Final', 14, 22);

        const informe = variable.value[0];
        doc.setFontSize(10);
        doc.text(`Usuario: ${informe.nombre_usuario}`, 14, 30);
        doc.text(`Cuatrimestre: ${informe.cuatrimestre}`, 14, 36);
        doc.text(`Parcial: ${informe.parcial}`, 14, 42);
        doc.text(`Fecha: ${new Date(informe.fecha).toLocaleDateString()}`, 14, 48);
        doc.text(`Estado: ${informe.status}`, 14, 54);

        const tableData = variable.value.map(item => [
            item.descripcion,
            item.valor_total.toString(),
            item.evidencias || 'Sin evidencias',
            item.observaciones || 'Sin observaciones'
        ]);

        autoTable(doc, {
            startY: 60,
            head: [['Actividad', 'Valor Total', 'Evidencias', 'Observaciones']],
            body: tableData,
            theme: 'striped',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 }
        });

        doc.save(`Reporte_Informe_${informe.nombre_usuario || 'General'}.pdf`);
        console.log('PDF generado correctamente');
    } catch (error) {
        console.error('Error al generar PDF:', error);
        alert('Ocurrió un error al generar el PDF');
    }
}

onMounted(conect);
</script>

<template>
  <div class="container">
    <h2 class="title">Reporte final</h2>
    
    <div class="download-section">
      <button @click="generarPDF" class="btn-download">
        Descargar PDF
      </button>
    </div>

    <table class="form-table">
      <thead>
        <tr>
          <th>Actividad</th>
          <th>Valor Total</th>
          <th>Evidencias</th>
          <th>Observaciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in variable" :key="item.id_actividad">
          <td>{{ item.descripcion }}</td>
          <td>{{ item.valor_total }}</td>
          <td>{{ item.evidencias || 'Sin evidencias' }}</td>
          <td>{{ item.observaciones || 'Sin observaciones' }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="variable.length > 0" class="informe-details">
      <h3>Detalles del Informe</h3>
      <p>Usuario: {{ variable[0].nombre_usuario }}</p>
      <p>Cuatrimestre: {{ variable[0].cuatrimestre }}</p>
      <p>Parcial: {{ variable[0].parcial }}</p>
      <p>Fecha: {{ new Date(variable[0].fecha).toLocaleDateString() }}</p>
      <p>Estado: {{ variable[0].status }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Estilos anteriores se mantienen igual */
.download-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.btn-download {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-download:hover {
  background-color: #2980b9;
}

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
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const datosInicial = ref([]);
const datosCompleto = ref([]);
const nombreUsuario = ref(localStorage.getItem("usernombre") || "Usuario Desconocido");
const cargandoInicial = ref(true);
const cargandoCompleto = ref(true);
const mostrarModal = ref(false);
const informeId = ref(localStorage.getItem("id_informe") || null);
const reporteStatus = ref("");
const actualizando = ref(false);

async function cargarDatos() {
    try {
        // Cargar primera vista: vista_informe_inicial
        const responseInicial = await axios.get("http://localhost:3000/api/select/actividades/vista_informe_inicial");
        datosInicial.value = responseInicial.data.map(item => ({
            ...item,
            nombre_usuario: nombreUsuario.value
        }));
        cargandoInicial.value = false;
        console.log("Datos iniciales obtenidos:", datosInicial.value);

        // Cargar segunda vista: vista_informe_completo
        const responseCompleto = await axios.get("http://localhost:3000/api/select/actividades/vista_informe_completo");
        datosCompleto.value = responseCompleto.data.map(item => ({
            ...item,
            nombre_usuario: nombreUsuario.value
        }));
        cargandoCompleto.value = false;
        console.log("Datos completos obtenidos:", datosCompleto.value);
        
        // Si hay datos, obtener el status actual del informe
        if (datosCompleto.value.length > 0 && datosCompleto.value[0].status) {
            reporteStatus.value = datosCompleto.value[0].status;
        }
    } catch (error) {
        console.error("Error al obtener datos:", error);
        alert("No se pudieron cargar los datos del informe");
        cargandoInicial.value = false;
        cargandoCompleto.value = false;
    }
}

function abrirModal() {
    if (!informeId.value) {
        alert("No se encontró el ID del informe. Por favor, inténtelo de nuevo.");
        return;
    }
    mostrarModal.value = true;
}

function cerrarModal() {
    mostrarModal.value = false;
}

async function finalizarInforme() {
    if (!informeId.value) {
        alert("No se encontró el ID del informe");
        cerrarModal();
        return;
    }
    
    try {
        actualizando.value = true;
        // Endpoint para actualizar el status del informe
        await axios.put(`http://localhost:3000/api/informes/actualizar/${informeId.value}`, {
            status: "Finalizado"
        });
        
        // Actualizar el status en los datos locales
        reporteStatus.value = "Finalizado";
        if (datosCompleto.value.length > 0) {
            datosCompleto.value = datosCompleto.value.map(item => ({
                ...item,
                status: "Finalizado"
            }));
        }
        
        actualizando.value = false;
        cerrarModal();
        alert("El informe ha sido finalizado correctamente");
        
        // Generar PDF automáticamente después de finalizar
        generarPDF();
    } catch (error) {
        console.error("Error al finalizar el informe:", error);
        alert("Ocurrió un error al finalizar el informe");
        actualizando.value = false;
        cerrarModal();
    }
}

function generarPDF() {
    if (datosCompleto.value.length === 0) {
        alert('No hay datos para generar el PDF');
        return;
    }

    try {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Reporte Final', 14, 22);

        // Información general tomada del informe completo
        const informe = datosCompleto.value[0];
        doc.setFontSize(10);
        doc.text(`Usuario: ${informe.nombre_usuario}`, 14, 30);
        doc.text(`Cuatrimestre: ${informe.cuatrimestre}`, 14, 36);
        doc.text(`Parcial: ${informe.parcial}`, 14, 42);
        doc.text(`Fecha: ${new Date(informe.fecha).toLocaleDateString()}`, 14, 48);
        doc.text(`Estado: ${informe.status}`, 14, 54);

        // Sección de datos iniciales
        doc.setFontSize(14);
        doc.text('Informe Inicial', 14, 65);
        
        const tablaDatosIniciales = datosInicial.value.map(item => [
            item.descripcion,
            item.valor_total.toString(),
            item.evidencias || 'Sin evidencias',
            item.observaciones || 'Sin observaciones'
        ]);

        autoTable(doc, {
            startY: 70,
            head: [['Actividad', 'Valor Total', 'Evidencias', 'Observaciones']],
            body: tablaDatosIniciales,
            theme: 'striped',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 }
        });

        // Sección de datos completos
        const finalY = doc.lastAutoTable.finalY || 120;
        doc.setFontSize(14);
        doc.text('Informe Completo', 14, finalY + 10);

        const tablaDatosCompletos = datosCompleto.value.map(item => [
            item.descripcion,
            item.valor_total.toString(),
            item.evidencias || 'Sin evidencias',
            item.observaciones || 'Sin observaciones'
        ]);

        autoTable(doc, {
            startY: finalY + 15,
            head: [['Actividad', 'Valor Total', 'Evidencias', 'Observaciones']],
            body: tablaDatosCompletos,
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

onMounted(cargarDatos);
</script>

<template>
  <div class="container">
    <h2 class="title">Reporte final</h2>
    
    <div class="download-section">
      <button 
        v-if="reporteStatus !== 'Finalizado'" 
        @click="abrirModal" 
        class="btn-primary">
        Finalizar Reporte
      </button>
      
      <button 
        @click="generarPDF" 
        class="btn-download"
        :disabled="reporteStatus !== 'Finalizado'">
        Descargar PDF
      </button>
    </div>
    
    <!-- Estado del reporte -->
    <div class="status-badge" :class="{'status-finalizado': reporteStatus === 'Finalizado'}">
      Estado: {{ reporteStatus || 'Activo' }}
    </div>
    
    <!-- Sección de Informe Inicial -->
    <div class="report-section">
      <h3 class="section-title">Informe Inicial</h3>
      <div v-if="cargandoInicial" class="loading">Cargando datos iniciales...</div>
      <div v-else>
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
            <tr v-for="item in datosInicial" :key="item.id_actividad">
              <td>{{ item.descripcion }}</td>
              <td>{{ item.valor_total }}</td>
              <td>{{ item.evidencias || 'Sin evidencias' }}</td>
              <td>{{ item.observaciones || 'Sin observaciones' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Sección de Informe Completo -->
    <div class="report-section">
      <h3 class="section-title">Informe Completo</h3>
      <div v-if="cargandoCompleto" class="loading">Cargando datos completos...</div>
      <div v-else>
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
            <tr v-for="item in datosCompleto" :key="item.id_actividad">
              <td>{{ item.descripcion }}</td>
              <td>{{ item.valor_total }}</td>
              <td>{{ item.evidencias || 'Sin evidencias' }}</td>
              <td>{{ item.observaciones || 'Sin observaciones' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="datosCompleto.length > 0" class="informe-details">
      <h3>Detalles del Informe</h3>
      <p>Usuario: {{ datosCompleto[0].nombre_usuario }}</p>
      <p>Cuatrimestre: {{ datosCompleto[0].cuatrimestre }}</p>
      <p>Parcial: {{ datosCompleto[0].parcial }}</p>
      <p>Fecha: {{ new Date(datosCompleto[0].fecha).toLocaleDateString() }}</p>
      <p>Estado: {{ datosCompleto[0].status }}</p>
    </div>
  </div>
  
  <!-- Modal de confirmación -->
  <div v-if="mostrarModal" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Confirmar Finalización</h3>
      </div>
      <div class="modal-body">
        <p>¿Estás seguro de que deseas finalizar este reporte?</p>
        <p>Al finalizar el reporte no podrá ser modificado posteriormente.</p>
      </div>
      <div class="modal-footer">
        <button @click="cerrarModal" class="btn-secondary">Cancelar</button>
        <button @click="finalizarInforme" class="btn-primary" :disabled="actualizando">
          <span v-if="actualizando">Procesando...</span>
          <span v-else>Confirmar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  color: #2980b9;
  margin-bottom: 20px;
}

.download-section {
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
}

.btn-primary {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-primary:hover {
  background-color: #2ecc71;
}

.btn-secondary {
  background-color: #7f8c8d;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-secondary:hover {
  background-color: #95a5a6;
}

.btn-download {
  background-color: #2980b9;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-download:hover {
  background-color: #3498db;
}

.btn-download:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.form-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}

.form-table th, .form-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.form-table th {
  background-color: #2980b9;
  color: white;
}

.form-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.informe-details {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  margin-top: 20px;
}

.informe-details h3 {
  color: #2980b9;
  margin-bottom: 15px;
}

.section-title {
  color: #2980b9;
  margin: 20px 0 15px 0;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
}

.report-section {
  margin-bottom: 30px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  background-color: #f39c12;
  color: white;
  border-radius: 4px;
  margin-bottom: 20px;
  font-weight: bold;
}

.status-finalizado {
  background-color: #27ae60;
}

/* Estilos del Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background-color: #2980b9;
  color: white;
}

.modal-header h3 {
  margin: 0;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
<script setup>
import { ref, onMounted, computed } from 'vue';
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

// Nuevas referencias para preview de archivos
const filePreviewVisible = ref(false);
const currentFile = ref(null);
const showTooltip = ref(false);
const currentCuatrimestre = ref(null);

// Guardar una copia de los datos iniciales para mostrarlos siempre
const datosInicialesPersistentes = ref([]);
const getCurrentCuatrimestre = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    if (month >= 1 && month <= 4) return `${year}E`;
    if (month >= 5 && month <= 8) return `${year}M`;
    return `${year}S`;
}

// Calculamos si debemos mostrar los datos completos basados en el status
const mostrarDatosCompletos = computed(() => {
    return reporteStatus.value !== "Finalizado";
});

const fetchCurrentCuatrimestre = async () => {
  try {
    const response = await axios.get('/api/list-files');
    currentCuatrimestre.value = response.data.cuatrimestre || getCurrentCuatrimestre();
  } catch (error) {
    console.error('Error al obtener el cuatrimestre:', error);
    // Usar el cuatrimestre calculado localmente como respaldo
    currentCuatrimestre.value = getCurrentCuatrimestre();
  }
};
// Funciones para preview de archivos
const openFilePreview = (fileName) => {
  currentFile.value = fileName;
  filePreviewVisible.value = true;
};

const closeFilePreview = () => {
  filePreviewVisible.value = false;
  currentFile.value = null;
};

// Verificar si es una imagen
const isImage = (fileName) => {
  if (!fileName) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

// Verificar si es un PDF
const isPDF = (fileName) => {
  if (!fileName) return false;
  return fileName.toLowerCase().endsWith('.pdf');
};

// Obtener URL del archivo
const getFileUrl = computed(() => (fileName) => {
  if (!fileName || !currentCuatrimestre.value) return '';
  return `/upload/${currentCuatrimestre.value}/${fileName}`;
});



async function cargarDatos() {
    try {
        const id_usuario = localStorage.getItem("userid");
        
        // Cargar primera vista con filtro por id_usuario
        const responseInicial = await axios.get(
            `http://localhost:3000/api/select/actividades/vista_informe_inicial`, 
            { params: { id_usuario } }
        );
        
        const datosFormateados = responseInicial.data.map(item => ({
            ...item,
            nombre_usuario: nombreUsuario.value
        }));
        
        datosInicial.value = datosFormateados;
        datosInicialesPersistentes.value = [...datosFormateados];
        cargandoInicial.value = false;

        // Cargar segunda vista: vista_informe_completo con el mismo id_usuario
        const responseCompleto = await axios.get(
            "http://localhost:3000/api/select/actividades/vista_informe_completo",
            { params: { id_usuario } }
        );

        datosCompleto.value = responseCompleto.data.map(item => ({
            ...item,
            nombre_usuario: nombreUsuario.value
        }));

        cargandoCompleto.value = false;

        // Si hay datos, obtener el status actual del informe
        if (datosCompleto.value.length > 0 && datosCompleto.value[0].status) {
            reporteStatus.value = datosCompleto.value[0].status;
        }

        // Obtener el cuatrimestre actual
        await fetchCurrentCuatrimestre();
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
        await axios.put(`http://localhost:3000/api/informes/actualizar/${informeId.value}`, {
            status: "Finalizado"
        });
        
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
        
        generarPDFFormateado();
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
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        const informe = datosCompleto.value[0];
        const fechaActual = new Date().toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        doc.addImage('/img/Logotipo.png', 'PNG', 14, 10, 30, 15);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Tlajomulco de Zúñiga, ${fechaActual}`, pageWidth - 14, 20, { align: 'right' });
        doc.text("ASUNTO: Entrega de informe de horas por actividad " + informe.cuatrimestre, 14, 45);
        
        doc.setFont('helvetica', 'bold');
        doc.text("JULIO CÉSAR VILLASEÑOR BRACAMONTES", 14, 55);
        doc.text("DIRECTOR ACADÉMICO UTZMG", 14, 61);
        doc.text("PRESENTE.", 14, 67);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const textoIntroductorio = "Aunado a un cordial en seguimiento al oficio UTZMG-DAC-3S.2-2024-[número de oficio], " +
                                  "me permito entregar el informe de actividades correspondiente al primer " +
                                  "periodo de evaluación del presente cuatrimestre " + informe.cuatrimestre;
        
        const splitIntro = doc.splitTextToSize(textoIntroductorio, pageWidth - 28);
        doc.text(splitIntro, 14, 77);
        
        let yPos = 95;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text("Informe Inicial", 14, yPos - 5);
        doc.setFont('helvetica', 'normal');
        
        const tablaDatosIniciales = datosInicial.value.map(item => [
            item.descripcion,
            item.valor_total.toString(),
            item.evidencias || '',
            item.observaciones || ''
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Actividad', 'Valor', 'Evidencias', 'Observaciones']],
            body: tablaDatosIniciales,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            margin: { left: 14, right: 14 }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text("Informe Completo", 14, yPos - 5);
        doc.setFont('helvetica', 'normal');
        
        const tablaDatosCompletos = datosCompleto.value.map(item => [
            item.descripcion,
            item.valor_total.toString(),
            item.evidencias || '',
            item.observaciones || ''
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Actividad', 'Valor', 'Evidencias', 'Observaciones']],
            body: tablaDatosCompletos,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            margin: { left: 14, right: 14 }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(10);
        doc.text("Sin otro particular por el momento quedo atento si existe duda o comentario al respecto.", 14, yPos);
        
        yPos += 20;
        doc.setFont('helvetica', 'bold');
        doc.text("ATENTAMENTE", pageWidth/2, yPos, { align: 'center' });
        
        yPos += 25;
        doc.text(`${informe.nombre_usuario}`, pageWidth/2, yPos, { align: 'center' });
        
        yPos += 10;
        doc.text("PROFESOR DE TIEMPO COMPLETO DE XXX", pageWidth/2, yPos, { align: 'center' });
        
        yPos = pageHeight - 25;
        
        const logoWidth = 25;
        const logoHeight = 12;
        const spacing = (pageWidth - (logoWidth * 4)) / 5;
        let xPos = spacing;

        doc.addImage('/img/SEP.png', 'PNG', xPos, yPos, logoWidth, logoHeight);
        xPos += logoWidth + spacing;
        
        doc.addImage('/img/utp.png', 'PNG', xPos, yPos, logoWidth, logoHeight);
        xPos += logoWidth + spacing;
        
        doc.addImage('/img/jalisco.png', 'PNG', xPos, yPos, logoWidth, logoHeight);
        xPos += logoWidth + spacing;
        
        doc.addImage('/img/inovacion.png', 'PNG', xPos, yPos, logoWidth, logoHeight);
        
        if (yPos > pageHeight - 20) {
            doc.addPage();
        }
        
        doc.save(`Reporte_Informe_${informe.cuatrimestre}_${informe.nombre_usuario || 'Profesor'}.pdf`);
        console.log('PDF generado correctamente');
    } catch (error) {
        console.error('Error al generar PDF:', error);
        alert('Ocurrió un error al generar el PDF');
    }
}

async function actualizarDato(item) {
    try {
        actualizando.value = true;
        
        await axios.put(`http://localhost:3000/api/actividades/actualizar/${item.id_actividad}`, {
            evidencias: item.evidencias,
            observaciones: item.observaciones
        });
        
        alert("Datos actualizados correctamente");
    } catch (error) {
        console.error("Error al actualizar datos:", error);
        alert("Ocurrió un error al actualizar los datos");
    } finally {
        actualizando.value = false;
    }
}

onMounted(async () => {
    await cargarDatos();
});
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
        class="btn-download">
        Descargar PDF
      </button>
    </div>
    
    <div class="status-badge" :class="{'status-finalizado': reporteStatus === 'Finalizado'}">
      Estado: {{ reporteStatus || 'Activo' }}
    </div>
    
    <div class="report-section">
      <h3 class="section-title">Informe Inicial</h3>
      <div v-if="cargandoInicial" class="loading">Cargando datos iniciales...</div>
      <div v-else>
        <table class="form-table">
          <thead>
            <tr>
              <th>ID Informe</th>
              <th>Actividad</th>
              <th>Valor Total</th>
              <th>Evidencias</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in datosInicial" :key="item.id_actividad">
              <td>{{ item.id_informe || 'N/A' }}</td>
              <td>{{ item.descripcion }}</td>
              <td>{{ item.valor_total }}</td>
              <td>
                <span 
                  v-if="item.evidencias"
                  class="file-preview-link" 
                  @click="openFilePreview(item.evidencias)"
                  @mouseover="showTooltip = true"
                  @mouseleave="showTooltip = true"
                >
                  {{ item.evidencias }}
                  <span v-if="showTooltip" class="tooltip">Clic para ver archivo</span>
                </span>
                <span v-else>Sin evidencias</span>
              </td>
              <td>{{ item.observaciones || 'Sin observaciones' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="mostrarDatosCompletos" class="report-section">
      <h3 class="section-title">Informe Completo</h3>
      <div v-if="cargandoCompleto" class="loading">Cargando datos completos...</div>
      <div v-else>
        <table class="form-table">
          <thead>
            <tr>
              <th>ID Informe</th>
              <th>Actividad</th>
              <th>Valor Total</th>
              <th>Evidencias</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in datosCompleto" :key="item.id_actividad">
              <td>{{ item.id_informe || 'N/A' }}</td>
              <td>{{ item.descripcion }}</td>
              <td>{{ item.valor_total }}</td>
              <td>
                <span 
                  v-if="item.evidencias"
                  class="file-preview-link" 
                  @click="openFilePreview(item.evidencias)"
                  @mouseover="showTooltip = true"
                  @mouseleave="showTooltip = false"
                >
                  {{ item.evidencias }}
                  <span v-if="showTooltip" class="tooltip">Clic para ver archivo</span>
                </span>
                <span v-else>Sin evidencias</span>
              </td>
              <td>{{ item.observaciones || 'Sin observaciones' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="datosCompleto.length > 0" class="informe-details">
      <h3>Detalles del Informe</h3>
      <p>ID Informe: {{ datosCompleto[0].id_informe || 'N/A' }}</p>
      <p>Usuario: {{ datosCompleto[0].nombre_usuario }}</p>
      <p>Cuatrimestre: {{ datosCompleto[0].cuatrimestre }}</p>
      <p>Parcial: {{ datosCompleto[0].parcial }}</p>
      <p>Fecha: {{ new Date(datosCompleto[0].fecha).toLocaleDateString() }}</p>
      <p>Estado: {{ datosCompleto[0].status }}</p>
    </div>
    
    <div v-if="filePreviewVisible" class="file-preview-modal" @click.self="closeFilePreview">
      <div class="modal-content">
        <span class="close-button" @click="closeFilePreview">&times;</span>
        <div class="preview-container">
          <img 
            v-if="isImage(currentFile)" 
            :src="getFileUrl(currentFile)" 
            alt="Vista previa" 
            class="preview-image"
          />
          <iframe 
            v-else-if="isPDF(currentFile)"
            :src="getFileUrl(currentFile)" 
            class="preview-iframe"
          ></iframe>
          <div v-else class="download-container">
            <p>Este archivo no se puede previsualizar</p>
            <a :href="getFileUrl(currentFile)" download class="download-button">
              Descargar Archivo
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-if="mostrarModal" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Confirmar Finalización</h3>
      </div>
      <div class="modal-body">
        <p>¿Estás seguro de que deseas finalizar este reporte?</p>
        <p>Al finalizar el reporte, no se mostrarán los datos completos.</p>
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
  color: #971B2F;
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
  border: 1px solid #a9a9a9;
  padding: 12px;
  text-align: left;
}

.form-table th {
  background-color: #a9a9a9;
  color: rgb(0, 0, 0);
}

.form-table tr:nth-child(even) {
  background-color: #a9a9a9;
}

.informe-details {
  background-color: #a9a9a9 ;
  padding: 20px;
  border-radius: 5px;
  margin-top: 20px;
}

.informe-details h3 {
  color: #2980b9;
  margin-bottom: 15px;
}

.section-title {
  color: #971B2F;
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


/* Todos los estilos previos más los siguientes: */
.file-preview-link {
  cursor: pointer;
  color: blue;
  text-decoration: underline;
  position: relative;
}

.file-preview-link:hover {
  color: darkblue;
}

.tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: black;
  color: white;
  padding: 5px;
  border-radius: 3px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
}

.file-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 80%;
  max-height: 80%;
  position: relative;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-image, .preview-iframe {
  max-width: 100%;
  max-height: 70vh;
}

.download-container {
  text-align: center;
}

.download-button {
  display: inline-block;
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 5px;
  margin-top: 10px;
}

</style>
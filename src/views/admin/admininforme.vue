  <template>
    <div class="container">
      <h2 class="title">Reportes de Usuarios</h2>
      
      <!-- Sección de filtros y acciones administrativas -->
      <div class="admin-controls">
        <!-- Filtro por carrera existente -->
        <div class="filter-section">
          <label for="carrera" class="filter-label">Filtrar por carrera:</label>
          <select 
            id="carrera"
            v-model="selectedCareer" 
            class="filter-select"
          >
            <option value="">Todas</option>
            <option v-for="carrera in uniqueCareers" :key="carrera" :value="carrera">{{ carrera }}</option>
          </select>
        </div>

        

       <!-- En la sección de admin-actions-->
  <div class="period-selector">
    <label for="periodos" class="filter-label">Seleccionar período:</label>
    <select 
      id="periodos"
      v-model="selectedPeriod" 
      class="filter-select"
    >
      <option value="">Todos</option>
      <option v-for="periodo in uniquePeriodos" :key="periodo" :value="periodo">
        {{ periodo }}
      </option>
    </select>
  </div>
        
        <!-- Nuevo selector de cuatrimestre y botón para finalizar -->
        <div class="admin-actions">
          <div class="quarter-selector">
            <label for="cuatrimestre" class="filter-label">Seleccionar cuatrimestre:</label>
            <select 
              id="cuatrimestre"
              v-model="selectedQuarter" 
              class="filter-select"
            >
              <option value="">Seleccionar...</option>
              <option v-for="cuatrimestre in uniqueQuarters" :key="cuatrimestre" :value="cuatrimestre">{{ cuatrimestre }}</option>
            </select>
          </div>
          
          <button 
            @click="finalizarCuatrimestre" 
            class="btn-primary"
            :disabled="!selectedQuarter || isProcessing"
          >
            {{ isProcessing ? 'Procesando...' : 'Finalizar Cuatrimestre' }}
          </button>
        </div>
      </div>
      
      <!-- Estado de carga -->
      <div v-if="isLoading" class="loading">Cargando reportes...</div>
      
      <!-- Mensaje de éxito -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <!-- Sin resultados -->
      <div v-if="!isLoading && filteredReports.length === 0" class="no-results">
        No se encontraron reportes con los filtros seleccionados.
      </div>
      
      <!-- Tabla de reportes -->
      <div v-if="!isLoading && groupedReports.length > 0" class="report-section">
        <table class="form-table">
          <thead>
            <tr>
              <th>ID Informe</th>
              <th>Usuario</th>
              <th>Carrera</th>
              <th>Fecha</th>
              <th>Periodo</th>
              <th>Cuatrimestre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="informe in paginatedGroupedReports" :key="informe.id_informe">
              <td>{{ informe.id_informe }}</td>
              <td>{{ informe.nombre_usuario }}</td>
              <td>{{ informe.carrera }}</td>
              <td>{{ formatDate(informe.fecha) }}</td>
              <td>{{ informe.parcial }}</td>
              <td>{{ informe.cuatrimestre }}</td>
              <td>{{ informe.status }}</td>
              <td>
                <button 
                  @click="generarPDFFormateado(informe)" 
                  class="btn-download"
                >
                  Descargar PDF
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Paginación -->
      <div v-if="groupedReports.length > 0" class="pagination">
        <span class="pagination-info">
          Mostrando {{ paginatedGroupedReports.length }} de {{ groupedReports.length }} informes
        </span>
        <div class="pagination-buttons">
          <button 
            :disabled="currentPage === 1" 
            @click="currentPage--" 
            class="btn-secondary"
            :class="{ 'disabled': currentPage === 1 }"
          >
            Anterior
          </button>
          <button 
            :disabled="currentPage === totalPages" 
            @click="currentPage++" 
            class="btn-secondary"
            :class="{ 'disabled': currentPage === totalPages }"
          >
            Siguiente
          </button>
        </div>
      </div>
      
      <!-- Modal de confirmación -->
      <div v-if="showConfirmModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Confirmar Acción</h3>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro que deseas finalizar el cuatrimestre <strong>{{ selectedQuarter }}</strong>?</p>
            <p>Esta acción cambiará el estado de todos los informes de este cuatrimestre a "finalizado por admin" y no se podrá revertir.</p>
            <p><strong>Total de informes afectados: {{ informesToFinalize.length }}</strong></p>
          </div>
          <div class="modal-footer">
            <button @click="showConfirmModal = false" class="btn-secondary">Cancelar</button>
            <button @click="confirmarFinalizarCuatrimestre" class="btn-danger">Confirmar Finalización</button>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import jsPDF from 'jspdf';
  import autoTable from 'jspdf-autotable';
  import axios from 'axios';

  // Estado
  const reportes = ref([]);
  const isLoading = ref(true);
  const error = ref(null);
  const successMessage = ref(null);
  const selectedCareer = ref('');
  const selectedQuarter = ref('');
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const selectedPeriod = ref('');
  const usuarioActual = ref(localStorage.getItem("usernombre") || "Usuario Desconocido");
  const isProcessing = ref(false);
  const showConfirmModal = ref(false);
  const errorSeleccionPeriodos = ref('');

  

  // Cargar datos
  onMounted(async () => {
    await cargarDatos();
  });

  
  async function cargarDatos() {
    isLoading.value = true;
    error.value = null;
    successMessage.value = null;
    
    try {
      const response = await axios.get("http://localhost:3000/api/select/actividades/vista_informe_completo_finalizado");
      reportes.value = response.data;
      console.log("Datos cargados:", reportes.value);
    } catch (err) {
      console.error("Error al obtener datos:", err);
      error.value = "No se pudieron cargar los datos del informe. Por favor, inténtelo de nuevo más tarde.";
    } finally {
      isLoading.value = false;
    }
  }

  // Obtener lista única de carreras
  const uniqueCareers = computed(() => {
    return [...new Set(reportes.value.map(r => r.carrera))];
  });

  // Obtener lista única de cuatrimestres
  const uniqueQuarters = computed(() => {
    return [...new Set(reportes.value.map(r => r.cuatrimestre))].sort();
  });


 // Método para validar selección de períodos
const validarSeleccionPeriodos = () => {
  if (periodosSeleccionados.value.length > 3) {
    // Eliminar el último período seleccionado si se superan 3
    periodosSeleccionados.value = periodosSeleccionados.value.slice(0, 3)
    errorSeleccionPeriodos.value = 'Solo puedes seleccionar máximo 3 períodos'
  } else {
    errorSeleccionPeriodos.value = ''
  }
}
const uniquePeriodos = computed(() => {
  return [...new Set(reportes.value.map(r => r.parcial))].sort();
});

// Modificar el filtrado de reportes para incluir filtro de períodos
const filteredReports = computed(() => {
  let filtered = reportes.value;
  
  // Filtrar por carrera
  if (selectedCareer.value) {
    filtered = filtered.filter(r => r.carrera === selectedCareer.value);
  }
  
  // Filtrar por cuatrimestre
  if (selectedQuarter.value) {
    filtered = filtered.filter(r => r.cuatrimestre === selectedQuarter.value);
  }
  
  // Filtrar por período
  if (selectedPeriod.value) {
    filtered = filtered.filter(r => r.parcial === selectedPeriod.value);
  }
  
  // Ordenar por fecha (más reciente primero)
  filtered = [...filtered].sort((a, b) => {
    return new Date(b.fecha) - new Date(a.fecha);
  });
  
  return filtered;
});







    
  

  // Función para procesar cadenas concatenadas con STRING_AGG
  function procesarStringAgg(cadena) {
    if (!cadena) return [];
    return cadena.split(' | ').map(item => item.trim());
  }

  // Función para procesar las actividades con sus IDs
  function procesarActividades(actividades) {
    if (!actividades) return [];
    
    return actividades.split(' | ').map(item => {
      const parts = item.split(': ');
      return {
        id: parts[0] || '',
        descripcion: parts[1] || ''
      };
    });
  }

  // Agrupar reportes por id_informe
  const groupedReports = computed(() => {
    const grouped = [];
    const informeMap = new Map();
    
    // Primero creamos un mapa con los informes únicos
    filteredReports.value.forEach(reporte => {
      if (!informeMap.has(reporte.id_informe)) {
        // Procesar las cadenas concatenadas
        const actividadesData = procesarActividades(reporte.actividades);
        const valoresData = procesarStringAgg(reporte.valores);
        const evidenciasData = procesarStringAgg(reporte.evidencias);
        const observacionesData = procesarStringAgg(reporte.observaciones);
        
        // Crear un array de actividades procesadas
        const actividades = [];
        for (let i = 0; i < actividadesData.length; i++) {
          actividades.push({
            id_actividad: actividadesData[i].id,
            descripcion: actividadesData[i].descripcion,
            valor_total: valoresData[i] || '0',
            evidencias: evidenciasData[i] || 'Sin evidencias',
            observaciones: observacionesData[i] || ''
          });
        }
        
        informeMap.set(reporte.id_informe, {
          id_informe: reporte.id_informe,
          nombre_usuario: reporte.nombre_usuario,
          carrera: reporte.carrera,
          fecha: reporte.fecha,
          cuatrimestre: reporte.cuatrimestre,
          parcial: reporte.parcial,
          status: reporte.status,
          // Guardar las actividades ya procesadas
          actividades: actividades
        });
        
        grouped.push(informeMap.get(reporte.id_informe));
      }
    });
    
    console.log("Informes agrupados y procesados:", grouped);
    return grouped;
  });

  // Informes a finalizar (para el modal de confirmación)
  const informesToFinalize = computed(() => {
    if (!selectedQuarter.value) return [];
    return groupedReports.value.filter(informe => 
      informe.cuatrimestre === selectedQuarter.value
    );
  });

  // Paginación para informes agrupados
  const totalPages = computed(() => {
    return Math.ceil(groupedReports.value.length / itemsPerPage.value);
  });

  const paginatedGroupedReports = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
    const endIndex = startIndex + itemsPerPage.value;
    return groupedReports.value.slice(startIndex, endIndex);
  });

  // Formatear fecha
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Generar PDF formateado similar al ejemplo proporcionado
  // Función adaptada para generar PDF con formato específico
// Función corregida para generar PDF con formato específico
function generarPDFFormateado(informe) {
  try {
    console.log("Generando PDF para informe:", informe);
    console.log("Actividades procesadas:", informe.actividades);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Datos del informe
    const fechaActual = new Date().toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    
    // --------------- ENCABEZADO ---------------
    
    // Logo de la universidad (TAMAÑO REDUCIDO)
    doc.addImage('/img/Logotipo.png', 'PNG', 14, 10, 30, 15);
    
    // Título y fecha
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Tlajomulco de Zúñiga, ${fechaActual}`, pageWidth - 14, 20, { align: 'right' });
    
    // Asunto
    doc.setFontSize(11);
    doc.text("ASUNTO: Entrega de informe de horas por actividad " + informe.cuatrimestre, 14, 45);
    
    // Destinatario
    doc.setFont('helvetica', 'bold');
    doc.text("JULIO CÉSAR VILLASEÑOR BRACAMONTES", 14, 55);
    doc.text("DIRECTOR ACADÉMICO UTZMG", 14, 61);
    doc.text("PRESENTE.", 14, 67);
    
    // --------------- CUERPO DEL DOCUMENTO ---------------
    
    // Texto introductorio
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const textoIntroductorio = "Aunado a un cordial en seguimiento al oficio UTZMG-DAC-3S.2-2024-[número de oficio], " +
                              "me permito entregar el informe de actividades correspondiente al primer " +
                              "periodo de evaluación del presente cuatrimestre " + informe.cuatrimestre;
    
    const splitIntro = doc.splitTextToSize(textoIntroductorio, pageWidth - 28);
    doc.text(splitIntro, 14, 77);
    
    // Información del informe
    let yPos = 95;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text("Informe Completo", 14, yPos - 5);
    doc.setFont('helvetica', 'normal');
    
    // Preparar datos para tabla principal
    const tablaActividades = informe.actividades.map(act => [
        act.descripcion,
        act.valor_total.toString(),
        act.evidencias || '',
        act.observaciones || ''
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Actividad', 'Valor', 'Evidencias', 'Observaciones']],
        body: tablaActividades,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        margin: { left: 14, right: 14 }
    });
    
    // --------------- PIE DEL DOCUMENTO ---------------
    
    // Calcular si queda suficiente espacio para la firma o necesitamos una nueva página
    // Necesitamos aproximadamente 80 unidades de espacio para la firma completa
    const espacioRestante = pageHeight - doc.lastAutoTable.finalY;
    
    if (espacioRestante < 80) {
        // No hay suficiente espacio, agregar nueva página
        doc.addPage();
        yPos = 40; // Reiniciar posición Y en la nueva página
    } else {
        // Hay suficiente espacio, continuamos en la misma página
        yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Texto de cierre
    doc.setFontSize(10);
    doc.text("Sin otro particular por el momento quedo atento si existe duda o comentario al respecto.", 14, yPos);
    
    // Firma
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.text("ATENTAMENTE", pageWidth/2, yPos, { align: 'center' });
    
    yPos += 25;
    doc.text(`${informe.nombre_usuario}`, pageWidth/2, yPos, { align: 'center' });
    
    // Obtener la carrera para la línea de profesor
    const carrera = informe.carrera || "XXX";
    yPos += 10;
    doc.text(`PROFESOR DE TIEMPO COMPLETO DE ${carrera}`, pageWidth/2, yPos, { align: 'center' });
    
    // Asegurarnos de que hay espacio para los logos o creamos una nueva página
    if (yPos > pageHeight - 50) {
        // No hay suficiente espacio para los logos, agregar nueva página
        doc.addPage();
    }
    
    // Logos institucionales en el pie de página (TAMAÑO MUY REDUCIDO)
    // Colocamos los logos en la parte inferior de la página actual
    yPos = pageHeight - 25; // Fijamos la posición Y a 25 unidades desde el fondo
    
    // Logos: SEP, UTP, JALISCO, INNOVACIÓN CIENCIA Y TECNOLOGÍA
    const logoWidth = 25; // Ancho muy reducido
    const logoHeight = 12; // Alto muy reducido
    const spacing = (pageWidth - (logoWidth * 4)) / 5;
    let xPos = spacing;

    // Logo 1: SEP
    doc.addImage('/img/SEP.png', 'PNG', xPos, yPos, logoWidth, logoHeight);
    xPos += logoWidth + spacing;
    
    // Logo 2: UTP
    doc.addImage('/img/utp.png', 'PNG', xPos, yPos, logoWidth, logoHeight);
    xPos += logoWidth + spacing;
    
    // Logo 3: JALISCO
    doc.addImage('/img/jalisco.png', 'PNG', xPos, yPos, logoWidth, logoHeight);
    xPos += logoWidth + spacing;
    
    // Logo 4: INNOVACIÓN CIENCIA Y TECNOLOGÍA
    doc.addImage('/img/inovacion.png', 'PNG', xPos, yPos, logoWidth, logoHeight);
    
    // Agregar footer con número de página en todas las páginas
    const totalPages = doc.internal.getNumberOfPages();
    
    // Agregar numeración de página a todas las páginas
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - 25, pageHeight - 10);
    }
    
    // Guardar el PDF
    doc.save(`Reporte_Informe_${informe.cuatrimestre}_${informe.nombre_usuario}.pdf`);
    console.log('PDF generado correctamente');
  } catch (error) {
    console.error('Error al generar PDF formateado:', error);
    alert('Ocurrió un error al generar el PDF. Revisa la consola para más detalles.');
  }
}
  // NUEVAS FUNCIONES PARA FINALIZAR CUATRIMESTRE

  // Mostrar modal de confirmación antes de finalizar cuatrimestre
  function finalizarCuatrimestre() {
    if (!selectedQuarter.value) {
      error.value = "Debe seleccionar un cuatrimestre para finalizar.";
      return;
    }
    
    // Mostrar modal de confirmación
    showConfirmModal.value = true;
  }

  // Finalizar cuatrimestre (después de confirmación)
  async function confirmarFinalizarCuatrimestre() {
    isProcessing.value = true;
    error.value = null;
    successMessage.value = null;
    
    try {
      // Obtener IDs de informes que pertenecen al cuatrimestre seleccionado
      const informesIds = informesToFinalize.value.map(informe => informe.id_informe);
      
      if (informesIds.length === 0) {
        error.value = "No hay informes para finalizar en este cuatrimestre.";
        showConfirmModal.value = false;
        isProcessing.value = false;
        return;
      }
      
      // Realizar la petición para actualizar el estado de los informes
      const response = await axios.post("http://localhost:3000/api/update/informes/finalizar-cuatrimestre", {
        cuatrimestre: selectedQuarter.value,
        nuevoEstado: "finalizado por admin",
        informesIds: informesIds
      });
      
      console.log("Respuesta del servidor:", response.data);
      
      // Mostrar mensaje de éxito
      successMessage.value = `Se han finalizado ${informesIds.length} informes del cuatrimestre ${selectedQuarter.value}.`;
      
      // Recargar datos
      await cargarDatos();
      
    } catch (err) {
      console.error("Error al finalizar cuatrimestre:", err);
      error.value = "Ocurrió un error al finalizar el cuatrimestre. Por favor, intente nuevamente.";
    } finally {
      isProcessing.value = false;
      showConfirmModal.value = false;
    }
  }
  </script>


<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
  color: #971B2F;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-label {
  margin-right: 10px;
  font-weight: 500;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 200px;
}

.loading {
  text-align: center;
  padding: 30px;
  font-style: italic;
  color: #666;
}

.error-message {
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  color: #c62828;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.no-results {
  text-align: center;
  padding: 30px;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.report-section {
  margin-bottom: 30px;
  overflow-x: auto;
}

.form-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

.form-table th, .form-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #a9a9a9;
}

.form-table th {
  background-color: #a9a9a9;
  font-weight: 600;
}

.form-table tr:hover {
  background-color: #a9a9a9;
}

.btn-download {
  background-color: #00AB84;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.btn-download:hover {
  background-color: #00AB84;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.btn-secondary:hover:not(.disabled) {
  background-color: #e0e0e0;
}

.btn-secondary.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.pagination-info {
  font-size: 0.9rem;
  color: #666;
}

.pagination-buttons {
  display: flex;
  gap: 10px;
}


/*nuevos filtros de filtro por periodo*/
.admin-actions {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.period-selector {
  display: flex;
  flex-direction: column;
}

.error-message {
  color: red;
  font-size: 0.8em;
  margin-top: 5px;
}
/* Nuevos estilos para la funcionalidad de finalizar cuatrimestre */
.admin-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

.admin-actions {
  display: flex;
  align-items: flex-end;
  gap: 15px;
}

.quarter-selector {
  display: flex;
  flex-direction: column;
}

.btn-primary {
  background-color: #00AB84;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #00AB84;
}

.btn-primary:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.success-message {
  background-color: #d1fae5;
  border-left: 4px solid #10b981;
  color: #065f46;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-danger:hover {
  background-color: #b91c1c;
}

/* Modal de confirmación */
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
  border-radius: 6px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-body {
  padding: 16px;
}

.modal-footer {
  padding: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e5e7eb;
}
</style>
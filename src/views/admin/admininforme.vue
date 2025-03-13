<template>
  <div class="container">
    <h2 class="title">Reportes de Usuarios</h2>
    
    <!-- Filtro por carrera -->
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
    
    <!-- Estado de carga -->
    <div v-if="isLoading" class="loading">Cargando reportes...</div>
    
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
            <th>Parcial</th>
            <th>Cuatrimestre</th>
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
const selectedCareer = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const usuarioActual = ref(localStorage.getItem("usernombre") || "Usuario Desconocido");

// Cargar datos
onMounted(async () => {
  await cargarDatos();
});

async function cargarDatos() {
  isLoading.value = true;
  error.value = null;
  
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

// Filtrar reportes solo por carrera
const filteredReports = computed(() => {
  let filtered = reportes.value;
  
  // Filtrar por carrera
  if (selectedCareer.value) {
    filtered = filtered.filter(r => r.carrera === selectedCareer.value);
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
function generarPDFFormateado(informe) {
  try {
    console.log("Generando PDF para informe:", informe);
    console.log("Actividades procesadas:", informe.actividades);
    
    const doc = new jsPDF();
    
    // Encabezado principal
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte Final", 14, 20);
    
    // Información básica
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Usuario: ${informe.nombre_usuario}`, 14, 30);
    doc.text(`Cuatrimestre: ${informe.cuatrimestre}`, 14, 38);
    doc.text(`Parcial: ${informe.parcial}`, 14, 46);
    doc.text(`Fecha: ${formatDate(informe.fecha)}`, 14, 54);
    doc.text(`Estado: ${informe.status || "Activo"}`, 14, 62);
    
    // Tabla con todas las actividades
    const tableData = informe.actividades.map(act => [
      act.descripcion,
      act.valor_total,
      act.evidencias,
      act.observaciones
    ]);
    
    autoTable(doc, {
      startY: 70,
      head: [['Actividad', 'Valor Total', 'Evidencias', 'Observaciones']],
      body: tableData,
      theme: 'grid',
      styles: { 
        fontSize: 10, 
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [220, 220, 220], 
        textColor: 0, 
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 60 },  // Actividad
        1: { cellWidth: 30 },  // Valor Total
        2: { cellWidth: 35 },  // Evidencias
        3: { cellWidth: 'auto' }   // Observaciones
      },
      didDrawPage: (data) => {
        // Footer con número de página
        doc.setFontSize(8);
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
      }
    });
    
    doc.save(`Reporte_Informe_${informe.nombre_usuario}.pdf`);
    console.log('PDF formateado generado correctamente');
  } catch (error) {
    console.error('Error al generar PDF formateado:', error);
    alert('Ocurrió un error al generar el PDF. Revisa la consola para más detalles.');
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
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #333;
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
  border-bottom: 1px solid #ddd;
}

.form-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.form-table tr:hover {
  background-color: #f9f9f9;
}

.btn-download {
  background-color: #2980b9;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.btn-download:hover {
  background-color: #1c638e;
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
</style>
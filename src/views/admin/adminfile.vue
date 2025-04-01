// AdminFileViewer.vue
<template>
  <div class="admin-file-viewer">
    <h1>Buscador de Archivos</h1>
    

      
      <div class="filter-group">
        <label for="empleado">Buscar por nombre:</label>
        <input 
          type="text" 
          id="empleado" 
          v-model="filtroEmpleado" 
          placeholder="Nombre"
        >
      </div>
      
      <div class="filter-group" v-if="carreras.length > 0">
        <label for="carrera">Filtrar por carrera:</label>
        <select id="carrera" v-model="filtroCarrera">
          <option value="">Todas las carreras</option>
          <option v-for="carrera in carreras" :key="carrera" :value="carrera">
            {{ carrera }}
          </option>
        </select>
      </div>
    </div>
    
    <div class="results">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando archivos...</p>
      </div>
      
      <div v-else-if="!empleadosFiltrados || empleadosFiltrados.length === 0" class="no-results">
        No se encontraron empleados que coincidan con el filtro.
      </div>
      
      <div v-else class="empleados-list">
        <div v-for="empleado in empleadosFiltrados" :key="empleado.id" class="empleado-card">
          <div class="empleado-header">
            <h3>Empleado: {{ empleado.id }}</h3>
            <span v-if="empleado.carrera" class="badge">{{ empleado.carrera }}</span>
          </div>
          
          <div v-if="!empleado.files || empleado.files.length === 0" class="no-files">
            No hay archivos subidos por este empleado.
          </div>
          
          <div v-else class="files-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre del archivo</th>
                  <th>Tipo</th>
                  <th>Tamaño</th>
                  <th>Fecha de subida</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="file in empleado.files" :key="file.name">
                  <td>{{ getFileName(file.name) }}</td>
                  <td>{{ file.type }}</td>
                  <td>{{ formatFileSize(file.size) }}</td>
                  <td>{{ formatDate(file.lastModified) }}</td>
                  <td class="actions">
                    <button @click="viewFile(empleado.id, file.name)" class="btn btn-view">
                      Ver archivo
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

// Datos de usuario desde localStorage
const currentUser = ref(null);
const carreras = ref([]);

// Estado reactivo con valores iniciales para prevenir errores
const cuatrimestres = ref([]);
const cuatrimestreSeleccionado = ref('');
const filtroEmpleado = ref('');
const filtroCarrera = ref('');
const empleados = ref([]);
const loading = ref(true);
const userToken = ref('');

// Cargar datos del usuario desde localStorage
const loadUserData = () => {
  try {
    currentUser.value = {
      id: localStorage.getItem('userid') || '',
      correo: localStorage.getItem('usercorreo') || '',
      nombre: localStorage.getItem('usernombre') || '',
      empleado: localStorage.getItem('userempleado') || '',
      rol: localStorage.getItem('userrol') || '',
      informe: localStorage.getItem('id_informe') || '',
      carrera: localStorage.getItem('usercarrera') || ''
    };
    
    userToken.value = localStorage.getItem('access-token') || '';
    
    // Configurar el token para todas las peticiones de axios
    if (userToken.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken.value}`;
    }
    
    // Verificar si el usuario tiene rol de administrador
    if (currentUser.value.rol.toLowerCase() !== 'admin') {
      console.warn('El usuario no tiene permisos de administrador');
    }
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error);
  }
};

// Obtener el cuatrimestre actual y la lista de cuatrimestres disponibles
const fetchCuatrimestres = async () => {
  try {
    const response = await axios.get('/api/cuatrimestres');
    cuatrimestres.value = response.data;
    
    if (response.data && response.data.length > 0) {
      cuatrimestreSeleccionado.value = response.data[0]; // Seleccionar el primero por defecto
      // Una vez que tenemos un cuatrimestre, cargamos los archivos
      await fetchEmpleadosFiles();
    } else {
      // Si no hay cuatrimestres disponibles, usar el actual
      setDefaultCuatrimestre();
    }
  } catch (error) {
    console.error('Error al obtener cuatrimestres:', error);
    setDefaultCuatrimestre();
  }
};

// Establecer un cuatrimestre predeterminado basado en la fecha actual
const setDefaultCuatrimestre = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  let cuatrimestreActual;
  if (month >= 1 && month <= 4) cuatrimestreActual = `${year}E`;
  else if (month >= 5 && month <= 8) cuatrimestreActual = `${year}M`;
  else cuatrimestreActual = `${year}S`;
  
  cuatrimestres.value = [cuatrimestreActual];
  cuatrimestreSeleccionado.value = cuatrimestreActual;
  
  // Cargar archivos para el cuatrimestre predeterminado
  await fetchEmpleadosFiles();
};

// Obtener la lista de empleados y sus archivos para el cuatrimestre seleccionado
const fetchEmpleadosFiles = async () => {
  if (!cuatrimestreSeleccionado.value) {
    loading.value = false;
    empleados.value = [];
    return;
  }
  
  loading.value = true;
  try {
    // Verifica que la URL es correcta
    const apiUrl = '/api/empleados-files';
    console.log(`Solicitando datos al endpoint: ${apiUrl} con cuatrimestre: ${cuatrimestreSeleccionado.value}`);
    
    // Verifica que el token de autenticación esté configurado
    console.log('Token configurado:', !!axios.defaults.headers.common['Authorization']);
    
    const response = await axios.get(apiUrl, {
      params: { cuatrimestre: cuatrimestreSeleccionado.value }
    });
    
    // Verifica el tipo de respuesta
    console.log('Tipo de datos recibidos:', typeof response.data);
    
    if (Array.isArray(response.data)) {
      empleados.value = response.data.map(emp => {
        return {
          ...emp,
          carrera: emp.carrera || getDepartamentoFromId(emp.id)
        };
      });
      
      const carrerasSet = new Set();
      empleados.value.forEach(emp => {
        if (emp.carrera) carrerasSet.add(emp.carrera);
      });
      carreras.value = Array.from(carrerasSet).sort();
    } else {
      console.error('La respuesta no es un array. Datos recibidos:', response.data);
      
      // Si es HTML, probablemente hay un problema de autenticación o redirección
      if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
        console.error('Recibiendo HTML en lugar de JSON. Verifica autenticación y rutas de API.');
      }
      
      empleados.value = [];
    }
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    if (error.response) {
      console.error('Estado de respuesta:', error.response.status);
      console.error('Datos de respuesta:', error.response.data);
    }
    empleados.value = [];
  } finally {
    loading.value = false;
  }
};

// Función auxiliar para intentar extraer departamento/carrera del ID de empleado
// Esta es una implementación genérica, ajusta según tu lógica específica
const getDepartamentoFromId = (id) => {
  // Ejemplo: si tus IDs de empleado tienen un formato como "ING-12345" para ingeniería
  // o "ECO-54321" para economía, podrías extraer el prefijo
  if (!id) return '';
  
  const match = id.toString().match(/^([A-Za-z]+)-\d+/);
  if (match && match[1]) {
    // Mapear prefijos a nombres de departamento
    const departamentos = {
      'ING': 'Ingeniería',
      'ECO': 'Economía',
      'MED': 'Medicina',
      'HUM': 'Humanidades'
      // Agrega más según sea necesario
    };
    return departamentos[match[1].toUpperCase()] || '';
  }
  
  return '';
};

// Filtrar empleados basado en los criterios de búsqueda (empleado y carrera)
const empleadosFiltrados = computed(() => {
  // Prevenir errores si empleados no está inicializado
  if (!empleados.value || !Array.isArray(empleados.value)) {
    return [];
  }
  
  return empleados.value.filter(empleado => {
    if (!empleado) return false;
    
    // Filtrar por número de empleado
    const matchEmpleado = !filtroEmpleado.value || 
                         (empleado.id && empleado.id.toString().toLowerCase().includes(filtroEmpleado.value.toLowerCase()));
    
    // Filtrar por carrera
    const matchCarrera = !filtroCarrera.value || 
                         (empleado.carrera && empleado.carrera.toLowerCase() === filtroCarrera.value.toLowerCase());
    
    return matchEmpleado && matchCarrera;
  });
});

// Formatear el tamaño del archivo
const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return 'Desconocido';
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Formatear la fecha
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha desconocida';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', { 
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  } catch (e) {
    console.error('Error al formatear fecha:', e);
    return 'Fecha inválida';
  }
};

// Obtener un nombre más amigable para el archivo
const getFileName = (fullName) => {
  if (!fullName) return 'Archivo sin nombre';
  
  // Remueve el timestamp del nombre (asumiendo formato: timestamp.extension)
  const extensionMatch = fullName.match(/\.[^.]+$/);
  const extension = extensionMatch ? extensionMatch[0] : '';
  
  // Si queremos simplemente mostrar la extensión de archivo
  return `Archivo${extension}`;
  
  // Alternativa: si tienes una forma específica de nombrar los archivos
  // que incluye información significativa, podrías extraerla aquí
};

// Ver archivo
const viewFile = (empleadoId, fileName) => {
  if (!empleadoId || !fileName || !cuatrimestreSeleccionado.value) {
    console.error('Información de archivo incompleta');
    return;
  }
  
  const url = `/api/view-file/${cuatrimestreSeleccionado.value}/${empleadoId}/${fileName}`;
  window.open(url, '_blank');
};

// Observadores y ciclo de vida
watch(cuatrimestreSeleccionado, (newValue) => {
  if (newValue) {
    fetchEmpleadosFiles();
  }
});

onMounted(() => {
  loadUserData();
  fetchCuatrimestres();
});
</script>

<style scoped>
.admin-file-viewer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 10px;
  color: #2c3e50;
}

.user-info {
  text-align: right;
  margin-bottom: 20px;
  color: #666;
  font-size: 0.9rem;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 250px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

select, input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #3498db;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-results {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.empleado-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empleado-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.empleado-header h3 {
  margin: 0;
  color: #2c3e50;
}

.badge {
  background-color: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.no-files {
  padding: 20px;
  text-align: center;
  color: #999;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

tr:hover {
  background-color: #f5f5f5;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-view {
  background-color: #3498db;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  th, td {
    padding: 8px;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>
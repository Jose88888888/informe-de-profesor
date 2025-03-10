<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Variables reactivas
const actividades = ref([]);
const modalAbierto = ref(false);
const modoEdicion = ref(false);
const actividadActual = ref({
  id_actividad: null,
  descripcion: '',
  tipo: 'semanal', // valor por defecto
  status: 'activo', // valor por defecto
  unidad_medida: 'numero' // valor por defecto
});
const mensajeAlerta = ref('');
const tipoAlerta = ref('');
const mostrarAlerta = ref(false);

// Obtener todas las actividades
async function obtenerActividades() {
  try {
    const respuesta = await axios.get('http://localhost:3000/api/select/actividades/Actividades');
    actividades.value = respuesta.data;
    console.log('Actividades cargadas:', actividades.value);
  } catch (error) {
    mostrarMensaje('Error al cargar actividades: ' + error.message, 'error');
    console.error('Error al obtener actividades:', error);
  }
}

// Abrir modal para crear nueva actividad
function abrirModalCrear() {
  actividadActual.value = {
    descripcion: '',
    tipo: 'semanal',
    status: 'activo',
    unidad_medida: 'numero'
  };
  modoEdicion.value = false;
  modalAbierto.value = true;
}

// Abrir modal para editar actividad existente
function abrirModalEditar(actividad) {
  actividadActual.value = { ...actividad };
  modoEdicion.value = true;
  modalAbierto.value = true;
}

// Cerrar modal
function cerrarModal() {
  modalAbierto.value = false;
}

// Guardar actividad (crear o actualizar)
async function guardarActividad() {
  try {
    if (modoEdicion.value) {
      // Actualizar actividad existente
      await actualizarActividad();
    } else {
      // Crear nueva actividad
      await crearActividad();
    }
    cerrarModal();
    obtenerActividades();
  } catch (error) {
    mostrarMensaje('Error al guardar: ' + error.message, 'error');
    console.error('Error al guardar actividad:', error);
  }
}

// Crear nueva actividad
async function crearActividad() {
  try {
    await axios.post('http://localhost:3000/api/insert/actividad', {
      descripcion: actividadActual.value.descripcion,
      tipo: actividadActual.value.tipo,
      status: actividadActual.value.status,
      unidad_medida: actividadActual.value.unidad_medida
    });
    mostrarMensaje('Actividad creada correctamente', 'exito');
  } catch (error) {
    throw new Error('Error al crear actividad: ' + error.message);
  }
}

// Actualizar actividad existente 
async function actualizarActividad() {
  try {
    await axios.put(`http://localhost:3000//api/admin/updateacti/${actividadActual.value.id_actividad}`, {
      descripcion: actividadActual.value.descripcion,
      tipo: actividadActual.value.tipo,
      status: actividadActual.value.status,
      unidad_medida: actividadActual.value.unidad_medida
    });
    mostrarMensaje('Actividad actualizada correctamente', 'exito');
  } catch (error) {
    throw new Error('Error al actualizar actividad: ' + error.message);
  }
}

// Cambiar estado de actividad (activar/desactivar)
async function cambiarEstadoActividad(actividad) {
  const nuevoEstado = actividad.status === 'activo' ? 'inactivo' : 'activo';
  
  try {
    await axios.put(`http://localhost:3000//api/admin/deleteacti/${actividad.id_actividad}`, {
      status: nuevoEstado
    });
    mostrarMensaje(`Actividad ${nuevoEstado === 'activo' ? 'activada' : 'desactivada'} correctamente`, 'exito');
    obtenerActividades();
  } catch (error) {
    mostrarMensaje('Error al cambiar estado: ' + error.message, 'error');
    console.error('Error al cambiar estado:', error);
  }
}

// Eliminar actividad 
async function eliminarActividad(id) {
  if (!confirm('¿Estás seguro de eliminar esta actividad?')) {
    return;
  }
  
  try {
    await axios.delete(`http://localhost:3000/api/admin/actividad/delete/${id}`);
    mostrarMensaje('Actividad eliminada correctamente', 'exito');
    obtenerActividades();
  } catch (error) {
    mostrarMensaje('Error al eliminar actividad: ' + error.message, 'error');
    console.error('Error al eliminar actividad:', error);
  }
}

// Mostrar mensaje de alerta
function mostrarMensaje(mensaje, tipo) {
  mensajeAlerta.value = mensaje;
  tipoAlerta.value = tipo;
  mostrarAlerta.value = true;
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    mostrarAlerta.value = false;
  }, 3000);
}

// Cargar actividades al montar el componente
onMounted(obtenerActividades);
</script>

<template>
  <div class="contenedor-admin">
    <h1 class="titulo">Panel de Administración de Actividades</h1>
    
    <!-- Alerta -->
    <div v-if="mostrarAlerta" :class="['alerta', tipoAlerta === 'exito' ? 'alerta-exito' : 'alerta-error']">
      {{ mensajeAlerta }}
    </div>
    
    <!-- Acciones -->
    <div class="acciones">
      <button @click="abrirModalCrear" class="boton boton-primario">
        Agregar Actividad
      </button>
    </div>
    
    <!-- Tabla de actividades -->
    <div class="tabla-contenedor">
      <table class="tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descripción</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Unidad de Medida</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="actividad in actividades" :key="actividad.id_actividad">
            <td>{{ actividad.id_actividad }}</td>
            <td>{{ actividad.descripcion }}</td>
            <td>
              <span :class="['badge', 'tipo-' + actividad.tipo]">
                {{ actividad.tipo }}
              </span>
            </td>
            <td>
              <span :class="['badge', actividad.status === 'activo' ? 'estado-activo' : 'estado-inactivo']">
                {{ actividad.status }}
              </span>
            </td>
            <td>{{ actividad.unidad_medida }}</td>
            <td class="acciones-celda">
              <button @click="abrirModalEditar(actividad)" class="boton boton-editar">
                Editar
              </button>
              <button 
                @click="cambiarEstadoActividad(actividad)" 
                :class="['boton', actividad.status === 'activo' ? 'boton-desactivar' : 'boton-activar']"
              >
                {{ actividad.status === 'activo' ? 'Desactivar' : 'Activar' }}
              </button>
              <button @click="eliminarActividad(actividad.id_actividad)" class="boton boton-eliminar">
                Eliminar
              </button>
            </td>
          </tr>
          <tr v-if="actividades.length === 0">
            <td colspan="6" class="sin-datos">No hay actividades registradas</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Modal para crear/editar actividad -->
    <div v-if="modalAbierto" class="modal-fondo">
      <div class="modal">
        <div class="modal-cabecera">
          <h2>{{ modoEdicion ? 'Editar Actividad' : 'Crear Actividad' }}</h2>
          <button @click="cerrarModal" class="boton-cerrar">&times;</button>
        </div>
        <div class="modal-cuerpo">
          <form @submit.prevent="guardarActividad">
            <div class="campo-formulario">
              <label for="descripcion">Descripción:</label>
              <input
                id="descripcion"
                v-model="actividadActual.descripcion"
                type="text"
                required
              />
            </div>
            
            <div class="campo-formulario">
              <label for="tipo">Tipo:</label>
              <select id="tipo" v-model="actividadActual.tipo" required>
                <option value="inicial">Inicial</option>
                <option value="especial">Especial</option>
                <option value="semanal">Semanal</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            
            <div class="campo-formulario">
              <label for="status">Estado:</label>
              <select id="status" v-model="actividadActual.status" required>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            
            <div class="campo-formulario">
              <label for="unidad_medida">Unidad de Medida:</label>
              <select id="unidad_medida" v-model="actividadActual.unidad_medida" required>
                <option value="numero">Número</option>
                <option value="horas">Horas</option>
              </select>
            </div>
            
            <div class="modal-pie">
              <button type="button" @click="cerrarModal" class="boton boton-secundario">
                Cancelar
              </button>
              <button type="submit" class="boton boton-primario">
                {{ modoEdicion ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contenedor-admin {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.titulo {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.alerta {
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.alerta-exito {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alerta-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.acciones {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.tabla-contenedor {
  overflow-x: auto;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.tabla th,
.tabla td {
  padding: 12px 15px;
  border: 1px solid #ddd;
  text-align: left;
}

.tabla th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.tabla tr:nth-child(even) {
  background-color: #f2f2f2;
}

.tabla tr:hover {
  background-color: #e9ecef;
}

.acciones-celda {
  display: flex;
  gap: 5px;
}

.sin-datos {
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

.boton {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.boton-primario {
  background-color: #007bff;
  color: white;
}

.boton-primario:hover {
  background-color: #0069d9;
}

.boton-secundario {
  background-color: #6c757d;
  color: white;
}

.boton-secundario:hover {
  background-color: #5a6268;
}

.boton-editar {
  background-color: #ffc107;
  color: black;
}

.boton-editar:hover {
  background-color: #e0a800;
}

.boton-eliminar {
  background-color: #dc3545;
  color: white;
}

.boton-eliminar:hover {
  background-color: #c82333;
}

.boton-activar {
  background-color: #28a745;
  color: white;
}

.boton-activar:hover {
  background-color: #218838;
}

.boton-desactivar {
  background-color: #6c757d;
  color: white;
}

.boton-desactivar:hover {
  background-color: #5a6268;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.tipo-inicial {
  background-color: #17a2b8;
  color: white;
}

.tipo-especial {
  background-color: #6f42c1;
  color: white;
}

.tipo-semanal {
  background-color: #28a745;
  color: white;
}

.tipo-otros {
  background-color: #6c757d;
  color: white;
}

.estado-activo {
  background-color: #28a745;
  color: white;
}

.estado-inactivo {
  background-color: #dc3545;
  color: white;
}

.modal-fondo {
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

.modal {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.modal-cabecera h2 {
  margin: 0;
  font-size: 18px;
}

.boton-cerrar {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
}

.modal-cuerpo {
  padding: 20px;
}

.campo-formulario {
  margin-bottom: 15px;
}

.campo-formulario label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.campo-formulario input,
.campo-formulario select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
}

.modal-pie {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
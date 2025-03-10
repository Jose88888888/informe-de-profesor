<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Variables reactivas
const usuarios = ref([]);
const modalAbierto = ref(false);
const modoEdicion = ref(false);
const usuarioActual = ref({
  id_usuario: null,
  correo: '',
  nombre: '',
  nu_empleado: '',
  contraseña: '',
  rol: 'usuario' // valor por defecto
});
const mensajeAlerta = ref('');
const tipoAlerta = ref('');
const mostrarAlerta = ref(false);

// Obtener todos los usuarios
async function obtenerUsuarios() {
  try {
    const respuesta = await axios.get('http://localhost:3000/api/select/actividades/Usuarios');
    usuarios.value = respuesta.data;
    console.log('Usuarios cargados:', usuarios.value);
  } catch (error) {
    mostrarMensaje('Error al cargar usuarios: ' + error.message, 'error');
    console.error('Error al obtener usuarios:', error);
  }
}

// Abrir modal para crear nuevo usuario
function abrirModalCrear() {
  usuarioActual.value = {
    correo: '',
    nombre: '',
    nu_empleado: '',
    contraseña: '',
    rol: 'usuario'
  };
  modoEdicion.value = false;
  modalAbierto.value = true;
}

// Abrir modal para editar usuario existente
function abrirModalEditar(usuario) {
  usuarioActual.value = { ...usuario, contraseña: '' };
  modoEdicion.value = true;
  modalAbierto.value = true;
}

// Cerrar modal
function cerrarModal() {
  modalAbierto.value = false;
}

// Guardar usuario (crear o actualizar)
async function guardarUsuario() {
  try {
    if (modoEdicion.value) {
      // Actualizar usuario existente
      await actualizarUsuario();
    } else {
      // Crear nuevo usuario
      await crearUsuario();
    }
    cerrarModal();
    obtenerUsuarios();
  } catch (error) {
    mostrarMensaje('Error al guardar: ' + error.message, 'error');
    console.error('Error al guardar usuario:', error);
  }
}

// Crear nuevo usuario
async function crearUsuario() {
  try {
    await axios.post('http://localhost:3000/api/insert/register', {
      correo: usuarioActual.value.correo,
      nombre: usuarioActual.value.nombre,
      nu_empleado: usuarioActual.value.nu_empleado,
      contraseña: usuarioActual.value.contraseña,
      rol: usuarioActual.value.rol
    });
    mostrarMensaje('Usuario creado correctamente', 'exito');
  } catch (error) {
    throw new Error('Error al crear usuario: ' + error.message);
  }
}

// Actualizar usuario existente 
async function actualizarUsuario() {
  try {
    await axios.put(`http://localhost:3000/api/admin/update/${usuarioActual.value.id_usuario}`, {
      correo: usuarioActual.value.correo,
      nombre: usuarioActual.value.nombre,
      nu_empleado: usuarioActual.value.nu_empleado,
      rol: usuarioActual.value.rol,
      // Solo enviar contraseña si se ha modificado
      ...(usuarioActual.value.contraseña ? { contraseña: usuarioActual.value.contraseña } : {})
    });
    mostrarMensaje('Usuario actualizado correctamente', 'exito');
  } catch (error) {
    throw new Error('Error al actualizar usuario: ' + error.message);
  }
}

// Eliminar usuario 
async function eliminarUsuario(id) {
  if (!confirm('¿Estás seguro de eliminar este usuario?')) {
    return;
  }
  
  try {
    // Nota: Este endpoint es sugerido, deberás implementarlo en el backend
    await axios.delete(`http://localhost:3000/api/admin/delete/${id}`);
    mostrarMensaje('Usuario eliminado correctamente', 'exito');
    obtenerUsuarios();
  } catch (error) {
    mostrarMensaje('Error al eliminar usuario: ' + error.message, 'error');
    console.error('Error al eliminar usuario:', error);
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

// Cargar usuarios al montar el componente
onMounted(obtenerUsuarios);
</script>

<template>
  <div class="contenedor-admin">
    <h1 class="titulo">Panel de Administración de Usuarios</h1>
    
    <!-- Alerta -->
    <div v-if="mostrarAlerta" :class="['alerta', tipoAlerta === 'exito' ? 'alerta-exito' : 'alerta-error']">
      {{ mensajeAlerta }}
    </div>
    
    <!-- Acciones -->
    <div class="acciones">
      <button @click="abrirModalCrear" class="boton boton-primario">
        Agregar Usuario
      </button>
    </div>
    
    <!-- Tabla de usuarios -->
    <div class="tabla-contenedor">
      <table class="tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Número de Empleado</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario.id_usuario">
            <td>{{ usuario.id_usuario }}</td>
            <td>{{ usuario.nombre }}</td>
            <td>{{ usuario.correo }}</td>
            <td>{{ usuario.nu_empleado }}</td>
            <td>{{ usuario.rol }}</td>
            <td class="acciones-celda">
              <button @click="abrirModalEditar(usuario)" class="boton boton-editar">
                Editar
              </button>
              <button @click="eliminarUsuario(usuario.id_usuario)" class="boton boton-eliminar">
                Eliminar
              </button>
            </td>
          </tr>
          <tr v-if="usuarios.length === 0">
            <td colspan="6" class="sin-datos">No hay usuarios registrados</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Modal para crear/editar usuario -->
    <div v-if="modalAbierto" class="modal-fondo">
      <div class="modal">
        <div class="modal-cabecera">
          <h2>{{ modoEdicion ? 'Editar Usuario' : 'Crear Usuario' }}</h2>
          <button @click="cerrarModal" class="boton-cerrar">&times;</button>
        </div>
        <div class="modal-cuerpo">
          <form @submit.prevent="guardarUsuario">
            <div class="campo-formulario">
              <label for="nombre">Nombre:</label>
              <input
                id="nombre"
                v-model="usuarioActual.nombre"
                type="text"
                required
              />
            </div>
            
            <div class="campo-formulario">
              <label for="correo">Correo:</label>
              <input
                id="correo"
                v-model="usuarioActual.correo"
                type="email"
                required
              />
            </div>
            
            <div class="campo-formulario">
              <label for="nu_empleado">Número de Empleado:</label>
              <input
                id="nu_empleado"
                v-model="usuarioActual.nu_empleado"
                type="text"
                required
              />
            </div>
            
            <div class="campo-formulario">
              <label for="contraseña">
                {{ modoEdicion ? 'Contraseña (dejar en blanco para mantener actual):' : 'Contraseña:' }}
              </label>
              <input
                id="contraseña"
                v-model="usuarioActual.contraseña"
                type="password"
                :required="!modoEdicion"
              />
            </div>
            
            <div class="campo-formulario">
              <label for="rol">Rol:</label>
              <select id="rol" v-model="usuarioActual.rol" required>
                <option value="admin">Administrador</option>
                <option value="usuario">Usuario</option>
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
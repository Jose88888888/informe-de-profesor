<template>
  <div class="container">
    <h2 class="title">Informe</h2>
    <form @submit.prevent="submitForm" class="form">
      <div class="info-panel">
        <div class="info-item">
          <label>Fecha:</label>
          <span>{{ fechaActual }}</span>
        </div>
        <div class="info-item">
          <label>Cuatrimestre:</label>
          <span>{{ cuatrimestre }}</span>
        </div>
        <div class="info-item">
          <label>Usuario:</label>
          <span>{{ nombreUsuario }}</span>
        </div>
      </div>
      <div class="form-group">
        <label for="parcial">Periodo:</label>
        <input 
          type="number" 
          id="parcial" 
          v-model="formData.parcial" 
          required 
          min="1" 
          class="input"
        />
      </div>
      <div class="buttons">
        <button type="submit" class="btn-submit">Guardar Informe</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { watch } from "vue";
const router = useRouter();
const nombreUsuario = ref('');
const idUsuario = ref();
const formData = ref({ parcial: 1 });

watch(() => formData.value.parcial, (nuevoValor, antiguoValor) => {
  if (nuevoValor < 1 || nuevoValor > 3) {
    formData.value.parcial = antiguoValor; // Revertir al último valor válido
  }
});
const fechaActual = ref('');
const cuatrimestre = ref('');

onMounted(() => {
 verificarSesion();
  establecerFecha();
});

const verificarSesion = () => {
  const userId = localStorage.getItem("userid");
  const userNombre = localStorage.getItem("usernombre");

  if (userId) {
    nombreUsuario.value = userNombre || "Usuario";
    idUsuario.value = userId;
  } else {
    router.push("/");
    alert("Debe iniciar sesión para acceder a esta página");
  }
}

const establecerFecha = () => {
  const fecha = new Date();
  fechaActual.value = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const mes = fecha.getMonth() + 1;
  const anio = fecha.getFullYear();
  cuatrimestre.value = mes <= 4 ? `${anio}E` : mes <= 8 ? `${anio}M` : `${anio}S`;
};

const submitForm = async () => {
  try {
    if (!idUsuario.value) throw new Error('No se encontró información del usuario. Inicie sesión nuevamente.');

    const informeData = {
      id_usuario: localStorage.getItem('userid'),
      cuatrimestre: cuatrimestre.value,
      parcial: formData.value.parcial,
      fecha: new Date().toISOString().split('T')[0],
      estatus: 'Activo'
    };

    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    // Enviar la solicitud y capturar la respuesta
    const response = await axios.post('http://localhost:3000/api/informes', informeData, { headers });

    // Guardar el id_informe en localStorage si la inserción fue exitosa
    if (response.data && response.data.id_informe) {
      localStorage.setItem('id_informe', response.data.id_informe);
    }

    alert('Informe guardado con éxito');
    formData.value.parcial = 1;
  } catch (error) {
    alert('Error al guardar el informe: ' + (error.response?.data?.message || error.message));
  }
};

</script>

<style scoped>
.container {
  max-width: 800px;
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
.info-panel {
  background: #eaeaea;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.info-item {
  display: flex;
  flex-direction: column;
}
.info-item label {
  font-weight: bold;
  margin-bottom: 5px;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}
.buttons {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.btn-submit {
  padding: 12px 25px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  background: #28a745;
  color: white;
  font-size: 16px;
  transition: background 0.3s;
}
.btn-submit:hover {
  background: #218838;
}
@media (max-width: 600px) {
  .info-panel {
    grid-template-columns: 1fr;
  }
}
</style>

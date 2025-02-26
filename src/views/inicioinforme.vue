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
          <label for="parcial">Parcial:</label>
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
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        nombreUsuario: '', 
        idUsuario: null,
        numeroEmpleado: '',
        rolUsuario: '',
        formData: {
          parcial: 1,
        },
        fechaActual: '',
        cuatrimestre: ''
      }
    },
    created() {
      // Verificar si hay sesión activa
      this.verificarSesion();
      
      // Establecer la fecha actual y calcular el cuatrimestre
      this.establecerFecha();
    },
    methods: {
      verificarSesion() {
        // Obtener datos de usuario desde localStorage
        const userInfo = localStorage.getItem('userInfo');
        
        if (userInfo) {
          const parsedInfo = JSON.parse(userInfo);
          this.nombreUsuario = parsedInfo.nombre || 'Usuario';
          this.idUsuario = parsedInfo.id;
          this.numeroEmpleado = parsedInfo.empleado;
          this.rolUsuario = parsedInfo.rol;
        } else {
          // No hay información de usuario, redireccionar al login
          this.$router.push('/login');
          alert('Debe iniciar sesión para acceder a esta página');
        }
      },
      establecerFecha() {
        const fecha = new Date();
        
        // Formatear fecha para mostrar
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        this.fechaActual = fecha.toLocaleDateString('es-ES', options);
        
        // Calcular cuatrimestre
        const mes = fecha.getMonth() + 1; // getMonth() devuelve 0-11
        const anio = fecha.getFullYear();
        
        if (mes >= 1 && mes <= 4) {
          this.cuatrimestre = `${anio}E`;
        } else if (mes >= 5 && mes <= 8) {
          this.cuatrimestre = `${anio}M`;
        } else {
          this.cuatrimestre = `${anio}S`;
        }
      },
      async submitForm() {
        try {
          // Verificar si tenemos toda la información necesaria
          if (!this.idUsuario) {
            throw new Error('No se encontró información del usuario. Por favor, inicie sesión nuevamente.');
          }
          
          // Crear objeto con todos los datos necesarios
          const informeData = {
            id_usuario: this.idUsuario,
            cuatrimestre: this.cuatrimestre,
            parcial: this.formData.parcial,
            fecha: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
            status: 'Pendiente' // Estado inicial
          };
          
          // Obtener el token si existe
          const token = localStorage.getItem('token');
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          
          // Enviar datos a la API
          const response = await axios.post('http://localhost:3000/api/informes', informeData, { headers });
          
          // Mostrar mensaje de éxito
          alert('Informe guardado con éxito');
          console.log('Respuesta del servidor:', response.data);
          
          // Resetear formulario
          this.formData.parcial = 1;
          
        } catch (error) {
          console.error('Error al guardar el informe:', error);
          alert('Error al guardar el informe: ' + (error.response?.data?.message || error.message));
        }
      },
      cerrarSesion() {
        // Eliminar datos de localStorage
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        
        // Redireccionar al login
        this.$router.push('/login');
      }
    }
  }
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
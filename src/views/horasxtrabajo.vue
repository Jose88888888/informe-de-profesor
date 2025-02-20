<script setup>
 import { ref } from 'vue';
 import axios from 'axios';
 // localStorage.setItem("id_usuario", 1); // esto sirver para guardar un dato en la compu del usuario

 // data:{
 // id_usuario:localStorage.getItem("id_usuario"); y asi para mandarlo llamar

 const variable=ref([{}]);
 async function conect(){
        const options = {
            method: 'GET',
            url: "http://localhost:3000/api/actividades/actividades/inicial",
            headers: {
            'Content-Type': 'application/json',
            },
            data
             // id_usuario:localStorage.getItem("id_usuario"); y asi para mandarlo llamar

        }
        try {
            const response = await axios.request(options)
            console.log(variable.value);
            variable.value=response.data;
            console.log("response",variable.value);

            /* response.data.forEach(element => {
                console.log(element);
            }); */
            //return response.data
        }
        catch (error) {
            console.error(error)
            //return [{}]
        }
    }

    conect();
    //aqui poner la otra funcion de de la api de inserccion cuando este lista

</script>


<template>
  <div class="container">
    <h2 class="title">Primer informe</h2>
    <form @submit.prevent="submitForm" class="form">
      <table class="form-table">
        <thead>
          <tr>
            <th>Campo</th>
            <th>Horas/Días</th>
            <th>Observaciones</th>
            <th>Archivo</th>
          </tr>
        </thead>
        <tbody>

          <tr v-for="item in variable">
            <td><label for="horasClase">{{ item.descripcion }}</label></td>
            <td><input type="numbrer"></td>
            <td><input type="text"/></td>
            <td><input type="file"/></td>
          

          
        <!--     <td><label for="proyectos">Número de proyectos de estadía asignados:</label></td>
            <td><input type="number" id="proyectos" v-model.number="formData.proyectos" class="input" /></td>
            <td><textarea v-model="formData.observaciones.proyectos" class="textarea"></textarea></td>
            <td><input type="file" class="file-input" /></td>
          
            <td><label for="tutorias">Número de grupos de tutorías asignados:</label></td>
            <td><input type="number" id="tutorias" v-model.number="formData.tutorias" class="input" /></td>
            <td><textarea v-model="formData.observaciones.tutorias" class="textarea"></textarea></td>
            <td><input type="file" class="file-input" /></td>
          
            <td><label for="integradores">Número de proyectos integradores asignados:</label></td>
            <td><input type="number" id="integradores" v-model.number="formData.integradores" class="input" /></td>
            <td><textarea v-model="formData.observaciones.integradores" class="textarea"></textarea></td>
            <td><input type="file" class="file-input" /></td> -->
          </tr>

        </tbody>
      </table>

      <div class="buttons">
        <button type="submit" class="btn-submit">Enviar</button>
        <button type="button" @click="resetForm" class="btn-reset">Limpiar</button>
      </div>
    </form>
  </div>
</template>


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

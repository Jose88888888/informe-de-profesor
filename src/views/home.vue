<template>
  <div>
    <h1>Bienvenido a informe de profesor</h1>
    <p>
      Si es tu primer inicio, 
      <router-link to="/inicioinforme" class="btn-inicio">
        ir a la opción de "informe parcial"
      </router-link>
    </p>
    <p>
      Si no tienes informes activos,
      <router-link to="/inicioinforme" class="btn-inicio">
        ir a "informe parcial"
      </router-link>
    </p>
    <p>Selecciona una opción del menú.</p>
  </div>
</template>

<style scoped>
.btn-inicio {
  display: inline-block;
  background-color: #4CAF50;
  color: white;
  padding: 8px 15px;
  text-align: center;
  text-decoration: none;
  border-radius: 4px;
  margin-left: 5px;
  cursor: pointer;
}

.btn-inicio:hover {
  background-color: #45a049;
}
</style>
  
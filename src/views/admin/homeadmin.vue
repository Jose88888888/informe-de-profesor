<template>
  <div>
    <h1>Bienvenido administrador</h1>
    <p>
    Si quieres modificar usuario, 
      <router-link to="/adminuser" class="btn-inicio">
        ir a la opción de Gestión de usuario
      </router-link>
    </p>
    <p>
      Si quieres modificar actividades,
      <router-link to="/adminacti" class="btn-inicio">
        ir a Gestión de actividades
      </router-link>
    </p>
    <p>
      Si quieres ver los reportes finales,
      <router-link to="/admininforme" class="btn-inicio">
        ir a Historial de informes
      </router-link>
    </p>
    <p>Selecciona una opción del menú.</p>
  </div>
</template>

<style scoped>
.btn-inicio {
  display: inline-block;
  background-color: #00AB84;
  color: white;
  padding: 8px 15px;
  text-align: center;
  text-decoration: none;
  border-radius: 4px;
  margin-left: 5px;
  cursor: pointer;
}

.btn-inicio:hover {
  background-color: #00AB84;
}
</style>
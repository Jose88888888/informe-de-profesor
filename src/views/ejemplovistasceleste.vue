// Hay dos posibles soluciones, dependiendo de cómo esté estructurado tu código:

// SOLUCIÓN 1: Si quieres usar la función generarPDFFormateado que ya tienes
// Modifica la función finalizarInforme en reportefinal.vue para que llame a generarPDFFormateado en lugar de generarPDF

async function finalizarInforme() {
  try {
    // Lógica existente para finalizar el informe
    // ...
    
    // Cambiar esta línea:
    // generarPDF(); // Esta línea está causando el error
    
    // Por esta:
    generarPDFFormateado(informeData); // Usa la función que ya está definida
    
    // Resto del código...
  } catch (error) {
    console.error("Error al finalizar el informe:", error);
    // Manejo de errores...
  }
}

// SOLUCIÓN 2: Si necesitas ambas funciones, añade la función generarPDF al archivo

// Añade esta función en tu archivo reportefinal.vue
function generarPDF() {
  if (datosCompleto.value.length === 0) {
    alert('No hay datos para generar el PDF');
    return;
  }

  try {
    // Usamos la información del informe actual
    const informe = datosCompleto.value[0];
    
    // Llamamos a la función formateada con los datos necesarios
    generarPDFFormateado(informe);
    
    console.log('PDF generado correctamente');
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Ocurrió un error al generar el PDF');
  }
}
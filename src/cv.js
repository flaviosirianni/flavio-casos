/** Por que existe: permitir imprimir o guardar el CV como PDF desde el navegador.
 * @returns {void} Efectos secundarios: abre el diálogo nativo de impresión. */
function printCV() { window.print(); }
document.getElementById('print-cv').addEventListener('click', printCV);

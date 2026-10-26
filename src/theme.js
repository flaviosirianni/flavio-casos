/** Por que existe: aplicar el tema antes de pintar sin parpadeos.
 * @returns {void} Efectos secundarios: lee preferencia local y cambia data-theme.
 * Errores esperados: almacenamiento bloqueado; se conserva el tema del sistema. */
(function applySavedTheme() {
  'use strict';
  try {
    var saved = localStorage.getItem('flavio-portfolio-theme');
    if (saved === 'dark' || saved === 'light') document.documentElement.dataset.theme = saved;
  } catch (_) { /* Browsers can disable storage for offline documents. */ }
})();

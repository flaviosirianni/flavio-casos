/* Catalog controls and page navigation; all case/demo content is static and localized. */
(function () {
  'use strict';
  var lang = document.documentElement.lang === 'en' ? 'en' : 'es';
  var words = lang === 'en' ? { cases:'cases', light:'Switch to light theme', dark:'Switch to dark theme' } : { cases:'casos', light:'Activar tema claro', dark:'Activar tema oscuro' };
  /** Por que existe: hacer búsquedas sin distinguir acentos o mayúsculas.
   * @returns {string} Texto normalizado. Efectos secundarios: ninguno. */
  function normalize(value) { return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  /** Por que existe: reflejar el tema que activará el botón.
   * @returns {void} Efectos secundarios: actualiza etiquetas accesibles. */
  function updateThemeLabel() {
    var button = document.getElementById('theme-toggle'); if (!button) return;
    var dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    button.setAttribute('aria-label', dark ? words.light : words.dark);
    button.title = dark ? words.light : words.dark;
    button.firstElementChild.textContent = dark ? '☀' : '◐';
  }
  /** Por que existe: conservar el tema entre idiomas y páginas.
   * @returns {void} Efectos secundarios: cambia DOM y preferencia local.
   * Errores esperados: localStorage bloqueado; el cambio visual permanece activo. */
  function toggleTheme() {
    var current = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('flavio-portfolio-theme', next); } catch (_) { /* Optional persistence. */ }
    updateThemeLabel();
  }
  var theme = document.getElementById('theme-toggle');
  if (theme) theme.addEventListener('click', toggleTheme);
  updateThemeLabel();

  var cards = Array.from(document.querySelectorAll('.case-card'));
  var search = document.getElementById('search');
  var technology = document.getElementById('technology');
  var reset = document.getElementById('reset-filters');
  var category = 'all';
  cards.forEach(function(card) { card._search = normalize(card.dataset.title+' '+card.dataset.sector+' '+card.dataset.summary+' '+card.dataset.stack); });
  /** Por que existe: combinar categoría, tecnología y búsqueda sin perder resultados.
   * @returns {void} Efectos secundarios: cambia visibilidad y contador accesible. */
  function filterCatalog() {
    var query = normalize(search.value.trim()), tech = technology.value, count = 0;
    cards.forEach(function(card) {
      var categoryMatch = category === 'all' || (category === 'ongoing' ? !!card.dataset.status && !['Implementado','Implemented'].includes(card.dataset.status) : card.dataset.category === category);
      var technologyMatch = !tech || card.dataset.stack.split(',').map(function(v) { return v.trim(); }).includes(tech);
      var visible = categoryMatch && technologyMatch && (!query || card._search.includes(query));
      card.hidden = !visible;
      if (visible) count++;
    });
    document.querySelectorAll('.filter-chip').forEach(function(button) { button.setAttribute('aria-pressed', String(button.dataset.category === category)); });
    document.getElementById('result-count').textContent = count + ' / ' + cards.length + ' ' + words.cases;
    document.getElementById('empty').hidden = count > 0;
    reset.hidden = category === 'all' && !query && !tech;
    document.dispatchEvent(new Event('portfolio:filter'));
  }
  /** Por que existe: recuperar el catálogo completo desde cualquier estado vacío.
   * @returns {void} Efectos secundarios: restablece controles y resultados. */
  function resetCatalog() { category = 'all'; search.value = ''; technology.value = ''; filterCatalog(); }
  if (search) {
    search.addEventListener('input', filterCatalog);
    technology.addEventListener('change', filterCatalog);
    reset.addEventListener('click', resetCatalog);
    document.querySelectorAll('.filter-chip').forEach(function(button) { button.addEventListener('click', function() { category = button.dataset.category; filterCatalog(); }); });
    filterCatalog();
    // Older shared links with a case hash resolve to its new standalone page.
    var legacySlug = '';
    try { legacySlug = decodeURIComponent(location.hash.slice(1)); } catch (_) { /* Invalid shared hash: keep the catalog usable. */ }
    var legacy = cards.find(function(card) { return card.dataset.slug === legacySlug; });
    if (legacy) location.replace(legacy.href);
  }
  var previewPlayers = [];
  if (window.PortfolioDemos) {
    document.querySelectorAll('.demo-preview, .demo-mount').forEach(function(host) {
      var controller = window.PortfolioDemos.mount(host, host.dataset.demo, {lang:lang, compact:host.classList.contains('demo-preview'), step:new URLSearchParams(location.search).get('step')});
      if (controller && host.classList.contains('demo-preview')) previewPlayers.push(controller);
    });
  }
  var previewToggle = document.getElementById('preview-toggle');
  var previewsPaused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** Por que existe: indicar el control global de movimiento del catálogo.
   * @returns {void} Efectos secundarios: actualiza etiqueta y estado del botón. */
  function updatePreviewLabel() {
    if (!previewToggle) return;
    previewToggle.setAttribute('aria-pressed', String(previewsPaused));
    previewToggle.textContent = (previewsPaused ? '▶ ' : 'Ⅱ ') + (lang === 'en' ? (previewsPaused ? 'Resume previews' : 'Pause previews') : (previewsPaused ? 'Reanudar demos' : 'Pausar demos'));
  }
  /** Por que existe: detener o reanudar todas las vistas sin cambiar preferencias del sistema.
   * @returns {void} Efectos secundarios: actualiza reproductores compactos y botón. */
  function togglePreviews() { previewsPaused = !previewsPaused; previewPlayers.forEach(function(player) { player.setPlaying(!previewsPaused); }); updatePreviewLabel(); }
  if (previewToggle) { previewToggle.addEventListener('click',togglePreviews); updatePreviewLabel(); }
})();

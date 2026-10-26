
(function () {
  "use strict";
  /** Por que existe: normalizar búsquedas en español.
   * @returns {string} Texto en minúsculas sin acentos. Efectos secundarios: ninguno. */
  function normalize(value) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
  /** Por que existe: ofrecer control explícito del tema visual.
   * @returns {void} Efectos secundarios: cambia el tema y la etiqueta accesible. */
  function toggleTheme() {
    var currentTheme = document.documentElement.dataset.theme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var theme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    this.textContent = theme === "dark" ? "Modo claro" : "Modo oscuro";
    this.setAttribute("aria-label", "Activar " + this.textContent.toLowerCase());
  }
  var CATS = {
    datos: "Datos y tableros",
    bots: "Asistentes y bots",
    apps: "Apps operativas",
    integ: "Integraciones",
    sheets: "Automatización en planillas",
    prod: "Productos y sitios",
    int: "Herramientas internas"
  };
  var tools = Array.prototype.slice.call(document.querySelectorAll("#tools > .tool"));
  /* Sin ids reales en las secciones: así el navegador no salta al ancla y cada caso abre arriba */
  var bySlug = {};
  tools.forEach(function (t) { t.dataset.slug = t.id; bySlug[t.id] = t; t.removeAttribute("id"); });
  var indexView = document.getElementById("index-view");
  var backlink = document.getElementById("backlink");

  /* ---------- Gráficos de las pantallas recreadas ---------- */
  var NS = "http://www.w3.org/2000/svg";
  /** Por que existe: validar valores numéricos del gráfico.
   * @returns {*} Resultado de la operación. Efectos secundarios: ninguno. */
  function ok(v) { return v !== null && v !== undefined && !isNaN(v); }
  /** Por que existe: convertir series CSV en números.
   * @returns {*} Resultado de la operación. Efectos secundarios: ninguno. */
  function nums(s) { return String(s || "").split(",").map(function (x) { return parseFloat(x); }); }
  /** Por que existe: crear nodos SVG de las capturas.
   * @returns {*} Resultado de la operación. Efectos secundarios: actualiza el DOM local. */
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  /** Por que existe: elegir un límite legible del eje.
   * @returns {*} Resultado de la operación. Efectos secundarios: ninguno. */
  function niceMax(m) {
    if (m <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(m))), n = m / p;
    var step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return step * p;
  }
  /** Por que existe: formatear valores para el gráfico.
   * @returns {*} Resultado de la operación. Efectos secundarios: ninguno. */
  function fmt(v, d) {
    var loc = d.locale || "es-AR";
    var s;
    if (d.fmt === "k") s = (v / 1000).toLocaleString(loc, { maximumFractionDigits: 1 }) + "k";
    else if (d.fmt === "M") s = (v / 1e6).toLocaleString(loc, { maximumFractionDigits: 1 }) + "M";
    else s = v.toLocaleString(loc, { maximumFractionDigits: 1 });
    return (d.pre || "") + s + (d.fmt === "%" ? "%" : "") + (d.suf || "");
  }
  /** Por que existe: dibujar gráficos de las capturas.
   * @returns {void} Resultado de la operación. Efectos secundarios: actualiza el DOM local. */
  function renderChart(box) {
    var d = box.dataset, type = d.type || "bar";
    var W = +d.w || 340, H = +d.h || 150;
    var labels = d.labels ? d.labels.split("|") : [];
    var series = d.series ? JSON.parse(d.series) : [{ values: nums(d.values), color: d.color }];
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img" });
    var txt = "fill:#8a94a3;font:9px Inter,system-ui,sans-serif";
    if (type === "donut") {
      var vals = series[0].values, cols = (d.colors || "").split(",");
      var tot = vals.reduce(function (a, b) { return a + b; }, 0), r = Math.min(W, H) / 2 - 12, cx = W / 2, cy = H / 2, acc = 0;
      el("circle", { cx: cx, cy: cy, r: r, style: "fill:none;stroke:#eef0f3;stroke-width:16" }, svg);
      vals.forEach(function (v, i) {
        var len = v / tot * 100;
        el("circle", { cx: cx, cy: cy, r: r, pathLength: 100, transform: "rotate(-90 " + cx + " " + cy + ")",
          style: "fill:none;stroke:" + (cols[i] || "#2e5e9e") + ";stroke-width:16;stroke-dasharray:" + Math.max(len - 0.6, 0) + " " + (100 - len + 0.6) + ";stroke-dashoffset:" + (-acc) }, svg);
        acc += len;
      });
      if (d.center) { var c = el("text", { x: cx, y: cy + 4, "text-anchor": "middle", style: "fill:#1d2733;font:700 17px Inter,system-ui,sans-serif" }, svg); c.textContent = d.center; }
      if (d.sub) { var s2 = el("text", { x: cx, y: cy + 17, "text-anchor": "middle", style: txt }, svg); s2.textContent = d.sub; }
      box.appendChild(svg); return;
    }
    var stacked = d.mode === "stack";
    var n = Math.max.apply(null, series.map(function (s) { return s.values.length; }));
    var max = 0, min = 0;
    for (var i = 0; i < n; i++) {
      if (stacked) { var t = 0; series.forEach(function (s) { t += s.values[i] || 0; }); max = Math.max(max, t); }
      else series.forEach(function (s) { if (ok(s.values[i])) { max = Math.max(max, s.values[i]); min = Math.min(min, s.values[i]); } });
    }
    var bottom = min < 0 ? -niceMax(-min) : (d.min ? +d.min : 0);
    var top = d.max ? +d.max : bottom + niceMax(max - bottom);
    var padL = d.nolabels === "y" ? 6 : 34, padR = 6, padT = 8, padB = labels.length ? 18 : 6;
    var pw = W - padL - padR, ph = H - padT - padB;
    /** Por que existe: proyectar valores al eje vertical.
   * @returns {*} Resultado de la operación. Efectos secundarios: ninguno. */
  function y(v) { return padT + ph - (v - bottom) / (top - bottom) * ph; }
    var ticks = +d.ticks || 4;
    for (var k = 0; k <= ticks; k++) {
      var v = bottom + (top - bottom) * k / ticks, yy = y(v);
      el("line", { x1: padL, x2: W - padR, y1: yy, y2: yy, style: "stroke:" + (v === 0 ? "#cdd3db" : "#eceff3") + ";stroke-width:1" }, svg);
      if (d.nolabels !== "y") { var tl = el("text", { x: padL - 5, y: yy + 3, "text-anchor": "end", style: txt }, svg); tl.textContent = fmt(v, d); }
    }
    var gw = pw / n;
    labels.forEach(function (l, i) {
      if (+d.every && i % +d.every) return;
      var lt = el("text", { x: padL + gw * i + gw / 2, y: H - 5, "text-anchor": "middle", style: txt }, svg); lt.textContent = l;
    });
    if (type === "bar") {
      var inner = gw * (+d.bw || 0.62), bw = stacked ? inner : inner / series.length;
      for (var j = 0; j < n; j++) {
        var base = 0;
        series.forEach(function (s, si) {
          var val = s.values[j]; if (!ok(val)) return;
          var x = padL + gw * j + (gw - inner) / 2 + (stacked ? 0 : bw * si);
          var y0 = stacked ? y(base + val) : y(Math.max(val, 0)), y1 = stacked ? y(base) : y(Math.min(val, 0));
          var col = (s.colors && s.colors[j]) || s.color || "var(--brand,#2e5e9e)";
          el("rect", { x: x + 0.5, y: y0, width: Math.max(bw - 1.5, 1), height: Math.max(y1 - y0, 0.5), rx: stacked ? 0 : 2, style: "fill:" + col }, svg);
          if (d.vals && !stacked) { var vt = el("text", { x: x + bw / 2, y: y0 - 3, "text-anchor": "middle", style: "fill:#4b5563;font:600 8.5px Inter,system-ui,sans-serif" }, svg); vt.textContent = fmt(val, d); }
          base += val;
        });
      }
    } else {
      series.forEach(function (s, si) {
        var pts = [];
        s.values.forEach(function (val, j) { if (ok(val)) pts.push([padL + gw * j + gw / 2, y(val)]); });
        if (!pts.length) return;
        var col = s.color || "var(--brand,#2e5e9e)";
        var dstr = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
        if (si === 0 && d.area) el("path", { d: dstr + " L" + pts[pts.length - 1][0] + " " + y(bottom) + " L" + pts[0][0] + " " + y(bottom) + " Z", style: "fill:" + col + ";opacity:.12" }, svg);
        el("path", { d: dstr, style: "fill:none;stroke:" + col + ";stroke-width:" + (s.width || 2) + ";stroke-linejoin:round;stroke-linecap:round" + (s.dash ? ";stroke-dasharray:4 3" : "") }, svg);
        var last = pts[pts.length - 1];
        if (!s.dash) el("circle", { cx: last[0], cy: last[1], r: 3, style: "fill:#fff;stroke:" + col + ";stroke-width:2" }, svg);
      });
    }
    box.appendChild(svg);
  }
  Array.prototype.forEach.call(document.querySelectorAll(".chart"), renderChart);

  /* ---------- Capturas a escala ---------- */
  /** Por que existe: ajustar las capturas al espacio disponible.
   * @returns {void} Resultado de la operación. Efectos secundarios: actualiza el DOM local. */
  function fit(sc) {
    var c = sc.firstElementChild; if (!c) return;
    var avail = sc.clientWidth; if (!avail) return;
    c.style.transform = "";
    var nat = c.offsetWidth, s = Math.min(1, avail / nat);
    if (s < 1) c.style.transform = "scale(" + s + ")";
    sc.classList.toggle("scaled", s < 1);
    sc.style.height = Math.ceil(c.offsetHeight * s) + "px";
  }
  var ro = "ResizeObserver" in window ? new ResizeObserver(function (entries) {
    entries.forEach(function (e) {
      var key = Math.round(e.contentRect.width) + "x" + Math.round(e.contentRect.height);
      if (e.target._k === key) return;
      e.target._k = key;
      if (e.target.classList.contains("thumb")) fitThumb(e.target);
      else if (e.target.classList.contains("canvas")) fit(e.target.parentNode);
      else fit(e.target);
    });
  }) : null;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {
    Array.prototype.forEach.call(document.querySelectorAll(".scaler"), fit);
  });
  Array.prototype.forEach.call(document.querySelectorAll(".shot > .dev"), function (dev) {
    var sc = document.createElement("div");
    sc.className = "scaler";
    dev.parentNode.insertBefore(sc, dev);
    sc.appendChild(dev);
    dev.classList.add("canvas");
    if (ro) { ro.observe(sc); ro.observe(dev); } else fit(sc);
  });

  /* ---------- Encabezados y paginación de cada caso ---------- */
  tools.forEach(function (t, i) {
    var d = t.dataset, head = t.querySelector(".tool-head");
    var crumbs = document.createElement("p");
    crumbs.className = "crumbs";
    crumbs.innerHTML = '<a href="#">Casos</a><span aria-hidden="true">/</span><span>' + (CATS[d.cat] || "") + "</span>";
    head.insertBefore(crumbs, head.firstChild);
    if (d.status) {
      var st = document.createElement("span");
      st.className = "status"; st.textContent = d.status;
      var mr = head.querySelector(".meta-row");
      if (mr) mr.appendChild(st); else head.appendChild(st);
    }
    var prev = tools[(i - 1 + tools.length) % tools.length], next = tools[(i + 1) % tools.length];
    var pager = document.createElement("nav");
    pager.className = "wrap pager"; pager.setAttribute("aria-label", "Otros casos");
    pager.innerHTML = '<a class="prev" href="#' + prev.dataset.slug + '"><span>Caso anterior</span><b>' + prev.dataset.title + '</b></a><a class="next" href="#' + next.dataset.slug + '"><span>Caso siguiente</span><b>' + next.dataset.title + "</b></a>";
    t.appendChild(pager);
    t.hidden = true;
  });

  /* ---------- Índice: tarjetas con miniatura ---------- */
  var grid = document.getElementById("grid");
  /** Por que existe: ajustar miniaturas del catálogo.
   * @returns {void} Resultado de la operación. Efectos secundarios: actualiza el DOM local. */
  function fitThumb(th) {
    var c = th.firstElementChild; if (!c) return;
    var tw = th.clientWidth; if (!tw) return;
    var nat = c.offsetWidth, s = Math.min((tw - 28) / nat, nat < 420 ? 0.62 : 1);
    c.style.transform = "translateX(-50%) scale(" + s + ")";
  }
  var cards = tools.map(function (t) {
    var d = t.dataset;
    var a = document.createElement("a");
    a.className = "card"; a.href = "#" + t.dataset.slug;
    var th = document.createElement("div");
    th.className = "thumb"; th.setAttribute("aria-hidden", "true");
    var devs = t.querySelectorAll(".shot .canvas"), src = devs[+d.thumb || 0] || devs[0];
    if (src) {
      var cl = src.cloneNode(true);
      cl.classList.remove("canvas"); cl.classList.add("clone"); cl.style.transform = "";
      th.appendChild(cl);
    }
    if (d.status) { var st = document.createElement("span"); st.className = "status"; st.textContent = d.status; th.appendChild(st); }
    var body = document.createElement("div");
    body.className = "body";
    var stack = (d.stack || "").split(",").map(function (s) { return '<span class="tag">' + s.trim() + "</span>"; }).join("");
    body.innerHTML = '<p class="sector">' + d.sector + "</p><h3>" + d.title + '</h3><p class="sum">' + d.summary + '</p><div class="tags">' + stack + "</div>";
    a.appendChild(th); a.appendChild(body);
    grid.appendChild(a);
    if (ro) ro.observe(th);
    a._t = t;
    a._text = normalize(d.title + " " + d.summary + " " + d.sector + " " + d.stack + " " + (CATS[d.cat] || ""));
    return a;
  });

  var allStack = {};
  tools.forEach(function (t) { (t.dataset.stack || "").split(",").forEach(function (s) { if (s.trim()) allStack[s.trim()] = 1; }); });
  document.getElementById("facts").innerHTML =
    "<span><b>" + tools.length + "</b>casos documentados</span>" +
    "<span><b>" + Object.keys(allStack).length + "</b>tecnologías y plataformas</span>" +
    "<span><b>" + Object.keys(CATS).length + "</b>tipos de solución</span>";

  var filters = document.getElementById("filters"), active = "all", query = "", technology = "";
  /** Por que existe: contar casos por categoría.
   * @returns {*} Resultado de la operación. Efectos secundarios: ninguno. */
  function count(key) {
    return tools.filter(function (t) { return key === "all" || (key === "curso" ? !!t.dataset.status : t.dataset.cat === key); }).length;
  }
  var keys = ["all"].concat(Object.keys(CATS)).concat(["curso"]);
  keys.forEach(function (key) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "chip-btn"; b.dataset.key = key;
    b.innerHTML = (key === "all" ? "Todos" : key === "curso" ? "En curso" : CATS[key]) + '<span class="n">' + count(key) + "</span>";
    b.setAttribute("aria-pressed", key === "all" ? "true" : "false");
    b.addEventListener("click", function () { active = key; applyFilter(); });
    filters.appendChild(b);
  });
  var search = document.createElement("input");
  search.type = "search"; search.id = "buscar"; search.className = "search";
  search.placeholder = "Buscar proyecto, tecnología o sector"; search.setAttribute("aria-label", "Buscar casos");
  search.addEventListener("input", function () { query = normalize(search.value.trim()); applyFilter(); });
  document.getElementById("search-slot").appendChild(search);
  var technologySelect = document.getElementById("technology");
  Object.keys(allStack).sort(function(a,b) { return a.localeCompare(b, "es"); }).forEach(function(name) {
    var option = document.createElement("option"); option.value = name; option.textContent = name;
    technologySelect.appendChild(option);
  });
  technologySelect.addEventListener("change", function() { technology = this.value; applyFilter(); });
  document.getElementById("reset-filters").addEventListener("click", function() {
    active = "all"; query = ""; technology = ""; search.value = ""; technologySelect.value = ""; applyFilter();
  });
  /** Por que existe: combinar categoría, tecnología y búsqueda.
   * @returns {void} Resultado de la operación. Efectos secundarios: actualiza el DOM local. */
  function applyFilter() {
    var shown = 0;
    Array.prototype.forEach.call(filters.querySelectorAll(".chip-btn"), function (b) { b.setAttribute("aria-pressed", b.dataset.key === active ? "true" : "false"); });
    cards.forEach(function (c) {
      var t = c._t;
      var okCat = active === "all" || (active === "curso" ? !!t.dataset.status : t.dataset.cat === active);
      var okTech = !technology || t.dataset.stack.split(",").map(function(s) { return s.trim(); }).indexOf(technology) !== -1;
      var ok = okCat && okTech && (!query || c._text.indexOf(query) >= 0);
      c.hidden = !ok; if (ok) shown++;
    });
    document.getElementById("empty").hidden = shown > 0;
    document.getElementById("result-count").textContent = shown + " de " + tools.length + " casos";
    document.getElementById("reset-filters").hidden = active === "all" && !query && !technology;
  }

  applyFilter();

  /* ---------- Navegación entre páginas ---------- */
  var indexScroll = 0, current = null;
  /** Por que existe: abrir casos, restaurar el índice y actualizar el título.
   * @returns {void} Resultado de la operación. Efectos secundarios: actualiza el DOM local. */
  function route() {
    var id = (location.hash || "").replace(/^#/, "");
    var t = id && Object.prototype.hasOwnProperty.call(bySlug, id) ? bySlug[id] : null;
    if (t) {
      if (!current) indexScroll = window.scrollY;
      indexView.hidden = true;
      tools.forEach(function (x) { x.hidden = x !== t; });
      backlink.hidden = false;
      current = t;
      document.title = t.dataset.title + " · Flavio Sirianni · Portfolio técnico";
      window.scrollTo(0, 0);
      t.querySelector("h1").setAttribute("tabindex", "-1");
      t.querySelector("h1").focus({preventScroll:true});
    } else {
      tools.forEach(function (x) { x.hidden = true; });
      indexView.hidden = false;
      backlink.hidden = true;
      document.title = "Flavio Sirianni · Portfolio técnico";
      if (current) window.scrollTo(0, indexScroll);
      document.getElementById("route-notice").hidden = !id;
      if (current) { document.getElementById("cases-title").focus({preventScroll:true}); }
      current = null;
    }
  }
  window.addEventListener("hashchange", route);
  route();
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.getElementById("explore-link").addEventListener("click", function(event) {
    event.preventDefault(); document.getElementById("proyectos").scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
    document.getElementById("cases-title").focus({preventScroll:true});
  });
  var skip = document.querySelector(".skip-link");
  skip.addEventListener("click", function(event) { event.preventDefault(); document.getElementById("contenido").focus(); });
  document.documentElement.dataset.enhanced = "true";
})();

/* A shared renderer and player for project-specific, locally stored demo scripts. */
(function (global) {
  'use strict';
  var I18N = {
    es: {demo:'Simulación interactiva',fiction:'Datos ficticios · Sin conexión a sistemas reales',play:'Reproducir',pause:'Pausar',previous:'Paso anterior',next:'Paso siguiente',restart:'Reiniciar',speed:'Velocidad',step:'Paso',of:'de',steps:'Recorrido',detail:'Qué ocurre',action:'Continuar',end:'Volver al inicio',terminal:'Consola',table:'Vista de datos',form:'Aplicación',chat:'Conversación',pipeline:'Flujo de datos',chart:'Análisis',done:'Completado',active:'En proceso',pending:'Pendiente',auto:'Vista animada',advance:'Ver siguiente paso'},
    en: {demo:'Interactive simulation',fiction:'Fictional data · No connection to live systems',play:'Play',pause:'Pause',previous:'Previous step',next:'Next step',restart:'Restart',speed:'Speed',step:'Step',of:'of',steps:'Walkthrough',detail:'What happens',action:'Continue',end:'Back to the start',terminal:'Console',table:'Data view',form:'Application',chat:'Conversation',pipeline:'Data flow',chart:'Analysis',done:'Done',active:'Processing',pending:'Pending',auto:'Animated preview',advance:'Show next step'}
  };
  /** Por que existe: crear nodos sin interpretar datos como HTML.
   * @returns {HTMLElement} Nodo seguro. Efectos secundarios: ninguno fuera del nodo creado. */
  function node(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = String(text);
    return element;
  }
  /** Por que existe: presentar indicadores de una escena.
   * @returns {void} Efectos secundarios: agrega métricas al contenedor local. */
  function metrics(parent, values) {
    if (!values || !values.length) return;
    var row = node('div','sim-metrics');
    values.forEach(function(value) {
      var item = node('div','sim-metric'); item.append(node('span','',value.label),node('b','',value.value)); row.appendChild(item);
    });
    parent.appendChild(row);
  }
  /** Por que existe: dibujar la pantalla específica de cada escena y tipo de proyecto.
   * @returns {HTMLElement} Pantalla de demostración. Efectos secundarios: crea un árbol DOM local. */
  function renderView(view, words) {
    var surface = node('div','sim-surface sim-'+view.type);
    var top = node('div','sim-window-bar');
    var dots = node('span','window-dots');dots.setAttribute('aria-hidden','true');
    top.append(dots,node('span','sim-app-name',words[view.type]),node('span','sim-sample','DEMO'));
    surface.appendChild(top);
    surface.appendChild(node('h3','sim-heading',view.heading));
    if (view.type === 'chat') {
      var feed = node('div','sim-messages');
      (view.messages || []).forEach(function(message,i) {
        var bubble = node('div','sim-message '+(message.side === 'user' ? 'out' : 'in'),message.text);
        bubble.style.setProperty('--message-index',i); feed.appendChild(bubble);
      });
      surface.appendChild(feed);
      var input = node('div','sim-message-input');input.setAttribute('aria-hidden','true');
      input.append(node('span','typing-dots','•••'),node('span','',words.chat),node('span','sim-send','↑'));surface.appendChild(input);
    } else if (view.type === 'table') {
      metrics(surface,view.metrics);
      var tableWrap=node('div','sim-table-wrap');var table=node('table','sim-table');
      var caption=node('caption','sr-only',view.heading);table.appendChild(caption);
      var thead=node('thead');var header=node('tr');
      (view.columns || []).forEach(function(column){var th=node('th','',column);th.scope='col';header.appendChild(th);});thead.appendChild(header);table.appendChild(thead);
      var tbody=node('tbody');(view.rows||[]).forEach(function(row,i){var tr=node('tr',i===view.highlight?'highlight':'');row.forEach(function(value){tr.appendChild(node('td','',value));});tbody.appendChild(tr);});
      table.appendChild(tbody);tableWrap.appendChild(table);surface.appendChild(tableWrap);
    } else if (view.type === 'form') {
      var fields=node('dl','sim-fields');
      (view.fields||[]).forEach(function(field){var group=node('div','sim-field');group.append(node('dt','',field.label),node('dd','',field.value));fields.appendChild(group);});
      surface.appendChild(fields);
      if(view.notice) surface.appendChild(node('p','sim-notice',view.notice));
      metrics(surface,view.metrics);
    } else if (view.type === 'pipeline') {
      var pipeline=node('ol','sim-pipeline');
      (view.nodes||[]).forEach(function(stage,i){var item=node('li','pipeline-node '+stage.status);item.append(node('span','pipeline-number',stage.status==='done'?'✓':String(i+1)),node('b','',stage.label),node('small','',words[stage.status]||stage.status));pipeline.appendChild(item);});
      surface.appendChild(pipeline);
      if(view.log){var log=node('div','sim-log');view.log.forEach(function(line){log.appendChild(node('p','',line));});surface.appendChild(log);}
      metrics(surface,view.metrics);
    } else if (view.type === 'chart') {
      metrics(surface,view.metrics);
      var bars=node('div','sim-bars');var max=Math.max.apply(null,(view.bars||[]).map(function(b){return Math.abs(b.value);}).concat([1]));
      (view.bars||[]).forEach(function(bar){var row=node('div','sim-bar-row');var track=node('div','sim-bar-track');var fill=node('div','sim-bar-fill');fill.style.setProperty('--bar-width',Math.max(2,Math.abs(bar.value)/max*100)+'%');track.appendChild(fill);row.append(node('span','bar-label',bar.label),track,node('b','bar-value',bar.display||bar.value.toLocaleString(words===I18N.en?'en-US':'es-AR')));bars.appendChild(row);});
      surface.appendChild(bars);
    } else if (view.type === 'terminal') {
      var code=node('div','sim-code');(view.lines||[]).forEach(function(line,i){var p=node('p','',line);p.style.setProperty('--message-index',i);code.appendChild(p);});surface.appendChild(code);metrics(surface,view.metrics);
    }
    return surface;
  }
  /** Por que existe: crear controles nativos accesibles.
   * @returns {HTMLButtonElement} Botón asociado a su acción. Efectos secundarios: registra listener local. */
  function button(label,text,action) {var result=node('button','demo-button',text);result.type='button';result.setAttribute('aria-label',label);result.title=label;result.addEventListener('click',action);return result;}
  /** Por que existe: montar una demo específica con reproducción controlada y pausas fuera de pantalla.
   * @returns {object|null} Controlador local, o null si falta el guion. Efectos secundarios: DOM, listeners y temporizador solo mientras es visible.
   * Errores esperados: guion ausente; muestra un aviso y no inicia la reproducción. */
  function mount(host, slug, options) {
    options=options||{};var lang=options.lang==='en'?'en':'es',words=I18N[lang];
    var data=global.PORTFOLIO_DEMOS&&global.PORTFOLIO_DEMOS[slug];
    if(!data||!data.steps||!data.steps.length){host.textContent=lang==='en'?'Demo unavailable.':'Demo no disponible.';return null;}
    var compact=!!options.compact,index=0,speed=1,visible=false,timer=null;
    var selected=options.step!==null&&options.step!==undefined?Number(options.step):null;
    if(Number.isInteger(selected)&&selected>=0&&selected<data.steps.length)index=selected;
    var reduced=global.matchMedia('(prefers-reduced-motion: reduce)').matches,playing=!reduced&&selected===null;
    var stage=node('div','demo-stage'),screen=node('div','demo-screen');
    stage.appendChild(screen);host.appendChild(stage);
    var counter,play,description,action,timeline,live;
    /** Por que existe: detener el temporizador cuando la demo no debe avanzar.
     * @returns {void} Efectos secundarios: cancela temporizador local. */
    function stopTimer(){if(timer!==null){clearTimeout(timer);timer=null;}}
    /** Por que existe: programar una única transición mientras es visible.
     * @returns {void} Efectos secundarios: programa temporizador local. */
    function schedule(){stopTimer();if(playing&&visible&&!document.hidden&&!host.closest('[hidden]'))timer=setTimeout(function(){index=(index+1)%data.steps.length;draw(false);},(compact?5200:6500)/speed);}
    /** Por que existe: anunciar solo cambios iniciados por la persona.
     * @returns {void} Efectos secundarios: actualiza pantalla, controles y estado accesible. */
    function draw(announce){
      var step=data.steps[index];screen.replaceChildren(renderView(step.view[lang],words));
      host.dataset.step=String(index);host.dataset.playing=String(playing);host.dataset.visible=String(visible);host.dataset.sceneType=step.view[lang].type;
      if(compact){host.style.setProperty('--scene-progress',((index+1)/data.steps.length*100)+'%');}
      else{
        counter.textContent=words.step+' '+(index+1)+' '+words.of+' '+data.steps.length;
        description.replaceChildren(node('p','eyebrow',words.detail),node('h3','',step.title[lang]),node('p','',step.description[lang]));
        var actionText=index===data.steps.length-1?words.end:data.steps[index+1].title[lang]+' →';
        action.textContent=actionText;action.setAttribute('aria-label',actionText);
        play.textContent=playing?'Ⅱ':'▶';play.setAttribute('aria-label',playing?words.pause:words.play);play.title=playing?words.pause:words.play;
        timeline.querySelectorAll('button').forEach(function(item,i){item.setAttribute('aria-current',String(i===index));});
        var languageSwitch=document.querySelector('.language-switch');
        if(languageSwitch){var target=new URL(languageSwitch.href);target.searchParams.set('step',String(index));languageSwitch.href=target.href;}
        if(announce)live.textContent=counter.textContent+': '+step.title[lang];
      }
      schedule();
    }
    /** Por que existe: permitir recorrer manualmente y mantener la escena elegida.
     * @returns {void} Efectos secundarios: pausa reproducción y selecciona escena. */
    function select(next){playing=false;index=(next+data.steps.length)%data.steps.length;draw(true);}
    if(!compact){
      host.classList.add('demo-player');
      var playerHeader=node('div','demo-player-header');playerHeader.append(node('p','eyebrow',words.demo),node('p','demo-disclaimer',words.fiction));host.insertBefore(playerHeader,stage);
      var side=node('aside','demo-journey');side.setAttribute('aria-label',words.steps);
      var controls=node('div','demo-controls');
      play=button(words.pause,'Ⅱ',function(){playing=!playing;draw(true);});
      var previous=button(words.previous,'←',function(){select(index-1);});var next=button(words.next,'→',function(){select(index+1);});var restart=button(words.restart,'↺',function(){select(0);});
      var speedButton=button(words.speed,'1×',function(){speed=speed===1?1.5:speed===1.5?2:1;speedButton.textContent=String(speed)+'×';schedule();});
      controls.append(play,previous,next,restart,speedButton);counter=node('p','demo-counter');
      timeline=node('div','demo-timeline');
      data.steps.forEach(function(step,i){var item=button(step.title[lang],'',function(){select(i);});item.className='demo-step';item.append(node('span','step-number',i+1),node('span','',step.title[lang]));item.dataset.stepIndex=String(i);timeline.appendChild(item);});
      description=node('div','demo-explanation');action=button(words.action,words.action,function(){select(index+1);});action.className='demo-action';
      side.append(controls,counter,timeline,description,action);stage.appendChild(side);
      live=node('p','sr-only');live.setAttribute('role','status');live.setAttribute('aria-live','polite');host.appendChild(live);
    }else{host.classList.add('compact-demo');}
    draw(false);
    if('IntersectionObserver' in global){var observer=new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;host.dataset.visible=String(visible);schedule();},{threshold:compact?0.25:0.12});observer.observe(host);}else{visible=true;schedule();}
    document.addEventListener('visibilitychange',schedule);
    document.addEventListener('portfolio:filter',schedule);
    /** Por que existe: pausar o reanudar desde el catálogo sin cambiar la escena.
     * @returns {void} Efectos secundarios: cambia estado visual y temporizador local. */
    function setPlaying(value){playing=!!value;host.dataset.playing=String(playing);schedule();}
    return {select:select,setPlaying:setPlaying,pause:function(){setPlaying(false);},getStep:function(){return index;}};
  }
  global.PortfolioDemos={mount:mount};
})(window);

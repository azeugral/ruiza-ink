(function () {
  var WA = '351912443129';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* nav */
  var nav = $('#nav');
  function navSolida() { nav.classList.toggle('solida', scrollY > 40); }
  addEventListener('scroll', navSolida, { passive: true }); navSolida();
  var menuBt = $('#menuBt'), menu = $('#menu');
  menuBt.addEventListener('click', function () {
    var abre = menu.hidden; menu.hidden = !abre; menuBt.setAttribute('aria-expanded', abre); menuBt.textContent = abre ? 'Fechar' : 'Menu';
    nav.classList.add('solida');
  });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { menu.hidden = true; menuBt.textContent = 'Menu'; menuBt.setAttribute('aria-expanded', false); }); });

  /* hero: provas que revezam */
  var fotos = $$('#prova .foto img'), atual = 0;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(function () {
      fotos[atual].classList.remove('on');
      atual = (atual + 1) % fotos.length;
      fotos[atual].classList.add('on');
      var leg = $('#leg'); leg.classList.add('troca');
      setTimeout(function () { leg.textContent = fotos[atual].dataset.leg; leg.classList.remove('troca'); }, 600);
    }, 5000);
  }

  /* trabalhos */
  var grade = $('#grade'), verMais = $('#verMais');
  var obras = (window.OBRAS || []).filter(function (o) { return o.tema !== 'pt'; });
  var PASSO = innerWidth < 640 ? 12 : 24;
  var filtro = 'todos', limite = PASSO, lista = [];
  function render() {
    lista = obras.filter(function (o) { return filtro === 'todos' || o.tema === filtro; });
    var vis = lista.slice(0, limite);
    grade.innerHTML = vis.map(function (o, i) {
      return '<button class="item rev" data-i="' + i + '" aria-label="' + o.titulo + '"><img src="img/t/' + o.n + '.webp" alt="' + o.titulo + '" width="720" height="900" draggable="false"></button>';
    }).join('');
    verMais.parentNode.hidden = lista.length <= limite;
    observa($$('.item', grade));
  }
  $$('#filtros button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#filtros button').forEach(function (x) { x.classList.toggle('on', x === b); });
      filtro = b.dataset.f; limite = PASSO; render();
    });
  });
  verMais.addEventListener('click', function () { limite += PASSO; render(); });
  grade.addEventListener('click', function (e) { var b = e.target.closest('.item'); if (b) abreLb(+b.dataset.i); });

  /* lightbox */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbI = 0;
  function mostra(i) {
    lbI = (i + lista.length) % lista.length; var o = lista[lbI];
    lbImg.src = 'img/g/' + o.n + '.webp'; lbImg.alt = o.titulo; lbCap.textContent = o.titulo + ' · ' + o.estilo;
  }
  function abreLb(i) { mostra(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbX').focus(); }
  function fechaLb() { lb.hidden = true; document.body.style.overflow = ''; }
  $('#lbX').addEventListener('click', fechaLb);
  $('#lbP').addEventListener('click', function () { mostra(lbI - 1); });
  $('#lbS').addEventListener('click', function () { mostra(lbI + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) fechaLb(); });
  addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') fechaLb(); else if (e.key === 'ArrowLeft') mostra(lbI - 1); else if (e.key === 'ArrowRight') mostra(lbI + 1);
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (tx === null) return; var d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) mostra(lbI + (d < 0 ? 1 : -1)); tx = null; });
  $('#lbQuero').addEventListener('click', function () {
    var o = lista[lbI]; fechaLb();
    preenche('Quero algo parecido com o trabalho "' + o.titulo + '" do site.', estiloDe(o.tema));
  });
  function estiloDe(t) { return { floral: 'Floral e ornamental', fine: 'Fine line', ilustra: 'Blackwork e ilustração', letra: 'Caligrafia', pt: 'Lembrança de Portugal' }[t]; }

  /* disponíveis */
  var fl = $('#flashes');
  fl.innerHTML = (window.FLASH || []).filter(function (f) { return f.n !== '19'; }).map(function (f) {
    return '<div class="fl rev"><div class="pp"><img src="img/flash/' + f.n + '.webp" alt="Desenho disponível: ' + f.titulo + '" width="1000" height="1250" draggable="false"></div><p>' + f.titulo + '</p><button class="lk" data-quero="' + f.titulo + ' (desenho disponível)">Quero este</button></div>';
  }).join('');
  fl.classList.add('curto');
  $('#verFl').addEventListener('click', function () { fl.classList.remove('curto'); this.parentNode.hidden = true; });

  document.addEventListener('click', function (e) {
    var q = e.target.closest('[data-quero]');
    if (q) preenche('Quero o ' + q.dataset.quero + '.', /Portugal/.test(q.dataset.quero) ? 'Lembrança de Portugal' : 'Desenho disponível');
    var c = e.target.closest('[data-cidade]');
    if (c) { marca('cidade', c.dataset.cidade); $('#form').scrollIntoView({ behavior: 'smooth' }); }
  });

  /* formulário */
  var form = $('#form');
  function marca(nome, valor) { $$('input[name="' + nome + '"]', form).forEach(function (r) { r.checked = r.value === valor; }); }
  function preenche(texto, estilo) {
    form.ideia.value = texto; if (estilo) marca('estilo', estilo);
    form.scrollIntoView({ behavior: 'smooth' });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim(), erro = $('.erro', form);
    if (!nome) { erro.hidden = false; form.nome.focus(); return; }
    erro.hidden = true;
    var v = function (n) { var r = $('input[name="' + n + '"]:checked', form); return r ? r.value : ''; };
    var L = ['Olá, Andrea! Sou *' + nome + '* e quero um orçamento.', ''];
    var add = function (k, x) { if (x) L.push('*' + k + ':* ' + x); };
    add('Cidade', v('cidade')); add('Estilo', v('estilo')); add('Local', form.local.value.trim());
    add('Tamanho', form.tamanho.value); add('Disponibilidade', form.disp.value);
    var ideia = form.ideia.value.trim(); if (ideia) { L.push(''); L.push('*Ideia:* ' + ideia); }
    L.push(''); L.push('(pedido enviado pelo site)');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(L.join('\n')), '_blank');
    var av = $('#aviso'); av.textContent = 'A abrir o WhatsApp. Envia lá a mensagem e junta as imagens de referência.'; av.hidden = false;
  });

  /* entrada ao rolar */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('vis'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function observa(els) { els.forEach(function (el) { if (io) io.observe(el); else el.classList.add('vis'); }); }
  render();
  observa($$('.rev').filter(function (el) { return !el.classList.contains('item'); }));
})();

/* Player leve: só o botão com miniatura carrega no início; o YouTube (modo sem cookies)
 * só entra no clique. Evento de play vai ao GA4 apenas se a medição estiver ativa
 * (window.gtag só existe depois do aceite, ver /js/consentimento.js). */
(function () {
  function ativar(box) {
    var id = box.getAttribute('data-id');
    var titulo = box.getAttribute('data-titulo') || 'Vídeo';
    if (!id || box.querySelector('iframe')) return;
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
      '?autoplay=1&rel=0&playsinline=1&modestbranding=1';
    f.title = titulo;
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    box.innerHTML = '';
    box.appendChild(f);
    f.focus();
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'video_play', { video_id: id, video_title: titulo });
      }
    } catch (_) { /* medição nunca bloqueia o vídeo */ }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.vplay');
    if (!b) return;
    ativar(b.closest('.vplayer'));
  });
})();

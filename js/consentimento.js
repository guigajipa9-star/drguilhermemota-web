/* Medição de visitas e cliques (decisão do Dr. Guilherme, 21/10/2026).
 * Sem aviso na tela: a medição fica ativa por padrão, explicada na
 * Política de Privacidade, com opção de desligar no rodapé.
 * Configuração por página, no próprio <script>:
 *   data-ga="G-..."            obrigatório
 *   data-ads="AW-..."          opcional (Google Ads)
 *   data-ads-label="..."       rótulo da conversão de clique no WhatsApp
 *   data-ads-value="500"       valor enviado com a conversão
 * Recusar não impede o agendamento: os links do WhatsApp funcionam igual.
 */
(function () {
  'use strict';
  var cfg = document.currentScript || document.querySelector('script[data-ga]');
  if (!cfg) return;
  var GA = cfg.getAttribute('data-ga');
  var ADS = cfg.getAttribute('data-ads');
  var ADS_LABEL = cfg.getAttribute('data-ads-label');
  var ADS_VALUE = parseFloat(cfg.getAttribute('data-ads-value')) || 0;
  if (!GA) return;

  var KEY = 'site_measurement_consent_v1';
  var REF_KEY = 'clic_id_ads';
  var granted = false;
  var loaded = false;

  function readChoice() {
    try { var s = sessionStorage.getItem(KEY); if (s) return s; } catch (_) {}
    try { return localStorage.getItem(KEY); } catch (_) { return null; }
  }
  function saveChoice(value) {
    try {
      localStorage.setItem(KEY, value);
      try { sessionStorage.removeItem(KEY); } catch (_) {}
      return true;
    } catch (_) {
      try { sessionStorage.setItem(KEY, value); } catch (_) {}
      return false;
    }
  }

  // ---------- interface ----------
  var css = document.createElement('style');
  css.textContent =
    '.cs-box{box-sizing:border-box;width:calc(100% - 32px);max-width:1100px;margin:12px auto;padding:12px 16px;background:#fffaf1;border:1px solid rgba(28,26,18,.15);border-radius:12px;color:#1c1a12;font:14px/1.45 Outfit,system-ui,-apple-system,"Segoe UI",sans-serif;display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px}' +
    '.cs-box[hidden]{display:none}' +
    '.cs-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}' +
    '.cs-box p{margin:0;flex:1 1 480px}' +
    '.cs-box a{color:#5f5a32;text-decoration:underline}' +
    '.cs-acts{display:flex;gap:8px;flex:0 0 auto}' +
    '.cs-acts button{min-height:40px;padding:8px 18px;border-radius:999px;border:1.5px solid #5f5a32;background:#fffaf1;color:#5f5a32;font:600 14px Outfit,system-ui,-apple-system,"Segoe UI",sans-serif;cursor:pointer}' +
    '.cs-acts button:hover,.cs-acts button:focus-visible{background:#5f5a32;color:#fffaf1}' +
    '@media(max-width:600px){.cs-box{margin:8px auto;padding:10px 12px;font-size:13px}.cs-box p{flex-basis:100%}.cs-acts{flex:1 1 100%}.cs-acts button{flex:1}}' +
    '@media print{.cs-box,.cs-foot{display:none}}' +
    '.cs-foot{padding:10px 0;font-size:13px}' +
    '.cs-review{background:none;border:0;padding:4px 0;color:inherit;text-decoration:underline;font:inherit;cursor:pointer}' +
    '.cs-status{margin-left:8px}';
  document.head.appendChild(css);

  var box = document.createElement('section');
  box.className = 'cs-box';
  box.id = 'cs-box';
  box.hidden = true;
  box.setAttribute('aria-labelledby', 'cs-title');
  box.innerHTML =
    '<h2 id="cs-title" class="cs-sr" tabindex="-1">Sua escolha de privacidade</h2>' +
    '<p>Medimos visitas e cliques no WhatsApp, sem dados clínicos. Desligar não impede o agendamento. <a href="/politica-privacidade.html">Saiba mais</a>.</p>' +
    '<div class="cs-acts"><button type="button" id="cs-accept">Permitir</button>' +
    '<button type="button" id="cs-reject">Não medir</button></div>';
  // Sem aviso no topo: a caixa só aparece se a pessoa pedir pelo rodapé.

  var foot = document.createElement('div');
  foot.className = 'cs-foot';
  foot.innerHTML = '<button type="button" class="cs-review" id="cs-review" aria-controls="cs-box" aria-expanded="false">Medição de visitas</button>' +
    '<span class="cs-status" id="cs-status" role="status"></span>';
  var footer = document.querySelector('footer');
  var wrap = footer && (footer.querySelector('.wrap') || footer);
  (wrap || document.body).appendChild(foot);
  foot.appendChild(box);

  var review = document.getElementById('cs-review');
  var status = document.getElementById('cs-status');
  function showChoice(show) {
    box.hidden = !show;
    review.setAttribute('aria-expanded', String(show));
  }

  // ---------- medição ----------
  function startMeasurement() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', {
      analytics_storage: 'granted', ad_storage: 'granted',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', GA, { allow_google_signals: false, allow_ad_personalization_signals: false });
    if (ADS) window.gtag('config', ADS, { allow_ad_personalization_signals: false });
    var s = document.createElement('script');
    s.async = true;
    s.id = 'cs-google-tag';
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
    document.head.appendChild(s);
    // Código de referência do anúncio na mensagem do WhatsApp: só com aceite.
    if (typeof window.__aplicarRefAds === 'function') {
      try { window.__aplicarRefAds(); } catch (_) {}
    }
  }

  function stopMeasurement() {
    granted = false;
    window['ga-disable-' + GA] = true;
    window.gtag = function () {};
    try { localStorage.removeItem(REF_KEY); } catch (_) {}
    // Recarrega para remover timers/listeners de terceiros e o código dos links.
    window.location.reload();
  }

  function choose(value) {
    var saved = saveChoice(value);
    granted = value === 'granted';
    showChoice(false);
    status.textContent = (granted ? 'Medição ativa.' : 'Medição desligada.') +
      (saved ? '' : ' Sua escolha vale apenas nesta visita.');
    review.focus({ preventScroll: true });
    if (granted) startMeasurement();
    else {
      try { localStorage.removeItem(REF_KEY); } catch (_) {}
      if (loaded) stopMeasurement();
    }
  }

  document.getElementById('cs-accept').addEventListener('click', function () { choose('granted'); });
  document.getElementById('cs-reject').addEventListener('click', function () { choose('denied'); });
  review.addEventListener('click', function () {
    showChoice(true);
    document.getElementById('cs-title').focus();
  });
  window.addEventListener('storage', function (e) {
    if (e.key === KEY && e.newValue !== 'granted' && loaded) stopMeasurement();
  });

  // Clique no WhatsApp: um único ponto de medição.
  // Interrompe a propagação para o clique automático do Google não copiar
  // a URL do WhatsApp (texto da mensagem) para o Analytics. A navegação
  // normal do link não é bloqueada.
  function measureWhatsApp(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    var link = event.target && event.target.closest && event.target.closest('a[href*="wa.me/"]');
    if (!link) return;
    event.stopImmediatePropagation();
    if (!granted || typeof window.gtag !== 'function') return;
    try {
      window.gtag('event', 'whatsapp_click', { send_to: GA });
      if (ADS && ADS_LABEL) {
        window.gtag('event', 'conversion', {
          send_to: ADS + '/' + ADS_LABEL, value: ADS_VALUE, currency: 'BRL'
        });
      }
    } catch (_) { /* falha de medição nunca bloqueia o contato */ }
  }
  window.addEventListener('click', measureWhatsApp, true);
  window.addEventListener('auxclick', measureWhatsApp, true);

  var choice = readChoice();
  if (choice === 'denied') {
    status.textContent = 'Medição desligada.';
    try { localStorage.removeItem(REF_KEY); } catch (_) {}
  } else {
    granted = true;
    startMeasurement();
  }
}());

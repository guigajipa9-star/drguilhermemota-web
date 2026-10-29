/* Código de referência do anúncio (gclid/wbraid/gbraid) na mensagem do WhatsApp.
 * Só define a função. Quem chama é o script de medição, e somente depois do aceite
 * (/js/consentimento.js em /presencial/, script próprio em /adultos/).
 * Mesma lógica já publicada em / e /infantil/online/. */
if (typeof window.__aplicarRefAds !== "function") {
    window.__aplicarRefAds = function () {
      var CHAVES = ["gclid", "wbraid", "gbraid"]; // formatos usados pelo Google Ads
      var TTL = 90 * 24 * 60 * 60 * 1000;         // 90 dias = janela de atribuição do Ads
      var STORAGE = "clic_id_ads";

      function lerDaURL() {
        var p = new URLSearchParams(window.location.search);
        for (var i = 0; i < CHAVES.length; i++) {
          var v = p.get(CHAVES[i]);
          if (v) return v;
        }
        return null;
      }

      function lerDoStorage() {
        try {
          var raw = localStorage.getItem(STORAGE);
          if (!raw) return null;
          var obj = JSON.parse(raw);
          if (!obj || !obj.v || Date.now() - obj.t > TTL) return null;
          return obj.v;
        } catch (e) { return null; }
      }

      function guardar(v) {
        try {
          localStorage.setItem(STORAGE, JSON.stringify({ v: v, t: Date.now() }));
        } catch (e) { /* navegação privada: segue com o valor da URL apenas */ }
      }

      var daURL = lerDaURL();
      if (daURL) guardar(daURL);
      var clicId = daURL || lerDoStorage();
      if (!clicId) return; // visita sem clique pago: não toca em nada

      document.querySelectorAll('a[href*="wa.me"]').forEach(function (el) {
        try {
          var u = new URL(el.getAttribute("href"), window.location.origin);
          if (u.hostname.indexOf("wa.me") === -1) return;
          var texto = u.searchParams.get("text") || "";
          if (texto.indexOf("(ref: ") !== -1) return; // já injetado
          u.searchParams.set("text", texto + "\n\n(ref: " + clicId + ")");
          el.setAttribute("href", u.toString());
        } catch (e) { /* link inesperado: mantém o original */ }
      });
    };
}

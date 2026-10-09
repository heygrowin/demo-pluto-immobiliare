// Demo: forms build a PREFILLED WhatsApp / email / phone link from the typed fields.
// Nothing is ever sent automatically — the link just opens the user's own app, ready to send.
(function () {
  function enc(s) { return encodeURIComponent(s == null ? '' : String(s)); }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  // Italian numbers: wa.me needs the country code, keep the digits as written (leading 0 stays for landlines).
  function waNumber(target) { var d = digits(target); return d.indexOf('39') === 0 ? d : '39' + d; }

  function messageFrom(form) {
    var lines = [];
    form.querySelectorAll('[data-label]').forEach(function (el) {
      var v = (el.value || '').trim();
      if (v) lines.push(el.getAttribute('data-label') + ': ' + v);
    });
    return lines.join('\n');
  }

  document.querySelectorAll('form[data-contact]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.form-note');
      // required-field validation
      var missing = null;
      form.querySelectorAll('[required]').forEach(function (el) { if (!missing && !el.value.trim()) missing = el; });
      if (missing) {
        missing.focus();
        if (note) { note.textContent = 'Compila prima i campi obbligatori (*).'; note.className = 'form-note err show'; }
        return;
      }
      var channel = form.getAttribute('data-channel') || 'whatsapp';
      var target = form.getAttribute('data-target') || '';
      var intro = form.getAttribute('data-intro') || '';
      var msg = (intro ? intro + '\n\n' : '') + messageFrom(form);
      var url = '', where = '';
      if (channel === 'whatsapp') { url = 'https://wa.me/' + waNumber(target) + '?text=' + enc(msg); where = 'WhatsApp'; }
      else if (channel === 'mailto') { url = 'mailto:' + target + '?subject=' + enc(form.getAttribute('data-subject') || 'Richiesta dal sito') + '&body=' + enc(msg); where = 'la tua email'; }
      else if (channel === 'tel') { url = 'tel:' + digits(target); where = 'il telefono'; }
      if (note) {
        note.textContent = (channel === 'tel')
          ? 'Si apre il telefono per chiamare l’agenzia. Niente viene inviato da solo.'
          : 'Si apre ' + where + ' con la richiesta già pronta. Niente viene inviato da solo: controlla e premi invio nell’app.';
        note.className = 'form-note ok show';
      }
      if (channel === 'tel') window.location.href = url;
      else window.open(url, '_blank', 'noopener');
    });
  });

  // smooth in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (!id || id.length < 2) return;
      var t = document.querySelector(id); if (!t) return;
      e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // listings filter (estate agencies)
  var catalog = document.getElementById('listings');
  var controls = document.getElementById('filters');
  if (catalog && controls) {
    function apply() {
      var type = controls.querySelector('[name=type]').value;
      var contract = controls.querySelector('[name=contract]').value;
      var price = controls.querySelector('[name=price]').value;
      var shown = 0;
      catalog.querySelectorAll('.listing').forEach(function (card) {
        var ok = true;
        if (type && card.getAttribute('data-type') !== type) ok = false;
        if (contract && card.getAttribute('data-contract') !== contract) ok = false;
        if (price && card.getAttribute('data-price') !== price) ok = false;
        card.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      var empty = document.getElementById('listings-empty');
      if (empty) empty.hidden = shown !== 0;
    }
    controls.addEventListener('change', apply);
    controls.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
    var reset = document.getElementById('filters-reset');
    if (reset) reset.addEventListener('click', function () { controls.reset(); apply(); });
  }
})();

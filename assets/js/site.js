/* BauBygg & Plåtslageri – formulärhantering, mobilmeny och hero-parallax.
   Formuläret fungerar även utan skriptet: webbläsaren validerar fälten och postar
   till action (formulärtjänsten, eller mailto: när ingen tjänst är angiven).
   Skriptet gör upplevelsen bättre: skickar i bakgrunden, visar bekräftelse på sidan
   och fångar fel. I demoläge (data-demo="true") skickas inget alls. */
(function () {
  'use strict';

  // Stäng mobilmenyn när man valt ett avsnitt.
  var menu = document.querySelector('details.menu');
  if (menu) {
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) { menu.removeAttribute('open'); }
    });
  }

  // Mjuk parallax på hero-bilden. Avstängd när användaren bett om mindre rörelse.
  var media = document.getElementById('heroMedia');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (media && !reduce) {
    var ticking = false;
    var parallax = function () { media.style.transform = 'translate3d(0,' + Math.round(window.scrollY * 0.22) + 'px,0)'; ticking = false; };
    window.addEventListener('scroll', function () { if (!ticking) { window.requestAnimationFrame(parallax); ticking = true; } }, { passive: true });
  }

  var forms = document.querySelectorAll('form[data-form]');
  Array.prototype.forEach.call(forms, function (form) {
    form.addEventListener('submit', function (event) {
      var honey = form.querySelector('input[name="_gotcha"]');
      if (honey && honey.value) { event.preventDefault(); return; }
      if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
        event.preventDefault();
        if (typeof form.reportValidity === 'function') { form.reportValidity(); }
        return;
      }

      event.preventDefault();

      if (form.getAttribute('data-demo') === 'true') { showSuccess(form, 'demo'); return; }

      var endpoint = form.getAttribute('data-endpoint') || '';
      if (!endpoint) {
        window.location.href = mailtoLink(form);
        showSuccess(form, 'mail');
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      if (button) { if (button.disabled) { return; } button.disabled = true; }
      form.classList.remove('is-error');

      fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
        .then(function (response) { if (response.ok) { showSuccess(form, 'sent'); } else { showError(form); } })
        .catch(function () { showError(form); })
        .then(function () { if (button) { button.disabled = false; } });
    });
  });

  function mailtoLink(form) {
    var to = form.getAttribute('data-mailto') || '';
    var subject = form.getAttribute('data-subject') || '';
    var lines = [];
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.name.charAt(0) === '_' || el.type === 'submit') { return; }
      var label = el.labels && el.labels[0] ? el.labels[0].textContent.trim() : el.name;
      lines.push(label + ': ' + (el.value || '–'));
    });
    return 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  function showSuccess(form, mode) {
    var box = document.getElementById(form.getAttribute('data-success'));
    // I mailto-läget har inget skickats än, så formuläret får stå kvar.
    if (mode !== 'mail') { form.hidden = true; }
    if (!box) { return; }
    Array.prototype.forEach.call(box.querySelectorAll('[data-when]'), function (p) {
      p.hidden = p.getAttribute('data-when') !== mode;
    });
    box.hidden = false;
    box.setAttribute('tabindex', '-1');
    box.focus();
  }

  function showError(form) {
    form.classList.add('is-error');
    var error = form.querySelector('.form__error');
    if (error) { error.setAttribute('tabindex', '-1'); error.focus(); }
  }
})();

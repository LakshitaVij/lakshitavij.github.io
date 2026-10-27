// Theme toggle, name-color cycle. Both persist across pages.
(function () {
  var d = document.documentElement;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var label = document.querySelector('[data-mode-label]');
  function paintLabel() { if (label) label.textContent = d.dataset.theme === 'dark' ? 'Light' : 'Dark'; }
  paintLabel();
  document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      d.dataset.theme = d.dataset.theme === 'dark' ? 'light' : 'dark';
      store.set('theme', d.dataset.theme);
      paintLabel();
    });
  });
  document.querySelectorAll('[data-cycle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = String((parseInt(d.dataset.ci || '0', 10) + 1) % 3);
      d.dataset.ci = next;
      store.set('ci', next);
    });
  });
})();

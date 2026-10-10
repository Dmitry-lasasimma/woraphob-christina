/* Wait for decoded artwork, so a slow connection cannot interrupt the reveal. */
(function () {
  'use strict';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !Element.prototype.animate) return;
  var root = document.documentElement;
  root.classList.add('portrait-loading');
  function readyImage(url) {
    return new Promise(function (resolve) {
      var image = new Image();
      image.onload = function () {
        if (image.decode) image.decode().catch(function () {}).then(resolve);
        else resolve();
      };
      image.onerror = resolve;
      image.src = url;
    });
  }
  var ready = Promise.all([
    readyImage('images/groom-bride.jpeg'),
    readyImage('images/billioncard-frame.png')
  ]);
  function reveal() {
    ready.then(function () {
      if (reducedMotion.matches) { root.classList.remove('portrait-loading'); return; }
      var animations = [];
      try {
        document.querySelectorAll('.envelope-portrait, .frame-svg').forEach(function (portrait) {
          portrait.querySelectorAll(':scope > image').forEach(function (image) {
            var isPhoto = image.getAttribute('href').includes('groom-bride');
            animations.push(image.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: isPhoto ? 1300 : 1100, delay: isPhoto ? 180 : 0,
              easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'both'
            }));
          });
          animations.push(portrait.animate([
            { transform: 'translateY(5px) scale(.975)' },
            { transform: 'translateY(0) scale(1)' }
          ], { duration: 1500, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'both' }));
        });
        function finish() {
          root.classList.remove('portrait-loading');
          animations.forEach(function (animation) { animation.cancel(); });
          reducedMotion.removeEventListener('change', onPreferenceChange);
        }
        function onPreferenceChange() { if (reducedMotion.matches) finish(); }
        reducedMotion.addEventListener('change', onPreferenceChange);
        Promise.all(animations.map(function (animation) {
          return animation.finished.catch(function () {});
        })).then(finish);
      } catch (error) {
        root.classList.remove('portrait-loading');
        animations.forEach(function (animation) { animation.cancel(); });
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', reveal, { once: true });
  else reveal();
})();

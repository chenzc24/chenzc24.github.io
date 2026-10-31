'use strict';
// A short snowfall over the snowy-night photograph on the home page, on hover or tap.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)'), TAU = Math.PI * 2;
  let flakes = [], canvas = null, ctx = null, w = 0, h = 0, raf = 0;
  function prepare(figure) {
    canvas = figure.querySelector('.photo-snow');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'photo-snow';
      canvas.setAttribute('aria-hidden', 'true');
      figure.append(canvas);
    }
    const rect = figure.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    w = rect.width; h = rect.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function fall(figure) {
    if (reduced.matches || flakes.length > 24) return;
    if (!raf) prepare(figure);
    const now = performance.now(), count = Math.round(w / 10);
    // Some flakes start inside the photograph so the snowfall answers the hover at once.
    for (let i = 0; i < count; i++) flakes.push({x: Math.random() * w, y: -8 + Math.random() * h * .3, born: now + i * 70, speed: (36 + Math.random() * 24) * h / 230, drift: (Math.random() - .5) * 10, sway: 2 + Math.random() * 4, phase: Math.random() * TAU, size: 1 + Math.random() * 1.3, alpha: .65 + Math.random() * .3});
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function frame(now) {
    if (!canvas.isConnected) { flakes = []; raf = 0; return; }
    ctx.clearRect(0, 0, w, h);
    flakes = flakes.filter(flake => flake.y + flake.speed * Math.max(0, now - flake.born) / 1000 < h);
    for (const flake of flakes) {
      const age = (now - flake.born) / 1000;
      if (age < 0) continue;
      const y = flake.y + flake.speed * age, x = flake.x + flake.drift * age + flake.sway * Math.sin(flake.phase + 1.6 * age);
      // Each flake fades in, then melts into the snow in the lower half of the photograph.
      ctx.fillStyle = `rgba(255,255,255,${flake.alpha * Math.min(1, age / .4, (h - y) / (h * .45))})`;
      ctx.beginPath(); ctx.arc(x, y, flake.size, 0, TAU); ctx.fill();
    }
    raf = flakes.length ? requestAnimationFrame(frame) : 0;
  }
  // pointerover covers both a mouse entering the photograph and a tap on it.
  document.addEventListener('pointerover', event => {
    const figure = event.target.closest?.('.home-photograph');
    if (figure && !figure.contains(event.relatedTarget)) fall(figure);
  });
})();

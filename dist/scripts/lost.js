'use strict';
(() => {
  const {t} = Site;
  const canvas = document.querySelector('.lost-strip'), ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // The Möbius strip from the home page (form 04 in field-shapes.js), turning slowly in its own plane.
  const lines = 48, points = 121, strip = window.FieldShapes.build(lines, points).shapes[4];
  let w = 0, h = 0;
  function resize() {
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    w = rect.width; h = rect.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw(time) {
    const turn = time / 1000 * .3, tilt = 1.02 + .06 * Math.sin(time / 1000 * .4), scale = Math.min(w * .4, h * .55);
    const st = Math.sin(turn), ct = Math.cos(turn), sx = Math.sin(tilt), cx = Math.cos(tilt);
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = .55; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(32,38,44,.34)';
    for (let i = 0; i < lines; i++) {
      ctx.beginPath();
      for (let j = 0; j < points; j++) {
        const k = (i * points + j) * 3, x = strip[k] * ct - strip[k + 1] * st, y = strip[k] * st + strip[k + 1] * ct, z = strip[k + 2];
        const y2 = y * cx - z * sx, z2 = y * sx + z * cx, p = 3.8 / (3.8 - z2 * .24);
        if (j) ctx.lineTo(w / 2 + x * scale * p, h / 2 + y2 * scale * p); else ctx.moveTo(w / 2 + x * scale * p, h / 2 + y2 * scale * p);
      }
      ctx.stroke();
    }
    if (!reduced.matches) requestAnimationFrame(draw);
  }
  function render() {
    document.title = t('找不到页面 — 陈增春', 'Page not found — Zengchun Chen');
    document.querySelector('#lost-content').innerHTML = `
      <p class="section-label">404 — ${t('找不到页面', 'Page not found')}</p>
      <h1>${t('这一页在莫比乌斯带的另一面。', 'This page is on the other side of the Möbius strip.')}</h1>
      <p class="lost-copy">${t('再绕一圈就到了，或者先回首页。', 'One more lap gets you there, or head back home.')}</p>
      <div class="text-links"><a href="./index.html">${t('回到首页', 'Back home')}</a></div>`;
  }
  Site.start('lost', render);
  addEventListener('resize', () => { resize(); if (reduced.matches) draw(0); });
  resize();
  if (reduced.matches) draw(0); else requestAnimationFrame(draw);
})();

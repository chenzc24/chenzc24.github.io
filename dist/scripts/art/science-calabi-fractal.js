'use strict';

(() => {
  const TAU = Math.PI * 2;

  /*
   * Hanson-style Fermat-quintic visualization.
   * w = a + ib, z1 = exp(2πik1/5) cos(w)^(2/5),
   * z2 = exp(2πik2/5) sin(w)^(2/5), so z1^5 + z2^5 = 1.
   * This is a real 2D slice related to the real 6D Calabi–Yau quintic,
   * projected R4 -> R3, not a six-sphere and not a computed Ricci-flat metric.
   * All 25 branches are retained. Each buffer curve snakes through four
   * neighboring constant-b scans of ONE patch. Short end turns vary b at
   * constant a on that same parameter surface; no different patches connect.
   * At 84 curves this gives 336 contour scans, with cosine-spaced a samples
   * concentrating vertices near the fractional-power endpoints.
   * The slowly changing projection is a linear rotation of the fourth axis.
   * Sources:
   * https://news.iu.edu/luddy/live/news/44157-calabi-yau-sculpture-is-a-visual-force-of-nature
   * https://mathhand.com/science/mathematics/software/help/examples/fermat.html
   * Yau, Calabi's conjecture and some new results in algebraic geometry (1977),
   * https://doi.org/10.1073/pnas.74.5.1798
   */
  function calabi(lineCount, pointCount) {
    const four = new Float32Array(lineCount * pointCount * 4);
    const data = new Float32Array(lineCount * pointCount * 3);
    // A 1 lifts the pen BEFORE this point. The geometry stays continuous for
    // morphing; only the visible contour strokes omit the short scan connectors.
    // A strided renderer must inspect every mask entry skipped since its last
    // sampled point, not just the mask at the current endpoint.
    const breaks = new Uint8Array(lineCount * pointCount);
    // The shaded model retains all 25 sheets. An even b subdivision includes
    // b=0 exactly, where neighboring root branches meet; omitting it leaves holes.
    const columns = 12, rows = 8;
    const surfaceFour = new Float32Array(25 * (columns + 1) * (rows + 1) * 4);
    const surface = {vertices: new Float32Array(surfaceFour.length / 4 * 3), faces: []};
    function coordinate(a, b, k1, k2, target, offset) {
      const cr = Math.cos(a) * Math.cosh(b), ci = -Math.sin(a) * Math.sinh(b);
      const sr = Math.sin(a) * Math.cosh(b), si = Math.cos(a) * Math.sinh(b);
      const r1 = Math.pow(Math.hypot(cr, ci), .4), p1 = Math.atan2(ci, cr) * .4 + TAU * k1 / 5;
      const r2 = Math.pow(Math.hypot(sr, si), .4), p2 = Math.atan2(si, sr) * .4 + TAU * k2 / 5;
      target[offset] = r1 * Math.cos(p1); target[offset + 1] = r1 * Math.sin(p1);
      target[offset + 2] = r2 * Math.cos(p2); target[offset + 3] = r2 * Math.sin(p2);
    }
    for (let patch = 0; patch < 25; patch++) {
      const first = patch * (columns + 1) * (rows + 1);
      for (let row = 0; row <= rows; row++) for (let column = 0; column <= columns; column++) {
        const a = (.5 - .5 * Math.cos(column / columns * Math.PI)) * Math.PI / 2;
        const b = .64 * Math.sin((row / rows - .5) * Math.PI);
        coordinate(a, b, patch % 5, Math.floor(patch / 5), surfaceFour, (first + row * (columns + 1) + column) * 4);
        if (row < rows && column < columns) {
          const k = first + row * (columns + 1) + column;
          surface.faces.push([k, k + 1, k + columns + 2, k + columns + 1]);
        }
      }
    }
    for (let i = 0; i < lineCount; i++) {
      const patch = i % 25, k1 = patch % 5, k2 = Math.floor(patch / 5);
      const lane = Math.floor(i / 25);
      const count = Math.floor((lineCount - 1 - patch) / 25) + 1;
      for (let j = 0; j < pointCount; j++) {
        const path = j / (pointCount - 1) * 4.24;
        const scan = Math.min(3, Math.floor(path / 1.08));
        const local = path - scan * 1.08;
        const inTurn = local > 1 && scan < 3;
        const previousScan = j ? Math.min(3, Math.floor(((j - 1) / (pointCount - 1) * 4.24) / 1.08)) : -1;
        breaks[i * pointCount + j] = Number(j === 0 || inTurn || scan !== previousScan);
        const phase = Math.min(1, local);
        const eased = .5 - .5 * Math.cos(Math.PI * phase);
        const a = ((scan % 2 ? 1 - eased : eased)) * Math.PI / 2;
        const betaIndex = 4 * lane + scan + (inTurn ? (local - 1) / .08 : 0);
        const b = -.64 + 1.28 * betaIndex / (4 * count - 1);
        const cr = Math.cos(a) * Math.cosh(b), ci = -Math.sin(a) * Math.sinh(b);
        const sr = Math.sin(a) * Math.cosh(b), si = Math.cos(a) * Math.sinh(b);
        const r1 = Math.pow(Math.hypot(cr, ci), .4), p1 = Math.atan2(ci, cr) * .4 + TAU * k1 / 5;
        const r2 = Math.pow(Math.hypot(sr, si), .4), p2 = Math.atan2(si, sr) * .4 + TAU * k2 / 5;
        const k = (i * pointCount + j) * 4;
        four[k] = r1 * Math.cos(p1); four[k + 1] = r1 * Math.sin(p1);
        four[k + 2] = r2 * Math.cos(p2); four[k + 3] = r2 * Math.sin(p2);
      }
    }
    function update(out, time) {
      const angle = .78 + .06 * Math.sin(time * .09);
      const ca = Math.cos(angle), sa = Math.sin(angle), scale = .68;
      for (let p = 0; p < lineCount * pointCount; p++) {
        const k = p * 4, q = p * 3;
        out[q] = four[k] * scale;
        out[q + 1] = four[k + 2] * scale;
        out[q + 2] = (four[k + 1] * ca + four[k + 3] * sa) * scale;
      }
      for (let p = 0; p < surfaceFour.length / 4; p++) {
        const k = p * 4, q = p * 3;
        surface.vertices[q] = surfaceFour[k] * scale;
        surface.vertices[q + 1] = surfaceFour[k + 2] * scale;
        surface.vertices[q + 2] = (surfaceFour[k + 1] * ca + surfaceFour[k + 3] * sa) * scale;
      }
    }
    update(data, 0);
    return { index: 6, data, breaks, surface, style: { dots: 0, tilt: .72, yaw: .35, roll: -.08, turn: .22, lineAlpha: .21 }, update };
  }

  /*
   * Sierpinski tetrahedron: the exact four similarity maps F_i(x)=(x+v_i)/2.
   * Three finite generations are shown together as a wire construction.
   * Thus there are 4 + 16 + 64 = 84 tetrahedra at the site's normal resolution.
   * No random displacement or trigonometric surface is used to fake fractality.
   * The limiting attractor is self-similar with dimension log(4)/log(2)=2.
   * https://www.i.h.kyoto-u.ac.jp/users/tsuiki/icube/fractal/S-fractal-e.html
   */
  function fractal(lineCount, pointCount) {
    const vertices = [[0, -1.03, 0], [-.94, .51, -.54], [.94, .51, -.54], [0, .51, 1.08]];
    let level = [{ center: [0, 0, 0], scale: 1 }];
    const cells = [];
    for (let depth = 1; depth <= 3; depth++) {
      const next = [];
      for (const cell of level) for (const vertex of vertices) {
        next.push({ center: vertex.map((v, k) => cell.center[k] + v * cell.scale * .5), scale: cell.scale * .5 });
      }
      cells.push(...next); level = next;
    }
    // An open Euler trail covers all six edges; one edge is retraced.
    const trail = [0, 1, 2, 0, 3, 1, 3, 2];
    const data = new Float32Array(lineCount * pointCount * 3);
    for (let i = 0; i < lineCount; i++) {
      const cell = cells[Math.min(cells.length - 1, Math.floor(i * cells.length / lineCount))];
      for (let j = 0; j < pointCount; j++) {
        const u = j / (pointCount - 1) * (trail.length - 1);
        const segment = Math.min(trail.length - 2, Math.floor(u)), f = u - segment;
        const a = vertices[trail[segment]], b = vertices[trail[segment + 1]];
        const k = (i * pointCount + j) * 3;
        for (let axis = 0; axis < 3; axis++) data[k + axis] = cell.center[axis] + (a[axis] + (b[axis] - a[axis]) * f) * cell.scale;
      }
    }
    return { index: 1, data, style: { dots: 0, tilt: .23, lineAlpha: .34 } };
  }

  function create(lineCount, pointCount) {
    if (!Number.isInteger(lineCount) || lineCount < 4 || !Number.isInteger(pointCount) || pointCount < 2) throw new RangeError('Scientific forms need at least 4 lines and 2 points.');
    return [calabi(lineCount, pointCount), fractal(lineCount, pointCount)];
  }
  window.CalabiFractalForms = Object.freeze({ create });
})();

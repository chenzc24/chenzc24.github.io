'use strict';

(() => {
  const TAU = Math.PI * 2;
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const presets = [
    { dots: 0, tilt: .86, lineAlpha: .38 },
    { dots: 0, tilt: 1.13, lineAlpha: .27 },
    { dots: 1, tilt: .86, lineAlpha: .27 },
    { dots: 0, tilt: .86, lineAlpha: .27 },
    { dots: 0, tilt: .92, lineAlpha: .28, seam: 1 },
    { dots: 0, tilt: .60, lineAlpha: .25 },
    { dots: 0, tilt: .82, lineAlpha: .24 },
    { dots: 0, tilt: .91, lineAlpha: .26 },
    { dots: 0, tilt: .70, lineAlpha: .23 },
    { dots: 0, tilt: .78, lineAlpha: .31 }
  ];

  /** Every form uses the same ordered set of curves, allowing continuous morphs. */
  function build(lineCount, pointCount) {
    if (!Number.isInteger(lineCount) || lineCount < 4 ||
        !Number.isInteger(pointCount) || pointCount < 2) {
      throw new RangeError('FieldShapes.build requires at least 4 lines and 2 points per line.');
    }

    const shapes = presets.map(() => new Float32Array(lineCount * pointCount * 3));

    for (let i = 0; i < lineCount; i++) {
      const across = i / (lineCount - 1) * 2 - 1;
      const v = i / lineCount * TAU;

      // Preserve the original four-sided trace proportions at any line count.
      const side = Math.min(3, Math.floor(i * 4 / lineCount));
      const sideStart = Math.ceil(side * lineCount / 4);
      const laneCount = Math.ceil((side + 1) * lineCount / 4) - sideStart;
      const lane = i - sideStart;
      const offset = laneCount > 1 ? (lane / (laneCount - 1) * 2 - 1) * .45 : 0;
      const direction = Math.sign(offset || 1);
      const knots = [
        [.28, offset], [.38, offset],
        [.49, offset + direction * .11], [.65, offset + direction * .11],
        [.78, offset + direction * .24], [1.12, offset + direction * .24]
      ];
      const sideAngle = side * Math.PI / 2;

      for (let j = 0; j < pointCount; j++) {
        const t = j / (pointCount - 1);
        const u = t * TAU;
        const k = (i * pointCount + j) * 3;

        // 00 — Orthogonal paths around an open center.
        const section = t * (knots.length - 1);
        const segment = Math.min(knots.length - 2, Math.floor(section));
        const fraction = section - segment;
        const px = lerp(knots[segment][0], knots[segment + 1][0], fraction);
        const py = lerp(knots[segment][1], knots[segment + 1][1], fraction);
        shapes[0][k] = px * Math.cos(sideAngle) - py * Math.sin(sideAngle);
        shapes[0][k + 1] = px * Math.sin(sideAngle) + py * Math.cos(sideAngle);
        shapes[0][k + 2] = .04 * Math.sin(lane * .3);

        // 01 — Open orbital contours, unchanged from the first canvas.
        const radius = .74 + .21 * Math.cos(v);
        const orbitU = u * .945 + v * .045;
        shapes[1][k] = radius * Math.cos(orbitU) + .035 * Math.sin(v);
        shapes[1][k + 1] = radius * Math.sin(orbitU);
        shapes[1][k + 2] = .21 * Math.sin(v);

        // 02 — Folded discrete field.
        const ay = t * 2 - 1;
        shapes[2][k] = across * .97;
        shapes[2][k + 1] = ay * .9;
        shapes[2][k + 2] = .33 * Math.sin(across * 2.8 + ay * 1.6) * Math.cos(ay * 1.9);

        // 03 — Two overlapping wave surfaces.
        const x = (t * 2 - 1) * 1.1;
        const y = across * .9;
        const d1 = Math.hypot(x - .34, y);
        const d2 = Math.hypot(x + .34, y);
        shapes[3][k] = x;
        shapes[3][k + 1] = y;
        shapes[3][k + 2] = .12 * (Math.cos(d1 * 13) + Math.cos(d2 * 13));

        // 04 — The full Möbius strip: (2π, v) meets (0, -v).
        // Mirrored lanes share endpoints and tangents at the half-twist seam.
        const ribbonU = u;
        const band = across * .30;
        const ribbonRadius = .67 + band * Math.cos(ribbonU / 2);
        shapes[4][k] = ribbonRadius * Math.cos(ribbonU);
        shapes[4][k + 1] = ribbonRadius * Math.sin(ribbonU);
        shapes[4][k + 2] = band * Math.sin(ribbonU / 2);

        // 05 — Two open, interleaved ribbon bundles with a spindle envelope.
        const branch = i < Math.ceil(lineCount / 2) ? 0 : 1;
        const branchStart = branch ? Math.ceil(lineCount / 2) : 0;
        const branchCount = branch ? lineCount - branchStart : Math.ceil(lineCount / 2);
        const thread = branchCount > 1 ? (i - branchStart) / (branchCount - 1) * 2 - 1 : 0;
        const axial = t * 2 - 1;
        const helixAngle = u * 1.25 + branch * Math.PI;
        const envelope = .25 + .23 * Math.pow(Math.max(0, Math.sin(t * Math.PI)), .8);
        const helixRadius = envelope + thread * .065;
        shapes[5][k] = helixRadius * Math.cos(helixAngle);
        shapes[5][k + 1] = helixRadius * Math.sin(helixAngle);
        shapes[5][k + 2] = axial * .96 + thread * .035;

        // 06 — A widening scroll; neighboring curves reveal the hollow tube.
        const scrollAngle = u * 1.65 - .65;
        const scrollRadius = .18 + .62 * t;
        const tube = .035 + .12 * t;
        const scrollOffset = scrollRadius + tube * Math.cos(v);
        shapes[6][k] = scrollOffset * Math.cos(scrollAngle) + .035;
        shapes[6][k + 1] = scrollOffset * Math.sin(scrollAngle) + .04;
        shapes[6][k + 2] = tube * Math.sin(v) - .20 * t + .10;

        // 07 — An open meridian shell with a small, continuous longitudinal twist.
        const polar = Math.PI * (.12 + .76 * t);
        const longitude = v + .22 * Math.sin(polar * 3);
        const latitudeRadius = .92 * Math.sin(polar);
        shapes[7][k] = latitudeRadius * Math.cos(longitude);
        shapes[7][k + 1] = latitudeRadius * Math.sin(longitude);
        shapes[7][k + 2] = .86 * Math.cos(polar);

        // 08 — A continuous three-lobed braid, shown as fine tubular contours.
        const braidAngle = u * 2;
        const braidRadius = .56 + .19 * Math.cos(u * 3) + .075 * Math.cos(v);
        shapes[8][k] = braidRadius * Math.cos(braidAngle);
        shapes[8][k + 1] = braidRadius * Math.sin(braidAngle);
        shapes[8][k + 2] = .25 * Math.sin(u * 3) + .075 * Math.sin(v);

        // 09 — Pleated radial sheets, held apart by a shallow inner arc.
        const fanAngle = across * Math.PI * .68;
        const reach = .25 + .73 * t;
        shapes[9][k] = reach * Math.sin(fanAngle);
        shapes[9][k + 1] = reach * Math.cos(fanAngle) - .22;
        shapes[9][k + 2] = .145 * Math.sin(fanAngle * 6) * (.25 + .75 * t) + .10 * t * t;
      }
    }

    return { shapes, styles: presets.map(style => ({ ...style })) };
  }

  window.FieldShapes = Object.freeze({ build });
})();

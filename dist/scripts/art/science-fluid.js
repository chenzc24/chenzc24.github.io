'use strict';

(() => {
  /**
   * Burgers vortex streamlines. This is a finite visualization of a steady
   * analytical Navier–Stokes solution, not a general turbulent-flow simulation.
   * In cylindrical coordinates:
   *   u_r = -gamma r, u_z = 2 gamma z,
   *   u_theta = circulation/(2 pi r) [1-exp(-gamma r^2/(2 nu))].
   * Thus r(s)=r0 exp(-gamma s), z(s)=z0 exp(2 gamma s); only theta is
   * integrated numerically. The parameter along each curve is flow time s.
   * Reference: J. Fluid Mech. (2018), "Tracer particle dispersion around
   * elementary flow patterns", §2.1, equations (2.1a-c).
   * https://www.cambridge.org/core/journals/journal-of-fluid-mechanics/article/tracer-particle-dispersion-around-elementary-flow-patterns/7FD71F91EE8E947CA460B5214B30528A
   */
  function create(lineCount, pointCount) {
    if (!Number.isInteger(lineCount) || lineCount < 4 ||
        !Number.isInteger(pointCount) || pointCount < 2) {
      throw new RangeError('FluidForm.create requires at least 4 lines and 2 points.');
    }
    const data = new Float32Array(lineCount * pointCount * 3);
    const reference = new Float32Array(data.length);
    const gamma = .55, viscosity = .035, circulationOverTau = 1.25;
    const tau = Math.PI * 2;
    const bundleCount = Math.ceil(lineCount / 2);
    const phi = .6180339887498949;

    for (let i = 0; i < lineCount; i++) {
      const bundle = Math.floor(i / 2), thread = (i % 2) - .5;
      const sign = bundle % 2 ? -1 : 1;
      // Stagger streamline injection heights so the core remains open and
      // legible. Neighbouring threads expose the direction of each fine bundle.
      const stagger = (bundle * phi) % 1;
      const initialR = .88 + .10 * ((bundle * .38196601125) % 1) + thread * .004;
      const initialZ = sign * (.022 + .065 * stagger);
      const terminalZ = .94 + .08 * ((bundle * .73205080757) % 1);
      const duration = Math.log(terminalZ / Math.abs(initialZ)) / (2 * gamma);
      let theta = tau * (bundle / bundleCount + (sign < 0 ? .037 : 0)) + thread * .035;
      const delta = duration / (pointCount - 1);

      for (let j = 0; j < pointCount; j++) {
        const s = j * delta;
        if (j) {
          // Composite midpoint integration resolves the faster turn near the
          // viscous core without modifying the exact radial/axial trajectories.
          const steps = 8, ds = delta / steps;
          for (let q = 0; q < steps; q++) {
            const mid = s - delta + (q + .5) * ds;
            const radiusSquared = initialR * initialR * Math.exp(-2 * gamma * mid);
            const omega = circulationOverTau * -Math.expm1(-gamma * radiusSquared / (2 * viscosity)) / radiusSquared;
            theta += omega * ds;
          }
        }
        const r = initialR * Math.exp(-gamma * s);
        const k = (i * pointCount + j) * 3;
        reference[k] = r * Math.cos(theta);
        reference[k + 1] = r * Math.sin(theta);
        reference[k + 2] = initialZ * Math.exp(2 * gamma * s);
      }
    }

    function update(out, time) {
      // Axial symmetry makes every rotated curve another streamline of this
      // same steady field. Advection highlights are drawn by the shared renderer.
      const angle = time * .055, c = Math.cos(angle), s = Math.sin(angle), displayScale = .86;
      for (let k = 0; k < reference.length; k += 3) {
        out[k] = (reference[k] * c - reference[k + 1] * s) * displayScale;
        out[k + 1] = (reference[k] * s + reference[k + 1] * c) * displayScale;
        out[k + 2] = reference[k + 2] * displayScale;
      }
    }
    update(data, 0);
    return {
      index: 2,
      data,
      style: { dots: 0, tilt: 1.24, lineAlpha: .29, warp: 0, flow: 1 },
      update
    };
  }
  window.FluidForm = Object.freeze({ create });
})();

'use strict';
(() => {
  // Lorenz (1963): dx=10(y-x), dy=x(28-z)-y, dz=xy-(8/3)z.
  // A single RK4 trajectory, computed once. Adjacent drawing strips share an
  // endpoint; no unrelated trajectories are joined. Rotation and moving ink
  // are presentation only; the orbit is not warped or recomputed every frame.
  // https://transportmaps.mit.edu/docs/pm-data-assimilation.html#Nonlinear-Gaussian-model-(Lorenz-63)
  function create(lineCount, pointCount) {
    if (!Number.isInteger(lineCount) || lineCount < 4 || !Number.isInteger(pointCount) || pointCount < 2) throw new RangeError('Lorenz needs at least 4 lines and 2 points.');
    const data = new Float32Array(lineCount * pointCount * 3);
    const count = lineCount * (pointCount - 1) + 1;
    const orbit = new Float64Array(count * 3);
    const derivative = (x, y, z) => [10 * (y - x), x * (28 - z) - y, x * y - (8 / 3) * z];
    let x = 1, y = 1, z = 1;
    const dt = .008;
    function step() {
      const a = derivative(x, y, z);
      const b = derivative(x + dt * a[0] / 2, y + dt * a[1] / 2, z + dt * a[2] / 2);
      const c = derivative(x + dt * b[0] / 2, y + dt * b[1] / 2, z + dt * b[2] / 2);
      const d = derivative(x + dt * c[0], y + dt * c[1], z + dt * c[2]);
      x += dt / 6 * (a[0] + 2 * b[0] + 2 * c[0] + d[0]);
      y += dt / 6 * (a[1] + 2 * b[1] + 2 * c[1] + d[1]);
      z += dt / 6 * (a[2] + 2 * b[2] + 2 * c[2] + d[2]);
    }
    for (let i = 0; i < 2500; i++) step();
    for (let p = 0; p < count; p++) {
      orbit[p * 3] = x * .044;
      orbit[p * 3 + 1] = -(z - 25) * .044;
      orbit[p * 3 + 2] = y * .044;
      step();
    }
    for (let line = 0; line < lineCount; line++) for (let point = 0; point < pointCount; point++) {
      const source = (line * (pointCount - 1) + point) * 3;
      const target = (line * pointCount + point) * 3;
      data[target] = orbit[source]; data[target + 1] = orbit[source + 1]; data[target + 2] = orbit[source + 2];
    }
    return {index: 9, data, style: {dots: 0, tilt: .08, yaw: .05, roll: 0, turn: .12, size: .99, lineAlpha: .21, trace: 1}};
  }
  window.LorenzForm = Object.freeze({create});
})();

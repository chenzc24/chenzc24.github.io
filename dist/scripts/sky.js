'use strict';
// The Sun and Moon from the low-precision series in Meeus, Astronomical Algorithms (ch. 25 and 48):
// about 0.01° for the Sun's apparent longitude and 1% for the Moon's lit fraction, enough to name
// today's solar term and moon phase. Solar terms are dated by China Standard Time (UTC+8).
window.Sky = (() => {
  const rad = Math.PI / 180, day = 864e5, chinaOffset = 8 * 36e5;
  const wrap = degrees => (degrees % 360 + 360) % 360;
  const centuries = date => (date.getTime() / day + 2440587.5 - 2451545) / 36525;
  // The 24 solar terms begin every 15° of the Sun's longitude, starting with 春分 at 0°.
  const terms = [['春分','Spring Equinox'],['清明','Pure Brightness'],['谷雨','Grain Rain'],['立夏','Start of Summer'],['小满','Grain Buds'],['芒种','Grain in Ear'],['夏至','Summer Solstice'],['小暑','Minor Heat'],['大暑','Major Heat'],['立秋','Start of Autumn'],['处暑','End of Heat'],['白露','White Dew'],['秋分','Autumn Equinox'],['寒露','Cold Dew'],['霜降','Frost’s Descent'],['立冬','Start of Winter'],['小雪','Minor Snow'],['大雪','Major Snow'],['冬至','Winter Solstice'],['小寒','Minor Cold'],['大寒','Major Cold'],['立春','Start of Spring'],['雨水','Rain Water'],['惊蛰','Awakening of Insects']];
  const phases = [['新月','New moon'],['蛾眉月','Waxing crescent'],['上弦月','First quarter'],['盈凸月','Waxing gibbous'],['满月','Full moon'],['亏凸月','Waning gibbous'],['下弦月','Last quarter'],['残月','Waning crescent']];
  function sunLongitude(date) {
    const T = centuries(date), M = (357.52911 + 35999.05029 * T - .0001537 * T * T) * rad;
    const center = (1.914602 - .004817 * T - .000014 * T * T) * Math.sin(M) + (.019993 - .000101 * T) * Math.sin(2 * M) + .000289 * Math.sin(3 * M);
    return wrap(280.46646 + 36000.76983 * T + .0003032 * T * T + center - .00569 - .00478 * Math.sin((125.04 - 1934.136 * T) * rad));
  }
  // age is the Moon's elongation from the Sun: 0° at new moon, 90° at first quarter, 180° at full moon.
  function moon(date) {
    const T = centuries(date), sin = degrees => Math.sin(degrees * rad);
    const D = 297.8501921 + 445267.1114034 * T - .0018819 * T * T + T ** 3 / 545868 - T ** 4 / 113065000;
    const M = 357.5291092 + 35999.0502909 * T - .0001536 * T * T + T ** 3 / 24490000;
    const Mm = 134.9633964 + 477198.8675055 * T + .0087414 * T * T + T ** 3 / 69699 - T ** 4 / 14712000;
    const age = wrap(D + 6.289 * sin(Mm) - 2.1 * sin(M) + 1.274 * sin(2 * D - Mm) + .658 * sin(2 * D) + .214 * sin(2 * Mm) + .11 * sin(D));
    // The four principal phases are named within about a day (12°) of their exact moment.
    const nearest = Math.round(age / 90), principal = Math.abs(age - nearest * 90) <= 12;
    return {age, lit: (1 - Math.cos(age * rad)) / 2, phase: phases[principal ? nearest % 4 * 2 : Math.floor(age / 90) * 2 + 1]};
  }
  function today(date = new Date()) {
    const longitude = sunLongitude(date), midnight = Math.floor((date.getTime() + chinaOffset) / day) * day - chinaOffset;
    // A term starts today when the Sun crosses its longitude between this day's midnights in UTC+8.
    const from = sunLongitude(new Date(midnight)), next = sunLongitude(new Date(midnight + day)), to = next < from ? next + 360 : next;
    const crossed = Math.floor(to / 15) > Math.floor(from / 15);
    return {longitude, term: terms[Math.floor(longitude / 15)], starting: crossed ? terms[Math.floor(to / 15) % 24] : null, moon: moon(date)};
  }
  return Object.freeze({today});
})();

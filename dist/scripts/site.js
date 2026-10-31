'use strict';
window.Site = (() => {
  let language = 'zh';
  try { language = localStorage.getItem('zc-lang') === 'en' ? 'en' : 'zh'; } catch {}
  let page = 'home', revealObserver;
  const profile = window.PortfolioProfile;
  const t = (zh, en) => language === 'zh' ? zh : en;
  const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const external = (url, label) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
  const portrait = (kind, className) => {
    const photograph = profile.photographs[kind];
    return `<img class="${className}" src="./assets/${photograph.file}" width="${photograph.width}" height="${photograph.height}" alt="${escape(t(...profile.name))}" fetchpriority="high">`;
  };
  const projectImage = (project, loading = 'lazy') => `<img src="./assets/${project.image}" width="${project.imageWidth}" height="${project.imageHeight}" alt="${escape(t(...project.imageAlt))}" loading="${loading}">`;
  // A project's figure keeps one number across the site: its position in projects.js.
  const figureCaption = project => `<figcaption class="plate-caption"><b>${t('图','Fig.')} ${window.PortfolioProjects.indexOf(project) + 1}</b> ${escape(t(...project.caption))}</figcaption>`;
  const zoned = (date, options) => Object.fromEntries(new Intl.DateTimeFormat('en-GB', {timeZone: profile.place.timeZone, ...options}).formatToParts(date).map(part => [part.type, part.value]));
  const clock = () => { const {hour, minute} = zoned(new Date(), {hour: '2-digit', minute: '2-digit', hourCycle: 'h23'}); return `${hour}:${minute}`; };
  // Last-Modified of this page; on GitHub Pages that is the latest deployment.
  const modified = new Date(document.lastModified);
  const updated = Number.isNaN(modified.getTime()) ? null : zoned(modified, {year: 'numeric', month: '2-digit', day: '2-digit'});
  // Pronunciation and meaning of the name, shown when the name in the header is hovered or focused.
  const nameCard = () => `<span class="name-card" id="name-card" role="tooltip"><span class="name-card-pinyin">${t('', `<span class="name-card-han">${escape(profile.name[0])}</span>`)}${escape(profile.nameCard.pinyin)}</span><span class="name-card-meaning">${profile.nameCard.characters.map(([character, meaning]) => `<b>${escape(character)}</b> ${escape(t(...meaning))}`).join(' · ')}</span></span>`;
  // ZC24, the number in the GitHub handle, marked on a small chip package; favicon.svg draws the same chip.
  const pins = [7, 13, 19, 25, 31, 37].map(x => `M${x - 1} 0h2v4h-2zM${x - 1} 18h2v4h-2z`).join('');
  const chipMark = () => `<svg class="chip-mark" viewBox="0 0 44 22" role="img" aria-label="ZC24"><title>${escape(t('ZC24 · 清华集成电路 2024 级', 'ZC24 · Tsinghua integrated circuits, 2024–2028'))}</title><path class="chip-pins" d="${pins}"/><rect class="chip-body" x="2" y="4" width="40" height="14" rx="1.5"/><circle class="chip-dot" cx="6" cy="14.5" r="1.1"/><text x="22.5" y="13.6" text-anchor="middle">ZC24</text></svg>`;
  // Almanac convention: the unlit part of the disc is shaded and the lit part left as paper.
  function moonIcon(age) {
    const r = 5, waxing = age < 180, x = r * Math.cos(age * Math.PI / 180) * (waxing ? 1 : -1);
    const lit = `M0 ${-r}A${r} ${r} 0 0 ${waxing ? 1 : 0} 0 ${r}A${Math.abs(x).toFixed(2)} ${r} 0 0 ${x > 0 ? 0 : 1} 0 ${-r}Z`;
    return `<svg class="moon" viewBox="-6 -6 12 12" aria-hidden="true"><circle class="moon-dark" r="${r}"/><path class="moon-lit" d="${lit}"/><circle class="moon-rim" r="${r}"/></svg>`;
  }
  // Today's solar term and moon over Beijing (scripts/sky.js); a term that begins today is named as such.
  function sky() {
    if (!window.Sky) return '';
    const {longitude, term, starting, moon} = window.Sky.today(), lit = Math.round(moon.lit * 100);
    const detail = t(`太阳黄经 ${longitude.toFixed(1)}° · 月面照亮 ${lit}%`, `Sun at ${longitude.toFixed(1)}° ecliptic longitude · Moon ${lit}% lit`);
    return `<span class="sky" data-sky title="${escape(detail)}">${escape(starting ? t(`今日${starting[0]}`, `${starting[1]} today`) : t(...term))} · ${moonIcon(moon.age)}${escape(t(...moon.phase))}</span>`;
  }
  function chrome() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    const header = document.querySelector('[data-site-header]');
    const footer = document.querySelector('[data-site-footer]');
    header.innerHTML = `<span class="brand-wrap"><a class="brand" href="./index.html" aria-label="${escape(t('陈增春，首页','Zengchun Chen, home'))}" aria-describedby="name-card">${t(...profile.name)}</a>${nameCard()}</span><nav class="site-nav" aria-label="${t('主导航','Main navigation')}"><a href="./index.html" ${page === 'home' ? 'aria-current="page"' : ''}>${t('首页','Home')}</a><a href="./resume.html" ${page === 'profile' ? 'aria-current="page"' : ''}>${t('履历','Profile')}</a><a href="./updates.html" ${page === 'updates' ? 'aria-current="page"' : ''}>${t('近况','Updates')}</a>${external(profile.github, 'GitHub')}<button type="button" data-language-toggle aria-label="${t('Switch to English','切换至中文')}">${language === 'zh' ? 'EN' : '中'}</button></nav>`;
    if (footer) footer.innerHTML = `<p class="footer-contact">${chipMark()}<a href="mailto:${profile.email}">${profile.email}</a>${external(profile.github, 'GitHub')}</p><p class="colophon"><span>${t(...profile.place.city)} · ${profile.place.offset} · <span data-clock>${clock()}</span></span>${sky()}${updated ? `<span>${t('更新于','Updated')} <time datetime="${updated.year}-${updated.month}-${updated.day}">${updated.year}.${updated.month}.${updated.day}</time></span>` : ''}</p>`;
    const skip = document.querySelector('.skip');
    if (skip) skip.textContent = t('跳到正文','Skip to content');
  }
  function tick() {
    document.querySelectorAll('[data-clock]').forEach(node => { node.textContent = clock(); });
    document.querySelectorAll('[data-sky]').forEach(node => { node.outerHTML = sky(); });
    setTimeout(tick, 60000 - Date.now() % 60000 + 50);
  }
  function reveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('reveal-ready');
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    }), {rootMargin: '0px 0px -6% 0px'});
    items.forEach(item => revealObserver.observe(item));
  }
  function start(currentPage, render) {
    page = currentPage;
    chrome();
    render();
    reveal();
    setTimeout(tick, 60000 - Date.now() % 60000 + 50);
    window.addEventListener('site:language', () => {
      const position = scrollY;
      // Entrance motion is for the first view; re-rendered content stays in place.
      revealObserver?.disconnect();
      document.documentElement.classList.remove('reveal-ready');
      chrome();
      render();
      document.querySelector('[data-language-toggle]').focus({preventScroll:true});
      window.scrollTo({top:position, behavior:'instant'});
    });
  }
  document.addEventListener('click', event => {
    if (!event.target.closest('[data-language-toggle]')) return;
    language = language === 'zh' ? 'en' : 'zh';
    try { localStorage.setItem('zc-lang', language); } catch {}
    window.dispatchEvent(new Event('site:language'));
  });
  // A hello for anyone who opens the browser console.
  console.log('%c ┌┴─┴─┴─┴─┴─┴┐\n─┤ ZC24      ├─\n─┤ ●         ├─\n └┬─┬─┬─┬─┬─┬┘', 'font: 12px/1.25 monospace; color: #2f6b60');
  console.log(`%c${t('你好，读源码的朋友。这个网站是纯 HTML、CSS 和 JS，没有框架；首页的图形都在你的浏览器里实时计算。\n来信：', 'Hi, source reader. This site is plain HTML, CSS and JS with no framework; the forms on the home page are computed live in your browser.\nSay hello: ')}${profile.email}`, 'font: 12px/1.7 monospace; color: #626c72');
  return {t, escape, external, portrait, projectImage, figureCaption, start, profile, get language(){ return language; }};
})();

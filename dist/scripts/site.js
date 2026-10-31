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
  function chrome() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    const header = document.querySelector('[data-site-header]');
    const footer = document.querySelector('[data-site-footer]');
    header.innerHTML = `<a class="brand" href="./index.html" aria-label="${escape(t('陈增春，首页','Zengchun Chen, home'))}">${t(...profile.name)}</a><nav class="site-nav" aria-label="${t('主导航','Main navigation')}"><a href="./index.html" ${page === 'home' ? 'aria-current="page"' : ''}>${t('首页','Home')}</a><a href="./resume.html" ${page === 'profile' ? 'aria-current="page"' : ''}>${t('履历','Profile')}</a><a href="./updates.html" ${page === 'updates' ? 'aria-current="page"' : ''}>${t('近况','Updates')}</a>${external(profile.github, 'GitHub')}<button type="button" data-language-toggle aria-label="${t('Switch to English','切换至中文')}">${language === 'zh' ? 'EN' : '中'}</button></nav>`;
    if (footer) footer.innerHTML = `<p class="footer-contact"><a href="mailto:${profile.email}">${profile.email}</a>${external(profile.github, 'GitHub')}</p><p class="colophon"><span>${t(...profile.place.city)} · ${profile.place.offset} · <span data-clock>${clock()}</span></span>${updated ? `<span>${t('更新于','Updated')} <time datetime="${updated.year}-${updated.month}-${updated.day}">${updated.year}.${updated.month}.${updated.day}</time></span>` : ''}</p>`;
    document.querySelector('.skip').textContent = t('跳到正文','Skip to content');
  }
  function tick() {
    document.querySelectorAll('[data-clock]').forEach(node => { node.textContent = clock(); });
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
  return {t, escape, external, portrait, projectImage, figureCaption, start, profile, get language(){ return language; }};
})();

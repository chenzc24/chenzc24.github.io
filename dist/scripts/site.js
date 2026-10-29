'use strict';
window.Site = (() => {
  let language = 'zh';
  try { language = localStorage.getItem('zc-lang') === 'en' ? 'en' : 'zh'; } catch {}
  let page = 'home';
  const profile = window.PortfolioProfile;
  const t = (zh, en) => language === 'zh' ? zh : en;
  const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const external = (url, label) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
  const portrait = (kind, className) => {
    const photograph = profile.photographs[kind];
    return `<img class="${className}" src="./assets/${photograph.file}" width="${photograph.width}" height="${photograph.height}" alt="${escape(t(...profile.name))}" fetchpriority="high">`;
  };
  const projectImage = (project, loading = 'lazy') => `<img src="./assets/${project.image}" width="${project.imageWidth}" height="${project.imageHeight}" alt="${escape(t(...project.imageAlt))}" loading="${loading}">`;
  function chrome() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    const header = document.querySelector('[data-site-header]');
    const footer = document.querySelector('[data-site-footer]');
    header.innerHTML = `<a class="brand" href="./index.html" aria-label="${escape(t('陈增春，首页','Zengchun Chen, home'))}">${t(...profile.name)}</a><nav class="site-nav" aria-label="${t('主导航','Main navigation')}"><a href="./index.html" ${page === 'home' ? 'aria-current="page"' : ''}>${t('首页','Home')}</a><a href="./resume.html" ${page === 'profile' ? 'aria-current="page"' : ''}>${t('履历','Profile')}</a><a href="./updates.html" ${page === 'updates' ? 'aria-current="page"' : ''}>${t('近况','Updates')}</a>${external(profile.github, 'GitHub')}<button type="button" data-language-toggle aria-label="${t('Switch to English','切换至中文')}">${language === 'zh' ? 'EN' : '中'}</button></nav>`;
    if (footer) footer.innerHTML = `<a href="mailto:${profile.email}">${profile.email}</a><a href="./${page === 'home' ? 'resume' : 'index'}.html">${page === 'home' ? t('履历与成果','Profile & work') : t('返回首页','Back home')}</a>`;
    document.querySelector('.skip').textContent = t('跳到正文','Skip to content');
  }
  function start(currentPage, render) {
    page = currentPage;
    chrome();
    render();
    window.addEventListener('site:language', () => {
      const position = scrollY;
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
  return {t, escape, external, portrait, projectImage, start, profile, get language(){ return language; }};
})();

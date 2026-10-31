'use strict';
(() => {
  const {t, escape, profile, portrait, projectImage} = Site;
  const research = PortfolioProjects.find(project => project.id === 'io-ring');
  const tool = PortfolioProjects.find(project => project.id === 'analog-canvas');
  const arrow = '<span class="arrow" aria-hidden="true">→</span>';
  // Thumbnails repeat the card's main link, so they stay out of the tab order.
  const thumbnail = project => `<a class="plate project-image image-${project.id}" href="./${project.id}.html" tabindex="-1" aria-hidden="true">${projectImage(project)}</a>`;
  // The newest entry in updates.js; profile.recent is the entry point when there is none.
  function latest() {
    const entry = window.PortfolioUpdates?.[0];
    if (!entry) return `<a href="${profile.recent.href}"><span class="underline">${t(...profile.recent.text)}</span></a>`;
    return `<a class="latest" href="./updates.html#${escape(entry.id)}"><span class="latest-label">${t('近况','Latest')}</span><time datetime="${escape(entry.date)}">${escape(t(...entry.dateLabel))}</time><span class="underline">${escape(t(...entry.title))}</span>${arrow}</a>`;
  }
  function render() {
    document.title = t('陈增春 · Zengchun Chen','Zengchun Chen');
    document.querySelector('#home-introduction').innerHTML = `
      <figure class="home-photograph">${portrait('home','home-portrait')}</figure>
      <div class="home-copy">
        <h1 id="greeting"><span class="greeting">${t(...profile.greeting)}</span><span>${t(...profile.introduction)}</span></h1>
        <div class="intro-copy"><p>${t(...profile.homeIntroduction)}</p><p class="recent-work">${latest()}</p></div>
        <div class="text-links"><a href="./resume.html">${t('履历与成果','Profile & work')}</a><a href="mailto:${profile.email}">${t('联系我','Say hello')}</a></div>
      </div>`;
    document.querySelector('#home-index').innerHTML = `
      <article data-reveal>${thumbnail(research)}<p class="section-label">01 — ${t('精选工作','Selected research')}</p><h2><a class="underline" href="./${research.id}.html">${research.name}</a></h2><p>${t(...research.summary)}</p><a class="index-link" href="./io-ring.html"><span class="underline">IEEE ISCAS 2026</span>${arrow}</a></article>
      <article data-reveal style="--reveal-order:1">${thumbnail(tool)}<p class="section-label">02 — ${t('开源工具','Open source')}</p><h2><a class="underline" href="./${tool.id}.html">${tool.name}</a></h2><p>${t(...tool.summary)}</p><a class="index-link" href="./resume.html#work"><span class="underline">${t('更多项目','More projects')}</span>${arrow}</a></article>
      <article data-reveal style="--reveal-order:2"><a class="plate project-image plate-equation" href="./notes.html#mobius-seam" tabindex="-1" aria-hidden="true">r(0, v) = r(2π, −v)</a><p class="section-label">03 — ${t('好奇心','Curiosity')}</p><h2><a class="underline" href="./notes.html">${t('电路之外','Beyond circuits')}</a></h2><p>${t(...profile.curiosity)}</p><a class="index-link" href="./notes.html"><span class="underline">${t('读两则札记','Read two notes')}</span>${arrow}</a></article>`;
    document.querySelector('#home-index').setAttribute('aria-label',t('精选工作与兴趣','Selected work and interests'));
  }
  Site.start('home', render);
})();

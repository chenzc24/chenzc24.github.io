'use strict';
(() => {
  const {t, profile, portrait} = Site;
  const research = PortfolioProjects.find(project => project.id === 'io-ring');
  const tool = PortfolioProjects.find(project => project.id === 'analog-canvas');
  function render() {
    document.title = t('陈增春 · Zengchun Chen','Zengchun Chen');
    document.querySelector('#home-introduction').innerHTML = `
      <figure class="home-photograph">${portrait('home','home-portrait')}</figure>
      <div class="home-copy">
        <h1 id="greeting"><span class="greeting">${t(...profile.greeting)}</span><span>${t(...profile.introduction)}</span></h1>
        <div class="intro-copy"><p>${t(...profile.homeIntroduction)}</p><p class="recent-work"><a href="${profile.recent.href}">${t(...profile.recent.text)}</a></p></div>
        <div class="text-links"><a href="./resume.html">${t('履历与成果','Profile & work')}</a><a href="mailto:${profile.email}">${t('联系我','Say hello')}</a></div>
      </div>`;
    document.querySelector('#home-index').innerHTML = `
      <article><p class="section-label">${t('精选工作','Selected research')}</p><h2><a href="./${research.id}.html">${research.name}</a></h2><p>${t(...research.summary)}</p><a class="index-link" href="./io-ring.html">IEEE ISCAS 2026</a></article>
      <article><p class="section-label">${t('开源工具','Open source')}</p><h2><a href="./${tool.id}.html">${tool.name}</a></h2><p>${t(...tool.summary)}</p><a class="index-link" href="./resume.html#work">${t('更多项目','More projects')}</a></article>
      <article><p class="section-label">${t('好奇心','Curiosity')}</p><h2><a href="./notes.html">${t('电路之外','Beyond circuits')}</a></h2><p>${t(...profile.curiosity)}</p><a class="index-link" href="./notes.html">${t('读两则札记','Read two notes')}</a></article>`;
    document.querySelector('#home-index').setAttribute('aria-label',t('精选工作与兴趣','Selected work and interests'));
  }
  Site.start('home', render);
})();

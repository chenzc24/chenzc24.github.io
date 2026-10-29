'use strict';
(() => {
  const {t, external, projectImage, profile} = Site;
  const projects = window.PortfolioProjects;
  const id = location.pathname.split('/').pop().replace('.html', '');
  const project = projects.find(item => item.id === id);
  if (!project) return;
  function render() {
    const next = projects[(projects.indexOf(project) + 1) % projects.length];
    const title = project.id === 'virtuoso-bridge' ? 'virtuoso-<br>bridge-lite' : project.name;
    document.title = `${project.name} — ${t(...profile.name)}`;
    document.querySelector('#project-content').innerHTML = `
      <a class="back-link" href="./resume.html#${id === 'io-ring' ? 'research' : 'work'}">← ${t('履历与成果','Profile & work')}</a>
      <section class="project-overview detail-${id}" aria-labelledby="project-title">
        <div class="project-intro"><h1 id="project-title">${title}</h1><p class="project-role">${t(...project.role)}</p><p class="project-description">${t(...project.introduction)}</p><div class="text-links project-links">${project.links.map(link => external(link.url, t(...link.label))).join('')}</div></div>
        <figure class="project-figure"><a class="original-image" href="./assets/${project.image}" target="_blank" rel="noopener" aria-label="${t('查看原图','View original image')}">${projectImage(project,'eager')}</a></figure>
      </section>
      ${id === 'io-ring' ? `<section class="paper" aria-label="${t('论文','Publication')}"><h2>${external('https://doi.org/10.1109/ISCAS66217.2026.11562717','Live Demonstration: Multi-Modal Agent for Interactive Multi-Process I/O Ring Generation')}</h2><p>Z. Zhang, Z. Chen, X. Li et al. · IEEE ISCAS 2026</p></section>` : ''}
      <details class="image-source"><summary>${project.license ? t('图源与许可','Image source & license') : t('图片来源','Image source')}</summary><div><p>${t(...project.imageDescription)}</p><nav>${external(project.source,t('原始出处','Original source'))}${project.license ? `<a href="./assets/${project.license}" target="_blank" rel="noopener">${t('许可全文','License')}</a>` : ''}</nav></div></details>
      <nav class="project-navigation" aria-label="${t('项目导航','Project navigation')}"><a href="./resume.html#work">← ${t('全部项目','All projects')}</a><a href="./${next.id}.html">${next.name} <span aria-hidden="true">→</span></a></nav>`;
  }
  Site.start('project', render);
})();

'use strict';
(() => {
  const {t, profile, portrait, projectImage, figureCaption, external} = Site;
  let observer;
  const sections = [['research','研究与论文','Research'],['work','开源项目','Open source'],['experience','经历与奖项','Experience']];
  const index = id => `<span class="section-index">0${sections.findIndex(section => section[0] === id) + 1}</span>`;
  function projectRow(project) {
    return `<article class="project-row" data-reveal><figure class="project-plate"><a class="plate project-image image-${project.id}" href="./${project.id}.html" aria-label="${t('查看','Explore')} ${project.name}">${projectImage(project)}</a>${figureCaption(project)}</figure><div class="project-copy"><h3><a class="underline" href="./${project.id}.html">${project.name}</a></h3><p class="project-role">${t(...project.role)}</p><p class="project-summary">${t(...project.summary)}</p></div></article>`;
  }
  function render() {
    observer?.disconnect();
    document.title = t('履历与成果 — 陈增春','Profile & work — Zengchun Chen');
    document.querySelector('#profile-content').innerHTML = `
      <section class="profile-head" id="about" aria-labelledby="profile-name">
        <div class="profile-name"><h1 id="profile-name">${t(...profile.name)}</h1><p>${t(...profile.secondaryName)}</p></div>
        <figure class="profile-photograph">${portrait('profile','profile-portrait')}</figure>
        <div class="profile-summary"><p class="school">${t(...profile.school)}</p><p class="degree">${t(...profile.degree)}</p><p class="focus">${t(...profile.focus)}</p><div class="text-links"><a href="mailto:${profile.email}">${t('电子邮件','Email')}</a>${external(profile.github,'GitHub')}<button id="profile-print" type="button">${t('打印 / PDF','Print / PDF')}</button></div></div>
      </section>
      <div class="profile-body"><aside class="section-nav"><nav aria-label="${t('履历目录','Profile sections')}">${sections.map(([id,zh,en])=>`<a href="#${id}">${index(id)}${t(zh,en)}</a>`).join('')}</nav></aside><div class="profile-sections">
        <section id="research" class="profile-section"><h2>${index('research')}${t('研究与论文','Research & publication')}</h2>${projectRow(PortfolioProjects.find(project=>project.id==='io-ring'))}</section>
        <section id="work" class="profile-section"><h2>${index('work')}${t('开源项目','Open-source projects')}</h2>${PortfolioProjects.filter(project=>project.id!=='io-ring').map(projectRow).join('')}</section>
        <section id="experience" class="profile-section"><h2>${index('experience')}${t('经历与奖项','Experience & recognition')}</h2><dl class="timeline">${profile.experience.map(group=>`<div class="year-group" data-reveal><dt>${group.year}</dt><dd>${group.items.map(item=>`<article><h3>${t(...item.title)}</h3><p>${t(...item.detail)}</p></article>`).join('')}</dd></div>`).join('')}</dl></section>
      </div></div>`;
    document.querySelector('#profile-print').addEventListener('click',()=>window.print());
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        const section = entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
        if (!section) return;
        document.querySelectorAll('.section-nav a').forEach(link=>{
          if (link.hash === `#${section.target.id}`) link.setAttribute('aria-current','location');
          else link.removeAttribute('aria-current');
        });
      }, {rootMargin:'-12% 0px -50% 0px', threshold:0});
      document.querySelectorAll('.profile-section').forEach(section=>observer.observe(section));
    }
  }
  Site.start('profile',render);
  if (location.hash) requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());
})();

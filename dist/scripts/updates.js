'use strict';
(() => {
  const {t, escape, external} = Site;
  const linkMarkup = link => link.url.startsWith('./')
    ? `<a href="${escape(link.url)}">${escape(t(...link.label))}</a>`
    : external(link.url, t(...link.label));

  function render() {
    document.title = t('近况 — 陈增春', 'Updates — Zengchun Chen');
    document.querySelector('#updates-content').innerHTML = `
      <header class="updates-heading"><h1>${t('近况', 'Updates')}</h1><p>${t('学习、项目与生活。', 'Study, projects, and life.')}</p></header>
      <div class="updates-list">${PortfolioUpdates.map((entry, order) => `
        <article class="update" id="${escape(entry.id)}" aria-labelledby="${escape(entry.id)}-title" data-reveal style="--reveal-order:${Math.min(order, 3)}">
          <time datetime="${escape(entry.date)}">${escape(t(...entry.dateLabel))}</time>
          <div class="update-body">
            <h2 id="${escape(entry.id)}-title">${escape(t(...entry.title))}</h2>
            ${entry.paragraphs.map(paragraph => `<p>${escape(t(...paragraph))}</p>`).join('')}
            ${entry.image ? `<figure class="update-image"><img src="${escape(entry.image.src)}" width="${entry.image.width}" height="${entry.image.height}" alt="${escape(t(...entry.image.alt))}" loading="lazy"></figure>` : ''}
            ${entry.links?.length ? `<div class="text-links update-links">${entry.links.map(linkMarkup).join('')}</div>` : ''}
          </div>
        </article>`).join('')}
      </div>`;
  }
  Site.start('updates', render);
  if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
})();

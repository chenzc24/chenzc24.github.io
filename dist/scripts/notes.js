'use strict';
(() => {
  const {t, escape, external} = Site;
  function render() {
    document.title = t('随手记 — 陈增春','Notes — Zengchun Chen');
    document.querySelector('#notes-content').innerHTML = `
      <header class="notes-heading"><h1>${t('随手记','Notes')}</h1><p>${t('图形、信号与实现中的细节。','Shapes, signals, and details of implementation.')}</p></header>
      ${PortfolioNotes.map((note,order)=>`<article class="note" id="${note.id}" aria-labelledby="${note.id}-title" data-reveal style="--reveal-order:${order}"><h2 id="${note.id}-title">${escape(t(...note.title))}</h2>${note.paragraphs.map(paragraph=>`<p>${escape(t(...paragraph))}</p>`).join('')}${note.equation?`<p class="note-equation">${escape(note.equation)}</p>`:''}<div class="text-links note-reference">${external(note.reference.url,t(...note.reference.label))}</div></article>`).join('')}`;
  }
  Site.start('notes',render);
  if (location.hash) requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());
})();

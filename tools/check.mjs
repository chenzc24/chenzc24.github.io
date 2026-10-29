import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script, runInNewContext} from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const errors = [];
const scripts = [];
function walk(directory) {
  for (const entry of readdirSync(directory, {withFileTypes:true})) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith('.js')) scripts.push(file);
  }
}
walk(join(root,'scripts'));
walk(join(root,'data'));
for (const file of scripts) {
  try { new Script(readFileSync(file,'utf8'), {filename:file}); }
  catch (error) { errors.push(error.message); }
}
function checkReference(reference, from) {
  if (!reference.startsWith('./')) return;
  const file = resolve(dirname(from), reference.split(/[?#]/)[0]);
  if (!existsSync(file)) errors.push(`Missing reference: ${from} → ${reference}`);
}
const pages = readdirSync(root).filter(file=>file.endsWith('.html'));
for (const page of pages) {
  const path = join(root,page), html = readFileSync(path,'utf8');
  for (const [,reference] of html.matchAll(/(?:src|href)="([^"]+)"/g)) checkReference(reference,path);
}
const context = {window:{}};
runInNewContext(readFileSync(join(root,'data/profile.js'),'utf8'), context);
runInNewContext(readFileSync(join(root,'data/projects.js'),'utf8'), context);
runInNewContext(readFileSync(join(root,'data/notes.js'),'utf8'), context);
runInNewContext(readFileSync(join(root,'data/updates.js'),'utf8'), context);
const ids = new Set();
for (const project of context.window.PortfolioProjects) {
  if (ids.has(project.id)) errors.push(`Duplicate project id: ${project.id}`);
  ids.add(project.id);
  const page = join(root,`${project.id}.html`);
  if (!existsSync(page)) errors.push(`Missing project page: ${page}`);
  for (const asset of [project.image,project.license].filter(Boolean)) checkReference(`./assets/${asset}`,page);
  checkReference(project.source,page);
  for (const link of project.links) checkReference(link.url,page);
}
for (const photo of Object.values(context.window.PortfolioProfile.photographs)) checkReference(`./assets/${photo.file}`,join(root,'index.html'));
checkReference(context.window.PortfolioProfile.recent.href,join(root,'index.html'));
for (const note of context.window.PortfolioNotes) checkReference(note.reference.url,join(root,'notes.html'));
const updateIds = new Set();
for (const entry of context.window.PortfolioUpdates) {
  if (updateIds.has(entry.id)) errors.push(`Duplicate update id: ${entry.id}`);
  updateIds.add(entry.id);
  if (!/^\d{4}(-\d{2}){0,2}$/.test(entry.date)) errors.push(`Invalid update date: ${entry.id}`);
  for (const pair of [entry.title, entry.dateLabel, ...entry.paragraphs]) {
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some(text => typeof text !== 'string' || !text.trim())) errors.push(`Missing translation: ${entry.id}`);
  }
  for (const link of entry.links || []) checkReference(link.url,join(root,'updates.html'));
  if (entry.image) checkReference(entry.image.src,join(root,'updates.html'));
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`OK: ${pages.length} pages, ${scripts.length} scripts, ${ids.size} projects, ${updateIds.size} updates and their local assets.`);

/* app.js — front vanilla BBR (zéro build, same-origin avec le backend). */
'use strict';

const dropzone = document.getElementById('dropzone');
const fileinput = document.getElementById('fileinput');
const jobsUl = document.getElementById('jobs');
const healthEl = document.getElementById('health');

const BADGES = {
  QUEUED: ['En file', ''],
  RUNNING: ['En cours', ''],
  DONE: ['Réussi', 'done'],
  REVIEW: ['À revoir', ''],
  BLOCKED: ['Bloqué', 'blocked'],
  UNSUPPORTED: ['Non couvert', 'unsupported'],
  ERROR: ['Erreur', 'error'],
};

function el(tag, attrs, text) {
  const e = document.createElement(tag);
  for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
  if (text) e.textContent = text;
  return e;
}

async function refreshHealth() {
  try {
    const r = await fetch('/api/health');
    const h = await r.json();
    healthEl.textContent =
      'moteur ' + (h.engine_revision || '?') +
      ' — ' + (h.workers || 0) + ' remédiateur(s)';
  } catch (e) {
    healthEl.textContent = 'service injoignable';
  }
}

async function refreshJobs() {
  let jobs = [];
  try {
    const r = await fetch('/api/jobs');
    jobs = (await r.json()).jobs || [];
  } catch (e) { return; }
  jobsUl.replaceChildren(...jobs.map(job => {
    const li = el('li', {});
    li.append(el('span', {}, '#' + job.id + ' ' + job.filename));
    const [label, cls] = BADGES[job.status] || [job.status, ''];
    const badge = el('span', { class: 'badge ' + cls, role: 'status' }, label);
    li.append(badge);
    if (job.status === 'DONE') {
      li.append(el('a', { class: 'dl', href: '/api/files/' + job.id + '/pdf' },
                    'Télécharger le -AA'));
    } else if (job.error) {
      li.append(el('span', { class: 'err' }, job.error));
    }
    return li;
  }));
}

async function upload(files) {
  const pdfs = [...files].filter(f => f.type === 'application/pdf' ||
                                      f.name.toLowerCase().endsWith('.pdf'));
  if (!pdfs.length) return;
  const fd = new FormData();
  pdfs.forEach(f => fd.append('files', f, f.name));
  try {
    await fetch('/api/jobs', { method: 'POST', body: fd });
  } catch (e) { /* le polling affichera l'état */ }
  refreshJobs();
}

// clic + clavier + drag
dropzone.addEventListener('click', () => fileinput.click());
dropzone.addEventListener('keydown', ev => {
  if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fileinput.click(); }
});
fileinput.addEventListener('change', () => { upload(fileinput.files); fileinput.value = ''; });
['dragenter', 'dragover'].forEach(t =>
  dropzone.addEventListener(t, ev => { ev.preventDefault(); dropzone.classList.add('drag'); }));
['dragleave', 'drop'].forEach(t =>
  dropzone.addEventListener(t, ev => { ev.preventDefault(); dropzone.classList.remove('drag'); }));
dropzone.addEventListener('drop', ev => upload(ev.dataTransfer.files));

refreshHealth();
refreshJobs();
setInterval(refreshHealth, 30000);
setInterval(refreshJobs, 3000);   // polling 3 s

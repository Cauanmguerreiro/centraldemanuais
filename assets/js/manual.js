/* Same guide layout and interactions for every manual in the central. */
const manual = JSON.parse(document.getElementById('manual-data').textContent);
const steps = manual.steps;
const $ = selector => document.querySelector(selector);
const state = { filter: 'all', query: '', guided: false, current: 0, done: new Set(), dark: false };

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function normalize(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function readState() {
  try {
    const legacy = manual.key === 'clube-v3' ? localStorage.getItem('aga-guide-v1') : null;
    const saved = JSON.parse(localStorage.getItem(`aga-manual-${manual.key}`) || legacy || '{}');
    if (manual.key === 'clube-v3' && legacy && !localStorage.getItem(`aga-manual-${manual.key}`)) {
      saved.done = (saved.done || []).map(number => `etapa-${number}`);
    }
    state.done = new Set((saved.done || []).filter(id => steps.some(step => step.anchor === id)));
    const sharedTheme = localStorage.getItem('aga-manual-theme');
    state.dark = sharedTheme ? sharedTheme === 'dark' : Boolean(saved.dark);
  } catch { state.done = new Set(); }
}

function saveState() {
  try {
    localStorage.setItem(`aga-manual-${manual.key}`, JSON.stringify({ done: [...state.done] }));
    localStorage.setItem('aga-manual-theme', state.dark ? 'dark' : 'light');
  } catch { /* Reading still works when storage is disabled. */ }
}

function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove('show'), 2300);
}

function renderIntro() {
  $('#hero-eyebrow').textContent = manual.eyebrow;
  $('#hero-title').innerHTML = `${escapeHTML(manual.title)} <span style="color:var(--yellow)">${escapeHTML(manual.highlight)}</span>`;
  $('#hero-description').textContent = manual.description;
  $('#hero-stats').innerHTML = [
    [steps.length, 'etapas explicadas'],
    [new Set(steps.flatMap(step => step.shots.map(shot => shot.src))).size, 'capturas de tela'],
    [manual.sections.length, 'momentos do processo']
  ].map(([number, label]) => `<div><strong>${number}</strong>${label}</div>`).join('');
  $('#overview-cards').innerHTML = manual.sections.map(section => `
    <button class="overview-card" type="button" data-card="${escapeHTML(section.key)}">
      <span class="count">${escapeHTML(section.kicker)}</span>
      <h3>${escapeHTML(section.title)} ↗</h3><p>${escapeHTML(section.description)}</p>
      <div class="mini-flow">${section.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div>
    </button>`).join('');
  $('#filters').innerHTML = `<button class="selected" type="button" data-filter="all">Todas</button>` +
    manual.sections.map(section => `<button type="button" data-filter="${escapeHTML(section.key)}">${escapeHTML(section.short)}</button>`).join('');
  $('#footer-text').textContent = manual.footer;
  $('#bottom-note').textContent = manual.warning;
  const resource = $('#resource');
  if (!manual.resource) { resource.hidden = true; return; }
  resource.innerHTML = `<h3>Material de apoio</h3><p>${escapeHTML(manual.resource.description)}</p>
    <div class="resource-links">${manual.resource.pdf ? `<a href="${escapeHTML(manual.resource.pdf)}" download>↓ Baixar manual em PDF</a>` : ''}
    ${manual.resource.link ? `<a href="${escapeHTML(manual.resource.link)}" target="_blank" rel="noopener">Abrir apresentação ↗</a>` : ''}</div>
    ${manual.resource.embed ? `<details><summary>Ver apresentação nesta página</summary><iframe title="${escapeHTML(manual.resource.title)}" data-src="${escapeHTML(manual.resource.embed)}" loading="lazy" allowfullscreen></iframe></details>` : ''}`;
  resource.querySelector('details')?.addEventListener('toggle', event => {
    if (event.target.open) {
      const frame = event.target.querySelector('iframe');
      if (!frame.src) frame.src = frame.dataset.src;
    }
  });
}

function renderSteps() {
  const list = $('#step-list');
  const index = $('#step-index');
  list.innerHTML = '';
  index.innerHTML = '<div class="label">Etapas</div>';
  steps.forEach((step, position) => {
    const card = document.createElement('article');
    card.className = 'step-card';
    card.id = step.anchor;
    card.dataset.group = step.group;
    card.dataset.search = normalize([step.title, step.intro, step.html || '',
      step.warning || '', step.tip || '', ...(step.fields || []).flat(),
      ...(step.actions || [])].join(' '));
    const details = step.fields ? `<h4>Campos e escolhas</h4><div class="fields">${step.fields.map(([name, description]) =>
      `<div class="field"><b>${escapeHTML(name)}</b><span>${escapeHTML(description)}</span></div>`).join('')}</div>` : '';
    const actions = step.actions ? `<h4>O que fazer</h4><ol class="actions">${step.actions.map(action =>
      `<li>${escapeHTML(action)}</li>`).join('')}</ol>` : '';
    const media = step.shots.length ? `<div class="shots">${step.shots.map(shot => `
      <button class="shot" type="button" data-shot="${escapeHTML(shot.src)}" data-caption="${escapeHTML(shot.cap)}" aria-label="Ampliar ${escapeHTML(shot.cap)}">
        <img src="${escapeHTML(shot.src)}" alt="${escapeHTML(shot.cap)}" loading="lazy"><span>⌕ Ampliar · ${escapeHTML(shot.cap)}</span>
      </button>`).join('')}</div>` : '<div class="no-shot">Esta etapa não tem captura no acervo. Siga as instruções acima.</div>';
    card.innerHTML = `<div class="step-head"><div class="step-num">${String(position + 1).padStart(2, '0')}</div><div>
      <div class="step-meta">${escapeHTML(manual.name)} / ${escapeHTML(step.phase)}</div>
      <h3>${escapeHTML(step.title)}</h3><p>${escapeHTML(step.intro)}</p></div></div>
      <div class="step-body">${details}${actions}${step.html ? `<div class="legacy-instr">${step.html}</div>` : ''}
      ${step.tip ? `<div class="note"><b>Dica · </b>${escapeHTML(step.tip)}</div>` : ''}
      ${step.warning ? `<div class="note warn"><b>Atenção · </b>${escapeHTML(step.warning)}</div>` : ''}
      <h4>Veja na tela</h4>${media}</div>
      <div class="step-footer"><button class="complete" type="button" data-complete="${escapeHTML(step.anchor)}"></button>
      <button class="linkbtn" type="button" data-link="${escapeHTML(step.anchor)}">Copiar link da etapa ↗</button></div>`;
    list.append(card);
    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'step-link';
    link.dataset.step = step.anchor;
    link.innerHTML = `<span class="n">${position + 1}</span><span>${escapeHTML(step.title)}</span>`;
    index.append(link);
  });
  renderChecklist();
  update();
}

function renderChecklist() {
  const slot = $('#checklist');
  if (!manual.checklist?.length) { slot.hidden = true; return; }
  slot.innerHTML = `<span id="camp-check"></span><h3>Antes de publicar</h3><p>Confira os pontos abaixo. O que você marcar fica salvo neste navegador.</p>
    <ol class="review-list">${manual.checklist.map((item, index) => `<li><label>
      <input type="checkbox" data-check="c${index + 1}"><span>${item.html}</span></label>
      <button type="button" data-target="${escapeHTML(item.anchor)}" data-target-page="${escapeHTML(item.page || manual.key)}">Ver etapa</button></li>`).join('')}</ol>
    <div class="review-status"><strong id="check-count"></strong><button type="button" id="check-reset">Limpar checklist</button></div>`;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(`aga-check-${manual.key}`) || (manual.key === 'campanhas' ? localStorage.getItem('agaclube-check') : null) || '{}'); } catch {}
  const boxes = [...slot.querySelectorAll('[data-check]')];
  boxes.forEach(box => box.checked = Boolean(saved[box.dataset.check]));
  const count = () => $('#check-count').textContent = `${boxes.filter(box => box.checked).length} de ${boxes.length} conferidos`;
  slot.addEventListener('change', event => {
    if (!event.target.matches('[data-check]')) return;
    saved[event.target.dataset.check] = event.target.checked;
    try { localStorage.setItem(`aga-check-${manual.key}`, JSON.stringify(saved)); } catch {}
    count();
  });
  $('#check-reset').addEventListener('click', () => {
    boxes.forEach(box => box.checked = false);
    saved = {};
    try { localStorage.removeItem(`aga-check-${manual.key}`); } catch {}
    count();
  });
  count();
}

function visible(step) {
  return (state.filter === 'all' || state.filter === step.group) &&
    (!state.query || $(`#${step.anchor}`).dataset.search.includes(state.query));
}

function update() {
  let found = 0;
  steps.forEach((step, position) => {
    const card = document.getElementById(step.anchor);
    const link = [...document.querySelectorAll('[data-step]')].find(item => item.dataset.step === step.anchor);
    const show = visible(step);
    card.classList.toggle('hidden', !show);
    card.classList.toggle('reader-active', state.guided && position === state.current);
    link.hidden = !show;
    link.classList.toggle('current', state.guided && position === state.current);
    link.classList.toggle('done', state.done.has(step.anchor));
    const button = card.querySelector('.complete');
    button.classList.toggle('done', state.done.has(step.anchor));
    button.textContent = state.done.has(step.anchor) ? '✓ Etapa concluída' : '○ Marcar como concluída';
    if (show) found++;
  });
  $('#empty').hidden = found > 0;
  $('#progress-count').textContent = `${state.done.size} de ${steps.length} concluídas`;
  $('#progress-bar').style.width = `${state.done.size / steps.length * 100}%`;
  $('#reader-status').textContent = `Etapa ${state.current + 1} de ${steps.length}`;
  $('#previous').disabled = state.current === 0;
  $('#next').disabled = state.current === steps.length - 1;
  document.body.classList.toggle('reader', state.guided);
  document.body.classList.toggle('theme-dark', state.dark);
  document.querySelectorAll('[data-filter]').forEach(button => button.classList.toggle('selected', button.dataset.filter === state.filter));
}

function setFilter(group) {
  state.filter = group;
  state.query = '';
  state.guided = false;
  $('#search').value = '';
  update();
  $('#guia').scrollIntoView({ behavior: 'smooth' });
}

function goto(anchor, guided = false) {
  const position = steps.findIndex(step => step.anchor === anchor);
  if (position < 0) return;
  state.filter = 'all';
  state.query = '';
  state.guided = guided;
  state.current = position;
  $('#search').value = '';
  update();
  document.getElementById(anchor).scrollIntoView({ behavior: 'smooth', block: 'start' });
  history.replaceState(null, '', `#${anchor}`);
}

readState();
renderIntro();
renderSteps();

$('#search').addEventListener('input', event => {
  state.query = normalize(event.target.value.trim());
  state.guided = false;
  update();
});
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.filter) setFilter(button.dataset.filter);
  if (button.dataset.card) setFilter(button.dataset.card);
  if (button.dataset.step) goto(button.dataset.step, state.guided);
  if (button.dataset.complete) {
    const id = button.dataset.complete;
    state.done.has(id) ? state.done.delete(id) : state.done.add(id);
    saveState(); update();
    toast(state.done.has(id) ? 'Etapa concluída' : 'Etapa reaberta');
  }
  if (button.dataset.link) {
    const url = `${location.href.split('#')[0]}#${button.dataset.link}`;
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(() => toast('Link copiado')).catch(() => toast('Copie o endereço da página'));
    else toast('Copie o endereço da página');
  }
  if (button.dataset.shot) {
    $('#modal-image').src = button.dataset.shot;
    $('#modal-image').alt = button.dataset.caption;
    $('#modal-caption').textContent = `${button.dataset.caption} · Esc para fechar`;
    $('#lightbox').showModal();
  }
  if (button.dataset.target) {
    if (button.dataset.targetPage !== manual.key) {
      location.href = `${button.dataset.targetPage}.html#${button.dataset.target}`;
    } else goto(button.dataset.target);
  }
});
$('#start').addEventListener('click', () => goto(steps[0].anchor));
$('#guided').addEventListener('click', () => goto(steps[0].anchor, true));
$('#exit-reader').addEventListener('click', () => { state.guided = false; update(); });
$('#previous').addEventListener('click', () => goto(steps[Math.max(0, state.current - 1)].anchor, true));
$('#next').addEventListener('click', () => goto(steps[Math.min(steps.length - 1, state.current + 1)].anchor, true));
$('#theme').addEventListener('click', () => { state.dark = !state.dark; saveState(); update(); });
$('#print').addEventListener('click', () => window.print());
$('#close-modal').addEventListener('click', () => $('#lightbox').close());
$('#lightbox').addEventListener('click', event => { if (event.target === $('#lightbox')) $('#lightbox').close(); });
$('#reset').addEventListener('click', () => {
  if (!confirm('Zerar as etapas concluídas neste navegador?')) return;
  state.done.clear(); saveState(); update(); toast('Progresso zerado');
});
document.addEventListener('keydown', event => {
  if (event.target.matches('input') || $('#lightbox').open) return;
  if (state.guided && event.key === 'ArrowRight') goto(steps[Math.min(steps.length - 1, state.current + 1)].anchor, true);
  if (state.guided && event.key === 'ArrowLeft') goto(steps[Math.max(0, state.current - 1)].anchor, true);
  if (event.key === '/' && !event.ctrlKey) { event.preventDefault(); $('#search').focus(); }
});
if (location.hash) {
  const anchor = decodeURIComponent(location.hash.slice(1));
  if (steps.some(step => step.anchor === anchor)) goto(anchor);
  else if (anchor === 'camp-check') requestAnimationFrame(() => $('#checklist').scrollIntoView());
}

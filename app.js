window.HUB_CONFIG = { key: 'vector-revision-hub', brand: 'Vector', mark: 'V' };

/* Vector Revision Hub engine v4: a day / week / month revision planner with your own topics. */
(() => {
  'use strict';

  const CFG = Object.assign({ key: 'gcse-hub', brand: 'Vector', mark: 'V' }, window.HUB_CONFIG || {});
  const BASE_TITLE = document.title || CFG.brand;

  /* ---------- utilities ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = n => String(n).padStart(2, '0');
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
  const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const pkey = k => { const [y, m, d] = String(k).split('-').map(Number); return new Date(y, m - 1, d); };
  const today = () => dkey(new Date());
  const addDays = (k, n) => { const d = pkey(k); d.setDate(d.getDate() + n); return dkey(d); };
  const dow = k => (pkey(k).getDay() + 6) % 7;
  const weekStart = k => addDays(k, -dow(k));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const hh = h => { const H = Math.floor(h), m = Math.round((h - H) * 60); return pad(H % 24) + ':' + pad(m); };
  const fmtLen = l => { const H = Math.floor(l), m = Math.round((l - H) * 60); return ((H ? H + 'h' : '') + (m ? (H ? ' ' : '') + m + 'm' : '')) || '0m'; };
  const nowH = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
  const ceilHalf = x => Math.ceil(x * 2 - 1e-9) / 2;
  const halves = (a, b) => { const o = []; for (let h = a; h < b - 1e-9; h += 0.5) o.push(h); return o; };
  const fmt = (k, o) => pkey(k).toLocaleDateString('en-GB', o);
  const fmtMin = m => { m = Math.round(m); if (m < 60) return m + ' min'; const h = Math.floor(m / 60), r = m % 60; return h + 'h' + (r ? ' ' + r + 'm' : ''); };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const plural = (n, w, p) => n + ' ' + (n === 1 ? w : (p || w + 's'));
  const untilMs = k => { const d = pkey(k); d.setHours(9, 0, 0, 0); return d.getTime() - Date.now(); };
  const monthKey = k => k.slice(0, 7);

  const ICONS = {
    grid: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M9 4v17M15 4v17"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
    cog: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    play: '<path d="M7 4v16l13-8z" fill="currentColor"/>',
    pause: '<path d="M7 4h3v16H7zM14 4h3v16h-3z" fill="currentColor"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    skip: '<path d="M5 4l10 8-10 8z"/><path d="M19 5v14"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
    flame: '<path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z"/>',
    calplus: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M12 12v6M9 15h6"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    repeat: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    ext: '<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v6H4V4h6"/>',
    more: '<circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    flag: '<path d="M4 21V4h12l-2 4 2 4H4"/>',
  };
  const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* ---------- subjects library ---------- */
  const SME = 'https://www.savemyexams.com/gcse/';
  const smeSep = s => ({ notes: `${SME}${s}/edexcel/18/revision-notes/`, questions: `${SME}${s}/edexcel/18/topic-questions/`, papers: `${SME}${s}/edexcel/past-papers/` });
  const smeComb = s => ({ notes: `${SME}science/edexcel/combined-science/16/${s}/revision-notes/` });
  const HUES = [205, 150, 25, 275, 335, 95, 245, 55, 180, 310, 120, 0];
  const SCIENCES = [
    { id: 'bio', name: 'Biology', sub: 'Edexcel · Save My Exams links', make: () => [sObj('Biology', 'Edexcel', smeSep('biology'))] },
    { id: 'chem', name: 'Chemistry', sub: 'Edexcel · Save My Exams links', make: () => [sObj('Chemistry', 'Edexcel', smeSep('chemistry'))] },
    { id: 'phys', name: 'Physics', sub: 'Edexcel · Save My Exams links', make: () => [sObj('Physics', 'Edexcel', smeSep('physics'))] },
    { id: 'comb', name: 'Combined Science', sub: 'Edexcel · adds Bio, Chem, Phys', make: () => [sObj('Biology', 'Edexcel', smeComb('biology')), sObj('Chemistry', 'Edexcel', smeComb('chemistry')), sObj('Physics', 'Edexcel', smeComb('physics'))] },
  ];
  const OTHERS = ['Maths', 'English Language', 'English Literature', 'History', 'Geography', 'French', 'Spanish', 'Italian', 'Computer Science', 'Business', 'Economics', 'Religious Studies', 'Drama', 'Art and Design', 'Music', 'PE', 'Latin', 'Statistics', 'Further Maths'];
  function sObj(name, board, sme) { return { id: uid(), name, board: board || '', hue: 0, sme: sme || { notes: SME, generic: true } }; }

  /* ---------- constants ---------- */
  const KINDS = {
    revise: { label: 'Revise', study: true },
    paper: { label: 'Past paper', study: true },
    flash: { label: 'Flashcards', study: true },
    school: { label: 'School', study: false },
    brk: { label: 'Break', study: false },
    other: { label: 'Other', study: false },
  };
  const LANES = [['ideas', 'Ideas'], ['confused', 'Still confused'], ['facts', 'Key facts'], ['got', 'Got it']];
  const PAGES = [['plan', 'Plan', 'grid'], ['focus', 'Focus', 'timer'], ['brainstorm', 'Brainstorm', 'bulb'], ['settings', 'Settings', 'cog']];
  const ZOOMS = [['day', 'Day'], ['week', 'Week'], ['month', 'Month']];
  const MODE = { focus: 'Focus', short: 'Short break', long: 'Long break' };
  const PRESET_MIN = [25, 30, 45, 60];
  const LENS = [0.5, 1, 1.5, 2, 2.5, 3, 4];
  const RING = 879.65;

  /* ---------- state ---------- */
  const DEF = {
    v: 4, setupDone: false, exams: [], subjects: [], blocks: [], sessions: [], boards: [], note: '',
    settings: { dayStart: 7, dayEnd: 23, target: 15, wdFrom: 16, wdTo: 20, weFrom: 10, weTo: 17, breakEvery: 1.5, defLen: 1 },
    timer: { focus: 30, short: 5, long: 15, every: 4, mode: 'focus', left: 1800, running: false, endAt: 0, done: 0, log: true, sound: true, blockId: '', blockDate: '', subjectId: '' },
    ui: { zoom: 'day', addSubj: '', board: '' },
  };
  function normalise(s) {
    s = s && typeof s === 'object' ? s : {};
    const o = {};
    Object.keys(DEF).forEach(k => { o[k] = s[k] !== undefined ? s[k] : JSON.parse(JSON.stringify(DEF[k])); });
    o.settings = Object.assign({}, DEF.settings, s.settings || {});
    o.timer = Object.assign({}, DEF.timer, s.timer || {});
    o.ui = Object.assign({}, DEF.ui, s.ui || {});
    if (!ZOOMS.some(z => z[0] === o.ui.zoom)) o.ui.zoom = 'day';
    ['exams', 'subjects', 'blocks', 'sessions', 'boards'].forEach(k => { if (!Array.isArray(o[k])) o[k] = []; });
    o.subjects.forEach(x => { x.board = x.board || ''; x.sme = x.sme || { notes: SME, generic: true }; });
    o.blocks.forEach((b, i) => {
      b.doneOn = b.doneOn || []; b.skip = b.skip || []; b.text = b.text || ''; b.note = b.note || '';
      if (b.start === undefined || b.start === '') b.start = null;
      b.len = Number(b.len) || 1; b.order = b.order || i; b.kind = KINDS[b.kind] ? b.kind : 'revise';
    });
    o.boards.forEach(b => { b.cards = b.cards || []; });
    if (typeof o.note !== 'string') o.note = '';
    return o;
  }
  function migrate(st, raw) {
    const v = raw.v || 0;
    if (v < 3) {
      st.subjects = st.subjects.filter(s => !s.ex || (s.topics || []).some(t => !t.ex));
      st.blocks = st.blocks.filter(b => !b.ex); st.sessions = st.sessions.filter(s => !s.ex);
      st.boards = st.boards.filter(b => !b.ex); st.exams = st.exams.filter(e => !e.ex);
      if (/^Formula: x = \(-b/.test(st.note)) st.note = '';
    }
    if (v < 4) {
      st.blocks.forEach(b => {
        if (!b.text) {
          const s = st.subjects.find(x => x.id === b.subjectId), t = s && (s.topics || []).find(x => x.id === b.topicId), u = t && (t.subs || []).find(x => x.id === b.subId);
          if (u) b.text = u.name; else if (t) b.text = t.name.replace(/^\d+\.\s/, '');
          else if (!KINDS[b.kind].study && b.note) { b.text = b.note; b.note = ''; }
        }
        delete b.topicId; delete b.subId; delete b.auto;
      });
      st.subjects.forEach(s => { delete s.topics; s.ex = false; });
      st.ui.zoom = 'day';
      if (st.subjects.length || st.blocks.length) st.setupDone = true;
    }
    const T = st.timer;
    if (T.blockId && !st.blocks.some(b => b.id === T.blockId)) T.blockId = '';
    if (T.subjectId && !st.subjects.some(s => s.id === T.subjectId)) T.subjectId = '';
    st.v = 4;
  }
  function load() {
    let raw = null;
    try { const r = localStorage.getItem(CFG.key); if (r) raw = JSON.parse(r); } catch (e) { /* storage unavailable */ }
    const st = normalise(raw || {});
    if (raw) migrate(st, raw);
    return st;
  }
  let state = load();
  function save() { try { localStorage.setItem(CFG.key, JSON.stringify(state)); } catch (e) { /* storage unavailable */ } }

  /* ---------- runtime ---------- */
  let page = 'plan', cursor = today(), draft = null, undoSnap = null, dragInfo = null, titleFlash = 0, lastMinute = new Date().getMinutes();
  let bulkOpen = false, newSubjOpen = false, pick = new Set(), justResized = false;

  /* ---------- data helpers ---------- */
  const subj = id => state.subjects.find(s => s.id === id);
  const blockById = id => state.blocks.find(b => b.id === id);
  const isStudy = b => !!(KINDS[b.kind] || KINDS.other).study;
  const isDone = (b, k) => b.repeat ? b.doneOn.includes(k) : !!b.done;
  function setDone(b, k, v) { if (b.repeat) { b.doneOn = b.doneOn.filter(x => x !== k); if (v) b.doneOn.push(k); } else b.done = v; }
  function itemsOn(k) {
    const d = dow(k);
    return state.blocks.filter(b => b.repeat ? (b.dow === d && k >= b.date && !b.skip.includes(k)) : b.date === k);
  }
  const timedOn = k => itemsOn(k).filter(b => b.start != null).sort((a, b) => a.start - b.start);
  const listOn = k => itemsOn(k).filter(b => b.start == null).sort((a, b) => a.order - b.order);
  const planItems = k => itemsOn(k).filter(b => isStudy(b) || !b.repeat).sort((a, b) => (a.start == null) - (b.start == null) || (a.start - b.start) || a.order - b.order);
  const clashes = (k, start, len, ignore) => start == null ? [] : timedOn(k).filter(b => b.id !== ignore && b.start < start + len - 1e-9 && start < b.start + b.len - 1e-9);
  const freeAt = (k, h, len, ignore) => h >= state.settings.dayStart && h + len <= state.settings.dayEnd + 1e-9 && !clashes(k, h, len, ignore).length;
  function itemTitle(b) { const K = KINDS[b.kind] || KINDS.other, s = subj(b.subjectId); return b.text || (K.study ? (s ? s.name : K.label) : K.label); }
  function itemMeta(b, withTime = true) {
    const K = KINDS[b.kind] || KINDS.other, s = subj(b.subjectId);
    return [b.text && s ? s.name : '', withTime ? (b.start != null ? `${hh(b.start)}–${hh(b.start + b.len)}` : fmtLen(b.len)) : '', b.kind !== 'revise' && (K.study || b.text) ? K.label : '', b.note].filter(Boolean).join(' · ');
  }
  const hueStyle = b => { const s = subj(b.subjectId); return s ? `--h:${s.hue}` : ''; };
  const examsOn = k => state.exams.filter(e => e.date === k);
  const upcomingExams = () => state.exams.filter(e => e.date && untilMs(e.date) > -864e5).sort((a, b) => a.date < b.date ? -1 : 1);
  const win = k => { const S = state.settings; return dow(k) >= 5 ? { from: S.weFrom, to: S.weTo } : { from: S.wdFrom, to: S.wdTo }; };
  function periodStats(days) {
    let n = 0, d = 0, hrs = 0;
    days.forEach(k => itemsOn(k).forEach(b => { if (!isStudy(b)) return; n++; if (isDone(b, k)) d++; if (b.start != null) hrs += b.len; }));
    const set = new Set(days), focus = state.sessions.filter(s => set.has(s.date)).reduce((a, s) => a + s.minutes, 0);
    return { n, d, hrs, focus };
  }
  function streak() {
    const active = new Set(state.sessions.map(s => s.date));
    state.blocks.forEach(b => { if (!isStudy(b)) return; if (b.repeat) b.doneOn.forEach(k => active.add(k)); else if (b.done) active.add(b.date); });
    let k = today(), n = 0;
    if (!active.has(k)) k = addDays(k, -1);
    while (active.has(k)) { n++; k = addDays(k, -1); }
    return n;
  }
  function nextHue() { const used = state.subjects.map(s => s.hue); return HUES.find(h => !used.includes(h)) ?? HUES[state.subjects.length % HUES.length]; }
  function getSubject(name) {
    name = (name || '').trim(); if (!name) return null;
    let s = state.subjects.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (s) return s;
    const lower = name.toLowerCase();
    const sme = ['biology', 'chemistry', 'physics'].includes(lower) ? smeSep(lower) : null;
    s = sObj(name, sme ? 'Edexcel' : '', sme); s.hue = nextHue(); state.subjects.push(s);
    return s;
  }
  function matchSubject(prefix) {
    const p = prefix.trim().toLowerCase(); if (p.length < 2) return null;
    return state.subjects.find(s => s.name.toLowerCase() === p) || state.subjects.find(s => s.name.toLowerCase().startsWith(p)) || null;
  }
  function addItems(k, raw, len) {
    const parts = String(raw).split(/[;\n]+/).map(x => x.trim()).filter(Boolean);
    let n = 0, ord = Date.now();
    parts.forEach(p => {
      let sid = state.ui.addSubj && subj(state.ui.addSubj) ? state.ui.addSubj : '', text = p;
      const m = p.match(/^([^:]{2,30}):\s*(.+)$/);
      if (m) { const s = matchSubject(m[1]); if (s) { sid = s.id; text = m[2].trim(); } }
      state.blocks.push({ id: uid(), date: k, start: null, len: len || state.settings.defLen, kind: 'revise', subjectId: sid, text, note: '', done: false, doneOn: [], skip: [], repeat: false, order: ord + n });
      n++;
    });
    return n;
  }
  function autoTime(k, items) {
    const S = state.settings, w = win(k), t = today();
    if (k < t) return { placed: 0, late: 0, left: items.length };
    const nowStart = k === t ? ceilHalf(nowH()) : S.dayStart;
    let cur = Math.max(w.from, nowStart), run = 0, placed = 0, late = 0;
    const rest = [];
    items.forEach(it => {
      const len = it.len || 1; let h = cur, found = null;
      while (h + len <= w.to + 1e-9) {
        if (S.breakEvery && run >= S.breakEvery - 1e-9) { h += 0.5; run = 0; continue; }
        if (freeAt(k, h, len, it.id)) { found = h; break; }
        h += 0.5; run = 0;
      }
      if (found != null) { it.start = found; it.date = k; placed++; run = (found === cur ? run : 0) + len; cur = found + len; }
      else rest.push(it);
    });
    let left = 0;
    rest.forEach(it => {
      const len = it.len || 1; let found = null;
      for (let h = Math.max(nowStart, S.dayStart); h + len <= S.dayEnd + 1e-9; h += 0.5) if (freeAt(k, h, len, it.id)) { found = h; break; }
      if (found != null) { it.start = found; it.date = k; placed++; late++; } else left++;
    });
    return { placed, late, left };
  }
  function snap() { undoSnap = JSON.stringify(state.blocks); }
  function undo() { if (!undoSnap) return; state.blocks = JSON.parse(undoSnap); undoSnap = null; commit(); toast('Undone.'); }
  function smeLinks(s, cls = '') {
    const m = s && s.sme; if (!m) return '';
    if (m.generic) return `<a class="sme ${cls}" href="${esc(m.notes)}" target="_blank" rel="noopener noreferrer">${ic('ext')}Save My Exams</a>`;
    return [['notes', 'Notes'], ['questions', 'Questions'], ['papers', 'Past papers']].filter(([k]) => m[k]).map(([k, l]) => `<a class="sme ${cls}" href="${esc(m[k])}" target="_blank" rel="noopener noreferrer">${ic('ext')}${l}</a>`).join('');
  }

  /* ---------- rendering helpers ---------- */
  function setHTML(el, html) {
    const keep = $$('[data-keep][id]', el).map(i => [i.id, i.value]);
    const scroll = $$('[data-scroll][id]', el).map(i => [i.id, i.scrollLeft, i.scrollTop]);
    const act = document.activeElement && el.contains(document.activeElement) ? document.activeElement.id : '';
    el.innerHTML = html;
    keep.forEach(([id, v]) => { const n = document.getElementById(id); if (n && v) n.value = v; });
    scroll.forEach(([id, l, t]) => { const n = document.getElementById(id); if (n) { n.scrollLeft = l; n.scrollTop = t; } });
    if (act) { const f = document.getElementById(act); if (f) f.focus({ preventScroll: true }); }
  }
  const pageHead = (eyebrow, title, lede, actions = '') => `<header class="page-h"><div class="page-h-txt"><p class="eyebrow">${eyebrow}</p><h1 id="pg-title">${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</div>${actions ? `<div class="page-h-act">${actions}</div>` : ''}</header>`;
  const seg = (act, cur, opts, label) => `<div class="seg" role="group" aria-label="${label}">${opts.map(([v, l]) => `<button type="button" data-act="${act}" data-v="${v}" aria-pressed="${cur === v}">${l}</button>`).join('')}</div>`;
  let toastT = 0;
  function toast(msg, label, fn) {
    const t = $('#toast');
    t.innerHTML = `<span>${esc(msg)}</span>${label ? `<button type="button" class="toast-act">${esc(label)}</button>` : ''}`;
    t.hidden = false;
    if (label) t.querySelector('button').onclick = () => { t.hidden = true; fn(); };
    clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, label ? 6500 : 3500);
  }
  const commit = () => { save(); render(); };
  function go(p) { if (page === p) render(); else location.hash = p; }

  /* ---------- shell ---------- */
  function shellHTML() {
    return `<div class="shell" data-nav="top"><nav class="nav" id="nav" aria-label="Pages"></nav><main class="main" id="main"></main></div>
    <div class="modal" id="modal" hidden><div class="modal-bg" data-close></div><div class="modal-card" id="modal-card" role="dialog" aria-modal="true" aria-label="Dialog" tabindex="-1"></div></div>
    <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>`;
  }
  function renderNav() {
    const ex = upcomingExams()[0];
    $('#nav').innerHTML = `<a class="brand" href="#plan"><span class="brand-mark">${esc(CFG.mark)}</span><span class="brand-name">${esc(CFG.brand)}</span></a>
      <div class="nav-items">${PAGES.map(([id, label, icon], i) => `<a class="nav-item" href="#${id}"${page === id ? ' aria-current="page"' : ''} title="${label} (key ${i + 1})"><span class="nav-ic">${ic(icon)}</span><span class="lbl">${label}</span><kbd>${i + 1}</kbd></a>`).join('')}</div>
      <a class="timer-chip" id="timer-chip" href="#focus" hidden>${ic('timer')}<b>30:00</b></a>
      <div class="nav-hud" aria-hidden="true"><span id="hud-clock">--:--:--</span>${ex ? `<span class="hud-t" title="${esc(ex.name)}">T-${Math.max(0, Math.ceil(untilMs(ex.date) / 864e5))}D</span>` : ''}</div>`;
  }
  const PAGE_FN = () => ({ plan: pgPlan, focus: pgFocus, brainstorm: pgBrainstorm, settings: pgSettings });
  function render() {
    renderNav();
    setHTML($('#main'), `<section class="page page-${page}" aria-labelledby="pg-title">${PAGE_FN()[page]()}</section>`);
    if (page === 'focus') { const ta = $('#flashnote'); if (ta) ta.value = state.note; }
    tickClock(); renderTimerLive();
  }
  function route() {
    const h = (location.hash || '').slice(1);
    if (['day', 'week', 'month'].includes(h)) { state.ui.zoom = h; page = 'plan'; }
    else page = PAGES.some(p => p[0] === h) ? h : 'plan';
    render(); window.scrollTo(0, 0);
  }

  /* ---------- shared plan pieces ---------- */
  function subjBar() {
    const cur = state.ui.addSubj && subj(state.ui.addSubj) ? state.ui.addSubj : '';
    return `<div class="subj-bar"><span class="subj-bar-l">Adding as</span><div class="chips" role="group" aria-label="Subject for new topics">
      <button type="button" class="chip" data-act="add-subj" data-v="" aria-pressed="${!cur}">No subject</button>
      ${state.subjects.map(s => `<button type="button" class="chip schip" data-act="add-subj" data-v="${s.id}" aria-pressed="${cur === s.id}" style="--h:${s.hue}"><i class="sdot"></i>${esc(s.name)}</button>`).join('')}
      ${newSubjOpen ? `<span class="new-subj"><input type="text" id="new-subj-inline" placeholder="Subject name" maxlength="30" aria-label="New subject name"><button type="button" class="btn sm" data-act="subj-create">Add</button></span>` : `<button type="button" class="chip ghost-chip" data-act="subj-new">${ic('plus')}Subject</button>`}
    </div></div>`;
  }
  function itemRow(b, k, mode) {
    const s = subj(b.subjectId), done = isDone(b, k), K = KINDS[b.kind] || KINDS.other;
    return `<li class="it${done ? ' is-done' : ''}${b.start != null ? ' timed' : ''} kind-${b.kind}"${s ? ` style="--h:${s.hue}"` : ''} draggable="${!b.repeat}" data-drag data-id="${b.id}" data-k="${k}">
      ${K.study ? `<button type="button" class="tick" data-act="blk-done" data-id="${b.id}" data-k="${k}" aria-pressed="${done}" aria-label="Mark ${esc(itemTitle(b))} done">${ic('check')}</button>` : '<span class="tick-sp"></span>'}
      <button type="button" class="it-main" data-act="blk" data-id="${b.id}" data-k="${k}"><b>${esc(itemTitle(b))}</b><span>${b.start != null && mode !== 'day' ? `<em class="t-badge">${hh(b.start)}</em>` : ''}${esc(itemMeta(b, mode === 'day' || b.start == null))}</span></button>
      ${mode === 'day' && b.start == null && !done ? `<button type="button" class="icon-btn" data-act="it-slot" data-id="${b.id}" data-k="${k}" title="Put in the next free slot" aria-label="Give ${esc(itemTitle(b))} a time">${ic('clock')}</button>` : ''}
    </li>`;
  }
  function kpis(days, label) {
    const st = periodStats(days), ex = upcomingExams()[0], pct = st.n ? Math.round(st.d / st.n * 100) : 0;
    const exD = ex ? Math.max(0, Math.floor(untilMs(ex.date) / 864e5)) : 0;
    return `<div class="kpis">
      <div class="kpi"><span class="kpi-l">Topics done ${label}</span><b>${st.d}<small>/${st.n}</small></b><div class="bar"><i style="width:${pct}%"></i></div></div>
      <div class="kpi"><span class="kpi-l">Time planned</span><b>${fmtLen(st.hrs)}</b><small class="kpi-s">${days.length > 1 ? `target ${state.settings.target}h a week` : 'on the timeline'}</small></div>
      <div class="kpi"><span class="kpi-l">On the timer</span><b>${fmtMin(st.focus)}</b><small class="kpi-s">${ic('flame')}${plural(streak(), 'day')} streak</small></div>
      <div class="kpi kpi-ex">${ex ? `<span class="kpi-l">${esc(ex.name)}</span><b>${untilMs(ex.date) <= 0 ? 'Today' : exD}<small>${untilMs(ex.date) > 0 ? (exD === 1 ? ' day' : ' days') : ''}</small></b><small class="kpi-s" data-cd="${ex.date}">--:--:--</small>` : `<span class="kpi-l">Next exam</span><a class="link-s" href="#settings">Add exam dates</a>`}</div>
    </div>`;
  }

  /* ---------- PLAN: day ---------- */
  function blockHTML(b, k, style, mode) {
    const done = isDone(b, k), K = KINDS[b.kind] || KINDS.other, sub = itemMeta(b, false);
    return `<div class="tt-block kind-${b.kind}${b.len <= 0.5 ? ' short' : ''}${done ? ' is-done' : ''}" style="${style};${hueStyle(b)}" data-act="blk" data-id="${b.id}" data-k="${k}" data-drag draggable="true" tabindex="0" role="button" aria-label="${esc(itemTitle(b))}, ${hh(b.start)} to ${hh(b.start + b.len)}${done ? ', done' : ''}">
      <span class="b-time">${hh(b.start)}–${hh(b.start + b.len)}${b.repeat ? ic('repeat', 'b-rep') : ''}</span>
      <span class="b-title">${esc(itemTitle(b))}</span>
      ${sub ? `<span class="b-sub">${esc(sub)}</span>` : ''}
      ${K.study ? `<button type="button" class="b-check" data-act="blk-done" data-id="${b.id}" data-k="${k}" aria-pressed="${done}" aria-label="Mark done">${ic('check')}</button>` : ''}
      ${mode === 'day' ? '<span class="b-resize" data-resize title="Drag to change length"></span>' : ''}</div>`;
  }
  function timelineHTML(k) {
    const S = state.settings, t = today(), nh = nowH(), rows = (S.dayEnd - S.dayStart) * 2;
    const row = h => 1 + Math.round((h - S.dayStart) * 2), w = win(k);
    let out = `<div class="tt tt-day" id="tt-day" style="--cols:1;--rows:${rows}">`;
    for (let h = S.dayStart; h < S.dayEnd; h++) out += `<div class="tt-time" style="grid-row:${row(h)} / span 2">${hh(h)}</div>`;
    halves(S.dayStart, S.dayEnd).forEach(h => {
      const past = k < t || (k === t && h + 0.5 <= nh), inWin = h >= w.from && h < w.to;
      out += `<button type="button" class="tt-slot${h % 1 ? ' half' : ''}${past ? ' past' : ''}${inWin ? ' in-win' : ''}" data-act="slot" data-k="${k}" data-h="${h}" style="grid-column:2;grid-row:${row(h)}" aria-label="Plan at ${hh(h)}">${ic('plus')}<span>${hh(h)}</span></button>`;
    });
    timedOn(k).forEach(b => {
      const s = Math.max(b.start, S.dayStart), e = Math.min(b.start + b.len, S.dayEnd); if (e <= s) return;
      out += blockHTML(b, k, `grid-column:2;grid-row:${row(s)} / span ${Math.round((e - s) * 2)}`, 'day');
    });
    if (k === t && nh >= S.dayStart && nh < S.dayEnd) out += `<div class="tt-now" style="grid-column:2;grid-row:${row(Math.floor(nh * 2) / 2)}"><i style="top:${((nh * 2) % 1) * 100}%"></i></div>`;
    return out + '</div>';
  }
  function nowCard(k) {
    const nh = nowH(), list = timedOn(k), cur = list.find(b => b.start <= nh && nh < b.start + b.len), next = list.find(b => b.start > nh);
    const b = cur || next;
    if (!b) {
      const first = listOn(k).find(x => !isDone(x, k) && isStudy(x));
      return `<div class="card now"><p class="eyebrow">Nothing timed next</p><h2>${first ? esc(itemTitle(first)) : 'Free time'}</h2><p class="now-sub">${first ? 'First thing on your list without a time.' : 'Add topics to your list, then give them a time.'}</p>
        <div class="row">${first ? `<button type="button" class="btn primary" data-act="focus-blk" data-id="${first.id}" data-k="${k}">${ic('play')}Start focus</button><button type="button" class="btn" data-act="it-slot" data-id="${first.id}" data-k="${k}">${ic('clock')}Give it a time</button>` : `<button type="button" class="btn" data-act="go-focus">${ic('play')}Free focus</button>`}</div></div>`;
    }
    const s = subj(b.subjectId), when = cur ? `Ends in ${fmtMin((b.start + b.len - nh) * 60)}` : `Starts in ${fmtMin((b.start - nh) * 60)}`;
    return `<div class="card now" style="${hueStyle(b)}"><p class="eyebrow">${cur ? 'Happening now' : 'Up next'}</p><h2>${esc(itemTitle(b))}</h2>
      <p class="now-sub">${esc(itemMeta(b, false)) || '&nbsp;'}</p><p class="now-when">${ic('clock')}${hh(b.start)} to ${hh(b.start + b.len)} · ${when}</p>
      <div class="row">${isStudy(b) ? `<button type="button" class="btn primary" data-act="focus-blk" data-id="${b.id}" data-k="${k}">${ic('play')}Start focus</button>` : ''}${s ? smeLinks(s, 'btn sm') : ''}</div></div>`;
  }
  function dayView(k) {
    const t = today(), isT = k === t, list = listOn(k), open = list.filter(b => !isDone(b, k)), doneL = list.filter(b => isDone(b, k));
    const timed = timedOn(k).filter(isStudy).length;
    const carry = isT ? state.blocks.filter(b => !b.repeat && b.date < t && b.date >= addDays(t, -14) && isStudy(b) && !b.done) : [];
    const lens = LENS.slice(0, 5).map(l => `<option value="${l}"${l === state.settings.defLen ? ' selected' : ''}>${fmtLen(l)}</option>`).join('');
    return `${carry.length ? `<div class="carry">${ic('arrow')}<span>${plural(carry.length, 'unfinished topic')} from earlier days.</span><button type="button" class="btn sm" data-act="carry">Move to today</button></div>` : ''}
      <div class="day-top">${isT ? nowCard(k) : ''}${kpis([k], isT ? 'today' : 'this day')}</div>
      <div class="planner">
        <section class="card plist" data-droplist data-k="${k}">
          <div class="card-h"><h2 class="card-title">Revision list</h2><span class="muted-s">${plural(open.length, 'untimed topic')} · ${timed} timed</span></div>
          ${subjBar()}
          <form class="add" data-form="add" data-k="${k}"><div class="add-row"><input type="text" id="add-text" data-keep placeholder="What are you revising? e.g. Ionic bonding" maxlength="300" aria-label="Topic to revise" autocomplete="off"><select id="add-len" aria-label="How long">${lens}</select><button class="btn primary" type="submit">${ic('plus')}Add</button></div>
            <p class="hint">Add several at once with a semicolon. Start with a subject to tag it, like <b>Chem: ionic bonding</b>.</p>
            <button type="button" class="link-btn" data-act="bulk-toggle">${bulkOpen ? 'Hide the big box' : 'Paste a whole list'}</button>
            ${bulkOpen ? `<textarea id="bulk-text" data-keep rows="5" placeholder="One topic per line&#10;Biology: Mitosis&#10;Chem: Ionic bonding&#10;Quadratics"></textarea><button type="button" class="btn sm" data-act="bulk-add" data-k="${k}">${ic('plus')}Add all</button>` : ''}</form>
          <ul class="its">${open.map(b => itemRow(b, k, 'day')).join('') || `<li class="empty">${isT ? 'Nothing waiting for a time. Add what you want to revise today.' : 'No untimed topics on this day.'}</li>`}${doneL.map(b => itemRow(b, k, 'day')).join('')}</ul>
          <div class="plist-foot"><button type="button" class="btn primary" data-act="auto-day" data-k="${k}"${open.length && k >= t ? '' : ' disabled'}>${ic('sparkle')}Auto-time my list</button><span class="hint">Fits untimed topics into your study hours${state.settings.breakEvery ? `, with a 30 min gap every ${fmtLen(state.settings.breakEvery)}` : ''}. Or drag them onto the timeline.</span></div>
        </section>
        <section class="tl"><div class="tl-h"><h2 class="card-title">Timeline</h2><span class="muted-s">Tap a free half hour to add. Drag the bottom edge of a session to resize.</span></div>
          <div class="tt-scroll" id="tt-scroll" data-scroll>${timelineHTML(k)}</div></section>
      </div>`;
  }

  /* ---------- PLAN: week ---------- */
  function weekView(ws) {
    const t = today(), days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    return kpis(days, 'this week') + subjBar() + `<div class="week" id="week-scroll" data-scroll>${days.map(k => {
      const items = planItems(k), st = items.filter(isStudy), d = st.filter(b => isDone(b, k)).length;
      const hrs = st.filter(b => b.start != null).reduce((a, b) => a + b.len, 0), ex = examsOn(k);
      return `<section class="wday${k === t ? ' is-today' : ''}${k < t ? ' past' : ''}" data-droplist data-k="${k}">
        <header class="wday-h"><button type="button" class="wday-d" data-act="goto-day" data-k="${k}" title="Open the timeline for this day"><small>${fmt(k, { weekday: 'short' })}</small><b>${pkey(k).getDate()}</b></button>
          <div class="wday-meta"><span>${st.length ? `${d}/${st.length} done` : 'Empty'}</span><span>${hrs ? fmtLen(hrs) + ' timed' : ''}</span></div></header>
        ${ex.map(e => `<p class="exam-tag">${ic('flag')}${esc(e.name)}</p>`).join('')}
        <ul class="its">${items.map(b => itemRow(b, k, 'week')).join('')}</ul>
        <form class="qadd" data-form="qadd" data-k="${k}"><input type="text" id="qa-${k}" data-keep placeholder="Add a topic" maxlength="300" aria-label="Add a topic for ${fmt(k, { weekday: 'long' })}" autocomplete="off"><button class="icon-btn" type="submit" aria-label="Add">${ic('plus')}</button></form>
      </section>`;
    }).join('')}</div><p class="hint">Type topics into any day. Drag them between days. Click a day's date to open its hour-by-hour timeline.</p>`;
  }

  /* ---------- PLAN: month ---------- */
  function monthView(k) {
    const t = today(), first = k.slice(0, 8) + '01', mk = monthKey(k), start = weekStart(first);
    const dim = new Date(pkey(first).getFullYear(), pkey(first).getMonth() + 1, 0).getDate();
    const weeks = Math.ceil((dow(first) + dim) / 7), days = Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
    const inMonth = days.filter(d => monthKey(d) === mk);
    return kpis(inMonth, 'this month') + subjBar() + `<div class="month">
      <div class="mhead">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<span>${d}</span>`).join('')}</div>
      <div class="mgrid" style="--weeks:${weeks}">${days.map(d => {
        const items = planItems(d).filter(b => isStudy(b) || b.start == null), ex = examsOn(d), done = items.filter(b => isDone(b, d)).length;
        return `<div class="mcell${monthKey(d) !== mk ? ' out' : ''}${d === t ? ' is-today' : ''}${d < t ? ' past' : ''}${ex.length ? ' has-exam' : ''}" data-droplist data-k="${d}">
          <div class="mcell-h"><button type="button" class="mdate" data-act="goto-day" data-k="${d}" aria-label="Open ${fmt(d, { weekday: 'long', day: 'numeric', month: 'long' })}">${pkey(d).getDate()}</button>${items.length ? `<span class="mcount">${done}/${items.length}</span>` : ''}</div>
          ${ex.map(e => `<p class="exam-tag">${ic('flag')}${esc(e.name)}</p>`).join('')}
          <ul class="mchips">${items.slice(0, 3).map(b => `<li class="mchip${isDone(b, d) ? ' is-done' : ''}"${subj(b.subjectId) ? ` style="--h:${subj(b.subjectId).hue}"` : ''} draggable="${!b.repeat}" data-drag data-id="${b.id}" data-k="${d}" data-act="blk" role="button" tabindex="0"><i class="sdot"></i><span>${b.start != null ? hh(b.start) + ' ' : ''}${esc(itemTitle(b))}</span></li>`).join('')}</ul>
          ${items.length > 3 ? `<button type="button" class="mmore" data-act="goto-day" data-k="${d}">+${items.length - 3} more</button>` : ''}
          <span class="mdots" aria-hidden="true">${items.slice(0, 5).map(b => `<i class="sdot"${subj(b.subjectId) ? ` style="--h:${subj(b.subjectId).hue}"` : ''}></i>`).join('')}</span>
          <button type="button" class="madd" data-act="m-add" data-k="${d}" aria-label="Add a topic on ${fmt(d, { day: 'numeric', month: 'long' })}">${ic('plus')}</button>
        </div>`;
      }).join('')}</div></div><p class="hint">Press + on any day to add a topic. Drag topics to move them. Click a date to open that day.</p>`;
  }

  /* ---------- PLAN page ---------- */
  function pgPlan() {
    const t = today(), z = state.ui.zoom, hr = new Date().getHours();
    if (!state.subjects.length && !state.blocks.length && !state.setupDone) {
      return pageHead(fmt(t, { weekday: 'long', day: 'numeric', month: 'long' }), 'Plan', 'Set up your subjects first. It takes about a minute.')
        + `<div class="card setup-cta"><div><h2>Set up in a minute</h2><p class="muted-s">Pick your subjects, add your exam dates and say when you usually study.</p></div><button type="button" class="btn primary lg" data-act="open-setup">${ic('sparkle')}Start setup</button></div>`;
    }
    let eyebrow, title, lede;
    if (z === 'day') {
      const isT = cursor === t, greet = hr < 5 ? 'Still up?' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
      eyebrow = isT ? `Today · ${fmt(cursor, { weekday: 'long', day: 'numeric', month: 'long' })}` : fmt(cursor, { day: 'numeric', month: 'long', year: 'numeric' }) + (cursor < t ? ' · past' : '');
      title = isT ? greet : fmt(cursor, { weekday: 'long' });
      const open = listOn(cursor).filter(b => !isDone(b, cursor)).length;
      lede = open ? `${plural(open, 'topic')} still need a time. Drag them onto the timeline or press Auto-time.` : itemsOn(cursor).some(isStudy) ? 'Everything on the list has a time. Tick sessions off as you go.' : 'Write down every topic you want to cover, then give each one a time.';
    } else if (z === 'week') {
      const ws = weekStart(cursor);
      eyebrow = `${fmt(ws, { day: 'numeric', month: 'short' })} to ${fmt(addDays(ws, 6), { day: 'numeric', month: 'short', year: 'numeric' })}`;
      title = ws === weekStart(t) ? 'This week' : ws === weekStart(addDays(t, 7)) ? 'Next week' : `Week of ${fmt(ws, { day: 'numeric', month: 'short' })}`;
      lede = 'Plan the days ahead. Type topics straight into each day, then time them on the day itself.';
    } else {
      eyebrow = 'Month plan'; title = fmt(cursor, { month: 'long', year: 'numeric' });
      lede = 'The big picture. Spread topics across the weeks before your exams.';
    }
    const nav = `<div class="pnav"><button type="button" class="icon-btn" data-act="prev" aria-label="Previous">${ic('left')}</button>${z === 'day' ? `<input type="date" id="day-pick" value="${cursor}" aria-label="Pick a day">` : ''}<button type="button" class="icon-btn" data-act="next" aria-label="Next">${ic('right')}</button><button type="button" class="btn sm" data-act="to-today"${cursor === t ? ' disabled' : ''}>Today</button></div>`;
    const more = z === 'week' ? `<details class="more"><summary class="btn" aria-label="More options">${ic('more')}</summary><div class="more-menu"><button type="button" class="btn ghost" data-act="auto-week">${ic('sparkle')}Auto-time the whole week</button><button type="button" class="btn ghost" data-act="copyweek">${ic('copy')}Copy last week here</button><button type="button" class="btn ghost danger" data-act="clearweek" data-confirm="Clear this week?">${ic('trash')}Clear this week</button></div></details>` : '';
    const actions = `<div class="row">${seg('zoom', z, ZOOMS, 'Plan view')}${nav}${more}</div>`;
    let body = z === 'day' ? dayView(cursor) : z === 'week' ? weekView(weekStart(cursor)) : monthView(cursor);
    if (z === 'day') {
      const ws = weekStart(cursor);
      body = `<div class="day-strip">${Array.from({ length: 7 }, (_, i) => addDays(ws, i)).map(k => { const st = itemsOn(k).filter(isStudy); return `<button type="button" class="ds${k === t ? ' is-today' : ''}${examsOn(k).length ? ' has-exam' : ''}" data-act="goto-day" data-k="${k}" aria-pressed="${k === cursor}"><small>${fmt(k, { weekday: 'short' })}</small><b>${pkey(k).getDate()}</b><span>${st.length ? `${st.filter(b => isDone(b, k)).length}/${st.length}` : '·'}</span></button>`; }).join('')}</div>` + body;
    }
    return pageHead(eyebrow, title, lede, actions) + body;
  }

  /* ---------- EDITOR ---------- */
  function openEditor(o) {
    const S = state.settings;
    if (o.id) {
      const b = blockById(o.id); if (!b) return;
      const k = o.k || b.date;
      draft = { id: b.id, k, start: b.start, len: b.len, kind: b.kind, subjectId: b.subjectId || '', text: b.text || '', note: b.note || '', repeat: !!b.repeat, done: isDone(b, k), delAsk: false, newSubj: false };
    } else {
      const sid = o.subjectId != null ? o.subjectId : (state.ui.addSubj && subj(state.ui.addSubj) ? state.ui.addSubj : '');
      draft = { id: null, k: o.k || cursor, start: o.h == null ? null : o.h, len: o.len || S.defLen, kind: o.kind || 'revise', subjectId: sid, text: o.text || '', note: '', repeat: false, done: false, delAsk: false, newSubj: false };
    }
    if (draft.start != null) draft.len = clamp(draft.len, 0.5, Math.max(0.5, Math.max(S.dayEnd, draft.start + 0.5) - draft.start));
    openModal(editorHTML());
    if (!o.id) { const i = $('#ed-text'); if (i) i.focus(); }
  }
  function editorHTML() {
    const d = draft, S = state.settings, K = KINDS[d.kind] || KINDS.other, s = subj(d.subjectId);
    const kinds = Object.entries(KINDS).map(([k, v]) => `<button type="button" class="chip" data-act="ed-kind" data-v="${k}" aria-pressed="${d.kind === k}">${v.label}</button>`).join('');
    const subjChips = `<button type="button" class="chip" data-act="ed-subj" data-v="" aria-pressed="${!d.subjectId}">None</button>` + state.subjects.map(x => `<button type="button" class="chip schip" data-act="ed-subj" data-v="${x.id}" aria-pressed="${x.id === d.subjectId}" style="--h:${x.hue}"><i class="sdot"></i>${esc(x.name)}</button>`).join('')
      + (d.newSubj ? `<span class="new-subj"><input type="text" id="ed-newsubj" placeholder="Subject name" maxlength="30" aria-label="New subject name"><button type="button" class="btn sm" data-act="ed-subj-create">Add</button></span>` : `<button type="button" class="chip ghost-chip" data-act="ed-subj-new">${ic('plus')}Subject</button>`);
    const lo = Math.min(S.dayStart, d.start == null ? S.dayStart : d.start), hi = Math.max(S.dayEnd, d.start == null ? 0 : d.start + 0.5);
    const starts = `<option value=""${d.start == null ? ' selected' : ''}>No time yet</option>` + halves(lo, hi).map(h => `<option value="${h}"${h === d.start ? ' selected' : ''}>${hh(h)}</option>`).join('');
    const maxLen = d.start == null ? 6 : Math.min(8, hi - d.start);
    const lens = LENS.concat([5, 6, 8]).filter(l => l <= maxLen + 1e-9).map(l => `<option value="${l}"${l === d.len ? ' selected' : ''}>${fmtLen(l)}</option>`).join('');
    const cl = clashes(d.k, d.start, d.len, d.id);
    const ex = d.id && blockById(d.id);
    let del = '';
    if (d.id) del = d.delAsk ? `<span class="del-ask">Delete <button type="button" class="btn sm danger" data-act="ed-del-one">Only ${fmt(d.k, { weekday: 'short', day: 'numeric' })}</button><button type="button" class="btn sm danger" data-act="ed-del-all">Every week</button></span>`
      : `<button type="button" class="btn ghost danger" data-act="ed-del"${ex && ex.repeat ? '' : ' data-confirm="Delete?"'}>${ic('trash')}Delete</button>`;
    return `<form id="ed-form" class="ed">
      <div class="ed-h"><div><p class="eyebrow">${d.id ? 'Edit' : 'Add to your plan'}</p><h2>${fmt(d.k, { weekday: 'long', day: 'numeric', month: 'long' })}</h2><p class="muted-s">${d.start != null ? `${hh(d.start)} to ${hh(d.start + d.len)}` : 'No time yet'}${d.repeat ? ' · every week' : ''}</p></div><button type="button" class="icon-btn" data-act="modal-close" aria-label="Close">${ic('x')}</button></div>
      <label class="fld fld-big"><span>${K.study ? 'Topic' : 'Label'}</span><input type="text" id="ed-text" data-ed="text" value="${esc(d.text)}" maxlength="100" placeholder="${K.study ? 'e.g. Ionic bonding, or Paper 1 2023' : 'e.g. School, Football, Dinner'}" autocomplete="off"></label>
      <div class="fld"><span>Subject</span><div class="chips">${subjChips}</div></div>
      <div class="fld"><span>Type</span><div class="chips">${kinds}</div></div>
      <div class="ed-grid">
        <label class="fld"><span>Day</span><input type="date" id="ed-date" data-ed="k" value="${d.k}"></label>
        <label class="fld"><span>Start</span><select id="ed-start" data-ed="start">${starts}</select></label>
        <label class="fld"><span>Length</span><select id="ed-len" data-ed="len">${lens}</select></label>
        <label class="fld"><span>Note</span><input type="text" id="ed-note" data-ed="note" value="${esc(d.note)}" maxlength="80" placeholder="e.g. SME questions 1 to 10"></label>
      </div>
      ${s && K.study ? `<div class="sme-row"><span class="muted-s">Save My Exams</span>${smeLinks(s)}</div>` : ''}
      <div class="ed-toggles">${d.start != null ? `<label class="switch"><input type="checkbox" id="ed-repeat" data-ed="repeat"${d.repeat ? ' checked' : ''}><span>Repeat every week</span></label>` : ''}${K.study ? `<label class="switch"><input type="checkbox" id="ed-done" data-ed="done"${d.done ? ' checked' : ''}><span>Done</span></label>` : ''}</div>
      ${cl.length ? `<p class="warn">${ic('x')}Clashes with ${esc(itemTitle(cl[0]))} at ${hh(cl[0].start)}. Pick another time or make it shorter.</p>` : ''}
      <div class="ed-foot">${del}<span class="sp"></span>${K.study ? `<button type="button" class="btn" data-act="ed-focus"${cl.length ? ' disabled' : ''}>${ic('play')}Save and focus</button>` : ''}<button type="submit" class="btn primary"${cl.length ? ' disabled' : ''}>${d.id ? 'Save' : 'Add'}</button></div>
    </form>`;
  }
  function renderEditor() {
    const card = $('#modal-card');
    const act = document.activeElement && card.contains(document.activeElement) ? document.activeElement.id : '';
    card.innerHTML = editorHTML();
    if (act) { const f = document.getElementById(act); if (f) f.focus(); }
  }
  function edChange(el) {
    const f = el.dataset.ed, S = state.settings;
    if (f === 'repeat' || f === 'done') draft[f] = el.checked;
    else if (f === 'start') draft.start = el.value === '' ? null : Number(el.value);
    else if (f === 'len') draft.len = Number(el.value);
    else draft[f] = el.value;
    if (f === 'k' && !draft.k) draft.k = today();
    if (draft.start == null) draft.repeat = false;
    else draft.len = clamp(draft.len, 0.5, Math.max(0.5, Math.max(S.dayEnd, draft.start + 0.5) - draft.start));
    if (f !== 'note' && f !== 'text') renderEditor();
  }
  function saveDraft() {
    const d = draft, K = KINDS[d.kind] || KINDS.other;
    if (!d.k) { toast('Pick a day.'); return null; }
    if (!d.text.trim() && !d.subjectId && K.study) { toast('Type a topic or pick a subject.'); return null; }
    const cl = clashes(d.k, d.start, d.len, d.id);
    if (cl.length) { toast(`That clashes with ${itemTitle(cl[0])} at ${hh(cl[0].start)}.`); return null; }
    let b = d.id && blockById(d.id);
    if (!b) { b = { id: uid(), doneOn: [], skip: [], done: false, order: Date.now() }; state.blocks.push(b); }
    if (d.repeat && d.start != null) { const keep = b.repeat && b.date && b.date < d.k; b.dow = dow(d.k); b.date = keep ? b.date : d.k; b.repeat = true; b.done = false; }
    else { b.repeat = false; b.date = d.k; delete b.dow; }
    Object.assign(b, { start: d.start, len: d.len, kind: d.kind, subjectId: d.subjectId, text: d.text.trim(), note: d.note.trim() });
    setDone(b, d.k, d.done);
    return b;
  }

  /* ---------- MODALS ---------- */
  let lastFocus = null;
  function openModal(html, wide) {
    lastFocus = document.activeElement;
    $('#modal-card').innerHTML = html;
    $('#modal-card').classList.toggle('wide', !!wide);
    $('#modal').hidden = false;
    $('#modal-card').focus({ preventScroll: true });
  }
  function closeModal() {
    if ($('#setup-form') && !state.setupDone) { state.setupDone = true; save(); render(); }
    $('#modal').hidden = true; $('#modal-card').innerHTML = ''; draft = null;
    if (lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true });
  }
  const hourSel = (id, f, v, from, to) => `<select id="${id}" data-set="${f}">${halves(from, to + 0.5).filter(h => h % 1 === 0).map(h => `<option value="${h}"${h === v ? ' selected' : ''}>${hh(h)}</option>`).join('')}</select>`;
  const pickCount = () => Array.from(pick).reduce((a, id) => a + (id === 'comb' ? 3 : 1), 0);
  function pickerBody() {
    const have = state.subjects.map(s => s.name.toLowerCase());
    const chip = (id, name, sub, added) => `<button type="button" class="pick" data-act="pick" data-v="${esc(id)}" aria-pressed="${pick.has(id)}"${added ? ' disabled' : ''}><span class="pick-box">${ic('check')}</span><span class="pick-txt"><b>${esc(name)}</b><small>${added ? 'Already added' : esc(sub)}</small></span></button>`;
    const sciAdded = id => ({ bio: ['biology'], chem: ['chemistry'], phys: ['physics'], comb: ['biology', 'chemistry', 'physics'] })[id].every(n => have.includes(n));
    return `<div class="pick-group"><h3>Sciences · Edexcel</h3><p class="muted-s">These come with Save My Exams links to the right Edexcel pages. Pick the separate sciences or Combined.</p>
        <div class="pick-grid">${SCIENCES.map(c => chip(c.id, c.name, c.sub, sciAdded(c.id))).join('')}</div></div>
      <div class="pick-group"><h3>Other subjects</h3><div class="pick-grid">${OTHERS.map(n => chip('o:' + n, n, 'Subject', have.includes(n.toLowerCase()))).join('')}</div></div>
      <label class="fld"><span>Something else</span><input type="text" id="pick-custom" placeholder="e.g. Further Maths Level 2" maxlength="40"></label>`;
  }
  function setupHTML() {
    const S = state.settings;
    return `<form id="setup-form" class="ed">
      <div class="ed-h"><div><p class="eyebrow">Setup · about a minute</p><h2>Build your planner</h2></div><button type="button" class="icon-btn" data-act="modal-close" aria-label="Close">${ic('x')}</button></div>
      <section class="setup-step"><span class="step-n">01</span><div class="step-body"><h3>Your subjects</h3><p class="muted-s">Used to colour your plan. You type your own topics later.</p>${pickerBody()}</div></section>
      <section class="setup-step"><span class="step-n">02</span><div class="step-body"><h3>Exam dates</h3><p class="muted-s">Leave a date blank if you do not know it yet. Add each paper later in Settings.</p>
        <div class="ed-grid"><label class="fld"><span>Mocks start</span><input type="date" id="su-mock"></label><label class="fld"><span>First real GCSE exam</span><input type="date" id="su-gcse"></label></div></div></section>
      <section class="setup-step"><span class="step-n">03</span><div class="step-body"><h3>When you usually study</h3><p class="muted-s">Auto-time uses these hours first.</p>
        <div class="ed-grid"><label class="fld"><span>Weekdays from</span>${hourSel('su-wdf', 'wdFrom', S.wdFrom, S.dayStart, S.dayEnd - 1)}</label><label class="fld"><span>Weekdays until</span>${hourSel('su-wdt', 'wdTo', S.wdTo, S.dayStart + 1, S.dayEnd)}</label>
        <label class="fld"><span>Weekends from</span>${hourSel('su-wef', 'weFrom', S.weFrom, S.dayStart, S.dayEnd - 1)}</label><label class="fld"><span>Weekends until</span>${hourSel('su-wet', 'weTo', S.weTo, S.dayStart + 1, S.dayEnd)}</label></div></div></section>
      <div class="ed-foot"><span class="muted-s" id="pick-count">${plural(pickCount(), 'subject')} selected</span><span class="sp"></span><button type="submit" class="btn primary lg">${ic('sparkle')}Build my planner</button></div></form>`;
  }
  function addPicked() {
    const custom = $('#pick-custom') ? $('#pick-custom').value.trim() : '';
    const have = () => state.subjects.map(s => s.name.toLowerCase());
    const made = [];
    SCIENCES.forEach(c => { if (pick.has(c.id)) c.make().forEach(x => { if (!have().includes(x.name.toLowerCase())) { x.hue = nextHue(); state.subjects.push(x); made.push(x); } }); });
    pick.forEach(id => { if (id.startsWith('o:') && !have().includes(id.slice(2).toLowerCase())) { const x = sObj(id.slice(2)); x.hue = nextHue(); state.subjects.push(x); made.push(x); } });
    if (custom && !have().includes(custom.toLowerCase())) { const x = sObj(custom); x.hue = nextHue(); state.subjects.push(x); made.push(x); }
    pick = new Set();
    return made.length;
  }

  /* ---------- BRAINSTORM ---------- */
  function curBoard() {
    let b = state.boards.find(x => x.id === state.ui.board);
    if (!b && state.boards.length) { b = state.boards[0]; state.ui.board = b.id; }
    return b;
  }
  function cardHTML(c) {
    const li = LANES.findIndex(l => l[0] === c.lane);
    return `<article class="cardn" draggable="true" data-card="${c.id}"><p contenteditable="true" spellcheck="true" data-edit="${c.id}" aria-label="Card text">${esc(c.text)}</p>
      <div class="cardn-act"><button type="button" class="icon-btn" data-act="card-move" data-id="${c.id}" data-v="-1"${li === 0 ? ' disabled' : ''} aria-label="Move left">${ic('left')}</button><button type="button" class="icon-btn" data-act="card-move" data-id="${c.id}" data-v="1"${li === LANES.length - 1 ? ' disabled' : ''} aria-label="Move right">${ic('right')}</button><span class="sp"></span>${c.planned ? `<span class="node-tag">${ic('check')}planned</span>` : ''}<button type="button" class="icon-btn" data-act="card-plan" data-id="${c.id}" title="Add to my plan" aria-label="Add to my plan">${ic('calplus')}</button><button type="button" class="icon-btn" data-act="card-del" data-id="${c.id}" data-confirm="Sure?" aria-label="Delete card">${ic('x')}</button></div></article>`;
  }
  function pgBrainstorm() {
    const b = curBoard();
    let out = pageHead('Think it through', 'Brainstorm', 'One board per topic or exam question. Dump everything into Ideas, then sort it. Send anything you still need to revise straight into your plan.');
    const subjOpts = sel => '<option value="">No subject</option>' + state.subjects.map(s => `<option value="${s.id}"${s.id === sel ? ' selected' : ''}>${esc(s.name)}</option>`).join('');
    const list = state.boards.map(x => { const s = subj(x.subjectId); return `<button type="button" class="bs-item" data-act="bs-board" data-id="${x.id}" aria-pressed="${!!b && x.id === b.id}"${s ? ` style="--h:${s.hue}"` : ''}><i class="sdot"></i><span>${esc(x.name)}</span><small>${x.cards.length}</small></button>`; }).join('');
    out += `<div class="bs"><aside class="card bs-side"><h2 class="card-title">Boards</h2><div class="bs-items">${list || '<p class="empty">No boards yet.</p>'}</div>
      <form id="board-form" class="bs-new"><input type="text" id="bs-name" data-keep placeholder="New board, e.g. Electrolysis" maxlength="40" aria-label="Board name"><select id="bs-new-subj" aria-label="Subject for the new board">${subjOpts(state.ui.addSubj)}</select><button class="btn primary" type="submit">${ic('plus')}Create board</button></form></aside>
      <div class="bs-main">${b ? `<div class="bs-head"><h2 class="bs-title">${esc(b.name)}</h2><label class="fld fld-inline"><span>Subject</span><select id="bs-subj">${subjOpts(b.subjectId)}</select></label><button type="button" class="btn sm ghost danger" data-act="bs-del" data-confirm="Delete board?">${ic('trash')}Delete</button></div>
        <div class="lanes">${LANES.map(([id, label]) => { const cards = b.cards.filter(c => c.lane === id); return `<section class="lane lane-${id}" data-lane="${id}"><h3>${label}<span class="n">${cards.length}</span></h3><div class="lane-cards">${cards.map(cardHTML).join('') || '<p class="empty">Drop or add cards here.</p>'}</div>
          <form class="lane-add" data-form="card" data-lane="${id}"><input type="text" id="la-${id}" data-keep maxlength="140" placeholder="Add a card" aria-label="Add a card to ${label}"><button class="icon-btn" type="submit" aria-label="Add card">${ic('plus')}</button></form></section>`; }).join('')}</div>
        <p class="hint">Click a card to edit it. Drag cards between columns, or use the arrows on your phone.</p>`
        : '<div class="card empty-big"><h2>Start a board</h2><p>Name it after a topic or a question you keep getting wrong, then write every idea you can think of.</p></div>'}</div></div>`;
    return out;
  }

  /* ---------- FOCUS ---------- */
  const tlen = m => Math.max(1, state.timer[m]) * 60;
  const tleft = () => { const T = state.timer; return T.running ? Math.max(0, Math.ceil((T.endAt - Date.now()) / 1000)) : T.left; };
  function linkedBlock() { const T = state.timer; if (!T.blockId || T.blockDate !== today()) return null; return blockById(T.blockId) || null; }
  function linkTimer(id, k) {
    const T = state.timer, b = blockById(id);
    T.blockId = id; T.blockDate = k; T.subjectId = b ? b.subjectId || '' : '';
    if (!T.running && T.mode !== 'focus') { T.mode = 'focus'; T.left = tlen('focus'); }
    save();
  }
  let actx = null;
  function unlockAudio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) { /* no audio */ } }
  function beep() {
    try {
      unlockAudio(); if (!actx) return;
      const t0 = actx.currentTime;
      [660, 880, 1175].forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), s = t0 + i * 0.22;
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.25, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.4);
        o.connect(g); g.connect(actx.destination); o.start(s); o.stop(s + 0.45);
      });
    } catch (e) { /* no audio */ }
  }
  function tStart() { const T = state.timer; if (T.running) return; unlockAudio(); T.endAt = Date.now() + T.left * 1000; T.running = true; save(); render(); }
  function tPause() { const T = state.timer; if (!T.running) return; T.left = tleft(); T.running = false; T.endAt = 0; save(); render(); }
  function tReset() { const T = state.timer; T.running = false; T.endAt = 0; T.left = tlen(T.mode); save(); render(); }
  function tMode(m) { const T = state.timer; T.mode = m; T.running = false; T.endAt = 0; T.left = tlen(m); save(); render(); }
  function tNext() {
    const T = state.timer;
    if (T.mode === 'focus') T.mode = T.done > 0 && T.done % T.every === 0 ? 'long' : 'short';
    else { if (T.mode === 'long') T.done = 0; T.mode = 'focus'; }
    T.left = tlen(T.mode); T.running = false; T.endAt = 0;
  }
  function completePhase() {
    const T = state.timer, was = T.mode; let msg = `${MODE[was]} finished.`;
    if (was === 'focus') {
      T.done++;
      if (T.log) {
        const lb = linkedBlock();
        state.sessions.push({ id: uid(), date: today(), at: Date.now(), minutes: T.focus, subjectId: T.subjectId, blockId: lb ? lb.id : '' });
        msg = `Focus finished. ${T.focus} min logged.`;
        if (lb && !isDone(lb, today())) {
          const mins = state.sessions.filter(s => s.blockId === lb.id && s.date === today()).reduce((a, s) => a + s.minutes, 0);
          if (mins >= lb.len * 60 - 5) { setDone(lb, today(), true); msg += ` "${itemTitle(lb)}" ticked off.`; }
        }
      }
    }
    tNext(); save();
    if (T.sound) beep();
    titleFlash = Date.now() + 15000;
    render();
    const p = $('.focus-main'); if (p) { p.classList.remove('flash'); void p.offsetWidth; p.classList.add('flash'); }
    toast(`${msg} Next: ${MODE[T.mode].toLowerCase()}.`);
  }
  function renderTimerLive() {
    const T = state.timer, left = tleft(), total = tlen(T.mode), txt = pad(Math.floor(left / 60)) + ':' + pad(left % 60);
    document.title = T.running ? `${txt} ${MODE[T.mode]} · ${BASE_TITLE}` : (titleFlash > Date.now() ? `Time is up · ${BASE_TITLE}` : BASE_TITLE);
    const chip = $('#timer-chip');
    if (chip) { chip.hidden = !(T.running || left < total); chip.querySelector('b').textContent = txt; chip.classList.toggle('paused', !T.running); }
    const el = $('#tm-time'); if (!el) return;
    el.textContent = txt;
    const ring = $('#tm-ring'); if (ring) ring.style.strokeDashoffset = String(RING * (1 - Math.min(1, left / total)));
    const st = $('#tm-start'), sig = T.running + '|' + (left < total);
    if (st && st.dataset.sig !== sig) { st.dataset.sig = sig; st.innerHTML = T.running ? ic('pause') + 'Pause' : ic('play') + (left < total ? 'Resume' : 'Start'); }
  }
  function pgFocus() {
    const T = state.timer, t = today(), list = planItems(t).filter(isStudy), lb = linkedBlock();
    const val = lb ? 'b:' + lb.id : T.subjectId ? 's:' + T.subjectId : '';
    const opts = '<option value="">Free study</option>' + (list.length ? `<optgroup label="Today's plan">${list.map(b => `<option value="b:${b.id}"${val === 'b:' + b.id ? ' selected' : ''}>${b.start != null ? hh(b.start) + ' ' : ''}${esc(itemTitle(b))}${subj(b.subjectId) && b.text ? ' · ' + esc(subj(b.subjectId).name) : ''}${isDone(b, t) ? ' (done)' : ''}</option>`).join('')}</optgroup>` : '')
      + (state.subjects.length ? `<optgroup label="Subjects">${state.subjects.map(s => `<option value="s:${s.id}"${val === 's:' + s.id ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}</optgroup>` : '');
    const ticks = Array.from({ length: 60 }, (_, i) => `<line class="tk${i % 5 ? '' : ' l'}" x1="160" y1="${i % 5 ? 7 : 2}" x2="160" y2="13" transform="rotate(${i * 6} 160 160)"/>`).join('');
    const filled = T.mode === 'long' ? T.every : T.done % T.every;
    const dots = Array.from({ length: T.every }, (_, i) => `<i class="${i < filled ? 'on' : ''}"></i>`).join('');
    const todays = state.sessions.filter(s => s.date === t).slice().reverse();
    const tot = todays.reduce((a, s) => a + s.minutes, 0);
    const cs = subj(T.subjectId), on = lb ? itemTitle(lb) + (lb.text && cs ? ' · ' + cs.name : '') : (cs ? cs.name : 'Free study');
    const upNext = list.filter(b => !isDone(b, t) && (!lb || b.id !== lb.id)).slice(0, 5);
    const num = (id, f, v, min, max, label) => `<label class="fld"><span>${label}</span><input type="number" id="${id}" data-tm="${f}" min="${min}" max="${max}" value="${v}" inputmode="numeric"></label>`;
    return pageHead('Deep work', 'Focus', 'Pick what you are working on, choose a length and go.', `<button type="button" class="btn" data-act="tm-zen">${ic('expand')}Zen mode</button>`)
      + `<div class="focus" data-mode="${T.mode}">
        <div class="card focus-main"${lb ? ` style="${hueStyle(lb)}"` : cs ? ` style="--h:${cs.hue}"` : ''}>
          ${seg('tm-mode', T.mode, Object.entries(MODE), 'Timer mode')}
          ${T.mode === 'focus' ? `<div class="presets" role="group" aria-label="Focus length">${PRESET_MIN.map(m => `<button type="button" class="chip" data-act="tm-preset" data-v="${m}" aria-pressed="${T.focus === m}">${m} min</button>`).join('')}</div>` : ''}
          <div class="dial"><svg viewBox="0 0 320 320" aria-hidden="true">${ticks}<circle class="trk" cx="160" cy="160" r="140"/><circle class="prg" id="tm-ring" cx="160" cy="160" r="140" stroke-dasharray="${RING}" stroke-dashoffset="0" transform="rotate(-90 160 160)"/></svg>
            <div class="dial-read" role="timer"><span class="tm-phase">${T.mode === 'focus' ? `Session ${(T.done % T.every) + 1} of ${T.every}` : MODE[T.mode]}</span><span class="tm-time" id="tm-time">--:--</span><span class="tm-on">${esc(on)}</span><span class="cycle">${dots}</span></div></div>
          <div class="tm-ctrl"><button type="button" class="btn primary lg" id="tm-start" data-act="tm-start"></button><button type="button" class="btn" data-act="tm-reset">${ic('reset')}Reset</button><button type="button" class="btn" data-act="tm-skip">${ic('skip')}Skip</button></div>
          <p class="hint">Space starts and pauses. The timer keeps running on other pages.</p>
        </div>
        <div class="focus-side">
          <div class="card"><h2 class="card-title">Working on</h2><label class="fld"><span class="sr">Working on</span><select id="tm-on">${opts}</select></label>
            ${lb ? `<div class="linked" style="${hueStyle(lb)}"><b>${esc(itemTitle(lb))}</b><span>${lb.start != null ? `${hh(lb.start)} to ${hh(lb.start + lb.len)}` : fmtLen(lb.len)}${cs && lb.text ? ' · ' + esc(cs.name) : ''}</span>${isDone(lb, t) ? `<span class="pill g">${ic('check')}Done</span>` : `<button type="button" class="btn sm" data-act="tm-mark">${ic('check')}Mark done</button>`}</div>` : ''}
            ${cs ? `<div class="sme-row"><span class="muted-s">Save My Exams</span>${smeLinks(cs, 'btn sm')}</div>` : ''}
            ${upNext.length ? `<div class="upnext"><span class="muted-s">Still on today's plan</span><ul>${upNext.map(b => `<li${subj(b.subjectId) ? ` style="--h:${subj(b.subjectId).hue}"` : ''}><i class="sdot"></i><span>${b.start != null ? `<em class="t-badge">${hh(b.start)}</em>` : ''}${esc(itemTitle(b))}</span><button type="button" class="btn sm" data-act="focus-blk" data-id="${b.id}" data-k="${t}">${ic('play')}Focus</button></li>`).join('')}</ul></div>` : ''}</div>
          <div class="card note-card"><div class="card-h"><h2 class="card-title">Flashnote</h2><span class="muted-s" id="note-status">Saved on this device</span></div>
            <div class="chips">${['Formula', 'Definition', 'Remember', 'Mistake to avoid'].map(x => `<button type="button" class="chip" data-act="note-ins" data-v="${x}: ">${x}</button>`).join('')}</div>
            <textarea id="flashnote" rows="7" placeholder="Formulas, definitions and mistakes to remember." aria-label="Flashnote"></textarea>
            <div class="row"><button type="button" class="btn sm" data-act="note-copy">${ic('copy')}Copy</button><button type="button" class="btn sm ghost danger" data-act="note-clear" data-confirm="Clear note?">Clear</button></div></div>
          <div class="card"><div class="card-h"><h2 class="card-title">Logged today</h2><span class="big-num sm">${fmtMin(tot)}</span></div>
            ${todays.length ? `<ul class="log">${todays.slice(0, 6).map(s => { const x = subj(s.subjectId), b = blockById(s.blockId); return `<li${x ? ` style="--h:${x.hue}"` : ''}><i class="sdot"></i><span>${b ? esc(itemTitle(b)) : x ? esc(x.name) : 'Free study'}</span><b>${s.minutes} min</b></li>`; }).join('')}</ul>` : '<p class="empty">Nothing logged yet today.</p>'}
            <div class="row manual"><input type="number" id="manual-min" data-keep min="1" max="600" placeholder="Minutes" inputmode="numeric" aria-label="Minutes studied without the timer"><button type="button" class="btn sm" data-act="manual-add">${ic('plus')}Log time</button></div>
            <div class="sw-list"><label class="switch"><input type="checkbox" id="log-toggle"${T.log ? ' checked' : ''}><span>Log focus time to my stats</span></label><label class="switch"><input type="checkbox" id="sound-toggle"${T.sound ? ' checked' : ''}><span>Chime when time is up</span></label></div></div>
          <details class="card tm-set"><summary>Custom lengths</summary><div class="ed-grid">${num('tm-f', 'focus', T.focus, 1, 180, 'Focus (min)')}${num('tm-s', 'short', T.short, 1, 60, 'Short break')}${num('tm-l', 'long', T.long, 1, 90, 'Long break')}${num('tm-e', 'every', T.every, 2, 8, 'Sessions per cycle')}</div></details>
        </div></div>`;
  }

  /* ---------- SETTINGS ---------- */
  function pgSettings() {
    const S = state.settings;
    const hsel = (f, v, from, to) => hourSel(`set-${f}`, f, v, from, to);
    const exams = state.exams.slice().sort((a, b) => a.date < b.date ? -1 : 1);
    return pageHead('Setup', 'Settings', 'Subjects, exam dates, your usual study hours and your data.')
      + `<div class="set-grid">
      <section class="card"><h2 class="card-title">Subjects</h2><p class="muted-s">Tap the colour square to change a colour. Paste a Save My Exams link to make its button go straight there.</p>
        <div class="subj-list">${state.subjects.map(s => `<div class="subj-row" style="--h:${s.hue}"><button type="button" class="sw" data-act="subj-hue" data-id="${s.id}" aria-label="Change colour of ${esc(s.name)}"></button><input type="text" id="sn-${s.id}" data-subj="${s.id}" data-f="name" value="${esc(s.name)}" maxlength="30" aria-label="Subject name"><input type="text" id="sl-${s.id}" data-subj="${s.id}" data-f="sme" value="${esc(s.sme && !s.sme.generic ? s.sme.notes : '')}" placeholder="Save My Exams link" aria-label="Save My Exams link for ${esc(s.name)}"><button type="button" class="icon-btn" data-act="subj-del" data-id="${s.id}" data-confirm="Remove?" aria-label="Remove ${esc(s.name)}">${ic('x')}</button></div>`).join('') || '<p class="empty">No subjects yet.</p>'}</div>
        <form id="subj-form" class="row"><input type="text" id="new-subj" data-keep placeholder="Add a subject" maxlength="30" aria-label="New subject"><button type="submit" class="btn">${ic('plus')}Add</button><button type="button" class="btn ghost" data-act="open-setup">${ic('sparkle')}Pick from list</button></form></section>
      <section class="card"><h2 class="card-title">Exam dates</h2><p class="muted-s">They show on your week and month plans. Countdowns count to 9am.</p>
        <div class="ex-list">${exams.map(e => `<div class="ex-row"><input type="text" id="exn-${e.id}" data-exam="${e.id}" data-f="name" value="${esc(e.name)}" maxlength="50" aria-label="Exam name"><input type="date" id="exd-${e.id}" data-exam="${e.id}" data-f="date" value="${e.date}" aria-label="Exam date"><button type="button" class="icon-btn" data-act="ex-del" data-id="${e.id}" data-confirm="Remove?" aria-label="Remove ${esc(e.name)}">${ic('x')}</button></div>`).join('') || '<p class="empty">No dates yet.</p>'}</div>
        <form id="exam-form" class="row"><input type="text" id="ex-name" data-keep placeholder="e.g. Biology Paper 1" maxlength="50" aria-label="New exam name"><input type="date" id="ex-date" data-keep aria-label="New exam date"><button type="submit" class="btn">${ic('plus')}Add</button></form></section>
      <section class="card"><h2 class="card-title">Study hours</h2><p class="muted-s">Auto-time fills these hours first.</p>
        <div class="ed-grid"><label class="fld"><span>Weekdays from</span>${hsel('wdFrom', S.wdFrom, S.dayStart, S.dayEnd - 1)}</label><label class="fld"><span>Weekdays until</span>${hsel('wdTo', S.wdTo, S.dayStart + 1, S.dayEnd)}</label>
        <label class="fld"><span>Weekends from</span>${hsel('weFrom', S.weFrom, S.dayStart, S.dayEnd - 1)}</label><label class="fld"><span>Weekends until</span>${hsel('weTo', S.weTo, S.dayStart + 1, S.dayEnd)}</label>
        <label class="fld"><span>Free half hour after</span><select id="set-breakEvery" data-set="breakEvery"><option value="0"${!S.breakEvery ? ' selected' : ''}>No gaps</option>${[1, 1.5, 2].map(v => `<option value="${v}"${S.breakEvery === v ? ' selected' : ''}>${fmtLen(v)} of study</option>`).join('')}</select></label>
        <label class="fld"><span>New topics last</span><select id="set-defLen" data-set="defLen">${LENS.slice(0, 5).map(v => `<option value="${v}"${S.defLen === v ? ' selected' : ''}>${fmtLen(v)}</option>`).join('')}</select></label>
        <label class="fld"><span>Weekly target (hours)</span><input type="number" id="set-target" data-set="target" min="1" max="80" value="${S.target}"></label></div>
        <h3 class="sub-h">Timeline shows</h3>
        <div class="ed-grid"><label class="fld"><span>From</span>${hsel('dayStart', S.dayStart, 5, 12)}</label><label class="fld"><span>Until</span>${hsel('dayEnd', S.dayEnd, 15, 24)}</label></div></section>
      <section class="card"><h2 class="card-title">Your data</h2><p class="muted-s">Everything is saved in this browser only. To move to another device, copy a backup here and paste it there.</p>
        <div class="row"><button type="button" class="btn" data-act="backup-copy">${ic('copy')}Copy backup</button></div>
        <label class="fld"><span>Restore from a backup</span><textarea id="restore-text" data-keep rows="4" placeholder="Paste a backup here"></textarea></label>
        <div class="row"><button type="button" class="btn" data-act="restore" data-confirm="Replace everything?">Restore backup</button><span class="sp"></span><button type="button" class="btn ghost danger" data-act="reset-all" data-confirm="Erase everything?">${ic('trash')}Erase all data</button></div></section></div>`;
  }

  /* ---------- live clocks ---------- */
  function tickClock() {
    $$('[data-cd]').forEach(el => {
      const ms = untilMs(el.dataset.cd);
      if (ms <= 0) { el.textContent = 'Good luck'; return; }
      const s = Math.floor(ms / 1000);
      el.textContent = `${pad(Math.floor(s % 86400 / 3600))}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}`;
    });
    const hc = $('#hud-clock'); if (hc) { const d = new Date(); hc.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }
    const m = new Date().getMinutes();
    if (m !== lastMinute) {
      lastMinute = m;
      const ae = document.activeElement;
      if (page === 'plan' && state.ui.zoom === 'day' && $('#modal').hidden && !(ae && ae.closest && ae.closest('input,textarea,select,[contenteditable="true"],details[open]')) && !dragInfo) render();
    }
  }
  setInterval(() => { const T = state.timer; if (T.running && Date.now() >= T.endAt) completePhase(); else renderTimerLive(); }, 250);
  setInterval(tickClock, 1000);

  /* ---------- actions ---------- */
  function openSetup() { pick = new Set(); openModal(setupHTML(), true); }
  function shift(dir) {
    const z = state.ui.zoom;
    if (z === 'day') cursor = addDays(cursor, dir);
    else if (z === 'week') cursor = addDays(cursor, dir * 7);
    else { const d = pkey(cursor); cursor = dkey(new Date(d.getFullYear(), d.getMonth() + dir, 1)); }
    render();
  }
  function moveItem(b, fromK, toK, h) {
    const S = state.settings;
    if (b.repeat) {
      if (h == null) { toast('Weekly sessions need a time. Open it to change it.'); return false; }
      const len = clamp(b.len, 0.5, S.dayEnd - h);
      if (clashes(toK, h, len, b.id).length) { toast('That clashes with something already there.'); return false; }
      b.dow = dow(toK); if (toK < b.date) b.date = toK; b.start = h; b.len = len; return true;
    }
    if (h != null) {
      let len = b.len;
      while (len > 0.5 && !freeAt(toK, h, len, b.id)) len -= 0.5;
      if (!freeAt(toK, h, len, b.id)) { toast('That time is taken.'); return false; }
      b.date = toK; b.start = h; b.len = len; return true;
    }
    if (toK === fromK) { b.start = null; return true; }
    b.date = toK;
    if (b.start != null && !freeAt(toK, b.start, b.len, b.id)) b.start = null;
    return true;
  }
  const ACT = {
    'modal-close': closeModal,
    'open-setup': openSetup,
    pick: D => {
      const id = D.v;
      if (pick.has(id)) pick.delete(id);
      else { pick.add(id); if (id === 'comb') ['bio', 'chem', 'phys'].forEach(x => pick.delete(x)); if (['bio', 'chem', 'phys'].includes(id)) pick.delete('comb'); }
      $$('.pick').forEach(el => el.setAttribute('aria-pressed', String(pick.has(el.dataset.v))));
      const pc = $('#pick-count'); if (pc) pc.textContent = `${plural(pickCount(), 'subject')} selected`;
    },
    zoom: D => { state.ui.zoom = D.v; save(); render(); },
    prev: () => shift(-1), next: () => shift(1),
    'to-today': () => { cursor = today(); render(); },
    'goto-day': D => { cursor = D.k; state.ui.zoom = 'day'; save(); go('plan'); },
    'go-focus': () => { state.timer.blockId = ''; save(); go('focus'); },
    'add-subj': D => { state.ui.addSubj = D.v; save(); render(); },
    'subj-new': () => { newSubjOpen = true; render(); const i = $('#new-subj-inline'); if (i) i.focus(); },
    'subj-create': () => { const i = $('#new-subj-inline'), s = i && getSubject(i.value); newSubjOpen = false; if (s) state.ui.addSubj = s.id; commit(); },
    'bulk-toggle': () => { bulkOpen = !bulkOpen; render(); if (bulkOpen) { const t = $('#bulk-text'); if (t) t.focus(); } },
    'bulk-add': D => { const t = $('#bulk-text'); const n = t && t.value.trim() ? addItems(D.k, t.value, Number($('#add-len').value)) : 0; if (!n) { toast('Type at least one topic.'); return; } t.value = ''; bulkOpen = false; commit(); toast(`${plural(n, 'topic')} added to the list.`); },
    'm-add': D => openEditor({ k: D.k }),
    slot: D => { if (justResized) return; openEditor({ k: D.k, h: Number(D.h) }); },
    blk: D => { if (justResized) return; openEditor({ id: D.id, k: D.k }); },
    'blk-done': D => { const b = blockById(D.id); if (!b) return; const v = !isDone(b, D.k); setDone(b, D.k, v); commit(); if (v) toast('Ticked off.'); },
    'focus-blk': D => { linkTimer(D.id, D.k); go('focus'); },
    'it-slot': D => {
      const b = blockById(D.id); if (!b) return; snap();
      const r = autoTime(D.k, [b]);
      if (r.placed) { commit(); toast(`Timed at ${hh(b.start)}.`, 'Undo', undo); } else toast(D.k < today() ? 'That day is over.' : 'No free time left that day. Drag it somewhere instead.');
    },
    'auto-day': D => {
      const items = listOn(D.k).filter(b => !isDone(b, D.k));
      if (!items.length) return;
      snap(); const r = autoTime(D.k, items); commit();
      toast(`Timed ${plural(r.placed, 'topic')}${r.late ? `, ${r.late} outside your usual hours` : ''}${r.left ? `. ${r.left} did not fit` : ''}.`, 'Undo', undo);
    },
    'auto-week': () => {
      const ws = weekStart(cursor), t = today(); let placed = 0, left = 0; snap();
      for (let i = 0; i < 7; i++) { const k = addDays(ws, i); if (k < t) continue; const r = autoTime(k, listOn(k).filter(b => !isDone(b, k))); placed += r.placed; left += r.left; }
      $$('details.more[open]').forEach(d => { d.open = false; });
      commit(); toast(`Timed ${plural(placed, 'topic')} across the week${left ? `. ${left} did not fit` : ''}.`, 'Undo', undo);
    },
    carry: () => {
      const t = today(); snap(); let n = 0;
      state.blocks.forEach(b => { if (!b.repeat && b.date < t && b.date >= addDays(t, -14) && isStudy(b) && !b.done) { b.date = t; b.start = null; b.order = Date.now() + n; n++; } });
      commit(); toast(`Moved ${plural(n, 'topic')} to today's list.`, 'Undo', undo);
    },
    copyweek: () => {
      const ws = weekStart(cursor), prev = addDays(ws, -7);
      const src = state.blocks.filter(b => !b.repeat && b.date >= prev && b.date < ws);
      if (!src.length) { toast('Last week has nothing to copy.'); return; }
      snap(); let n = 0;
      src.forEach(b => { const k = addDays(b.date, 7), nb = Object.assign({}, b, { id: uid(), date: k, done: false, doneOn: [], skip: [] }); if (nb.start != null && !freeAt(k, nb.start, nb.len)) nb.start = null; state.blocks.push(nb); n++; });
      commit(); toast(`Copied ${plural(n, 'item')} from last week.`, 'Undo', undo);
    },
    clearweek: () => {
      const ws = weekStart(cursor), we = addDays(ws, 6);
      const keep = state.blocks.filter(b => b.repeat || b.date < ws || b.date > we), n = state.blocks.length - keep.length;
      if (!n) { toast('Nothing to clear this week.'); return; }
      snap(); state.blocks = keep; commit(); toast(`Cleared ${plural(n, 'item')}. Weekly sessions stay.`, 'Undo', undo);
    },
    'ed-kind': D => { draft.kind = D.v; renderEditor(); },
    'ed-subj': D => { draft.subjectId = D.v; renderEditor(); },
    'ed-subj-new': () => { draft.newSubj = true; renderEditor(); const i = $('#ed-newsubj'); if (i) i.focus(); },
    'ed-subj-create': () => { const i = $('#ed-newsubj'), s = i && getSubject(i.value); draft.newSubj = false; if (s) { draft.subjectId = s.id; save(); } renderEditor(); },
    'ed-del': () => { const b = blockById(draft.id); if (!b) return; if (b.repeat) { draft.delAsk = true; renderEditor(); return; } snap(); state.blocks = state.blocks.filter(x => x !== b); closeModal(); commit(); toast('Deleted.', 'Undo', undo); },
    'ed-del-one': () => { const b = blockById(draft.id); snap(); b.skip.push(draft.k); closeModal(); commit(); toast('Removed for this week only.', 'Undo', undo); },
    'ed-del-all': () => { snap(); state.blocks = state.blocks.filter(x => x.id !== draft.id); closeModal(); commit(); toast('Weekly session deleted.', 'Undo', undo); },
    'ed-focus': () => { const k = draft.k, b = saveDraft(); if (!b) return; linkTimer(b.id, k); closeModal(); save(); go('focus'); },
    'bs-board': D => { state.ui.board = D.id; commit(); },
    'bs-del': () => { const b = curBoard(); if (!b) return; state.boards = state.boards.filter(x => x !== b); state.ui.board = ''; commit(); },
    'card-move': D => { const b = curBoard(), c = b && b.cards.find(x => x.id === D.id); if (!c) return; const i = clamp(LANES.findIndex(l => l[0] === c.lane) + Number(D.v), 0, LANES.length - 1); c.lane = LANES[i][0]; commit(); },
    'card-del': D => { const b = curBoard(); if (b) { b.cards = b.cards.filter(x => x.id !== D.id); commit(); } },
    'card-plan': D => { const b = curBoard(), c = b && b.cards.find(x => x.id === D.id); if (!c) return; c.planned = true; save(); openEditor({ k: today(), text: c.text, subjectId: b.subjectId || '' }); },
    'tm-start': () => { state.timer.running ? tPause() : tStart(); },
    'tm-reset': tReset,
    'tm-skip': () => { tNext(); save(); render(); },
    'tm-mode': D => tMode(D.v),
    'tm-preset': D => { const T = state.timer; T.focus = Number(D.v); if (!T.running && T.mode === 'focus') T.left = T.focus * 60; save(); render(); if (T.running) toast(`Next focus sessions will be ${T.focus} min.`); },
    'tm-zen': () => { document.body.classList.toggle('zen'); if (document.body.classList.contains('zen')) toast('Zen mode on. Press Esc to leave.'); },
    'tm-mark': () => { const lb = linkedBlock(); if (lb) { setDone(lb, today(), true); commit(); toast('Ticked off.'); } },
    'manual-add': () => {
      const el = $('#manual-min'), v = Math.round(Number(el.value));
      if (!v || v < 1) { toast('Enter how many minutes you studied.'); return; }
      const lb = linkedBlock();
      state.sessions.push({ id: uid(), date: today(), at: Date.now(), minutes: Math.min(600, v), subjectId: state.timer.subjectId, blockId: lb ? lb.id : '' });
      el.value = ''; commit(); toast(`${Math.min(600, v)} min logged.`);
    },
    'note-ins': D => {
      const ta = $('#flashnote'); if (!ta) return;
      const s = ta.selectionStart, e = ta.selectionEnd, v = ta.value, pre = s > 0 && v.charAt(s - 1) !== '\n' ? '\n' : '';
      ta.value = v.slice(0, s) + pre + D.v + v.slice(e);
      const p = s + pre.length + D.v.length; ta.focus(); ta.setSelectionRange(p, p); noteSave();
    },
    'note-copy': () => {
      const ta = $('#flashnote');
      const fb = () => { ta.focus(); ta.select(); toast('Selected. Press Ctrl+C or Cmd+C to copy.'); };
      try { navigator.clipboard.writeText(ta.value).then(() => toast('Copied.'), fb); } catch (e) { fb(); }
    },
    'note-clear': () => { state.note = ''; save(); const ta = $('#flashnote'); if (ta) ta.value = ''; toast('Note cleared.'); },
    'subj-hue': D => { const s = subj(D.id); if (!s) return; const i = HUES.indexOf(s.hue); s.hue = HUES[(i + 1) % HUES.length]; commit(); },
    'subj-del': D => { state.subjects = state.subjects.filter(s => s.id !== D.id); if (state.ui.addSubj === D.id) state.ui.addSubj = ''; commit(); },
    'ex-del': D => { state.exams = state.exams.filter(e => e.id !== D.id); commit(); },
    'backup-copy': () => {
      const data = JSON.stringify(state), ta = $('#restore-text');
      const fb = () => { if (ta) { ta.value = data; ta.focus(); ta.select(); } toast('Backup is in the box below. Press Ctrl+C or Cmd+C to copy it.'); };
      try { navigator.clipboard.writeText(data).then(() => toast('Backup copied. Paste it somewhere safe.'), fb); } catch (e) { fb(); }
    },
    restore: () => {
      const ta = $('#restore-text'); let obj;
      try { obj = JSON.parse(ta.value); } catch (e) { toast('That backup could not be read. Paste the whole text you copied.'); return; }
      if (!obj || !Array.isArray(obj.subjects)) { toast('That does not look like a Revision Hub backup.'); return; }
      state = normalise(obj); migrate(state, obj); state.setupDone = true; ta.value = ''; commit(); toast('Backup restored.');
    },
    'reset-all': () => { state = normalise({}); cursor = today(); commit(); toast('All data erased.'); openSetup(); },
  };

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    const more = e.target.closest('details.more');
    $$('details.more[open]').forEach(d => { if (d !== more) d.open = false; });
    const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    if (b.dataset.confirm && !b.classList.contains('armed')) {
      e.preventDefault();
      b.classList.add('armed'); b.dataset.orig = b.innerHTML; b.textContent = b.dataset.confirm;
      setTimeout(() => { if (b.isConnected && b.classList.contains('armed')) { b.classList.remove('armed'); b.innerHTML = b.dataset.orig; } }, 3000);
      return;
    }
    const fn = ACT[b.dataset.act]; if (fn) fn(b.dataset, b, e);
  });
  document.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, id = f.id || f.dataset.form;
    if (id === 'ed-form') { const isNew = !draft.id, b = saveDraft(); if (b) { closeModal(); commit(); toast(isNew ? (b.start != null ? `Added at ${hh(b.start)}.` : 'Added to the list.') : 'Saved.'); } return; }
    if (id === 'setup-form') {
      const m = $('#su-mock').value, g = $('#su-gcse').value, n = addPicked();
      if (m) state.exams.push({ id: uid(), name: 'Mocks start', date: m });
      if (g) state.exams.push({ id: uid(), name: 'First GCSE exam', date: g });
      state.setupDone = true; closeModal(); state.ui.zoom = 'day'; cursor = today(); save(); go('plan');
      toast(n ? `${plural(n, 'subject')} added. Now write today's revision list.` : 'Setup saved.');
      setTimeout(() => { const i = $('#add-text'); if (i) i.focus(); }, 50);
      return;
    }
    if (id === 'add') {
      const i = $('#add-text'), v = i.value.trim(); if (!v) { i.focus(); return; }
      const n = addItems(f.dataset.k, v, Number($('#add-len').value)); i.value = ''; commit();
      const i2 = $('#add-text'); if (i2) i2.focus();
      if (n > 1) toast(`${plural(n, 'topic')} added.`);
      return;
    }
    if (id === 'qadd') {
      const i = f.querySelector('input'), v = i.value.trim(); if (!v) return;
      addItems(f.dataset.k, v); i.value = ''; commit();
      const i2 = document.getElementById('qa-' + f.dataset.k); if (i2) i2.focus(); return;
    }
    if (id === 'subj-form') { const i = $('#new-subj'), s = getSubject(i.value); i.value = ''; if (s) { commit(); toast(`${s.name} added.`); } return; }
    if (id === 'board-form') {
      const i = $('#bs-name'), v = i.value.trim(); if (!v) { toast('Give the board a name.'); return; }
      const nb = { id: uid(), name: v, subjectId: $('#bs-new-subj').value, cards: [] };
      state.boards.unshift(nb); state.ui.board = nb.id; i.value = ''; commit();
      const n = document.getElementById('la-ideas'); if (n) n.focus(); return;
    }
    if (id === 'card') {
      const b = curBoard(), i = f.querySelector('input'), v = i.value.trim(); if (!b || !v) return;
      b.cards.push({ id: uid(), text: v, lane: f.dataset.lane }); i.value = ''; commit();
      const n = document.getElementById('la-' + f.dataset.lane); if (n) n.focus(); return;
    }
    if (id === 'exam-form') {
      const n = $('#ex-name'), d = $('#ex-date');
      if (!n.value.trim() || !d.value) { toast('Add a name and a date.'); return; }
      state.exams.push({ id: uid(), name: n.value.trim(), date: d.value }); n.value = ''; d.value = ''; commit();
    }
  });
  function noteSave() {
    const ta = $('#flashnote'), st = $('#note-status'); if (!ta) return;
    if (st) st.textContent = 'Saving';
    clearTimeout(noteSave.t);
    noteSave.t = setTimeout(() => { state.note = ta.value; save(); const d = new Date(), s2 = $('#note-status'); if (s2) s2.textContent = `Saved at ${pad(d.getHours())}:${pad(d.getMinutes())}`; }, 350);
  }
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.id === 'flashnote') noteSave();
    else if ((el.id === 'ed-note' || el.id === 'ed-text') && draft) draft[el.dataset.ed] = el.value;
  });
  document.addEventListener('change', e => {
    const el = e.target, D = el.dataset;
    if (D.ed) { edChange(el); return; }
    if (el.id === 'day-pick') { if (el.value) { cursor = el.value; render(); } return; }
    if (D.set) {
      const S = state.settings, v = Number(el.value); if (!isFinite(v)) return;
      S[D.set] = v;
      S.dayStart = clamp(Math.round(S.dayStart), 4, 12); S.dayEnd = clamp(Math.round(S.dayEnd), Math.max(15, S.dayStart + 4), 24);
      S.wdFrom = clamp(S.wdFrom, S.dayStart, S.dayEnd - 1); S.wdTo = clamp(S.wdTo, S.wdFrom + 1, S.dayEnd);
      S.weFrom = clamp(S.weFrom, S.dayStart, S.dayEnd - 1); S.weTo = clamp(S.weTo, S.weFrom + 1, S.dayEnd);
      S.target = clamp(Math.round(S.target), 1, 80);
      save(); if (!$('#setup-form')) render(); return;
    }
    if (D.subj) {
      const s = subj(D.subj); if (!s) return; const v = el.value.trim();
      if (D.f === 'name') { if (v) s.name = v; }
      else if (!v) { if (!s.sme || !s.sme.questions) s.sme = { notes: SME, generic: true }; }
      else if (!s.sme || v !== s.sme.notes) { let u = v; if (!/^https?:\/\//i.test(u)) u = 'https://' + u; try { new URL(u); s.sme = { notes: u }; } catch (err) { toast('That link does not look right.'); return; } }
      commit(); return;
    }
    if (D.exam) { const x = state.exams.find(z => z.id === D.exam); if (x) { const v = el.value.trim(); if (v) x[D.f] = v; commit(); } return; }
    if (D.tm) {
      const T = state.timer, lim = { focus: [1, 180], short: [1, 60], long: [1, 90], every: [2, 8] }[D.tm];
      let v = Math.round(Number(el.value)); if (!isFinite(v)) v = T[D.tm];
      T[D.tm] = clamp(v, lim[0], lim[1]); if (!T.running) T.left = tlen(T.mode); commit(); return;
    }
    if (el.id === 'tm-on') {
      const T = state.timer, [t, id] = el.value.split(':');
      if (t === 'b') linkTimer(id, today()); else { T.blockId = ''; T.blockDate = ''; T.subjectId = t === 's' ? id : ''; save(); }
      render(); return;
    }
    if (el.id === 'log-toggle') { state.timer.log = el.checked; save(); toast(el.checked ? 'Focus time will be logged.' : 'Logging is off. Focus time will not count.'); return; }
    if (el.id === 'sound-toggle') { state.timer.sound = el.checked; save(); if (el.checked) beep(); return; }
    if (el.id === 'bs-subj') { const b = curBoard(); if (b) { b.subjectId = el.value; commit(); } }
  });
  document.addEventListener('focusout', e => {
    const el = e.target; if (!el.dataset || !el.dataset.edit) return;
    const b = curBoard(), c = b && b.cards.find(x => x.id === el.dataset.edit); if (!c) return;
    const v = el.textContent.trim();
    if (v && v !== c.text) { c.text = v; save(); } else if (!v) el.textContent = c.text;
  });
  document.addEventListener('keydown', e => {
    const el = e.target, typing = el.closest && el.closest('input, textarea, select, [contenteditable="true"]');
    const modalOpen = !$('#modal').hidden;
    if (e.key === 'Escape') {
      if (modalOpen) { closeModal(); return; }
      if (document.body.classList.contains('zen')) { document.body.classList.remove('zen'); return; }
      $$('details.more[open]').forEach(d => { d.open = false; });
      if (typing) el.blur();
      return;
    }
    if (el.id === 'new-subj-inline' && e.key === 'Enter') { e.preventDefault(); ACT['subj-create'](); return; }
    if (el.id === 'ed-newsubj' && e.key === 'Enter') { e.preventDefault(); ACT['ed-subj-create'](); return; }
    if (el.dataset && el.dataset.edit && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.blur(); return; }
    if (typing || e.metaKey || e.ctrlKey || e.altKey || modalOpen) return;
    if (el.matches && el.matches('[role="button"][data-act]') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); el.click(); return; }
    if (/^[1-4]$/.test(e.key)) { go(PAGES[Number(e.key) - 1][0]); return; }
    if (page === 'focus' && e.key === ' ') { e.preventDefault(); ACT['tm-start'](); return; }
    if (page === 'plan') {
      const k = e.key.toLowerCase();
      if (e.key === 'ArrowLeft') shift(-1); else if (e.key === 'ArrowRight') shift(1);
      else if (k === 'd' || k === 'w' || k === 'm') { state.ui.zoom = { d: 'day', w: 'week', m: 'month' }[k]; save(); render(); }
      else if (k === 't') { cursor = today(); render(); }
      else if (k === 'n' || e.key === '/') { const i = $('#add-text'); if (i) { e.preventDefault(); i.focus(); } }
    }
  });

  /* drag and drop: plan items and brainstorm cards */
  document.addEventListener('dragstart', e => {
    const t = e.target; if (!t.closest) return;
    const it = t.closest('[data-drag]');
    if (it) {
      if (e.target.closest('[data-resize]')) { e.preventDefault(); return; }
      dragInfo = { type: 'item', id: it.dataset.id, k: it.dataset.k }; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', it.dataset.id);
      setTimeout(() => { it.classList.add('dragging'); document.body.classList.add('is-dragging'); }, 0); return;
    }
    const card = t.closest('[data-card]');
    if (card) { dragInfo = { type: 'card', id: card.dataset.card }; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', card.dataset.card); card.classList.add('dragging'); }
  });
  document.addEventListener('dragover', e => {
    if (!dragInfo) return;
    const tgt = dragInfo.type === 'item' ? (e.target.closest('.tt-slot') || e.target.closest('[data-droplist]')) : e.target.closest('.lane');
    $$('.drop').forEach(x => { if (x !== tgt) x.classList.remove('drop'); });
    if (tgt) { e.preventDefault(); tgt.classList.add('drop'); }
  });
  document.addEventListener('drop', e => {
    if (!dragInfo) return;
    e.preventDefault();
    const info = dragInfo; dragInfo = null; document.body.classList.remove('is-dragging');
    if (info.type === 'item') {
      const b = blockById(info.id); if (!b) { render(); return; }
      const slot = e.target.closest('.tt-slot'), list = e.target.closest('[data-droplist]');
      if (!slot && !list) { render(); return; }
      snap();
      const ok = slot ? moveItem(b, info.k, slot.dataset.k, Number(slot.dataset.h)) : moveItem(b, info.k, list.dataset.k, null);
      if (ok) { commit(); toast(slot ? `Moved to ${hh(b.start)}.` : list.dataset.k === info.k ? 'Back on the list without a time.' : `Moved to ${fmt(list.dataset.k, { weekday: 'short', day: 'numeric', month: 'short' })}.`, 'Undo', undo); }
      else render();
      return;
    }
    const lane = e.target.closest('.lane'), b = curBoard(), c = b && b.cards.find(x => x.id === info.id);
    if (lane && c) { c.lane = lane.dataset.lane; commit(); } else render();
  });
  document.addEventListener('dragend', () => {
    dragInfo = null; document.body.classList.remove('is-dragging');
    $$('.drop').forEach(x => x.classList.remove('drop')); $$('.dragging').forEach(x => x.classList.remove('dragging'));
  });

  /* resize sessions on the day timeline by dragging their bottom edge */
  document.addEventListener('pointerdown', e => {
    const h = e.target.closest && e.target.closest('[data-resize]'); if (!h) return;
    const el = h.closest('.tt-block'), b = blockById(el.dataset.id), k = el.dataset.k; if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const slot = $('.tt-day .tt-slot'), rowH = slot ? slot.getBoundingClientRect().height : 32;
    const y0 = e.clientY, len0 = b.len, S = state.settings;
    const rowStart = Math.round((b.start - S.dayStart) * 2) + 1;
    let len = len0;
    const move = ev => {
      let n = clamp(len0 + Math.round((ev.clientY - y0) / rowH) * 0.5, 0.5, S.dayEnd - b.start);
      while (n > 0.5 && clashes(k, b.start, n, b.id).length) n -= 0.5;
      if (n !== len) { len = n; el.style.gridRow = `${rowStart} / span ${Math.round(len * 2)}`; el.classList.toggle('short', len <= 0.5); const tm = el.querySelector('.b-time'); if (tm) tm.firstChild.textContent = `${hh(b.start)}–${hh(b.start + len)}`; }
    };
    const up = () => {
      document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
      justResized = true; setTimeout(() => { justResized = false; }, 250);
      if (len !== len0) { snap(); b.len = len; commit(); toast(`Now ${fmtLen(len)}.`, 'Undo', undo); }
    };
    document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
  });

  window.addEventListener('hashchange', route);

  /* ---------- boot ---------- */
  document.body.insertAdjacentHTML('afterbegin', shellHTML());
  route();
  save();
  if (!state.subjects.length && !state.blocks.length && !state.setupDone) openSetup();
})();

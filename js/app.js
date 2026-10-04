(() => {
  'use strict';

  const D = window.TCT_DATA;
  const STORAGE_KEY = 'tinchi-tracker:v1';

  // ---------- State ----------
  const state = {
    program: 'ktpm',
    checked: {},     // code -> true
    custom: [],      // [{ code, name, tc }] — học phần tự thêm, tính vào tự chọn tự do
    collapsed: {},   // groupId -> true
    filter: 'all',
    query: '',
    freeQuery: '',
  };

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved === 'object') {
        if (D.PROGRAMS[saved.program]?.available) state.program = saved.program;
        state.checked = saved.checked || {};
        state.custom = Array.isArray(saved.custom) ? saved.custom : [];
        state.collapsed = saved.collapsed || {};
      }
    } catch { /* storage unavailable — start fresh */ }
  }

  function save() {
    try {
      const { program, checked, custom, collapsed } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ program, checked, custom, collapsed }));
    } catch { /* ignore */ }
  }

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const course = (code) => D.COURSES[code] || state.custom.find((c) => c.code === code);
  const has = (code) => !!state.checked[code];
  const sumTc = (codes) => codes.reduce((s, c) => s + (has(c) ? course(c).tc : 0), 0);
  const countDone = (codes) => codes.filter(has).length;
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const pct = (a, b) => (b ? Math.min(100, Math.round((a / b) * 100)) : 0);

  const program = () => D.PROGRAMS[state.program];

  // ---------- Credit engine ----------
  function computeGroups(block) {
    const groups = block.groups.map((g) => {
      const required = g.rule.kind === 'all' ? g.courses.reduce((s, c) => s + course(c).tc, 0) : g.rule.credits;
      const earned = sumTc(g.courses);
      const counted = Math.min(earned, required);
      return { ...g, required, earned, counted, surplus: earned - counted, done: earned >= required };
    });
    const counted = Math.min(block.credits, groups.reduce((s, g) => s + g.counted, 0));
    const surplus = groups.reduce((s, g) => s + g.surplus, 0);
    return { id: block.id, title: block.title, required: block.credits, counted, surplus, groups };
  }

  function computeGraduation(grad) {
    const options = grad.options.map((o) => {
      const parts = o.parts.map((p) => {
        const earned = sumTc(p.courses);
        return { ...p, earned, counted: Math.min(earned, p.credits), done: earned >= p.credits };
      });
      const progress = parts.reduce((s, p) => s + p.counted, 0);
      return { ...o, parts, progress, done: parts.every((p) => p.done) };
    });
    const best = options.reduce((a, b) => (b.progress > a.progress ? b : a), options[0]);
    const allCodes = [...new Set(grad.options.flatMap((o) => o.parts.flatMap((p) => p.courses)))];
    const counted = Math.min(grad.credits, best.progress);
    const overflow = sumTc(allCodes) - counted; // phần dư chuyển sang tự chọn tự do
    return { id: 'graduation', title: grad.title, required: grad.credits, counted, overflow, options, best: best.progress > 0 ? best.id : null };
  }

  function computeMajor(major, gradOverflow) {
    const { core, elective, free } = major;

    const coreTc = sumTc(core.courses);
    const coreN = countDone(core.courses);
    const coreCounted = Math.min(coreTc, core.minCredits);
    const coreOverTc = coreTc - coreCounted;
    const coreOverN = Math.max(0, coreN - core.minCourses);

    const elecTc = sumTc(elective.courses) + coreOverTc;
    const elecN = countDone(elective.courses) + coreOverN;
    const elecCounted = Math.min(elecTc, elective.minCredits);
    const elecOverTc = elecTc - elecCounted;

    const freeRequired = major.credits - core.minCredits - elective.minCredits;
    const freeCodes = [...free.courses, ...state.custom.map((c) => c.code)];
    const freeOwnTc = sumTc(freeCodes);
    const freePool = freeOwnTc + elecOverTc + gradOverflow;
    const freeCounted = Math.min(freePool, freeRequired);

    return {
      id: 'major', title: major.title, required: major.credits,
      counted: coreCounted + elecCounted + freeCounted,
      surplus: freePool - freeCounted,
      core: { ...core, earned: coreTc, n: coreN, counted: coreCounted, done: coreTc >= core.minCredits && coreN >= core.minCourses },
      elective: { ...elective, earned: elecTc, n: elecN, counted: elecCounted, carried: coreOverTc, done: elecTc >= elective.minCredits && elecN >= elective.minCourses },
      free: { ...free, required: freeRequired, own: freeOwnTc, carried: elecOverTc + gradOverflow, pool: freePool, counted: freeCounted, done: freePool >= freeRequired },
    };
  }

  function compute() {
    const p = program();
    const general = computeGroups(D.GENERAL);
    const foundation = computeGroups(D.FOUNDATION);
    const graduation = computeGraduation(p.graduation);
    const major = computeMajor(p.major, graduation.overflow);
    const blocks = [general, foundation, major, graduation];
    const counted = blocks.reduce((s, b) => s + b.counted, 0);
    const surplus = general.surplus + foundation.surplus + major.surplus;
    const conditions = D.CONDITIONS.courses.map((c) => ({ code: c, done: has(c) }));
    return { blocks, general, foundation, major, graduation, counted, surplus, total: D.TOTAL_CREDITS, conditions };
  }

  // ---------- Icons ----------
  const ICON = {
    check: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>',
    chevron: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    cap: '<svg viewBox="0 0 24 24"><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    flag: '<svg viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></svg>',
  };

  const BLOCK_META = {
    general: { tone: 'sky', short: 'Đại cương' },
    foundation: { tone: 'violet', short: 'Cơ sở ngành' },
    major: { tone: 'blue', short: 'Chuyên ngành' },
    graduation: { tone: 'emerald', short: 'Tốt nghiệp' },
  };

  // ---------- Render: summary ----------
  function renderSummary(r) {
    const remaining = Math.max(0, r.total - r.counted);
    const percent = pct(r.counted, r.total);
    const R = 52, C = 2 * Math.PI * R;
    const doneAll = remaining === 0 && r.conditions.every((c) => c.done);

    const condChips = r.conditions.map((c) => {
      const co = course(c.code);
      return `<button class="chip ${c.done ? 'is-done' : ''}" data-toggle="${c.code}" aria-pressed="${c.done}" title="${esc(co.name)} (${co.tc} TC)">
        <span class="chip-dot">${c.done ? ICON.check : ''}</span>${esc(co.name.replace('Giáo dục quốc phòng – An ninh', 'GDQP–AN'))}</button>`;
    }).join('');

    const blockCards = r.blocks.map((b) => {
      const m = BLOCK_META[b.id];
      const done = b.counted >= b.required;
      return `<a class="block-card tone-${m.tone} ${done ? 'is-done' : ''}" href="#block-${b.id}">
        <div class="block-card-top"><span class="dot"></span><span>${m.short}</span>${done ? `<span class="ok">${ICON.check}</span>` : ''}</div>
        <div class="block-card-num"><strong>${b.counted}</strong><span>/ ${b.required} TC</span></div>
        <div class="bar"><span style="width:${pct(b.counted, b.required)}%"></span></div>
      </a>`;
    }).join('');

    $('#summary').innerHTML = `
      <div class="hero card">
        <div class="ring" role="img" aria-label="Đã tích lũy ${r.counted} trên ${r.total} tín chỉ">
          <svg viewBox="0 0 120 120">
            <circle class="ring-track" cx="60" cy="60" r="${R}"/>
            <circle class="ring-fill" cx="60" cy="60" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - percent / 100)}"/>
          </svg>
          <div class="ring-label"><strong>${percent}%</strong><span>hoàn thành</span></div>
        </div>
        <div class="hero-body">
          <h1 class="hero-title">${doneAll ? `<span class="celebrate" aria-hidden="true">${ICON.cap}</span>Đủ điều kiện tín chỉ để tốt nghiệp` : `Còn <em>${remaining}</em> tín chỉ nữa để tốt nghiệp`}</h1>
          <p class="hero-sub">Ngành <b>${esc(program().name)}</b> · yêu cầu ${r.total} TC (không kể GDTC, GDQP)</p>
          <div class="stats">
            <div class="stat"><span class="stat-label">Đã tích lũy</span><span class="stat-value">${r.counted}<small> TC</small></span></div>
            <div class="stat"><span class="stat-label">Còn thiếu</span><span class="stat-value ${remaining ? 'warn' : 'good'}">${remaining}<small> TC</small></span></div>
            <div class="stat" title="Tín chỉ đã học vượt quá yêu cầu của nhóm (không tính thêm vào 138 TC)"><span class="stat-label">Dư</span><span class="stat-value muted">${r.surplus}<small> TC</small></span></div>
          </div>
          <div class="conditions"><span class="conditions-label">GDTC & GDQP</span>${condChips}</div>
        </div>
      </div>
      <nav class="block-cards" aria-label="Khối kiến thức">${blockCards}</nav>`;
  }

  // ---------- Render: course rows ----------
  function matches(code) {
    const co = course(code);
    if (state.filter === 'done' && !has(code)) return false;
    if (state.filter === 'todo' && has(code)) return false;
    if (state.query) {
      const q = norm(state.query);
      if (!norm(co.code).includes(q) && !norm(co.name).includes(q)) return false;
    }
    return true;
  }

  function courseRow(code, { removable = false } = {}) {
    const co = course(code);
    const done = has(code);
    const hk = program().plan?.[code] ?? D.COMMON_PLAN[code];
    return `<li class="course ${done ? 'is-done' : ''}" data-name="${esc(norm(co.code + ' ' + co.name))}">
      <label>
        <input type="checkbox" data-code="${esc(code)}" ${done ? 'checked' : ''}>
        <span class="box" aria-hidden="true">${ICON.check}</span>
        <span class="course-main">
          <span class="course-name">${esc(co.name)}</span>
          <span class="course-meta"><span class="code">${esc(co.code)}</span>${hk ? `<span class="hk">HK${hk}</span>` : ''}${removable ? '<span class="hk custom">tự thêm</span>' : ''}</span>
        </span>
        <span class="tc">${co.tc}<small>TC</small></span>
      </label>
      ${removable ? `<button class="row-remove" data-remove="${esc(code)}" aria-label="Xóa ${esc(co.name)}">${ICON.x}</button>` : ''}
    </li>`;
  }

  function courseList(codes, opts) {
    const visible = codes.filter(matches);
    if (!visible.length) return '';
    return `<ul class="course-list">${visible.map((c) => courseRow(c, opts)).join('')}</ul>`;
  }

  function statusPill(done, text) {
    return `<span class="pill ${done ? 'is-done' : ''}">${done ? ICON.check : ''}${text}</span>`;
  }

  function groupCard({ id, title, rule, hint, progress, done, body, extraClass = '' }) {
    const collapsed = !!state.collapsed[id] && !state.query;
    return `<article class="group card ${extraClass} ${collapsed ? 'is-collapsed' : ''}" data-group="${id}">
      <button class="group-head" data-collapse="${id}" aria-expanded="${!collapsed}">
        <span class="group-title">
          <span class="group-name">${esc(title)}</span>
          <span class="group-rule">${rule}</span>
        </span>
        ${statusPill(done, progress)}
        <span class="chev">${ICON.chevron}</span>
      </button>
      <div class="group-body">
        ${hint ? `<p class="hint">${ICON.info}<span>${hint}</span></p>` : ''}
        ${body}
      </div>
    </article>`;
  }

  function blockSection(b, inner) {
    const m = BLOCK_META[b.id];
    const done = b.counted >= b.required;
    return `<section class="block tone-${m.tone}" id="block-${b.id}">
      <header class="block-head">
        <h2><span class="dot"></span>${esc(b.title)}</h2>
        <span class="block-progress ${done ? 'is-done' : ''}"><b>${b.counted}</b> / ${b.required} TC</span>
      </header>
      <div class="group-grid">${inner}</div>
    </section>`;
  }

  function renderGroupsBlock(b) {
    const inner = b.groups.map((g) => {
      const list = courseList(g.courses);
      if (!list && (state.query || state.filter !== 'all')) return '';
      const rule = g.rule.kind === 'all' ? 'Bắt buộc' : g.rule.label;
      const extra = g.surplus > 0 ? ` <span class="surplus">+${g.surplus} dư</span>` : '';
      return groupCard({
        id: `${b.id}-${g.id}`, title: g.title, rule: rule + extra,
        progress: `${g.counted}/${g.required} TC`, done: g.done,
        body: list || '<p class="empty">Không có học phần phù hợp.</p>',
      });
    }).join('');
    return blockSection(b, inner);
  }

  function renderMajor(m) {
    const filtering = state.query || state.filter !== 'all';
    const parts = [];

    const coreList = courseList(m.core.courses);
    if (coreList || !filtering) {
      parts.push(groupCard({
        id: 'major-core', title: m.core.title,
        rule: `≥ ${m.core.minCourses} môn · ≥ ${m.core.minCredits} TC`,
        progress: `${m.core.n}/${m.core.minCourses} môn · ${m.core.counted}/${m.core.minCredits} TC`,
        done: m.core.done, body: coreList || '<p class="empty">Không có học phần phù hợp.</p>',
      }));
    }

    const elecList = courseList(m.elective.courses);
    if (elecList || !filtering) {
      const carried = m.elective.carried ? ` (gồm ${m.elective.carried} TC chuyển từ bắt buộc)` : '';
      parts.push(groupCard({
        id: 'major-elective', title: m.elective.title,
        rule: `≥ ${m.elective.minCourses} môn · ≥ ${m.elective.minCredits} TC`,
        hint: m.elective.hint + carried,
        progress: `${m.elective.counted}/${m.elective.minCredits} TC`,
        done: m.elective.done, body: elecList || '<p class="empty">Không có học phần phù hợp.</p>',
      }));
    }

    // Tự chọn tự do: môn đã chọn hiển thị trước, danh mục còn lại có ô tìm kiếm riêng.
    const customCodes = state.custom.map((c) => c.code);
    const picked = m.free.courses.filter(has);
    const rest = m.free.courses.filter((c) => !has(c));
    const pickedList = [...picked.filter(matches).map((c) => courseRow(c)), ...customCodes.filter(matches).map((c) => courseRow(c, { removable: true }))].join('');
    const restVisible = state.filter === 'done' ? [] : rest.filter(matches);
    const carried = m.free.carried ? ` Đang nhận ${m.free.carried} TC chuyển từ các nhóm khác.` : '';

    const freeBody = `
      ${pickedList ? `<ul class="course-list">${pickedList}</ul>` : ''}
      ${restVisible.length ? `
        <div class="catalog">
          <label class="search search-sm">
            ${ICON.search}
            <input type="search" id="freeSearch" placeholder="Tìm trong ${rest.length} học phần tự chọn tự do…" value="${esc(state.freeQuery)}" autocomplete="off">
          </label>
          <ul class="course-list catalog-list" id="freeCatalog">${restVisible.map((c) => courseRow(c)).join('')}</ul>
          <p class="empty" id="freeEmpty" hidden>Không tìm thấy — hãy thêm học phần ngoài danh sách bên dưới.</p>
        </div>` : ''}
      <details class="add-custom">
        <summary>${ICON.plus} Thêm học phần ngoài danh sách</summary>
        <form id="customForm" class="custom-form">
          <input name="code" placeholder="Mã HP (tùy chọn)" maxlength="16">
          <input name="name" placeholder="Tên học phần" required maxlength="120">
          <input name="tc" type="number" placeholder="TC" min="1" max="15" required>
          <button type="submit" class="btn-primary">Thêm</button>
        </form>
      </details>`;

    if (pickedList || restVisible.length || !filtering) {
      parts.push(groupCard({
        id: 'major-free', title: m.free.title,
        rule: `Bù cho đủ ${m.required} TC chuyên ngành`,
        hint: m.free.hint + carried,
        progress: `${m.free.counted}/${m.free.required} TC`,
        done: m.free.done, body: freeBody, extraClass: 'span-2',
      }));
    }
    return blockSection(m, parts.join(''));
  }

  function renderGraduation(g) {
    const filtering = state.query || state.filter !== 'all';
    const inner = g.options.map((o) => {
      const body = o.parts.map((p) => {
        const list = courseList(p.courses);
        if (!list) return '';
        return `${p.label ? `<div class="part-label"><span>${p.label}</span>${statusPill(p.done, `${p.counted}/${p.credits} TC`)}</div>` : ''}${list}`;
      }).join('');
      if (!body && filtering) return '';
      const active = g.best === o.id;
      return groupCard({
        id: `grad-${o.id}`, title: o.title,
        rule: active ? `${ICON.flag} Phương án đang theo` : 'Chọn 1 trong 3 phương án',
        progress: `${o.progress}/${g.required} TC`, done: o.done,
        body: body || '<p class="empty">Không có học phần phù hợp.</p>',
        extraClass: active ? 'is-active' : '',
      });
    }).join('');
    const note = g.overflow > 0 ? `<p class="block-note">${ICON.info}<span>${g.overflow} TC tốt nghiệp học thêm được chuyển sang <a href="#block-major">Tự chọn tự do</a>.</span></p>` : '';
    return blockSection(g, inner).replace('</header>', `</header>${note}`);
  }

  function renderContent(r) {
    const scrolls = [...document.querySelectorAll('.catalog-list')].map((el) => el.scrollTop);
    $('#content').innerHTML = [
      renderGroupsBlock(r.general),
      renderGroupsBlock(r.foundation),
      renderMajor(r.major),
      renderGraduation(r.graduation),
    ].join('');
    document.querySelectorAll('.catalog-list').forEach((el, i) => { el.scrollTop = scrolls[i] || 0; });
    applyFreeSearch();
  }

  function applyFreeSearch() {
    const list = $('#freeCatalog');
    if (!list) return;
    const q = norm(state.freeQuery.trim());
    let shown = 0;
    list.querySelectorAll('.course').forEach((li) => {
      const ok = !q || li.dataset.name.includes(q);
      li.hidden = !ok;
      if (ok) shown++;
    });
    $('#freeEmpty').hidden = shown > 0;
  }

  function render() {
    const r = compute();
    renderSummary(r);
    renderContent(r);
    document.querySelectorAll('.segmented button').forEach((b) => {
      b.setAttribute('aria-checked', String(b.dataset.filter === state.filter));
    });
  }

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  // ---------- Events ----------
  function toggle(code, value) {
    if (value ?? !has(code)) state.checked[code] = true;
    else delete state.checked[code];
    save();
    render();
  }

  function bind() {
    const sel = $('#programSelect');
    sel.innerHTML = Object.entries(D.PROGRAMS).map(([id, p]) =>
      `<option value="${id}" ${p.available ? '' : 'disabled'}>${esc(p.name)}${p.available ? '' : ' (sắp có)'}</option>`).join('');
    sel.value = state.program;
    sel.addEventListener('change', () => { state.program = sel.value; save(); render(); });

    $('#programInfo').textContent = D.PROGRAM_INFO;

    document.addEventListener('change', (e) => {
      const cb = e.target.closest('input[type=checkbox][data-code]');
      if (cb) toggle(cb.dataset.code, cb.checked);
    });

    document.addEventListener('click', (e) => {
      const t = e.target;
      const chip = t.closest('[data-toggle]');
      if (chip) return toggle(chip.dataset.toggle);

      const col = t.closest('[data-collapse]');
      if (col) {
        const id = col.dataset.collapse;
        if (state.collapsed[id]) delete state.collapsed[id]; else state.collapsed[id] = true;
        save();
        col.closest('.group').classList.toggle('is-collapsed');
        col.setAttribute('aria-expanded', String(!state.collapsed[id]));
        return;
      }

      const rm = t.closest('[data-remove]');
      if (rm) {
        const code = rm.dataset.remove;
        state.custom = state.custom.filter((c) => c.code !== code);
        delete state.checked[code];
        save(); render(); toast('Đã xóa học phần tự thêm');
        return;
      }

      const seg = t.closest('.segmented button');
      if (seg) { state.filter = seg.dataset.filter; render(); return; }

      // Menu
      const menuBtn = t.closest('#menuBtn');
      const panel = $('#menuPanel');
      if (menuBtn) {
        panel.hidden = !panel.hidden;
        menuBtn.setAttribute('aria-expanded', String(!panel.hidden));
        return;
      }
      const action = t.closest('[data-action]');
      if (action) {
        panel.hidden = true;
        $('#menuBtn').setAttribute('aria-expanded', 'false');
        handleAction(action.dataset.action);
        return;
      }
      if (!t.closest('.menu')) { panel.hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { $('#menuPanel').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); }
    });

    $('#searchInput').addEventListener('input', (e) => { state.query = e.target.value.trim(); renderContent(compute()); });

    document.addEventListener('input', (e) => {
      if (e.target.id === 'freeSearch') { state.freeQuery = e.target.value; applyFreeSearch(); }
    });

    document.addEventListener('submit', (e) => {
      if (e.target.id !== 'customForm') return;
      e.preventDefault();
      const f = new FormData(e.target);
      const name = String(f.get('name')).trim();
      const tc = Math.round(Number(f.get('tc')));
      if (!name || !(tc > 0)) return;
      let code = String(f.get('code')).trim().toUpperCase() || `TU-THEM-${Date.now().toString(36).toUpperCase()}`;
      if (course(code)) { toast(`Mã ${code} đã tồn tại`); return; }
      state.custom.push({ code, name, tc });
      state.checked[code] = true;
      save(); render(); toast(`Đã thêm “${name}” (${tc} TC)`);
    });

    $('#importFile').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!data || typeof data.checked !== 'object') throw new Error('bad');
        state.checked = data.checked;
        state.custom = Array.isArray(data.custom) ? data.custom : [];
        if (D.PROGRAMS[data.program]?.available) state.program = data.program;
        $('#programSelect').value = state.program;
        save(); render(); toast('Đã nhập dữ liệu');
      } catch { toast('File không hợp lệ'); }
    });
  }

  function handleAction(action) {
    if (action === 'export') {
      const blob = new Blob([JSON.stringify({ program: state.program, checked: state.checked, custom: state.custom, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `tinchi-tracker-${state.program}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast('Đã xuất file JSON');
    } else if (action === 'import') {
      $('#importFile').click();
    } else if (action === 'reset') {
      if (confirm('Xóa toàn bộ học phần đã đánh dấu? Thao tác này không thể hoàn tác.')) {
        state.checked = {}; state.custom = [];
        save(); render(); toast('Đã xóa tiến độ');
      }
    }
  }

  load();
  bind();
  render();
})();

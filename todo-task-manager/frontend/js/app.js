'use strict';
/* To-Do Task Manager – vanilla JS frontend. All data comes from the Spring Boot REST API (/api/tasks). */

/* ============ Constants & helpers ============ */
const API_BASE = '/api/tasks';
const LABEL = {
  priority: { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' },
  status: { PENDING: 'Pending', IN_PROGRESS: 'In progress', COMPLETED: 'Completed' },
  stage: { ASSIGNED: 'Assigned Tasks', ACCEPTED: 'Accepted Tasks', REVIEW: 'Review Tasks' }
};
const ICONS = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  stats: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 17v-5M12 17V8M16 17v-3"/>',
  pie: '<path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>',
  calendar: '<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  box: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M4 14h16M10 17.5h4"/><path d="M9 8h6"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>', left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
  plus: '<path d="M5 12h14M12 5v14"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/>',
  edit: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  eye: '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
  more: '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>'
};
const svg = (n, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = iso => { if (!iso) return '—'; const [y, m, d] = iso.slice(0, 10).split('-'); return `${d}/${m}/${y}`; };
const fmtDateTime = iso => iso ? new Date(iso).toLocaleString() : '—';
const isoDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const store = { get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } } };

/* ============ Centralised API helper ============ */
class ApiError extends Error {
  constructor(message, status, errors) { super(message); this.status = status; this.errors = errors || {}; }
}
const api = {
  async request(path = '', opts = {}) {
    let res;
    try {
      res = await fetch(API_BASE + path, { headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, ...opts });
    } catch {
      throw new ApiError('Cannot reach the server. Make sure the Spring Boot backend and MySQL are running.', 0);
    }
    if (res.status === 204) return null;
    let body = null;
    try { body = await res.json(); } catch { /* non-JSON body */ }
    if (!res.ok) throw new ApiError((body && body.message) || `Request failed (HTTP ${res.status})`, res.status, body && body.errors);
    return body;
  },
  list: params => api.request('?' + new URLSearchParams(params)),
  get: id => api.request(`/${id}`),
  create: data => api.request('', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => api.request(`/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  patchStatus: (id, status) => api.request(`/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  remove: id => api.request(`/${id}`, { method: 'DELETE' }),
  stats: () => api.request('/statistics')
};

/* ============ State ============ */
const state = {
  tab: 'ASSIGNED', page: 0, size: parseInt(store.get('tm.size', '10'), 10) || 10,
  search: '', status: '', date: '', sort: '', total: 0, totalPages: 0, tasks: [], editing: null, deleting: null
};

/* ============ UI utilities ============ */
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = 'toast ' + (type === 'error' ? 'error' : '');
  el.textContent = msg;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), type === 'error' ? 6000 : 3200);
}
function setLoading(on) { $('#loader').hidden = !on; $('#tableWrap').setAttribute('aria-busy', on); }
function showBanner(msg) { $('#bannerMsg').textContent = msg; $('#banner').hidden = false; }
function closeMenus() { $$('.menu').forEach(m => (m.hidden = true)); }
function openDialog(d) { closeMenus(); d.showModal(); }
function userName() { return store.get('tm.user', '').trim() || 'Me'; }

/* ============ Theme ============ */
function applyTheme(t) {
  document.documentElement.dataset.theme = t === 'dark' ? 'dark' : '';
  if (t !== 'dark') document.documentElement.removeAttribute('data-theme');
  $('#themeIcon').innerHTML = svg(t === 'dark' ? 'sun' : 'moon', 26);
  store.set('tm.theme', t);
}
const currentTheme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
const toggleTheme = () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');

/* ============ Loading & rendering tasks ============ */
async function loadTasks() {
  setLoading(true);
  try {
    const p = { page: state.page, size: state.size, stage: state.tab };
    if (state.search) p.search = state.search;
    if (state.status) p.status = state.status;
    if (state.date) p.dueDate = state.date;
    if (state.sort) p.sort = state.sort;
    const res = await api.list(p);
    if (state.page > 0 && res.content.length === 0 && res.totalPages > 0) { // current page vanished (e.g. last row deleted)
      state.page = res.totalPages - 1;
      return loadTasks();
    }
    state.tasks = res.content; state.total = res.totalElements; state.totalPages = res.totalPages;
    $('#banner').hidden = true;
    renderTable();
  } catch (e) {
    state.tasks = []; state.total = 0; state.totalPages = 0;
    renderTable(); showBanner(e.message); toast(e.message, 'error');
  } finally { setLoading(false); }
}
async function loadStats() {
  try {
    const s = await api.stats();
    state.stats = s;
    $('#chips').innerHTML =
      `<span class="chip">Total<b>${s.total}</b></span><span class="chip">Pending<b>${s.pending}</b></span>` +
      `<span class="chip">In progress<b>${s.inProgress}</b></span><span class="chip">Completed<b>${s.completed}</b></span>` +
      `<span class="chip od">Overdue<b>${s.overdue}</b></span>`;
    $('#bellDot').hidden = s.overdue === 0;
  } catch { $('#chips').innerHTML = ''; }
}
const refresh = () => { loadTasks(); loadStats(); };

function actionButtons(t) {
  const b = (cls, act, tip, icon) => `<button class="act ${cls}" data-act="${act}" title="${tip}" aria-label="${tip}">${svg(icon, 16)}</button>`;
  const done = t.status === 'COMPLETED';
  return b('view', 'view', 'View details', 'file') +
    (done ? b('eye', 'reopen', 'Reopen task (set In progress)', 'eye')
          : b('edit', 'edit', 'Edit task', 'edit') + b('del', 'delete', 'Delete task', 'trash')) +
    `<button class="act more" data-act="more" title="More actions" aria-label="More actions">${svg('more', 18)}</button>`;
}
function renderTable() {
  const body = $('#tbody');
  if (!state.tasks.length) {
    const filtered = state.search || state.status || state.date;
    body.innerHTML = `<tr><td class="empty" colspan="7">${filtered ? 'No tasks match your search or filters.' : `No tasks in “${LABEL.stage[state.tab]}” yet. Click “Create New Task” to add one.`}</td></tr>`;
  } else {
    body.innerHTML = state.tasks.map(t => `
      <tr class="${t.overdue ? 'overdue' : ''}" data-id="${t.id}">
        <td title="${esc(t.title)}">${esc(t.title)}</td>
        <td><span class="badge p-${t.priority.toLowerCase()}">${LABEL.priority[t.priority]}</span></td>
        <td><span class="badge s-${t.status.toLowerCase()}">${LABEL.status[t.status]}</span></td>
        <td>${esc(t.createdBy)}</td><td>${fmtDate(t.assignedDate)}</td>
        <td class="due">${fmtDate(t.dueDate)}${t.overdue ? '<span class="od">Overdue</span>' : ''}</td>
        <td><div class="actions">${actionButtons(t)}</div></td>
      </tr>`).join('');
  }
  const from = state.total ? state.page * state.size + 1 : 0;
  const to = Math.min((state.page + 1) * state.size, state.total);
  $('#range').textContent = state.total ? `${from}-${to} of ${state.total}` : '0 of 0';
  $('#prevBtn').disabled = state.page <= 0;
  $('#nextBtn').disabled = state.page + 1 >= state.totalPages;
  $$('th[data-sort]').forEach(th => {
    const [f, d] = state.sort.split(',');
    th.classList.toggle('asc', th.dataset.sort === f && d === 'asc');
    th.classList.toggle('desc', th.dataset.sort === f && d === 'desc');
  });
  $('#resetBtn').hidden = !(state.status || state.date || state.search);
}

/* ============ Create / edit form ============ */
const form = $('#taskForm');
function clearErrors() { $$('.err', form).forEach(e => (e.textContent = '')); $$('.invalid', form).forEach(e => e.classList.remove('invalid')); }
function showErrors(errs) {
  Object.entries(errs).forEach(([field, msg]) => {
    const el = $(`[data-err="${field}"]`, form); if (el) el.textContent = msg;
    const input = form.elements[field]; if (input) input.classList.add('invalid');
  });
}
function validate(d) {
  const e = {};
  if (!d.title) e.title = 'Task title is required';
  else if (d.title.length > 150) e.title = 'Title must be at most 150 characters';
  if (d.description.length > 2000) e.description = 'Description must be at most 2000 characters';
  if (!d.dueDate || isNaN(Date.parse(d.dueDate))) e.dueDate = 'Please choose a valid due date';
  if (!['LOW', 'MEDIUM', 'HIGH'].includes(d.priority)) e.priority = 'Invalid priority';
  if (!['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(d.status)) e.status = 'Invalid status';
  return e;
}
function openForm(task) {
  state.editing = task || null;
  form.reset(); clearErrors();
  $('#formTitle').textContent = task ? 'Edit Task' : 'Create New Task';
  $('#saveBtn').textContent = task ? 'Update Task' : 'Save Task';
  form.elements.title.value = task ? task.title : '';
  form.elements.description.value = task ? task.description || '' : '';
  form.elements.dueDate.value = task ? task.dueDate : isoDate(new Date());
  form.elements.priority.value = task ? task.priority : 'MEDIUM';
  form.elements.status.value = task ? task.status : 'PENDING';
  form.elements.stage.value = task ? task.stage : state.tab;
  openDialog($('#taskDialog'));
  form.elements.title.focus();
}
form.addEventListener('submit', async ev => {
  ev.preventDefault(); clearErrors();
  const f = form.elements;
  const data = { title: f.title.value.trim(), description: f.description.value.trim(), dueDate: f.dueDate.value,
    priority: f.priority.value, status: f.status.value, stage: f.stage.value };
  const errs = validate(data);
  if (Object.keys(errs).length) { showErrors(errs); return; }
  const btn = $('#saveBtn'); btn.disabled = true;
  try {
    if (state.editing) { await api.update(state.editing.id, data); toast('Task updated successfully'); }
    else { data.createdBy = userName(); await api.create(data); toast('Task created successfully'); }
    $('#taskDialog').close();
    if (data.stage !== state.tab && !state.editing) setTab(data.stage, false);
    refresh();
  } catch (e) {
    if (e.errors) showErrors(e.errors);
    toast(e.message, 'error');
  } finally { btn.disabled = false; }
});

/* ============ Details / delete / status ============ */
function showDetails(t) {
  $('#detailsBody').innerHTML = `<dl class="dl">
    <dt>Title</dt><dd>${esc(t.title)}</dd>
    <dt>Description</dt><dd>${esc(t.description) || '—'}</dd>
    <dt>Priority</dt><dd><span class="badge p-${t.priority.toLowerCase()}">${LABEL.priority[t.priority]}</span></dd>
    <dt>Status</dt><dd><span class="badge s-${t.status.toLowerCase()}">${LABEL.status[t.status]}</span>${t.overdue ? ' <span class="badge p-high">Overdue</span>' : ''}</dd>
    <dt>Task list</dt><dd>${LABEL.stage[t.stage]}</dd>
    <dt>Created by</dt><dd>${esc(t.createdBy)}</dd>
    <dt>Created</dt><dd>${fmtDateTime(t.createdAt)}</dd>
    <dt>Date assigned</dt><dd>${fmtDate(t.assignedDate)}</dd>
    <dt>Due date</dt><dd>${fmtDate(t.dueDate)}</dd>
    <dt>Last updated</dt><dd>${fmtDateTime(t.updatedAt)}</dd></dl>`;
  openDialog($('#detailsDialog'));
}
function askDelete(t) {
  state.deleting = t;
  $('#confirmText').textContent = `“${t.title}” will be permanently deleted. This cannot be undone.`;
  openDialog($('#confirmDialog'));
}
$('#confirmBtn').addEventListener('click', async () => {
  const t = state.deleting; if (!t) return;
  const btn = $('#confirmBtn'); btn.disabled = true;
  try { await api.remove(t.id); toast('Task deleted successfully'); $('#confirmDialog').close(); refresh(); }
  catch (e) { toast(e.message, 'error'); }
  finally { btn.disabled = false; state.deleting = null; }
});
async function changeStatus(t, status) {
  try { await api.patchStatus(t.id, status); toast(`Status changed to ${LABEL.status[status]}`); refresh(); }
  catch (e) { toast(e.message, 'error'); }
}

/* ============ Row actions & "more" menu ============ */
$('#tbody').addEventListener('click', ev => {
  const btn = ev.target.closest('[data-act]'); if (!btn) return;
  const t = state.tasks.find(x => x.id === Number(btn.closest('tr').dataset.id)); if (!t) return;
  switch (btn.dataset.act) {
    case 'view': showDetails(t); break;
    case 'edit': openForm(t); break;
    case 'delete': askDelete(t); break;
    case 'reopen': changeStatus(t, 'IN_PROGRESS'); break;
    case 'more': openMore(t, btn); break;
  }
});
function openMore(t, anchor) {
  const menu = $('#moreMenu');
  const items = ['PENDING', 'IN_PROGRESS', 'COMPLETED'].filter(s => s !== t.status)
    .map(s => `<button data-status="${s}">Mark as ${LABEL.status[s]}</button>`).join('');
  menu.innerHTML = `<button data-more="view">View details</button>${items}`;
  menu.hidden = false;
  const r = anchor.getBoundingClientRect();
  menu.style.left = Math.max(8, Math.min(r.right - menu.offsetWidth, window.innerWidth - menu.offsetWidth - 8)) + 'px';
  menu.style.top = Math.min(r.bottom + 6, window.innerHeight - menu.offsetHeight - 8) + 'px';
  menu.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    menu.hidden = true;
    if (b.dataset.more === 'view') showDetails(t); else changeStatus(t, b.dataset.status);
  };
}

/* ============ Tabs, filters, search, sorting, pagination ============ */
function setTab(tab, load = true) {
  state.tab = tab; state.page = 0;
  $$('.tab').forEach(b => { const on = b.dataset.tab === tab; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
  if (load) loadTasks();
}
$$('.tab').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));

function syncFilterUi() {
  $('#dateFilter').value = state.date;
  $('#statusFilter').value = state.status;
  $('#statusFilter').classList.toggle('set', !!state.status);
  const has = !!state.date;
  $('.field.date').classList.toggle('has', has);
  $('#datePh').textContent = has ? new Date(state.date + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Due date';
}
$('#dateFilter').addEventListener('change', e => { $('.field.date').classList.toggle('has', !!e.target.value); $('#datePh').textContent = e.target.value ? new Date(e.target.value + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Due date'; });
$('#statusFilter').addEventListener('change', e => e.target.classList.toggle('set', !!e.target.value));
$('#filterBtn').addEventListener('click', () => { state.date = $('#dateFilter').value; state.status = $('#statusFilter').value; state.page = 0; loadTasks(); });
$('#resetBtn').addEventListener('click', () => {
  state.date = ''; state.status = ''; state.search = ''; state.page = 0;
  $('#searchInput').value = ''; syncFilterUi(); loadTasks();
});

let searchTimer;
$('#searchBtn').addEventListener('click', () => {
  const s = $('#search'); const open = s.classList.toggle('open');
  if (open) $('#searchInput').focus();
});
$('#searchInput').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.search = e.target.value.trim(); state.page = 0; loadTasks(); }, 300);
});
$('#searchInput').addEventListener('keydown', e => { if (e.key === 'Escape') { e.target.value = ''; state.search = ''; $('#search').classList.remove('open'); state.page = 0; loadTasks(); } });

$$('th[data-sort]').forEach(th => th.addEventListener('click', () => {
  const f = th.dataset.sort; const [cf, cd] = state.sort.split(',');
  state.sort = cf === f ? (cd === 'asc' ? `${f},desc` : '') : `${f},asc`;
  state.page = 0; loadTasks();
}));
$('#sizeSelect').value = String(state.size);
$('#sizeSelect').addEventListener('change', e => { state.size = parseInt(e.target.value, 10); state.page = 0; loadTasks(); });
$('#prevBtn').addEventListener('click', () => { if (state.page > 0) { state.page--; loadTasks(); } });
$('#nextBtn').addEventListener('click', () => { if (state.page + 1 < state.totalPages) { state.page++; loadTasks(); } });
$('#createBtn').addEventListener('click', () => openForm(null));
$('#retryBtn').addEventListener('click', refresh);

/* ============ CSV export (all tasks) ============ */
async function exportCsv() {
  try {
    const rows = []; let page = 0, pages = 1;
    while (page < pages) { const r = await api.list({ page, size: 200, sort: 'id,asc' }); rows.push(...r.content); pages = r.totalPages; page++; }
    const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['ID', 'Title', 'Description', 'Priority', 'Status', 'Task list', 'Created by', 'Date assigned', 'Due date', 'Overdue', 'Created at', 'Updated at'];
    const lines = rows.map(t => [t.id, t.title, t.description, LABEL.priority[t.priority], LABEL.status[t.status], LABEL.stage[t.stage], t.createdBy, t.assignedDate, t.dueDate, t.overdue ? 'Yes' : 'No', t.createdAt, t.updatedAt].map(cell).join(','));
    const blob = new Blob(['\uFEFF' + [head.map(cell).join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `tasks-${isoDate(new Date())}.csv`;
    document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
    toast(`Exported ${rows.length} task(s) to CSV`);
  } catch (e) { toast(e.message, 'error'); }
}

/* ============ Statistics, calendar, settings dialogs ============ */
async function openStats() {
  await loadStats(); const s = state.stats || { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };
  $('#statGrid').innerHTML = [['Total tasks', s.total, ''], ['Pending', s.pending, ''], ['In progress', s.inProgress, ''], ['Completed', s.completed, ''], ['Overdue', s.overdue, 'od']]
    .map(([l, v, c]) => `<div class="stat ${c}"><span>${l}</span><b>${v}</b></div>`).join('');
  openDialog($('#statsDialog'));
}
const cal = { y: new Date().getFullYear(), m: new Date().getMonth() };
async function renderCalendar() {
  const first = new Date(cal.y, cal.m, 1), last = new Date(cal.y, cal.m + 1, 0), grid = $('#calGrid');
  $('#calLabel').textContent = first.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  grid.innerHTML = '<div class="hint" style="grid-column:1/-1">Loading…</div>';
  try {
    const r = await api.list({ size: 200, dueFrom: isoDate(first), dueTo: isoDate(last), sort: 'dueDate,asc' });
    const by = {}; r.content.forEach(t => (by[t.dueDate] = by[t.dueDate] || []).push(t));
    let html = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="cal-h">${d}</div>`).join('');
    for (let i = 0; i < first.getDay(); i++) html += '<div class="cal-d blank"></div>';
    for (let d = 1; d <= last.getDate(); d++) {
      const iso = isoDate(new Date(cal.y, cal.m, d)), list = by[iso] || [];
      html += `<button class="cal-d ${iso === isoDate(new Date()) ? 'today' : ''}" data-date="${iso}" aria-label="${iso}, ${list.length} task(s)">${d}` +
        list.slice(0, 2).map(t => `<i class="${t.overdue ? 'od' : ''}">${esc(t.title)}</i>`).join('') +
        (list.length > 2 ? `<i>+${list.length - 2} more</i>` : '') + '</button>';
    }
    grid.innerHTML = html;
  } catch (e) { grid.innerHTML = `<div class="hint" style="grid-column:1/-1">${esc(e.message)}</div>`; }
}
$('#calPrev').addEventListener('click', () => { cal.m--; if (cal.m < 0) { cal.m = 11; cal.y--; } renderCalendar(); });
$('#calNext').addEventListener('click', () => { cal.m++; if (cal.m > 11) { cal.m = 0; cal.y++; } renderCalendar(); });
$('#calGrid').addEventListener('click', e => {
  const b = e.target.closest('[data-date]'); if (!b) return;
  state.date = b.dataset.date; state.page = 0; syncFilterUi(); $('#calDialog').close(); loadTasks();
});
function openSettings() {
  $('#sName').value = store.get('tm.user', ''); $('#sRows').value = String(state.size); $('#sTheme').value = currentTheme();
  openDialog($('#settingsDialog'));
}
$('#settingsForm').addEventListener('submit', () => {
  store.set('tm.user', $('#sName').value.trim());
  const size = parseInt($('#sRows').value, 10);
  if (size !== state.size) { state.size = size; store.set('tm.size', String(size)); $('#sizeSelect').value = String(size); state.page = 0; loadTasks(); }
  applyTheme($('#sTheme').value); toast('Settings saved');
});

/* ============ Sidebar, header menus, dialogs ============ */
$$('.nav-btn').forEach(b => b.addEventListener('click', () => {
  const n = b.dataset.nav;
  if (n === 'home' || n === 'tasks') { $$('.nav-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  else if (n === 'stats') openStats();
  else if (n === 'reports') exportCsv();
  else if (n === 'calendar') { renderCalendar(); openDialog($('#calDialog')); }
  else if (n === 'theme') toggleTheme();
  else if (n === 'settings') openSettings();
}));
$('#bellBtn').addEventListener('click', async e => {
  e.stopPropagation(); const m = $('#bellMenu'); const wasHidden = m.hidden; closeMenus(); if (!wasHidden) return;
  m.hidden = false; m.innerHTML = '<div class="n-empty">Loading…</div>';
  try {
    const r = await api.list({ overdue: true, size: 5, sort: 'dueDate,asc' });
    m.innerHTML = r.content.length
      ? r.content.map(t => `<div class="n-item"><strong>${esc(t.title)}</strong><small>Overdue since ${fmtDate(t.dueDate)}</small></div>`).join('') + (r.totalElements > 5 ? `<div class="n-empty">+${r.totalElements - 5} more overdue</div>` : '')
      : '<div class="n-empty">You’re all caught up – no overdue tasks.</div>';
  } catch (err) { m.innerHTML = `<div class="n-empty">${esc(err.message)}</div>`; }
});
$('#avatarBtn').addEventListener('click', e => { e.stopPropagation(); const m = $('#userMenu'); const was = m.hidden; closeMenus(); m.hidden = !was; });
$('#userMenu').addEventListener('click', e => {
  const b = e.target.closest('[data-user]'); if (!b) return; closeMenus();
  ({ theme: toggleTheme, export: exportCsv, settings: openSettings })[b.dataset.user]();
});
document.addEventListener('click', e => { if (!e.target.closest('.menu')) closeMenus(); });
window.addEventListener('scroll', closeMenus, true);
window.addEventListener('resize', closeMenus);
$$('dialog').forEach(d => {
  d.addEventListener('click', e => { if (e.target === d) d.close(); }); // click on backdrop
  $$('[data-close]', d).forEach(b => b.addEventListener('click', () => d.close()));
});

/* ============ Init ============ */
$$('[data-icon]').forEach(el => { el.innerHTML = svg(el.dataset.icon, parseInt(el.dataset.size || '18', 10)); });
$('#themeIcon').innerHTML = svg(currentTheme() === 'dark' ? 'sun' : 'moon', 26);
syncFilterUi();
refresh();

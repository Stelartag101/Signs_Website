// WP Signpack Browser — app.js

const COLOR_SWATCHES = {
  'Black':         '#1a1a1a',
  'White':         '#e8e6df',
  'Blue':          '#2d5fc4',
  'Green':         '#2a7a3a',
  'Bright Green':  '#35c058',
  'Orange':        '#d06020',
  'Bright Orange': '#f07830',
  'Purple':        '#6a3aaa',
  'Bright Purple': '#a050e0',
  'Red':           '#c02828',
  'Yellow':        '#c8a820',
  'Ice':           '#90c8dc',
  'Dark Pink':     '#c03870',
  'Light Pink':    '#e080a8',
  'Dirt':          '#8a6038',
  'Water':         '#1878c8',
  'Sandwood':      '#c8a860',
  'Academy':       '#2a3a5a',
  'Main':          '#484848',
  'Unknown':       '#aaaaaa',
};

const TYPE_LABELS = {
  'Background': 'Background',
  'B_Overlay':  'Black Overlay',
  'W_Overlay':  'White Overlay',
  'Stadium':    'Stadium',
  'Other':      'Other',
};

const RATIO_LABELS = {
  '1x1':   '1 × 1',
  '2x1':   '2 × 1',
  '4x1':   '4 × 1',
  '6x1':   '6 × 1',
  'Flag':  'Flag',
  'Light': 'Light',
  'Pole':  'Pole',
};

function mediaClass(ratio) {
  const map = { '1x1':'r-1x1','2x1':'r-2x1','4x1':'r-4x1','6x1':'r-6x1','Flag':'r-flag','Light':'r-light','Pole':'r-pole' };
  return map[ratio] || 'r-1x1';
}

// ── State ──
let allData = [];
let filters = {
  ratio:  new Set(),
  type:   new Set(),
  member: null,
  color:  new Set(),
  search: '',
};

// ── DOM ──
const grid          = document.getElementById('grid');
const searchInput   = document.getElementById('searchInput');
const visibleCount  = document.getElementById('visibleCount');
const totalCount    = document.getElementById('totalCount');
const showCount     = document.getElementById('showCount');
const activeFiltersEl = document.getElementById('activeFilters');
const clearAllBtn   = document.getElementById('clearAllBtn');

// ── Load ──
fetch('signs_data.json')
  .then(r => r.json())
  .then(data => {
    allData = data;
    totalCount.textContent = data.length;
    buildSidebar();
    buildColorBar();
    render();
  })
  .catch(err => {
    grid.innerHTML = `<div class="empty"><div class="empty-icon">⚠</div><h3>Could not load data</h3><p>${err.message}</p></div>`;
  });

function countBy(field) {
  const c = {};
  allData.forEach(d => { c[d[field]] = (c[d[field]] || 0) + 1; });
  return c;
}

// ── Color Bar ──
function buildColorBar() {
  const wrap = document.getElementById('colorSwatches');
  const counts = countBy('color');
  const sorted = Object.keys(COLOR_SWATCHES).filter(c => counts[c]);

  sorted.forEach(color => {
    const el = document.createElement('div');
    el.className = 'color-swatch';
    el.dataset.color = color;
    el.innerHTML = `
      <span class="swatch-dot" style="background:${COLOR_SWATCHES[color]}"></span>
      <span class="swatch-name">${color}</span>
      <span class="swatch-count">${counts[color]}</span>
    `;
    el.addEventListener('click', () => {
      toggleSet(filters.color, color);
      updateColorBar();
      render();
    });
    wrap.appendChild(el);
  });
}

function updateColorBar() {
  document.querySelectorAll('.color-swatch').forEach(el => {
    el.classList.toggle('active', filters.color.has(el.dataset.color));
  });
}

// ── Sidebar ──
function buildSidebar() {
  const ratioCounts  = countBy('ratio');
  const typeCounts   = countBy('type');

  // Ratio
  const ratioEl = document.getElementById('ratioFilters');
  Object.entries(RATIO_LABELS).forEach(([key, label]) => {
    if (!ratioCounts[key]) return;
    ratioEl.appendChild(makePill(key, label, ratioCounts[key], 'ratio', () => {
      toggleSet(filters.ratio, key); render(); updateSidebar();
    }));
  });

  // Type
  const typeEl = document.getElementById('typeFilters');
  Object.entries(TYPE_LABELS).forEach(([key, label]) => {
    if (!typeCounts[key]) return;
    typeEl.appendChild(makePill(key, label, typeCounts[key], 'type', () => {
      toggleSet(filters.type, key); render(); updateSidebar();
    }));
  });

  // Member
  const memberEl = document.getElementById('memberFilters');
  const memCount    = allData.filter(d => d.isMember).length;
  const nonMemCount = allData.filter(d => !d.isMember).length;
  memberEl.appendChild(makePill('all',  'All',         allData.length, 'member', () => { filters.member = null;  render(); updateSidebar(); }));
  memberEl.appendChild(makePill('yes',  'Members',     memCount,       'member', () => { filters.member = 'yes'; render(); updateSidebar(); }));
  memberEl.appendChild(makePill('no',   'Non-member',  nonMemCount,    'member', () => { filters.member = 'no';  render(); updateSidebar(); }));
}

function makePill(key, label, count, group, onClick) {
  const btn = document.createElement('button');
  btn.className = 'filter-pill';
  btn.dataset.key = key;
  btn.dataset.group = group;
  btn.innerHTML = `<span>${label}</span><span class="pill-count">${count}</span>`;
  btn.addEventListener('click', onClick);
  return btn;
}

function updateSidebar() {
  document.querySelectorAll('[data-group="ratio"]').forEach(btn =>
    btn.classList.toggle('active', filters.ratio.has(btn.dataset.key)));
  document.querySelectorAll('[data-group="type"]').forEach(btn =>
    btn.classList.toggle('active', filters.type.has(btn.dataset.key)));
  document.querySelectorAll('[data-group="member"]').forEach(btn => {
    const k = btn.dataset.key;
    btn.classList.toggle('active',
      (k === 'all' && filters.member === null) ||
      (k === 'yes' && filters.member === 'yes') ||
      (k === 'no'  && filters.member === 'no'));
  });
}

function toggleSet(set, val) {
  set.has(val) ? set.delete(val) : set.add(val);
}

// ── Filter ──
function getFiltered() {
  return allData.filter(item => {
    if (filters.ratio.size  && !filters.ratio.has(item.ratio))   return false;
    if (filters.type.size   && !filters.type.has(item.type))     return false;
    if (filters.member === 'yes' && !item.isMember)              return false;
    if (filters.member === 'no'  &&  item.isMember)              return false;
    if (filters.color.size  && !filters.color.has(item.color))   return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!item.filename.toLowerCase().includes(q) && !item.url.toLowerCase().includes(q)) return false;
    }
    return true;
    }).sort((a, b) => {
      const cpA = a.filename.match(/CP-(\d+)/);
      const cpB = b.filename.match(/CP-(\d+)/);
      if (cpA && cpB) return parseInt(cpA[1]) - parseInt(cpB[1]);
      if (cpA) return -1; // CP signs float to top
      if (cpB) return 1;
      return a.filename.localeCompare(b.filename); // everything else alphabetical
  });
  
}

// ── Render ──
function render() {
  const filtered = getFiltered();
  showCount.textContent   = filtered.length;
  visibleCount.textContent = filtered.length;

  // Active filter tags
  activeFiltersEl.innerHTML = '';
  const addTag = (label, onRemove) => {
    const tag = document.createElement('div');
    tag.className = 'active-tag';
    tag.innerHTML = `${label}<button title="Remove">×</button>`;
    tag.querySelector('button').addEventListener('click', () => { onRemove(); render(); updateSidebar(); updateColorBar(); });
    activeFiltersEl.appendChild(tag);
  };
  filters.ratio.forEach(v  => addTag(RATIO_LABELS[v]  || v, () => filters.ratio.delete(v)));
  filters.type.forEach(v   => addTag(TYPE_LABELS[v]   || v, () => filters.type.delete(v)));
  filters.color.forEach(v  => addTag(v,                      () => filters.color.delete(v)));
  if (filters.member === 'yes') addTag('Members',    () => { filters.member = null; });
  if (filters.member === 'no')  addTag('Non-member', () => { filters.member = null; });

  grid.innerHTML = '';
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty">
      <div class="empty-icon">◇</div>
      <h3>No signs found</h3>
      <p>Try adjusting your filters or search term.</p>
    </div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  filtered.forEach((item, i) => frag.appendChild(createCard(item, i)));
  grid.appendChild(frag);
}

function createCard(item, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.animationDelay = `${Math.min(index * 12, 250)}ms`;

  const isImage = /\.(png|jpg|jpeg)$/i.test(item.url);
  const mClass  = mediaClass(item.ratio);

  const displayName = item.filename
    .replace(/^Waypoint[-_][BW]?_?/, '')
    .replace(/^WP_/, '')
    .replace(/\.(png|jpg|jpeg)$/i, '')
    .replace(/_/g, ' ');

  const mediaSrc = isImage
    ? `<img src="${item.url}" loading="lazy" alt="${displayName}" onerror="this.parentElement.innerHTML='<span class=card-placeholder>◇</span>'" />`
    : `<span class="card-placeholder">⬡</span>`;

  const memberTag = item.isMember ? `<span class="ctag ctag-member">Member</span>` : '';
  const ratioTag  = `<span class="ctag ctag-ratio">${RATIO_LABELS[item.ratio] || item.ratio}</span>`;
  const typeTag   = `<span class="ctag">${TYPE_LABELS[item.type] || item.type}</span>`;

  card.innerHTML = `
    <div class="card-media ${mClass}">${mediaSrc}</div>
    <div class="card-info">
      <div class="card-name" title="${displayName}">${displayName}</div>
      <div class="card-tags">${ratioTag}${typeTag}${memberTag}</div>
    </div>
    <div class="copy-flash" id="flash-${index}">Copied</div>
  `;

  card.addEventListener('click', () => copyUrl(item.url, index));
  return card;
}

// ── Copy ──
function copyUrl(url, index) {
  const done = () => {
    const flash = document.getElementById(`flash-${index}`);
    if (flash) { flash.classList.add('show'); setTimeout(() => flash.classList.remove('show'), 800); }
    showToast(url);
  };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(done).catch(() => fallbackCopy(url, done));
  } else {
    fallbackCopy(url, done);
  }
}
function fallbackCopy(url, cb) {
  const ta = document.createElement('textarea');
  ta.value = url; ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta); ta.select();
  document.execCommand('copy'); document.body.removeChild(ta);
  cb();
}

let toastTimer;
const toast = document.getElementById('toast');
function showToast(url) {
  const short = url.length > 55 ? '…' + url.slice(-48) : url;
  toast.textContent = '✓  ' + short;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// ── Search ──
searchInput.addEventListener('input', () => {
  filters.search = searchInput.value.trim();
  render();
});

// ── Clear ──
clearAllBtn.addEventListener('click', () => {
  filters.ratio.clear(); filters.type.clear();
  filters.color.clear(); filters.member = null; filters.search = '';
  searchInput.value = '';
  updateSidebar(); updateColorBar(); render();
});

// init sidebar active state
setTimeout(() => updateSidebar(), 60);

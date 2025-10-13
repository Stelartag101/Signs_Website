// ===== Password Gate (client-side, SHA-256) =====
const PASS_HASH = "a23720a4dd6a0b35de538b5d25df366113d9da1b196bfffd30dc9fdf46747c90"; // paste the hex from Step 0
const STORAGE_KEY = "signs_browser_unlocked_v1";

async function sha256Hex(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function unlockUI() {
  document.getElementById("gate").style.display = "none";
}

async function handleUnlock() {
  const input = document.getElementById("gate-input");
  const err = document.getElementById("gate-error");
  err.textContent = "";

  const hash = await sha256Hex(input.value || "");
  if (hash === PASS_HASH) {
    unlockUI();
    initApp(); // start your app only after unlock
  } else {
    err.textContent = "Wrong password.";
    const gate = document.getElementById("gate");
    gate.classList.remove("shake");
    void gate.offsetWidth; // restart animation
    gate.classList.add("shake");
    input.select();
  }
}

(function setupGate() {
  // auto-unlock if remembered
  if (localStorage.getItem(STORAGE_KEY) === "1") {
    unlockUI();
    initApp();
    return;
  }
  const btn = document.getElementById("gate-btn");
  const input = document.getElementById("gate-input");
  btn.addEventListener("click", handleUnlock);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") handleUnlock(); });
  input.focus();
})();

// ===== App bootstrap moves into a function =====
async function initApp() {
  // everything that was previously in your IIFE goes here (loadData, populate, listeners, update)
  // ↓↓↓ move your old init code here ↓↓↓

const JSON_URL = "signs.json";

// util: debounce for search input
function debounce(fn, ms = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// read + normalize the JSON (Layer -> Dimension -> Color -> entries[]) into a flat list
async function loadData() {
  const res = await fetch(JSON_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to fetch ${JSON_URL}: ${res.status}`);
  const tree = await res.json();

  const flat = [];
  for (const layer of Object.keys(tree)) {
    const dims = tree[layer];
    for (const dim of Object.keys(dims)) {
      const colors = dims[dim];
      for (const color of Object.keys(colors)) {
        const entries = colors[color] || [];
        for (const e of entries) {
          flat.push({
            layer, dim, color,
            name: e.name || "",
            filename: e.filename || "",
            url: e.url,
            host: e.host || "",
            loc_path: e.loc_path || "",
          });
        }
      }
    }
  }
  return flat;
}

function uniqueSorted(arr) {
  return Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

function populateFilters(data) {
  const layerSel = document.getElementById("filter-layer");
  const dimSel   = document.getElementById("filter-dim");
  const colorSel = document.getElementById("filter-color");

  for (const v of uniqueSorted(data.map(d => d.layer))) {
    const o = document.createElement("option");
    o.value = v; o.textContent = v;
    layerSel.appendChild(o);
  }
  // Sort dims numerically if they look like NxM
  const dims = Array.from(new Set(data.map(d => d.dim)));
  dims.sort((a,b) => {
    const pa = /^(\d+)x(\d+)$/i.exec(a || "") || [];
    const pb = /^(\d+)x(\d+)$/i.exec(b || "") || [];
    if (pa.length && pb.length) {
      const da = (+pa[1])*1000 + (+pa[2]);
      const db = (+pb[1])*1000 + (+pb[2]);
      return da - db;
    }
    return (a||"").localeCompare(b||"", undefined, { sensitivity:"base"});
  });
  for (const v of dims) {
    const o = document.createElement("option");
    o.value = v; o.textContent = v;
    dimSel.appendChild(o);
  }

  for (const v of uniqueSorted(data.map(d => d.color))) {
    const o = document.createElement("option");
    o.value = v; o.textContent = v;
    colorSel.appendChild(o);
  }
}

function render(data, {layer, dim, color, q}) {
  const grid = document.getElementById("grid");
  const count = document.getElementById("count");
  grid.innerHTML = "";

  const qn = (q || "").trim().toLowerCase();

  const filtered = data.filter(d => {
    if (layer && d.layer !== layer) return false;
    if (dim && d.dim !== dim) return false;
    if (color && d.color !== color) return false;
    if (qn) {
      const hay = `${d.name} ${d.filename} ${d.host} ${d.color} ${d.dim} ${d.layer}`.toLowerCase();
      if (!hay.includes(qn)) return false;
    }
    return true;
  });

  count.textContent = `${filtered.length.toLocaleString()} result${filtered.length===1?"":"s"}`;

  if (!filtered.length) {
    const div = document.createElement("div");
    div.className = "empty";
    div.textContent = "No results match your filters.";
    grid.appendChild(div);
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("button");
    card.className = "card";
    card.type = "button";
    card.title = "Click to copy image link";

    const img = document.createElement("img");
    img.className = "thumb";
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = item.filename || item.name || "sign";
    img.src = item.url;

    // if image won't load (CORS/hotlink blocked), show a fallback label
    img.onerror = () => {
      img.replaceWith(Object.assign(document.createElement("div"), {
        className: "thumb",
        textContent: "image not available",
        style: "display:flex;align-items:center;justify-content:center;color:#738; font-size:12px;"
      }));
    };

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `
      <div class="title">${escapeHtml(item.name || item.filename)}</div>
      <div class="sub">${escapeHtml(item.layer)} • ${escapeHtml(item.dim)} • ${escapeHtml(item.color)}</div>
    `;

    card.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(item.url);
        showToast("Copied link");
      } catch (e) {
        // Fallback: open a prompt the user can copy from
        window.prompt("Copy this link:", item.url);
      }
    });

    card.appendChild(img);
    card.appendChild(meta);
    grid.appendChild(card);
  });
}

function escapeHtml(s) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

let toastTimer;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1200);
}

(async function init() {
  const data = await loadData();
  populateFilters(data);

  const state = { layer: "", dim: "", color: "", q: "" };
  const layerSel = document.getElementById("filter-layer");
  const dimSel   = document.getElementById("filter-dim");
  const colorSel = document.getElementById("filter-color");
  const searchIn = document.getElementById("filter-search");

  const update = () => render(data, state);

  layerSel.addEventListener("change", () => { state.layer = layerSel.value; update(); });
  dimSel.addEventListener("change",   () => { state.dim   = dimSel.value;   update(); });
  colorSel.addEventListener("change", () => { state.color = colorSel.value; update(); });
  searchIn.addEventListener("input", debounce(() => { state.q = searchIn.value; update(); }, 150));

  update();
})()};

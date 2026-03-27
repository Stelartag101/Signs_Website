let signData = {};
let currentLayer = "All";
let currentDim = "All"; // New state
let currentColor = "All"; // New state
let searchQuery = "";

const grid = document.getElementById("grid");
const layerList = document.getElementById("layer-list");
const toast = document.getElementById("toast");
const searchInput = document.getElementById("search");
// New selectors
const dimSelect = document.getElementById("filter-dim");
const colorSelect = document.getElementById("filter-color");

async function init() {
  try {
    const response = await fetch('signs.json');
    signData = await response.json();
    
    // Setup Search
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderGrid();
    });

    // Populate and setup Dropdowns
    setupDropdowns();
    dimSelect.addEventListener('change', (e) => {
      currentDim = e.target.value;
      renderGrid();
    });
    colorSelect.addEventListener('change', (e) => {
      currentColor = e.target.value;
      renderGrid();
    });

    renderLayers();
    renderGrid();
  } catch (err) {
    console.error("Failed to load signs.json", err);
  }
}

// Helper to fill dropdowns with unique keys from signs.json
function setupDropdowns() {
  const dims = new Set();
  const colors = new Set();
  
  for (const layer in signData) {
    for (const dim in signData[layer]) {
      dims.add(dim);
      for (const color in signData[layer][dim]) {
        colors.add(color);
      }
    }
  }

  dims.forEach(d => dimSelect.innerHTML += `<option value="${d}">${d}</option>`);
  colors.forEach(c => colorSelect.innerHTML += `<option value="${c}">${c}</option>`);
}

function showToast() {
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 1500);
}

function copy(text) {
  navigator.clipboard.writeText(text);
  showToast();
}

function renderLayers() {
  const layers = ["All", ...Object.keys(signData)];
  layerList.innerHTML = "";

  layers.forEach(layer => {
    const btn = document.createElement("button");
    btn.className = `filter-btn ${currentLayer === layer ? 'active' : ''}`;
    btn.innerHTML = `<span class="btn-label">${layer.toUpperCase()}</span>`;
    
    btn.onclick = () => {
      currentLayer = layer;
      renderLayers();
      renderGrid();
    };
    layerList.appendChild(btn);
  });
}

function renderGrid() {
  grid.innerHTML = "";
  let allItems = [];
  
  for (const layer in signData) {
    if (currentLayer !== "All" && currentLayer !== layer) continue;
    
    for (const dimension in signData[layer]) {
      // Dimension Filter
      if (currentDim !== "All" && dimension !== currentDim) continue;
      
      for (const color in signData[layer][dimension]) {
        // Color Filter
        if (currentColor !== "All" && color !== currentColor) continue;
        
        signData[layer][dimension][color].forEach(item => {
          const matchesSearch = item.name.toLowerCase().includes(searchQuery) || 
                               item.color.toLowerCase().includes(searchQuery);
          if (matchesSearch) {
            allItems.push(item);
          }
        });
      }
    }
  }

  if (allItems.length === 0) {
    grid.innerHTML = `<div class="no-results">NO SIGNS FOUND</div>`;
    return;
  }

  allItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "sign-card";
    card.innerHTML = `
      <div class="card-preview">
        <img src="${item.url}" alt="${item.name}" loading="lazy">
      </div>
      <div class="card-info">
        <span class="card-name">${item.name}</span>
        <div class="card-footer">
          <span class="card-meta">${item.dimension}</span>
          <span class="card-tag">${item.color}</span>
        </div>
      </div>
    `;

    card.onclick = () => copy(item.url);
    grid.appendChild(card);
  });
}

init();

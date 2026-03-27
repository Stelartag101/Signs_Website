:root {
  --bg-deep: #000;
  --bg-panel: #000;
  --bg-card: #000;
  --accent: #ffffff;
  --text-main: #ffff;
  --text-dim: #a5acaf;
  --border: #ffffff;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  background: var(--bg-deep);
  color: var(--text-main);
  overflow: hidden;
}

.app-container {
  display: flex;
  height: 100vh;
}

/* Sidebar - Industrial Style */
.sidebar {
  width: 260px;
  background: var(--bg-panel);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.brand {
  padding: 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-text .title {
  display: block;
  font-weight: 800;
  letter-spacing: 1px;
}

.brand-text .subtitle {
  font-size: 16px;
  color: var(--text-dim);
  font-family: monospace;
}

.brand-logo {
  width: 36px;  /* Adjust size as needed */
  height: 36px; /* Keep it square or let it be auto */
  object-fit: fill;
  /* Optional: adds a subtle glow if your logo is a bright color */
  filter: drop-shadow(0 0 5px var(--accent)); 
}

.nav-section {
  padding: 20px;
}

.nav-section h3 {
  font-size: 12px;
  color: var(--text-dim);
  letter-spacing: 2px;
  margin-bottom: 15px;
}

.filter-btn {
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-dim);
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  margin-bottom: 4px;
  font-size: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.filter-btn:hover {
  background: var(--bg-card);
  color: var(--text-main);
}

.filter-btn.active {
  border-left: 3px solid var(--accent);
  background: rgba(0, 242, 255, 0.05);
  color: var(--accent);
}

/* Content Area */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 50% 50%, #1c1f24 0%, #0a0b0c 100%);
}

.top-bar {
  padding: 15px 30px;
  border-bottom: 1px solid var(--border);
  background: rgba(20, 22, 25, 0.8);
  backdrop-filter: blur(10px);
}

.search-wrapper input {
  background: var(--bg-deep);
  border: 1px solid var(--border);
  color: white;
  padding: 8px 15px;
  width: 300px;
  border-radius: 4px;
}

/* Grid & Cards */

.sign-grid {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  display: grid;
  /* Reduced min-width to better fit smaller screens */
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); 
  gap: 20px;
  align-content: start;
}

.sign-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: visible;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.sign-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.card-preview {
  min-height: 120px; /* Force a height so it doesn't collapse */
  background: #a5acaf;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border);
  position: static;
}

.card-preview img {
  min-width: 100%;
  min-height: 100%;
  object-fit: contain; 
  filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));
}

.card-info {
  padding: 12px;
}

.card-name {
  display: block;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  font-size: 10px;
  color: var(--text-dim);
  font-family: monospace;
}

.card-tag {
  font-size: 10px;
  color: var(--text-dim);
  font-family: monospace;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: var(--accent);
  color: black;
  padding: 12px 24px;
  font-weight: bold;
  font-size: 10px;
  letter-spacing: 1px;
  transform: translateY(100px);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast.visible {
  transform: translateY(0);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-controls {
  display: flex;
  gap: 10px;
}

.filter-controls select {
  background: var(--bg-deep);
  color: var(--text-main);
  border: 1px solid var(--border);
  padding: 8px 12px;
  font-family: monospace;
  font-size: 10px;
  outline: none;
  cursor: pointer;
  border-radius: 2px;
}

.filter-controls select:focus {
  border-color: var(--accent);
}

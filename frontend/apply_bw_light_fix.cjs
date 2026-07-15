const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Remove old PURE BLACK & WHITE block if it exists
const startIndex = css.indexOf('/* ====================================================\n   LIGHT MODE (PURE BLACK & WHITE)');
if (startIndex !== -1) {
  css = css.substring(0, startIndex).trim();
}

const newCSS = `
/* ====================================================
   LIGHT MODE (PURE BLACK & WHITE)
==================================================== */
.light body {
  background-color: #FFFFFF !important;
}

/* 1. Global Background Colors */
.light .bg-\\[\\#070711\\],
.light .bg-\\[\\#0a0a0f\\],
.light .bg-\\[\\#0a0a14\\],
.light .bg-\\[\\#070711\\]\\/80,
.light .bg-\\[\\#0a0a14\\]\\/95,
.light .bg-\\[\\#0a0a14\\]\\/97,
.light .bg-slate-950,
.light .bg-slate-900,
.light .bg-slate-800 {
  background-color: #FFFFFF !important;
}

/* Hide hardcoded dark radial gradients in Light Mode */
.light [style*="rgba(7,7,17"] {
  display: none !important;
  background: none !important;
}

/* 2. Global Cards */
.light .bg-white\\/\\[0\\.02\\],
.light .bg-white\\/\\[0\\.03\\],
.light .bg-white\\/\\[0\\.04\\],
.light .bg-white\\/\\[0\\.05\\],
.light .bg-white\\/\\[0\\.06\\],
.light .bg-white\\/\\[0\\.07\\],
.light .bg-white\\/5,
.light .bg-white\\/10,
.light .glass-card,
.light .glass-card-bright {
  background-color: #FFFFFF !important;
  border-color: #000000 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* Clean up Borders globally */
.light .border-white\\/\\[0\\.06\\],
.light .border-white\\/\\[0\\.07\\],
.light .border-white\\/\\[0\\.08\\],
.light .border-white\\/\\[0\\.05\\],
.light .border-white\\/10,
.light .border-white\\/5,
.light .border-slate-800 {
  border-color: #000000 !important;
}

/* Hover lift for cards */
.light .group:hover > .bg-white\\/\\[0\\.03\\] {
  transform: translateY(-2px);
  box-shadow: 0 4px 0px #000000 !important;
  transition: transform 0.2s;
}

/* 3. Text Colors */
.light .text-white,
.light .text-slate-100,
.light .text-slate-200,
.light .text-slate-300,
.light .text-slate-400,
.light .text-slate-500,
.light .text-zinc-100,
.light .text-zinc-200,
.light .text-zinc-300,
.light .text-zinc-400,
.light .text-zinc-500,
.light .text-zinc-600 {
  color: #000000 !important;
}

/* Preserve Button Text */
.light .btn-primary,
.light .btn-primary * {
  color: #ffffff !important;
}

/* 4. Navbar & Search */
.light .navbar-glass,
.light nav,
.light header {
  background: #FFFFFF !important;
  border-bottom: 2px solid #000000 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.light .input-dark {
  background: #FFFFFF !important;
  border: 1px solid #000000 !important;
  box-shadow: none !important;
  color: #000000 !important;
}
.light .input-dark::placeholder {
  color: #555555 !important;
}
.light .input-dark:focus {
  border-color: #000000 !important;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 1) !important;
}

/* 5. Hero Section Gradients & Global Blurs */
.light .from-\\[\\#0c0c1e\\] {
  --tw-gradient-from: #FFFFFF var(--tw-gradient-from-position) !important;
}
.light .to-\\[\\#090912\\] {
  --tw-gradient-to: #FFFFFF var(--tw-gradient-to-position) !important;
}

/* Remove muddy backgrounds */
.light .bg-indigo-900\\/30,
.light .bg-purple-900\\/15,
.light .bg-indigo-500\\/10,
.light .bg-purple-500\\/10 {
  background: transparent !important;
}
.light .blur-\\[120px\\] {
  display: none !important;
}
.light .mix-blend-overlay,
.light .opacity-\\[0\\.015\\] {
  display: none !important;
}

/* Disable generic backdrop blur */
.light .backdrop-blur-sm,
.light .backdrop-blur-md,
.light .backdrop-blur-lg,
.light .backdrop-blur-2xl {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
`;

css += '\n\n' + newCSS;
fs.writeFileSync('src/index.css', css);
console.log('Fixed B&W theme (Navbar and bg)');

const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const newCSS = `
/* ====================================================
   LIGHT MODE REDESIGN (SaaS Premium)
==================================================== */
.light body {
  background-color: #F6F8FC !important;
}

/* 1. Global Background Colors */
.light .bg-\\[\\#070711\\],
.light .bg-\\[\\#0a0a0f\\],
.light .bg-\\[\\#0a0a14\\],
.light .bg-slate-950,
.light .bg-slate-900,
.light .bg-slate-800 {
  background-color: #F6F8FC !important;
}

/* 2. Global Cards (Convert dark translucents to SOLID White) */
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
  background-color: rgba(255, 255, 255, 0.92) !important;
  border-color: #E5E7EB !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* Clean up Borders globally */
.light .border-white\\/\\[0\\.07\\],
.light .border-white\\/\\[0\\.05\\],
.light .border-white\\/10,
.light .border-white\\/5,
.light .border-slate-800 {
  border-color: #E5E7EB !important;
}

/* Hover lift for cards */
.light .group:hover > .bg-white\\/\\[0\\.03\\] {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12) !important;
  transition: all 0.3s ease;
}

/* 3. Text Colors */
.light .text-white,
.light .text-slate-100,
.light .text-slate-200,
.light .text-zinc-100,
.light .text-zinc-200 {
  color: #111827 !important;
}

.light .text-slate-400,
.light .text-slate-500,
.light .text-zinc-400,
.light .text-zinc-500 {
  color: #6B7280 !important;
}

/* Preserve Button Text */
.light .btn-primary,
.light .btn-primary * {
  color: #ffffff !important;
}

/* 4. Navbar & Search */
.light .navbar-glass {
  background: rgba(255, 255, 255, 0.92) !important;
  border-bottom: 1px solid #E5E7EB !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
}

.light .input-dark {
  background: #FFFFFF !important;
  border: 1px solid #E5E7EB !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
  color: #111827 !important;
}
.light .input-dark::placeholder {
  color: #6B7280 !important;
}
.light .input-dark:focus {
  border-color: #7C3AED !important;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2), 0 4px 15px rgba(0, 0, 0, 0.05) !important;
}

/* 5. Hero Section Gradients & Global Blurs */
.light .from-\\[\\#0c0c1e\\] {
  --tw-gradient-from: #FFFFFF var(--tw-gradient-from-position) !important;
}
.light .to-\\[\\#090912\\] {
  --tw-gradient-to: #FFFFFF var(--tw-gradient-to-position) !important;
}

/* Remove heavy muddy backgrounds and blurs */
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
  opacity: 0.02 !important;
}

/* 6. Fix stat cards specific icon backgrounds */
.light .bg-indigo-500\\/20 {
  background-color: rgba(124, 58, 237, 0.15) !important;
}
.light .text-indigo-400 {
  color: #7C3AED !important;
}

/* Active Sidebar Item */
.light aside .group:has(.bg-gradient-to-r) svg,
.light aside .group:has(.bg-gradient-to-r) span {
  color: #7C3AED !important;
}
.light aside .group:has(.bg-gradient-to-r) .bg-gradient-to-r {
  background: rgba(124, 58, 237, 0.1) !important;
  border-color: rgba(124, 58, 237, 0.2) !important;
}

/* Disable generic backdrop blur on non-navbar elements */
.light .backdrop-blur-sm,
.light .backdrop-blur-md,
.light .backdrop-blur-lg {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* Ensure Navbar keeps its blur */
.light .navbar-glass {
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
}
`;

css += '\n\n' + newCSS;
fs.writeFileSync('src/index.css', css);
console.log('Premium Light Mode Applied!');

const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// Clean up previous hacks
const magicIndex = css.indexOf('/* Magic Light Mode */');
if (magicIndex !== -1) {
  css = css.substring(0, magicIndex).trim();
}
const extendedIndex = css.indexOf('/* EXTENDED LIGHT MODE OVERRIDES */');
if (extendedIndex !== -1) {
  css = css.substring(0, extendedIndex).trim();
}
const advancedIndex = css.indexOf('/* Advanced Light Mode Overrides */');
if (advancedIndex !== -1) {
  css = css.substring(0, advancedIndex).trim();
}

const semanticCSS = `
/* ====================================================
   PREMIUM LIGHT MODE - SEMANTIC TOKENS
==================================================== */

/* 1. Global CSS Variable Overrides for Tailwind v4 */
.light {
  /* Override White: Converts text-white to dark text, and bg-white/10 to dark translucent surfaces */
  --color-white: #111827;
  
  /* Background scale: Converts dark slates to premium light grays */
  --color-slate-950: #F7F8FC;
  --color-slate-900: #F2F4F8;
  --color-slate-800: #E5E7EB;
  --color-slate-700: #D1D5DB;
  --color-slate-600: #9CA3AF;
  
  /* Text scale: Converts muted dark text to readable light mode text */
  --color-zinc-300: #374151;
  --color-zinc-400: #4B5563;
  --color-zinc-500: #6B7280;
  --color-slate-300: #374151;
  --color-slate-400: #4B5563;
  --color-slate-500: #6B7280;
  
  /* Accents */
  --color-indigo-500: #7C3AED;
  --color-indigo-400: #8B5CF6;
  --color-purple-500: #7C3AED;
}

/* 2. Hardcoded Custom Hex Overrides */
/* Backgrounds */
.light body,
.light .bg-\\[\\#070711\\],
.light .bg-\\[\\#0a0a0f\\],
.light .bg-\\[\\#0a0a14\\],
.light .bg-\\[\\#0c0c16\\],
.light .bg-\\[\\#0f0f1a\\],
.light .bg-\\[\\#1e1e1e\\] {
  background-color: #F7F8FC !important;
}

/* 3. Component Specific Premium Overrides */

/* Navbar */
.light .navbar-glass {
  background: rgba(255, 255, 255, 0.82) !important;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #E5E7EB !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

/* Sidebar */
.light aside {
  background-color: #FAFBFD !important;
  border-right: 1px solid #E5E7EB !important;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.02);
}

/* Glass Cards */
.light .glass-card {
  background: rgba(255, 255, 255, 0.75) !important;
  border: 1px solid rgba(17, 24, 39, 0.08) !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 1) !important;
}

.light .glass-card-bright {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(17, 24, 39, 0.1) !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 1) !important;
}

/* Inputs */
.light .input-dark,
.light input,
.light textarea {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid #E5E7EB !important;
  color: #111827 !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
}
.light .input-dark:focus,
.light input:focus {
  border-color: #7C3AED !important;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15), inset 0 2px 4px rgba(0,0,0,0.02) !important;
}
.light .input-dark::placeholder,
.light input::placeholder {
  color: #9CA3AF !important;
}

/* Preserve Primary Buttons (They must stay white text with purple gradient) */
.light .btn-primary {
  color: #ffffff !important;
}
.light .btn-primary * {
  color: #ffffff !important;
}

/* Remove muddy dark gradients in light mode */
.light .bg-indigo-900\\/30,
.light .bg-purple-900\\/15,
.light .bg-indigo-500\\/10,
.light .bg-purple-500\\/10,
.light .from-\\[\\#0c0c1e\\],
.light .to-\\[\\#090912\\] {
  background: transparent !important;
  --tw-gradient-from: transparent !important;
  --tw-gradient-to: transparent !important;
}
`;

css += '\n\n' + semanticCSS;
fs.writeFileSync('src/index.css', css);
console.log('Semantic CSS variables successfully injected.');

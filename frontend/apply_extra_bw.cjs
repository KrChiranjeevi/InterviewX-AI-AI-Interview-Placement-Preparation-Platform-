const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// The black and white theme is already present. We just need to add a few missing overrides to the end.

const extraFixes = `
/* ADDITIONAL BLACK & WHITE FIXES (Search Dropdown & Gradients) */
.light .bg-\\[\\#0c0c16\\]\\/95,
.light .bg-\\[\\#0a0a14\\]\\/95,
.light .bg-\\[\\#0a0a14\\]\\/97 {
  background-color: #FFFFFF !important;
  border-color: #000000 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* Force completely hide ANY absolute inset gradients that are causing gray/black corners in light mode */
.light .absolute.inset-0[style*="radial-gradient"],
.light .absolute.inset-0[style*="linear-gradient"],
.light .absolute[style*="radial-gradient"] {
  display: none !important;
  background: none !important;
}

/* Ensure no text is left white inside dropdowns */
.light .bg-\\[\\#0c0c16\\]\\/95 *,
.light .bg-\\[\\#0a0a14\\]\\/97 * {
  color: #000000 !important;
}
`;

css += '\n' + extraFixes;
fs.writeFileSync('src/index.css', css);
console.log('Extra BW fixes applied');

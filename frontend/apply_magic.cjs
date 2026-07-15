const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
const firstIndex = css.indexOf('/* Advanced Light Mode Overrides */');
if (firstIndex !== -1) {
  css = css.substring(0, firstIndex).trim();
}
const secondIndex = css.indexOf('/* EXTENDED LIGHT MODE OVERRIDES */');
if (secondIndex !== -1) {
  css = css.substring(0, secondIndex).trim();
}

css += '\n\n/* Magic Light Mode */\n';
css += '.light { filter: invert(1) hue-rotate(180deg); }\n';
css += '.light img, .light video, .light [role="img"], .light .emoji { filter: invert(1) hue-rotate(180deg); }\n';

// Force backgrounds to black so they invert to pure white
css += '.light, .light .bg-\\[\\#070711\\], .light .bg-\\[\\#0a0a0f\\], .light .bg-\\[\\#0a0a14\\], .light .bg-\\[\\#0c0c16\\], .light .bg-\\[\\#0f0f1a\\], .light .bg-\\[\\#1e1e1e\\] { background-color: #000000 !important; }\n';
// Force gradients that form backgrounds to black
css += '.light .from-\\[\\#0c0c1e\\] { --tw-gradient-from: #000000 var(--tw-gradient-from-position) !important; }\n';
css += '.light .to-\\[\\#090912\\] { --tw-gradient-to: #000000 var(--tw-gradient-to-position) !important; }\n';

fs.writeFileSync('src/index.css', css);
console.log('Restored and added magic light mode');

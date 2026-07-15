const fs = require('fs');
const css = `
/* Advanced Light Mode Overrides */
.light body, .light .bg-\\[\\#070711\\] {
  background-color: #f1f5f9 !important;
  color: #0f172a !important;
}

/* Backgrounds */
.light .bg-white\\/\\[0\\.02\\],
.light .bg-white\\/\\[0\\.03\\],
.light .bg-white\\/\\[0\\.04\\],
.light .bg-white\\/\\[0\\.05\\],
.light .bg-white\\/\\[0\\.06\\],
.light .bg-white\\/\\[0\\.07\\],
.light .bg-white\\/\\[0\\.08\\],
.light .bg-white\\/\\[0\\.1\\] {
  background-color: rgba(0, 0, 0, 0.04) !important;
}

/* Borders */
.light .border-white\\/\\[0\\.05\\],
.light .border-white\\/\\[0\\.06\\],
.light .border-white\\/\\[0\\.07\\],
.light .border-white\\/\\[0\\.08\\],
.light .border-white\\/\\[0\\.1\\],
.light .border-white\\/10 {
  border-color: rgba(0, 0, 0, 0.08) !important;
}

/* Text */
.light .text-white {
  color: #0f172a !important;
}
.light .text-zinc-200, .light .text-zinc-300 {
  color: #334155 !important;
}
.light .text-zinc-400 {
  color: #475569 !important;
}
.light .text-zinc-500 {
  color: #64748b !important;
}

/* Specific elements */
.light .navbar-glass {
  background: rgba(255, 255, 255, 0.8) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
}
.light .glass-card {
  background: rgba(255, 255, 255, 0.8) !important;
}
`;
fs.appendFileSync('src/index.css', css);
console.log('Appended light mode overrides to index.css');

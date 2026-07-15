const fs = require('fs');

const css = `
/* EXTENDED LIGHT MODE OVERRIDES */

/* Main Backgrounds */
.light .bg-\\[\\#070711\\],
.light .bg-\\[\\#0a0a0f\\],
.light .bg-\\[\\#0a0a14\\],
.light .bg-\\[\\#0c0c16\\],
.light .bg-\\[\\#0f0f1a\\],
.light .bg-\\[\\#1e1e1e\\] {
  background-color: #ffffff !important;
}

/* Translucent Backgrounds */
.light .bg-white\\/5,
.light .bg-white\\/10,
.light .bg-white\\/20,
.light .bg-white\\/\\[0\\.01\\],
.light .bg-white\\/\\[0\\.02\\],
.light .bg-white\\/\\[0\\.03\\],
.light .bg-white\\/\\[0\\.04\\],
.light .bg-white\\/\\[0\\.05\\],
.light .bg-white\\/\\[0\\.06\\],
.light .bg-white\\/\\[0\\.07\\],
.light .bg-white\\/\\[0\\.08\\],
.light .bg-white\\/\\[0\\.09\\],
.light .bg-white\\/\\[0\\.1\\] {
  background-color: rgba(0, 0, 0, 0.05) !important;
}

/* Borders */
.light .border-white\\/5,
.light .border-white\\/10,
.light .border-white\\/20,
.light .border-white\\/\\[0\\.05\\],
.light .border-white\\/\\[0\\.06\\],
.light .border-white\\/\\[0\\.07\\],
.light .border-white\\/\\[0\\.08\\],
.light .border-white\\/\\[0\\.1\\] {
  border-color: rgba(0, 0, 0, 0.1) !important;
}

/* Text colors */
.light .text-zinc-100,
.light .text-zinc-200,
.light .text-zinc-300 {
  color: #1e293b !important;
}

/* Gradients that look bad in light mode */
.light .bg-indigo-500\\/10,
.light .bg-purple-500\\/10 {
  display: none !important;
}

/* Sidebar and Navbar Specifics */
.light aside {
  background-color: #ffffff !important;
}

.light .navbar-glass {
  background-color: rgba(255, 255, 255, 0.9) !important;
}
`;

fs.appendFileSync('src/index.css', css);
console.log('Appended successfully');

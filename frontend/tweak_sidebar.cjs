const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css += `
/* 4. Sidebar Active Item Overrides */
.light aside .group:has(.bg-gradient-to-r) svg,
.light aside .group:has(.bg-gradient-to-r) span {
  color: #7C3AED !important;
}
.light aside .group:has(.bg-gradient-to-r) .bg-gradient-to-r {
  background: rgba(124, 58, 237, 0.1) !important;
  border-color: rgba(124, 58, 237, 0.2) !important;
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.15) !important;
}
`;

fs.writeFileSync('src/index.css', css);
console.log('Added sidebar tweaks');

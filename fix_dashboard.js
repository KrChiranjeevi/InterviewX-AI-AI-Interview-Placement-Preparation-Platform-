const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Use regex to remove sections based on comments
content = content.replace(/\/\* ──+ \*\/\n\s*\/\* QUICK ACTIONS \*\/\n\s*\/\* ──+ \*\/[\s\S]*?(?=\/\* ──+ \*\/\n\s*\/\* PERFORMANCE ANALYTICS \*\/)/, '');
content = content.replace(/\/\* ──+ \*\/\n\s*\/\* PERFORMANCE ANALYTICS \*\/\n\s*\/\* ──+ \*\/[\s\S]*?(?=\/\* ──+ \*\/\n\s*\/\* AI MENTOR \+ AI RECOMMENDATIONS \*\/)/, '');
content = content.replace(/\/\* ──+ \*\/\n\s*\/\* ACHIEVEMENTS \+ DAILY MISSIONS \*\/\n\s*\/\* ──+ \*\/[\s\S]*?(?=\/\* ──+ \*\/\n\s*\/\* COMPANY READINESS \*\/)/, '');
content = content.replace(/\/\* ──+ \*\/\n\s*\/\* COMPANY READINESS \*\/\n\s*\/\* ──+ \*\/[\s\S]*?(?=\/\* ──+ \*\/\n\s*\/\* RECENT ACTIVITY \+ RECENT REPORTS \*\/)/, '');

fs.writeFileSync(filePath, content);
console.log('Successfully simplified Dashboard.jsx');

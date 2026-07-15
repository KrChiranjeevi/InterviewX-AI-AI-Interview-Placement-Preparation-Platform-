const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

function removeSection(startStr, endStr) {
    const startIndex = content.indexOf(startStr);
    if (startIndex === -1) {
        console.log(`Could not find start string: ${startStr.substring(0, 30)}...`);
        return;
    }
    const endIndex = content.indexOf(endStr, startIndex + startStr.length);
    if (endIndex === -1) {
        console.log(`Could not find end string: ${endStr.substring(0, 30)}...`);
        return;
    }
    content = content.substring(0, startIndex) + content.substring(endIndex);
    console.log(`Removed section starting with ${startStr.substring(0, 30)}...`);
}

removeSection('{/* QUICK ACTIONS */}', '{/* PERFORMANCE ANALYTICS */}');
removeSection('{/* PERFORMANCE ANALYTICS */}', '{/* AI MENTOR + AI RECOMMENDATIONS */}');
removeSection('{/* ACHIEVEMENTS + DAILY MISSIONS */}', '{/* COMPANY READINESS */}');
removeSection('{/* COMPANY READINESS */}', '{/* RECENT ACTIVITY + RECENT REPORTS */}');

// Also clean up the spacer comments that are now duplicate
content = content.replace(/\{\/\* ──────────────────────────────────────────────────────────────── \*\/\}\n\s*\{\/\* ──────────────────────────────────────────────────────────────── \*\/\}/g, '{/* ──────────────────────────────────────────────────────────────── */}');

fs.writeFileSync(filePath, content);
console.log('Successfully simplified Dashboard.jsx');

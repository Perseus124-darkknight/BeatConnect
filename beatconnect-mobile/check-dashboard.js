const fs = require('fs');
const content = fs.readFileSync('src/app/(admin)/dashboard.tsx', 'utf8');
console.log("Includes Platform?", content.includes("Platform"));

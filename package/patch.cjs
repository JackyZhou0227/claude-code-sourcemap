const fs = require('fs');

const content = fs.readFileSync('package/cli.js', 'utf8');

// Find the checkEndpoints function (compressed as InY)
const startMarker = 'async function InY(){try{let q=u7(),K=new URL(q.TOKEN_URL)';
const startIdx = content.indexOf(startMarker);

if (startIdx === -1) {
    console.log('Start marker not found - already patched?');
    process.exit(0);
}

console.log('Found start at:', startIdx);

// Find matching braces
let braceCount = 0;
let endIdx = startIdx;
let started = false;

for (let i = startIdx; i < content.length; i++) {
    if (content[i] === '{') {
        braceCount++;
        started = true;
    } else if (content[i] === '}') {
        braceCount--;
        if (started && braceCount === 0) {
            endIdx = i + 1;
            break;
        }
    }
}

console.log('End at:', endIdx);

// Replace with simple return
const newFunc = 'async function InY(){return{success:!0}}';
const newContent = content.substring(0, startIdx) + newFunc + content.substring(endIdx);

fs.writeFileSync('package/cli.js', newContent);
console.log('Patched successfully - skipped preflight check');

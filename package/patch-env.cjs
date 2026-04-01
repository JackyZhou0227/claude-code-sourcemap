const fs = require('fs');

const content = fs.readFileSync('package/cli.js', 'utf8');

let newContent = content;
let count = 0;

// Match: Object.assign(process.env,rS6(j8().env)) 
// or Object.assign(process.env,rS6(v1(K)?.env))
// etc. - handle nested parentheses by matching specific patterns

const patterns = [
  // j8().env - global config
  {
    search: 'Object.assign(process.env,rS6(j8().env))',
    replace: 'Object.assign(process.env,Object.fromEntries(Object.entries(rS6(j8().env)).filter(([k])=>process.env[k]===undefined)))'
  },
  // v1(K)?.env - settings by source
  {
    search: 'Object.assign(process.env,rS6(v1(K)?.env))',
    replace: 'Object.assign(process.env,Object.fromEntries(Object.entries(rS6(v1(K)?.env)).filter(([k])=>process.env[k]===undefined)))'
  },
  // v1("policySettings")?.env
  {
    search: 'Object.assign(process.env,rS6(v1("policySettings")?.env))',
    replace: 'Object.assign(process.env,Object.fromEntries(Object.entries(rS6(v1("policySettings")?.env)).filter(([k])=>process.env[k]===undefined)))'
  },
  // Z7()?.env - deprecated settings
  {
    search: 'Object.assign(process.env,rS6(Z7()?.env))',
    replace: 'Object.assign(process.env,Object.fromEntries(Object.entries(rS6(Z7()?.env)).filter(([k])=>process.env[k]===undefined)))'
  }
];

for (const { search, replace } of patterns) {
  const before = newContent.split(search).length - 1;
  if (before > 0) {
    newContent = newContent.split(search).join(replace);
    count += before;
    console.log(`Patched "${search.substring(0, 50)}..." (${before}x)`);
  }
}

if (count === 0) {
  console.log('No patterns found to patch');
  process.exit(1);
}

fs.writeFileSync('package/cli.js', newContent);
console.log(`\nTotal: ${count} patches - environment variables now take precedence over config file`);

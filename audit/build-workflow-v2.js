// Inline audit/findings/index.json into workflow-v2.template.js -> workflow-v2.js
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const template = fs.readFileSync(path.join(dir, 'workflow-v2.template.js'), 'utf8');
const index = fs.readFileSync(path.join(dir, 'findings', 'index.json'), 'utf8');
if (!template.includes('/*__INDEX__*/')) throw new Error('placeholder missing');
const out = template.replace('/*__INDEX__*/', index);
fs.writeFileSync(path.join(dir, 'workflow-v2.js'), out);
console.log('wrote audit/workflow-v2.js', fs.statSync(path.join(dir, 'workflow-v2.js')).size, 'bytes');

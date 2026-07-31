import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('previews/h1-figma-racing-theme.css', 'utf8');

const targets = [
  ['okr-elite-client-identity', '顶级客户身份体系'],
  ['okr-client-experience-model', '大多数公司大客户体验怎么做的'],
  ['okr-client-experience-cases', '顶尖大客户体验怎么做的'],
  ['okr-elite-client-no1-experience', 'Vantage 顶级客户'],
  ['okr-elite-endorsement-resources', '顶级背书资源'],
  ['okr-elite-ferrari-experience', '法拉利'],
  ['okr-elite-black-label', 'Black Label 礼遇'],
  ['okr-elite-business-enablement', '业务赋能'],
];

if (!html.includes('const ELITE_CLIENT_EDITABLE_COPY')) {
  throw new Error('Missing editable Elite Client copy registry.');
}
if (!html.includes('<OkrEliteClientEditableCopy page={page}/>')) {
  throw new Error('Elite Client pages do not render the editable DOM copy layer.');
}

for (const [pageId, expectedCopy] of targets) {
  if (!html.includes(`'${pageId}'`)) throw new Error(`Missing editable copy entry for ${pageId}.`);
  if (!html.includes(expectedCopy)) throw new Error(`Missing expected editable copy for ${pageId}.`);
}

for (const selector of ['.h1-elite-copy', '.h1-elite-copy-mask', '.h1-elite-no1-pills', '.h1-elite-black-label-pills']) {
  if (!css.includes(selector)) throw new Error(`Missing CSS layout rule ${selector}.`);
}

console.log('H1 Elite Client editable-copy contract passed.');

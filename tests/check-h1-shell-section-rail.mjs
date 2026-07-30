import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const shellPath = path.join(root, 'previews', 'vantage-h1-immersive.html');
const shell = fs.readFileSync(shellPath, 'utf8');

assert.match(
  shell,
  /<button class="report-next"[^>]*\bhidden\b[^>]*\bdata-next-scene\b[^>]*>/,
  'the report footer CTA should remain in markup but be hidden',
);
assert.match(
  shell,
  /\.report-frame-wrap\s*\{[^}]*inset:\s*68px 0 0;/s,
  'the embedded report should use the space released by the hidden footer',
);

const railConfig = shell.match(
  /const REPORT_RAIL_ITEMS = \[(?<items>[\s\S]*?)\n\s*\];/,
)?.groups?.items;
assert.ok(railConfig, 'the shell should declare a semantic report rail configuration');

const expectedItems = [
  ['opening', '开场视频'],
  ['data', '数据'],
  ['okr', 'O1'],
  ['o2', 'O2'],
  ['o3', 'O3'],
  ['ai-products', 'AI Data Products'],
  ['closing', '结束页'],
];

for (const [id, label] of expectedItems) {
  assert.match(
    railConfig,
    new RegExp(`id:'${id}',\\s*label:'${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`),
    `rail should include ${label}`,
  );
}
assert.equal(
  (railConfig.match(/\bid:'/g) ?? []).length,
  expectedItems.length,
  'rail should contain exactly the seven confirmed navigation nodes',
);
assert.doesNotMatch(railConfig, /H1 Review/, 'the second video should not occupy a rail node');

assert.match(
  shell,
  /\.rail button::before\s*\{[^}]*content:\s*attr\(data-label\)/s,
  'rail labels should be sourced from data-label',
);
assert.match(
  shell,
  /\.rail button:is\(:hover,\s*:focus-visible\)::before\s*\{[^}]*opacity:\s*1/s,
  'rail labels should appear on pointer hover and keyboard focus',
);
assert.match(
  shell,
  /dot\.dataset\.label\s*=\s*item\.label/,
  'generated rail buttons should expose their label to CSS',
);

assert.match(
  shell,
  /\{type:'vantage-report-jump',sectionId\}/,
  'rail clicks should send semantic report-section jump messages',
);
assert.match(
  shell,
  /event\.data\?\.type === 'vantage-report-jump'/,
  'the embedded report should accept semantic jump messages',
);
assert.match(
  shell,
  /sectionId:page\?\.closest\('\[data-report-section\]'\)\?\.dataset\.reportSection \|\| ''/,
  'embedded report state should publish the active semantic section',
);
assert.match(
  shell,
  /event\.data\?\.type === 'vantage-report-state'/,
  'the shell should consume embedded report state for rail highlighting',
);

console.log('H1 shell semantic rail checks passed.');

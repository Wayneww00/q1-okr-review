import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const themePath = path.join(root, 'previews', 'h1-figma-racing-theme.css');
const shellPath = path.join(root, 'previews', 'vantage-h1-immersive.html');
const theme = fs.readFileSync(themePath, 'utf8');
const shell = fs.readFileSync(shellPath, 'utf8');

assert.doesNotMatch(
  theme,
  /\.h1-figma-summary-table span\s*\{/,
  'summary value typography must not override editable spans nested inside headings',
);
assert.match(
  theme,
  /\.h1-figma-summary-table > div > span\s*\{[^}]*font:\s*400 14\.42254px\/29\.42px/s,
  'only direct value rows should use the smaller summary-table type size',
);
assert.match(
  theme,
  /\.h1-figma-summary-table b > span\s*\{[^}]*font:\s*inherit/s,
  'editable heading spans should explicitly inherit the surrounding heading typography',
);
assert.match(
  theme,
  /\.h1-figma-summary-table\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*156px\)/s,
  'three-column summaries should provide enough width for Paid Ads labels',
);
assert.match(
  theme,
  /\.h1-figma-summary-table b > span\s*\{[^}]*white-space:\s*nowrap/s,
  'editable summary headings should stay on one line',
);
assert.equal(
  (shell.match(/h1-figma-racing-theme\.css\?v=20260731-summary-type-v2/g) ?? []).length,
  2,
  'both the outer shell and embedded report should request the typography cache-busted theme',
);
assert.match(
  shell,
  /index\.html\?report=h1&embedded=1&v=20260731-summary-type-v2/,
  'the embedded report URL should be cache-busted with the typography release',
);

console.log('H1 summary-table typography checks passed.');

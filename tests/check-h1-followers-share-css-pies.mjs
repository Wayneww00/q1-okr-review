import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = readFileSync(resolve(root, "index.html"), "utf8");
const theme = readFileSync(
  resolve(root, "previews/h1-figma-racing-theme.css"),
  "utf8",
);

const conclusion =
  "Vantage整体排第二，且离第一越来越近了。虽然算上区域号后，咱们的单独占比看起来变小了，但这其实是把“盘子”做大了。接下来我们要把全球号和区域号拧成一股绳，通过协同运营，一起做大整个行业占比。";

assert.ok(
  source.includes(conclusion),
  "the followers-share page must use the approved key conclusion",
);
assert.match(
  source,
  /followerSharePanels\s*:/,
  "the page must provide complete data for the two comparison panels",
);

const page13Start = source.indexOf('id:13, layoutType:"followers_share"');
const page13End = source.indexOf('id:14, layoutType:"followers_trend"', page13Start);
const page13 = source.slice(page13Start, page13End);
const editorRevision = "followers-share-css-ranking-v1";
assert.ok(
  page13.includes('sourceLine:"指标定义：social media 账号的粉丝数量"'),
  "the page header should define the follower metric in the upper-right source-note position",
);
assert.match(
  source,
  /sourceLine && !isBrandCombined && <small data-editor-ignore=\{data\.layoutType === "followers_share" \? "" : undefined\}>\{sourceLine\}<\/small>/,
  "the new fixed metric definition must not be overwritten by a legacy editable-text slot",
);
assert.ok(
  page13.includes(`editorRevision:"${editorRevision}"`),
  "the rebuilt page must isolate its text IDs from the legacy chart's saved Supabase slots",
);
assert.match(
  source,
  /data-editor-revision=\{board\.editorRevision \|\|/,
  "the data-page wrapper must pass the page revision into editable text discovery",
);
const expectedPanels = [
  {
    key: "global",
    nextKey: "expanded",
    total: 10783372,
    sourceShareText: "21.26%",
    rows: [
      ["Exness", 4089190, "4,089,190", 37.9, "37.9%", "exness"],
      ["Vantage Markets", 2291951, "2,291,951", 21.3, "21.3%", "vantage"],
      ["XM", 1579238, "1,579,238", 14.6, "14.6%", "xm"],
      ["Pepperstone", 733430, "733,430", 6.8, "6.8%", "pepperstone"],
      ["Saxo Bank", 371182, "371,182", 3.4, "3.4%", "saxo"],
      ["其他 CFD 经纪商", 1718381, "1,718,381", 15.9, "15.9%", "other"],
    ],
  },
  {
    key: "expanded",
    total: 16420972,
    sourceShareText: "16.16%",
    rows: [
      ["Exness", 5733774, "5,733,774", 34.9, "34.9%", "exness"],
      ["Vantage Markets", 2653508, "2,653,508", 16.2, "16.2%", "vantage"],
      ["XTB", 2415867, "2,415,867", 14.7, "14.7%", "xtb"],
      ["XM", 1670549, "1,670,549", 10.2, "10.2%", "xm"],
      ["Pepperstone", 818685, "818,685", 5.0, "5.0%", "pepperstone"],
      ["其他 CFD 经纪商", 3128589, "3,128,589", 19.1, "19.1%", "other"],
    ],
  },
];

for (const expected of expectedPanels) {
  const start = page13.indexOf(`key:"${expected.key}"`);
  const end = expected.nextKey
    ? page13.indexOf(`key:"${expected.nextKey}"`, start)
    : page13.indexOf("chart:{", start);
  const panel = page13.slice(start, end);
  const rows = [...panel.matchAll(
    /\{brand:"([^"]+)",followers:(\d+),followersText:"([^"]+)",share:([\d.]+),shareText:"([^"]+)",tone:"([^"]+)"\}/g,
  )].map((match) => [
    match[1],
    Number(match[2]),
    match[3],
    Number(match[4]),
    match[5],
    match[6],
  ]);

  assert.deepEqual(rows, expected.rows, `${expected.key} must keep the supplied ranking and mappings`);
  assert.equal(rows.length, 6, `${expected.key} must contain six complete follower entries`);
  assert.equal(
    rows.reduce((sum, row) => sum + row[1], 0),
    expected.total,
    `${expected.key} follower entries must sum to the displayed total`,
  );
  for (const [, followers, followersText, share, shareText] of rows) {
    assert.equal(followers.toLocaleString("en-US"), followersText);
    assert.equal(Number((followers / expected.total * 100).toFixed(1)), share);
    assert.equal(`${share.toFixed(1)}%`, shareText);
  }
  assert.ok(panel.includes(`total:${expected.total}`));
  // These two-decimal figures are source-reported deck values and are intentionally retained verbatim.
  assert.ok(panel.includes(`sourceShareText:"${expected.sourceShareText}"`));
}

for (const requiredText of [
  "仅全球官方账号",
  "全球 + 区域/子账号",
  "数据截至 2026 年 7 月 24 日",
  "Exness",
  "Vantage Markets",
  "XM",
  "Pepperstone",
  "Saxo Bank",
  "XTB",
  "其他 CFD 经纪商",
  "4,089,190",
  "2,291,951",
  "1,579,238",
  "733,430",
  "371,182",
  "1,718,381",
  "5,733,774",
  "2,653,508",
  "2,415,867",
  "1,670,549",
  "818,685",
  "3,128,589",
  "10,783,372",
  "16,420,972",
  "21.26%",
  "16.16%",
]) {
  assert.ok(
    source.includes(requiredText),
    `the CSS chart must retain the supplied content: ${requiredText}`,
  );
}

const component = source.match(
  /function H1FollowersShareChart\(\{data\}\) \{[\s\S]*?\n\}\n\nfunction H1FollowersTrendChart/,
)?.[0];
assert.ok(component, "the followers-share component must remain available");
assert.match(
  component,
  /data\.followerSharePanels/,
  "the component must render the complete comparison-panel data",
);
assert.match(component, /h1-followers-share-grid/);
assert.match(component, /h1-follower-pie/);
assert.match(component, /h1-follower-rank-list/);
assert.match(component, /h1-follower-card-metrics/);
assert.match(component, /segment\.followersText/);
assert.match(component, /panel\.sourceShareText/);
assert.doesNotMatch(
  component,
  /ResponsiveContainer|ComposedChart|<Bar\b|<Line\b/,
  "the comparison must be rendered with HTML and CSS instead of the chart library",
);

assert.match(
  theme,
  /\.h1-followers-share-grid\s*\{[^}]*display:\s*grid/s,
  "the two panels must use a CSS grid layout",
);
assert.match(
  theme,
  /\.h1-follower-pie\s*\{[^}]*background:\s*var\(--follower-pie\)/s,
  "the share visual must be driven by a CSS conic gradient",
);
assert.match(
  source,
  /segments\.reduce\(\(sum,segment\) => sum\+segment\.followers,0\)[\s\S]*conic-gradient\(/,
  "the CSS conic gradient must normalize the underlying follower counts",
);
assert.match(
  theme,
  /--h1-follower-vantage:\s*#ff5b11/,
  "the pie system must reuse the data module's Vantage orange token",
);

console.log("H1 followers-share CSS pie contract passed.");

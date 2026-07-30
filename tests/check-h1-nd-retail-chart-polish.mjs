import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "index.html"), "utf8");
const theme = readFileSync(
  resolve(root, "previews/h1-figma-racing-theme.css"),
  "utf8",
);

assert.match(
  theme,
  /\.is-vietnam-retail-nd \.h1-retail-growth-comparison\s*\{[\s\S]*?min-height:\s*(?:7[2-9]|[89]\d)px[\s\S]*?font-size:\s*(?:1[8-9]|[2-9]\d)px/,
  "the Vietnam comparison strip must be taller with presentation-scale copy",
);
assert.match(
  theme,
  /\.is-vietnam-retail-nd \.h1-retail-growth-axis-tick[\s\S]*?fill:\s*rgba\(255,241,227,\.(?:7[2-9]|[89]\d)\)/,
  "Vietnam axis copy must use a warm high-contrast ivory",
);
assert.match(
  theme,
  /\.is-vietnam-retail-nd \.h1-retail-growth-share-label\.is-saffron\s*\{[^}]*fill:\s*#e7b25b/,
  "Vietnam share labels must use the trophy-gold accent",
);
assert.match(
  app,
  /x="830" y="276" className="h1-retail-growth-share-label is-saffron"/,
  "the Q2 share label must sit clear of the arrow endpoint",
);

assert.match(
  app,
  /className="h1-retail-growth-bar is-mib-user-bar"/,
  "MIB user bars need a dedicated color role",
);
assert.match(
  theme,
  /\.h1-retail-growth-bar\.is-mib-user-bar\s*\{[^}]*fill:\s*var\(--h1-data-secondary\)/,
  "MIB user bars must use signal red",
);
assert.match(
  theme,
  /\.h1-retail-growth-mib-line\s*\{[\s\S]*?stroke:\s*#e7b25b/,
  "the MIB line must use a clearly different trophy-gold color",
);

assert.match(
  app,
  /h1-retail-growth-evidence-frame is-user-types/,
  "the three MIB types referenced by the first insight must be framed",
);
assert.match(
  app,
  /h1-retail-growth-evidence-frame is-delayed-migration/,
  "the 60+ day bar referenced by the second insight must be framed",
);
assert.match(
  theme,
  /\.h1-retail-growth-insights\s*\{[\s\S]*?min-height:\s*(?:12\d|1[3-9]\d|[2-9]\d\d)px[\s\S]*?border:\s*2px solid/,
  "the bottom explanation area must read as one clearly framed block",
);
assert.match(
  theme,
  /\.h1-retail-growth-insights p\s*\{[\s\S]*?font-size:\s*(?:1[7-9]|[2-9]\d)px/,
  "bottom explanation copy must be large enough to read",
);
assert.match(
  theme,
  /\.h1-retail-growth-chart\.is-mib\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\)/,
  "the MIB chart cards must use equal-width columns so their divider stays on the slide centerline",
);
assert.match(
  theme,
  /\.h1-retail-growth-insights\s*\{[^}]*gap:\s*18px/,
  "the insight cards must use the same center gutter as the chart cards",
);

assert.match(
  app,
  /const cumulativeShares=data\.steps\.reduce/,
  "the H2 target chart must derive cumulative levels from the step differences",
);
assert.match(
  app,
  /const isDelta=index>0&&index<data\.steps\.length-1/,
  "the two middle bars must be treated as floating delta bars",
);
assert.match(
  app,
  /className="h1-retail-growth-waterfall-link"/,
  "the reverse waterfall needs visible cumulative connectors",
);
assert.match(
  theme,
  /\.h1-retail-growth-waterfall-link\s*\{[\s\S]*?stroke:\s*#e7b25b/,
  "waterfall connectors must use the black-gold visual language",
);

console.log("H1 ND Retail chart polish contract passed.");

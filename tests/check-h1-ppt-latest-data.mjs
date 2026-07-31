import assert from "node:assert/strict";
import fs from "node:fs";

const report = fs.readFileSync("index.html", "utf8");
const formal = fs.readFileSync("previews/vantage-h1-immersive.html", "utf8");
const h1Start = report.indexOf("const H1_DASHBOARDS = [");
const h1End = report.indexOf("const REPORT_MODE", h1Start);

assert.ok(h1Start >= 0 && h1End > h1Start, "the H1 dashboard data block must exist");

const h1 = report.slice(h1Start, h1End);

const unchangedPptFacts = [
  'absoluteText:"105,743",percentText:"37.8%"',
  'absoluteText:"135,103",percentText:"32.6%"',
  'absoluteText:"$145.4M",percentText:"24.3%"',
  'absoluteText:"$221.6M",percentText:"25.2%"',
  'absoluteText:"3,247.35 Bn",percentText:"23.9%"',
  'absoluteText:"4,540.25 Bn",percentText:"23.1%"',
  'absoluteText:"39,650",percentText:"14.2%"',
  'absoluteText:"55,226",percentText:"13.3%"',
  'absoluteText:"$42.5M",percentText:"7.1%"',
  'absoluteText:"$73.8M",percentText:"8.4%"',
  'absoluteText:"818.42 Bn",percentText:"6.0%"',
  'absoluteText:"1,415.59 Bn",percentText:"7.2%"',
  'absoluteText:"338K",percentText:"",absolute:338000',
  'absoluteText:"414K",percentText:"",absolute:414000',
  'absoluteText:"10,571",percentText:"",absolute:10571',
  'absoluteText:"13,609",percentText:"",absolute:13609',
];

for (const fact of unchangedPptFacts) {
  assert.ok(h1.includes(fact), `PPT fact must remain synchronized: ${fact}`);
}

assert.ok(
  h1.includes('q2025:{label:"2025 H2",absoluteText:"$33.3M",percentText:"",absolute:33.3}'),
  "Paid Ads 2025 H2 profit must use the latest PPT value of $33.3M",
);
assert.ok(
  h1.includes('kpi2:{label:"同比增长",value:"+89.3%",subtext:"2026 H1 vs 2025 H2",isUp:true}'),
  "Paid Ads profit growth must use the latest PPT value of +89.3%",
);
assert.ok(
  h1.includes("Paid Ads H1 利润同比增长 89.3%"),
  "the Paid Ads profit conclusion must match the latest PPT",
);
assert.ok(
  h1.includes('region:"APAC",register:"255,848",ftd:"20,845",nd:"$10.69M",tv:"177.22 Bn",roi:"5.6"'),
  "2025 H2 APAC ROI must use the approved correction of 5.6",
);
assert.ok(
  h1.includes("广告整体 ROI 从 4.6 增长到 6.8"),
  "the regional ROI page must include the latest PPT overall ROI conclusion",
);

assert.ok(!h1.includes('absoluteText:"$37.4M"'), "the superseded $37.4M profit value must be removed");
assert.ok(!h1.includes('value:"+68.4%"'), "the superseded +68.4% profit growth must be removed");

assert.ok(
  formal.includes('src="../index.html?report=h1&embedded=1&v=20260801-awards-q2-label-v1"'),
  "the formal shell must cache-bust the embedded report so the latest PPT data is visible immediately",
);

console.log("H1 latest PPT data contract passed.");

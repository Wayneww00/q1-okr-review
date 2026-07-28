import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const shell = fs.readFileSync(
  path.join(root, "previews/vantage-h1-immersive.html"),
  "utf8"
);

const thresholdMatch = shell.match(/const REPORT_WHEEL_THRESHOLD = (\d+);/);
assert.ok(thresholdMatch, "The touchpad paging threshold must be explicit and testable.");
assert.ok(
  Number(thresholdMatch[1]) <= 12,
  "A deliberate 12px precision-touchpad gesture must be sufficient to turn one page."
);

const idleRearmMatch = shell.match(/const REPORT_WHEEL_IDLE_REARM_MS = (\d+);/);
assert.ok(
  idleRearmMatch,
  "Rapid repeat swipes need a short idle-gap boundary separate from the long momentum window."
);
assert.ok(
  Number(idleRearmMatch[1]) <= 80,
  "A second precision-touchpad swipe after an 80ms finger-lift gap must be accepted."
);

assert.doesNotMatch(
  shell,
  /Math\.abs\(event\.deltaY\)\s*<\s*34/,
  "Trackpad paging must not ignore every small wheel event independently."
);

assert.match(
  shell,
  /let reportWheelDelta = 0;/,
  "Trackpad wheel deltas must be accumulated into one gesture."
);

assert.match(
  shell,
  /if \(!reviewingReport\) return;\s*event\.preventDefault\(\);[\s\S]*?reportWheelDelta \+= event\.deltaY;/,
  "Native scrolling must be prevented before accumulating a unified report-page wheel gesture."
);

assert.match(
  shell,
  /if \(Math\.abs\(reportWheelDelta\) < REPORT_WHEEL_THRESHOLD\) return;/,
  "Small trackpad deltas must trigger paging after their accumulated gesture crosses a threshold."
);

assert.match(
  shell,
  /if \(reportWheelGestureConsumed && !isFreshIntent\) return;[\s\S]*?reportWheelGestureConsumed = true;/,
  "A continuous decaying momentum gesture must produce no more than one page turn."
);

assert.match(
  shell,
  /const queuedReportDirections = \[\];/,
  "Rapid repeat gestures need an ordered queue instead of one overwriteable slot."
);

assert.match(
  shell,
  /if \(reportPaging\) \{\s*queuedReportDirections\.push\(direction\);\s*return;\s*\}/,
  "Every distinct wheel gesture made during an animation must be appended to the queue."
);

assert.match(
  shell,
  /const queuedDirection = queuedReportDirections\.shift\(\) \|\| 0;/,
  "Page settling must consume queued gestures in their original order."
);

assert.match(
  shell,
  /const REPORT_WHEEL_REARM_MS = \d+;/,
  "Rapid repeat gestures need an explicit re-arm window independent of the quiet timer."
);

assert.match(
  shell,
  /let reportWheelLastEventAt = 0;/,
  "The gesture state machine must remember the previous wheel event time."
);

assert.match(
  shell,
  /const eventGap = reportWheelLastEventAt \? now - reportWheelLastEventAt : Infinity;[\s\S]*?const isIdleRestart = reportWheelGestureConsumed[\s\S]*?eventGap >= REPORT_WHEEL_IDLE_REARM_MS;/,
  "A short finger-lift gap must start a new swipe even while the previous page animation is settling."
);

assert.match(
  shell,
  /const isFreshIntent = isIdleRestart \|\| isDirectionRestart \|\| isVelocitySpike;/,
  "Idle-gap, reversal, and velocity-spike detection must all re-arm paging."
);

assert.match(
  shell,
  /const isVelocitySpike = reportWheelGestureConsumed[\s\S]*?magnitude >= reportWheelLastMagnitude \* REPORT_WHEEL_SPIKE_RATIO;/,
  "A new fast swipe must be detected by its velocity spike over the decaying momentum tail."
);

assert.match(
  shell,
  /if \(reportWheelGestureConsumed && !isFreshIntent\) return;[\s\S]*?if \(isFreshIntent\) \{\s*reportWheelGestureConsumed = false;\s*reportWheelDelta = 0;\s*\}/,
  "A detected second swipe must re-arm the wheel gesture instead of being swallowed."
);

assert.match(
  shell,
  /addEventListener\('scrollend', finishReportPage, \{once:true\}\)/,
  "The paging lock must end when smooth scrolling actually ends, with a timeout only as fallback."
);

assert.doesNotMatch(
  shell,
  /reportWheelLocked/,
  "The old fixed wheel lock must not compete with the actual page animation state."
);

console.log("H1 wheel paging stability contract passed.");

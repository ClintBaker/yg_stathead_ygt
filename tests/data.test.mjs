import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
const data = JSON.parse(
  readFileSync(new URL("../data/ygt.json", import.meta.url), "utf8"),
);
const metrics = ["total", "ott", "app", "arg", "putt"];

test("snapshot contains 24 players and the complete three views without duplicates", () => {
  assert.equal(data.length, 56);
  assert.equal(new Set(data.map((r) => r.player)).size, 24);
  assert.equal(new Set(data.map((r) => `${r.player}/${r.period}`)).size, 56);
  for (const [period, count] of [
    ["Season", 16],
    ["Pursell Farms", 20],
    ["Rams Hill", 20],
  ]) {
    assert.equal(data.filter((r) => r.period === period).length, count);
  }
  assert.ok(
    data
      .filter((r) => r.role === "Wildcard")
      .every((r) => r.period !== "Season"),
  );
});
test("SG category totals and tracked shot counts reconcile", () => {
  for (const r of data) {
    assert.ok(
      Math.abs(r.total - (r.ott + r.app + r.arg + r.putt)) < 0.011,
      r.player,
    );
    assert.equal(
      r.shots,
      r.teeShots + r.approachShots + r.aroundGreenShots + r.putts,
      r.player,
    );
    assert.match(r.source, /^https:\/\/www\.ygtour\.com\/players\/[a-z-]+$/);
    for (const key of [...metrics, "shots"]) assert.ok(Number.isFinite(r[key]));
  }
});
test("season values are the sum of the matching stops, with YGT rank preserved", () => {
  const season = data
    .filter((r) => r.period === "Season")
    .sort((a, b) => b.total - a.total);
  season.forEach((r, i) => {
    assert.equal(parseInt(r.rank), i + 1);
    const stops = data.filter(
      (s) => s.player === r.player && s.period !== "Season",
    );
    assert.equal(stops.length, 2);
    for (const key of [...metrics, "shots"])
      assert.ok(
        Math.abs(r[key] - stops.reduce((n, s) => n + s[key], 0)) < 0.011,
        `${r.player}: ${key}`,
      );
  });
});

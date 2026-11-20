"use strict";
/* Unit tests for the investor model core. Run with: npm test */
const test = require("node:test");
const assert = require("node:assert/strict");

const Core = require("../site/investors/assets/core.js");
const PARAMS = require("../site/investors/assets/params.js");
const COUNTRIES = require("../site/investors/assets/countries.js");

const DEFAULTS = Object.fromEntries(Object.entries(PARAMS).map(([k, p]) => [k, p[1]]));
const BY_ISO = Object.fromEntries(COUNTRIES.map((c) => [c.iso, c]));
const BOTH = { annual: true, dispatch: true };
const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);

test("dataset covers 72 countries with complete core fields", () => {
  assert.equal(COUNTRIES.length, 72);
  for (const c of COUNTRIES) {
    assert.match(c.iso, /^[A-Z]{3}$/);
    for (const f of ["pop", "cbr", "le", "road", "mmr", "mob"]) assert.ok(Number.isFinite(c[f]), `${c.iso}.${f}`);
  }
});

test("every input default sits inside its own range", () => {
  for (const [key, [, def, min, max]] of Object.entries(PARAMS)) {
    assert.ok(def >= min && def <= max, `${key}: ${def} not in ${min}..${max}`);
  }
});

test("dispatch centres scale with population and never drop below one", () => {
  const x = { ...DEFAULTS, peoplePerCentre: 4.3 };
  assert.equal(Core.dispatchCentres(BY_ISO.UGA, x), Math.ceil(51.38 / 4.3));
  assert.equal(Core.dispatchCentres(BY_ISO.KIR, x), 1);
});

test("dispatch price is the stated share of the Kenyan tariff", () => {
  near(Core.dispatchPrice({ kes: 129, tariffShare: 50 }), 4500 / 129 / 2);
});

test("contract value: fees switch off independently, setup always applies", () => {
  const ug = BY_ISO.UGA;
  const both = Core.contractValue(ug, DEFAULTS, BOTH);
  const annualOnly = Core.contractValue(ug, DEFAULTS, { annual: true, dispatch: false });
  assert.equal(annualOnly.dispatchFees, 0);
  near(annualOnly.annual, ug.pop * 1e6 * DEFAULTS.feeCapita);
  near(both.setup, annualOnly.setup);
  assert.ok(both.dispatchFees > 0);
});

test("years of life lost: undiscounted equals remaining years, discounting reduces it", () => {
  assert.equal(Core.yearsOfLifeLost(40, 0), 40);
  assert.ok(Core.yearsOfLifeLost(40, 3) < 40);
  assert.equal(Core.yearsOfLifeLost(-5, 3), 0);
});

test("quantile and percentile rank behave at the edges", () => {
  const v = [1, 2, 3, 4, 5];
  assert.equal(Core.quantile(v, 0), 1);
  assert.equal(Core.quantile(v, 1), 5);
  assert.equal(Core.quantile(v, 0.5), 3);
  assert.equal(Core.percentileRank(v, 1), 0);
  assert.equal(Core.percentileRank(v, 5), 1);
});

test("no contracts means no revenue and only central costs", () => {
  const r = Core.runModel(BY_ISO, DEFAULTS, {}, BOTH);
  assert.equal(r.revT, 0);
  near(r.yrs[0].res, -DEFAULTS.opex);
});

test("a contract earns nothing before it signs and reaches full scope after the rollout", () => {
  const x = { ...DEFAULTS, rampYears: 3, workers: 0 };
  const r = Core.runModel(BY_ISO, x, { UGA: 3 }, BOTH);
  assert.equal(r.yrs[1].rev, 0);
  assert.ok(r.yrs[2].rev > 0);
  near(r.yrs[4].served, BY_ISO.UGA.pop * 1e6);
  near(r.yrs[2].served, (BY_ISO.UGA.pop * 1e6) / 3);
});

test("setup fee is invoiced half at signing and half a year later", () => {
  const x = { ...DEFAULTS, workers: 0 };
  const r = Core.runModel(BY_ISO, x, { UGA: 3 }, BOTH);
  const total = Core.dispatchCentres(BY_ISO.UGA, x) * x.feePerCentre;
  near(r.yrs[2].setup, total / 2);
  near(r.yrs[3].setup, total / 2);
  assert.equal(r.yrs[4].setup, 0);
});

test("a lost contract stops earning from the year it is lost", () => {
  const x = { ...DEFAULTS, workers: 0 };
  const r = Core.runModel(BY_ISO, x, { UGA: 2 }, BOTH, { UGA: { sign: 2, lost: 6 } });
  assert.ok(r.yrs[4].gov > 0);
  assert.equal(r.yrs[5].gov, 0);
});

test("higher prices raise revenue; higher costs lower the operating result", () => {
  const plan = { UGA: 2, KEN: 3 };
  const base = Core.runModel(BY_ISO, DEFAULTS, plan, BOTH);
  const pricier = Core.runModel(BY_ISO, { ...DEFAULTS, feeCapita: DEFAULTS.feeCapita * 2 }, plan, BOTH);
  const costlier = Core.runModel(BY_ISO, { ...DEFAULTS, overhead: DEFAULTS.overhead + 10 }, plan, BOTH);
  assert.ok(pricier.yrs[9].rev > base.yrs[9].rev);
  assert.ok(costlier.yrs[9].res < base.yrs[9].res);
});

test("ranking returns every eligible country once, best first, and honours the conflict filter", () => {
  const all = Core.rankCountries(COUNTRIES, DEFAULTS, { excludeConflict: false });
  const filtered = Core.rankCountries(COUNTRIES, DEFAULTS, { excludeConflict: true });
  assert.equal(all.length, 72);
  assert.equal(filtered.length, 72 - Core.CONFLICT.length);
  for (let i = 1; i < filtered.length; i++) assert.ok(filtered[i - 1].score >= filtered[i].score);
  assert.ok(!filtered.some((r) => Core.CONFLICT.includes(r.c.iso)));
});

test("Monte Carlo is reproducible for a given seed and varies across seeds", () => {
  const plan = { UGA: 3, KEN: 5 };
  const a = Core.runMonteCarlo(BY_ISO, DEFAULTS, plan, BOTH, { runs: 200, seed: 7 });
  const b = Core.runMonteCarlo(BY_ISO, DEFAULTS, plan, BOTH, { runs: 200, seed: 7 });
  const c = Core.runMonteCarlo(BY_ISO, DEFAULTS, plan, BOTH, { runs: 200, seed: 8 });
  assert.deepEqual(a.rev, b.rev);
  assert.notDeepEqual(a.rev, c.rev);
  assert.equal(a.rev.length, 200);
});

test("Monte Carlo median sits at or below the on-plan result, because contracts can only slip", () => {
  const plan = { UGA: 3, KEN: 4, TZA: 5 };
  const onPlan = Core.runModel(BY_ISO, DEFAULTS, plan, BOTH).yrs[9].rev;
  const mc = Core.runMonteCarlo(BY_ISO, DEFAULTS, plan, BOTH, { runs: 500, seed: 2026 });
  assert.ok(Core.quantile(mc.rev, 0.5) <= onPlan);
});

test("signing probability of 100% reproduces the plan exactly", () => {
  const plan = { UGA: 3, KEN: 5 };
  const rng = Core.mulberry32(1);
  const { sched, signed } = Core.sampleSchedule(plan, { ...DEFAULTS, pSign: 100, pSignUG: 100, pLoss: 0 }, rng);
  assert.equal(signed, 2);
  assert.deepEqual(sched, { UGA: { sign: 3, lost: Core.NEVER }, KEN: { sign: 5, lost: Core.NEVER } });
});

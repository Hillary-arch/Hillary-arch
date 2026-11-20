/**
 * Sauti investor model: pure calculation core.
 *
 * No DOM access. Loaded as a browser global (window.SautiCore) by the investor
 * page and as a CommonJS module by the tests in tests/core.test.js.
 *
 * Units: populations in millions on country records, money in USD, rates as
 * percentages (25 means 25%) unless a name says otherwise.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SautiCore = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /** Kenya Social Health Authority tariff per ambulance evacuation within 25 km, KES. */
  var KES_TARIFF = 4500;
  /** GiveWell top charities, approximate cost to save a life, USD. */
  var GIVEWELL_COST_PER_LIFE = 5000;
  /** Model horizon in years. */
  var YEARS = 10;
  /** Countries left out by default because operating is impractical today. */
  var CONFLICT = ["AFG", "PRK", "SYR", "YEM", "PSE", "SDN", "SSD", "SOM", "MMR", "HTI", "VEN", "LBN", "CAF"];
  /** Loaded cost of staff relative to gross salary. */
  var STAFF_LOADING = 1.4;
  /** Sentinel for "never within the horizon". */
  var NEVER = 99;

  // ---------------------------------------------------------------- helpers

  /** Seeded pseudo-random generator (mulberry32) so simulations are reproducible. */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Draw from a triangular distribution with minimum a, mode c and maximum b. */
  function triangular(rng, a, c, b) {
    if (b <= a) return c;
    c = Math.min(Math.max(c, a), b);
    var u = rng();
    var f = (c - a) / (b - a);
    return u < f ? a + Math.sqrt(u * (b - a) * (c - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - c));
  }

  /** Linear-interpolated quantile of an array (q between 0 and 1). */
  function quantile(values, q) {
    var s = values.slice().sort(function (x, y) { return x - y; });
    var i = (s.length - 1) * q;
    var lo = Math.floor(i);
    var hi = Math.ceil(i);
    return s[lo] + (s[hi] - s[lo]) * (i - lo);
  }

  /**
   * Percentile rank of v within values, from 0 (lowest) to 1 (highest).
   * v is expected to be one of the values; tied values share the midpoint rank.
   */
  function percentileRank(values, v) {
    var n = values.length;
    if (n < 2) return 0.5;
    var below = 0;
    var equal = 0;
    for (var i = 0; i < n; i++) {
      if (values[i] < v) below++;
      else if (values[i] === v) equal++;
    }
    return Math.min(1, (below + Math.max(0, equal - 1) / 2) / (n - 1));
  }

  /** Discounted years of life lost for a death with L years remaining. */
  function yearsOfLifeLost(remaining, discountPct) {
    var L = Math.max(0, remaining);
    var r = discountPct / 100;
    return r > 0 ? (1 - Math.exp(-r * L)) / r : L;
  }

  // ------------------------------------------------------- country measures

  /** Emergencies per person per year in a country. */
  function emergenciesPerPerson(c, x) {
    return (c.road / 1e5) * (1 + x.injPerDeath) + (c.cbr / 1000) * (x.obsCompl / 100) + x.otherInc / 1000;
  }

  /** Number of dispatch centres a national contract needs. */
  function dispatchCentres(c, x) {
    return Math.max(1, Math.ceil(c.pop / x.peoplePerCentre));
  }

  /** Road and maternal deaths per year. */
  function deathsPerYear(c) {
    var p = c.pop * 1e6;
    return (p * c.road) / 1e5 + (((p * c.cbr) / 1000) * c.mmr) / 1e5;
  }

  /** Government fee per dispatch, USD. */
  function dispatchPrice(x) {
    return ((KES_TARIFF / x.kes) * x.tariffShare) / 100;
  }

  /**
   * Value of one national contract at full scope.
   * @returns {{setup:number, annual:number, dispatchFees:number, dispatches:number}}
   */
  function contractValue(c, x, fees) {
    var pop = c.pop * 1e6;
    var dispatches = (pop * emergenciesPerPerson(c, x) * x.capture) / 100;
    return {
      setup: dispatchCentres(c, x) * x.feePerCentre,
      annual: fees.annual ? pop * x.feeCapita : 0,
      dispatchFees: fees.dispatch ? dispatches * dispatchPrice(x) : 0,
      dispatches: dispatches
    };
  }

  /**
   * Rank countries on weighted percentile scores.
   * Missing GDP or insurance data drops that measure for the country and
   * re-weights the rest.
   */
  function rankCountries(countries, x, opts) {
    var exclude = opts && opts.excludeConflict;
    var pool = countries.filter(function (c) { return !(exclude && CONFLICT.indexOf(c.iso) >= 0); });
    var rate = function (c) { return (deathsPerYear(c) / (c.pop * 1e6)) * 1e5; };
    var need = pool.map(rate);
    var size = pool.map(function (c) { return Math.log(c.pop); });
    var reach = pool.map(function (c) { return Math.min(c.mob, 130); });
    var pay = pool.filter(function (c) { return c.gdp; }).map(function (c) { return Math.log(c.gdp); });
    var ins = pool.filter(function (c) { return c.ins != null; }).map(function (c) { return c.ins; });

    return pool
      .map(function (c) {
        var parts = [
          [x.wNeed, percentileRank(need, rate(c))],
          [x.wSize, percentileRank(size, Math.log(c.pop))],
          [x.wReach, percentileRank(reach, Math.min(c.mob, 130))]
        ];
        if (c.gdp) parts.push([x.wPay, percentileRank(pay, Math.log(c.gdp))]);
        if (c.ins != null) parts.push([x.wIns, percentileRank(ins, c.ins)]);
        var w = parts.reduce(function (a, p) { return a + p[0]; }, 0);
        var s = w ? parts.reduce(function (a, p) { return a + p[0] * p[1]; }, 0) / w : 0;
        return { c: c, score: s * 100 };
      })
      .sort(function (a, b) { return b.score - a.score; });
  }

  // ------------------------------------------------------------ main model

  /**
   * Run the ten-year model.
   * @param {Object} byIso   iso3 -> country record
   * @param {Object} x       inputs (see docs/model.md)
   * @param {Object} plan    iso3 -> planned contract year (1..10)
   * @param {Object} fees    {annual:boolean, dispatch:boolean}
   * @param {Object} [sched] iso3 -> {sign, lost}; defaults to signing on plan
   */
  function runModel(byIso, x, plan, fees, sched) {
    var contracts = Object.keys(plan).map(function (iso) {
      var s = sched ? sched[iso] : { sign: plan[iso], lost: NEVER };
      return { c: byIso[iso], sign: s.sign, lost: s.lost };
    });
    var aiPerCall = (x.gpu * x.audioMin) / x.gpuThroughput;
    var priceD = dispatchPrice(x);
    var varCost = x.responderPay + x.telecom + aiPerCall;
    var firstSigned = contracts.reduce(function (m, o) { return Math.min(m, o.sign); }, NEVER);
    var yrs = [];

    for (var t = 1; t <= YEARS; t++) {
      var Y = { t: t, served: 0, disp: 0, gov: 0, setup: 0, emp: 0, ins: 0, varc: 0, fixC: 0, deaths: 0, dalys: 0, members: 0, active: 0 };

      contracts.forEach(function (o) {
        var c = o.c;
        if (t === o.sign - 1 && o.sign <= YEARS) Y.fixC += x.countryLead * 12; // preparation year
        if (t < o.sign || t >= o.lost) return;
        Y.active++;

        var k = t - o.sign;
        var scope = Math.min(1, (k + 1) / x.rampYears);
        var served = c.pop * 1e6 * scope;
        var nCentres = dispatchCentres(c, x);
        var insuredShare = ((c.ins || 0) / 100) * (x.insUptake / 100);
        var disp = (served * emergenciesPerPerson(c, x) * x.capture) / 100;
        var members = served * insuredShare;
        var insDisp = disp * insuredShare;
        var setupFee = k <= 1 ? nCentres * x.feePerCentre * 0.5 : 0;

        Y.gov += setupFee + (fees.annual ? served * x.feeCapita : 0) + (fees.dispatch ? (disp - insDisp) * priceD : 0);
        Y.ins += members * x.pmpm * 12 + insDisp * x.insIncident;
        Y.served += served;
        Y.disp += disp;
        Y.setup += setupFee;
        Y.members += members;
        Y.varc += disp * varCost + (setupFee * x.setupCost) / 100;
        Y.fixC +=
          Math.ceil(nCentres * scope) * x.staffPerCentre * x.staffSalary * STAFF_LOADING * 12 +
          x.countryLead * 12 +
          (k === 0 ? x.langsPerCountry * x.langCost : 0) +
          (served / 1e5) * x.respPer100k * x.respCost;

        var captured = (served * x.capture) / 100;
        var dT = (captured * (c.road / 1e5) * x.redTrauma) / 100;
        var dM = (captured * (c.cbr / 1000) * (c.mmr / 1e5) * x.redMat) / 100;
        Y.deaths += dT + dM;
        Y.dalys += dT * yearsOfLifeLost(c.le - x.ageTrauma, x.disc) + dM * yearsOfLifeLost(c.le - x.ageMat, x.disc);
      });

      var workers = t >= firstSigned ? x.workers * Math.min(1, (t - firstSigned + 1) / Math.max(1, YEARS - firstSigned + 1)) : 0;
      Y.emp = workers * x.pricePerWorker * 12;
      Y.varc += workers * x.siteCost;
      Y.rev = Y.gov + Y.emp + Y.ins;
      Y.varc += (Y.rev * x.overhead) / 100;
      Y.contrib = Y.rev - Y.varc;
      Y.central = x.opex * Math.pow(1 + x.opexGrowth / 100, t - 1);
      Y.res = Y.contrib - Y.fixC - Y.central;
      yrs.push(Y);
    }

    var sum = function (f) { return yrs.reduce(function (a, y) { return a + y[f]; }, 0); };
    var breakEven = null;
    for (var i = 0; i < YEARS; i++) if (yrs[i].res > 0) { breakEven = i + 1; break; }
    var cum = 0;
    var trough = 0;
    yrs.forEach(function (y) { cum += y.res; trough = Math.min(trough, cum); });

    var exit = yrs[x.exitYear - 1];
    var exitValue = Math.max(0, (exit.rev - exit.setup) * x.multiple);
    var stake = (x.inv / (x.pre + x.inv)) * (1 - x.dilution / 100);
    var proceeds = exitValue * stake;
    var moic = proceeds / x.inv;
    var irr = moic > 0 ? Math.pow(moic, 1 / x.exitYear) - 1 : -1;

    var revT = sum("rev");
    var deaths = sum("deaths");
    var dalys = sum("dalys");
    var popT = 0;
    var gdpT = 0;
    contracts.forEach(function (o) { popT += o.c.pop; gdpT += o.c.pop * (o.c.gdp || 0); });

    return {
      yrs: yrs, be: breakEven, trough: trough, revT: revT, deaths: deaths, dalys: dalys,
      cpd: deaths ? revT / deaths : NaN, cpdaly: dalys ? revT / dalys : NaN, gdpW: popT ? gdpT / popT : 0,
      exitVal: exitValue, stake: stake, proceeds: proceeds, moic: moic, irr: irr,
      aiPerCall: aiPerCall, varCost: varCost, priceD: priceD
    };
  }

  // ------------------------------------------------------------ Monte Carlo

  /** Draw when each planned contract signs and whether it is later lost. */
  function sampleSchedule(plan, x, rng) {
    var sched = {};
    var signed = 0;
    Object.keys(plan).forEach(function (iso) {
      var p = (iso === "UGA" ? x.pSignUG : x.pSign) / 100;
      var y = plan[iso];
      while (y <= YEARS && rng() > p) y++;
      var lost = NEVER;
      if (y <= YEARS) {
        signed++;
        for (var t = y + 1; t <= YEARS; t++) {
          if (rng() < x.pLoss / 100) { lost = t; break; }
        }
      }
      sched[iso] = { sign: y <= YEARS ? y : NEVER, lost: lost };
    });
    return { sched: sched, signed: signed };
  }

  /** Perturb the uncertain inputs for one run. A shared market factor moves demand and prices together. */
  function sampleInputs(S, rng) {
    var x = Object.assign({}, S);
    var market = triangular(rng, 0.6, 1, 1.35);
    x.capture = Math.min(90, S.capture * market);
    x.feeCapita = S.feeCapita * market;
    x.tariffShare = Math.min(100, S.tariffShare * market);
    x.workers = S.workers * triangular(rng, 0.3, 1, 1.4) * market;
    x.insUptake = Math.min(90, S.insUptake * market * triangular(rng, 0.5, 1, 1.3));
    x.responderPay = triangular(rng, S.responderPay * 0.75, S.responderPay, S.responderPay * 1.5);
    x.overhead = triangular(rng, S.overhead * 0.8, S.overhead, Math.min(70, S.overhead * 1.5));
    x.respCost = triangular(rng, S.respCost * 0.7, S.respCost, S.respCost * 1.8);
    x.opex = triangular(rng, S.opex * 0.85, S.opex, S.opex * 1.8);
    x.injPerDeath = triangular(rng, Math.max(2, S.injPerDeath * 0.7), S.injPerDeath, S.injPerDeath * 2);
    x.redTrauma = triangular(rng, 15, S.redTrauma, 34);
    x.redMat = triangular(rng, Math.max(5, S.redMat * 0.5), S.redMat, Math.min(45, S.redMat * 1.3));
    x.multiple = triangular(rng, Math.max(1, S.multiple * 0.5), S.multiple, S.multiple * 2);
    return x;
  }

  /**
   * Run the Monte Carlo simulation.
   * @returns {{rev:number[],res:number[],signed:number[],deaths:number[],cpdaly:number[],moic:number[],be:number[],seed:number,runs:number}}
   */
  function runMonteCarlo(byIso, S, plan, fees, opts) {
    var runs = (opts && opts.runs) || 1000;
    var seed = (opts && opts.seed) || 2026;
    var rng = mulberry32(seed);
    var out = { rev: [], res: [], signed: [], deaths: [], cpdaly: [], moic: [], be: [], seed: seed, runs: runs };
    for (var i = 0; i < runs; i++) {
      var x = sampleInputs(S, rng);
      var draw = sampleSchedule(plan, S, rng);
      var r = runModel(byIso, x, plan, fees, draw.sched);
      out.rev.push(r.yrs[YEARS - 1].rev);
      out.res.push(r.yrs[YEARS - 1].res);
      out.signed.push(draw.signed);
      out.deaths.push(r.deaths);
      out.cpdaly.push(isFinite(r.cpdaly) ? r.cpdaly : 1e9);
      out.moic.push(r.moic);
      out.be.push(r.be || YEARS + 1);
    }
    return out;
  }

  return {
    KES_TARIFF: KES_TARIFF,
    GIVEWELL_COST_PER_LIFE: GIVEWELL_COST_PER_LIFE,
    YEARS: YEARS,
    CONFLICT: CONFLICT,
    NEVER: NEVER,
    STAFF_LOADING: STAFF_LOADING,
    mulberry32: mulberry32,
    triangular: triangular,
    quantile: quantile,
    percentileRank: percentileRank,
    yearsOfLifeLost: yearsOfLifeLost,
    emergenciesPerPerson: emergenciesPerPerson,
    dispatchCentres: dispatchCentres,
    deathsPerYear: deathsPerYear,
    dispatchPrice: dispatchPrice,
    contractValue: contractValue,
    rankCountries: rankCountries,
    runModel: runModel,
    sampleSchedule: sampleSchedule,
    sampleInputs: sampleInputs,
    runMonteCarlo: runMonteCarlo
  };
});

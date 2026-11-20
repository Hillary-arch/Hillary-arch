/**
 * Model inputs: key -> [label, default, min, max, step, kind, unit, note].
 * kind: "d" official data, "m" market price, "a" assumption. See docs/model.md.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SautiParams = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  return {
 rampYears:["Years from signing to full national scope",3,1,8,1,"a","yr","Ghana launched nationally within a year of contract; Nigeria scaled to 34 states in about four."],
 capture:["Share of emergencies reaching the system",25,5,80,1,"a","%","In areas under contract."],
 peoplePerCentre:["People per dispatch centre",4.3,1,10,0.1,"m","M","Uganda plans 12 regional centres for about 51 million people."],
 feePerCentre:["Setup fee per centre",150000,25000,600000,5000,"a","USD","Integration, language models, responder network, training."],
 feeCapita:["Annual service fee per person covered",0.08,0.01,0.5,0.01,"m","USD","Ghana's national drone service: about USD 0.10 per person a year [15]."],
 tariffShare:["Per-dispatch fee, share of Kenya tariff",50,10,100,1,"m","%","Kenya pays KES 4,500 per evacuation [2]; community referrals in Tanzania cost USD 170 [8]."],
 workers:["Employer workers covered by year 10",150000,0,2000000,10000,"a","n","Across all contract countries."],
 pricePerWorker:["Employer price per worker per month",1,0.25,4,0.05,"m","USD","Retail emergency cover in Kenya (Rescue.co) is about USD 2.70 a month."],
 insUptake:["Insured members whose insurer partners with Sauti",20,0,80,1,"a","%","Applied to each country's insured population [4]."],
 pmpm:["Insurer fee per member per month",0.03,0,0.5,0.01,"a","USD","Set close to the government fee per person, since insured members are counted inside the population covered."],
 insIncident:["Insurer fee per verified incident",20,0,60,1,"m","USD","Billed instead of the government fee for insured members."],
 injPerDeath:["Serious road injuries per road death",4,2,20,0.5,"a","×","Uganda Police recorded 3.4 per death in 2025; police counts miss many injuries."],
 obsCompl:["Births with a serious complication",15,5,25,1,"a","%","Planning figure used in emergency obstetric care."],
 otherInc:["Other emergencies per 1,000 people a year",2,0,10,0.5,"a","","Stroke, cardiac, severe infection, burns and others."],
 responderPay:["Responder payment per completed response",8,2,25,0.5,"a","USD","Market rate for a short motorcycle trip plus responder time."],
 telecom:["Telecom per dispatch",0.2,0.05,1,0.05,"a","USD","Toll-free call, alerts and confirmations."],
 gpu:["GPU price per hour",0.71,0.25,2,0.01,"m","USD","NVIDIA L4 on demand, Google Cloud [11]."],
 audioMin:["Audio minutes processed per call",4,1,10,0.5,"a","min",""],
 gpuThroughput:["Audio minutes per GPU-hour",300,60,1200,20,"a","min","Speech recognition, translation and triage on Sauti's own models."],
 setupCost:["Cost of delivering setup, share of setup fee",40,10,90,5,"a","%",""],
 staffPerCentre:["Sauti technical staff per centre",4,0,12,1,"a","n","Government staff answer calls; Sauti staff run the system and quality review."],
 staffSalary:["Technical staff salary per month",600,200,2500,50,"a","USD","Loaded at 1.4×."],
 countryLead:["Country team per month",4000,500,15000,250,"a","USD",""],
 langCost:["Model training per new language",20000,5000,80000,1000,"a","USD","Recordings, annotation and GPU time, paid once."],
 langsPerCountry:["New languages per country",3,1,10,1,"a","n",""],
 respPer100k:["Community responders per 100,000 people covered",50,10,300,5,"a","n",""],
 respCost:["Cost per responder per year",60,10,300,5,"a","USD","Training refreshers, kit, airtime and retention."],
 overhead:["Sales, account management and overhead",30,5,60,1,"a","%","Share of revenue; grows with the number of contracts and customers."],
 siteCost:["Employer cost to serve per worker per year",3,0,10,0.5,"a","USD","On-site responder training and kits."],
 opex:["Central costs in year 1",300000,50000,3000000,10000,"a","USD","Core team, platform, security and compliance."],
 opexGrowth:["Central cost growth per year",25,0,60,1,"a","%",""],
 pSign:["Chance a planned contract signs, per year",35,5,90,5,"a","%","From the planned year on. Anchored on Ghana, Nigeria and m-mama timelines (see Method)."],
 pSignUG:["Same, for Uganda",60,5,95,5,"a","%","Work with the government is already under way."],
 pLoss:["Chance a signed contract is lost, per year",5,0,30,1,"a","%",""],
 redTrauma:["Trauma mortality reduction",25,5,40,1,"d","%","Meta-analysis, 95% CI 15 to 34% [6]."],
 redMat:["Maternal mortality reduction",27,5,40,1,"d","%","m-mama, Sengerema, first year [9]."],
 ageTrauma:["Average age at trauma death",30,15,50,1,"a","yr",""],
 ageMat:["Average age at maternal death",27,18,40,1,"a","yr",""],
 disc:["Discount rate for DALYs",3,0,5,0.5,"a","%",""],
 inv:["Your investment",100000,5000,2000000,5000,"a","USD",""],
 pre:["Pre-money valuation you would accept",4000000,500000,50000000,100000,"a","USD",""],
 dilution:["Dilution from later rounds",50,0,80,1,"a","%",""],
 multiple:["Exit value as a multiple of revenue",3,1,12,0.5,"a","×",""],
 exitYear:["Exit year",10,5,10,1,"a","yr",""],
 kes:["KES per USD",129,100,160,1,"m","","Used to convert the Kenyan tariff."],
 wNeed:["Weight: emergency death rate per 100,000",30,0,100,5,"a","%","High rates mark where response systems are weakest."],
 wSize:["Weight: population",20,0,100,5,"a","%",""],
 wReach:["Weight: mobile subscriptions per 100",15,0,100,5,"a","%",""],
 wPay:["Weight: GDP per capita",20,0,100,5,"a","%",""],
 wIns:["Weight: health insurance coverage",15,0,100,5,"a","%",""]
};
});

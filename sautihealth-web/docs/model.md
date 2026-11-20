# Investor model

How the model on `site/investors/` works. Calculations live in `assets/core.js` (tested in `tests/core.test.js`); inputs and defaults in `assets/params.js`.

## Method

**Contracts.** A country enters in its contract year. Its contract scope grows in equal steps to the whole population over the rollout period. Technical preparation and the country team start one year before signing.

**Government revenue.** Setup = number of dispatch centres × fee per centre, invoiced half at signing and half a year later; centres = population ÷ people per centre, rounded up. Annual service fee = people in scope × fee per person. Per-dispatch fee = dispatches × price, where the price is a share of Kenya's per-evacuation tariff.

**Emergencies.** Per person per year in each country: WHO-estimated road deaths plus serious injuries (deaths × injuries per death), obstetric complications (births × complication share), and other medical emergencies. The capture rate is the share of these that reach the system.

**Employers and insurers.** Employers pay per worker per month. Insured members are people in scope × the country's health insurance coverage × the share whose insurer partners with Sauti; they pay a monthly fee per member, and their emergencies are billed to the insurer per verified incident instead of to government.

**Costs.** Per dispatch: responder payment, telecom and AI inference (GPU price × audio minutes ÷ throughput). Per centre per year: Sauti technical staff. Per country per year: country team and the community responder network (responders per 100,000 people × yearly cost per responder); plus model training for each new language at signing and the cost of delivering setup as a share of the setup fee. Per employer worker: on-site training and kits. Sales, account management and overhead: a share of revenue. Central: core team, platform and compliance, growing each year.

**Impact.** Deaths averted = emergencies captured × (trauma death rate × trauma mortality reduction + maternal death rate × maternal mortality reduction), country by country. DALYs = deaths averted × years of life remaining at the average age of death, discounted.

**Benchmarks.** GiveWell's top charities save a life for about USD 5,000. Under the GDP-per-capita convention, an intervention is very cost-effective below one times GDP per capita per DALY and cost-effective below three times; the chart uses the population-weighted GDP per capita of the selected countries.

**Monte Carlo: where the probabilities come from.** Each run decides, year by year, whether each planned contract is signed (probability per year, starting in the planned year) and whether a signed contract is later lost. The default signing probability is anchored on observed timelines: Ghana went from contract to national launch within a year, Nigeria from a one-territory pilot to 34 states in about four years, and m-mama took about seven years from pilot to national government ownership. A 35% chance per year puts the median delay at about one and a half years, with a long tail of contracts that never sign within the horizon. Each run also draws a shared market factor that moves capture, prices, employer volume and insurer uptake together, plus independent draws for responder pay, responder network cost, overhead, central costs, injury ratio, both mortality reductions and the exit multiple. The table reports the 10th, 50th and 90th percentiles of 1,000 runs. Runs use a seeded generator (seed 2026), so the same inputs always give the same table. These are scenarios built on stated assumptions, not forecasts. The model does not include the risk that the company fails before its first contract, which applies to any early-stage investment.

**Data.** Population 2025, birth rate and life expectancy 2024, GDP per capita (latest), road traffic mortality (WHO estimate, 2019), maternal mortality ratio (2023), mobile subscriptions: World Bank World Development Indicators. Health insurance coverage: Demographic and Health Surveys as analysed by Barasa et al.

## Inputs

| Key | Input | Default | Range | Type | Note |
| --- | --- | --- | --- | --- | --- |
| `rampYears` | Years from signing to full national scope | 3 yr | 1 to 8 | Assumption | Ghana launched nationally within a year of contract; Nigeria scaled to 34 states in about four. |
| `capture` | Share of emergencies reaching the system | 25 % | 5 to 80 | Assumption | In areas under contract. |
| `peoplePerCentre` | People per dispatch centre | 4.3 M | 1 to 10 | Market price | Uganda plans 12 regional centres for about 51 million people. |
| `feePerCentre` | Setup fee per centre | 150000 USD | 25000 to 600000 | Assumption | Integration, language models, responder network, training. |
| `feeCapita` | Annual service fee per person covered | 0.08 USD | 0.01 to 0.5 | Market price | Ghana's national drone service: about USD 0.10 per person a year [15]. |
| `tariffShare` | Per-dispatch fee, share of Kenya tariff | 50 % | 10 to 100 | Market price | Kenya pays KES 4,500 per evacuation [2]; community referrals in Tanzania cost USD 170 [8]. |
| `workers` | Employer workers covered by year 10 | 150000 n | 0 to 2000000 | Assumption | Across all contract countries. |
| `pricePerWorker` | Employer price per worker per month | 1 USD | 0.25 to 4 | Market price | Retail emergency cover in Kenya (Rescue.co) is about USD 2.70 a month. |
| `insUptake` | Insured members whose insurer partners with Sauti | 20 % | 0 to 80 | Assumption | Applied to each country's insured population [4]. |
| `pmpm` | Insurer fee per member per month | 0.03 USD | 0 to 0.5 | Assumption | Set close to the government fee per person, since insured members are counted inside the population covered. |
| `insIncident` | Insurer fee per verified incident | 20 USD | 0 to 60 | Market price | Billed instead of the government fee for insured members. |
| `injPerDeath` | Serious road injuries per road death | 4 × | 2 to 20 | Assumption | Uganda Police recorded 3.4 per death in 2025; police counts miss many injuries. |
| `obsCompl` | Births with a serious complication | 15 % | 5 to 25 | Assumption | Planning figure used in emergency obstetric care. |
| `otherInc` | Other emergencies per 1,000 people a year | 2 | 0 to 10 | Assumption | Stroke, cardiac, severe infection, burns and others. |
| `responderPay` | Responder payment per completed response | 8 USD | 2 to 25 | Assumption | Market rate for a short motorcycle trip plus responder time. |
| `telecom` | Telecom per dispatch | 0.2 USD | 0.05 to 1 | Assumption | Toll-free call, alerts and confirmations. |
| `gpu` | GPU price per hour | 0.71 USD | 0.25 to 2 | Market price | NVIDIA L4 on demand, Google Cloud [11]. |
| `audioMin` | Audio minutes processed per call | 4 min | 1 to 10 | Assumption |  |
| `gpuThroughput` | Audio minutes per GPU-hour | 300 min | 60 to 1200 | Assumption | Speech recognition, translation and triage on Sauti's own models. |
| `setupCost` | Cost of delivering setup, share of setup fee | 40 % | 10 to 90 | Assumption |  |
| `staffPerCentre` | Sauti technical staff per centre | 4 n | 0 to 12 | Assumption | Government staff answer calls; Sauti staff run the system and quality review. |
| `staffSalary` | Technical staff salary per month | 600 USD | 200 to 2500 | Assumption | Loaded at 1.4×. |
| `countryLead` | Country team per month | 4000 USD | 500 to 15000 | Assumption |  |
| `langCost` | Model training per new language | 20000 USD | 5000 to 80000 | Assumption | Recordings, annotation and GPU time, paid once. |
| `langsPerCountry` | New languages per country | 3 n | 1 to 10 | Assumption |  |
| `respPer100k` | Community responders per 100,000 people covered | 50 n | 10 to 300 | Assumption |  |
| `respCost` | Cost per responder per year | 60 USD | 10 to 300 | Assumption | Training refreshers, kit, airtime and retention. |
| `overhead` | Sales, account management and overhead | 30 % | 5 to 60 | Assumption | Share of revenue; grows with the number of contracts and customers. |
| `siteCost` | Employer cost to serve per worker per year | 3 USD | 0 to 10 | Assumption | On-site responder training and kits. |
| `opex` | Central costs in year 1 | 300000 USD | 50000 to 3000000 | Assumption | Core team, platform, security and compliance. |
| `opexGrowth` | Central cost growth per year | 25 % | 0 to 60 | Assumption |  |
| `pSign` | Chance a planned contract signs, per year | 35 % | 5 to 90 | Assumption | From the planned year on. Anchored on Ghana, Nigeria and m-mama timelines (see Method). |
| `pSignUG` | Same, for Uganda | 60 % | 5 to 95 | Assumption | Work with the government is already under way. |
| `pLoss` | Chance a signed contract is lost, per year | 5 % | 0 to 30 | Assumption |  |
| `redTrauma` | Trauma mortality reduction | 25 % | 5 to 40 | Data | Meta-analysis, 95% CI 15 to 34% [6]. |
| `redMat` | Maternal mortality reduction | 27 % | 5 to 40 | Data | m-mama, Sengerema, first year [9]. |
| `ageTrauma` | Average age at trauma death | 30 yr | 15 to 50 | Assumption |  |
| `ageMat` | Average age at maternal death | 27 yr | 18 to 40 | Assumption |  |
| `disc` | Discount rate for DALYs | 3 % | 0 to 5 | Assumption |  |
| `inv` | Your investment | 100000 USD | 5000 to 2000000 | Assumption |  |
| `pre` | Pre-money valuation you would accept | 4000000 USD | 500000 to 50000000 | Assumption |  |
| `dilution` | Dilution from later rounds | 50 % | 0 to 80 | Assumption |  |
| `multiple` | Exit value as a multiple of revenue | 3 × | 1 to 12 | Assumption |  |
| `exitYear` | Exit year | 10 yr | 5 to 10 | Assumption |  |
| `kes` | KES per USD | 129 | 100 to 160 | Market price | Used to convert the Kenyan tariff. |
| `wNeed` | Weight: emergency death rate per 100,000 | 30 % | 0 to 100 | Assumption | High rates mark where response systems are weakest. |
| `wSize` | Weight: population | 20 % | 0 to 100 | Assumption |  |
| `wReach` | Weight: mobile subscriptions per 100 | 15 % | 0 to 100 | Assumption |  |
| `wPay` | Weight: GDP per capita | 20 % | 0 to 100 | Assumption |  |
| `wIns` | Weight: health insurance coverage | 15 % | 0 to 100 | Assumption |  |

## Sources

1. World Bank, World Development Indicators (API, accessed November 2026): SP.POP.TOTL, SP.DYN.CBRT.IN, SP.DYN.LE00.IN, NY.GDP.PCAP.CD, SH.STA.TRAF.P5 (WHO estimate), SH.STA.MMRT (WHO/UN MMEIG), IT.CEL.SETS.P2; country income classification. <https://data.worldbank.org>
2. Social Health Authority, Kenya. Ambulance emergency transfer tariffs, Annexure B3-B, September 2026. <https://www.sha.go.ke/wp-content/uploads/2026/09/ANNEXURE-B3-B-Ambulance-Emergency-Transfer-Tariffs.pdf>
3. Workers Compensation Act, Cap. 225, Laws of Uganda. <https://ira.go.ug/cp/uploads/Workers%20Compensation%20Act%20Cap%20225.pdf>
4. Barasa E, Kazungu J, Nguhiu P, Ravishankar N. Examining the level and inequality in health insurance coverage in 36 sub-Saharan African countries. BMJ Global Health 2021;6:e004712. <https://pmc.ncbi.nlm.nih.gov/articles/PMC8076950/>
6. Henry JA, Reingold AL. Prehospital trauma systems reduce mortality in developing countries: a systematic review and meta-analysis. J Trauma Acute Care Surg 2012;73:261–8. <https://supportsummaries.epistemonikos.org/support-summaries/show/do-pre-hospital-trauma-systems-reduce-mortalitya>
7. Jayaraman S et al. First Things First: effectiveness and scalability of a basic prehospital trauma care program for lay first-responders in Kampala, Uganda. PLoS ONE 2009;4:e6955. <https://ideas.repec.org/a/plo/pone00/0006955.html>
8. Community-based transport system in Shinyanga, Tanzania. PLOS Global Public Health 2023. <https://pmc.ncbi.nlm.nih.gov/articles/PMC10395988/>
9. Touch Foundation. Mobilising Maternal Health: m-mama in Sengerema, Tanzania, 2017. <https://www.telecomtv.com/content/tracker/vodafone-foundations-pioneering-ambulance-taxi-service-reduces-maternal-mortality-rate-by-a-quarter-new-research-reveals-26961>
10. GiveWell, cost to save a life for top charities (April 2024), as compiled by Our World in Data. <https://ourworldindata.org/cost-effectiveness>
11. Google Cloud, NVIDIA L4 on-demand price per GPU-hour (us-central1), as listed November 2026. <https://computeprices.com/providers/google/gpus/l4>
14. Federal Ministry of Health, Nigeria: NEMSAS expansion to 34 states and plans for a digital emergency dispatch platform, July 2026, as reported by Premium Times. <https://www.premiumtimesng.com/health/health-news/894343-fg-expands-emergency-healthcare-system-to-34-states-plans-digital-dispatch-platform.html>
15. Government of Ghana, Public Procurement Authority approval of a USD 12.5 million, four-year contract for nationwide medical drone delivery (December 2018), as reported by Citi Newsroom. <https://citinewsroom.com/2018/12/03/govt-signs-12m-deal-for-nationwide-drone-delivery-of-medical-supplies/>
16. 108 emergency service, India: government-funded setup, operations contracted to private operators; infrastructure under USD 0.50 per person served. ; Andhra Pradesh 108 request for proposals. <https://en.wikipedia.org/wiki/108_(emergency_telephone_number)> · <https://cfw.ap.nic.in/pdf/108%20RFP-%20final%20version.pdf>
17. Vodafone Foundation. m-mama expands nationally in Tanzania, April 2022. <https://foundation.vodafone.com/news/vodafone-foundation/m-mama-expands-nationally-in-tanzania>

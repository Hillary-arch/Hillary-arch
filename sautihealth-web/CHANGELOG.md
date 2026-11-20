# Changelog

## 1.1.0 (2026-11-20)
- Split the investor page script into a pure calculation core (`core.js`), inputs (`params.js`), data and page code (`app.js`).
- Monte Carlo is seeded and reproducible; results are flagged when inputs change after a run.
- Fixed percentile rank exceeding 1 for the top country in a measure.
- Added unit tests, ESLint and a GitHub Actions workflow.

## 1.0.0 (2026-11-20)
- Investor memo rebuilt around national government contracts: setup fee per dispatch centre, annual fee per person covered, fee per verified dispatch.
- Ten-year model runs contract by contract; Monte Carlo now samples contract signing delays, lost contracts and correlated market conditions.
- Country ranking across 72 low and lower-middle income countries from World Bank and WHO data.
- Costs extended with community responder network, technical staff per centre and overhead.

## 0.1.0 (2026-11-19)
- First interactive investor page and homepage design demo.
